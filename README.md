# Vision Studio

Vision Studio is a comprehensive, full-stack Artificial Intelligence application designed to process, analyze, and enhance media in real-time. It bridges a lightning-fast modern frontend with a powerful, hybrid-cloud Python backend to deliver advanced computer vision capabilities directly to the user.

##  Core Features

*   ** Air Canvas:** Real-time hand gesture recognition for interactive, touch-free drawing.
*   ** Live Filter & Smart Editor:** Dynamic, AI-driven visual effects and intelligent image manipulation applied on the fly.
*   ** Professional Look:** High-end image processing and stylization for professional-grade photo enhancements.
*   ** 4K Engine:** Upscaling image resolution and restoring crisp details without losing quality.
*   ** Smart OCR & Audio:** Seamless text extraction directly from images, paired with high-quality Text-to-Speech (TTS) synthesis to read the output aloud.

## Tech Stack & Architecture

**Frontend:**
*   React.js (Bootstrapped with Vite for high performance)
*   JavaScript (JSX) & Tailwind/CSS for responsive UI components

**Backend & AI Inference:**
*   Python & FastAPI (Handling high-speed API endpoints and Websockets)
*   OpenCV (Core image processing and media routing)
*   **YOLOv8 & Custom YOLO Variants:** For state-of-the-art real-time Object Detection and tracking.
*   **EDSR (Enhanced Deep Residual Networks):** Powering the 4K super-resolution engine.
*   **Kokoro-82M:** A highly efficient, 82-million parameter TTS model utilized for natural-sounding audio generation without bottlenecking local VRAM.

**Cloud & Infrastructure:**
*   **Kaggle GPU Servers:** To overcome local hardware limitations, the heavy deep learning inference for the "Professional Look" pipeline is offloaded and hosted remotely on Kaggle's GPU environment, connected to the backend via a secure API tunnel.
*   **Hugging Face:** Leveraged for integrating advanced pre-trained transformer pipelines.

## Getting Started

### Prerequisites
Make sure you have Node.js and Python 3.x installed on your local machine.

### 1. Clone the repository
```bash
git clone [https://github.com/GokulBits18/Vision-Studio--.git](https://github.com/GokulBits18/Vision-Studio--.git)
cd Vision-Studio--01

 Frontend Setup

Navigate to the frontend directory, install dependencies, and start the Vite development

cd frontend
npm install
npm run dev
server

 Backend Setup

Navigate to the backend directory, set up your virtual environment, and install the required Python packages:

cd ../backend
python -m venv vision

# Activate virtual environment (Windows)
vision\Scripts\activate

# Install dependencies
pip install -r requirements.txt

Note: Make sure to create a .env file in the backend folder to store any necessary API keys or tunneling credentials.

Run the Backend Server

Start the Uvicorn server to power the AI endpoints:

uvicorn main:app --reload

Model Weights & Remote Inference

Due to GitHub file size limits, large pre-trained model files (like .pt and .pb files) are not hosted in this repository.

Local Models: Ensure you have downloaded the necessary weights (e.g., yolov8n.pt, EDSR_x4.pb) and placed them in the backend/ directory before starting the local server.

Remote Models: The "Professional Look" feature requires an active connection to your configured Kaggle Notebook/Server tunnel.


Author

0100011101101111011010110111010101101100

















