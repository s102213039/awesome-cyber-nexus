# Milestone 1 Codebase Analysis & Proposal

This document outlines the investigation findings and implementation recommendations for **Milestone 1: Core Foundation & WebGL Setup**.

---

## 1. Verification of `three.js` Installation

### Findings
The root `package.json` was examined, and `three` is currently **not** listed in the dependency tree:
```json
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
```

### Recommendation
Install `three` as a production dependency using:
```bash
npm install three
```
*Note: Since the codebase uses standard React/JS (Vite 8 + React 19) without TypeScript, installing `@types/three` is optional but not strictly necessary for source compilation. However, `three` itself contains internal TS declaration files which IDEs will resolve automatically.*

---

## 2. Directory Structure Audit & Recommendations

### Current Structure of `src/`
```
src/
├── App.jsx
├── assets/
│   ├── hero.png
│   └── vite.svg
├── components/
│   ├── CyberMesh.jsx
│   ├── CyberTerminal.jsx
│   └── NetworkVisualizer.jsx
├── index.css
├── main.jsx
└── utils/
    └── SoundManager.js
```

### Recommended Folders to Create
1. **`src/context/`**: To house the global WebGL context wrapper `WebGLContext.jsx`.
2. **`src/hooks/`**: To hold utility custom hooks. According to `PROJECT.md` contracts, this should eventually contain `useAudioAnalyser.js` and `useMouse.js` to avoid cluttering component files.

---

## 3. Global WebGL Context Component Design

The global WebGL context needs to store active theme settings, coordinates, and real-time audio analysis data.

### Proposed Code: `src/context/WebGLContext.jsx`
*Refer to `proposed_WebGLContext.jsx` in the agent folder for the complete source file. Below is the architectural design.*

```jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import soundManager from '../utils/SoundManager';

const WebGLContext = createContext(null);

export const THEME_PRESETS = {
  cyan: {
    primary: '#00f0ff',
    secondary: '#bd00ff',
    accent: '#39ff14',
    bgDark: '#02050a'
  },
  crimson: {
    primary: '#ff0055',
    secondary: '#ff8800',
    accent: '#00f0ff',
    bgDark: '#070104'
  },
  acid: {
    primary: '#39ff14',
    secondary: '#00f0ff',
    accent: '#ffff00',
    bgDark: '#010601'
  },
  obsidian: {
    primary: '#c5a059',
    secondary: '#555555',
    accent: '#ff4500',
    bgDark: '#060606'
  }
};

export function WebGLProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'cyan';
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const audioDataRef = useRef({ bass: 0, mid: 0, treble: 0 });

  const changeTheme = (newTheme) => {
    if (THEME_PRESETS[newTheme]) {
      setActiveTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (soundManager && typeof soundManager.playClick === 'function') {
        soundManager.playClick();
      }
    }
  };

  // Normalize mouse coordinates globally to [-1, 1] range to avoid duplicated hooks
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Central audio analysis polling loop (falls back to simulated drift until M3 is complete)
  useEffect(() => {
    let active = true;
    const updateAudioData = () => {
      if (!active) return;
      if (soundManager && typeof soundManager.getFrequencyData === 'function') {
        const data = soundManager.getFrequencyData();
        if (data) {
          audioDataRef.current.bass = data.bass ?? 0;
          audioDataRef.current.mid = data.mid ?? 0;
          audioDataRef.current.treble = data.treble ?? 0;
        }
      } else {
        // Simulated oscillation values to test visualizers in M2 before M3 is ready
        const time = Date.now() * 0.001;
        audioDataRef.current.bass = 0.5 + 0.3 * Math.sin(time * 2.0);
        audioDataRef.current.mid = 0.4 + 0.25 * Math.sin(time * 3.5);
        audioDataRef.current.treble = 0.3 + 0.2 * Math.sin(time * 5.0);
      }
      requestAnimationFrame(updateAudioData);
    };
    updateAudioData();
    return () => { active = false; };
  }, []);

  const value = {
    activeTheme,
    colors: THEME_PRESETS[activeTheme],
    changeTheme,
    mousePos,
    audioDataRef
  };

  return (
    <WebGLContext.Provider value={value}>
      {children}
    </WebGLContext.Provider>
  );
}

export function useWebGL() {
  const context = useContext(WebGLContext);
  if (!context) throw new Error('useWebGL must be used within a WebGLProvider');
  return context;
}
```

---

## 4. App.jsx & main.jsx Wrapping and Theme State Migration

To cleanly integration the `WebGLProvider`, the state in `App.jsx` should shift from a local state to consumption of the context.

### Wrapping `App.jsx` inside `src/main.jsx`
We recommend wrapping `<App />` directly in the React root in `src/main.jsx` to make the context available layout-wide.

**Proposed `src/main.jsx` (before vs after):**

```jsx
// BEFORE
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

```jsx
// AFTER
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

### Migrating Theme State in `App.jsx`
Once wrapped, `App.jsx` can consume the global WebGL context, replacing the local `theme` state and local `changeTheme` method.

**Proposed `src/App.jsx` changes:**

```jsx
// BEFORE (Lines 14-15, 35-39)
export default function App() {
  const [theme, setTheme] = useState('cyan');
  // ...
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    soundManager.playClick();
  };
```

```jsx
// AFTER
import { useWebGL } from './context/WebGLContext';

export default function App() {
  const { activeTheme: theme, changeTheme } = useWebGL();
  // ...
  // changeTheme local function is deleted since it is now provided by useWebGL()
```
