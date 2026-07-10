import React, { useState, useEffect, useRef } from 'react';
import soundManager from '../utils/SoundManager';
import { themePresets } from '../utils/themePresets';
import { WebGLContext } from './WebGLContextCore';

export function WebGLProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState('cyan');
  const mouseRef = useRef({ x: 0, y: 0 });
  const audioDataRef = useRef({ bass: 0.5, mid: 0.5, treble: 0.5 });

  // Update theme and apply attributes/effects
  const changeTheme = (newTheme) => {
    if (themePresets[newTheme]) {
      setActiveTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      soundManager.playClick();
    }
  };

  // Track normalized mouse coordinates globally (-1 to 1)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Simulate audioDataRef oscillation values until Milestone 3
  useEffect(() => {
    let animationId;
    const animate = (time) => {
      const t = time * 0.001; // seconds
      audioDataRef.current = {
        bass: 0.5 + 0.3 * Math.sin(t * 2.0),
        mid: 0.4 + 0.25 * Math.sin(t * 3.5),
        treble: 0.3 + 0.2 * Math.sin(t * 5.0),
      };
      window.audioDataRef = audioDataRef;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <WebGLContext.Provider value={{
      activeTheme,
      changeTheme,
      themePresets,
      mouseRef,
      audioDataRef
    }}>
      {children}
    </WebGLContext.Provider>
  );
}
