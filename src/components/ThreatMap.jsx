import React, { useEffect, useRef, useState } from 'react';
import soundManager from '../utils/SoundManager';

const HUBS = [
  { id: 'NYC', name: 'New York (US-EAST)', x: 0.25, y: 0.35, color: '#00f0ff' },
  { id: 'SFO', name: 'San Francisco (US-WEST)', x: 0.15, y: 0.38, color: '#00f0ff' },
  { id: 'LDN', name: 'London (EU-WEST)', x: 0.48, y: 0.28, color: '#00f0ff' },
  { id: 'FRA', name: 'Frankfurt (EU-CENTRAL)', x: 0.52, y: 0.30, color: '#39ff14' },
  { id: 'TKY', name: 'Tokyo (AP-NORTHEAST)', x: 0.85, y: 0.36, color: '#ff0055' },
  { id: 'SHA', name: 'Shanghai (AP-EAST)', x: 0.81, y: 0.42, color: '#ffea00' },
  { id: 'SYD', name: 'Sydney (AP-SOUTHEAST)', x: 0.88, y: 0.80, color: '#39ff14' },
  { id: 'SAO', name: 'São Paulo (SA-EAST)', x: 0.35, y: 0.72, color: '#00f0ff' },
  { id: 'CPT', name: 'Cape Town (AF-SOUTH)', x: 0.55, y: 0.78, color: '#ffea00' },
  { id: 'MOW', name: 'Moscow (RU-NET)', x: 0.60, y: 0.24, color: '#ff0055' }
];

const ATTACK_TYPES = [
  { type: 'DDOS ATTACK', color: '#ff0055', risk: 'HIGH' },
  { type: 'BRUTE FORCE', color: '#ffea00', risk: 'MEDIUM' },
  { type: 'SQL INJECTION', color: '#ff0055', risk: 'HIGH' },
  { type: 'MALWARE INJECTION', color: '#ff0055', risk: 'HIGH' },
  { type: 'PORT SCAN', color: '#00f0ff', risk: 'LOW' },
  { type: 'PHISHING ATTEMPT', color: '#ffea00', risk: 'MEDIUM' }
];

export default function ThreatMap() {
  const canvasRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [activeAttacks, setActiveAttacks] = useState([]);

  // Generate a mock log
  const generateAttack = () => {
    const fromHub = HUBS[Math.floor(Math.random() * HUBS.length)];
    let toHub = HUBS[Math.floor(Math.random() * HUBS.length)];
    while (toHub.id === fromHub.id) {
      toHub = HUBS[Math.floor(Math.random() * HUBS.length)];
    }

    const attackMeta = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    const newAttack = {
      id: Math.random().toString(36).substring(2, 9),
      from: fromHub,
      to: toHub,
      type: attackMeta.type,
      color: attackMeta.color,
      risk: attackMeta.risk,
      progress: 0,
      speed: 0.01 + Math.random() * 0.015,
      ip
    };

    setActiveAttacks(prev => [...prev, newAttack]);
    
    // Play alert sound if threat is HIGH
    if (attackMeta.risk === 'HIGH') {
      soundManager.playAlarm();
    } else {
      soundManager.playBeep();
    }

    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      {
        id: newAttack.id,
        text: `[${timestamp}] ${attackMeta.risk} - ${attackMeta.type} from ${ip} (${fromHub.id}) -> ${toHub.name}`,
        color: attackMeta.color
      },
      ...prev.slice(0, 15) // Keep last 15
    ]);
  };

  useEffect(() => {
    // Generate initial logs
    for (let i = 0; i < 5; i++) {
      setTimeout(generateAttack, i * 400);
    }

    // Set interval for attacks
    const attackInterval = setInterval(() => {
      if (Math.random() < 0.45) {
        generateAttack();
      }
    }, 2000);

    return () => clearInterval(attackInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 400;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dotted continent simulation points
    const drawWorldDots = (w, h) => {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
      const dotSpacing = 12;
      for (let x = 0; x < w; x += dotSpacing) {
        for (let y = 0; y < h; y += dotSpacing) {
          // Math filters to roughly shapes continent clusters
          const nx = x / w;
          const ny = y / h;
          
          let isLand = false;
          // North America
          if (nx > 0.1 && nx < 0.35 && ny > 0.2 && ny < 0.5) isLand = true;
          // South America
          if (nx > 0.28 && nx < 0.42 && ny >= 0.5 && ny < 0.85) isLand = true;
          // Eurasia
          if (nx > 0.45 && nx < 0.9 && ny > 0.15 && ny < 0.55) isLand = true;
          // Africa
          if (nx > 0.46 && nx < 0.62 && ny >= 0.48 && ny < 0.8) isLand = true;
          // Australia
          if (nx > 0.78 && nx < 0.92 && ny > 0.65 && ny < 0.85) isLand = true;
          // Greenland
          if (nx > 0.32 && nx < 0.42 && ny > 0.08 && ny < 0.2) isLand = true;

          // Carve out Atlantic & Pacific Oceans
          if (nx > 0.35 && nx < 0.45 && ny > 0.35 && ny < 0.75) isLand = false;
          if (nx > 0.88 || nx < 0.08) isLand = false;

          if (isLand) {
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw cyber matrix grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw simulated land masses
      drawWorldDots(w, h);

      // Draw connections/hubs
      HUBS.forEach(hub => {
        const hx = hub.x * w;
        const hy = hub.y * h;

        // Pulse effect
        const pulse = (Date.now() / 1000) % 2;
        ctx.beginPath();
        ctx.arc(hx, hy, 4 + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = hub.color + '22';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
        ctx.fillStyle = hub.color;
        ctx.shadowColor = hub.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Label
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.font = '9px "Share Tech Mono", monospace';
        ctx.fillText(hub.id, hx + 8, hy + 3);
      });

      // Update and Draw attacks
      setActiveAttacks(prev => {
        const active = [];
        prev.forEach(attack => {
          const fromX = attack.from.x * w;
          const fromY = attack.from.y * h;
          const toX = attack.to.x * w;
          const toY = attack.to.y * h;

          // Draw bezier curve for arc visual
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          
          // Control point for arc height
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2 - Math.abs(fromX - toX) * 0.18; // curve upwards

          ctx.quadraticCurveTo(midX, midY, toX, toY);
          ctx.strokeStyle = attack.color + '44';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Particle position on quadratic bezier curve
          const t = attack.progress;
          const px = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * midX + t * t * toX;
          const py = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * midY + t * t * toY;

          // Draw glowing packet
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = attack.color;
          ctx.shadowColor = attack.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw trailing particle path
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.strokeStyle = attack.color + '44';
          ctx.stroke();

          attack.progress += attack.speed;

          if (attack.progress < 1) {
            active.push(attack);
          } else {
            // Ripples at target when hit
            createImpactRipple(toX, toY, attack.color);
          }
        });
        return active;
      });

      // Draw custom ripples
      drawRipples(ctx);

      animationId = requestAnimationFrame(animate);
    };

    // Keep track of impact ripples
    const ripples = [];
    const createImpactRipple = (x, y, color) => {
      ripples.push({ x, y, color, radius: 2, maxRadius: 28, opacity: 0.8 });
    };

    const drawRipples = (c) => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        c.beginPath();
        c.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        c.strokeStyle = r.color + Math.floor(r.opacity * 255).toString(16).padStart(2, '0');
        c.lineWidth = 2;
        c.stroke();

        r.radius += 1.2;
        r.opacity -= 0.03;

        if (r.opacity <= 0) {
          ripples.splice(i, 1);
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="threat-map-container" style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '15px', height: '100%' }}>
      <div className="map-view" style={{ position: 'relative', border: '1px solid rgba(0, 240, 255, 0.15)', background: 'rgba(2, 6, 12, 0.6)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5, padding: '5px 10px', background: 'rgba(0, 10, 20, 0.8)', borderLeft: '3px solid #ff0055', fontSize: '11px', fontFamily: '"Share Tech Mono", monospace', textTransform: 'uppercase', letterSpacing: '1px', pointerEvents: 'none' }}>
          Real-time Global Threat Vector Matrix
        </div>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      
      <div className="map-logs" style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 240, 255, 0.15)', background: 'rgba(2, 6, 12, 0.6)', borderRadius: '4px', overflow: 'hidden', padding: '10px' }}>
        <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', marginBottom: '8px', fontSize: '11px', fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif', textTransform: 'uppercase', letterSpacing: '1px', color: '#00f0ff' }}>
          Threat Activity Log
        </div>
        <div className="logs-feed" style={{ flex: 1, overflowY: 'auto', fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', lineHeight: '1.4', display: 'flex', flexDirection: 'column-reverse' }}>
          {logs.map(log => (
            <div key={log.id} style={{ color: log.color, marginBottom: '4px', borderBottom: '1px dashed rgba(255, 255, 255, 0.03)', paddingBottom: '2px', textShadow: `0 0 2px ${log.color}44` }}>
              {log.text}
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: '#00f0ff', opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
              Awaiting data stream connection...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
