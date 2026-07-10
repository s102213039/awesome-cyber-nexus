# Project: awesomeWeb Creative WebGL Gallery & Portfolio

## Architecture
The project is built on React 19 + Vite 8. It layers a fullscreen WebGL 3D particle system as a fixed background, with a high-tech HUD (FUI) grid dashboard overlay. Sound effects and background music are managed by a centralized Web Audio manager which streams real-time frequency analysis data to the WebGL rendering context and the SVG HUD widgets.

```
       +---------------------------------------------+
       |                  App.jsx                    |
       +----------------------+----------------------+
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
+-----------------------+           +-----------------------+
|  ParticleCyberSpace   |           |     FuiDashboard      |
|    (WebGL canvas)     |           |     (HTML/SVG Overlay)|
+-----------+-----------+           +-----------+-----------+
            |                                   |
            | useAudioAnalyser()                | useAudioAnalyser()
            +-----------------+-----------------+
                              |
                              v
                    +-------------------+
                    |   SoundManager    |
                    | (Web Audio API)   |
                    +-------------------+
```

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Foundation & WebGL Setup | Install three.js, structure React folders, configure CSS theme variables. | None | DONE |
| M2 | 3D WebGL Particle Cyber Space | Implement high-density (2000+) particle field with noise drift and mouse distortion. | M1 | IN_PROGRESS |
| M3 | Audio Analysis & Visual Engine | Add background music and Web Audio AnalyserNode to feed data to WebGL/HUD. | M2 | PLANNED |
| M4 | FUI HUD Panels & Glitch Art | Build SVG FUI dashboard, CSS glitch effects, scanlines, and audio-reactive animations. | M3 | PLANNED |
| M5 | Multi-Theme & Transition VFX | Synchronize dynamic theme changes (CSS + Three.js) with synthesis audio transitions. | M4 | PLANNED |

## Interface Contracts
### SoundManager ↔ useAudioAnalyser hook
- `soundManager.init()`: Initializes AudioContext and connections.
- `soundManager.loadBgm(url)`: Asynchronously loads BGM track, returns Promise.
- `soundManager.playBgm()` / `soundManager.pauseBgm()`: Playback state management.
- `soundManager.getFrequencyData()`: Returns `{ bass: number, mid: number, treble: number }` with normalized (0-1) amplitudes.
- `soundManager.playThemeTransition()`: Plays synthesized sweep/SFX.

### ParticleCyberSpace Props
- `themeColors`: `{ primary: string, secondary: string, accent: string }`
- `mousePos`: `{ x: number, y: number }` (normalized -1 to 1)
- `audioData`: `{ bass: number, mid: number, treble: number }`

## Code Layout
- `src/main.jsx`: Application entry point.
- `src/App.jsx`: Controls layouts, overall state, and active UI screens.
- `src/index.css`: Cyberpunk color themes, scanner overlay, scanlines, and text glitch animations.
- `src/components/ParticleCyberSpace.jsx`: WebGL Three.js point cloud renderer.
- `src/components/FuiDashboard.jsx`: SVG-heavy dashboard widgets with circuit trails.
- `src/components/CyberTerminal.jsx`: Simulates hacker console commands.
- `src/components/NetworkVisualizer.jsx`: Canvas nodes rendering network propagation.
- `src/utils/SoundManager.js`: AudioContext orchestrator for BGM analyzer and transition synths.
- `src/hooks/useAudioAnalyser.js`: Custom hook to read analyzer frequencies.
- `src/hooks/useMouse.js`: Tracks and normalizes cursor position.
