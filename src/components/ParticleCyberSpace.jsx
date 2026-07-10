import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import useWebGL from '../hooks/useWebGL';

export default function ParticleCyberSpace() {
  const canvasRef = useRef(null);
  const { activeTheme, themePresets, mouseRef, audioDataRef } = useWebGL();

  // Reference the active theme to avoid restarting the useEffect when it changes
  const themeNameRef = useRef(activeTheme);
  useEffect(() => {
    themeNameRef.current = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Initialize Scene, Camera, Renderer
    const scene = new THREE.Scene();

    // Use FogExp2 for exponential cyber-space depth/fog simulation
    const currentThemePreset = themePresets[themeNameRef.current];
    if (currentThemePreset) {
      scene.fog = new THREE.FogExp2(
        currentThemePreset.fogColor,
        currentThemePreset.fogDensity
      );
    }

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });
    } catch (e) {
      console.warn('WebGL Context creation failed, degrading gracefully:', e);
      return; // Return early, leaving the canvas blank, but React app alive!
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Build High-Density Particle Point Cloud Geometry
    const PARTICLE_COUNT = 3000;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    
    // Internal coordinate states for physical updates
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const noiseOffsets = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);

    // Initialize particles in a tunnel formation along the Z-axis
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      
      // Cylindrical coordinates
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 8.5; // Radius of tunnel
      const depth = Math.random() * -100;       // Extended back along Z-axis

      // Set base coordinates
      basePositions[idx] = Math.cos(angle) * radius;
      basePositions[idx + 1] = Math.sin(angle) * radius;
      basePositions[idx + 2] = depth;

      positions[idx] = basePositions[idx];
      positions[idx + 1] = basePositions[idx + 1];
      positions[idx + 2] = basePositions[idx + 2];

      // Assign pre-computed random phases for smooth noise-based drifting
      noiseOffsets[idx] = Math.random() * Math.PI * 2;
      noiseOffsets[idx + 1] = Math.random() * Math.PI * 2;
      noiseOffsets[idx + 2] = Math.random() * Math.PI * 2;
      
      // Randomize speed for depth-drifting effect
      particleSpeeds[i] = 0.04 + Math.random() * 0.16;

      // Color initialization matching active theme
      const materialColorVal = currentThemePreset ? currentThemePreset.materialColor : '#00f0ff';
      const initialColor = new THREE.Color(materialColorVal);
      colors[idx] = initialColor.r;
      colors[idx + 1] = initialColor.g;
      colors[idx + 2] = initialColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 3. Create Points Material with Additive Blending for neon glowing effect
    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 4. Handle Window Resize Events
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Track Color State for Smooth Inter-Theme Interpolations
    const initialMaterialColor = currentThemePreset ? currentThemePreset.materialColor : '#00f0ff';
    const currentThemeColor = new THREE.Color(initialMaterialColor);
    const targetThemeColor = new THREE.Color(initialMaterialColor);
    const tempColor = new THREE.Color();

    // 6. Physics and Rendering Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.1);
      
      // Safely access current mouse coordinates (NDC) and audio data refs
      const mouse = mouseRef.current || { x: 0, y: 0 };
      const audio = audioDataRef.current || { bass: 0.5, mid: 0.5, treble: 0.5 };

      // Update target color transition based on active theme
      const activePreset = themePresets[themeNameRef.current];
      if (activePreset) {
        targetThemeColor.set(activePreset.materialColor);
        currentThemeColor.lerp(targetThemeColor, 0.05); // Interpolate color state

        // Smooth transition of fog
        if (scene.fog) {
          tempColor.set(activePreset.fogColor);
          scene.fog.color.lerp(tempColor, 0.05);
          scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, activePreset.fogDensity, 0.05);
        }
      }

      // Modulate particle size dynamically using audio data
      material.size = 0.08 + audio.bass * 0.16;

      const posAttr = geometry.attributes.position;
      const colAttr = geometry.attributes.color;

      // Localized mouse distortion using camera projection math on focal plane Z=0
      const focalDist = Math.abs(camera.position.z);
      const fovRad = (camera.fov * Math.PI) / 180;
      const frustumHeight = 2.0 * focalDist * Math.tan(fovRad / 2);
      const frustumWidth = frustumHeight * camera.aspect;

      const targetMouseX = mouse.x * (frustumWidth / 2);
      const targetMouseY = mouse.y * (frustumHeight / 2);

      const influenceRadius = 4.5;
      const velocityMultiplier = 10.0 * (1.0 + audio.bass * 2.0) * delta * 60;
      const driftAmp = 0.35 * (1.0 + audio.mid * 1.5);
      const driftAmpZ = 0.15 * (1.0 + audio.treble * 1.5);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        
        // 6.1 Tunneling movement (Z axis translation)
        let z = basePositions[idx + 2];
        z += particleSpeeds[i] * velocityMultiplier; 

        // If the particle moves past the camera position, wrap it back into the tunnel depth
        if (z > camera.position.z) {
          z = -100;
          const angle = Math.random() * Math.PI * 2;
          const radius = 2.5 + Math.random() * 8.5;
          basePositions[idx] = Math.cos(angle) * radius;
          basePositions[idx + 1] = Math.sin(angle) * radius;
        }
        basePositions[idx + 2] = z;

        // 6.2 Deterministic noise-based drift using trigonometric sums
        const driftX = Math.sin(time * 0.8 + noiseOffsets[idx]) * driftAmp;
        const driftY = Math.cos(time * 0.8 + noiseOffsets[idx + 1]) * driftAmp;
        const driftZ = Math.sin(time * 0.8 + noiseOffsets[idx + 2]) * driftAmpZ;

        let posX = basePositions[idx] + driftX;
        let posY = basePositions[idx + 1] + driftY;
        let posZ = z + driftZ;

        // 6.3 Localized mouse distortion
        const diffX = posX - targetMouseX;
        const diffY = posY - targetMouseY;
        const dist2D = Math.hypot(diffX, diffY);
        
        if (dist2D < influenceRadius) {
          const force = Math.pow(1.0 - dist2D / influenceRadius, 2);
          
          // Repulsion away from the mouse cursor
          posX += (diffX / dist2D) * force * 1.8;
          posY += (diffY / dist2D) * force * 1.8;

          // Cylindrical vortex swirl around the cursor
          const swirlX = -diffY;
          const swirlY = diffX;
          const swirlDist = Math.hypot(swirlX, swirlY);
          if (swirlDist > 0.001) {
            posX += (swirlX / swirlDist) * force * 1.2;
            posY += (swirlY / swirlDist) * force * 1.2;
          }
        }

        // Apply updated coordinates
        posAttr.setXYZ(i, posX, posY, posZ);

        // 6.4 Smooth transition of individual particle color
        const variation = (i % 12) / 120 - 0.05; // -0.05 to +0.05
        const r = THREE.MathUtils.clamp(currentThemeColor.r + variation, 0, 1);
        const g = THREE.MathUtils.clamp(currentThemeColor.g + variation, 0, 1);
        const b = THREE.MathUtils.clamp(currentThemeColor.b + variation, 0, 1);
        colAttr.setXYZ(i, r, g, b);
      }

      // Mark buffer attributes as needing dynamic updates on the GPU
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup resource allocation
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [audioDataRef, themePresets, mouseRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Back layer overlaying root background color
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}
