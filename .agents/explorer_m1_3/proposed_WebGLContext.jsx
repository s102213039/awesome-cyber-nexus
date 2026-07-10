import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import soundManager from '../utils/SoundManager';

const WebGLContext = createContext(null);

// Theme presets matching CSS custom properties
export const THEME_PRESETS = {
  cyan: {
    primary: '#00f0ff',
    primaryRGB: '0, 240, 255',
    secondary: '#bd00ff',
    accent: '#39ff14',
    bgDark: '#02050a',
    fogColor: 0x02050a,
    gridColor: 0x00f0ff,
    particleColor: 0xbd00ff,
    ambientColor: 0x00f0ff,
  },
  crimson: {
    primary: '#ff0055',
    primaryRGB: '255, 0, 85',
    secondary: '#ff8800',
    accent: '#00f0ff',
    bgDark: '#070104',
    fogColor: 0x070104,
    gridColor: 0xff0055,
    particleColor: 0xff8800,
    ambientColor: 0xff0055,
  },
  acid: {
    primary: '#39ff14',
    primaryRGB: '57, 255, 20',
    secondary: '#00f0ff',
    accent: '#ffff00',
    bgDark: '#010601',
    fogColor: 0x010601,
    gridColor: 0x39ff14,
    particleColor: 0x00f0ff,
    ambientColor: 0x39ff14,
  },
  obsidian: {
    primary: '#c5a059',
    primaryRGB: '197, 160, 89',
    secondary: '#555555',
    accent: '#ff4500',
    bgDark: '#060606',
    fogColor: 0x060606,
    gridColor: 0xc5a059,
    particleColor: 0x555555,
    ambientColor: 0xc5a059,
  }
};

export function WebGLProvider({ children }) {
  const [theme, setThemeState] = useState('cyan');
  const canvasContainerRef = useRef(null);

  // Core Three.js references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Callbacks registered by individual WebGL components
  const animateCallbacksRef = useRef([]);

  // Setup/tear down WebGL context
  useEffect(() => {
    // 1. Initialize Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(THEME_PRESETS[theme].fogColor, 0.002);
    sceneRef.current = scene;

    // 2. Initialize Camera
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 50, 250);
    cameraRef.current = camera;

    // 3. Initialize WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    if (canvasContainerRef.current) {
      canvasContainerRef.current.appendChild(renderer.domElement);
    }

    // 4. Setup Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(THEME_PRESETS[theme].ambientColor, 0.15);
    ambientLight.name = 'globalAmbientLight';
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 150, 50);
    scene.add(dirLight);

    // 5. Window Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    const animate = (time) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      // Execute all registered sub-animations
      animateCallbacksRef.current.forEach(callback => {
        try {
          callback(time, scene, camera);
        } catch (err) {
          console.error('Error in WebGL animation callback:', err);
        }
      });

      renderer.render(scene, camera);
    };
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvasContainerRef.current && renderer.domElement) {
        canvasContainerRef.current.removeChild(renderer.domElement);
      }
      // Recursively dispose scene geometries/materials
      scene.traverse((object) => {
        if (!object.isMesh) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  // Update theme colors when the state changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const preset = THEME_PRESETS[theme];

    // 1. Update Fog Color
    if (scene.fog) {
      scene.fog.color.setHex(preset.fogColor);
    }

    // 2. Update Lights
    const ambientLight = scene.getObjectByName('globalAmbientLight');
    if (ambientLight) {
      ambientLight.color.setHex(preset.ambientColor);
    }

    // Note: Other custom mesh objects (e.g. terrain wireframe) can listen to context theme changes
    // or register standard material hooks to reactively update.
  }, [theme]);

  // Hook for sub-components to register objects to the global scene
  const addToScene = (object) => {
    const scene = sceneRef.current;
    if (scene) {
      scene.add(object);
    }
    return () => {
      if (scene) {
        scene.remove(object);
      }
    };
  };

  // Hook for sub-components to run animation loops
  const registerAnimation = (callback) => {
    animateCallbacksRef.current.push(callback);
    return () => {
      animateCallbacksRef.current = animateCallbacksRef.current.filter(cb => cb !== callback);
    };
  };

  const setTheme = (newTheme) => {
    if (THEME_PRESETS[newTheme]) {
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      soundManager.playClick();
    }
  };

  return (
    <WebGLContext.Provider value={{
      theme,
      preset: THEME_PRESETS[theme],
      setTheme,
      sceneRef,
      cameraRef,
      rendererRef,
      addToScene,
      registerAnimation
    }}>
      {/* Absolute fullscreen container for background rendering */}
      <div
        ref={canvasContainerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.85
        }}
      />
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
