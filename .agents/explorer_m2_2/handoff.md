# Handoff Report: Milestone 2.1 (Explore & Design Particle Cyber Space)

## 1. Observation
The following observations were made regarding the codebase structures and configurations:
* **Three.js Package Dependency**: `package.json` contains:
  ```json
  16:     "three": "^0.185.1"
  ```
  No imports of `'three'` currently exist in `src/`.
* **Current Background Component**: `src/App.jsx` imports and renders `CyberMesh`:
  ```javascript
  2: import CyberMesh from './components/CyberMesh';
  ...
  109:         <CyberMesh />
  ```
  `src/components/CyberMesh.jsx` uses a 2D canvas context with manual perspective projection:
  ```javascript
  9:     const ctx = canvas.getContext('2d');
  ```
* **Context & Hook Inputs**: `src/context/WebGLContext.jsx` manages theme settings and mouse/audio refs:
  ```javascript
  7:   const [activeTheme, setActiveTheme] = useState('cyan');
  8:   const mouseRef = useRef({ x: 0, y: 0 });
  9:   const audioDataRef = useRef({ bass: 0.5, mid: 0.5, treble: 0.5 });
  ```
  The `mouseRef` is populated with normalized coordinates in the range $[-1, 1]$:
  ```javascript
  23:       const x = (e.clientX / window.innerWidth) * 2 - 1;
  24:       const y = -(e.clientY / window.innerHeight) * 2 + 1;
  25:       mouseRef.current = { x, y };
  ```
* **Theme Configuration**: `src/utils/themePresets.js` defines parameters for the active themes (`cyan`, `crimson`, `acid`, `obsidian`), specifying properties like `materialColor`, `glowColor`, and `fogColor`:
  ```javascript
  2:   cyan: {
  3:     name: 'Cyan Cyber',
  4:     materialColor: '#00f0ff',
  ...
  7:     fogColor: '#02050a',
  ```

---

## 2. Logic Chain
1. **Three.js Integration (Ob. 1)**: Since Three.js is already specified as a dependency in `package.json`, the implementation agent can import from `'three'` directly using ESM modules (`import * as THREE from 'three'`).
2. **Mounting Point (Ob. 2)**: The current `CyberMesh` is mounted inside `#hero-section` with absolute positioning, meaning it scrolls away. By creating `ParticleCyberSpace` as a fixed fullscreen canvas (`position: 'fixed'`) and mounting it at the root of `App.jsx`, we achieve a layered parallax effect when scrolling through the sections.
3. **Mouse Distortion Math (Ob. 3)**: Since the context provides normalized screen coordinates in $[-1, 1]$, we project the coordinates onto the scene's focal plane at $Z=0$ based on camera distance and FOV. Computing a repulsion vector relative to this projected coordinates allows localized particle pushback. By updating a temporary offset rather than modifying base coordinates directly, particles snap back organically when the mouse moves away.
4. **Theme Transitions (Ob. 4)**: By watching `activeTheme` and using `THREE.Color.lerp()` in the animation loop, we can simultaneously fade the particles, fog, and renderer clear color to avoid harsh aesthetic cuts when switching themes.
5. **Audio Reactivity (Ob. 3)**: Since `WebGLContext` is already simulating live frequency ranges in `audioDataRef`, we can immediately modulate particle scale and speed in the rendering loop, setting up a seamless transition for the upcoming Milestone 3.

---

## 3. Caveats
* **Performance Scoping**: The point cloud size is set to 3000 particles. Running the distortion/drift physics calculations on the CPU (JS thread) is extremely fast for this count, but should be monitored for frame drops. If bottlenecked, calculations can be moved to a custom vertex shader.
* **Canvas Dimensions**: The aspect ratio calculation for projecting mouse coordinates relies on tracking screen resizing. The window resize handler must update camera parameters (`camera.aspect` and `camera.updateProjectionMatrix()`) to prevent vector projection warping.

---

## 4. Conclusion
We recommend that the next agent implements `src/components/ParticleCyberSpace.jsx` using `BufferGeometry` for the 3000-particle point cloud. It must perform tunnel-wrap flow along the Z-axis, translate 2D mouse inputs into a 3D repulsion field, smoothly LERP theme colors, and integrate directly into the root level of `App.jsx` to replace `CyberMesh`.
Full specifications and formulations have been documented in `/Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/explorer_m2_2/analysis.md`.

---

## 5. Verification Method
1. **Implementation Inspection**: Confirm that `src/components/ParticleCyberSpace.jsx` compiles with Three.js classes and implements the formulas from `analysis.md`.
2. **Compile and Build**: Run the Vite build command to verify that ESM dependencies and compilation succeed:
   ```bash
   rtk npm run build
   ```
3. **E2E Validation**: If E2E testing framework is configured, execute the local runner:
   ```bash
   rtk npm run test:e2e
   ```
