"""
models_inference.py

Student-grade multimodal deepfake inference pipeline.
Loads FaceMesh + rPPG + Fusion artifacts and returns a unified prediction payload.

Owner: Team Lead (Ayush)
Version: 1.0.0

Team handoff notes:
- this module expects exported artifacts from the fusion training notebook
- architecture classes must be importable in this runtime (or passed via factories)
- keep response payload shape aligned with backend API contract

Team review checklist:
- verify model_config.json file names match exported artifact names
- verify scaler feature order is unchanged from notebook training code
- verify verdict threshold values match active backend policy
"""

from __future__ import annotations

import json
import pickle
from pathlib import Path
from typing import Any, Callable, Dict, Optional

import numpy as np
import torch

try:
    # Optional direct imports if architecture classes are available in this runtime.
    from video_models import FaceMeshVideoModel, FusionHead, RPPGVideoClassifier  # type: ignore
except ImportError:
    FaceMeshVideoModel = None  # type: ignore
    FusionHead = None  # type: ignore
    RPPGVideoClassifier = None  # type: ignore


def _checkpoint_state(checkpoint: Any) -> Dict[str, Any]:
    if isinstance(checkpoint, dict):
        if "model_state" in checkpoint and isinstance(checkpoint["model_state"], dict):
            return checkpoint["model_state"]
        if "state_dict" in checkpoint and isinstance(checkpoint["state_dict"], dict):
            return checkpoint["state_dict"]
    if isinstance(checkpoint, dict):
        return checkpoint
    raise ValueError("Unsupported checkpoint format. Expected dict-like checkpoint.")


def _repair_frame_sequence(frame_sequence: Any, seq_len: int = 32, feat_dim: int = 7) -> Optional[np.ndarray]:
    if frame_sequence is None:
        return None

    arr = np.asarray(frame_sequence, dtype=np.float32)
    if arr.ndim != 2:
        return None

    if arr.shape[0] == 0:
        return None

    if arr.shape[1] < feat_dim:
        pad = np.zeros((arr.shape[0], feat_dim - arr.shape[1]), dtype=np.float32)
        arr = np.concatenate([arr, pad], axis=1)
    elif arr.shape[1] > feat_dim:
        arr = arr[:, :feat_dim]

    arr = np.nan_to_num(arr, nan=0.0, posinf=0.0, neginf=0.0)

    if arr.shape[0] >= seq_len:
        arr = arr[:seq_len]
    else:
        pad = np.zeros((seq_len - arr.shape[0], feat_dim), dtype=np.float32)
        arr = np.concatenate([arr, pad], axis=0)

    return arr.astype(np.float32)


def _clamp01(value: float) -> float:
    if not np.isfinite(value):
        return 0.0
    return float(max(0.0, min(1.0, value)))


class DeepfakeDetectionPipeline:
    """Student-grade deepfake detection pipeline for JSON feature samples."""

    def __init__(
        self,
        model_dir: str,
        device: str = "cpu",
        facemesh_factory: Optional[Callable[[], torch.nn.Module]] = None,
        rppg_factory: Optional[Callable[[], torch.nn.Module]] = None,
        fusion_factory: Optional[Callable[[], torch.nn.Module]] = None,
    ):
        self.model_dir = Path(model_dir)
        self.device = torch.device(device)

        self._facemesh_factory = facemesh_factory
        self._rppg_factory = rppg_factory
        self._fusion_factory = fusion_factory

        self.config = self._load_config()
        self.thresholds = self.config.get("inference_thresholds", {})

        self.geo_scaler = None
        self.rppg_scaler = None

        self.geo_model = None
        self.rppg_model = None
        self.fusion_model = None

        self._load_scalers()
        self._load_models()

    def _load_config(self) -> Dict[str, Any]:
        config_path = self.model_dir / "model_config.json"
        if not config_path.exists():
            raise FileNotFoundError(f"Missing configuration file: {config_path}")

        with config_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _resolve_artifact(self, filename: str) -> Path:
        artifact_path = self.model_dir / filename
        if not artifact_path.exists():
            raise FileNotFoundError(f"Artifact not found: {artifact_path}")
        return artifact_path

    def _load_scalers(self) -> None:
        scalers = self.config.get("scalers", {})
        geo_scaler_name = scalers.get("facemesh_scaler")
        rppg_scaler_name = scalers.get("rppg_scaler")

        if not geo_scaler_name or not rppg_scaler_name:
            raise ValueError("Config must define scalers.facemesh_scaler and scalers.rppg_scaler.")

        with self._resolve_artifact(geo_scaler_name).open("rb") as f:
            self.geo_scaler = pickle.load(f)

        with self._resolve_artifact(rppg_scaler_name).open("rb") as f:
            self.rppg_scaler = pickle.load(f)

    def _default_facemesh_model(self) -> torch.nn.Module:
        if self._facemesh_factory is not None:
            return self._facemesh_factory()
        if FaceMeshVideoModel is None:
            raise ImportError(
                "FaceMeshVideoModel is unavailable. Provide facemesh_factory or add class import path."
            )
        return FaceMeshVideoModel(
            input_size=7,
            hidden=64,
            n_layers=2,
            dropout=0.4,
            fusion_mode="weighted",
        )

    def _default_rppg_model(self) -> torch.nn.Module:
        if self._rppg_factory is not None:
            return self._rppg_factory()
        if RPPGVideoClassifier is None:
            raise ImportError(
                "RPPGVideoClassifier is unavailable. Provide rppg_factory or add class import path."
            )
        return RPPGVideoClassifier(
            stat_dim=27,
            n_rois=3,
            trace_len=32,
            dropout=0.4,
        )

    def _default_fusion_model(self) -> torch.nn.Module:
        if self._fusion_factory is not None:
            return self._fusion_factory()
        if FusionHead is None:
            raise ImportError("FusionHead is unavailable. Provide fusion_factory or add class import path.")
        return FusionHead(embed_dim=256, dropout=0.4)

    def _load_models(self) -> None:
        models = self.config.get("models", {})
        facemesh_file = models.get("facemesh", {}).get("file")
        rppg_file = models.get("rppg", {}).get("file")
        fusion_file = models.get("fusion", {}).get("file")

        if not facemesh_file or not rppg_file or not fusion_file:
            raise ValueError("Config must define models.facemesh.file, models.rppg.file, and models.fusion.file.")

        facemesh_ckpt = torch.load(self._resolve_artifact(facemesh_file), map_location=self.device, weights_only=False)
        rppg_ckpt = torch.load(self._resolve_artifact(rppg_file), map_location=self.device, weights_only=False)
        fusion_ckpt = torch.load(self._resolve_artifact(fusion_file), map_location=self.device, weights_only=False)

        self.geo_model = self._default_facemesh_model().to(self.device)
        self.rppg_model = self._default_rppg_model().to(self.device)
        self.fusion_model = self._default_fusion_model().to(self.device)

        self.geo_model.load_state_dict(_checkpoint_state(facemesh_ckpt))
        self.rppg_model.load_state_dict(_checkpoint_state(rppg_ckpt))
        self.fusion_model.load_state_dict(_checkpoint_state(fusion_ckpt))

        self.geo_model.eval()
        self.rppg_model.eval()
        self.fusion_model.eval()

        for model in (self.geo_model, self.rppg_model, self.fusion_model):
            for p in model.parameters():
                p.requires_grad = False

    def _empty_result(self, error: Optional[str]) -> Dict[str, Any]:
        return {
            "error": error,
            "facemesh_score": None,
            "facemesh_confidence": None,
            "rppg_score": None,
            "rppg_confidence": None,
            "fusion_score": None,
            "fusion_confidence": None,
            "verdict": "inconclusive",
            "diagnostics": {
                "anomaly_score": 0.0,
                "signal_quality": 0.0,
                "spatial_coherence": 0.0,
                "is_biological": False,
            },
        }

    def _confidence(self, score: float, base: float, scale: float) -> float:
        return _clamp01(base + abs(score - 0.5) * scale)

    def _verdict(self, score: float, confidence: float, is_biological: bool) -> str:
        fake_threshold = float(self.thresholds.get("fake_threshold", 0.52))
        real_threshold = float(self.thresholds.get("real_threshold", 0.48))
        min_conf = float(self.thresholds.get("min_confidence", 0.35))
        tiebreaker_conf = float(self.thresholds.get("tiebreaker_confidence", 0.50))

        if confidence < min_conf:
            return "inconclusive"
        if score >= fake_threshold:
            return "fake"
        if score <= real_threshold:
            return "real"
        if confidence >= tiebreaker_conf:
            return "real" if is_biological else "fake"
        return "inconclusive"

    def predict(self, json_sample: Dict[str, Any]) -> Dict[str, Any]:
        try:
            facemesh_data = json_sample["facemesh"]
            frame_sequence = _repair_frame_sequence(facemesh_data.get("frame_sequence"))
            if frame_sequence is None:
                return self._empty_result("No valid face detected in FaceMesh")

            geo_windows = np.array([frame_sequence, frame_sequence, frame_sequence], dtype=np.float32)
            geo_norm = self.geo_scaler.transform(geo_windows.reshape(-1, 7)).reshape(3, 32, 7).astype(np.float32)
            geo_tensor = torch.from_numpy(geo_norm).unsqueeze(0).to(self.device)

            with torch.no_grad():
                geo_logits = self.geo_model(geo_tensor)
            geo_score = float(torch.sigmoid(geo_logits).cpu().numpy().ravel()[0])
            geo_confidence = self._confidence(geo_score, base=0.5, scale=0.7)

            rppg_data = json_sample["rppg"]
            features = rppg_data.get("features", {})
            filtered_trace = rppg_data.get("filtered_trace", {})

            combined_stats = [
                features.get("combined_dominant_bpm", 0.0),
                features.get("combined_band_energy", 0.0),
                features.get("combined_out_band_energy", 0.0),
                features.get("combined_snr", 0.0),
                features.get("combined_signal_energy", 0.0),
                features.get("roi_coherence", 0.0),
            ]

            roi_stats = []
            for roi in ("forehead", "left_cheek", "right_cheek"):
                roi_data = features.get(roi, {})
                roi_stats.extend(
                    [
                        roi_data.get("dominant_bpm", 0.0),
                        roi_data.get("band_energy", 0.0),
                        roi_data.get("out_band_energy", 0.0),
                        roi_data.get("snr", 0.0),
                        roi_data.get("signal_energy", 0.0),
                        roi_data.get("trace_mean", 0.0),
                        roi_data.get("trace_std", 0.0),
                    ]
                )

            stat_vec = np.array(combined_stats + roi_stats, dtype=np.float32)
            stat_norm = self.rppg_scaler.transform(stat_vec.reshape(1, -1)).ravel().astype(np.float32)

            traces = []
            for roi in ("forehead", "left_cheek", "right_cheek"):
                sig = np.array(filtered_trace.get(roi, []), dtype=np.float32)
                if len(sig) == 0:
                    sig = np.zeros(32, dtype=np.float32)
                elif len(sig) > 32:
                    sig = sig[:32]
                elif len(sig) < 32:
                    sig = np.pad(sig, (0, 32 - len(sig)))
                traces.append(sig)

            trace_arr = np.stack(traces, axis=0)
            stat_tensor = torch.from_numpy(stat_norm).unsqueeze(0).to(self.device)
            trace_tensor = torch.from_numpy(trace_arr).unsqueeze(0).to(self.device)

            with torch.no_grad():
                rppg_logits = self.rppg_model(stat_tensor, trace_tensor)
            rppg_score = float(torch.sigmoid(rppg_logits).cpu().numpy().ravel()[0])
            rppg_confidence = self._confidence(rppg_score, base=0.5, scale=0.7)

            with torch.no_grad():
                geo_emb = self.geo_model.embed(geo_tensor)
                rppg_emb = self.rppg_model.embed(stat_tensor, trace_tensor)
                combined_emb = torch.cat([geo_emb, rppg_emb], dim=1)
                fusion_logits = self.fusion_model(combined_emb, geo_logits, rppg_logits)

            fusion_score = float(torch.sigmoid(fusion_logits).cpu().numpy().ravel()[0])
            fusion_confidence = self._confidence(fusion_score, base=0.58, scale=0.85)

            is_biological = bool(features.get("is_biological", False))
            verdict = self._verdict(fusion_score, fusion_confidence, is_biological)

            return {
                "error": None,
                "facemesh_score": _clamp01(geo_score),
                "facemesh_confidence": geo_confidence,
                "rppg_score": _clamp01(rppg_score),
                "rppg_confidence": rppg_confidence,
                "fusion_score": _clamp01(fusion_score),
                "fusion_confidence": fusion_confidence,
                "verdict": verdict,
                "diagnostics": {
                    "anomaly_score": float(features.get("combined_dominant_bpm", 0.0) or 0.0),
                    "signal_quality": float(features.get("combined_band_energy", 0.0) or 0.0),
                    "spatial_coherence": float(features.get("roi_coherence", 0.0) or 0.0),
                    "is_biological": is_biological,
                },
            }

        except Exception as exc:
            return self._empty_result(str(exc))


def create_inference_pipeline(model_dir: str, device: str = "cpu", **kwargs: Any) -> Callable[[Dict[str, Any]], Dict[str, Any]]:
    """Factory helper that returns a callable inference function."""
    pipeline = DeepfakeDetectionPipeline(model_dir=model_dir, device=device, **kwargs)
    return pipeline.predict
