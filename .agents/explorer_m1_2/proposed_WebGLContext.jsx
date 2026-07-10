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
    // Attempt to read current theme from DOM attribute or fallback to 'cyan'
    return document.documentElement.getAttribute('data-theme') || 'cyan';
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const audioDataRef = useRef({ bass: 0, mid: 0, treble: 0 });

  // Update theme and update document element attribute
  const changeTheme = (newTheme) => {
    if (THEME_PRESETS[newTheme]) {
      setActiveTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (soundManager && typeof soundManager.playClick === 'function') {
        soundManager.playClick();
      }
    }
  };

  // Track and normalize mouse coordinates globally to [-1, 1] range
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalizing x and y from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
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

    return () => {
      active = false;
    };
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
  if (!context) {
    throw new Error('useWebGL must be used within a WebGLProvider');
  }
  return context;
}
