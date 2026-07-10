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
    scene.fog = new THREE.FogExp2(
      currentThemePreset.fogColor,
      currentThemePreset.fogDensity
    );

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
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
      const initialColor = new THREE.Color(currentThemePreset.materialColor);
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
    const currentThemeColor = new THREE.Color(currentThemePreset.materialColor);
    const targetThemeColor = new THREE.Color(currentThemePreset.materialColor);

    // 6. Physics and Rendering Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      
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
          scene.fog.color.lerp(new THREE.Color(activePreset.fogColor), 0.05);
          scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, activePreset.fogDensity, 0.05);
        }
      }

      const posAttr = geometry.attributes.position;
      const colAttr = geometry.attributes.color;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        
        // 6.1 Tunneling movement (Z axis translation)
        // Frequency amplitude from sound manager scales the velocity
        let z = basePositions[idx + 2];
        z += particleSpeeds[i] * 10.0 * (1.0 + audio.bass * 2.0) * clock.getDelta() * 60; 

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
        const driftX = Math.sin(time * 0.8 + noiseOffsets[idx]) * 0.35;
        const driftY = Math.cos(time * 0.8 + noiseOffsets[idx + 1]) * 0.35;
        const driftZ = Math.sin(time * 0.8 + noiseOffsets[idx + 2]) * 0.15;

        let posX = basePositions[idx] + driftX;
        let posY = basePositions[idx + 1] + driftY;
        let posZ = z + driftZ;

        // 6.3 Localized mouse distortion using camera projection math
        const distToCam = Math.abs(camera.position.z - posZ);
        const fovRad = (camera.fov * Math.PI) / 180;
        const frustumHeight = 2.0 * distToCam * Math.tan(fovRad / 2);
        const frustumWidth = frustumHeight * camera.aspect;

        const targetMouseX = mouse.x * (frustumWidth / 2);
        const targetMouseY = mouse.y * (frustumHeight / 2);

        const diffX = posX - targetMouseX;
        const diffY = posY - targetMouseY;
        const dist2D = Math.hypot(diffX, diffY);
        
        const influenceRadius = 4.5;
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
        // Add random variations per particle index to make the cloud look volumetric
        const variation = (i % 12) / 120 - 0.05; // -0.05 to +0.05
        const particleColor = currentThemeColor.clone().addScalar(variation);
        colAttr.setXYZ(i, particleColor.r, particleColor.g, particleColor.b);
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
  }, []);

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
