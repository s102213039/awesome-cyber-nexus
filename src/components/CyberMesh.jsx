import React, { useEffect, useRef } from 'react';

export default function CyberMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid details
    const cols = 28;
    const rows = 24;
    const spacingX = 65;
    const spacingY = 45;
    
    // Perspective math settings
    const focalLength = 380;
    const depthOffset = 300;
    
    let time = 0;
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      // Normalize mouse to -1 to 1
      mouse.targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      time += 0.015;
      
      // Interpolate mouse movements for smoothness
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep radial dark-vibe gradient background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.8);
      bgGrad.addColorStop(0, 'rgba(3, 10, 22, 0.45)');
      bgGrad.addColorStop(1, 'rgba(2, 5, 10, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Resolve theme colors dynamically
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f0ff';
      const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '#bd00ff';

      // Store projected points
      const points = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          // Centered grid columns
          const cellX = (c - cols / 2) * spacingX;
          const cellY = r * spacingY;

          // Multi-frequency sine/cosine formulas for waving terrain
          const distFromCenter = Math.hypot(cellX, cellY - (rows * spacingY) / 2);
          
          // Psychedelic interference waves
          let z = Math.sin(c * 0.28 + time * 1.5) * Math.cos(r * 0.24 - time) * 35;
          z += Math.sin(distFromCenter * 0.005 - time * 2) * 20; // ripple wave
          
          // Distort grid based on mouse coordinates
          const mouseDist = Math.hypot(cellX - mouse.x * w * 0.5, cellY - mouse.y * h * 0.5);
          if (mouseDist < 300) {
            z += (300 - mouseDist) * 0.25 * Math.sin(time * 3);
          }

          // 3D Perspective Projection
          const scale = focalLength / (cellY + depthOffset);
          const screenX = w / 2 + cellX * scale;
          // Tilt effect + height factor
          const screenY = h / 2 - z * scale + cellY * scale * 0.85 + 50;

          points[r][c] = { x: screenX, y: screenY, z, depth: cellY };
        }
      }

      // Draw Grid Lines (from back to front for accurate sorting)
      for (let r = rows - 2; r >= 0; r--) {
        for (let c = 0; c < cols - 1; c++) {
          const p1 = points[r][c];
          const p2 = points[r][c + 1];
          const p3 = points[r + 1][c];

          // Compute opacity based on depth (fog effect)
          const opacity = Math.max(0, 1 - p1.depth / (rows * spacingY));

          // Neon stroke gradient
          ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.18})`;
          
          // Apply active theme colors
          if (primaryColor.startsWith('#')) {
            const rHex = parseInt(primaryColor.slice(1, 3), 16);
            const gHex = parseInt(primaryColor.slice(3, 5), 16);
            const bHex = parseInt(primaryColor.slice(5, 7), 16);
            ctx.strokeStyle = `rgba(${rHex}, ${gHex}, ${bHex}, ${opacity * 0.22})`;
          }

          ctx.lineWidth = 1;

          // Draw horizontal lines
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Draw vertical lines
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();

          // Render glowing node intersections at high coordinates
          if (c % 2 === 0 && r % 2 === 0 && p1.z > 15) {
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = secondaryColor;
            ctx.shadowColor = secondaryColor;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        pointerEvents: 'none',
        opacity: 0.85
      }} 
    />
  );
}
