# Vision Studio

A Full-Stack AI Media Studio powered by Computer Vision, Deep Learning, Real-Time Streaming, and Generative AI.

Vision Studio is an advanced AI-powered media processing platform that combines real-time computer vision, AI image enhancement, OCR, speech synthesis, and generative image editing into a single application.

Unlike traditional AI editors, Vision Studio uses a hybrid AI architecture that intelligently splits workloads between local inference and cloud GPU acceleration, enabling low-latency performance while supporting computationally intensive image generation.


## Preview

| Feature | Description |
|---------|-------------|
| Air Canvas | Hand Gesture Drawing |
| Live Filters | Real-Time AI Filters |
| Smart Editor | Auto Enhancement |
| Professional Look | AI Corporate Headshots |
| Resolution Engine | 4K Restoration |
| Smart OCR | OCR + Voice Assistant |


## Features

### Air Canvas

Control a virtual drawing canvas using only hand gestures.

### Capabilities

* MediaPipe Hand Tracking
* Finger Gesture Detection
* Real-time Drawing
* Multiple Brush Colors
* Canvas Export
* YOLO Object Detection Overlay
* WebSocket Live Streaming

## Live AI Filters

* Real-time webcam filters powered by OpenCV.

### Available filters

* Sketch
* Neon Edge Detection
* Background Blur
* Vintage
* Black & White Film
* Normal Camera

### Features

* Live webcam streaming
* WebSocket communication
* Zero-delay processing
* One-click download

## Smart Editor

Automatically improves images using computer vision.

### Capabilities

* CLAHE Auto Enhancement
* AI Subject Isolation
* Transparent Background Generation
* PNG Export

## Professional Look AI

* Transforms ordinary portraits into professional corporate headshots.

Pipeline


```text
Upload Image
      │
      ▼
MediaPipe Pose Detection
      │
      ▼
Automatic Mask Generation
      │
      ▼
Stable Diffusion Inpainting
      │
      ▼
Professional Corporate Headshot

* Powered by

* Stable Diffusion Inpainting
* MediaPipe Pose
* Kaggle GPU
* Gradio API

## Resolution Engine

* AI-powered image restoration.

## Supports

* 4K Image Upscaling
* Face Restoration
* Fidelity Control Slider
* Cinematic Blur

* Powered by

* CodeFormer
* OpenCV
* Hugging Face Inference

## Smart OCR

* Extracts text and converts it into meaningful speech.

Pipeline


Use

````md
### OCR Workflow

```text
Image / Camera
      │
      ▼
EasyOCR
      │
      ▼
Extract Text
      │
      ▼
Wikipedia API
      │
      ▼
Context Generation
      │
      ▼
Kokoro TTS
      │
      ▼
Voice Output

Features

* OCR
* Context-aware definitions
* Wikipedia integration
* Natural speech generation
* Adjustable playback speed

## Session Activity Center

Tracks every operation performed during the current session.

Logs include

* Uploads
* Downloads
* AI Processing
* Generated Images
* OCR Operations
* Filter Changes

##                 Architecture

                   
  Camera
     │
     ▼
React Frontend
     │
     ▼
FastAPI
     │
     ├────────► OpenCV
     ├────────► MediaPipe
     ├────────► YOLO
     ├────────► EasyOCR
     ├────────► Kokoro
     ├────────► CodeFormer
     └────────► Stable Diffusion
                     │
                     ▼
              Enhanced Output


## Technology Stack

### Frontend

* React
* Vite
* CSS3
* React Webcam
  
###  Backend

* FastAPI
* Python
* Uvicorn
* WebSockets
* OpenCV
* NumPy

## AI Models

| Model                         | Purpose                    |
| ----------------------------- | -------------------------- |
| MediaPipe Hands               | Gesture Tracking           |
| MediaPipe Pose                | Pose Detection             |
| MediaPipe Selfie Segmentation | Background Removal         |
| YOLO                          | Real-Time Object Detection |
| EasyOCR                       | OCR                        |
| Kokoro TTS                    | Speech Synthesis           |
| Stable Diffusion Inpainting   | Professional Look          |
| CodeFormer                    | Face Restoration           |
| EDSR                          | Image Upscaling            |


## Project Structure

```text
Vision-Studio/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AIFilters.jsx
│   │   ├── SmartOCR.jsx
│   │   ├── SmartImageEditor.jsx
│   │   ├── ProfessionalLookAI.jsx
│   │   ├── ResolutionEngine.jsx
│   │   ├── HandGestureCanvas.jsx
│   │   ├── FileHistory.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── kaggle/
│   └── stable_diffusion_server.ipynb
│
├── README.md

```
## Installation

### Clone the repository

git clone https://github.com/GokulBits18/Vision-Studio-.git

### Frontend

* cd frontend

* npm install

* npm run dev

### Backend

* cd backend

* python -m venv vision

* vision\Scripts\activate

* pip install -r requirements.txt

* uvicorn main:app --reload


## Environment Variables

* Create a .env

* HF_TOKEN=your_huggingface_token

* KAGGLE_API_URL=your_gradio_url

  ## Required Model Files

*  Required Model Files

* yolo26n.pt

* EDSR_x4.pb

## AI Workflow

```text
React Frontend
       │
       ▼
FastAPI Backend
       │
       ├──────────────┐
       │              │
       ▼              ▼
Local AI         Cloud AI
(OpenCV)       (Kaggle GPU)
       │              │
       └──────┬───────┘
              ▼
      Processed Result
              ▼
        React Interface
```              

## Future Improvements 

* Video Super Resolution
* Multi-language OCR
* Image Captioning
* Face Swapping
* AI Background Generation
* Video Editing
* Image-to-Image Generation
* AI Avatar Creation
* Local LLM Assistant
* Batch Image Processing

## Author

### Gokul 

AI • Computer Vision • Deep Learning • Full-Stack AI Development

