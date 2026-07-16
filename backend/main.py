from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import os
import json
import mediapipe as mp
import tempfile
import requests
import easyocr
from ultralytics import YOLO
from gradio_client import Client, handle_file
from dotenv import load_dotenv
from kokoro import KPipeline
import soundfile as sf
import io
from huggingface_hub import login

# Load API Key and Kaggle Server configuration from .env
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
KAGGLE_API_URL = os.getenv("KAGGLE_API_URL")

# Authenticate globally for the entire session
if HF_TOKEN:
    login(token=HF_TOKEN)



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#  AI MODELS 

# 1. MediaPipe Models
mp_selfie_segmentation = mp.solutions.selfie_segmentation
segmenter = mp_selfie_segmentation.SelfieSegmentation(model_selection=0)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)

# 2. YOLOv8 Model for Live Stream Radar
yolo_model = YOLO('yolo26n.pt')

# 3. EasyOCR Reader for Text Extraction
ocr_reader = easyocr.Reader(['en'])

# 4. AI 4K Upscale Engine "EDSR"
try:
    print("Loading Local EDSR 4K AI Model...")
    sr = cv2.dnn_superres.DnnSuperResImpl_create() 
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(BASE_DIR, "EDSR_x4.pb") 
    
    sr.readModel(path)
    sr.setModel("edsr", 4)  
    print("Local 4K Engine Ready.")
except Exception as e:
    print(f"\n>>> ERROR LOADING 4K ENGINE: {e}\n")
    sr = None

# 5.  Kokoro Text-to-Speech 
try:
    print("Loading Local Kokoro TTS Engine. This may take a moment on the first run...")
    tts_pipeline = KPipeline(lang_code='a')
    print("Local Voice Engine Ready.")
except Exception as e:
    print(f"\n>>> ERROR LOADING KOKORO ENGINE: {e}\n")
    tts_pipeline = None

# History Storage
SESSION_HISTORY = []

@app.get("/")
async def root():
    return {"message": "Live Studio Server Version 4.0 (Local 4K & Voice Engine) is running!"}

def create_inpaint_mask(img_shape, landmarks):
    mask = np.zeros(img_shape[:2], dtype=np.uint8)
    h, w = img_shape[:2]
    l_shldr = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
    r_shldr = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
    neck_y = int(min(l_shldr.y, r_shldr.y) * h) - int(0.03 * h)
    mask[neck_y:h, 0:w] = 255
    return mask



#  LIVE YOLO WEBSOCKET RADAR

@app.websocket("/api/ws/yolo")
async def yolo_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            encoded_data = data.split(',')[1]
            
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                continue 
            
            results = yolo_model(img, verbose=False)
            
            detections = []
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = box.conf[0].item()
                    cls = int(box.cls[0].item())
                    name = yolo_model.names[cls]
                    
                    detections.append({
                        "x": x1, "y": y1, 
                        "w": x2 - x1, "h": y2 - y1,
                        "class": name, "score": conf
                    })
            
            await websocket.send_text(json.dumps(detections))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"YOLO WS Error: {e}")



#  GENERATIVE 4K RESTORATION 

@app.post("/api/resolution-engine")
async def resolution_engine(
    file: UploadFile = File(...),
    mode: str = Form(...),
    fidelity: float = Form(0.7) 
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if mode == "upscale_4k":
            #  Keeps the image manageable and prevents connection drops
            h, w = img.shape[:2]
            if max(h, w) > 1024:
                scale = 1024 / max(h, w)
                img = cv2.resize(img, (int(w * scale), int(h * scale)))

            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as img_temp:
                cv2.imwrite(img_temp.name, img)
                
                # The client will now use your globally authenticated token
                client = Client("sczhou/CodeFormer")
                
                result = client.predict(
                    handle_file(img_temp.name),
                    float(fidelity), True, True, 2, fn_index=0                  
                )
                
                result_path = result[0] if isinstance(result, tuple) else result
                result_img = cv2.imread(result_path)
            
        elif mode == "convert_blur":
            result_img = cv2.GaussianBlur(img, (99, 99), 0)
        else:
            return {"status": "error", "message": "Invalid mode selection."}
            
        _, buffer = cv2.imencode('.jpg', result_img)
        return {"status": "success", "image": f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"}
    except Exception as e:
        print(f"Restoration AI Error: {e}")
        return {"status": "error", "message": str(e)}
    

#  SMART OCR + VOICE + DICTIONARY

@app.post("/api/smart-ocr")
async def smart_ocr(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        ocr_results = ocr_reader.readtext(img)
        detected_text = " ".join([res[1] for res in ocr_results]).strip()
        
        if not detected_text:
            return {
                "status": "success", 
                "text": "", 
                "description": "No legible words detected.", 
                "audio": None
            }
        
        #  Skip boring grammar words to find the main subject
        words = [w.strip(".,!@#$") for w in detected_text.split()]
        stop_words = {"how", "to", "use", "the", "a", "an", "is", "it", "this", "that", "of", "for", "and", "in", "on", "what", "why", "are"}
        
        target_word = ""
        for w in words:
            if w.lower() not in stop_words and len(w) > 1:
                target_word = w
                break
        
        if not target_word and words:
            target_word = words[-1] 
            
        description = f"Context analysis for expression: '{detected_text}'"
        
        # Search Wikipedia for the target concept
        if target_word:
            try:
                #  Add a "nametag" so Wikipedia doesn't block the request
                headers = {"User-Agent": "VisionStudioApp/1.0"}
                
                search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={target_word}&utf8=&format=json"
                search_res = requests.get(search_url, headers=headers, timeout=5).json()
                
                if search_res.get('query', {}).get('search'):
                    best_match_title = search_res['query']['search'][0]['title']
                    
                    #  Replace spaces with underscores for the URL
                    formatted_title = best_match_title.replace(" ", "_")
                    summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{formatted_title}"
                    summary_res = requests.get(summary_url, headers=headers, timeout=5).json()
                    
                    if 'extract' in summary_res:
                        # Grab just the first sentence so the UI stays clean
                        first_sentence = summary_res['extract'].split('.')[0] + "."
                        description = f"Context ({best_match_title}): {first_sentence}"
            except Exception as e:
                print(f"Context Engine Error: {e}")
                pass
                
        audio_base64 = None
        # Use  local Kokoro engine 
        if tts_pipeline is not None and detected_text:
            try:
                # Combine both parts into a single script with spoken labels
                text_to_read = f"Extracted text: {detected_text}. Context dictionary: {description}"
                
                generator = tts_pipeline(text_to_read, voice="af_heart", speed=1.0)
                audio_chunks = [audio for _, _, audio in generator]
                
                if audio_chunks:
                    final_audio = np.concatenate(audio_chunks)
                    buffer = io.BytesIO()
                    sf.write(buffer, final_audio, 24000, format='WAV')
                    buffer.seek(0)
                    audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            except Exception as e:
                print(f"Local Kokoro OCR TTS failed: {e}")

        return {
            "status": "success",
            "text": detected_text,
            "description": description,
            "audio": f"data:audio/wav;base64,{audio_base64}" if audio_base64 else None
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}



#  SESSION TRACKING HISTORY

@app.get("/api/history")
async def get_history():
    return {"status": "success", "history": SESSION_HISTORY}

@app.post("/api/history/log")
async def log_history_item(payload: dict):
    item = {
        "id": len(SESSION_HISTORY) + 1,
        "action": payload.get("action", "Unknown Operation"),
        "timestamp": payload.get("timestamp", "Just now"),
        "preview": payload.get("preview", "")
    }
    SESSION_HISTORY.append(item)
    return {"status": "success", "logged_id": item["id"]}



#  LIVE STREAMING FILTERS

@app.websocket("/ws/live-sketch")
async def sketch_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            filter_type = payload.get("filter", "none")
            encoded_data = payload.get("image", "").split(',')[1]
            
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if filter_type == "pencil":
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                inverted = cv2.bitwise_not(gray)
                blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
                inverted_blurred = cv2.bitwise_not(blurred)
                result = cv2.divide(gray, inverted_blurred, scale=256.0)
            elif filter_type == "neo_edges":
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                blurred = cv2.GaussianBlur(gray, (5, 5), 0)
                edges = cv2.Canny(blurred, 50, 150)
                kernel = np.ones((3,3), np.uint8)
                thick_edges = cv2.dilate(edges, kernel, iterations=1)
                hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
                hsv[:, :, 1] = 255 
                hsv[:, :, 2] = 255 
                neon_colors = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
                result = cv2.bitwise_and(neon_colors, neon_colors, mask=thick_edges)
            elif filter_type == "bg_blur":
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                segmentation_result = segmenter.process(img_rgb)
                mask = segmentation_result.segmentation_mask
                mask = cv2.GaussianBlur(mask, (7, 7), 0)
                mask = np.stack((mask,) * 3, axis=-1)
                bg_img = cv2.GaussianBlur(img, (99, 99), 0)
                result = (mask * img + (1 - mask) * bg_img).astype(np.uint8)
            elif filter_type == "vintage":
                kernel = np.array([[0.272, 0.534, 0.131],
                                   [0.349, 0.686, 0.168],
                                   [0.393, 0.769, 0.189]])
                vintage = cv2.transform(img, kernel)
                result = np.clip(vintage, 0, 255).astype(np.uint8)
            elif filter_type == "bw_film":
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                high_contrast = cv2.convertScaleAbs(gray, alpha=1.5, beta=-20)
                result = cv2.cvtColor(high_contrast, cv2.COLOR_GRAY2BGR)
            else:
                result = img 
            
            _, buffer = cv2.imencode('.jpg', result)
            sketch_base64 = base64.b64encode(buffer).decode('utf-8')
            await websocket.send_text(f"data:image/jpeg;base64,{sketch_base64}")
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS Error: {e}")



#  GENERATIVE AI STUDIO EDIT

@app.post("/api/studio-edit")
async def studio_edit(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        raw_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        orig_h, orig_w = raw_img.shape[:2]

        img_rgb = cv2.cvtColor(raw_img, cv2.COLOR_BGR2RGB)
        seg_results = segmenter.process(img_rgb)
        condition = np.stack((seg_results.segmentation_mask,) * 3, axis=-1) > 0.5
        white_bg = np.ones(raw_img.shape, dtype=np.uint8) * 255
        clean_img = np.where(condition, raw_img, white_bg)

        max_dim = 512
        scale = max_dim / max(orig_h, orig_w)
        new_w, new_h = int(orig_w * scale), int(orig_h * scale)
        scaled_img = cv2.resize(clean_img, (new_w, new_h))
        
        square_img = np.ones((max_dim, max_dim, 3), dtype=np.uint8) * 255
        y_offset = (max_dim - new_h) // 2
        x_offset = (max_dim - new_w) // 2
        square_img[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = scaled_img

        img_rgb_square = cv2.cvtColor(square_img, cv2.COLOR_BGR2RGB)
        pose_results = pose.process(img_rgb_square)
        
        if not pose_results.pose_landmarks:
            return {"status": "error", "message": "No human detected in photo."}
            
        mask_cv2 = create_inpaint_mask(square_img.shape, pose_results.pose_landmarks.landmark)

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as img_temp, \
             tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as mask_temp:
            
            cv2.imwrite(img_temp.name, square_img)
            cv2.imwrite(mask_temp.name, mask_cv2)
            
            # Remove any trailing or leading spaces that cause "Repo id" issues
            target_url = KAGGLE_API_URL.strip() if KAGGLE_API_URL else None
            
            print(f"DEBUG: Raw URL variable from .env is: '{KAGGLE_API_URL}'")
            print(f"DEBUG: Processed target URL string is: '{target_url}'")
            print(f"DEBUG: Type of URL variable is: {type(target_url)}")

            if not target_url or target_url.lower() == "none":
                print("CRITICAL: Kaggle URL is missing from .env! Applying hardcoded fallback...")
                target_url = "https://c4eb0963825bb1d235.gradio.live/"
                print(f"DEBUG: Hardcoded Fallback URL assigned: '{target_url}'")
            
            client = Client(target_url)
            
            
            result_path = client.predict(
                handle_file(img_temp.name),
                handle_file(mask_temp.name),
                api_name="/predict"
            )
            final_square_img = cv2.imread(result_path)

        cropped_img = final_square_img[y_offset:y_offset+new_h, x_offset:x_offset+new_w]
        final_restored_img = cv2.resize(cropped_img, (orig_w, orig_h))

        _, buffer = cv2.imencode('.jpg', final_restored_img)
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        
        return {"status": "success", "image": f"data:image/jpeg;base64,{encoded_image}"}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}



#  THE SMART EDITOR (Zero-Slider)

@app.post("/api/smart-edit")
async def smart_edit(
    file: UploadFile = File(...), 
    auto_enhance: bool = Form(False),
    isolate_subject: bool = Form(False)
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if auto_enhance:
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8,8))
            cl = clahe.apply(l)
            
            limg = cv2.merge((cl,a,b))
            enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
            
            img = cv2.addWeighted(img, 0.6, enhanced_img, 0.4, 0)

        if isolate_subject:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            seg_results = segmenter.process(img_rgb)
            mask = seg_results.segmentation_mask
            
            alpha_channel = (mask * 255).astype(np.uint8)
            
            img_bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
            img_bgra[:, :, 3] = alpha_channel 
            final_img = img_bgra
        else:
            final_img = img

        _, buffer = cv2.imencode('.png', final_img)
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        
        return {"status": "success", "image": f"data:image/png;base64,{encoded_image}"}

    except Exception as e:
        return {"status": "error", "message": str(e)}



#  TEXT-TO-SPEECH

@app.post("/api/text-to-speech")
async def generate_speech(
    text: str = Form(...),
    voice: str = Form(default="af_heart") 
):
    if tts_pipeline is None:
        return {"status": "error", "message": "Voice engine failed to load on server startup."}
        
    try:
        print(f"Generating speech for text using voice: {voice}")
        
        # 1. Generate the audio chunks
        generator = tts_pipeline(text, voice=voice, speed=1.0)
        audio_chunks = [audio for _, _, audio in generator]
        
        if not audio_chunks:
            return {"status": "error", "message": "Failed to generate audio."}
            
        # 2. Combine the audio chunks into one complete array
        final_audio = np.concatenate(audio_chunks)
        
        # 3. Save it to computer memory (RAM) instead of saving a physical file
        buffer = io.BytesIO()
        sf.write(buffer, final_audio, 24000, format='WAV') 
        buffer.seek(0)
        
        # 4. Encode to Base64 so your frontend can instantly play it
        encoded_audio = base64.b64encode(buffer.read()).decode('utf-8')
        
        return {
            "status": "success", 
            "message": "Speech generated successfully!",
            "audio": f"data:audio/wav;base64,{encoded_audio}"
        }
        
    except Exception as e:
        print(f"Kokoro TTS Error: {e}")
        return {"status": "error", "message": str(e)}