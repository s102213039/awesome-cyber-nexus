# Handoff Report: Milestone 2 Explore & Design (M2.1)

## 1. Observation
The following configurations and code segments were directly observed:
1. **Three.js Dependency**:
   - `package.json` line 16: `"three": "^0.185.1"`
2. **Component Integration**:
   - `src/App.jsx` line 2: `import CyberMesh from './components/CyberMesh';`
   - `src/App.jsx` line 109: `<CyberMesh />`
3. **WebGL Context Properties**:
   - `src/context/WebGLContext.jsx` lines 53-59:
     ```javascript
     return (
       <WebGLContext.Provider value={{
         activeTheme,
         changeTheme,
         themePresets,
         mouseRef,
         audioDataRef
       }}>
     ```
   - `src/context/WebGLContext.jsx` lines 23-24:
     ```javascript
     const x = (e.clientX / window.innerWidth) * 2 - 1;
     const y = -(e.clientY / window.innerHeight) * 2 + 1;
     ```
4. **Theme Configuration**:
   - `src/utils/themePresets.js` specifies color attributes for `cyan`, `crimson`, `acid`, and `obsidian`.

---

## 2. Logic Chain
1. **Three.js Imports**: Since `three` is explicitly installed in `package.json`, it can be imported using `import * as THREE from 'three';` in Vite.
2. **Context Subscriptions**: Since the context exposes `mouseRef` and `activeTheme`, any consumer component (via `useWebGL()`) can read the dynamic theme and instantaneous mouse coordinates without triggering unnecessary React re-renders.
3. **Smooth Color Transitioning**: The `activeTheme` preset details can be used to update a target color. In the animation tick, calling `material.color.lerp(targetColor, 0.05)` enables smooth, continuous color blending.
4. **Distortion Calculations**: Because the canvas fills the screen, normal WebGL clip-space coords ($[-1, 1]$) in `mouseRef` can be projected to coordinate spaces at any given Z-depth using simple perspective projection rules, enabling distance-based push and swirl forces.
5. **Integration Path**: Swapping the import and element name of `<CyberMesh />` with `<ParticleCyberSpace />` inside `src/App.jsx` completes the integration with zero breakage to overlay dashboards.

---

## 3. Caveats
- **Performance Thresholds**: If particle counts are increased above $5000+$, CPU-based updates of vertex attributes inside `requestAnimationFrame` might drop frame rates on low-end devices. Under such conditions, transitioning to custom shader materials (`THREE.ShaderMaterial`) where noise, tunneling, and mouse physics are computed on the GPU is recommended.
- **Mouse Projection Bounds**: If camera parameters (such as aspect ratio or field of view) change dynamically, viewport projections must be re-calculated to prevent visual misalignment of the mouse distortion cursor.

---

## 4. Conclusion
The proposed design for `ParticleCyberSpace` using a `BufferGeometry` point cloud, Z-wrapping tunnel mathematics, sinusoidal noise drift, and coordinate-projected mouse repulsion/swirl distortion successfully achieves the goals of Milestone 2. No blockers were identified, and the implementation is ready to be handled by the implementer.

---

## 5. Verification Method
- **Build/Lint Checks**: Run `npm run lint` or `npx oxlint` to ensure there are no syntax or type errors in the integration.
- **E2E verification tests**: Run `npm run test:e2e` to inspect the browser automated tests.
- **Interactive Verification**:
  1. Inspect the background grid: particles should form a hollow tunnel wrapping continuously forward.
  2. Hover the cursor across the canvas: particles inside the influence radius should swirl and repel outwards.
  3. Toggle theme buttons in the header: particle color and fog color should transition smoothly over ~1 second.
