import React, { useState, useEffect } from 'react';

export default function ClickSplash() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseClick = (e) => {
      const newParticle = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      
      setParticles((prev) => [...prev, newParticle]);
      
      // Remove particle after 600ms
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 600);
    };

    window.addEventListener('click', handleMouseClick);
    return () => window.removeEventListener('click', handleMouseClick);
  }, []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="splash-particle"
          style={{
            position: 'fixed',
            left: p.x - 25,
            top: p.y - 25,
            width: '30px',
            height: '30px',
            border: '2px solid #00ffff',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'splash-anim 0.6s ease-out forwards',
            zIndex: 9999
          }}
        />
      ))}
      <style>{`
        @keyframes splash-anim {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}