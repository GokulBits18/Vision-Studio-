import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { logStudioAction } from './FileHistory';

export default function HandGestureCanvas() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [activeColor, setActiveColor] = useState('#00FFFF'); 
  const [isYoloActive, setIsYoloActive] = useState(false);
  const [yoloStatus, setYoloStatus] = useState('STANDBY');
  
  const colorRef = useRef(activeColor);
  const yoloRef = useRef(isYoloActive);
  const wsRef = useRef(null);
  const yoloBoxesRef = useRef([]);

  useEffect(() => { colorRef.current = activeColor; }, [activeColor]);
  useEffect(() => { yoloRef.current = isYoloActive; }, [isYoloActive]);

  const strokesRef = useRef([{ color: '#00FFFF', points: [] }]);
  const lastClearTime = useRef(0); 
  const availableColors = ['#00FFFF', '#ff5252', '#448aff', '#ffeb3b', '#ffffff'];

  // --- WEBSOCKET YOLO CONNECTION ---
  useEffect(() => {
    if (isYoloActive) {
      setYoloStatus('CONNECTING...');
      wsRef.current = new WebSocket('ws://127.0.0.1:8000/api/ws/yolo');
      
      wsRef.current.onopen = () => {
        setYoloStatus('CONNECTED - RADAR ACTIVE');
      };

      wsRef.current.onmessage = (event) => {
        try {
          yoloBoxesRef.current = JSON.parse(event.data);
        } catch (e) {}
      };

      wsRef.current.onerror = () => {
        setYoloStatus('ERROR: SERVER OFFLINE');
        setIsYoloActive(false);
      };

      wsRef.current.onclose = () => {
        if (yoloRef.current) {
          setYoloStatus('CONNECTION DROPPED');
          setIsYoloActive(false);
        }
      };

      const sendFrame = setInterval(() => {
        if (webcamRef.current?.video && wsRef.current?.readyState === WebSocket.OPEN) {
          const video = webcamRef.current.video;
          if (video.videoWidth === 0) return; 

          const captureCanvas = document.createElement('canvas');
          captureCanvas.width = video.videoWidth;
          captureCanvas.height = video.videoHeight;
          const ctx = captureCanvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          const base64Frame = captureCanvas.toDataURL('image/jpeg', 0.5);
          wsRef.current.send(base64Frame);
        }
      }, 150);

      return () => {
        clearInterval(sendFrame);
        if (wsRef.current) wsRef.current.close();
        yoloBoxesRef.current = [];
        setYoloStatus('STANDBY');
      };
    } else {
      if (wsRef.current) wsRef.current.close();
      yoloBoxesRef.current = [];
      setYoloStatus('STANDBY');
    }
  }, [isYoloActive]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `vision_studio_export_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    logStudioAction("Air Canvas: Asset Downloaded", dataUrl);
  };

  const handleClearCanvas = () => {
    strokesRef.current = [{ color: colorRef.current, points: [] }];
    
    logStudioAction("Air Canvas: Canvas Cleared");
  };

  const toggleYolo = () => {
    const newState = !isYoloActive;
    setIsYoloActive(newState);
    
    logStudioAction(newState ? "Air Canvas: YOLO Radar Activated" : "Air Canvas: YOLO Radar Disabled");
  };

  // --- MAIN MEDIAPIPE LOOP ---
  useEffect(() => {
    const Hands = window.Hands;
    const Camera = window.Camera;
    if (!Hands || !Camera) return;

    const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });

    hands.onResults((results) => {
      if (!webcamRef.current?.video || !canvasRef.current) return;

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const ctx = canvasRef.current.getContext('2d');

      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(results.image, 0, 0, videoWidth, videoHeight);
      ctx.restore();

      if (yoloBoxesRef.current && yoloBoxesRef.current.length > 0) {
        yoloBoxesRef.current.forEach(box => {
          const mirroredX = videoWidth - box.x - box.w;
          
          ctx.beginPath();
          ctx.rect(mirroredX, box.y, box.w, box.h);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#00FFFF';
          ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#00FFFF';
          ctx.font = 'bold 16px Inter';
          const label = `${box.class.toUpperCase()} [${Math.round(box.score * 100)}%]`;
          
          ctx.fillRect(mirroredX, box.y > 25 ? box.y - 25 : 0, ctx.measureText(label).width + 10, 25);
          ctx.fillStyle = '#000000';
          ctx.fillText(label, mirroredX + 5, box.y > 25 ? box.y - 8 : 18);
        });
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, videoWidth, 70); 
      const zoneWidth = videoWidth / 6; 

      availableColors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(zoneWidth * i + zoneWidth / 2, 35, 20, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        if (colorRef.current === color) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#fff";
          ctx.stroke();
        }
      });
      ctx.fillStyle = "#ff5252";
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CLEAR", zoneWidth * 5 + zoneWidth / 2, 40);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];
        const indexKnuckle = landmarks[6];
        const middleTip = landmarks[12];
        const middleKnuckle = landmarks[10];

        const x = (1 - indexTip.x) * videoWidth;
        const y = indexTip.y * videoHeight;
        const isIndexUp = indexTip.y < indexKnuckle.y;
        const isMiddleUp = middleTip.y < middleKnuckle.y;

        if (isIndexUp && isMiddleUp) {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, 2 * Math.PI);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "#00FFFF";
          ctx.fill();

          if (y < 70) {
            let newColor = colorRef.current;
            if (x < zoneWidth) newColor = availableColors[0];
            else if (x < zoneWidth * 2) newColor = availableColors[1];
            else if (x < zoneWidth * 3) newColor = availableColors[2];
            else if (x < zoneWidth * 4) newColor = availableColors[3];
            else if (x < zoneWidth * 5) newColor = availableColors[4];
            else {
              const now = Date.now();
              if (now - lastClearTime.current > 1000) { 
                handleClearCanvas();
                lastClearTime.current = now;
              }
            }
            if (newColor !== colorRef.current && x < zoneWidth * 5) {
              setActiveColor(newColor);
              strokesRef.current.push({ color: newColor, points: [] });
            }
          }
          const lastStroke = strokesRef.current[strokesRef.current.length - 1];
          if (lastStroke.points.length > 0) {
            strokesRef.current.push({ color: colorRef.current, points: [] });
          }
        } else if (isIndexUp && !isMiddleUp) {
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = colorRef.current;
          ctx.fill();

          if (y > 70) {
            const currentStroke = strokesRef.current[strokesRef.current.length - 1];
            currentStroke.points.push({ x, y });
          }
        }
      }

      strokesRef.current.forEach(stroke => {
        if (stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = 6;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }
      });
    });

    const camera = new Camera(webcamRef.current.video, {
      onFrame: async () => {
        if (webcamRef.current?.video) await hands.send({ image: webcamRef.current.video });
      },
      width: 640,
      height: 480
    });
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  return (
    <div className="fade-in-up delay-1" style={{ 
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

      <div style={{ position: 'absolute', top: '80px', right: '20px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', border: '1px solid #333' }}>
        <p style={{ margin: 0, fontSize: '12px', color: yoloStatus.includes('CONNECTED') ? '#00FFFF' : '#ff5252' }}>
          RADAR STATUS: {yoloStatus}
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        <button 
          className="cyber-btn"
          onClick={toggleYolo}
          style={{ padding: '8px 16px', fontSize: '12px', borderColor: isYoloActive ? '#ff5252' : '#00FFFF', color: isYoloActive ? '#ff5252' : '#00FFFF', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          {isYoloActive ? 'DISABLE YOLO RADAR' : 'ACTIVATE YOLO RADAR'}
        </button>

        <button 
          className="cyber-btn"
          onClick={handleDownload}
          style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(0, 255, 255, 0.2)' }}
        >
          DOWNLOAD ASSET
        </button>
      </div>
    </div>
  );
}