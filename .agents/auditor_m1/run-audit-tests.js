import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { execSync } from 'child_process';

const __dirname = path.resolve(import.meta.dirname || '');

// Step 1: Transpile WebGLContext.jsx
console.log('Transpiling WebGLContext.jsx...');
const srcPath = '/Users/yanli/AndroidStudioProjects/awesomeWeb/src/context/WebGLContext.jsx';
const transpiledPath = path.join(__dirname, 'WebGLContext.transpiled.js');

try {
  execSync(`npx esbuild "${srcPath}" --jsx=automatic --format=esm --outfile="${transpiledPath}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('esbuild transpilation failed:', e);
  process.exit(1);
}

// Step 2: Post-process transpiled file to replace imports
console.log('Post-processing transpiled file...');
let content = fs.readFileSync(transpiledPath, 'utf8');

// Replace react and react/jsx-runtime with our mock versions
// Note esbuild outputs: import { jsx } from "react/jsx-runtime";
// and: import React, { useState, useEffect, useRef } from "react";
content = content
  .replace(/from\s+["']react\/jsx-runtime["']/g, 'from "./jsx-runtime.js"')
  .replace(/from\s+["']react["']/g, 'from "./mock-react.js"')
  .replace(/from\s+["']\.\.\/utils\/SoundManager["']/g, 'from "../../src/utils/SoundManager.js"')
  .replace(/from\s+["']\.\.\/utils\/themePresets["']/g, 'from "../../src/utils/themePresets.js"')
  .replace(/from\s+["']\.\/WebGLContextCore["']/g, 'from "./WebGLContextCore.mock.js"');

fs.writeFileSync(transpiledPath, content, 'utf8');

// Step 3: Set up mocks
const mockAttributes = {};
const mockListeners = {};
let lastPlayedTone = null;

globalThis.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: (event, cb) => {
    mockListeners[event] = cb;
  },
  removeEventListener: (event, cb) => {
    if (mockListeners[event] === cb) {
      delete mockListeners[event];
    }
  }
};

globalThis.document = {
  documentElement: {
    setAttribute: (name, val) => {
      mockAttributes[name] = val;
    },
    getAttribute: (name) => {
      return mockAttributes[name];
    }
  }
};

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: (freq) => { this.lastFreq = freq; },
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {}
      },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: (g) => { this.lastGain = g; },
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {}
      },
      connect: () => {}
    };
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}
globalThis.window.AudioContext = MockAudioContext;

let rAFCallback = null;
globalThis.requestAnimationFrame = (cb) => {
  rAFCallback = cb;
  return 1;
};
globalThis.cancelAnimationFrame = (id) => {
  rAFCallback = null;
};

// Import the transpiled module and mocks
const { WebGLProvider } = await import('./WebGLContext.transpiled.js');
const { resetMock, getEffects, getStates, getRefs, getProviderValue } = await import('./mock-react.js');
const { themePresets } = await import('../../src/utils/themePresets.js');
const soundManager = (await import('../../src/utils/SoundManager.js')).default;

// Spy on SoundManager playTone
const originalPlayTone = soundManager.playTone;
soundManager.playTone = function(freq, type, duration, gainStart, gainEnd) {
  lastPlayedTone = { freq, type, duration, gainStart, gainEnd };
  originalPlayTone.call(this, freq, type, duration, gainStart, gainEnd);
};

// Verification tests
console.log('Running tests...');

try {
  console.log('--- 1. Verifying Theme Presets ---');
  assert.ok(themePresets.cyan !== undefined, 'themePresets has cyan theme');
  assert.strictEqual(themePresets.cyan.materialColor, '#00f0ff');
  assert.strictEqual(themePresets.cyan.glowColor, '#00f0ff');
  assert.strictEqual(themePresets.cyan.glowIntensity, 1.2);
  assert.strictEqual(themePresets.cyan.fogColor, '#02050a');
  assert.strictEqual(themePresets.cyan.fogDensity, 0.02);

  assert.ok(themePresets.crimson !== undefined, 'themePresets has crimson theme');
  assert.strictEqual(themePresets.crimson.materialColor, '#ff0055');
  assert.strictEqual(themePresets.crimson.glowColor, '#ff0055');
  assert.strictEqual(themePresets.crimson.glowIntensity, 1.5);
  assert.strictEqual(themePresets.crimson.fogColor, '#070104');
  assert.strictEqual(themePresets.crimson.fogDensity, 0.025);

  assert.ok(themePresets.acid !== undefined, 'themePresets has acid theme');
  assert.strictEqual(themePresets.acid.materialColor, '#39ff14');
  assert.strictEqual(themePresets.acid.glowColor, '#39ff14');
  assert.strictEqual(themePresets.acid.glowIntensity, 1.4);
  assert.strictEqual(themePresets.acid.fogColor, '#010601');
  assert.strictEqual(themePresets.acid.fogDensity, 0.022);

  assert.ok(themePresets.obsidian !== undefined, 'themePresets has obsidian theme');
  assert.strictEqual(themePresets.obsidian.materialColor, '#c5a059');
  assert.strictEqual(themePresets.obsidian.glowColor, '#c5a059');
  assert.strictEqual(themePresets.obsidian.glowIntensity, 0.8);
  assert.strictEqual(themePresets.obsidian.fogColor, '#060606');
  assert.strictEqual(themePresets.obsidian.fogDensity, 0.015);

  console.log('[PASS] Theme Presets verification');

  console.log('--- 2. Render WebGLProvider & Verify State ---');
  resetMock();
  WebGLProvider({ children: 'test-child' });

  const states = getStates();
  const refs = getRefs();
  const effects = getEffects();

  assert.strictEqual(states.length, 1, 'Should have 1 state (activeTheme)');
  assert.strictEqual(states[0][0], 'cyan', 'activeTheme defaults to "cyan"');
  assert.strictEqual(refs.length, 2, 'Should have 2 refs (mouseRef and audioDataRef)');
  assert.deepStrictEqual(refs[0].current, { x: 0, y: 0 }, 'mouseRef defaults to {x: 0, y: 0}');
  assert.deepStrictEqual(refs[1].current, { bass: 0.5, mid: 0.5, treble: 0.5 }, 'audioDataRef defaults to 0.5');
  assert.strictEqual(effects.length, 2, 'Should have 2 useEffects registered');

  console.log('[PASS] Provider render state verification');

  console.log('--- 3. Trigger Effects & Verify mousemove listener ---');
  effects.forEach(cb => cb());
  assert.ok(mockListeners['mousemove'] !== undefined, 'global mousemove listener should be active');

  // Test coordinate normalization
  // Center
  mockListeners['mousemove']({ clientX: 512, clientY: 384 });
  assert.deepStrictEqual(refs[0].current, { x: 0, y: 0 }, 'Center coords normalize to (0, 0)');

  // Top right
  mockListeners['mousemove']({ clientX: 1024, clientY: 0 });
  assert.deepStrictEqual(refs[0].current, { x: 1, y: 1 }, 'Top right coords normalize to (1, 1)');

  // Bottom left
  mockListeners['mousemove']({ clientX: 0, clientY: 768 });
  assert.deepStrictEqual(refs[0].current, { x: -1, y: -1 }, 'Bottom left coords normalize to (-1, -1)');

  console.log('[PASS] Mouse listener coordinate normalization');

  console.log('--- 4. Verify changeTheme updates DOM state & plays sound ---');
  const ctxVal = getProviderValue();
  assert.ok(ctxVal !== null, 'WebGLContext.Provider value was captured');
  assert.strictEqual(ctxVal.activeTheme, 'cyan', 'activeTheme in context is "cyan"');

  lastPlayedTone = null;
  ctxVal.changeTheme('crimson');

  assert.strictEqual(states[0][0], 'crimson', 'changeTheme("crimson") updates activeTheme state');
  assert.strictEqual(mockAttributes['data-theme'], 'crimson', 'changeTheme("crimson") updates documentElement attribute');
  assert.ok(lastPlayedTone !== null, 'soundManager.playClick was triggered');
  assert.strictEqual(lastPlayedTone.freq, 1800, 'playClick plays at 1800Hz');
  assert.strictEqual(lastPlayedTone.type, 'sine', 'playClick plays sine wave');

  // Test invalid theme doesn't change state
  lastPlayedTone = null;
  ctxVal.changeTheme('invalid-theme');
  assert.strictEqual(states[0][0], 'crimson', 'invalid theme does not update activeTheme state');
  assert.ok(lastPlayedTone === null, 'invalid theme does not play click sound');

  console.log('[PASS] changeTheme logic and guards');

  console.log('--- 5. Verify audioDataRef updates/oscillates correctly ---');
  assert.ok(rAFCallback !== null, 'requestAnimationFrame callback is registered');

  // Simulate time tick: t = 0
  rAFCallback(0);
  let audioData = refs[1].current;
  assert.ok(Math.abs(audioData.bass - 0.5) < 0.0001, 'bass at t=0 is 0.5');
  assert.ok(Math.abs(audioData.mid - 0.4) < 0.0001, 'mid at t=0 is 0.4');
  assert.ok(Math.abs(audioData.treble - 0.3) < 0.0001, 'treble at t=0 is 0.3');

  // Simulate time tick: t = 1000ms = 1s
  rAFCallback(1000);
  audioData = refs[1].current;
  const expectedBass = 0.5 + 0.3 * Math.sin(2.0);
  const expectedMid = 0.4 + 0.25 * Math.sin(3.5);
  const expectedTreble = 0.3 + 0.2 * Math.sin(5.0);

  assert.ok(Math.abs(audioData.bass - expectedBass) < 0.0001, 'bass at t=1s is correct');
  assert.ok(Math.abs(audioData.mid - expectedMid) < 0.0001, 'mid at t=1s is correct');
  assert.ok(Math.abs(audioData.treble - expectedTreble) < 0.0001, 'treble at t=1s is correct');

  console.log('[PASS] audioDataRef oscillation simulation');

  console.log('\n================ ALL AUDIT TESTS PASSED SUCCESSFULLY! ================');
  fs.unlinkSync(transpiledPath);
  process.exit(0);
} catch (err) {
  console.error('\n[FAIL] Audit verification failed:', err);
  // if (fs.existsSync(transpiledPath)) {
  //   fs.unlinkSync(transpiledPath);
  // }
  process.exit(1);
}
