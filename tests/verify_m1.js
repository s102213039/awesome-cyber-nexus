import fs from 'fs';
import path from 'path';
import assert from 'assert';

// 1. Mock browser globals BEFORE importing any modules
globalThis.window = {
  innerWidth: 1000,
  innerHeight: 800,
  addEventListener: (event, handler) => {
    window.listeners[event] = handler;
  },
  removeEventListener: (event, handler) => {
    delete window.listeners[event];
  },
  listeners: {},
  AudioContext: class MockAudioContext {
    constructor() {
      this.state = 'suspended';
    }
    resume() {
      this.state = 'running';
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime: (f, t) => {},
          linearRampToValueAtTime: (f, t) => {},
          exponentialRampToValueAtTime: (f, t) => {}
        },
        connect: (n) => {},
        start: () => {},
        stop: (t) => {}
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: (v, t) => {},
          linearRampToValueAtTime: (v, t) => {},
          exponentialRampToValueAtTime: (v, t) => {}
        },
        connect: (n) => {}
      };
    }
    get currentTime() {
      return Date.now() / 1000;
    }
    get destination() {
      return {};
    }
  }
};

globalThis.document = {
  documentElement: {
    attributes: {},
    setAttribute: (name, val) => {
      document.documentElement.attributes[name] = val;
    },
    getAttribute: (name) => {
      return document.documentElement.attributes[name];
    }
  }
};

// Mock requestAnimationFrame
let rafCallbacks = [];
globalThis.requestAnimationFrame = (callback) => {
  rafCallbacks.push(callback);
  return rafCallbacks.length - 1;
};
globalThis.cancelAnimationFrame = (id) => {
  rafCallbacks[id] = null;
};

// Verify 1: The theme presets correctly output the expected material colors, glow properties, and fog parameters.
import { themePresets } from '../src/utils/themePresets.js';

console.log('--- TEST 1: Theme Presets Structure and Values ---');
assert.ok(themePresets.cyan, 'Cyan theme preset should exist');
assert.ok(themePresets.crimson, 'Crimson theme preset should exist');
assert.ok(themePresets.acid, 'Acid theme preset should exist');
assert.ok(themePresets.obsidian, 'Obsidian theme preset should exist');

const expectedThemes = {
  cyan: {
    name: 'Cyan Cyber',
    materialColor: '#00f0ff',
    glowColor: '#00f0ff',
    glowIntensity: 1.2,
    fogColor: '#02050a',
    fogDensity: 0.02,
    fogNear: 1,
    fogFar: 50,
  },
  crimson: {
    name: 'Crimson Threat',
    materialColor: '#ff0055',
    glowColor: '#ff0055',
    glowIntensity: 1.5,
    fogColor: '#070104',
    fogDensity: 0.025,
    fogNear: 1,
    fogFar: 40,
  },
  acid: {
    name: 'Acid Matrix',
    materialColor: '#39ff14',
    glowColor: '#39ff14',
    glowIntensity: 1.4,
    fogColor: '#010601',
    fogDensity: 0.022,
    fogNear: 1,
    fogFar: 45,
  },
  obsidian: {
    name: 'Obsidian Gold',
    materialColor: '#c5a059',
    glowColor: '#c5a059',
    glowIntensity: 0.8,
    fogColor: '#060606',
    fogDensity: 0.015,
    fogNear: 1,
    fogFar: 60,
  }
};

for (const key of Object.keys(expectedThemes)) {
  const actual = themePresets[key];
  const expected = expectedThemes[key];
  assert.deepStrictEqual(actual, expected, `Theme preset mismatch for key ${key}`);
}
console.log('✓ Theme presets verification PASSED');

// Dynamic mocking setup for WebGLContext.jsx
console.log('\nSetting up mocked WebGLContext.jsx...');
const projectRoot = path.resolve(import.meta.dirname, '..');
const contextFileContent = fs.readFileSync(path.join(projectRoot, 'src/context/WebGLContext.jsx'), 'utf8');

// Replace imports to target mock React and correct paths
let mockedContent = contextFileContent
  .replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from './mock_react.js';")
  .replace("import soundManager from '../utils/SoundManager';", "import soundManager from '../src/utils/SoundManager.js';")
  .replace("import { themePresets } from '../utils/themePresets';", "import { themePresets } from '../src/utils/themePresets.js';")
  .replace("import { WebGLContext } from './WebGLContextCore';", "const WebGLContext = { Provider: ({ value, children }) => ({ value, children }) };")
  .replace(
    `  return (
    <WebGLContext.Provider value={{
      activeTheme,
      changeTheme,
      themePresets,
      mouseRef,
      audioDataRef
    }}>
      {children}
    </WebGLContext.Provider>
  );`,
    `  return WebGLContext.Provider({
    value: {
      activeTheme,
      changeTheme,
      themePresets,
      mouseRef,
      audioDataRef
    },
    children
  });`
  );

const mockContextPath = path.join(projectRoot, 'tests/WebGLContext.mocked.js');
fs.writeFileSync(mockContextPath, mockedContent, 'utf8');

// Import the mocked context and React state manager dynamically after writing
const { WebGLProvider } = await import('./WebGLContext.mocked.js');
import { resetMockReact, getMockEffects, getMockState } from './mock_react.js';
import soundManager from '../src/utils/SoundManager.js';

// Spy on SoundManager's playClick
let playClickCalled = false;
soundManager.playClick = () => {
  playClickCalled = true;
};

// Initialize the component execution
console.log('Executing WebGLProvider...');
const result = WebGLProvider({ children: 'test-children' });
const { value } = result;
const { activeTheme, changeTheme, mouseRef, audioDataRef } = value;

// Run the effects
const effects = getMockEffects();
const cleanupFns = [];
for (const effect of effects) {
  const cleanup = effect.callback();
  if (cleanup) {
    cleanupFns.push(cleanup);
  }
}

// Verify 2: activeTheme and changeTheme correctly update the document state and play click sound.
console.log('\n--- TEST 2: Theme Changing Logic ---');
assert.strictEqual(getMockState(), 'cyan', 'Initial theme state should be "cyan"');

// Change theme to crimson
playClickCalled = false;
changeTheme('crimson');
assert.strictEqual(getMockState(), 'crimson', 'Theme state should change to "crimson"');
assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'crimson', 'Document attribute data-theme should be "crimson"');
assert.ok(playClickCalled, 'soundManager.playClick should be called on valid theme change');

// Change theme to an invalid one
playClickCalled = false;
changeTheme('invalid-theme');
assert.strictEqual(getMockState(), 'crimson', 'Theme state should NOT change on invalid input');
assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'crimson', 'Document attribute data-theme should NOT change on invalid input');
assert.ok(!playClickCalled, 'soundManager.playClick should NOT be called on invalid theme change');

// Change theme to acid
playClickCalled = false;
changeTheme('acid');
assert.strictEqual(getMockState(), 'acid', 'Theme state should change to "acid"');
assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'acid', 'Document attribute data-theme should be "acid"');
assert.ok(playClickCalled, 'soundManager.playClick should be called on valid theme change to acid');

console.log('✓ Theme changing logic verification PASSED');

// Verify 3: The global mouse listener is active and normalizes coordinates as intended.
console.log('\n--- TEST 3: Mouse Listener Coordinate Normalization ---');
const mousemoveHandler = window.listeners.mousemove;
assert.ok(mousemoveHandler, 'Global mousemove event listener should be registered');

// Test center
mousemoveHandler({ clientX: 500, clientY: 400 });
assert.deepStrictEqual(mouseRef.current, { x: 0, y: 0 }, 'Mouse coords at center (500, 400) should normalize to (0, 0)');

// Test top-left corner
mousemoveHandler({ clientX: 0, clientY: 0 });
assert.deepStrictEqual(mouseRef.current, { x: -1, y: 1 }, 'Mouse coords at top-left corner (0, 0) should normalize to (-1, 1)');

// Test bottom-right corner
mousemoveHandler({ clientX: 1000, clientY: 800 });
assert.deepStrictEqual(mouseRef.current, { x: 1, y: -1 }, 'Mouse coords at bottom-right corner (1000, 800) should normalize to (1, -1)');

console.log('✓ Mouse listener coordinate normalization PASSED');

// Verify 4: The audioDataRef updates/oscillates correctly.
console.log('\n--- TEST 4: Audio Ref Oscillation Simulation ---');
assert.deepStrictEqual(audioDataRef.current, { bass: 0.5, mid: 0.5, treble: 0.5 }, 'Initial audio data ref should be the default values');

// Find the animation callback in rafCallbacks
// Note: our mock requestAnimationFrame records them. The first one should be from the audio hook.
const animateCallback = rafCallbacks[0];
assert.ok(animateCallback, 'An animate callback should have been scheduled via requestAnimationFrame');

// Simulate first animation frame at t = 1000 ms (1.0 second)
rafCallbacks = []; // clear to capture next call
animateCallback(1000);

const expectedBass1 = 0.5 + 0.3 * Math.sin(1.0 * 2.0);
const expectedMid1 = 0.4 + 0.25 * Math.sin(1.0 * 3.5);
const expectedTreble1 = 0.3 + 0.2 * Math.sin(1.0 * 5.0);

assert.strictEqual(audioDataRef.current.bass, expectedBass1, 'Bass value oscillation at t=1.0s is incorrect');
assert.strictEqual(audioDataRef.current.mid, expectedMid1, 'Mid value oscillation at t=1.0s is incorrect');
assert.strictEqual(audioDataRef.current.treble, expectedTreble1, 'Treble value oscillation at t=1.0s is incorrect');
assert.strictEqual(rafCallbacks.length, 1, 'Next animation frame should have been scheduled');

// Simulate second animation frame at t = 2000 ms (2.0 seconds)
const nextCallback = rafCallbacks[0];
rafCallbacks = [];
nextCallback(2000);

const expectedBass2 = 0.5 + 0.3 * Math.sin(2.0 * 2.0);
const expectedMid2 = 0.4 + 0.25 * Math.sin(2.0 * 3.5);
const expectedTreble2 = 0.3 + 0.2 * Math.sin(2.0 * 5.0);

assert.strictEqual(audioDataRef.current.bass, expectedBass2, 'Bass value oscillation at t=2.0s is incorrect');
assert.strictEqual(audioDataRef.current.mid, expectedMid2, 'Mid value oscillation at t=2.0s is incorrect');
assert.strictEqual(audioDataRef.current.treble, expectedTreble2, 'Treble value oscillation at t=2.0s is incorrect');
assert.strictEqual(rafCallbacks.length, 1, 'Third animation frame should have been scheduled');

console.log('✓ Audio ref oscillation simulation verification PASSED');

// Cleanup event listeners and mocks
console.log('\nPerforming cleanups...');
for (const cleanup of cleanupFns) {
  cleanup();
}
assert.ok(!window.listeners.mousemove, 'Global mousemove event listener should be removed after cleanup');

// Remove temporary mocked file
fs.unlinkSync(mockContextPath);
console.log('✓ Cleanups completed successfully');
console.log('\n================ ALL TESTS PASSED SUCCESSFULLY ================');
