# Plan - Milestone 1: Core Foundation & WebGL Setup

## Objective
Implement core foundation setup, directory structure, install three.js, create WebGL context component wrapper, define theme presets (cyan, crimson, acid, obsidian), and verify compilation.

## Steps
1. **Explore**:
   - Analyze existing code layout and existing source files (e.g. `src/App.jsx`, `src/components/CyberMesh.jsx`, etc.) to see how theme selection and WebGL components are currently structured or if they need refactoring/migration to use the new WebGLContext.
2. **Implement**:
   - Install `three.js` as production dependency.
   - Create directories: `src/context`, `src/hooks`, `src/utils`, `src/components`.
   - Implement `src/context/WebGLContext.jsx` that defines the theme presets and provides a theme provider.
   - Integrate `WebGLProvider` in `src/main.jsx` or `src/App.jsx`.
   - Update any components to read from this global WebGL context as appropriate (or make sure they compile/work with it).
3. **Verify**:
   - Check linting.
   - Run production build command (`npm run build` or `vite build`) to verify compilation.
