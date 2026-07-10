import React, { useState, useEffect } from 'react';
import soundManager from '../utils/SoundManager';

export default function SystemMonitor() {
  const [cpuHistory, setCpuHistory] = useState(Array(20).fill(25));
  const [bandwidthHistory, setBandwidthHistory] = useState(Array(20).fill(40));
  const [ramUsage, setRamUsage] = useState(58);
  const [stats, setStats] = useState({
    firewallBlocks: 14209,
    decryptionBuffer: 88,
    secLevel: 'SECURE'
  });

  // Periodically update metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // CPU workload random walk
      setCpuHistory(prev => {
        const next = Math.max(10, Math.min(95, prev[prev.length - 1] + (Math.random() * 20 - 10)));
        return [...prev.slice(1), next];
      });

      // Network Bandwidth workload random walk
      setBandwidthHistory(prev => {
        const next = Math.max(5, Math.min(100, prev[prev.length - 1] + (Math.random() * 30 - 15)));
        return [...prev.slice(1), next];
      });

      // RAM usage fluctuations
      setRamUsage(prev => Math.max(30, Math.min(98, prev + Math.floor(Math.random() * 6 - 3))));

      // Blocked traffic counters
      setStats(prev => {
        const deltaBlocks = Math.floor(Math.random() * 5);
        if (deltaBlocks > 3) {
          soundManager.playHover();
        }

        const nextBlocks = prev.firewallBlocks + deltaBlocks;
        const nextDecryp = Math.max(10, Math.min(100, prev.decryptionBuffer + (Math.random() * 4 - 2)));
        
        let level = 'SECURE';
        if (nextDecryp > 90) level = 'OVERWATCH_WARNING';
        else if (nextBlocks % 13 === 0) level = 'INTRUSION_BLOCKED';

        return {
          firewallBlocks: nextBlocks,
          decryptionBuffer: nextDecryp,
          secLevel: level
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper to map values to SVG path coordinates
  const makeSvgPath = (data, width, height) => {
    const step = width / (data.length - 1);
    const points = data.map((val, idx) => {
      const x = idx * step;
      // Invert Y because SVG coordinates start from top-left
      const y = height - (val / 100) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // RAM Circular Ring values
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ramUsage / 100) * circumference;

  return (
    <div className="system-monitor-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', height: '100%' }}>
      
      {/* CPU & Bandwidth charts card */}
      <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
        <div style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '11px', color: '#00f0ff', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', paddingBottom: '6px', marginBottom: '8px', letterSpacing: '1px' }}>
          COGNITIVE FRAMEWORK LOADS (CPU / NET)
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* CPU Chart */}
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 2, left: 5, fontSize: '9px', color: '#00f0ff', opacity: 0.7 }}>
              CPU CORE INTEGRATION: {Math.round(cpuHistory[cpuHistory.length - 1])}%
            </span>
            <svg style={{ width: '100%', height: '80px', display: 'block', background: 'rgba(0,0,0,0.25)', borderRadius: '3px' }}>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(0,240,255,0.05)" />
              <line x1="0" y1="40" x2="1000" y2="40" stroke="rgba(0,240,255,0.05)" />
              <line x1="0" y1="60" x2="1000" y2="60" stroke="rgba(0,240,255,0.05)" />
              <path
                d={makeSvgPath(cpuHistory, 300, 80)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                style={{ transition: 'd 0.3s ease' }}
              />
            </svg>
          </div>

          {/* Bandwidth Chart */}
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 2, left: 5, fontSize: '9px', color: '#bd00ff', opacity: 0.7 }}>
              BANDWIDTH THROUGHPUT: {Math.round(bandwidthHistory[bandwidthHistory.length - 1])} MB/S
            </span>
            <svg style={{ width: '100%', height: '80px', display: 'block', background: 'rgba(0,0,0,0.25)', borderRadius: '3px' }}>
              <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(189,0,255,0.05)" />
              <line x1="0" y1="40" x2="1000" y2="40" stroke="rgba(189,0,255,0.05)" />
              <line x1="0" y1="60" x2="1000" y2="60" stroke="rgba(189,0,255,0.05)" />
              <path
                d={makeSvgPath(bandwidthHistory, 300, 80)}
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="2"
                style={{ transition: 'd 0.3s ease' }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* RAM & Firewall Logs Card */}
      <div className="cyber-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', padding: '12px', gap: '8px' }}>
        
        {/* RAM Usage Circular HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,240,255,0.1)' }}>
          <div style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '9px', color: '#00f0ff', marginBottom: '8px', letterSpacing: '0.5px' }}>
            MEM ALLOCATION
          </div>
          
          <div style={{ position: 'relative', width: '90px', height: '90px' }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="transparent"
                stroke="rgba(0, 240, 255, 0.08)"
                strokeWidth="6"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ 
                  transform: 'rotate(-90deg)', 
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 0.5s ease'
                }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '90px', height: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>{ramUsage}%</span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>RAM</span>
            </div>
          </div>
        </div>

        {/* Security indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', fontFamily: '"Share Tech Mono", monospace', paddingLeft: '4px' }}>
          
          <div>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>INTEGRITY OVERWATCH</div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: stats.secLevel === 'SECURE' ? '#39ff14' : '#ff0055',
              textShadow: stats.secLevel !== 'SECURE' ? '0 0 5px #ff0055' : 'none'
            }}>
              // {stats.secLevel}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>BLOCKED CYBER ATTACKS</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {stats.firewallBlocks.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>DECRYPT DECAY BUFFER</div>
            <div style={{ fontSize: '11px', color: '#ffea00' }}>
              {Math.round(stats.decryptionBuffer)}% STABILITY
            </div>
            <div style={{ height: '3px', background: 'rgba(255, 234, 0, 0.1)', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#ffea00', width: `${stats.decryptionBuffer}%` }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
