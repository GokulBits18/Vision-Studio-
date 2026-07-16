import React, { useState, useRef } from 'react';
import { logStudioAction } from './FileHistory';

export default function SmartImageEditor() {
  const [smartImage, setSmartImage] = useState(null);
  const [smartProcessed, setSmartProcessed] = useState(null);
  const [smartFile, setSmartFile] = useState(null);
  const [isSmartProcessing, setIsSmartProcessing] = useState(false);
  
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [isolateSubject, setIsolateSubject] = useState(true);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setSmartFile(file);
      setSmartImage(preview);
      setSmartProcessed(null);
      // Log the upload
      logStudioAction("Smart Editor: Uploaded", preview);
    }
  };

  const processSmartEdit = async () => {
    if (!smartFile) return;
    setIsSmartProcessing(true);

    const formData = new FormData();
    formData.append('file', smartFile);
    formData.append('auto_enhance', autoEnhance);
    formData.append('isolate_subject', isolateSubject);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/smart-edit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.status === 'success') {
        setSmartProcessed(data.image);
        // Log the successful processing
        logStudioAction("Smart Editor: Processed", data.image);
      } else {
        alert("Smart processing failed: " + data.message);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsSmartProcessing(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Sleek Control Toolbar - Corrected single container */}
      <div className="fade-in-up delay-1" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'rgba(20, 20, 20, 0.8)', 
        padding: '20px', 
        borderRadius: '0 0 16px 16px', 
        marginBottom: '24px',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #00ffff', 
        boxShadow: '0 4px 20px rgba(0, 255, 255, 0.05)'
      }}>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{
            background: '#00FFFF',
            color: '#000000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.2s',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
          }}
        >
          {smartImage ? "Change Photo" : "Upload Photo"}
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setAutoEnhance(!autoEnhance)}
            style={{
              background: autoEnhance ? 'rgba(0, 255, 255, 0.15)' : '#111',
              color: autoEnhance ? '#00FFFF' : '#888',
              border: `2px solid ${autoEnhance ? '#00FFFF' : '#444'}`,
              padding: '10px 20px',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
             Auto-Enhance
          </button>

          <button 
            onClick={() => setIsolateSubject(!isolateSubject)}
            style={{
              background: isolateSubject ? 'rgba(0, 255, 255, 0.15)' : '#111',
              color: isolateSubject ? '#00FFFF' : '#888',
              border: `2px solid ${isolateSubject ? '#00FFFF' : '#444'}`,
              padding: '10px 20px',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
             Isolate Subject
          </button>
        </div>

        <button 
          className={isSmartProcessing ? "pulsing-glow" : ""}
          onClick={processSmartEdit}
          disabled={!smartFile || isSmartProcessing}
          style={{
            background: !smartFile ? '#222' : isSmartProcessing ? '#00b3b3' : '#00FFFF',
            color: !smartFile ? '#666' : '#000000',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: !smartFile || isSmartProcessing ? 'not-allowed' : 'pointer',
            opacity: isSmartProcessing ? 0.7 : 1,
            transition: '0.2s',
            boxShadow: smartFile && !isSmartProcessing ? '0 0 15px rgba(0, 255, 255, 0.4)' : 'none'
          }}
        >
          {isSmartProcessing ? "Processing..." : "Generate "}
        </button>
      </div>

      {/* Before / After Image Grid */}
      <div style={{ display: 'flex', gap: '24px', height: '60vh', minHeight: '400px', width: '100%' }}>
        
        <div className="fade-in-up delay-2 image-container-hover" style={{ 
          flex: 1, 
          minWidth: 0, 
          minHeight: 0, 
          background: '#0a0a0a', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #222',
          padding: '12px'
        }}>
          {smartImage ? (
            <img src={smartImage} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          ) : (
            <p style={{ color: '#444', fontWeight: 'bold' }}>Original Photo</p>
          )}
        </div>

        <div className="fade-in-up delay-3 image-container-hover" style={{ 
          flex: 1, 
          minWidth: 0, 
          minHeight: 0, 
          background: '#0a0a0a',
          backgroundImage: isolateSubject && smartProcessed ? 'repeating-linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), repeating-linear-gradient(45deg, #1a1a1a 25%, #0a0a0a 25%, #0a0a0a 75%, #1a1a1a 75%, #1a1a1a)' : 'none',
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px',
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #222',
          padding: '12px'
        }}>
          {smartProcessed ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={smartProcessed} alt="Enhanced" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              <button 
                className="cyber-btn"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `vision_smart_edit_${Date.now()}.png`;
                  link.href = smartProcessed;
                  link.click();
                  
                  logStudioAction("Smart Editor: Asset Downloaded", smartProcessed);
                }}
                style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '8px 16px', fontSize: '12px', background: 'rgba(0, 255, 255, 0.2)' }}
              >
                DOWNLOAD ASSET
              </button>
            </div>
          ) : (
            <p style={{ color: '#444', fontWeight: 'bold' }}>Enhanced Result</p>
          )}
        </div>

      </div>
    </div>
  );
}