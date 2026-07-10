# Change Tracker - Milestone 1

## Files Modified / Added

### New Files
- `src/context/WebGLContextCore.js`: Exports the raw React context object to separate raw context from the component and prevent Fast Refresh warnings.
- `src/context/WebGLContext.jsx`: Implements the `WebGLProvider` context wrapper. Manages active theme state, registers a global window `mousemove` listener for tracking normalized mouse coordinates (-1 to 1) in `mouseRef`, and runs a simulated oscillation loop using `requestAnimationFrame` for `audioDataRef`.
- `src/hooks/useWebGL.js`: Exposes the custom `useWebGL` hook, consuming `WebGLContext` and asserting provider validity.
- `src/utils/themePresets.js`: Holds static definitions for theme presets (`cyan`, `crimson`, `acid`, `obsidian`), containing material colors, glow colors/intensities, and fog parameters.

### Modified Files
- `src/main.jsx`: Wrapped `<App />` with `<WebGLProvider>` to make WebGL context globally accessible.
- `src/App.jsx`: Removed local theme state and local `changeTheme` helper. Imported and consumed `theme` and `changeTheme` from the global `useWebGL` hook.

## Build Status
- **Last known build status**: PASS (`rtk npm run build` succeeded without error)
- **Last known lint status**: PASS (Clean project linting with zero warnings or errors in `/src`)

## Pending Issues
- None.
