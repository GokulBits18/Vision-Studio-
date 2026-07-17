#  Vision Studio

Vision Studio is a comprehensive, full-stack Artificial Intelligence application designed to process, analyze, and enhance media in real-time. It features a unique hybrid architecture, blending lightning-fast local AI inference with heavy remote deep learning models hosted on Hugging Face and Kaggle.

##  Core Features

*   ** Live Stream Radar:** Low-latency, real-time object tracking and detection via WebSockets.
*   ** Context-Aware Smart OCR:** Extracts text from images (English & Japanese), identifies the core subject, fetches real-time definitions via the **Wikipedia API**, and synthesizes it into natural speech.
*   ** Live Filters & Smart Editor:** Dynamic, AI-driven visual effects (Neo Edges, Vintage, Pencil) and intelligent image manipulation (CLAHE auto-enhancement, background isolation) applied on the fly.
*   ** Generative Studio Edit:** Advanced subject isolation and dynamic background/clothing inpainting utilizing remote Kaggle GPU pipelines.
*   ** Generative 4K Restoration:** Upscales image resolution and restores crisp facial/environmental details.

##  Tech Stack & Architecture

**Frontend:**
*   React.js (Vite) & Tailwind/CSS for responsive UI components.

**Backend & Local AI Inference:**
*   **Python & FastAPI:** High-speed API endpoints and WebSocket streaming.
*   **OpenCV & NumPy:** Core image matrix processing, CLAHE enhancement, and live stream filtering.
*   **YOLO (`yolo26n.pt`):** Local state-of-the-art real-time Object Detection.
*   **MediaPipe:** Real-time body pose tracking (`mp.solutions.pose`) for precise inpaint masking, and selfie segmentation for subject isolation.
*   **EasyOCR:** Robust text extraction configured for multi-language ('en', 'ja') support.
*   **Kokoro-82M:** A highly efficient local Text-to-Speech pipeline (`lang_code='j'`) for natural voice synthesis.

**Cloud, APIs & Remote Inference:**
*   **Kaggle GPU Servers:** Heavy Generative AI processing is offloaded to a custom Kaggle Gradio server, connected to the backend via a secure API tunnel (`gradio_client`).
*   **Hugging Face:** Seamlessly integrated with `sczhou/CodeFormer` for advanced facial and image restoration.
*   **Wikipedia API:** Dynamically queried to provide contextual definitions for text recognized by the OCR engine.

##  Getting Started

### Prerequisites
Make sure you have Node.js and Python 3.x installed on your local machine.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/GokulBits18/Vision-Studio-.git
cd Vision-Studio--01
\`\`\`

### 2. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the Vite server:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### 3. Backend Setup
Navigate to the backend directory, set up your virtual environment, and install requirements:
\`\`\`bash
cd ../backend
python -m venv vision

# Activate virtual environment (Windows)
vision\Scripts\activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 4. Environment Variables
Create a `.env` file in the `backend/` directory and add your access tokens:
\`\`\`env
HF_TOKEN=your_huggingface_token
KAGGLE_API_URL=your_remote_kaggle_gradio_tunnel_url
\`\`\`

### 5. Run the Backend Server
Start the Uvicorn server to power the AI endpoints:
\`\`\`bash
uvicorn main:app --reload
\`\`\`

## Model Weights
Due to GitHub file size limits, large pre-trained local model files are not hosted in this repository. Ensure you have downloaded the necessary weights (e.g., `yolo26n.pt`, `EDSR_x4.pb`) and placed them in the `backend/` directory before starting the server.

##  Author
**0100011101101111011010110111010101101100**
