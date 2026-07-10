# Analysis Report: 3D WebGL Particle Cyber Space Design

## Executive Summary
This report outlines the technical findings and architectural design for the `ParticleCyberSpace` component, which will be implemented in Milestone 2. We investigate the import of Three.js, interaction with `WebGLContext` hooks, mathematical formulations for particle dynamics (noise drift, perspective tunneling, mouse distortion), and the integration strategy into `App.jsx`.

---

## 1. Codebase Investigation Findings

### 1.1 Three.js Import Capability
- **Observation**: `package.json` contains `"three": "^0.185.1"` under `dependencies`.
- **Import Strategy**: Since Three.js is installed directly as an ESM-compatible dependency, it can be imported inside any React component as:
  ```javascript
  import * as THREE from 'three';
  ```
  This is standard, lightweight, and ensures access to all core namespace elements (e.g., `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `BufferGeometry`, `BufferAttribute`, `Points`, `PointsMaterial`, `Color`, `AdditiveBlending`).

### 1.2 WebGLContext & Hooks Compatibility
- **Context Structure (`WebGLContext.jsx` & `WebGLContextCore.js`)**:
  - Exposes `activeTheme` (string matching `'cyan'`, `'crimson'`, `'acid'`, or `'obsidian'`).
  - Exposes `changeTheme(themeName)`.
  - Exposes `themePresets` (configuration object with properties like `materialColor`, `glowColor`, `glowIntensity`, `fogColor`, `fogDensity`, `fogNear`, `fogFar`).
  - Exposes `mouseRef` (`{ current: { x, y } }` in normalized device coordinates ranging from `-1` to `1` on both axes).
  - Exposes `audioDataRef` (`{ current: { bass, mid, treble } }` with normalized values between `0.0` and `1.0`).
- **Hook Usage (`useWebGL.js`)**:
  - We can call `const { activeTheme, themePresets, mouseRef, audioDataRef } = useWebGL();` inside the new component.

### 1.3 Baseline Reference: `CyberMesh` Component
- **Implementation**: `CyberMesh.jsx` uses standard HTML5 Canvas 2D Context API with custom project equations to draw a wireframe perspective grid.
- **Limitation**: Standard 2D canvas struggles with performance for high point counts (2000+) and lacks GPU acceleration, shading, and advanced additive blending models.
- **Placement**: Renders inside the `#hero-section` element with absolute positioning (`top: 0, left: 0, width: 100%, height: 100%, zIndex: 0`).

---

## 2. Component Design for `ParticleCyberSpace.jsx`

Because React 19 is used without helper libraries like React Three Fiber (R3F), `ParticleCyberSpace` will manage a vanilla Three.js instance inside a standard `useEffect` hook.

### 2.1 Component Structure
```jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import useWebGL from '../hooks/useWebGL';

export default function ParticleCyberSpace() {
  const canvasRef = useRef(null);
  const { activeTheme, themePresets, mouseRef, audioDataRef } = useWebGL();

  // Keep mutable properties in refs to avoid re-triggering useEffect
  const themeRef = useRef(activeTheme);
  useEffect(() => {
    themeRef.current = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Setup Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(
      themePresets[themeRef.current].fogColor,
      themePresets[themeRef.current].fogDensity
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

    // 2. Build Point Cloud Geometry
    const PARTICLE_COUNT = 3000;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    
    // Arrays for physics state (tunneling, noise phases)
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const noiseOffsets = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);

    // Initialize particles in a tunnel formation
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      
      // Cylindrical/tunnel coordinate system
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.0 + Math.random() * 8.0; // Tunnel radius range
      const depth = Math.random() * -100;       // Extended along negative Z

      basePositions[idx] = Math.cos(angle) * radius;
      basePositions[idx + 1] = Math.sin(angle) * radius;
      basePositions[idx + 2] = depth;

      positions[idx] = basePositions[idx];
      positions[idx + 1] = basePositions[idx + 1];
      positions[idx + 2] = basePositions[idx + 2];

      // Store phase offsets for deterministic drift noise
      noiseOffsets[idx] = Math.random() * Math.PI * 2;
      noiseOffsets[idx + 1] = Math.random() * Math.PI * 2;
      noiseOffsets[idx + 2] = Math.random() * Math.PI * 2;
      
      // Speed multiplier
      particleSpeeds[i] = 0.05 + Math.random() * 0.15;

      // Initial color
      const initialColor = new THREE.Color(themePresets[themeRef.current].materialColor);
      colors[idx] = initialColor.r;
      colors[idx + 1] = initialColor.g;
      colors[idx + 2] = initialColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 3. Create Points Material
    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const pointsCloud = new THREE.Points(geometry, material);
    scene.add(pointsCloud);

    // 4. Handle Sizing
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Color interpolation state tracker
    const currentThemeColor = new THREE.Color(themePresets[themeRef.current].materialColor);
    const targetThemeColor = new THREE.Color(themePresets[themeRef.current].materialColor);

    // 5. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Retrieve current interactive context values
      const mouse = mouseRef.current;
      const audio = audioDataRef.current;
      
      // Update target color
      const activeThemePreset = themePresets[themeRef.current];
      targetThemeColor.set(activeThemePreset.materialColor);
      currentThemeColor.lerp(targetThemeColor, 0.05); // Smooth linear transition

      // Update fog color and density smoothly
      if (scene.fog) {
        scene.fog.color.lerp(new THREE.Color(activeThemePreset.fogColor), 0.05);
        scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, activeThemePreset.fogDensity, 0.05);
      }

      // Update all particles
      const posAttr = geometry.attributes.position;
      const colAttr = geometry.attributes.color;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        
        // 5.1 Tunneling movement (Z travel)
        let z = basePositions[idx + 2];
        z += particleSpeeds[i] * 12.0 * (1.0 + audio.bass * 1.5); // Accelerated by audio bass
        if (z > camera.position.z) {
          // Reset past camera boundary
          z = -100;
          const angle = Math.random() * Math.PI * 2;
          const radius = 3.0 + Math.random() * 8.0;
          basePositions[idx] = Math.cos(angle) * radius;
          basePositions[idx + 1] = Math.sin(angle) * radius;
        }
        basePositions[idx + 2] = z;

        // 5.2 Deterministic noise-based drift
        const dx = Math.sin(time * 0.8 + noiseOffsets[idx]) * 0.4;
        const dy = Math.cos(time * 0.8 + noiseOffsets[idx + 1]) * 0.4;
        const dz = Math.sin(time * 0.8 + noiseOffsets[idx + 2]) * 0.2;

        let posX = basePositions[idx] + dx;
        let posY = basePositions[idx + 1] + dy;
        let posZ = z + dz;

        // 5.3 Localized mouse distortion vector
        // Frustum dimensions at particle depth
        const distToCam = Math.abs(camera.position.z - posZ);
        const fovRad = (camera.fov * Math.PI) / 180;
        const frustumHeight = 2.0 * distToCam * Math.tan(fovRad / 2);
        const frustumWidth = frustumHeight * camera.aspect;

        // Map mouse screen space coordinate (NDC) to 3D space
        const targetMouseX = mouse.x * (frustumWidth / 2);
        const targetMouseY = mouse.y * (frustumHeight / 2);

        // Vector delta between particle and projection
        const diffX = posX - targetMouseX;
        const diffY = posY - targetMouseY;
        const dist2D = Math.hypot(diffX, diffY);
        
        const influenceRadius = 5.0;
        if (dist2D < influenceRadius) {
          const force = Math.pow(1.0 - dist2D / influenceRadius, 2);
          
          // Repulsion forces
          posX += (diffX / dist2D) * force * 1.5;
          posY += (diffY / dist2D) * force * 1.5;

          // Cyber swirl/vortex force
          const swirlX = -diffY;
          const swirlY = diffX;
          const swirlDist = Math.hypot(swirlX, swirlY);
          if (swirlDist > 0.001) {
            posX += (swirlX / swirlDist) * force * 0.8;
            posY += (swirlY / swirlDist) * force * 0.8;
          }
        }

        // Apply calculated coordinates
        posAttr.setXYZ(i, posX, posY, posZ);

        // 5.4 Theme transitions per-particle
        // Add random hue variation per particle based on its index
        const hueVariation = (i % 10) / 100 - 0.05; // +/- 5% brightness/hue
        const finalColor = currentThemeColor.clone().addScalar(hueVariation);

        colAttr.setXYZ(i, finalColor.r, finalColor.g, finalColor.b);
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup Functions
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
        zIndex: -1, // Sits behind dashboard elements but overlays standard dark background
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}
```

---

## 3. Mathematical Formulations & Physical System

### 3.1 Perspective Tunneling
Particles travel longitudinally along the negative Z-axis. For any particle $i$:
$$Z_{base, i}(t) = Z_{base, i}(t - dt) + V_i \cdot (1 + 1.5 \cdot \text{bass}) \cdot dt$$
Where:
- $V_i$ is a randomized velocity specific to particle $i$.
- $\text{bass}$ is the real-time normalized audio amplitude.
- Boundary condition: If $Z_{base, i}(t) > Z_{cam}$, wrap particle:
  $$Z_{base, i}(t) \leftarrow Z_{wrap}$$
  and regenerate initial horizontal offsets $X_{base}, Y_{base}$ dynamically to prevent tunneling recurrence shapes.

### 3.2 Smooth Deterministic Drift Noise
To construct a smooth, performant drifting system without adding high CPU cost or external library loads (like simplex noise), we use multi-frequency sin/cos combinations indexed by particle ID:
$$\Delta X_{drift, i}(t) = 0.4 \cdot \sin(t \cdot 0.8 + \phi_{x, i})$$
$$\Delta Y_{drift, i}(t) = 0.4 \cdot \cos(t \cdot 0.8 + \phi_{y, i})$$
$$\Delta Z_{drift, i}(t) = 0.2 \cdot \sin(t \cdot 0.8 + \phi_{z, i})$$
Where the phase angles $\phi_{x, i}, \phi_{y, i}, \phi_{z, i}$ are pre-computed random phases generated inside $[0, 2\pi]$ during initialization.

### 3.3 Frustum-Projected Localized Mouse Distortion
To map 2D mouse inputs $(m_x, m_y) \in [-1, 1] \times [-1, 1]$ directly to the 3D depth slice of each particle $Z_i$, we calculate the spatial width $W_i$ and height $H_i$ of the frustum at that distance:
$$D_i = |Z_{camera} - Z_i|$$
$$H_i = 2 \cdot D_i \cdot \tan\left(\frac{\theta_{FOV}}{2}\right)$$
$$W_i = H_i \cdot AR$$
$$m_{x, i} = m_x \cdot \frac{W_i}{2}$$
$$m_{y, i} = m_y \cdot \frac{H_i}{2}$$

Vector calculation from projected cursor coordinates to the base drifted position:
$$\vec{d}_i = \left( X_{drift, i} - m_{x, i},\, Y_{drift, i} - m_{y, i} \right)$$
$$dist_i = \|\vec{d}_i\|_2$$

Let $R_{influence}$ be the force field boundary. The scale multiplier is:
$$f_i = \left( 1 - \frac{dist_i}{R_{influence}} \right)^2 \quad \text{for } dist_i < R_{influence}$$

We then displace the final coordinates:
$$\vec{p}_{final, i} = \vec{p}_{drift, i} + C_{repel} \cdot f_i \cdot \frac{\vec{d}_i}{dist_i} + C_{swirl} \cdot f_i \cdot \frac{(-d_y, d_x)}{\|(-d_y, d_x)\|_2}$$

---

## 4. Integration Strategy into `App.jsx`

### 4.1 Layout Alignment
Currently, `App.jsx` contains the `CyberMesh` component placed in Section 1 (Hero). Since our new WebGL point cloud needs to serve as the background for the entire application, rendering it as a **fixed full-page background** is the optimal layout.
- The standard dark background is defined on the container.
- We will set `zIndex: -1` on `ParticleCyberSpace` to sit behind all DOM cards, titles, terminal systems, and canvas overlays, while sitting in front of the root container background.
- Semi-transparent section backgrounds like `rgba(2, 5, 10, 0.95)` will allow the point-cloud particles to organically bleed through as ambient grid details when users scroll the page.

### 4.2 Code Integration
- **Step 1**: Import `ParticleCyberSpace.jsx`.
  ```javascript
  import ParticleCyberSpace from './components/ParticleCyberSpace';
  ```
- **Step 2**: Remove the local `<CyberMesh />` import and JSX render tag.
- **Step 3**: Place `<ParticleCyberSpace />` right after the CRT filter lines in the root JSX return:
  ```jsx
  return (
    <div style={{ position: 'relative', width: '100vw', background: 'var(--bg-dark)' }}>
      {/* CRT screen filters */}
      <div className="crt-overlay" />
      <div className="crt-scanlines" />

      {/* Fullscreen 3D WebGL cyber background */}
      <ParticleCyberSpace />
      
      {/* Decorative glowing orbs */}
      ...
  ```
