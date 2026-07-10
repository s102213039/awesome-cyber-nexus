// verify-entry.js
// Setup global mock DOM before imports
const mockAttributes = {};
const mockListeners = {};
let lastPlayedTone = null;

// Mock window and document
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

// Mock AudioContext to prevent SoundManager errors
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

// Mock requestAnimationFrame callback
let rAFCallback = null;
globalThis.requestAnimationFrame = (cb) => {
  rAFCallback = cb;
  return 1;
};
globalThis.cancelAnimationFrame = (id) => {
  rAFCallback = null;
};

// Now import the mock controls and the target components
import { resetMock, getEffects, getStates, getRefs } from './mock-react.js';
import { themePresets } from '../../src/utils/themePresets.js';
import { WebGLProvider } from '../../src/context/WebGLContext.jsx';
import soundManager from '../../src/utils/SoundManager.js';

// Spy on SoundManager playTone
const originalPlayTone = soundManager.playTone;
soundManager.playTone = function(freq, type, duration, gainStart, gainEnd) {
  lastPlayedTone = { freq, type, duration, gainStart, gainEnd };
  originalPlayTone.call(this, freq, type, duration, gainStart, gainEnd);
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

try {
  console.log("--- 1. Verifying Theme Presets ---");
  assert(themePresets.cyan !== undefined, "themePresets has cyan theme");
  assert(themePresets.cyan.materialColor === '#00f0ff', "cyan materialColor matches");
  assert(themePresets.cyan.glowColor === '#00f0ff', "cyan glowColor matches");
  assert(themePresets.cyan.glowIntensity === 1.2, "cyan glowIntensity matches");
  assert(themePresets.cyan.fogColor === '#02050a', "cyan fogColor matches");
  assert(themePresets.cyan.fogDensity === 0.02, "cyan fogDensity matches");
  assert(themePresets.cyan.fogNear === 1, "cyan fogNear matches");
  assert(themePresets.cyan.fogFar === 50, "cyan fogFar matches");

  assert(themePresets.crimson !== undefined, "themePresets has crimson theme");
  assert(themePresets.crimson.materialColor === '#ff0055', "crimson materialColor matches");
  assert(themePresets.crimson.glowColor === '#ff0055', "crimson glowColor matches");
  assert(themePresets.crimson.glowIntensity === 1.5, "crimson glowIntensity matches");
  assert(themePresets.crimson.fogColor === '#070104', "crimson fogColor matches");
  assert(themePresets.crimson.fogDensity === 0.025, "crimson fogDensity matches");
  assert(themePresets.crimson.fogNear === 1, "crimson fogNear matches");
  assert(themePresets.crimson.fogFar === 40, "crimson fogFar matches");

  assert(themePresets.acid !== undefined, "themePresets has acid theme");
  assert(themePresets.acid.materialColor === '#39ff14', "acid materialColor matches");
  assert(themePresets.acid.glowIntensity === 1.4, "acid glowIntensity matches");
  assert(themePresets.acid.fogColor === '#010601', "acid fogColor matches");
  assert(themePresets.acid.fogDensity === 0.022, "acid fogDensity matches");
  assert(themePresets.acid.fogNear === 1, "acid fogNear matches");
  assert(themePresets.acid.fogFar === 45, "acid fogFar matches");

  assert(themePresets.obsidian !== undefined, "themePresets has obsidian theme");
  assert(themePresets.obsidian.materialColor === '#c5a059', "obsidian materialColor matches");
  assert(themePresets.obsidian.glowIntensity === 0.8, "obsidian glowIntensity matches");
  assert(themePresets.obsidian.fogColor === '#060606', "obsidian fogColor matches");
  assert(themePresets.obsidian.fogDensity === 0.015, "obsidian fogDensity matches");
  assert(themePresets.obsidian.fogNear === 1, "obsidian fogNear matches");
  assert(themePresets.obsidian.fogFar === 60, "obsidian fogFar matches");

  console.log("\n--- 2. Render WebGLProvider & Verify Hooks Setup ---");
  resetMock();
  
  // Call the functional component
  const result = WebGLProvider({
    children: "test-child"
  });
  
  const states = getStates();
  const refs = getRefs();
  const effects = getEffects();
  
  assert(states.length === 1, "Should have 1 state (activeTheme)");
  assert(states[0][0] === 'cyan', "activeTheme defaults to 'cyan'");
  assert(refs.length === 2, "Should have 2 refs (mouseRef and audioDataRef)");
  assert(refs[0].current.x === 0 && refs[0].current.y === 0, "mouseRef defaults to {x: 0, y: 0}");
  assert(refs[1].current.bass === 0.5 && refs[1].current.mid === 0.5 && refs[1].current.treble === 0.5, "audioDataRef defaults to 0.5");
  assert(effects.length === 2, "Should have 2 useEffects registered");

  console.log("\n--- 3. Trigger Effects & Verify mousemove listener ---");
  // Trigger effects
  effects.forEach(cb => cb());
  
  assert(mockListeners['mousemove'] !== undefined, "global mousemove listener should be active");
  
  // Test coordinate normalization:
  // Center
  mockListeners['mousemove']({ clientX: 512, clientY: 384 });
  assert(refs[0].current.x === 0 && refs[0].current.y === 0, "normalized coordinates at center (512, 384) are (0, 0)");
  
  // Top right
  mockListeners['mousemove']({ clientX: 1024, clientY: 0 });
  assert(refs[0].current.x === 1 && refs[0].current.y === 1, "normalized coordinates at top right (1024, 0) are (1, 1)");
  
  // Bottom left
  mockListeners['mousemove']({ clientX: 0, clientY: 768 });
  assert(refs[0].current.x === -1 && refs[0].current.y === -1, "normalized coordinates at bottom left (0, 768) are (-1, -1)");

  console.log("\n--- 4. Verify changeTheme updates DOM state & plays sound ---");
  assert(result !== null && result.props !== undefined, "WebGLProvider returned virtual DOM element");
  const ctxVal = result.props.value;
  assert(ctxVal !== undefined, "WebGLContext.Provider value was found in props");
  assert(ctxVal.activeTheme === 'cyan', "activeTheme in context is 'cyan'");
  
  // Let's call changeTheme('crimson')
  lastPlayedTone = null;
  ctxVal.changeTheme('crimson');
  
  // Check activeTheme state
  assert(states[0][0] === 'crimson', "changeTheme('crimson') updates activeTheme state");
  
  // Check DOM state
  assert(mockAttributes['data-theme'] === 'crimson', "changeTheme('crimson') updates documentElement data-theme attribute");
  
  // Check click sound played
  assert(lastPlayedTone !== null, "soundManager.playClick was triggered");
  assert(lastPlayedTone.freq === 1800, "playClick plays at 1800Hz");
  assert(lastPlayedTone.type === 'sine', "playClick plays sine wave");
  assert(lastPlayedTone.duration === 0.05, "playClick plays for 0.05s");
  
  // Test invalid theme doesn't change anything
  lastPlayedTone = null;
  const oldTheme = states[0][0];
  ctxVal.changeTheme('non-existent-theme');
  assert(states[0][0] === oldTheme, "invalid theme does not update activeTheme state");
  assert(lastPlayedTone === null, "invalid theme does not play click sound");

  console.log("\n--- 5. Verify audioDataRef updates/oscillates correctly ---");
  assert(rAFCallback !== null, "requestAnimationFrame callback is registered");
  
  // Simulate time tick: t = 0
  rAFCallback(0);
  let audioData = refs[1].current;
  assert(Math.abs(audioData.bass - 0.5) < 0.0001, "bass at t=0 is 0.5");
  assert(Math.abs(audioData.mid - 0.4) < 0.0001, "mid at t=0 is 0.4");
  assert(Math.abs(audioData.treble - 0.3) < 0.0001, "treble at t=0 is 0.3");
  
  // Simulate time tick: t = 1000ms = 1s
  rAFCallback(1000);
  audioData = refs[1].current;
  const expectedBass = 0.5 + 0.3 * Math.sin(2.0);
  const expectedMid = 0.4 + 0.25 * Math.sin(3.5);
  const expectedTreble = 0.3 + 0.2 * Math.sin(5.0);
  
  console.log(`At t=1s: bass=${audioData.bass} (expected ${expectedBass}), mid=${audioData.mid} (expected ${expectedMid}), treble=${audioData.treble} (expected ${expectedTreble})`);
  assert(Math.abs(audioData.bass - expectedBass) < 0.0001, "bass oscillation at t=1s is correct");
  assert(Math.abs(audioData.mid - expectedMid) < 0.0001, "mid oscillation at t=1s is correct");
  assert(Math.abs(audioData.treble - expectedTreble) < 0.0001, "treble oscillation at t=1s is correct");

  // Simulate time tick: t = 2000ms = 2s
  rAFCallback(2000);
  audioData = refs[1].current;
  const expectedBass2 = 0.5 + 0.3 * Math.sin(4.0);
  const expectedMid2 = 0.4 + 0.25 * Math.sin(7.0);
  const expectedTreble2 = 0.3 + 0.2 * Math.sin(10.0);
  
  console.log(`At t=2s: bass=${audioData.bass} (expected ${expectedBass2}), mid=${audioData.mid} (expected ${expectedMid2}), treble=${audioData.treble} (expected ${expectedTreble2})`);
  assert(Math.abs(audioData.bass - expectedBass2) < 0.0001, "bass oscillation at t=2s is correct");
  assert(Math.abs(audioData.mid - expectedMid2) < 0.0001, "mid oscillation at t=2s is correct");
  assert(Math.abs(audioData.treble - expectedTreble2) < 0.0001, "treble oscillation at t=2s is correct");

  console.log("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  process.exit(0);

} catch (err) {
  console.error("\n[FAIL] Verification error:", err);
  process.exit(1);
}
