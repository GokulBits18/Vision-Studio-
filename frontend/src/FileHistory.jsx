import React, { useState, useEffect } from 'react';

// Keep your existing logStudioAction logic here
export const logStudioAction = (actionName, previewImage = null) => {
  const newItem = {
    id: Date.now(),
    action: actionName,
    image: previewImage,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  const existing = JSON.parse(sessionStorage.getItem('visionStudioHistory') || '[]');
  const updatedHistory = [newItem, ...existing].slice(0, 15);
  sessionStorage.setItem('visionStudioHistory', JSON.stringify(updatedHistory));
  window.dispatchEvent(new Event('historyUpdated'));
};

export default function FileHistory({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = () => {
      const saved = sessionStorage.getItem('visionStudioHistory');
      if (saved) setHistory(JSON.parse(saved));
    };
    loadHistory();
    window.addEventListener('historyUpdated', loadHistory);
    return () => window.removeEventListener('historyUpdated', loadHistory);
  }, [isOpen]);

  // Added Clear Function
  const clearHistory = () => {
    sessionStorage.removeItem('visionStudioHistory');
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
    }}>
      <div className="sci-fi-box" style={{ width: '80%', maxWidth: '800px', padding: '20px', border: '1px solid #00ffff', backgroundColor: '#050505', position: 'relative' }}>
        
        {/* HEADER: Close Button + Clear Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#00ffff', margin: 0 }}>SESSION ACTIVITY LOG</h3>
            
            <div>
                <button onClick={clearHistory} style={{ 
                    background: 'rgba(255, 0, 85, 0.2)', border: '1px solid #ff0055', 
                    color: '#ff0055', cursor: 'pointer', padding: '5px 15px', marginRight: '15px' 
                }}>
                    CLEAR SESSION
                </button>
                <button onClick={onClose} style={{ 
                    background: 'transparent', border: '1px solid #555', color: '#fff', 
                    cursor: 'pointer', padding: '5px 15px' 
                }}>
                    ✕
                </button>
            </div>
        </div>
        
        {/* LOG GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
          {history.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', width: '100%' }}>No activity detected in current session.</p>
          ) : history.map((item) => (
            <div key={item.id} style={{ background: '#111', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
              <div style={{ height: '80px', background: '#000', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? <img src={item.image} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}}/> : <span style={{fontSize:'20px'}}>⚙️</span>}
              </div>
              <div style={{fontSize:'11px', color:'#00ffff', fontWeight:'bold'}}>{item.action}</div>
              <div style={{fontSize:'9px', color:'#666', marginTop:'4px'}}>[{item.time}]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}