import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { logStudioAction } from './FileHistory';

export default function ResolutionEngine() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  
  // Fidelity state to control AI strength (0.1 to 1.0)
  const [fidelity, setFidelity] = useState(0.8); 
  
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
      setFileToUpload(dataURLtoFile(imageSrc, "capture.jpg"));
      setUseCamera(false);
      setProcessedImage(null);
      logStudioAction("Resolution: Instant Capture", imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage(preview);
      setFileToUpload(file);
      logStudioAction("Resolution: Uploaded", preview);
      setProcessedImage(null);
      setUseCamera(false);
    }
  };

  const processImage = async (mode) => {
    if (!fileToUpload) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('mode', mode);
    formData.append('fidelity', fidelity); // Sending the strength to your backend

    try {
      const response = await fetch('http://127.0.0.1:8000/api/resolution-engine', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProcessedImage(data.image);
        logStudioAction(`Resolution: ${mode === 'upscale_4k' ? '4K Upscale' : 'Cinematic Blur'} (Fidelity: ${fidelity})`, data.image);
      } else {
        alert("Processing failed: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="fade-in-up delay-1 sci-fi-box" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="neon-text" style={{ margin: 0 }}>Resolution Engine</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#55aaff' }}>4K UPSCALING & SYNTHETIC BLUR</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
            <button className="cyber-btn" onClick={() => fileInputRef.current.click()} disabled={isProcessing}>
              UPLOAD FILE
            </button>
            <button className="cyber-btn" onClick={() => setUseCamera(!useCamera)} disabled={isProcessing}>
              {useCamera ? "CANCEL CAMERA" : "INSTANT CAPTURE"}
            </button>
          </div>
        </div>

        {/* Fidelity Control Slider */}
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#00ffff' }}>RESTORATION FIDELITY: {(fidelity * 100).toFixed(0)}%</span>
                <span style={{ fontSize: '10px', color: '#666' }}>Lower to preserve original features</span>
            </div>
            <input 
                type="range" 
                min="0.1" max="1.0" step="0.1" 
                value={fidelity} 
                onChange={(e) => setFidelity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#00ffff' }} 
            />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
          <button 
            className="cyber-btn" 
            onClick={() => processImage('upscale_4k')} 
            disabled={!image || isProcessing}
            style={{ background: 'rgba(0, 255, 255, 0.2)' }}
          >
            {isProcessing ? "PROCESSING..." : "UPSCALE TO 4K "}
          </button>
          <button 
            className="cyber-btn" 
            onClick={() => processImage('convert_blur')} 
            disabled={!image || isProcessing}
          >
            {isProcessing ? "PROCESSING..." : "CINEMATIC BLUR "}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: '60vh', minHeight: '400px', width: '100%' }}>
        <div className="fade-in-up delay-2" style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#000', overflow: 'hidden' }}>
          {useCamera ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button className="cyber-btn" onClick={handleCapture} style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.5)' }}>SNAP PHOTO</button>
            </div>
          ) : image ? (
            <img src={image} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <p className="neon-text">NO INPUT</p>
          )}
        </div>

        <div className="fade-in-up delay-3" style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#000', overflow: 'hidden' }}>
          {isProcessing ? (
            <p className="neon-text pulsing-glow">ENHANCING PIXELS...</p>
          ) : processedImage ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={processedImage} alt="Processed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <button 
                className="cyber-btn"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `vision_resolution_${Date.now()}.png`;
                  link.href = processedImage;
                  link.click();
                  logStudioAction("Resolution: Asset Downloaded", processedImage);
                }}
                style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '8px 16px', fontSize: '12px', background: 'rgba(0, 255, 255, 0.2)' }}
              >
                DOWNLOAD ASSET
              </button>
            </div>
          ) : (
            <p className="neon-text">NO OUTPUT GENERATED</p>
          )}
        </div>
      </div>
    </div>
  );
}