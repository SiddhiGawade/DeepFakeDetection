from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import torch
import torch.nn.functional as F
import numpy as np
import os
import urllib.request
import tempfile
from contextlib import asynccontextmanager
from PIL import Image
from torchvision import transforms
from utils.image_feature_extract import extract_image_analysis
from image_model import ImageDeepfakeDetector

# ---------------------------------------------------------------------------
# Device & model setup
# ---------------------------------------------------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ImageDeepfakeDetector(num_classes=2)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models", "src",
    "deepfake_models", "image", "image_ai_model_final.pth",
)

# The class names stored during training
CLASS_NAMES = None          # will be loaded from checkpoint
INPUT_SIZE = 224            # fallback; overridden from checkpoint if available

# Image preprocessing (must match training transforms)
preprocess = transforms.Compose([
    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


@asynccontextmanager
async def lifespan(app: FastAPI):
    global CLASS_NAMES, INPUT_SIZE, preprocess

    if os.path.exists(MODEL_PATH):
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)

        # Load weights
        model.load_state_dict(checkpoint["model_state_dict"])

        # Load metadata saved alongside the weights
        CLASS_NAMES = checkpoint.get("class_names", ["Real", "Fake"])
        INPUT_SIZE = checkpoint.get("input_size", 224)

        # Rebuild preprocess if input size changed
        preprocess = transforms.Compose([
            transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])

        print("[OK] Image model loaded successfully")
        print("  Architecture : EfficientNet-B4")
        print(f"  Classes      : {CLASS_NAMES}")
        print(f"  Input size   : {INPUT_SIZE}x{INPUT_SIZE}")
        print(f"  Test accuracy: {checkpoint.get('test_accuracy', 'N/A')}")
        print(f"  Device       : {device}")
    else:
        print("[WARNING] Image model file not found")

    model.eval()
    model.to(device)
    yield
    # Cleanup on shutdown (nothing to do)


app = FastAPI(lifespan=lifespan)

LABELS = {0: "Real", 1: "AI Generated"}


class PredictRequest(BaseModel):
    file_url: Optional[str] = None


def download_file(url: str, target_path: str):
    """Download a file from a URL to a local path."""
    urllib.request.urlretrieve(url, target_path)


def generate_reasons(probs: dict, predicted_class: int) -> list[str]:
    """Generate human-readable explanation reasons for the prediction."""
    reasons = []
    fake_prob = probs.get("ai_generated", probs.get("fake", 0))

    if predicted_class == 1:  # Fake / AI Generated
        if fake_prob > 95:
            reasons.append("Very high probability of AI generation detected")
            reasons.append("Pixel-level artifacts consistent with synthetic media")
        elif fake_prob > 80:
            reasons.append("Strong indicators of AI-generated content")
            reasons.append("Statistical patterns inconsistent with natural photography")
        else:
            reasons.append("Moderate indicators of potential manipulation")
            reasons.append("Some features suggest synthetic origin")
        reasons.append("EfficientNet-B4 classifier flagged anomalous patterns")
    else:  # Real
        if fake_prob < 5:
            reasons.append("Image exhibits natural photographic characteristics")
            reasons.append("No detectable synthetic artifacts found")
        elif fake_prob < 20:
            reasons.append("Image appears authentic with minor noise")
            reasons.append("Natural compression and lighting patterns detected")
        else:
            reasons.append("Image appears mostly authentic")
            reasons.append("Some minor anomalies detected but within normal range")
        reasons.append("EfficientNet-B4 classifier found no significant manipulation indicators")

    return reasons


@app.post("/predict/image")
async def predict_image(req: PredictRequest = None):
    # Fallback dummy behavior if no URL is provided
    if not req or not req.file_url:
        import random
        score = random.uniform(0, 1)
        return {
            "prediction": round(score, 4),
            "confidence": "High" if score > 0.75 else "Medium" if score > 0.4 else "Low",
            "type": "image",
            "error": "No file_url provided, returning dummy result",
        }

    tmp_path = tempfile.mktemp(suffix=".tmp")

    try:
        # 1. Download the image
        download_file(req.file_url, tmp_path)

        # 2. Open and preprocess
        img = Image.open(tmp_path).convert("RGB")
        tensor = preprocess(img).unsqueeze(0).to(device)  # (1, 3, H, W)

        # 3. Inference
        with torch.no_grad():
            logits = model(tensor)
            probs = F.softmax(logits, dim=1).squeeze().cpu().numpy()

        predicted_class = int(np.argmax(probs))
        confidence_pct = round(float(np.max(probs)) * 100, 2)

        reasons_data, analysis_data = extract_image_analysis(tmp_path)

        # Determine which index corresponds to "fake"
        # CLASS_NAMES from checkpoint: e.g. ['fake', 'real']
        fake_idx = 0  # default
        real_idx = 1
        if CLASS_NAMES and len(CLASS_NAMES) == 2:
            for i, name in enumerate(CLASS_NAMES):
                if name.lower() in ("fake", "ai_generated", "ai generated", "deepfake"):
                    fake_idx = i
                elif name.lower() in ("real", "authentic", "genuine"):
                    real_idx = i

        prob_dict = {
            "real": round(float(probs[real_idx]) * 100, 2),
            "ai_generated": round(float(probs[fake_idx]) * 100, 2),
        }

        is_fake = predicted_class == fake_idx
        verdict = "AI Generated" if is_fake else "Real"

        reasons = generate_reasons(prob_dict, 1 if is_fake else 0)

        return {
            "prediction": round(float(probs[fake_idx]), 4),
            "confidence": confidence_pct,
            "type": "image",
            "verdict": verdict,
            "is_fake": is_fake,
            "probabilities": prob_dict,
            "reasons": reasons_data,         
            "analysis": {
                **analysis_data,              # pixel-level metrics
                "model": "EfficientNet-B4",
                "input_size": f"{INPUT_SIZE}x{INPUT_SIZE}",
                "device": str(device),
            },
        }


    except Exception as e:
        return {"error": str(e), "type": "image"}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
