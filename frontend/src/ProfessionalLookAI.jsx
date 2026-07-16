import React, { useState, useRef } from 'react';
import { logStudioAction } from './FileHistory';

export default function ProfessionalLookAI() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setOriginalImage(preview);
    setProcessedImage(null);
    setIsProcessing(true);

    // Log the Upload
    logStudioAction("Professional Look: Uploaded", preview);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/studio-edit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.status === 'success') {
        setProcessedImage(data.image);
      
        logStudioAction("Professional Look: Headshot Generated", data.image);
      } else {
        alert("AI Generation failed: " + data.message);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div className="fade-in-up delay-1 sci-fi-box" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '20px', 
        marginBottom: '24px',
      }}>
        <div>
          <h3 className="neon-text" style={{ margin: 0 }}>Professional Look</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#55aaff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Initialize AI Corporate Headshot Protocol
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        <button 
          className="cyber-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={isProcessing}
        >
          {isProcessing ? "PROCESSING_AI_NODE..." : (originalImage ? "RE_UPLOAD_ASSET" : "UPLOAD_ASSET")}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: '60vh', minHeight: '400px', width: '100%' }}>
        
        <div className="fade-in-up delay-2" style={{ 
          flex: 1, 
          minWidth: 0, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '12px',
          border: '1px solid #333',
          borderRadius: '8px',
          backgroundColor: '#000',
          overflow: 'hidden'
        }}>
          {originalImage ? (
            <img src={originalImage} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p className="neon-text" style={{ margin: 0 }}>NO INPUT DATA</p>
              <p style={{ color: '#00FFFF', opacity: 0.5, fontSize: '12px', marginTop: '8px', letterSpacing: '1px' }}>WAITING FOR ASSET</p>
            </div>
          )}
        </div>

        <div className="fade-in-up delay-3" style={{ 
          flex: 1, 
          minWidth: 0, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '12px',
          border: '1px solid #333',
          borderRadius: '8px',
          backgroundColor: '#000',
          overflow: 'hidden'
        }}>
          {isProcessing ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                border: '3px solid rgba(0,255,255,0.1)', 
                borderTop: '3px solid #00FFFF', 
                borderRight: '3px solid #00FFFF',
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                animation: 'spin 1s linear infinite', 
                margin: '0 auto 16px',
                boxShadow: '0 0 15px rgba(0,255,255,0.5)'
              }}></div>
              <p className="neon-text">GENERATING MESH...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : processedImage ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={processedImage} alt="Enhanced" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
              <button 
                className="cyber-btn"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `vision_pro_look_${Date.now()}.png`;
                  link.href = processedImage;
                  link.click();
                  
                  logStudioAction("Professional Look: Asset Downloaded", processedImage);
                }}
                style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '8px 16px', fontSize: '12px', background: 'rgba(0, 255, 255, 0.2)' }}
              >
                DOWNLOAD ASSET
              </button>
            </div>
          ) : (
             <div style={{ textAlign: 'center' }}>
               <p className="neon-text" style={{ margin: 0 }}>OUTPUT OFFLINE</p>
               <p style={{ color: '#00FFFF', opacity: 0.5, fontSize: '12px', marginTop: '8px', letterSpacing: '1px' }}>AWAITING GENERATION</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}