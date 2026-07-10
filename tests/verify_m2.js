import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import net from 'net';
import { CDPClient } from './cdp-client.js';

const chromePath = '/Users/yanli/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';

async function findOpenPort(defaultPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(defaultPort, '127.0.0.1', () => {
      server.close(() => resolve(defaultPort));
    });
    server.on('error', () => {
      const freeServer = net.createServer();
      freeServer.listen(0, '127.0.0.1', () => {
        const port = freeServer.address().port;
        freeServer.close(() => resolve(port));
      });
    });
  });
}

function getPerformanceMetric(metrics, name) {
  const metric = metrics.find((m) => m.name === name);
  return metric ? metric.value : 0;
}

async function main() {
  let viteServer = null;
  let chromeProcess = null;
  let client = null;
  let passed = true;

  try {
    console.log('--- STARTING EMPIRICAL VERIFICATION FOR MILESTONE 2 ---');

    // 1. Build the application
    console.log('Building the application...');
    execSync('npm run build', { stdio: 'inherit' });

    // 2. Find open port and spawn Vite preview
    const vitePort = await findOpenPort(4173);
    console.log(`Spawning Vite preview server on port ${vitePort}...`);
    viteServer = spawn('npx', ['vite', 'preview', '--port', vitePort.toString(), '--host', '127.0.0.1'], {
      stdio: 'pipe'
    });

    // Wait until the preview server is ready
    const appUrl = `http://127.0.0.1:${vitePort}`;
    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(appUrl);
        if (res.status === 200) {
          serverReady = true;
          break;
        }
      } catch (e) {}
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!serverReady) {
      throw new Error('Vite preview server failed to start within timeout.');
    }
    console.log(`Vite preview server is ready at ${appUrl}`);

    // 3. Find open port and spawn Google Chrome Headless Shell
    const chromePort = await findOpenPort(9222);
    console.log(`Spawning Chrome headless shell on port ${chromePort}...`);
    chromeProcess = spawn(chromePath, [
      '--headless',
      `--remote-debugging-port=${chromePort}`,
      '--no-sandbox',
      '--disable-extensions',
      '--use-gl=angle',
      '--use-angle=metal',
      'about:blank'
    ]);

    // Wait until Chrome debugging API is ready
    const chromeVersionUrl = `http://127.0.0.1:${chromePort}/json/version`;
    let chromeReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(chromeVersionUrl);
        if (res.status === 200) {
          chromeReady = true;
          break;
        }
      } catch (e) {}
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!chromeReady) {
      throw new Error('Chrome remote debugging interface failed to start.');
    }
    console.log('Chrome debugging interface is ready.');

    // 4. Connect to Page target
    const listRes = await fetch(`http://127.0.0.1:${chromePort}/json/list`);
    const targets = await listRes.json();
    let pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      const newRes = await fetch(`http://127.0.0.1:${chromePort}/json/new`, { method: 'PUT' });
      pageTarget = await newRes.json();
    }
    const pageWsUrl = pageTarget.webSocketDebuggerUrl;
    client = new CDPClient(pageWsUrl);
    await client.connect();
    console.log('CDP Client connected.');

    // Enable domains
    await client.send('Runtime.enable');
    client.on('Runtime.consoleAPICalled', (params) => {
      const args = params.args.map(arg => arg.value || arg.description || '').join(' ');
      console.log(`[Browser Console ${params.type}]:`, args);
    });
    client.on('Runtime.exceptionThrown', (params) => {
      console.error('[Browser Uncaught Exception]:', params.exceptionDetails.exception.description);
    });
    await client.send('Page.enable');
    await client.send('HeapProfiler.enable');
    await client.send('Performance.enable');

    // 5. Inject WebGL interceptor and performance monitor on document start
    const interceptorCode = `
      window.pointsDrawCount = 0;
      const wrapDraw = (proto) => {
        if (!proto) return;
        const originalDraw = proto.drawArrays;
        proto.drawArrays = function(mode, first, count) {
          if (mode === this.POINTS) {
            window.pointsDrawCount = Math.max(window.pointsDrawCount, count);
          }
          return originalDraw.call(this, mode, first, count);
        };
      };
      wrapDraw(WebGLRenderingContext.prototype);
      wrapDraw(WebGL2RenderingContext.prototype);

      // Monitor frame intervals
      window.frameIntervals = [];
      let lastTime = performance.now();
      function monitorFrame() {
        const now = performance.now();
        window.frameIntervals.push(now - lastTime);
        lastTime = now;
        requestAnimationFrame(monitorFrame);
      }
      requestAnimationFrame(monitorFrame);
    `;

    await client.send('Page.addScriptToEvaluateOnNewDocument', { source: interceptorCode });

    // 6. Navigate to app
    console.log(`Navigating to ${appUrl}...`);
    await client.navigate(appUrl);
    console.log('Navigation complete. Waiting 5s for particle system and WebGL initialization...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 7. Measure Baseline Memory Usage
    console.log('Triggering GC and collecting baseline performance metrics...');
    await client.send('HeapProfiler.collectGarbage');
    const baselinePerformance = await client.send('Performance.getMetrics');
    const baselineHeap = getPerformanceMetric(baselinePerformance.metrics, 'JSHeapUsedSize');
    const baselineListeners = getPerformanceMetric(baselinePerformance.metrics, 'JSEventListeners');
    const baselineNodes = getPerformanceMetric(baselinePerformance.metrics, 'Nodes');
    console.log(`Baseline Memory Metrics:
  - JS Heap Used Size: ${(baselineHeap / 1024 / 1024).toFixed(3)} MB
  - JS Event Listeners: ${baselineListeners}
  - DOM Nodes: ${baselineNodes}`);

    // 8. Simulate Mouse Interactivity for 5 seconds to exercise WebGL distortion logic
    console.log('Simulating mouse movements to trigger mouse distortion logic...');
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2 * 3; // 3 loops
      const radius = 200;
      const x = 500 + Math.cos(angle) * radius;
      const y = 400 + Math.sin(angle) * radius;
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x,
        y
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 9. Measure Final Memory Usage
    console.log('Triggering GC and collecting final performance metrics...');
    await client.send('HeapProfiler.collectGarbage');
    const finalPerformance = await client.send('Performance.getMetrics');
    const finalHeap = getPerformanceMetric(finalPerformance.metrics, 'JSHeapUsedSize');
    const finalListeners = getPerformanceMetric(finalPerformance.metrics, 'JSEventListeners');
    const finalNodes = getPerformanceMetric(finalPerformance.metrics, 'Nodes');
    console.log(`Final Memory Metrics:
  - JS Heap Used Size: ${(finalHeap / 1024 / 1024).toFixed(3)} MB
  - JS Event Listeners: ${finalListeners}
  - DOM Nodes: ${finalNodes}`);

    // 10. Extract Particle Count & Frame rate metrics from browser
    const pointsCount = await client.evaluate('window.pointsDrawCount');
    const frameIntervals = await client.evaluate('window.frameIntervals');

    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(`WebGL Points Drawn: ${pointsCount}`);

    if (pointsCount < 2000) {
      console.error(`❌ FAILED: Particle count is ${pointsCount}, expected >= 2000.`);
      passed = false;
    } else {
      console.log('✅ PASSED: Particle count uses 2000+ points.');
    }

    // Performance statistics
    if (frameIntervals && frameIntervals.length > 0) {
      const sum = frameIntervals.reduce((a, b) => a + b, 0);
      const avgInterval = sum / frameIntervals.length;
      const maxInterval = Math.max(...frameIntervals);
      const fps = 1000 / avgInterval;
      
      // Calculate dropped frames (frames taking longer than 32ms / ~30fps target)
      const droppedFrames = frameIntervals.filter((val) => val > 32).length;
      const droppedPct = (droppedFrames / frameIntervals.length) * 100;

      console.log(`Rendering Performance:
  - Total frames tracked: ${frameIntervals.length}
  - Average frame interval: ${avgInterval.toFixed(2)} ms (~${fps.toFixed(1)} FPS)
  - Max frame interval: ${maxInterval.toFixed(2)} ms
  - Dropped frames (>32ms): ${droppedFrames} (${droppedPct.toFixed(2)}%)`);

      if (fps < 50) {
        console.warn(`⚠️ WARNING: Average FPS is low (${fps.toFixed(1)} FPS).`);
      } else {
        console.log('✅ PASSED: Stable and high frame rate (>= 50 FPS).');
      }

      if (droppedPct > 5) {
        console.warn(`⚠️ WARNING: High dropped frame percentage (${droppedPct.toFixed(2)}%).`);
      } else {
        console.log('✅ PASSED: Minimal frame drops, no significant performance degradation.');
      }
    } else {
      console.error('❌ FAILED: Could not retrieve frame intervals from browser.');
      passed = false;
    }

    // Memory Leak Checks
    const heapDiffBytes = finalHeap - baselineHeap;
    const heapDiffKB = heapDiffBytes / 1024;
    const listenersDiff = finalListeners - baselineListeners;
    const nodesDiff = finalNodes - baselineNodes;

    console.log(`Resource Leak Analysis:
  - JS Heap growth: ${heapDiffKB.toFixed(2)} KB
  - Event listeners difference: ${listenersDiff}
  - DOM Nodes difference: ${nodesDiff}`);

    // If JS heap growth is significantly positive (e.g. > 500 KB after GC), it could indicate a leak
    if (heapDiffKB > 500) {
      console.error(`❌ FAILED: Significant JS Heap growth of ${heapDiffKB.toFixed(2)} KB detected.`);
      passed = false;
    } else {
      console.log('✅ PASSED: Heap memory is stable, no memory leaks detected.');
    }

    if (listenersDiff > 0) {
      console.error(`❌ FAILED: Event listeners leaked: ${listenersDiff} listeners were not cleaned up.`);
      passed = false;
    } else {
      console.log('✅ PASSED: No event listeners leaked.');
    }

    if (nodesDiff > 0) {
      console.error(`❌ FAILED: DOM nodes leaked: ${nodesDiff} nodes were not cleaned up.`);
      passed = false;
    } else {
      console.log('✅ PASSED: No DOM nodes leaked.');
    }

  } catch (err) {
    console.error('Fatal error during verification:', err);
    passed = false;
  } finally {
    console.log('\nCleaning up processes gracefully...');
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
    if (chromeProcess) {
      console.log('Sending SIGTERM to Chrome...');
      chromeProcess.kill('SIGTERM');
    }
    if (viteServer) {
      console.log('Sending SIGTERM to Vite...');
      viteServer.kill('SIGTERM');
    }
    console.log('Done.');
    process.exit(passed ? 0 : 1);
  }
}

main();
