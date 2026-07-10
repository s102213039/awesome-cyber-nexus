import React, { useEffect, useRef, useState } from 'react';
import soundManager from '../utils/SoundManager';

export default function NetworkVisualizer() {
  const canvasRef = useRef(null);
  const [toolMode, setToolMode] = useState('virus'); // 'virus' or 'patch'
  const [networkStats, setNetworkStats] = useState({ infected: 0, healthy: 50 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const timeouts = [];

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 300;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes configuration
    const particleCount = 50;
    const particles = [];
    const maxDistance = 75; // max line length
    
    // Mouse interaction target
    const mouse = { x: null, y: null };

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: 3 + Math.random() * 2,
        state: 'healthy', // 'healthy', 'infected', 'patched'
        transitionTimer: 0,
        id: i
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find closest node
      let closest = null;
      let minDist = 30; // threshold click radius
      
      particles.forEach(p => {
        const d = Math.hypot(p.x - clickX, p.y - clickY);
        if (d < minDist) {
          minDist = d;
          closest = p;
        }
      });

      if (closest) {
        if (toolMode === 'virus') {
          triggerPropagation(closest.id, 'infected');
        } else {
          triggerPropagation(closest.id, 'healthy');
        }
      }
    };

    // Propagate virus or patch to adjacent nodes
    const triggerPropagation = (startId, targetState) => {
      const startNode = particles.find(p => p.id === startId);
      if (!startNode || startNode.state === targetState) return;

      // Sound feedback
      if (targetState === 'infected') {
        soundManager.playAlarm();
      } else {
        soundManager.playSuccess();
      }

      const queue = [{ id: startId, delay: 0 }];
      const visited = new Set();
      visited.add(startId);

      while (queue.length > 0) {
        const { id, delay } = queue.shift();
        const current = particles.find(p => p.id === id);

        const tId = setTimeout(() => {
          if (current) {
            current.state = targetState;
            current.transitionTimer = 1.0; // Glow flare timer
            
            // Random beep sound on node trigger
            if (Math.random() < 0.3) {
              soundManager.playHover();
            }
          }
        }, delay);
        timeouts.push(tId);

        // Find neighbors
        particles.forEach(p => {
          if (p.id === id || visited.has(p.id)) return;
          const dist = Math.hypot(current.x - p.x, current.y - p.y);
          if (dist < maxDistance) {
            visited.add(p.id);
            queue.push({ id: p.id, delay: delay + 120 }); // delay spread
          }
        });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    // Animation Loop
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Render nodes stats counting
      let infectedCount = 0;
      let healthyCount = 0;

      // Draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < particleCount; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < maxDistance) {
            // Determine connecting line color based on nodes state
            let strokeColor = 'rgba(0, 240, 255, 0.08)'; // default cyan
            if (p1.state === 'infected' && p2.state === 'infected') {
              strokeColor = 'rgba(255, 0, 85, 0.25)'; // red
            } else if (p1.state === 'healthy' && p2.state === 'infected') {
              strokeColor = 'rgba(255, 234, 0, 0.15)'; // yellow warming transition
            }
            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Mouse connections
        if (mouse.x && mouse.y) {
          const mDist = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
          if (mDist < maxDistance * 1.5) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw and Update particles
      particles.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce walls
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Node Color Resolver
        let nodeColor = '#00f0ff'; // default healthy
        let flareColor = 'rgba(0, 240, 255, 0.4)';
        
        if (p.state === 'infected') {
          nodeColor = '#ff0055';
          flareColor = 'rgba(255, 0, 85, 0.5)';
          infectedCount++;
        } else {
          healthyCount++;
        }

        // Draw Flare on propagation transition
        if (p.transitionTimer > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1 + p.transitionTimer * 3), 0, Math.PI * 2);
          ctx.fillStyle = flareColor;
          ctx.fill();
          p.transitionTimer -= 0.05;
        }

        // Render main particle body
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = p.state === 'infected' ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Update counters (throttled to avoid render loops)
      setNetworkStats(prev => {
        if (prev.infected === infectedCount && prev.healthy === healthyCount) {
          return prev;
        }
        return { infected: infectedCount, healthy: healthyCount };
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationId);
      timeouts.forEach(clearTimeout);
    };
  }, [toolMode]);

  return (
    <div className="network-visualizer-container" style={{ border: '1px solid rgba(0, 240, 255, 0.15)', background: 'rgba(2, 6, 12, 0.6)', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* TitleBar & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(0, 240, 255, 0.08)', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', fontFamily: '"Orbitron", sans-serif', fontSize: '11px', letterSpacing: '1px', color: '#00f0ff' }}>
        <span>NEURAL NETWORK CORE INTRUSION VISUALIZER</span>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="neon-btn"
            onClick={() => { setToolMode('virus'); soundManager.playClick(); }}
            style={{ 
              borderColor: toolMode === 'virus' ? '#ff0055' : 'rgba(0, 240, 255, 0.2)',
              color: toolMode === 'virus' ? '#ff0055' : 'rgba(0, 240, 255, 0.6)',
              background: toolMode === 'virus' ? 'rgba(255, 0, 85, 0.1)' : 'transparent',
              fontSize: '9px',
              padding: '2px 8px'
            }}
          >
            Inject Virus
          </button>
          <button 
            className="neon-btn"
            onClick={() => { setToolMode('patch'); soundManager.playClick(); }}
            style={{ 
              borderColor: toolMode === 'patch' ? '#39ff14' : 'rgba(0, 240, 255, 0.2)',
              color: toolMode === 'patch' ? '#39ff14' : 'rgba(0, 240, 255, 0.6)',
              background: toolMode === 'patch' ? 'rgba(57, 255, 20, 0.1)' : 'transparent',
              fontSize: '9px',
              padding: '2px 8px'
            }}
          >
            Deploy Patch
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px dashed rgba(0, 240, 255, 0.08)', fontFamily: '"Share Tech Mono", monospace', fontSize: '11px' }}>
        <span style={{ color: '#00f0ff' }}>ACTIVE NODES: {networkStats.healthy + networkStats.infected}</span>
        <span style={{ color: '#39ff14' }}>CLEAN NODES: {networkStats.healthy}</span>
        <span style={{ color: '#ff0055', textShadow: networkStats.infected > 0 ? '0 0 5px #ff0055' : 'none' }}>
          INFECTED NODES: {networkStats.infected}
        </span>
      </div>

      {/* Canvas View */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        
        {/* Click instructions */}
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '9px', color: 'rgba(0, 240, 255, 0.4)', pointerEvents: 'none' }}>
          [CLICK ON A NODE TO INITIATE A STIMULATION CASCADE]
        </div>
      </div>
    </div>
  );
}
