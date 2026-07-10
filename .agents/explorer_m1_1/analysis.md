# Milestone 1 Codebase Analysis & Recommendations

This report contains findings, design proposals, and recommendations for implementing Milestone 1 of the awesomeWeb project.

---

## 1. Verification of `three.js` Installation State
We inspected the `package.json` at the root of the project to check if `three` or its type declarations were installed:
- **Dependencies**: React `^19.2.7` and React-DOM `^19.2.7` are installed.
- **DevDependencies**: Vite `^8.1.1` and other standard tools are installed.
- **Status**: Neither `three` nor `@types/three` are listed in the `package.json`. Therefore, **Three.js is not yet installed**.

### Recommendation:
To support WebGL renderers in modern environments, we recommend installing Three.js via `npm`:
```bash
npm install three
```
And to provide TypeScript type auto-completion/linting in IDEs:
```bash
npm install --save-dev @types/three
```

---

## 2. Directory Structure Inspection & Recommendations
The current structure of the `src/` directory is as follows:
```
src/
├── App.jsx             # Main layouts and screen state controls
├── assets/             # Asset files (empty/unused currently)
├── components/         # React canvas/SVG UI components
│   ├── CyberMesh.jsx        # 2D Canvas terrain grid (using mathematical projections)
│   ├── CyberTerminal.jsx    # Simulated hacker console
│   └── NetworkVisualizer.jsx # SVG/Canvas nodes visualizer
├── index.css           # Global theme variables, animations, and scanlines
├── main.jsx            # Entry point rendering <App />
└── utils/              # Helper utilities
    └── SoundManager.js # Central Web Audio player
```

### Recommendation for Folder Additions:
We recommend creating the following folders under `src/` to support clean organization:
1. `src/context/`:
   - **Purpose**: To host the global WebGL context (`WebGLContext.jsx`) and any other context providers we introduce later.
   - **Rationale**: Isolates state concerns (themes, settings, device configurations) from layout and visual concerns.
2. `src/hooks/`:
   - **Purpose**: To hold custom React hooks (e.g., `useAudioAnalyser.js`, `useMouse.js`).
   - **Rationale**: Promotes reusability and keeps component code clean and declarative.
3. `src/shaders/`:
   - **Purpose**: To host custom GLSL shader files (`.glsl`, `.vert`, `.frag`) for the WebGL particle field (Milestone 2).
   - **Rationale**: Keeping shaders separate makes it easier to write syntax-highlighted GLSL code instead of embedding long string literals in Javascript.

---

## 3. Design Proposal: `WebGLContext.jsx` & Theme Presets
We propose establishing a React context provider in `src/context/WebGLContext.jsx` to synchronize the active visual theme, performance metrics, and WebGL-specific settings.

### Theme Color Mapping Matrix
The values below match the design tokens defined in `src/index.css`:
| Theme | Primary Hex | Primary RGB | Secondary Hex | Accent Hex |
|---|---|---|---|---|
| **Cyan** | `#00f0ff` | `0, 240, 255` | `#bd00ff` | `#39ff14` |
| **Crimson** | `#ff0055` | `255, 0, 85` | `#ff8800` | `#00f0ff` |
| **Acid** | `#39ff14` | `57, 255, 20` | `#00f0ff` | `#ffff00` |
| **Obsidian** | `#c5a059` | `197, 160, 89` | `#555555` | `#ff4500` |

### Proposed Implementation: `src/context/WebGLContext.jsx`
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import soundManager from '../utils/SoundManager';

export const THEME_PRESETS = {
  cyan: {
    primary: '#00f0ff',
    primaryRGB: '0, 240, 255',
    secondary: '#bd00ff',
    accent: '#39ff14',
  },
  crimson: {
    primary: '#ff0055',
    primaryRGB: '255, 0, 85',
    secondary: '#ff8800',
    accent: '#00f0ff',
  },
  acid: {
    primary: '#39ff14',
    primaryRGB: '57, 255, 20',
    secondary: '#00f0ff',
    accent: '#ffff00',
  },
  obsidian: {
    primary: '#c5a059',
    primaryRGB: '197, 160, 89',
    secondary: '#555555',
    accent: '#ff4500',
  }
};

const WebGLContext = createContext(null);

export const useWebGL = () => {
  const context = useContext(WebGLContext);
  if (!context) {
    throw new Error('useWebGL must be used within a WebGLProvider');
  }
  return context;
};

export const WebGLProvider = ({ children }) => {
  // Read initial theme from document attribute if set, default to 'cyan'
  const [theme, setThemeState] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'cyan';
  });

  // Settings that controls density, speed, and distortion globally
  const [webGLSettings, setWebGLSettings] = useState({
    particleCount: 2000,
    noiseDrift: 1.0,
    mouseDistortionRadius: 300,
    pointSize: 1.5,
  });

  const changeTheme = (newTheme) => {
    if (THEME_PRESETS[newTheme]) {
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Trigger sound feedback
      soundManager.playClick();
      
      // For future Milestones: trigger audio theme transition (sweep/SFX)
      if (typeof soundManager.playThemeTransition === 'function') {
        soundManager.playThemeTransition();
      }
    }
  };

  const value = {
    theme,
    themeColors: THEME_PRESETS[theme],
    presets: THEME_PRESETS,
    changeTheme,
    webGLSettings,
    setWebGLSettings
  };

  return (
    <WebGLContext.Provider value={value}>
      {children}
    </WebGLContext.Provider>
  );
};
```

---

## 4. App Integration Proposal
To allow both layout components (like the header navigation/settings in `App.jsx`) and visual rendering canvas components (like `CyberMesh` or `ParticleCyberSpace`) to consume and coordinate with this context, `WebGLProvider` must wrap the entire application tree.

### Proposed changes to `src/main.jsx`
Wrap `<App />` with the `<WebGLProvider>` in `src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WebGLProvider } from './context/WebGLContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebGLProvider>
      <App />
    </WebGLProvider>
  </StrictMode>,
)
```

### Proposed refactoring of `src/App.jsx`
Instead of managing a local `theme` state and modifying DOM properties manually in `App.jsx`, `App.jsx` will consume properties directly from `useWebGL()`:
1. **Remove local state**:
   - `const [theme, setTheme] = useState('cyan');` -> Remove.
2. **Import hook**:
   - `import { useWebGL } from './context/WebGLContext';`
3. **Retrieve states**:
   - `const { theme, changeTheme } = useWebGL();`
4. **Clean up `changeTheme` wrapper**:
   - The local `changeTheme` implementation in `App.jsx` (lines 35-39) can be completely removed since the provider handles it cleanly.
