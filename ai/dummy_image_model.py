from fastapi import FastAPI
import random

app = FastAPI()

@app.post("/predict/image")
def predict_image():
    score = round(random.uniform(0, 1), 4)
    return {
        "prediction": score,
        "confidence": "High" if score > 0.75 else "Medium" if score > 0.4 else "Low",
        "type": "image"
    }
