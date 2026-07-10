# ParticleCyberSpace Component Design & Analysis

This document presents the detailed design, formulation, and integration strategy for the `ParticleCyberSpace` component as part of Milestone 2: 3D WebGL Particle Cyber Space.

---

## 1. Import Strategy & Three.js Environment

The project is built on React 19 + Vite 8. The file `package.json` includes `"three": "^0.185.1"`.
In this ESM environment, Three.js can be imported directly:
```javascript
import * as THREE from 'three';
```
To minimize bundle size or clarify usage, specific classes can also be destructured, but a wildcard import (`import * as THREE from 'three'`) is standard and clean for React Three.js implementations without `react-three-fiber`.

---

## 2. Component Architecture & Lifecycle

The `ParticleCyberSpace` component will render a fullscreen, fixed background canvas. To ensure proper resource management and avoid memory leaks:
1. **Container Reference**: Use a React `useRef(null)` bound to a `<canvas>` element.
2. **Context Hooks**: Retrieve global state using the `useWebGL()` hook:
   - `activeTheme`: current theme key ('cyan', 'crimson', 'acid', 'obsidian').
   - `themePresets`: settings containing hex colors, fog density, etc.
   - `mouseRef`: ref holding current normalized cursor coordinates `{ x, y }` in `[-1, 1]`.
   - `audioDataRef`: ref holding simulated frequency magnitudes `{ bass, mid, treble }`.
3. **Core Animation Loop**: Execute using `requestAnimationFrame`. Inside the loop:
   - Calculate time delta ($dt$) for frame-rate independent physics.
   - Update particle base positions (drift + tunnel forward flow).
   - Apply transient mouse distortion offset.
   - Interpolate colors (material, fog, clear color) towards the target theme preset.
   - Render the scene.
4. **Cleanup**: On unmounting, cancel the animation frame, remove resize listeners, and call `.dispose()` on geometry, material, textures, and the WebGL renderer to free GPU memory.

---

## 3. WebGL Scene Configuration

To match the existing aesthetic:
* **Camera**: `THREE.PerspectiveCamera` with a $60^\circ$ FOV. Camera placed at $(0, 0, 30)$, looking towards the origin $(0, 0, 0)$.
* **Fog**: `THREE.FogExp2` using the color and density configured in `themePresets[activeTheme]`.
* **Renderer**: `THREE.WebGLRenderer` configured with `alpha: true` and `antialias: true`.

---

## 4. Mathematical Formulations

Let $N = 3000$ be the particle count. We define two arrays of floats:
* `basePositions`: Storing the undisturbed coordinates $(x_{\text{base},i}, y_{\text{base},i}, z_{\text{base},i})$ for $i \in [0, N-1]$.
* `positions`: The actual buffer attribute fed to the GPU, calculated as:
  $$\vec{p}_i(t) = \vec{p}_{\text{base},i}(t) + \vec{d}_{\text{drift},i}(t) + \vec{\delta}_{\text{mouse},i}(t)$$

### A. Initialization & Cylindrical Layout (Tunnel Shape)
To form a tunnel, we distribute particles in cylindrical coordinates:
* Radial span: $R_i \in [R_{\text{min}}, R_{\text{max}}]$ where $R_{\text{min}} = 4.0$ (keeps center open) and $R_{\text{max}} = 22.0$.
* Angular span: $\theta_i = \text{random}(0, 2\pi)$.
* Z-axis span: $z_{\text{base},i} \in [-50, 50]$.

For each particle, the base coordinates are:
$$x_{\text{base},i} = R_i \cos(\theta_i)$$
$$y_{\text{base},i} = R_i \sin(\theta_i)$$
$$z_{\text{base},i} = Z_i$$

Additionally, store a random float offset/phase array `randoms` of size $N \times 3$:
$$\phi_{x,i} = \text{random}(0, 2\pi), \quad \phi_{y,i} = \text{random}(0, 2\pi), \quad s_i = \text{random}(0.4, 1.2)$$

### B. Tunnel Flow & Wrap-Around (Perspective Tunneling)
In each frame, particles flow forward (towards the camera) along the Z axis:
$$z_{\text{base},i}(t + dt) = z_{\text{base},i}(t) + V_z \times dt$$
where $V_z$ is the flow velocity (base value $2.5$).
If a particle passes the camera or goes beyond the far plane ($z_{\text{base},i} > 50$), it wraps back to the far end of the tunnel:
$$z_{\text{base},i} = -50$$

### C. Sinusoidal Noise Drift
To simulate organic turbulence without loading large noise libraries, we evaluate multi-frequency trigonometric drifts for each particle:
$$d_{\text{drift},x,i}(t) = A_{\text{drift}} \times \sin(t \times s_i + \phi_{x,i})$$
$$d_{\text{drift},y,i}(t) = A_{\text{drift}} \times \cos(t \times s_i + \phi_{y,i})$$
$$d_{\text{drift},z,i}(t) = A_{\text{drift}} \times \sin(t \times s_i \times 1.4 + \phi_{x,i} + \phi_{y,i})$$
where $A_{\text{drift}}$ is the base drift amplitude (approx $0.6$).

### D. Localized Mouse Distortion (Repulsion Field)
We fetch the current mouse position $(mx, my)$ in $[-1, 1]$ from `mouseRef.current`.
We project this cursor onto the $Z=0$ plane. Given $FOV = 60^\circ$ and camera distance $D_c = 30$:
$$H_{Z=0} = 2 \times D_c \times \tan\left(\frac{FOV}{2}\right) \approx 34.64$$
$$W_{Z=0} = H_{Z=0} \times \text{aspectRatio}$$
Projected mouse coordinate:
$$\vec{p}_m = \left(mx \times \frac{W_{Z=0}}{2}, \ my \times \frac{H_{Z=0}}{2}, \ 0\right)$$

For each particle, let the drifted base position be $\vec{p}_{\text{base\_drift},i} = \vec{p}_{\text{base},i} + \vec{d}_{\text{drift},i}$.
The displacement vector from the mouse to the particle is:
$$\vec{v}_{\text{diff},i} = \vec{p}_{\text{base\_drift},i} - \vec{p}_m$$
Distance: $d_i = \|\vec{v}_{\text{diff},i}\|_2$.
The influence radius is $R_{\text{influence}} = 12.0$. If $d_i < R_{\text{influence}}$, we apply a repulsion force:
$$\vec{\delta}_{\text{mouse},i} = \frac{\vec{v}_{\text{diff},i}}{d_i} \times I_{\text{distort}} \times \left(1 - \frac{d_i}{R_{\text{influence}}}\right)^2$$
where $I_{\text{distort}}$ is the distortion strength (base value $5.0$). If $d_i \geq R_{\text{influence}}$, then $\vec{\delta}_{\text{mouse},i} = \vec{0}$.
This guarantees that particles return smoothly to their natural path once the mouse moves away, creating a temporary warp field.

---

## 5. Theme and Color Transitions

Dynamic color changes from `WebGLContext` must animate smoothly:
1. **Dynamic Target**: Watch `activeTheme`. Update target colors based on `themePresets[activeTheme]`:
   * `targetColor` $\leftarrow$ `themePresets[activeTheme].materialColor`
   * `targetFogColor` $\leftarrow$ `themePresets[activeTheme].fogColor`
2. **Interpolation**: In the animation loop, perform linear interpolation (LERP) every frame:
   $$\vec{C}_{\text{current}} = \vec{C}_{\text{current}} + (\vec{C}_{\text{target}} - \vec{C}_{\text{current}}) \times L$$
   $$\vec{F}_{\text{current}} = \vec{F}_{\text{current}} + (\vec{F}_{\text{target}} - \vec{F}_{\text{current}}) \times L$$
   where $L = 0.05$ (determines the easing rate).
3. **Application**:
   * Apply $\vec{C}_{\text{current}}$ to `material.color`.
   * Apply $\vec{F}_{\text{current}}$ to `scene.fog.color` and `renderer.setClearColor(scene.fog.color)`.

---

## 6. Proactive Audio Reactivity Integration

To lay the foundation for Milestone 3, we modulate the rendering parameters using simulated/real values from `audioDataRef.current`:
* **Particle Size Modulation**:
  $$\text{size} = \text{BaseSize} \times \left(1.0 + \text{audioDataRef.current.treble} \times 0.6\right)$$
  Directly set `material.size = size` in the frame loop.
* **Flow & Drift Acceleration**:
  Scale the flow speed $V_z$ and noise drift amplitude $A_{\text{drift}}$ with bass and mid:
  $$V_{z,\text{dynamic}} = V_z \times \left(1.0 + \text{audioDataRef.current.bass} \times 1.0\right)$$
  $$A_{\text{drift},\text{dynamic}} = A_{\text{drift}} \times \left(1.0 + \text{audioDataRef.current.mid} \times 0.5\right)$$

This makes the tunnel pulsate and speed up in sync with the simulated music frequencies.

---

## 7. Integration Strategy for App.jsx

1. **Import Update**:
   Replace:
   ```javascript
   import CyberMesh from './components/CyberMesh';
   ```
   with:
   ```javascript
   import ParticleCyberSpace from './components/ParticleCyberSpace';
   ```

2. **Mounting**:
   Instead of mounting inside the `#hero-section` element (which scroll-positions the canvas absolutely and limits it to the first section), mount `<ParticleCyberSpace />` directly at the root of `App` as a fixed fullscreen background:
   ```jsx
   return (
     <div style={{ position: 'relative', width: '100vw', background: 'var(--bg-dark)' }}>
       <ParticleCyberSpace />
       {/* CRT screen filters */}
       <div className="crt-overlay" />
       ...
     </div>
   );
   ```
   This ensures the particle space flows seamlessly behind the specs catalog, terminal, and neural bridge, providing a unified background across the entire site.

3. **Styling Container**:
   The canvas style in `ParticleCyberSpace` will be:
   ```css
   position: fixed;
   top: 0;
   left: 0;
   width: 100vw;
   height: 100vh;
   z-index: -1;
   pointer-events: none;
   opacity: 0.85;
   ```
   * `z-index: -1` (or `0`) keeps it behind HUD overlay widgets and text cards.
   * `pointer-events: none` makes sure it doesn't intercept clicks meant for interactive components (like textboxes, buttons, terminal).
