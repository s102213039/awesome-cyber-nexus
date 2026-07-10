# Milestone 1 Codebase Analysis & Recommendations

## 1. Dependency Analysis (`three.js`)
- **Status**: Checked `package.json` in the project root. It is verified that `three` is **not yet installed**.
- **Package Manager**: Found `package-lock.json` in the root folder, indicating the project uses **npm** for package management.
- **Recommendations**:
  - Run the installation command:
    ```bash
    npm install three
    ```
  - For full development and autocomplete support in code editors (especially for objects, shaders, and geometry interfaces in JavaScript), also recommend installing the typings:
    ```bash
    npm install --save-dev @types/three
    ```

---

## 2. Directory Structure Analysis
- **Current Layout**:
  - `src/`
    - `assets/` (holds images like `hero.png` and logo `vite.svg`)
    - `components/` (holds interface components: `CyberMesh.jsx`, `CyberTerminal.jsx`, `NetworkVisualizer.jsx`)
    - `utils/` (holds helpers like `SoundManager.js`)
    - `App.jsx`
    - `index.css`
    - `main.jsx`
- **Recommended Folders to Create**:
  1. `src/context/` — To house the global WebGL context (`WebGLContext.jsx`) and any future context providers (e.g. settings context).
  2. `src/hooks/` — To isolate custom hooks (such as a separate `useWebGL.js` if desired, or shader/audio hooks).
  3. `src/shaders/` — Recommended for future milestones to store raw `.glsl` or shader strings (vertex & fragment shaders) to keep components clean.

---

## 3. WebGL Context Component Wrapper Design
- **Architecture Recommendation**: **Single Background Canvas Pattern**.
  - *Why*: Instantiating multiple standard WebGL context canvas elements on a single page runs into browser canvas limits (typically 8-16 maximum WebGL contexts) and increases GPU usage and resource redundancy. Having one global context mount a single full-screen backdrop canvas allows sub-components to register/unregister 3D meshes and shader animations cleanly.
- **Theme Presets Specification**:
  Themes are designed to map standard WebGL configurations directly with the dynamic color tokens defined in `src/index.css`:
  - `cyan` (Cyan Cyber - Default): Primary `#00f0ff` (RGB: `0, 240, 255`), Secondary `#bd00ff`.
  - `crimson` (Crimson Threat): Primary `#ff0055` (RGB: `255, 0, 85`), Secondary `#ff8800`.
  - `acid` (Acid Matrix): Primary `#39ff14` (RGB: `57, 255, 20`), Secondary `#00f0ff`.
  - `obsidian` (Obsidian Gold): Primary `#c5a059` (RGB: `197, 160, 89`), Secondary `#555555`.

### Context API Design (`src/context/WebGLContext.jsx`)
Exposes:
- `theme` (active theme state)
- `preset` (active preset colors and properties)
- `setTheme(themeName)` (updates state, HTML attribute, and play sound feedback)
- `addToScene(object)` (adds Three.js meshes dynamically, returns cleanup callback)
- `registerAnimation(callback)` (registers custom tick functions, returns cleanup callback)
- `sceneRef`, `cameraRef`, `rendererRef` (direct object access for custom configurations)

---

## 4. Application Integration (App.jsx & main.jsx Wrapping)
- **Strategy**: Wrap the application at the root in `main.jsx` rather than inside `App.jsx`.
  - *Why*: This allows `App.jsx` itself to consume the global WebGL context using the `useWebGL()` hook, enabling it to share and change the theme status reactively.
- **Before and After Integration Proposals**:

### `src/main.jsx`
```javascript
// Before
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// After
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WebGLProvider } from './context/WebGLContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebGLProvider>
      <App />
    </WebGLProvider>
  </StrictMode>,
)
```

### `src/App.jsx` theme hook adjustments
```javascript
// Before
const [theme, setTheme] = useState('cyan');
const changeTheme = (newTheme) => {
  setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
  soundManager.playClick();
};

// After
const { theme, setTheme } = useWebGL();
const changeTheme = (newTheme) => {
  setTheme(newTheme);
};
```
