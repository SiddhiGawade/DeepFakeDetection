# Multimodal Deepfake Detection System

## Overview
This repository contains the backend service for the Multimodal Deepfake Detection System. It is designed to handle user uploads of various media types—images, videos, and audio—and process them to determine if they contain deepfake manipulations. 

*Note: The current version implements the foundational uploading mechanism and API structure. Future phases will introduce AI model integrations, caching, and database functionalities.*

## Features
- **Media Uploading API**: An Express-based API endpoint that accepts file uploads.
- **File Validation**: Uses Multer to restrict uploads to acceptable MIME types and enforce a 200MB file size limit.
- **Multimodal Support**: Supports a variety of formats:
  - **Images**: JPEG, PNG, WEBP
  - **Videos**: MP4, WEBM
  - **Audio**: MPEG, WAV, MP4 (Audio)
- **Health Check**: Endpoint to quickly check the server's status.

## Future / Planned Architecture
The system is built with scalability in mind. The planned architecture (outlined in `docs/nayan.md`) will include:
- **Cloud Storage**: AWS S3 integration for robust file storage.
- **Caching**: Redis for quick data access and request caching.
- **Database**: MongoDB for storing upload metadata, processing status, and detection results.
- **AI Processing**: Integration with detection models to classify media as real or fake.

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm

### Installation
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables. Copy the example file and configure it:
   ```bash
   cp .env.example .env
   ```

### Running the Server
To start the server in development mode (using nodemon):
```bash
npm run dev
```

To start the server for production:
```bash
npm start
```
The server will start by default on `http://localhost:5000` (or `PORT` specified in `.env`).

## API Endpoints

### 1. File Upload
- **Endpoint**: `POST /api/upload`
- **Description**: Uploads a single media file.
- **Body**: `multipart/form-data` with the key `file`.
- **Response**: Returns a JSON object with a success message and basic file metadata (original name, saved name, size, MIME type, and temporary path).

### 2. Health Check
- **Endpoint**: `GET /health`
- **Description**: Confirms that the API is running correctly.
- **Response**: `{"status": "ok", "message": "Deepfake Detection API is running"}`

## Project Structure
```
.
├── docs/                # Project documentation
└── server/              # Backend service
    ├── src/
    │   ├── controllers/ # Request handlers (upload logic)
    │   ├── routes/      # Express route definitions
    │   └── utils/       # Utility functions (Multer config)
    ├── uploads/         # Temporary local storage for incoming files
    ├── .env.example     # Template for environment variables
    ├── package.json     # Node.js dependencies and scripts
    └── server.js        # Main entry point for the Express backend
```
