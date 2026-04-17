# Multimodal Deepfake Detection System

A full-stack deepfake detection system that analyzes images, audio, and video using trained AI models. Built with React, Node.js/Express, FastAPI, MongoDB, Redis, and Cloudinary.

## Project Structure

```
├── client/          # React frontend (Vite)
├── server/          # Main backend (Express + Node.js)
├── ai/              # AI model services (FastAPI + Python)
│   ├── image_main.py
│   ├── audio_main.py
│   ├── image_model.py
│   ├── audio_model.py
│   └── utils/
├── models/          # Trained model weights (.pth files)
└── docs/
```

## Prerequisites

- Node.js v18+
- Python 3.10+
- Redis (running locally on port 6379)
- MongoDB Atlas account (or local MongoDB)

## Setup

### 1. Clone and install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install Python dependencies
pip install -r ai/requirements.txt
```

### 2. Environment variables

```bash
cd server
cp .env.example .env
```

Fill in your `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/deepfake_db
REDIS_HOST=localhost
REDIS_PORT=6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
IMAGE_MODEL_URL=http://localhost:8001
VIDEO_MODEL_URL=http://localhost:8002
AUDIO_MODEL_URL=http://localhost:8003
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

## Running the Project

You need **5 terminals** running simultaneously.

### Terminal 1 — Redis
```bash
redis-server
```

### Terminal 2 — Express Backend
```bash
cd server
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Redis connected
MongoDB connected
```

### Terminal 3 — Image Model (port 8001)
```bash
uvicorn image_main:app --app-dir ai --port 8001 --reload
```

### Terminal 4 — Audio Model (port 8003)
```bash
uvicorn audio_main:app --app-dir ai --port 8003 --reload
```

### Terminal 5 — Frontend
```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file for analysis |
| GET | `/api/upload/constraints` | Get file upload limits |
| GET | `/api/upload/status/:taskId` | Poll analysis status |
| GET | `/health` | Server health check |

### Upload Request
```
POST /api/upload
Content-Type: multipart/form-data

file        → media file
media_type  → "image" | "video" | "audio"
```

## Supported Formats

| Type | Formats | Max Size |
|------|---------|----------|
| Image | JPEG, PNG, WEBP, BMP, HEIC | 20 MB |
| Video | MP4, WEBM, MOV, AVI, MKV | 200 MB |
| Audio | WAV, MP3, M4A, OGG | 50 MB |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TailwindCSS |
| Backend | Node.js, Express |
| AI Models | Python, FastAPI, PyTorch |
| Image Model | EfficientNet-B4 (99.89% accuracy) |
| Audio Model | ResNet18 on Mel Spectrograms |
| Database | MongoDB Atlas |
| Cache | Redis |
| Storage | Cloudinary |
