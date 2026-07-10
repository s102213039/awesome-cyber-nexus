# Milestone 1 Exploration Handoff Report

## 1. Observation
- **Three.js Dependency Status**:
  In `/Users/yanli/AndroidStudioProjects/awesomeWeb/package.json`, lines 12-15 are:
  ```json
    "dependencies": {
      "react": "^19.2.7",
      "react-dom": "^19.2.7"
    },
  ```
  No package named `"three"` is present under `dependencies` or `devDependencies`.
- **Directory Structure of `src/`**:
  Listing of `src/` shows:
  ```
  src/
  ├── App.jsx
  ├── assets/
  ├── components/
  │   ├── CyberMesh.jsx
  │   ├── CyberTerminal.jsx
  │   └── NetworkVisualizer.jsx
  ├── index.css
  ├── main.jsx
  └── utils/
      └── SoundManager.js
  ```
  Folders `src/context/` and `src/hooks/` do not exist.
- **Theme State in `src/App.jsx`**:
  In `src/App.jsx` lines 15 and 35-39, the theme state and updater are defined locally:
  ```javascript
  15:   const [theme, setTheme] = useState('cyan');
  ...
  35:   const changeTheme = (newTheme) => {
  36:     setTheme(newTheme);
  37:     document.documentElement.setAttribute('data-theme', newTheme);
  38:     soundManager.playClick();
  39:   };
  ```
- **App Entry Point in `src/main.jsx`**:
  In `src/main.jsx` lines 6-10, the application rendering layout is:
  ```javascript
  6: createRoot(document.getElementById('root')).render(
  7:   <StrictMode>
  8:     <App />
  9:   </StrictMode>,
  10: )
  ```

---

## 2. Logic Chain
1. **Three.js Installation Requirement**:
   - *Observation*: `package.json` contains no dependency for `three`.
   - *Reasoning*: To build a WebGL-based 3D environment in React, the `three` library must be installed.
   - *Conclusion*: A command to run `npm install three` is required to proceed with Milestone 2.
2. **Directory Structure Organization**:
   - *Observation*: The `src/` directory contains folders for assets, components, and utils, but lacks hooks and context.
   - *Reasoning*: Implementing a global WebGL context (`WebGLContext.jsx`) requires a dedicated `src/context/` directory. Implementing the custom hooks listed in `PROJECT.md` (`useAudioAnalyser.js`, `useMouse.js`) requires a dedicated `src/hooks/` directory to adhere to modular design patterns.
   - *Conclusion*: Folders `src/context/` and `src/hooks/` should be created.
3. **Global WebGL Context & Theme Presets Design**:
   - *Observation*: The user wants theme presets for cyan, crimson, acid, and obsidian.
   - *Reasoning*: Centralizing the themes in a WebGL-compatible context ensures both standard HTML/CSS components and Three.js canvas components can query current visual tokens. Normalizing mouse coordinates to `[-1, 1]` globally avoids duplicate document-level event listeners. Using a `useRef` for audio analysis frequency data avoids triggering high-frequency React component re-renders while updating WebGL geometries. Providing fallback simulated drift values ensures WebGL elements do not crash before the audio integration of Milestone 3 is developed.
   - *Conclusion*: The design in `proposed_WebGLContext.jsx` meets all of these criteria.
4. **App.jsx Provider Wrapping**:
   - *Observation*: `main.jsx` renders `<App />` directly. `App.jsx` handles theme and theme transitions using a local hook and method.
   - *Reasoning*: To make theme states, normalized mouse coordinates, and audio streams globally accessible, `<WebGLProvider>` should wrap `<App />` in `main.jsx`. This enables `App.jsx` to delegate its local theme state management directly to `useWebGL()`.
   - *Conclusion*: Adjust `main.jsx` and `App.jsx` according to the provided before-and-after proposals.

---

## 3. Caveats
- **Audio Analyser Node Integration**: The `SoundManager` in `src/utils/SoundManager.js` does not yet feature the `getFrequencyData` method. We simulated this method in our proposed context to avoid runtime errors during Milestone 2 before Milestone 3 is implemented.
- **Three.js React Wrapper Library**: No request was made to install React Three Fiber (`@react-three/fiber` or `@react-three/drei`). The analysis assumes raw three.js is preferred, mapping to the canvas structure in `CyberMesh.jsx`.

---

## 4. Conclusion
- Run `npm install three` to bring in 3D WebGL rendering capabilities.
- Create directories `src/context/` and `src/hooks/`.
- Introduce `src/context/WebGLContext.jsx` matching the design in `proposed_WebGLContext.jsx`.
- Update `src/main.jsx` to wrap the app root with `WebGLProvider`.
- Refactor `src/App.jsx` to utilize `useWebGL()` for theme configuration instead of local states.

---

## 5. Verification Method
- **Dependency verification**: Run `npm list three` after running the installation command.
- **Build and Lint verification**: Run `npm run lint` (uses `oxlint` as configured in `package.json` line 9) or `npm run build` after making the changes to ensure there are no compilation or layout layout issues.
- **DOM Attribute integration**: Inspect the element root in browser DevTools to ensure `data-theme` attribute transitions properly when calling `changeTheme()`.
