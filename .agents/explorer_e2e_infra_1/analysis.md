# E2E Infrastructure Analysis and Strategy Report

## 1. Executive Summary
This report analyzes the environment for the `awesomeWeb` project (Cyber-Nexus) to formulate a zero-download, offline-compliant End-to-End (E2E) testing strategy.
Through automated checks, we verified that Node.js v22.22.2 is active, which natively supports the global `WebSocket` API. Although no testing frameworks are installed in `node_modules`, multiple pre-downloaded Playwright browser caches (including `chrome-headless-shell`) are available on this macOS machine.
We propose a lightweight, zero-dependency custom E2E test runner that spawns the Vite preview server and headless Chrome, communicating directly over the Chrome DevTools Protocol (CDP) using Node's native `WebSocket` API. We outline a comprehensive 49-test suite across 4 tiers mapped directly to project specifications.

---

## 2. Environmental Assessment

### Node.js Version
* **Observed Version**: `v22.22.2`
* **Significance**: Node.js v22 includes native support for the global `WebSocket` class. This allows us to connect directly to the Chrome debugger WebSocket port without installing any external libraries (such as `ws`), fulfilling the strict "zero external downloads" requirement in a locked-down code-only environment.

### Browser Binaries and Drivers Available
Through scanning `/Applications` and `~/Library/Caches/ms-playwright`, we identified three available Chrome binaries:
1. **System Google Chrome**:
   * Path: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
   * Version: `149.0.7827.201`
2. **Playwright Cached Google Chrome for Testing**:
   * Path: `/Users/yanli/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
   * Version: `149.0.7827.55`
3. **Playwright Cached Headless Shell** (Fastest & most lightweight):
   * Path: `/Users/yanli/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell`
   * Version: `149.0.7827.55`

### Server Execution Capability
* The project successfully builds using `npm run build` in **135ms**.
* The Vite production preview server (`npx vite preview --port 4173 --host 127.0.0.1`) can be spawned in the background as a child process and handles incoming network requests correctly.

### Cache & Global Packages
* **Global NPM Directory**: `/Users/yanli/.hermes/node/lib` contains `@google/gemini-cli`, `corepack`, `n8n`, `npm`, and `vercel`.
* **NPX Cache**: Located in `~/.npm/_npx` (contains `create-vite`, `create-tauri-app`, and schema validator dependencies).
* **Playwright Cache**: Located in `~/Library/Caches/ms-playwright` containing fully functional binaries for `chromium`, `firefox`, and `webkit`.

---

## 3. Testing Options & Feasibility

### Option A: Native Headless Chrome + Native Node WebSocket CDP (RECOMMENDED)
* **How it works**:
  1. Spawn the built Vite application using `vite preview` on port `4173` in a background subprocess.
  2. Spawn the cached `chrome-headless-shell` with remote debugging enabled (`--headless --remote-debugging-port=9222`).
  3. Query `http://127.0.0.1:9222/json/version` to get the browser WebSocket debugging endpoint.
  4. Use Node's native global `WebSocket` to connect to it.
  5. Create a target (tab) pointing to `http://127.0.0.1:4173`.
  6. Navigate, intercept events, run Javascript assertions, and simulate clicks using the Chrome DevTools Protocol.
  7. Terminate both subprocesses using `SIGTERM` for a graceful shutdown.
* **Pros**: Zero dependencies, utilizes actual browser rendering (crucial for Canvas and Web Audio), supports audio/video contexts, 100% offline compliant, fast startup.
* **Cons**: Requires managing CDP message callbacks manually (but easily wrapped in a simple promise-based API).

### Option B: Custom Node Runner with Mocked DOM (NOT RECOMMENDED)
* **How it works**: Execute React rendering tests inside Node by mocking `window`, `document`, `HTMLCanvasElement`, `AudioContext`, and other web-specific globals.
* **Pros**: Runs in a single process.
* **Cons**: Extremely fragile. The app relies heavily on Canvas 2D render loops, SVG mathematical paths, and Web Audio API node links (Oscillators, Analysers, Gains). Re-implementing a mock framework for Canvas drawings and Web Audio in pure JS without JSDOM is impractical and defeats the purpose of opaque-box E2E testing.

---

## 4. Recommended E2E Testing Strategy
We recommend **Option A (Native Headless Chrome + CDP)**. The test suite is organized into 4 logical tiers containing exactly 49 tests mapping to the project features and design specifications.

### Tier 1: Core Navigation & Interface Rendering (10 Tests)
* **Objective**: Verify initial application load, structural DOM layout, and base styles.
* **Tests**:
  1. **T1-1**: Verify main page loads (HTTP 200).
  2. **T1-2**: Check document title matches "Cyber-Nexus" or custom design guidelines.
  3. **T1-3**: Assert the presence of the WebGL/Canvas `CyberMesh` element.
  4. **T1-4**: Assert the presence of the `NetworkVisualizer` canvas.
  5. **T1-5**: Verify the SVG dashboard HUD element exists in the DOM.
  6. **T1-6**: Verify the command terminal overlay container is visible.
  7. **T1-7**: Check that default theme CSS variables (Cyan Cyber) are present on the root element.
  8. **T1-8**: Verify CRT scanline overlay element is rendered.
  9. **T1-9**: Assert initial headers and diagnostic titles display correctly.
  10. **T1-10**: Verify the sound controls (mute/unmute buttons) are visible.

### Tier 2: Interactive Cyber Terminal Command Suite (15 Tests)
* **Objective**: Validate the functional behaviors, diagnostics commands, and state reactions of the terminal console.
* **Tests**:
  1. **T2-1**: Focus is automatically directed to input when the terminal area is clicked.
  2. **T2-2**: Typing characters correctly populates the terminal input field.
  3. **T2-3**: Submitting empty commands clears the line and produces a fresh prompt.
  4. **T2-4**: Running `system` outputs system metrics (CPU core loads and RAM load).
  5. **T2-5**: Running `logs` outputs scrollable firewall security events.
  6. **T2-6**: Running `matrix` triggers full-screen green matrix code overlay.
  7. **T2-7**: Pressing `Escape` or typing exit exits the matrix screensaver.
  8. **T2-8**: Typing an unrecognized command renders an error warning.
  9. **T2-9**: Running `scan` (without argument) triggers usage help.
  10. **T2-10**: Running `scan 10.0.0.1` starts node connectivity diagnostic sweep.
  11. **T2-11**: Invalid IP syntax input yields verification errors.
  12. **T2-12**: Scan completion displays a diagnostic status report.
  13. **T2-13**: Running `decrypt` initializes Fallout-style hex bypass challenge.
  14. **T2-14**: Decryption module generates a grid of random hex codes and words.
  15. **T2-15**: Command history allows recall of previous entries via Up/Down arrow keys.

### Tier 3: Interactive Visualizer & Threat Map (12 Tests)
* **Objective**: Verify canvas interaction loops, neural node state propagation, and metrics dashboard sync.
* **Tests**:
  1. **T3-1**: Node position array initialization on initial canvas layout.
  2. **T3-2**: Threat map attack vectors generate active visual lines.
  3. **T3-3**: Simulated cursor motion changes node proximity fields (mouse distortion).
  4. **T3-4**: Hovering over interactive node updates the DOM selection HUD overlay.
  5. **T3-5**: Clicking a node toggles its selected state in the panel.
  6. **T3-6**: Deploying "Virus" changes the selected node state value to compromised.
  7. **T3-7**: Deploying "Patch" changes the selected node state value to protected.
  8. **T3-8**: compromised status propagates to neighboring nodes after delay.
  9. **T3-9**: Containment patch blocks threat vectors from spreading through connected routes.
  10. **T3-10**: Reset action restores neural nodes to original threat status levels.
  11. **T3-11**: compromised vs protected counters update in real-time.
  12. **T3-12**: SVG threat visualizer paths updates react to threat state.

### Tier 4: Theme Integration & Web Audio Synchronizer (12 Tests)
* **Objective**: Verify transitions, style mutations, sound synthesizers, and mathematical load models.
* **Tests**:
  1. **T4-1**: Switching to "Cyan Cyber" updates root CSS styles.
  2. **T4-2**: Switching to "Crimson Threat" triggers red warning overlays.
  3. **T4-3**: Switching to "Acid Matrix" applies bright green neon styles.
  4. **T4-4**: Switching to "Obsidian Gold" applies high-contrast dark-gold theme.
  5. **T4-5**: Theme change initiates sweep/SFX audio output.
  6. **T4-6**: Interactive click beep sounds fire upon terminal actions.
  7. **T4-7**: BGM playback can be toggled via HUD buttons.
  8. **T4-8**: Volume control adjustments scale audio output gain nodes.
  9. **T4-9**: Real-time frequency analyzer outputs frequency spectrum tuples (`{ bass, mid, treble }`).
  10. **T4-10**: Canvas coordinates react dynamically to mock audio amplitude pulses.
  11. **T4-11**: System load graphs simulate random walk paths over elapsed time.
  12. **T4-12**: AudioContext suspends automatically when page visibility state becomes hidden.

---

## 5. Architectural Implementation Details

The implementation should consist of a script `e2e_runner.js` containing:
1. A **runner orchestrator** that spawns `vite preview` and `chrome-headless-shell`.
2. A **CDP wrapper class** providing easy-to-use asynchronous methods:
   * `navigate(url)`
   * `evaluate(expression)`
   * `click(selector)`
   * `type(selector, text)`
   * `waitForSelector(selector)`
3. A **Test Framework harness** that loops over the 49 test definitions, executes them, logs assertions, and gathers screenshots (rendered to file system on error using `Page.captureScreenshot`).

This guarantees robust, completely offline testing using only system utilities.
