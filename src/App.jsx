import React, { useState, useEffect, useRef, useCallback } from 'react';
import ParticleCyberSpace from './components/ParticleCyberSpace';
import CyberTerminal from './components/CyberTerminal';
import NetworkVisualizer from './components/NetworkVisualizer';
import soundManager from './utils/SoundManager';
import useWebGL from './hooks/useWebGL';

/* ═══════ MARQUEE DATA ═══════ */
const MARQUEE_WORDS = [
  'NEURAL OVERRIDE', '◆', 'QUANTUM BREACH', '◆', 'SYNAPTIC PULSE', '◆',
  'GHOST PROTOCOL', '◆', 'DATA EXFILTRATION', '◆', 'CORTEX HIJACK', '◆',
  'NEON SIGNAL', '◆', 'ZERO DAY', '◆', 'DEEP NET', '◆', 'SYNTHETIC MIND', '◆',
];

const MARQUEE_WORDS_2 = [
  'サイバースペース', '◆', 'ニューロマンサー', '◆', 'デジタル幻想', '◆',
  'CYBER NEXUS', '◆', '量子意識', '◆', 'DIGITAL DREAM', '◆',
  'ゴーストシェル', '◆', 'VOID RUNNER', '◆', '電脳空間', '◆', 'NEON DRIFT', '◆',
];

/* ═══════ STATS DATA ═══════ */
const STATS = [
  { value: 99.97, suffix: '%', label: 'UPTIME INTEGRITY' },
  { value: 2.4, suffix: 'M', label: 'THREATS NEUTRALIZED' },
  { value: 0.003, suffix: 'ms', label: 'RESPONSE LATENCY' },
  { value: 847, suffix: 'K', label: 'ACTIVE NEURAL LINKS' },
];

/* ═══════ FEATURES ═══════ */
const FEATURES = [
  {
    icon: '⟁',
    title: 'Quantum Neural Gateway',
    desc: 'Direct cortex-to-cloud interfacing through quantum-encrypted synaptic bridges. Zero-latency consciousness streaming across distributed neural meshes.',
  },
  {
    icon: '⎔',
    title: 'Holographic Memory Vault',
    desc: 'Fractalized data storage using photonic crystal lattices. Infinite-density memory banks secured by consciousness-locked biometric encryption.',
  },
  {
    icon: '◈',
    title: 'Synthetic Perception Engine',
    desc: 'Multi-spectrum sensory augmentation delivering hyper-real digital synesthesia. See data as color, hear algorithms as music.',
  },
  {
    icon: '⬡',
    title: 'Adaptive Threat Matrix',
    desc: 'Self-evolving defense protocols using adversarial neural networks. Predicts and neutralizes attack vectors before manifestation.',
  },
  {
    icon: '◉',
    title: 'Consciousness Firewall',
    desc: 'Military-grade psychic shielding against memetic intrusion and social engineering at the neural substrate level.',
  },
  {
    icon: '⏣',
    title: 'Digital Rebirth Protocol',
    desc: 'Full consciousness backup and restore capability. Survive any digital death through quantum-state preservation.',
  },
];

/* ═══════ TYPEWRITER HOOK ═══════ */
function useTypewriter(strings, typingSpeed = 60, deletingSpeed = 30, pauseTime = 2500) {
  const [displayed, setDisplayed] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = strings[currentIndex];
    let timeout;

    if (!isDeleting && displayed === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % strings.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayed(current.substring(0, displayed.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentIndex, strings, typingSpeed, deletingSpeed, pauseTime]);

  return displayed;
}

/* ═══════ COUNTER HOOK ═══════ */
function useCountUp(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return { count, ref };
}

/* ═══════ STAT COUNTER COMPONENT ═══════ */
function StatCounter({ value, suffix, label }) {
  const { count, ref } = useCountUp(value, 2000);
  const decimals = value % 1 !== 0 ? (value < 1 ? 3 : 1) : 0;

  return (
    <div className="stat-counter" ref={ref}>
      <div className="value">
        {count.toFixed(decimals)}<span style={{ fontSize: '0.5em', opacity: 0.7 }}>{suffix}</span>
      </div>
      <div className="label">{label}</div>
    </div>
  );
}

/* ═══════ MARQUEE COMPONENT ═══════ */
function MarqueeStrip({ words, reverse = false }) {
  return (
    <div className={`marquee-strip ${reverse ? 'marquee-strip-reverse' : ''}`}>
      <div className="marquee-content">
        {[...words, ...words].map((word, i) => (
          <span key={i} className={i % 4 === 0 ? 'filled' : ''}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════ MAIN APP ═══════ */
export default function App() {
  const { activeTheme: theme, changeTheme } = useWebGL();
  const [isMuted, setIsMuted] = useState(true);

  const heroSubtitles = [
    'We are the architects of digital consciousness.',
    'Where neural pathways meet quantum encryption.',
    'Transcend the boundary between mind and machine.',
    'Enter the void. Emerge enhanced.',
  ];
  const typed = useTypewriter(heroSubtitles, 50, 25, 3000);

  useEffect(() => {
    if (!isMuted) {
      soundManager.init();
      soundManager.playSuccess();
    }
  }, [isMuted]);

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
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100vw', background: 'var(--bg-dark)' }}>
      {/* Global overlays */}
      <div className="noise-overlay" />
      <div className="crt-overlay" />
      <div className="crt-scanlines" />

      {/* Ambient glow orbs */}
      <div className="mesh-glow-orb" style={{ top: '5%', left: '-5%', width: '500px', height: '500px' }} />
      <div className="mesh-glow-orb" style={{ top: '50%', right: '-8%', width: '600px', height: '600px', background: `radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)` }} />
      <div className="mesh-glow-orb" style={{ top: '80%', left: '20%', width: '400px', height: '400px', background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)` }} />

      {/* ═══════ HEADER ═══════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, width: '100%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 5%',
        background: 'rgba(2, 5, 10, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(var(--primary-rgb), 0.06)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '14px', color: 'var(--primary)', fontWeight: '900',
            letterSpacing: '3px', fontFamily: 'var(--font-title)',
            textShadow: '0 0 10px var(--primary-glow)',
          }}>
            CYBER▪NEXUS
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '24px' }}>
          {[
            { href: '#hero-section', label: 'Origin' },
            { href: '#features-section', label: 'Systems' },
            { href: '#terminal-section', label: 'Shell' },
            { href: '#neural-section', label: 'Synapse' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              onClick={() => soundManager.playHover()}
              style={{
                color: 'var(--text-dim)', textDecoration: 'none',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)', transition: 'color 0.3s, text-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--primary)';
                e.target.style.textShadow = '0 0 8px var(--primary-glow)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-dim)';
                e.target.style.textShadow = 'none';
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[
              { key: 'cyan', color: '#00f0ff' },
              { key: 'crimson', color: '#ff0055' },
              { key: 'acid', color: '#39ff14' },
              { key: 'obsidian', color: '#c5a059' },
            ].map((t) => (
              <div key={t.key}
                onClick={() => changeTheme(t.key)}
                style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: t.color, cursor: 'pointer',
                  border: theme === t.key ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: theme === t.key ? `0 0 8px ${t.color}` : 'none',
                  transition: 'all 0.3s ease',
                }}
                title={t.key}
              />
            ))}
          </div>
          <button className="neon-btn" onClick={handleMuteToggle} style={{ fontSize: '9px', padding: '3px 8px' }}>
            {isMuted ? '◁ OFF' : '◁ ON'}
          </button>
        </div>
      </header>

      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section id="hero-section" style={{ height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <ParticleCyberSpace />
        <div className="grid-bg" />

        <div style={{ zIndex: 10, maxWidth: '900px', padding: '0 20px' }}>
          <div className="psy-subtitle" style={{ marginBottom: '25px' }}>
            // NEUROMORPHIC INTEGRATION PROTOCOL v7.0
          </div>

          <h1 className="glitch-title" data-text="CYBER NEXUS" style={{ marginBottom: '25px' }}>
            CYBER NEXUS
          </h1>

          <p style={{
            color: 'var(--text-dim)', fontSize: '16px', maxWidth: '650px',
            margin: '0 auto 15px', fontFamily: 'var(--font-display)',
            lineHeight: '1.8', fontWeight: '200',
          }}>
            Forge virtual realities. Lock down neural gateways.
            Synchronize your consciousness with the infinite digital synapse network.
          </p>

          <p style={{
            color: 'var(--primary)', fontFamily: 'var(--font-mono)',
            fontSize: '14px', minHeight: '24px', marginBottom: '40px',
          }}>
            <span style={{ opacity: 0.5 }}>&gt; </span>
            {typed}
            <span className="typewriter-cursor" />
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="psy-btn" onClick={handleCtaClick}>Initialize Sync</button>
            <a href="#terminal-section" className="psy-btn-secondary"
              style={{ textDecoration: 'none', lineHeight: '1.6', display: 'inline-block' }}
              onClick={() => soundManager.playHover()}>
              Access Shell
            </a>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="arrow" />
        </div>
      </section>

      {/* ═══════ MARQUEE STRIP 1 ═══════ */}
      <MarqueeStrip words={MARQUEE_WORDS} />

      {/* ═══════ SECTION 2: STATS ═══════ */}
      <section style={{ minHeight: '50vh', padding: '80px 8%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {STATS.map((stat, i) => (
              <StatCounter key={i} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ MARQUEE STRIP 2 (Japanese/Mixed) ═══════ */}
      <MarqueeStrip words={MARQUEE_WORDS_2} reverse />

      {/* ═══════ SECTION 3: FEATURES ═══════ */}
      <section id="features-section" style={{ minHeight: '100vh' }}>
        <div className="grid-bg" />
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', zIndex: 10 }}>
          <div className="psy-subtitle">// COGNITIVE HARNESS SYSTEMS</div>
          <h2 className="psy-title" style={{ marginBottom: '10px' }}>Neural Augmentations</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', marginBottom: '50px', maxWidth: '600px', fontWeight: '200' }}>
            State-of-the-art cyberware implants engineered for cognitive supremacy and digital transcendence.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {FEATURES.map((feature, i) => (
              <div className="psy-card" key={i}
                onMouseEnter={() => soundManager.playHover()}
              >
                <div style={{
                  fontSize: '32px', marginBottom: '18px',
                  color: 'var(--primary)',
                  textShadow: '0 0 15px var(--primary-glow)',
                  fontWeight: '200',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-title)', fontSize: '15px',
                  color: 'var(--text-main)', marginBottom: '12px',
                  letterSpacing: '1px', fontWeight: '600',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.7', fontWeight: '300' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DIVIDER ═══════ */}
      <div className="cyber-divider" style={{ margin: '0 8%' }} />

      {/* ═══════ SECTION 4: TERMINAL ═══════ */}
      <section id="terminal-section" style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', height: '520px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div className="psy-subtitle">// COGNITIVE MAINFRAME INTERFACE</div>
          <h2 className="psy-title" style={{ marginBottom: '30px' }}>Nexus Command Deck</h2>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CyberTerminal />
          </div>
        </div>
      </section>

      {/* ═══════ MARQUEE STRIP 3 ═══════ */}
      <MarqueeStrip words={MARQUEE_WORDS} reverse />

      {/* ═══════ SECTION 5: NEURAL NET ═══════ */}
      <section id="neural-section" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', height: '520px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div className="psy-subtitle">// SYNAPTIC STIMULATION BRIDGE</div>
          <h2 className="psy-title" style={{ marginBottom: '30px' }}>Neural Net Overload</h2>
          <div style={{ flex: 1 }}>
            <NetworkVisualizer />
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{
        position: 'relative', padding: '60px 8% 40px',
        borderTop: '1px solid rgba(var(--primary-rgb), 0.08)',
        background: 'rgba(1, 3, 6, 0.95)',
        textAlign: 'center', zIndex: 10,
      }}>
        <div style={{
          fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '900',
          letterSpacing: '3px', color: 'var(--primary)', marginBottom: '15px',
          textShadow: '0 0 10px var(--primary-glow)',
        }}>
          CYBER▪NEXUS
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-dim)', letterSpacing: '2px',
          marginBottom: '25px',
        }}>
          NEUROMORPHIC INTEGRATION PROTOCOL // EST. 2077
        </p>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'rgba(var(--primary-rgb), 0.3)', letterSpacing: '1px',
        }}>
          &copy; 2077 CYBER-NEXUS CORPORATION. ALL NEURAL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
