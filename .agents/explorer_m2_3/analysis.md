# Technical Analysis & Component Design: 3D WebGL Particle Cyber Space

This report outlines the technical findings and the recommended design strategy for implementing the `ParticleCyberSpace` component as part of Milestone 2.

---

## 1. Codebase Scan & Observations

### 1.1 Technologies and Dependencies
- **React version**: `^19.2.7` (React 19)
- **Vite version**: `^8.1.1` (Vite 8)
- **Three.js version**: `^0.185.1` (Three.js is already installed as a dependency)
- **Styling**: Cyberpunk themes are configured globally via CSS custom properties in `src/index.css` and toggled using the HTML `data-theme` attribute (e.g. `data-theme="cyan"`, `data-theme="crimson"`, `data-theme="acid"`, `data-theme="obsidian"`).

### 1.2 WebGL Context Interface (`WebGLContext.jsx`)
The `WebGLProvider` tracks and exposes:
- `activeTheme` (string): `'cyan' | 'crimson' | 'acid' | 'obsidian'`
- `changeTheme` (function): Update current theme
- `themePresets` (object): Maps active theme to preset configurations
- `mouseRef` (React.useRef): Holds `{ x, y }` coordinates, normalized between `-1` and `1` (with standard WebGL clip-space orientation: top = `1.0`, bottom = `-1.0`, left = `-1.0`, right = `1.0`).
- `audioDataRef` (React.useRef): Holds `{ bass, mid, treble }` representing normalized frequency amplitudes.

---

## 2. Three.js Import Strategy

Since the project uses Vite, Three.js can be imported directly in `ParticleCyberSpace.jsx`:
```javascript
import * as THREE from 'three';
```
This is fully tree-shakeable and works natively with Vite's module resolution.

---

## 3. ParticleCyberSpace Component Design

### 3.1 Point Cloud Setup via BufferGeometry
We recommend rendering a point cloud of **3,000 particles** using `THREE.BufferGeometry` and `THREE.PointsMaterial`. The configuration will be run inside a React `useEffect` hook:

1. **Geometry Setup**:
   - Position coordinates are stored in a flat `Float32Array` of size `PARTICLE_COUNT * 3`.
   - A secondary array, `basePositions`, is maintained to store initial coordinates, enabling deterministic drifting and wrapping calculations.
   - An array of `randomPhases` of size `PARTICLE_COUNT * 3` is stored to offset individual noise patterns.
   - A `Float32Array` for point sizes can also be used if dynamic scaling is desired, though a uniform `size` in `PointsMaterial` is more performant.

2. **Material Configuration**:
   - Use `THREE.PointsMaterial` to render the points:
     ```javascript
     const material = new THREE.PointsMaterial({
       size: 0.15,
       sizeAttenuation: true,
       transparent: true,
       blending: THREE.AdditiveBlending,
       depthWrite: false,
     });
     ```
   - `AdditiveBlending` combined with `depthWrite: false` ensures glowing particles overlap beautifully.

3. **Fog Integration**:
   - Employs `THREE.FogExp2` to naturally fade particles into the background at extreme distances:
     ```javascript
     scene.fog = new THREE.FogExp2(
       themePresets[activeTheme].fogColor,
       themePresets[activeTheme].fogDensity
     );
     ```

---

## 4. Mathematical Formulations & Movement Mechanics

To create an immersive virtual space, we combine three distinct transformations in the animation loop:

### 4.1 Perspective Tunneling
Particles are initialized in a hollow cylindrical volume stretching along the Z axis from $Z_{min} = -120$ to $Z_{max} = 10$.
- **Cylindrical Distribution**:
  For particle $i$:
  $$\theta_i = \text{random}(0, 2\pi)$$
  $$r_i = \text{random}(R_{in}, R_{out}) \quad (\text{e.g. } R_{in} = 4, R_{out} = 22)$$
  $$x_i^{(base)} = r_i \cdot \cos(\theta_i)$$
  $$y_i^{(base)} = r_i \cdot \sin(\theta_i)$$
  $$z_i^{(base)} = \text{random}(Z_{min}, Z_{max})$$

- **Tunnel Scroll**:
  In each frame, the Z coordinate advances forward:
  $$z_i(t) = \left( (z_i^{(base)} + v_{tunnel} \cdot t - Z_{min}) \bmod (Z_{max} - Z_{min}) \right) + Z_{min}$$
  where $v_{tunnel}$ is the traveling velocity and $t$ is the elapsed time. This wraps particles back to the far end of the tunnel once they pass the camera (placed at $Z = 15$).

### 4.2 Smooth Noise-Based Drifting
To simulate quantum currents in the cyber tunnel, we introduce multi-frequency sinusoidal wave fields matching the effect of a 3D Simplex field:
- **Formulation**:
  $$D_{x, i} = A_{drift} \cdot \sin(\omega_1 \cdot t + \phi_{x, i} + z_i \cdot k_z)$$
  $$D_{y, i} = A_{drift} \cdot \cos(\omega_2 \cdot t + \phi_{y, i} + z_i \cdot k_z)$$
  where:
  - $A_{drift}$ is the maximum drift amplitude (e.g. `0.8`).
  - $\omega_1, \omega_2$ are the temporal frequencies (e.g. `1.2`, `0.8`).
  - $\phi_{x, i}, \phi_{y, i}$ are random phase offsets assigned to particle $i$ at startup.
  - $k_z$ is the spatial frequency along the Z-axis (e.g. `0.04`), producing wave-like propagation along the tunnel.

### 4.3 Localized Mouse Distortion
`mouseRef` provides screen coordinates $M = (x_m, y_m)$ in $[-1, 1]$. Since particles sit at varying depths, we project the mouse coordinates onto the XY plane corresponding to each particle's $z_i$:
- **Perspective Scaling Factor**:
  For camera at Z-position $Z_{cam} = 15$ with horizontal field of view $W_{fov}$ and aspect ratio $a$:
  $$d_i = Z_{cam} - z_i$$
  $$W_{depth, i} = 2 \cdot d_i \cdot \tan\left(\frac{\text{fov}}{2}\right) \cdot a$$
  $$H_{depth, i} = 2 \cdot d_i \cdot \tan\left(\frac{\text{fov}}{2}\right)$$
  The projected mouse 3D position is:
  $$X_{mouse, i} = x_m \cdot \frac{W_{depth, i}}{2}$$
  $$Y_{mouse, i} = y_m \cdot \frac{H_{depth, i}}{2}$$

- **Force Field Calculations**:
  Compute lateral displacement vector from projected mouse to particle:
  $$\Delta x = (x_i^{(base)} + D_{x, i}) - X_{mouse, i}$$
  $$\Delta y = (y_i^{(base)} + D_{y, i}) - Y_{mouse, i}$$
  $$d = \sqrt{\Delta x^2 + \Delta y^2}$$
  If $d < R_{influence}$:
  - **Repulsion displacement**:
    $$f_{push} = \left( 1 - \frac{d}{R_{influence}} \right)^2 \cdot S_{push}$$
    $$\delta x_{push} = \frac{\Delta x}{d} \cdot f_{push}, \quad \delta y_{push} = \frac{\Delta y}{d} \cdot f_{push}$$
  - **Vortex/Swirl displacement**:
    $$\delta x_{swirl} = -\frac{\Delta y}{d} \cdot \left( 1 - \frac{d}{R_{influence}} \right)^2 \cdot S_{swirl}$$
    $$\delta y_{swirl} = \frac{\Delta x}{d} \cdot \left( 1 - \frac{d}{R_{influence}} \right)^2 \cdot S_{swirl}$$

- **Final Rendering Position**:
  $$x_i^{(final)} = x_i^{(base)} + D_{x, i} + \delta x_{push} + \delta x_{swirl}$$
  $$y_i^{(final)} = y_i^{(base)} + D_{y, i} + \delta y_{push} + \delta y_{swirl}$$
  $$z_i^{(final)} = z_i(t)$$

---

## 5. Smooth Color & Theme Transitions

To synchronize particle colors with theme updates smoothly, use linear interpolation (lerping) in the animation loop:

1. **Theme Preset Extraction**:
   - Extract the target color from the preset: `const targetColorVal = themePresets[activeTheme].materialColor`.
   - Extract the target fog settings: `targetFogColor` and `targetFogDensity`.

2. **Lerp Logic**:
   - Convert values into Three.js structures: `const targetColor = new THREE.Color(targetColorVal)`.
   - Update values inside the render loop at each tick:
     ```javascript
     // Interpolate material color
     material.color.lerp(targetColor, 0.05);

     // Interpolate scene fog color and density
     scene.fog.color.lerp(new THREE.Color(themePresets[activeTheme].fogColor), 0.05);
     scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, themePresets[activeTheme].fogDensity, 0.05);
     
     // Update HTML background to match fog color for seamless border margins
     renderer.setClearColor(scene.fog.color, 1.0);
     ```

---

## 6. Integration Strategy into App.jsx

1. **Remove Old Canvas**:
   - Remove `<CyberMesh />` import and JSX tag in `src/App.jsx`.

2. **Add ParticleCyberSpace**:
   - Place `ParticleCyberSpace` as a fixed fullscreen background directly under the root container of `App.jsx`.
   - Styling parameters for the canvas wrapper inside `ParticleCyberSpace.jsx`:
     ```css
     position: fixed;
     top: 0;
     left: 0;
     width: 100vw;
     height: 100vh;
     z-index: 0;
     pointer-events: none;
     ```
   - This setup guarantees that the 3D space renders as a background underneath the HUD dashboard.

---

## 7. Recommended Implementation Steps & Quality Controls

- **Step 1**: Implement `ParticleCyberSpace.jsx` with static particles and orbit controls (for debugging).
- **Step 2**: Apply perspective camera and the Z-wrapping tunnel formulation.
- **Step 3**: Introduce noise drift offsets and projected mouse distortion using `mouseRef`.
- **Step 4**: Subscribe to `activeTheme` from `WebGLContext` and implement the lerping transitions for material colors and fog.
- **Step 5**: Swap `<CyberMesh />` for `<ParticleCyberSpace />` in `App.jsx` and inspect performance.
- **Step 6**: Validate memory performance (ensure canvas resizing and unmounting calls `renderer.dispose()`, `geometry.dispose()`, and `material.dispose()`).
