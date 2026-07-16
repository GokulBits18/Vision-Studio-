import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { logStudioAction } from './FileHistory';

export default function SmartOCR() {
  const [image, setImage] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrData, setOcrData] = useState({ text: "", description: "", audio: null });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0");
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setFileToUpload(dataURLtoFile(imageSrc, "ocr_capture.jpg"));
      setUseCamera(false);
      logStudioAction("OCR: Instant Capture", imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage(preview);
      setFileToUpload(file);
      logStudioAction("OCR: Image Uploaded", preview);
      setUseCamera(false);
    }
  };

  const processOCR = async () => {
    if (!fileToUpload) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/smart-ocr', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.status === 'success') {
        setOcrData({ text: data.text, description: data.description, audio: data.audio });
        logStudioAction("OCR: Scan Successful", image);
      } else {
        alert("OCR failed: " + data.message);
      }
    } catch (error) { 
      console.error("Error:", error); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

  const handleSpeedChange = (e) => {
    const val = e.target.value;
    setPlaybackSpeed(val);
    if (audioRef.current) audioRef.current.playbackRate = parseFloat(val);
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="fade-in-up delay-1 sci-fi-box" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="neon-text" style={{ margin: 0 }}>Smart OCR + Voice</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#55aaff' }}>TEXT EXTRACTION </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
            <button className="cyber-btn" onClick={() => fileInputRef.current.click()} disabled={isProcessing}>UPLOAD IMAGE</button>
            <button className="cyber-btn" onClick={() => setUseCamera(!useCamera)} disabled={isProcessing}>
              {useCamera ? "CANCEL CAMERA" : "INSTANT CAPTURE"}
            </button>
            <button className="cyber-btn" onClick={processOCR} disabled={!image || isProcessing} style={{ background: 'rgba(0, 255, 255, 0.2)' }}>
              {isProcessing ? "SCANNING..." : "SCAN TEXT "}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: '60vh', minHeight: '400px', width: '100%' }}>
        <div className="fade-in-up delay-2" style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#000', overflow: 'hidden' }}>
          {useCamera ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button className="cyber-btn" onClick={handleCapture} style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.5)' }}>SNAP PHOTO</button>
            </div>
          ) : image ? (
            <img src={image} alt="Target" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <p className="neon-text">NO IMAGE LOADED</p>
          )}
        </div>

        <div className="fade-in-up delay-3" style={{ flex: 1, minWidth: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#000' }}>
          {isProcessing ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <p className="neon-text pulsing-glow"> EXTRACTING DATA ...</p>
            </div>
          ) : (
            <>
              <div>
                <h4 style={{ color: '#55aaff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Extracted Text</h4>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', border: '1px solid #333', borderRadius: '4px', minHeight: '80px', color: '#fff' }}>
                  {ocrData.text || "No text scanned yet."}
                </div>
              </div>

              <div>
                <h4 style={{ color: '#55aaff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Context / Dictionary</h4>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', border: '1px solid #333', borderRadius: '4px', minHeight: '80px', color: '#00FFFF' }}>
                  {ocrData.description || "Awaiting context engine."}
                </div>
              </div>

              <div>
  <h4 style={{ color: '#55aaff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}> Audio </h4>
  {ocrData.audio ? (
    <div className="custom-audio-box" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #333', background: 'rgba(0,0,0,0.5)' }}>
      <audio 
        ref={audioRef} 
        src={ocrData.audio} 
        onEnded={handleAudioEnded} 
      />
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="neon-play-btn" onClick={togglePlayPause}>
          {isPlaying ? "⏸ PAUSE AUDIO" : "▶ PLAY AUDIO"}
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00ffff', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>SPEED:</span>
          <select 
            value={playbackSpeed} 
            onChange={handleSpeedChange}
            style={{ 
              background: 'rgba(0,0,0,0.8)', 
              color: '#00ffff', 
              border: '1px solid #00ffff', 
              padding: '6px 10px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              outline: 'none',
              borderRadius: '4px'
            }}
          >
            <option value="0.5">0.5x (Slow)</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x (Normal)</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x (Fast)</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>
      </div>
    </div>
                ) : (
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                    Audio offline.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}