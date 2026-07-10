# Scope: Milestone 2: 3D WebGL Particle Cyber Space

## Architecture
- `ParticleCyberSpace` component renders WebGL Three.js points canvas.
- Renders as a fixed fullscreen background.
- Consumes mouse coordinates and theme colors from `WebGLContext` via the `useWebGL()` hook.

## Interface Contracts
- Consumes from `WebGLContext`:
  - `activeTheme`: current theme key ('cyan', 'crimson', 'acid', 'obsidian').
  - `themePresets`: map of presets containing colors and values.
  - `mouseRef`: ref holding `{ x, y }` normalized mouse coordinates.
  - `audioDataRef`: ref holding `{ bass, mid, treble }` normalized frequencies.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M2.1 | Explore & Design | Research Three.js setup, point cloud configuration, and mouse vector interactions. | None | DONE |
| M2.2 | Implement ParticleCyberSpace.jsx | Write the Three.js point cloud renderer with 2000+ points, noise drifting, mouse force field, and theme colors. | M2.1 | IN_PROGRESS |
| M2.3 | Integrate with App.jsx | Swap/overlay with CyberMesh in App.jsx and verify rendering. | M2.2 | IN_PROGRESS |
| M2.4 | Review & Challenger | Validate with reviewer and challenger agents. | M2.3 | PLANNED |
| M2.5 | Audit | Run Forensic Auditor to guarantee zero cheating. | M2.4 | PLANNED |

## Code Layout
- `src/components/ParticleCyberSpace.jsx`: WebGL Three.js point cloud renderer.
- `src/App.jsx`: Update to render ParticleCyberSpace.
