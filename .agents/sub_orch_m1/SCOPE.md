# Scope: Milestone 1: Core Foundation & WebGL Setup

## Architecture
- React 19 + Vite 8.
- Global WebGL Context (`WebGLContext` or similar context provider) wrapping the application. This context will store WebGL/Three.js state (like renderer reference, current theme presets, active scene, or just a shared renderer/canvas reference, or theme presets for materials). Wait, let's see how a global WebGL context component wrapper should be used.
- Directory structure:
  - `src/components/`
  - `src/hooks/`
  - `src/utils/`
  - `src/context/`

## Milestones / Tasks
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Install three.js | Add `three` to dependencies | None | DONE |
| 2 | Structure React folders | Create/ensure `components`, `hooks`, `utils`, `context` folders exist | None | DONE |
| 3 | Global WebGL context | Create `src/context/WebGLContext.jsx` component wrapper | None | DONE |
| 4 | Theme presets | Define presets mapping `cyan`, `crimson`, `acid`, `obsidian` to material colors, glow, fog parameters | None | DONE |
| 5 | Verify compilation | Run npm run build or similar verification | All | DONE |

## Interface Contracts
- `WebGLContext`:
  - Context Provider `<WebGLProvider>` that stores the current active theme name and theme configurations.
  - Exposes `theme`, `setTheme`, `currentThemePreset` (containing material colors, glow properties, fog parameters).
- Theme Presets:
  - `cyan`: primary cyan, secondary blue, accent purple. Fog color, fog density, glow color, etc.
  - `crimson`: primary red, secondary gold, accent orange.
  - `acid`: primary neon green, secondary yellow, accent cyan.
  - `obsidian`: primary dark gray, secondary purple, accent neon blue.
