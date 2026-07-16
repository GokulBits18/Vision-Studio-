import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { logStudioAction } from './FileHistory';

export default function AIFilters() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Single memory canvas for the filter stream
  const filterCaptureRef = useRef(document.createElement('canvas'));
  
  const [activeFilter, setActiveFilter] = useState('none');
  const [filterStatus, setFilterStatus] = useState('CONNECTING...');
  
  const activeFilterRef = useRef(activeFilter);
  const filterWsRef = useRef(null);

  useEffect(() => { activeFilterRef.current = activeFilter; }, [activeFilter]);

  const filters = [
    { id: 'none', label: 'NORMAL' },
    { id: 'pencil', label: 'SKETCH' },
    { id: 'neo_edges', label: 'NEON' },
    { id: 'bg_blur', label: 'BLUR BG' },
    { id: 'vintage', label: 'VINTAGE' },
    { id: 'bw_film', label: 'B&W FILM' }
  ];

  // --- WEBSOCKET: LIVE FILTERS ---
  useEffect(() => {
    filterWsRef.current = new WebSocket('ws://127.0.0.1:8000/ws/live-sketch');
    
    const sendFilterFrame = () => {
      if (!filterWsRef.current || filterWsRef.current.readyState !== WebSocket.OPEN) return;

      const video = webcamRef.current?.video;
      
      if (!video || video.readyState !== 4 || video.videoWidth === 0) {
        setTimeout(sendFilterFrame, 100);
        return;
      }

      const captureCanvas = filterCaptureRef.current;
      captureCanvas.width = video.videoWidth;
      captureCanvas.height = video.videoHeight;
      captureCanvas.getContext('2d', { willReadFrequently: true }).drawImage(video, 0, 0);
      
      const base64Frame = captureCanvas.toDataURL('image/jpeg', 0.5);
      
      filterWsRef.current.send(JSON.stringify({
        filter: activeFilterRef.current,
        image: base64Frame
      }));
    };

    filterWsRef.current.onopen = () => {
      setFilterStatus('STREAM ACTIVE');
      sendFilterFrame();
    };
    
    filterWsRef.current.onerror = () => setFilterStatus('SERVER ERROR');
    filterWsRef.current.onclose = () => setFilterStatus('DISCONNECTED');

    filterWsRef.current.onmessage = (event) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();

        requestAnimationFrame(sendFilterFrame); 
      };
      img.src = event.data;
    };

    return () => {
      if (filterWsRef.current) filterWsRef.current.close();
    };
  }, []); 

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `vision_filter_${activeFilter}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    // Log the download action with the thumbnail
    logStudioAction(`Filter Asset Downloaded: ${activeFilter}`, dataUrl);
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <div className="fade-in-up delay-1 sci-fi-box" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 className="neon-text" style={{ margin: '0 0 16px 0' }}>Live Engine Filters</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.id}
              className="cyber-btn"
              onClick={() => {
                setActiveFilter(f.id);
                // Log the filter change
                logStudioAction(`Filter Applied: ${f.label}`);
              }}
              style={{
                background: activeFilter === f.id ? '#00FFFF' : 'rgba(0, 255, 255, 0.1)',
                color: activeFilter === f.id ? '#000' : '#00FFFF',
                padding: '8px 16px',
                fontSize: '12px'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fade-in-up delay-2" style={{ 
        position: 'relative', 
        width: '100%',
        maxWidth: '640px',
        aspectRatio: '4/3', 
        margin: '0 auto', 
        overflow: 'hidden',
        border: '1px solid #333',
        borderRadius: '8px',
        backgroundColor: '#000'
      }}>
        <Webcam ref={webcamRef} style={{ display: 'none' }} width={640} height={480} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />

        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', border: '1px solid #333' }}>
            <p style={{ margin: 0, fontSize: '10px', color: filterStatus.includes('ACTIVE') ? '#00FFFF' : '#ff5252', letterSpacing: '1px' }}>
              FILTER: {filterStatus}
            </p>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', zIndex: 20 }}>
          <button 
            className="cyber-btn"
            onClick={handleDownload}
            style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(0, 255, 255, 0.2)' }}
          >
            DOWNLOAD ASSET
          </button>
        </div>
      </div>
    </div>
  );
}