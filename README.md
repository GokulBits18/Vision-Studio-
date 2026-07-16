# Vision Studio

Vision Studio is a comprehensive, full-stack Artificial Intelligence application focused on advanced computer vision capabilities. It bridges a responsive, modern frontend with a powerful Python backend to deliver real-time image processing, object detection, and AI-driven enhancements.

##  Features

Based on the core modules of the application, Vision Studio includes:
* **Smart OCR (Optical Character Recognition):** Extract and process text seamlessly from images.
* **Hand Gesture Canvas:** Real-time gesture recognition for interactive control.
* **Resolution Engine (EDSR):** Super-resolution capabilities to upscale and enhance image quality without losing detail.
* **AI Filters & Smart Image Editor:** Apply advanced, intelligent visual filters and edits to media.
* **Professional Look AI:** Specialized processing for professional-grade photo enhancements.
* **File History & Management:** Keep track of processed media and user sessions.

##  Tech Stack

**Frontend:**
* React.js (Bootstrapped with Vite for high performance)
* JavaScript (JSX)
* CSS / Tailwind (for responsive UI components)

**Backend & AI:**
* Python
* FastAPI / Uvicorn (for high-speed API endpoints and Websockets)
* Ultralytics (YOLOv8 & YOLO26n for state-of-the-art Object Detection)
* OpenCV / EDSR (Enhanced Deep Residual Networks for image super-resolution)

**Data & Model Sourcing:**
* **Hugging Face:** Utilized for accessing and integrating pre-trained transformer models and computer vision pipelines.
* **Kaggle:** Leveraged for sourcing robust training datasets to fine-tune and evaluate the AI models used in this project.

## Getting Started


### Prerequisites
Make sure you have Node.js and Python installed on your local machine. 

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/GokulBits18/Vision-Studio--.git
cd Vision-Studio--01
\`\`\`

### 2. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the Vite development server:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### 3. Backend Setup
Navigate to the backend directory, set up your virtual environment, and install the required Python packages:
\`\`\`bash
cd ../backend
python -m venv vision
# Activate virtual environment (Windows)
vision\Scripts\activate
# Activate virtual environment (Mac/Linux)
source vision/bin/activate

pip install -r requirements.txt
\`\`\`
*Note: Make sure to create a `.env` file in the backend folder for any necessary API keys or environment variables.*

### 4. Run the Backend Server
Start the Uvicorn server to power the AI endpoints:
\`\`\`bash
uvicorn main:app --reload
\`\`\`

##  Model Weights
Due to GitHub file size limits, large pre-trained model files (like `.pt` and `.pb` files) are not hosted in this repository. Ensure you have downloaded the necessary weights (e.g., `yolov8n.pt`, `EDSR_x4.pb`) and placed them in the `backend/` directory before running the server.

##  Author
**Gokul**
