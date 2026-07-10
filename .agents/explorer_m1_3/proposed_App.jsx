import React, { useState, useEffect } from 'react';
import CyberMesh from './components/CyberMesh';
import CyberTerminal from './components/CyberTerminal';
import NetworkVisualizer from './components/NetworkVisualizer';
import soundManager from './utils/SoundManager';
import { useWebGL } from './context/WebGLContext'; // Import hook

const NEWS_TICKER_ITEMS = [
  '>> [SYSTEM] Synaptic Overdrive protocol initialized successfully...',
  '>> [INTEGRITY] Consciousness Firewall active. Core security metrics: nominal...',
  '>> [TECH] Quantum neural implants now available for batch integration...',
  '>> [ALERT] Security mainframe firmware updated to version 9.42...'
];

export default function App() {
  // Use global WebGL context theme management
  const { theme, setTheme } = useWebGL();
  const [isMuted, setIsMuted] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Initialize sounds on interaction
  useEffect(() => {
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
    // WebGLProvider's setTheme manages theme state, data-attribute, and sound feedback
    setTheme(newTheme);
  };

  const handleMuteToggle = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundManager.init();
      soundManager.playSuccess();
    }
  };

  const handleCtaClick = () => {
    soundManager.playScan();
    document.getElementById('specs-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100vw', background: 'var(--bg-dark)' }}>
      {/* CRT screen filters */}
      <div className="crt-overlay" />
      <div className="crt-scanlines" />

      {/* Decorative ambient glowing orbs */}
      <div className="mesh-glow-orb" style={{ top: '10%', left: '5%', width: '400px', height: '400px' }} />
      <div className="mesh-glow-orb" style={{ top: '60%', right: '5%', width: '500px', height: '500px', opacity: 0.5 }} />

      {/* Sticky Blur Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 5%',
        background: 'rgba(2, 5, 10, 0.65)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '900', letterSpacing: '2px', fontFamily: 'var(--font-title)' }}>
            CYBER-NEXUS
          </span>
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', gap: '20px' }}>
          <a href="#hero-section" onClick={() => soundManager.playHover()} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Core</a>
          <a href="#specs-section" onClick={() => soundManager.playHover()} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Specs</a>
          <a href="#terminal-section" onClick={() => soundManager.playHover()} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Shell</a>
          <a href="#neural-section" onClick={() => soundManager.playHover()} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Synapse</a>
        </nav>

        {/* Configurations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Theme switcher */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div onClick={() => changeTheme('cyan')} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00f0ff', cursor: 'pointer', border: theme === 'cyan' ? '2px solid #fff' : 'none' }} title="Cyan Cyber" />
            <div onClick={() => changeTheme('crimson')} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff0055', cursor: 'pointer', border: theme === 'crimson' ? '2px solid #fff' : 'none' }} title="Crimson Threat" />
            <div onClick={() => changeTheme('acid')} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#39ff14', cursor: 'pointer', border: theme === 'acid' ? '2px solid #fff' : 'none' }} title="Acid Matrix" />
            <div onClick={() => changeTheme('obsidian')} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#c5a059', cursor: 'pointer', border: theme === 'obsidian' ? '2px solid #fff' : 'none' }} title="Obsidian Gold" />
          </div>

          {/* Sound controller */}
          <button className="neon-btn" onClick={handleMuteToggle} style={{ fontSize: '10px', padding: '4px 10px' }}>
            {isMuted ? '🔊 SOUND: OFF' : '🔊 SOUND: ON'}
          </button>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section id="hero-section" style={{ height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
        {/* CyberMesh will now hook into the global WebGL scene instead of rendering standard 2D canvas context */}
        <CyberMesh />

        <div style={{ zIndex: 10, maxWidth: '800px', padding: '0 20px' }}>
          <div className="psy-subtitle">Neuromorphic Integration Protocol</div>
          <h1 className="psy-title" style={{ fontSize: '4rem', textShadow: '0 0 20px var(--primary-glow)' }}>
            Elevate Your Consciousness
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px', marginBottom: '35px', maxWidth: '600px', margin: '0 auto 35px' }}>
            Interfacing direct-to-cortex quantum augmentations. Forge virtual realities, lock down neural gateways, and synchronize your mind with the digital synapse net.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="psy-btn" onClick={handleCtaClick}>Initialize Sync</button>
            <a href="#specs-section" className="psy-btn-secondary" style={{ textDecoration: 'none', lineHeight: '1.6' }} onClick={() => soundManager.playHover()}>Explore Specs</a>
          </div>
        </div>
      </section>

      {/* SECTION 2: SPECS CATALOG */}
      <section id="specs-section" style={{ minHeight: '100vh', background: 'rgba(2, 5, 10, 0.95)', borderTop: '1px solid rgba(0,240,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', zIndex: 10 }}>
          <div className="psy-subtitle">// COGNITIVE HARNESS HARDWARE</div>
          <h2 className="psy-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Neural Augmentations</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '40px' }}>
            Browse state-of-the-art cyberware implants configured for cognitive operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            {/* Card 1 */}
            <div className="psy-card">
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>🧠</div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: 'var(--primary)', marginBottom: '12px' }}>Cerebral Clock Overclocker</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '13.5px' }}>
                Accelerates synaptic connection speeds by 450%, enabling frame-by-frame situational decryption in high-stress digital operations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="psy-card">
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>👁️</div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: 'var(--primary)', marginBottom: '12px' }}>Ocular Sensory Matrix</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '13.5px' }}>
                Injects direct tactical HUD telemetry onto visual synapses. Supports real-time decryption codes, vector traces, and sub-channel data streams.
              </p>
            </div>

            {/* Card 3 */}
            <div className="psy-card">
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>🛡️</div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: 'var(--primary)', marginBottom: '12px' }}>Synaptic Consciousness Firewall</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '13.5px' }}>
                Secures consciousness against invasive intrusion attacks. Employs quantum encryption protocols to shield neural nodes from memory manipulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE SHELL */}
      <section id="terminal-section" style={{ minHeight: '100vh', background: 'rgba(2, 5, 10, 0.98)', borderTop: '1px solid rgba(0,240,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', height: '520px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div className="psy-subtitle">// COGNITIVE MAINFRAME INTERFACES</div>
          <h2 className="psy-title" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Nexus Command Deck</h2>
          
          <div style={{ flex: 1 }}>
            <CyberTerminal />
          </div>
        </div>
      </section>

      {/* SECTION 4: NEURAL BRIDGE */}
      <section id="neural-section" style={{ minHeight: '100vh', background: 'rgba(2, 5, 10, 0.95)', borderTop: '1px solid rgba(0,240,255,0.05)', paddingBottom: '120px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', height: '520px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div className="psy-subtitle">// SYNAPTIC STIMULATION BRIDGES</div>
          <h2 className="psy-title" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Neural Net Overload</h2>
          
          <div style={{ flex: 1 }}>
            <NetworkVisualizer />
          </div>
        </div>
      </section>

      {/* Footer System Ticker */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '30px',
        background: 'rgba(1, 3, 6, 0.98)',
        borderTop: '1px solid rgba(0, 240, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        zIndex: 100,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px'
      }}>
        <div style={{ color: 'var(--primary)', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-block', marginRight: '8px' }}>⚡ STATUS FEED:</span>
          {NEWS_TICKER_ITEMS[tickerIndex]}
        </div>
      </footer>
    </div>
  );
}
