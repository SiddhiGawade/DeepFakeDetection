from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import torch
import numpy as np
import torch.nn.functional as F
import os
import urllib.request
import tempfile
from contextlib import asynccontextmanager

from audio_model import AudioDeepfakeDetector
from utils.audio_feature_extract import extract_mel_spectrogram, extract_audio_analysis

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = AudioDeepfakeDetector()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    model_path = os.path.join(os.path.dirname(__file__), "..", "models", "src", "deepfake_models", "audio", "audio_ai_model.pth")
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
        print(f"Audio model loaded from {model_path} on {device}")
    else:
        print(f"Warning: Model not found at {model_path}")
    
    model.eval()
    model.to(device)
    yield
    # Clean up on shutdown

app = FastAPI(lifespan=lifespan)

LABELS = {0: "Real", 1: "AI Generated"}

class PredictRequest(BaseModel):
    file_url: Optional[str] = None

def download_file(url, target_path):
    urllib.request.urlretrieve(url, target_path)

@app.post("/predict/audio")
async def predict_audio(req: PredictRequest = None):
    # Fallback dummy behavior if the url isn't provided or req is None
    if not req or not req.file_url:
        import random
        score = random.uniform(0, 1)
        return {
            "prediction": round(score, 4),
            "confidence": "High" if score > 0.75 else "Medium" if score > 0.4 else "Low",
            "type": "audio",
            "error": "No file_url provided, returning dummy result"
        }
    
    tmp_path = tempfile.mktemp(suffix=".tmp")
    
    try:
        download_file(req.file_url, tmp_path)
        mel = extract_mel_spectrogram(tmp_path)
        if mel is None:
            return {"error": "Could not process audio file"}
        
        tensor = torch.FloatTensor(mel).unsqueeze(0).unsqueeze(0).to(device)
        
        with torch.no_grad():
            logits = model(tensor)
            probs = F.softmax(logits, dim=1).squeeze().cpu().numpy()
        
        predicted_class = int(np.argmax(probs))
        confidence = round(float(np.max(probs)) * 100, 2)
        
        reasons, analysis = extract_audio_analysis(tmp_path)
        
        return {
            "prediction": round(float(probs[1]), 4),
            "confidence": confidence,
            "type": "audio",
            "verdict": LABELS[predicted_class],
            "is_fake": predicted_class == 1,
            "probabilities": {
                "real": round(float(probs[0]) * 100, 2),
                "ai_generated": round(float(probs[1]) * 100, 2)
            },
            "reasons": reasons,
            "analysis": analysis
        }
    except Exception as e:
        return {"error": str(e), "type": "audio"}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
