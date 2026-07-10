import React, { useState, useEffect } from 'react';
import ThreatMap from './components/ThreatMap';
import CyberTerminal from './components/CyberTerminal';
import NetworkVisualizer from './components/NetworkVisualizer';
import SystemMonitor from './components/SystemMonitor';
import soundManager from './utils/SoundManager';

const NEWS_TICKER_ITEMS = [
  '>> [INTEGRITY] Mainframe firewall status stabilized at 94.2%...',
  '>> [THREAT] Isolated DDoS vector targeted on Frankfurt nodes (BLOCKED)...',
  '>> [SYSTEM] Operator authenticated. Credentials decrypted successfully...',
  '>> [OVERWATCH] High threat SQL injection trace originating from Berlin Sector has been sanitized...',
  '>> [NET] Node propagation speed optimized. Latency reduced to 4ms...',
  '>> [ALERT] Quantum decryption buffer threshold reached 90% in backup sectors...'
];

export default function App() {
  const [theme, setTheme] = useState('cyan');
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'neural'
  const [tickerIndex, setTickerIndex] = useState(0);

  // Initialize SoundManager with default mute state
  useEffect(() => {
    // SoundManager is muted by default until user interacts
    if (!isMuted) {
      soundManager.init();
      soundManager.playSuccess();
    }
  }, [isMuted]);

  // News ticker interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % NEWS_TICKER_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    soundManager.playClick();
  };

  const handleMuteToggle = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundManager.init();
      soundManager.playSuccess();
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      
      {/* CRT Overlay screensaver styling */}
      <div className="crt-overlay" />
      <div className="crt-scanlines" />

      {/* Header bar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 20px', 
        background: 'rgba(0, 10, 20, 0.85)', 
        borderBottom: '2px solid var(--primary)',
        boxShadow: '0 0 15px var(--primary-glow)',
        zIndex: 50
      }}>
        
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="glitch-text" style={{ 
            fontFamily: '"Orbitron", sans-serif', 
            fontSize: '18px', 
            fontWeight: '900', 
            color: 'var(--primary)',
            letterSpacing: '2px'
          }}>
            CYBER-NEXUS // CSOC
          </div>
          <span style={{ 
            fontSize: '9px', 
            background: 'rgba(57, 255, 20, 0.15)', 
            color: '#39ff14', 
            padding: '2px 8px', 
            borderRadius: '2px',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            letterSpacing: '1px'
          }}>
            COGNITIVE CORE ONLINE
          </span>
        </div>

        {/* HUD control actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* Tab selector */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '2px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              className="neon-btn"
              onClick={() => { setActiveTab('dashboard'); soundManager.playClick(); }}
              style={{ 
                border: 'none', 
                background: activeTab === 'dashboard' ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                color: activeTab === 'dashboard' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                padding: '4px 10px',
                fontSize: '10px'
              }}
            >
              System Overview
            </button>
            <button 
              className="neon-btn"
              onClick={() => { setActiveTab('neural'); soundManager.playClick(); }}
              style={{ 
                border: 'none', 
                background: activeTab === 'neural' ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                color: activeTab === 'neural' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                padding: '4px 10px',
                fontSize: '10px'
              }}
            >
              Neural Core
            </button>
          </div>

          {/* Theme selection panel */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div 
              onClick={() => changeTheme('cyan')} 
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00f0ff', cursor: 'pointer', border: theme === 'cyan' ? '2px solid #fff' : 'none' }}
              title="Cyan Cyber"
            />
            <div 
              onClick={() => changeTheme('crimson')} 
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff0055', cursor: 'pointer', border: theme === 'crimson' ? '2px solid #fff' : 'none' }}
              title="Crimson Threat"
            />
            <div 
              onClick={() => changeTheme('acid')} 
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#39ff14', cursor: 'pointer', border: theme === 'acid' ? '2px solid #fff' : 'none' }}
              title="Acid Matrix"
            />
            <div 
              onClick={() => changeTheme('obsidian')} 
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#c5a059', cursor: 'pointer', border: theme === 'obsidian' ? '2px solid #fff' : 'none' }}
              title="Obsidian Gold"
            />
          </div>

          {/* Audio controller button */}
          <button 
            className="neon-btn"
            onClick={handleMuteToggle}
            style={{ 
              borderColor: isMuted ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
              color: isMuted ? 'rgba(255,255,255,0.4)' : 'var(--primary)'
            }}
          >
            {isMuted ? '🔊 SOUND: MUTED' : '🔊 SOUND: ACTIVE'}
          </button>
        </div>

      </header>

      {/* Main dashboard content panel */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'dashboard' ? (
          <div className="dashboard-grid">
            
            {/* Sector A: Threat simulation globe */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
              <ThreatMap />
            </div>

            {/* Sector B: Terminal shell console */}
            <div>
              <CyberTerminal />
            </div>

            {/* Sector C: System core details monitor */}
            <div>
              <SystemMonitor />
            </div>

          </div>
        ) : (
          <div style={{ padding: '15px', height: 'calc(100vh - 100px)' }}>
            <NetworkVisualizer />
          </div>
        )}
      </main>

      {/* Footer System Ticker bar */}
      <footer style={{ 
        height: '30px', 
        background: 'rgba(0,5,10,0.95)', 
        borderTop: '1px solid var(--primary-glow)',
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 20px',
        zIndex: 50,
        fontFamily: '"Share Tech Mono", monospace',
        fontSize: '11px'
      }}>
        <div style={{ color: 'var(--primary)', textShadow: '0 0 4px var(--primary-glow)', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', marginRight: '8px' }}>⚡</span>
          {NEWS_TICKER_ITEMS[tickerIndex]}
        </div>
      </footer>

    </div>
  );
}
