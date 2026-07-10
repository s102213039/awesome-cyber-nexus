# Handoff Report — Explorer Initialization & Architecture Planning

## 1. Observation
From inspecting the workspace root and code layout, the following facts are established:
1. **Existing Dependencies**: The project is a minimal React 19 + Vite 8 workspace.
   - Verbatim from `package.json`:
     ```json
     "dependencies": {
       "react": "^19.2.7",
       "react-dom": "^19.2.7"
     },
     "devDependencies": {
       "@types/react": "^19.2.17",
       "@types/react-dom": "^19.2.3",
       "@vitejs/plugin-react": "^6.0.3",
       "oxlint": "^1.71.0",
       "vite": "^8.1.1"
     }
     ```
2. **Current Visual Components**:
   - `src/components/CyberMesh.jsx`: Contains a custom 2D Canvas perspective waving grid landscape with mouse-interactive coordinate tilt, rendering vertical/horizontal grid lines on anim loop.
   - `src/components/CyberTerminal.jsx`: Simulates a retro hacker command prompt with input parsing (`help`, `clear`, `system`, `logs`, `matrix`, `scan [ip]`, `decrypt`). It uses a Canvas elements for screensaver matrix falling binary letters.
   - `src/components/NetworkVisualizer.jsx`: A 2D particle node graph on canvas where users click nodes to trigger propagation of "Virus" (red glow) or "Patch" (green/blue glow) to neighbors.
3. **Current Sound Management**:
   - `src/utils/SoundManager.js`: Uses native Web Audio API oscillators and gains to synthesize sound effects (clicks, alarms, sweeps, beeps, success arpeggios). It does not contain an `AnalyserNode` or BGM controls.
4. **Current Styles**:
   - `src/index.css` defines color variables for themes via data-attributes: `[data-theme="crimson"]`, `[data-theme="acid"]`, `[data-theme="obsidian"]`, and default root (Cyan). It contains CSS definitions for `.crt-overlay`, `.crt-scanlines`, `.psy-card`, and basic glitch text classes.

---

## 2. Logic Chain
Based on the observations:
1. **WebGL Dependency Gap**: Three.js is not listed in `package.json`. Implementing R1 requires installing `three` (and optionally `@types/three` for development).
2. **Audio Analyzer Integration Gap**: The existing `SoundManager.js` lacks an `AnalyserNode`. To feed frequency data to Three.js and HUD elements (R2), we must modify `SoundManager` to play a background audio track, route it through an `AnalyserNode`, and expose a polling or hook-based mechanism for components to consume spectrum bins.
3. **Multi-Theme Coupling**: Theme state changes in `App.jsx` write a `data-theme` attribute to the root document. To ensure Three.js particle materials transition smoothly (R4), we must bind a state listener or context to coordinate WebGL material colors alongside CSS selectors.
4. **Codebase Structural Layering**: To implement visual effects without breaking legacy interactive components (`CyberTerminal` and `NetworkVisualizer`), we should keep existing components but wrap/integrate them within a modular HUD grid (`FuiDashboard`), mapping the 3D space (`ParticleCyberSpace`) as a fixed fullscreen back-layer.

---

## 3. Caveats
- **Audio Playback Policies**: Browser security requires direct user interaction (like a click) before starting the Web Audio API context or BGM playback. The state of `isMuted` and playback trigger in `App.jsx` handles this, but visual animations must fallback gracefully when audio is suspended.
- **Performance Budget**: R1 requires rendering 2000+ particles. In mobile viewports or lower-end machines, heavy calculations in a React re-render cycle could cause frame drops. Thus, the frequency data feeding Three.js must bypass React state re-renders by writing directly to Three.js uniform buffers inside the animation frame loop.

---

## 4. Conclusion
To transition this project into a high-performance WebGL/Canvas visual effects gallery, the following design is recommended:

### Recommended Milestones
1. **Milestone 1: Core Foundation & WebGL Environment Setup**
   - **Scope**: Install `three` as a production dependency. Set up a global WebGL context component wrapper. Define theme presets mapping theme names (`cyan`, `crimson`, `acid`, `obsidian`) to specific WebGL material colors, glow properties, and fog parameters.
   - **Dependencies**: None.
2. **Milestone 2: 3D WebGL Particle Cyber Space (R1)**
   - **Scope**: Create `ParticleCyberSpace` component. Render a high-density (2000+ vertices) buffer geometry particle field. Implement smooth continuous noise-based drifting, perspective calculations (space scaling/tunneling), and localized particle distortion using mouse force field vectors.
   - **Dependencies**: Milestone 1.
3. **Milestone 3: Web Audio Analysis & Visualization Engine (R2)**
   - **Scope**: Extend `SoundManager` to incorporate a background music node, volume/play control, and `AnalyserNode`. Write a React audio hook (`useAudioAnalyser`) that queries frequency data (bass, mid, high bins) in a requestAnimationFrame loop, feeding it into Three.js particle uniform values (speed, particle sizes, color intensities) and binding it to SVG HUD components.
   - **Dependencies**: Milestone 2.
4. **Milestone 4: Interactive HUD Panels & Glitch Art (R3)**
   - **Scope**: Implement High-Tech FUI panels using SVG vector paths with animated circuit trails driven by CSS `stroke-dashoffset`. Apply CSS-based RGB split, text clipping, jitter animations, and screen shake synced to sub-bass audio peaks.
   - **Dependencies**: Milestone 3.
5. **Milestone 5: Multi-Theme Synchronization & Transition VFX (R4)**
   - **Scope**: Connect theme selector to coordinate simultaneous transitions of CSS variables, Three.js particle material uniforms (animating colors gracefully via linear interpolation/Lerp), and synthesize a Web Audio sweep sound. Complete production build testing.
   - **Dependencies**: Milestone 4.

### Cross-Module Interface Contracts
1. **Audio Interface (`SoundManager.js`)**:
   - `soundManager.init(): void` - Initialize AudioContext and setup nodes.
   - `soundManager.loadBgm(url: string): Promise<void>` - Loads background audio file.
   - `soundManager.playBgm(): void` / `soundManager.pauseBgm(): void` - Controls track state.
   - `soundManager.getFrequencyData(): { bass: number, mid: number, treble: number }` - Returns frequency amplitudes normalized from 0 to 1.
   - `soundManager.playThemeTransition(): void` - Triggers synthesizer pitch sweeps.
2. **Three.js Visual Interface (`ParticleCyberSpace.jsx` Props)**:
   - `themeColors: { primary: string, secondary: string, accent: string }` - Active hex values.
   - `mousePos: { x: number, y: number }` - Coordinates normalized between `-1` and `1`.
   - `audioData: { bass: number, mid: number, treble: number }` - Current frequency intensities to adjust dynamic particle sizes and velocities.
3. **HUD Controller Context (`ThemeContext.jsx` & `AudioContext.jsx`)**:
   - Manages state of active theme, audio active states, BGM levels, and feeds values to UI panels.

### Code Layout Structure
The project code layout should follow this structured directory naming scheme:
```
src/
├── main.jsx                # Renders App
├── App.jsx                 # Page structure & section orchestration
├── index.css               # Themes, glitch classes, crt filters
├── components/
│   ├── ParticleCyberSpace.jsx # Three.js WebGL particle field (R1, R2, R4)
│   ├── FuiDashboard.jsx    # HUD grid wrapping charts & metrics (R3)
│   ├── CyberTerminal.jsx   # Existing hacker CLI interface
│   ├── NetworkVisualizer.jsx# 2D node infection/patch simulation
│   └── CyberMesh.jsx       # Canvas background (alternative fallback)
├── context/
│   └── ThemeContext.jsx    # React context for active theme state
├── hooks/
│   ├── useAudioAnalyser.js # Queries SoundManager analyser frequencies
│   └── useMouse.js         # Normalizes mouse positions
└── utils/
    └── SoundManager.js     # Sound synthesis and audio context analyzer
```

---

## 5. Verification Method
Verify implementation and build system integration by running:
1. **Dependency checks**:
   ```bash
   rtk npm install
   ```
2. **Build and bundle verification**:
   ```bash
   rtk npm run build
   ```
3. **Linter and Static Analysis**:
   ```bash
   rtk npm run lint
   ```
4. **Behavioral Invalidation Conditions**:
   - If Three.js renderer does not load and output WebGL canvas warnings, WebGL check fails.
   - If AnalyserNode returns an array of zeros even when audio playback is enabled, visual sync check fails.
   - If changing theme throws react state errors or does not transition WebGL material colors, theme integration fails.
