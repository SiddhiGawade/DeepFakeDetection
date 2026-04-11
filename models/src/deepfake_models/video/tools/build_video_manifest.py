import argparse
import json
import logging
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional

try:
    import cv2
except ImportError:
    raise ImportError("opencv-python is required to build the manifest. Run: pip install opencv-python")

from . import paths
from . import utils

logger = utils.setup_logger(__name__)

def assign_split(video_id: str) -> str:
    """Deterministically assigns a split (train/val/test) based on the video_id hash.
    Roughly 80/10/10 distribution.
    """
    h = int(hashlib.md5(video_id.encode('utf-8')).hexdigest(), 16)
    mod = h % 100
    if mod < 80:
        return "train"
    elif mod < 90:
        return "val"
    else:
        return "test"

def parse_ffpp_path(file_path: Path, root_path: Path, repo_root: Path) -> Dict[str, Any]:
    """Parses FaceForensics++ directory structure to extract record metadata."""
    relative_to_root = file_path.relative_to(root_path)
    parts = relative_to_root.parts
    
    # Expected structures:
    # original_sequences/youtube/c23/videos/000.mp4
    # manipulated_sequences/Deepfakes/c23/videos/000_003.mp4
    if parts[0] == "original_sequences":
        label = "REAL"
        manipulation_type = "original"
        compression = parts[2] if len(parts) > 2 else "unknown"
    elif parts[0] == "manipulated_sequences":
        label = "FAKE"
        manipulation_type = parts[1]
        compression = parts[2] if len(parts) > 2 else "unknown"
    else:
        label = "UNKNOWN"
        manipulation_type = "unknown"
        compression = "unknown"
        
    video_id = file_path.stem
    
    # Store path relative to the REPOSITORY ROOT so it is portable across machines
    portable_path = file_path.relative_to(repo_root).as_posix()
        
    return {
        "video_id": video_id,
        "dataset": "FaceForensics++",
        "path": portable_path,
        "label": label,
        "manipulation_type": manipulation_type,
        "split": assign_split(video_id),
        "compression_level": compression
    }

def extract_metadata(file_path: Path) -> Optional[Dict[str, Any]]:
    """Extracts media metadata using OpenCV. Returns None if the file is corrupted."""
    try:
        size_bytes = file_path.stat().st_size
        if size_bytes == 0:
            logger.warning(f"Skipping empty file: {file_path.name}")
            return None
            
        cap = cv2.VideoCapture(str(file_path))
        if not cap.isOpened():
            logger.warning(f"Cannot open video (corrupted/unsupported): {file_path.name}")
            return None
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Decode FOURCC codec
        codec_float = cap.get(cv2.CAP_PROP_FOURCC)
        try:
            codec = "".join([chr((int(codec_float) >> 8 * i) & 0xFF) for i in range(4)]).strip()
        except Exception:
            codec = "unknown"
            
        duration_sec = (frame_count / fps) if fps and fps > 0 else 0.0
        cap.release()
        
        # Basic integrity validation
        if frame_count <= 0 or width <= 0 or height <= 0:
            logger.warning(f"Invalid video properties for {file_path.name} (Frames: {frame_count}, W: {width})")
            return None
            
        return {
            "size_bytes": size_bytes,
            "fps": float(fps),
            "duration_sec": float(duration_sec),
            "width": width,
            "height": height,
            "codec": codec if codec else "unknown"
        }
    except Exception as e:
        logger.error(f"Failed to read metadata for {file_path.name}: {e}")
        return None

def build_entry(file_path: Path, dataset_root: Path, repo_root: Path) -> Optional[Dict[str, Any]]:
    """Builds a single structured manifest entry."""
    base_info = parse_ffpp_path(file_path, dataset_root, repo_root)
    file_metadata = extract_metadata(file_path)
    
    if not file_metadata:
        return None  # Skip if extraction failed (corrupted video)
        
    compression = base_info.pop("compression_level")
    
    entry = {
        "video_id": base_info["video_id"],
        "dataset": base_info["dataset"],
        "path": base_info["path"],
        "label": base_info["label"],
        "manipulation_type": base_info["manipulation_type"],
        "split": base_info["split"],
        "file": file_metadata,
        "quality": {
            "face_visible_ratio": None,
            "blur_score": None,
            "brightness_variation": None,
            "compression_level": compression,
            "pose_variation": None,
            "occlusion_ratio": None,
            "frame_drop_ratio": None
        },
        "signals": {
            "rppg_quality": None,
            "rppg_coherence": None,
            "bpm_estimate": None,
            "landmark_jitter": None,
            "blink_rate": None,
            "lip_motion_score": None,
            "head_pose_variance": None
        }
    }
    return entry

def scan_dataset(root_dir: Path, output_file: Path, repo_root: Path):
    """Scans the dataset directory and writes viable entries to the JSONL manifest."""
    paths.ensure_directory(output_file.parent)
    
    videos = list(root_dir.rglob("*.mp4"))
    if not videos:
        logger.warning(f"No .mp4 files found in {root_dir}")
        return

    logger.info(f"Found {len(videos)} videos. Building structured manifest...")
    
    valid_count = 0
    with open(output_file, 'w', encoding='utf-8') as f:
        for i, video_path in enumerate(videos):
            if i > 0 and i % 100 == 0:
                logger.info(f"Processed {i}/{len(videos)} videos...")
                
            entry = build_entry(video_path, root_dir, repo_root)
            if entry:
                f.write(json.dumps(entry) + '\n')
                valid_count += 1

    logger.info(f"Manifest generation complete. Wrote {valid_count} valid records (skipped {len(videos) - valid_count} invalid/corrupted) to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Generate structured JSONL manifest for video datasets")
    args = parser.parse_args()

    in_dir = paths.get_faceforensics_root()
    repo_root = paths.get_repo_root()
    out_dir = paths.get_data_root() / "manifests" / "video"
    out_file = out_dir / "faceforensicspp.jsonl"
    
    if not in_dir.exists():
        logger.error(f"Dataset root does not exist: {in_dir}")
        return

    logger.info(f"Starting manifest generation for: {in_dir}")
    scan_dataset(in_dir, out_file, repo_root)

if __name__ == "__main__":
    main()