import React, { useState } from 'react';
import HandGestureCanvas from './HandGestureCanvas';
import AIFilters from './AIFilters'; 
import SmartImageEditor from './SmartImageEditor';
import ProfessionalLookAI from './ProfessionalLookAI';
import ResolutionEngine from './ResolutionEngine';
import SmartOCR from './SmartOCR';
import FileHistory from './FileHistory';
import ClickSplash from './ClickSplash'; 
import './App.css'; 

export default function App() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [showHistory, setShowHistory] = useState(false);

  const tabs = [
    { id: 'canvas', label: 'Air Canvas', icon: '' },
    { id: 'filters', label: 'Live Filters', icon: '' },
    { id: 'smart', label: 'Smart Editor', icon: '' },
    { id: 'professional', label: 'Professional Look', icon: '' },
    { id: 'resolution', label: '4K Engine', icon: '' },
    { id: 'ocr', label: 'Smart OCR', icon: '' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'canvas': return <HandGestureCanvas />;
      case 'filters': return <AIFilters />;
      case 'smart': return <SmartImageEditor />;
      case 'professional': return <ProfessionalLookAI />;
      case 'resolution': return <ResolutionEngine />;
      case 'ocr': return <SmartOCR />;
      default: return <HandGestureCanvas />;
    }
  };

  return (
    <div className="app-layout">
      {/* GLOBAL SPLASH EFFECT: Renders globally over the app */}
      <ClickSplash />

      <nav className="top-nav">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="logo-icon"></span>
          <h1> Vision Studio </h1>
        </div>
        
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          {/* HISTORY TRIGGER: Positioned to the right of Smart OCR */}
          <button 
            onClick={() => setShowHistory(true)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#00ffff', 
              fontSize: '24px', 
              cursor: 'pointer', 
              marginLeft: '20px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Session Activity Center"
          >
            ⋮
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
        
        {/* History Modal Overlay */}
        <FileHistory 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
        />
      </main>
    </div>
  );
}