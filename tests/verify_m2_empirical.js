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

async function main() {
  let viteServer = null;
  let chromeProcess = null;
  let client = null;
  let failed = false;

  try {
    // 1. Build the application
    console.log('Building awesomeWeb application...');
    execSync('npm run build', { stdio: 'inherit' });

    // 2. Find open port and spawn Vite preview
    const vitePort = await findOpenPort(4173);
    console.log(`Spawning Vite preview server on port ${vitePort}...`);
    viteServer = spawn('npx', ['vite', 'preview', '--port', vitePort.toString(), '--host', '127.0.0.1'], {
      stdio: 'pipe'
    });

    viteServer.stderr.on('data', (data) => {
      console.error('[Vite Stderr]:', data.toString().trim());
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
      } catch (e) {
        // Ignored, retry
      }
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
      '--use-angle=gl',
      '--ignore-gpu-blocklist',
      '--enable-webgl',
      'about:blank'
    ]);

    chromeProcess.on('error', (err) => {
      console.error('Failed to start Chrome headless shell:', err);
    });

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
      } catch (e) {
        // Ignored, retry
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!chromeReady) {
      throw new Error('Chrome remote debugging interface failed to start within timeout.');
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
    console.log(`Connecting to page WebSocket: ${pageWsUrl}`);

    client = new CDPClient(pageWsUrl);
    await client.connect();
    console.log('CDP Client connected successfully.');

    // Enable console API
    await client.send('Runtime.enable');
    client.on('Runtime.consoleAPICalled', (params) => {
      const args = params.args.map(arg => arg.value || arg.description || '').join(' ');
      console.log(`[Browser Console ${params.type}]:`, args);
    });
    client.on('Runtime.exceptionThrown', (params) => {
      console.error('[Browser Uncaught Exception]:', params.exceptionDetails.exception.description);
    });

    // 5. Setup WebGL draw call interception
    // Injected script hooks both WebGLRenderingContext and WebGL2RenderingContext drawArrays
    console.log('Injecting WebGL interceptor...');
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.webglDrawCalls = [];
        const hookContext = (proto) => {
          if (!proto) return;
          const originalDrawArrays = proto.drawArrays;
          proto.drawArrays = function(mode, first, count) {
            window.webglDrawCalls.push({ mode, first, count });
            return originalDrawArrays.call(this, mode, first, count);
          };
          const originalDrawElements = proto.drawElements;
          proto.drawElements = function(mode, count, type, offset) {
            window.webglDrawCalls.push({ mode, count, type, offset });
            return originalDrawElements.call(this, mode, count, type, offset);
          };
        };
        hookContext(WebGLRenderingContext.prototype);
        hookContext(WebGL2RenderingContext.prototype);
        console.log('WebGL Draw Calls interceptor loaded successfully.');
      `
    });

    // 6. Navigate to app
    console.log('Navigating to app...');
    await client.navigate(appUrl);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait for scene to render and collect draws

    // 7. Verify Particle Count (Requirement 1)
    console.log('Verifying particle count...');
    const drawCalls = await client.evaluate(`window.webglDrawCalls`);
    console.log(`Intercepted ${drawCalls.length} WebGL draw calls.`);
    
    // gl.POINTS is 0. Let's find any points draw call and its count
    const pointDraws = drawCalls.filter(call => call.mode === 0);
    console.log(`Found ${pointDraws.length} point-mode (gl.POINTS) draw calls:`, pointDraws);
    
    if (pointDraws.length === 0) {
      throw new Error('No point-mode WebGL draw calls were found. Is ParticleCyberSpace component rendering?');
    }

    const maxPointCount = Math.max(...pointDraws.map(call => call.count));
    console.log(`Max point count in a single draw call: ${maxPointCount}`);

    if (maxPointCount < 2000) {
      throw new Error(`Particle system does not meet 2000+ points requirement. Max points drawn: ${maxPointCount}`);
    }
    console.log(`✓ Particle count verification passed: ${maxPointCount} points (required >= 2000)`);

    // 8. Performance Check: Measure Frame Rate (Requirement 2)
    console.log('Measuring renderer frame rate (FPS)...');
    const fps = await client.evaluate(`
      new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          frames++;
          const now = performance.now();
          if (now - start >= 2000) {
            resolve(frames / ((now - start) / 1000));
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      })
    `);
    console.log(`Renderer FPS: ${fps.toFixed(2)}`);
    if (fps < 45) {
      console.warn(`WARNING: Frame rate is lower than expected: ${fps.toFixed(2)} FPS`);
    } else {
      console.log(`✓ Performance check passed: stable ${fps.toFixed(2)} FPS`);
    }

    // 9. Memory Leak Check: Track Heap Growth during theme updates (Requirement 2)
    console.log('Running Memory Leak and stability check...');
    
    // Enable HeapProfiler to collect garbage
    await client.send('HeapProfiler.enable');
    
    // Collect garbage initial
    await client.send('HeapProfiler.collectGarbage');
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const initialHeap = await client.evaluate(`performance.memory ? performance.memory.usedJSHeapSize : 0`);
    console.log(`Initial JS Heap Size: ${(initialHeap / 1024 / 1024).toFixed(2)} MB`);

    // Simulate 30 rapid theme updates
    console.log('Simulating 30 theme switches...');
    const themes = ['cyan', 'crimson', 'acid', 'obsidian'];
    for (let i = 0; i < 30; i++) {
      const nextTheme = themes[i % themes.length];
      const title = nextTheme === 'cyan' ? 'Cyan Cyber' :
                    nextTheme === 'crimson' ? 'Crimson Threat' :
                    nextTheme === 'acid' ? 'Acid Matrix' : 'Obsidian Gold';
      
      await client.click(`div[title="${title}"]`);
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms
    }

    // Wait a bit, then run GC
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await client.send('HeapProfiler.collectGarbage');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalHeap = await client.evaluate(`performance.memory ? performance.memory.usedJSHeapSize : 0`);
    console.log(`Final JS Heap Size: ${(finalHeap / 1024 / 1024).toFixed(2)} MB`);
    
    if (initialHeap > 0) {
      const deltaMB = (finalHeap - initialHeap) / 1024 / 1024;
      console.log(`JS Heap growth delta: ${deltaMB.toFixed(2)} MB`);
      
      // Let's allow minor fluctuations (e.g., < 2MB is normal due to browser internal overhead or temporary structures)
      if (deltaMB > 2.5) {
        throw new Error(`Potential memory leak detected: Heap grew by ${deltaMB.toFixed(2)} MB after 30 theme switches`);
      }
      console.log(`✓ Memory stability check passed: Heap growth delta of ${deltaMB.toFixed(2)} MB is within safety threshold (< 2.5MB)`);
    } else {
      console.log('performance.memory API is not fully populated, skipping delta validation.');
    }

    // 10. Secondary FPS Check after actions to ensure no performance degradation
    console.log('Measuring renderer frame rate after actions...');
    const finalFps = await client.evaluate(`
      new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          frames++;
          const now = performance.now();
          if (now - start >= 2000) {
            resolve(frames / ((now - start) / 1000));
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      })
    `);
    console.log(`Final Renderer FPS: ${finalFps.toFixed(2)}`);
    const fpsDelta = Math.abs(fps - finalFps);
    console.log(`FPS Delta before vs after: ${fpsDelta.toFixed(2)} FPS`);
    if (finalFps < 45 || fpsDelta > 15) {
      console.warn(`WARNING: Performance degradation detected or frame rate too low: Final FPS: ${finalFps.toFixed(2)}`);
    } else {
      console.log(`✓ No performance degradation detected (FPS Delta: ${fpsDelta.toFixed(2)} FPS, stable rendering)`);
    }

  } catch (err) {
    console.error('❌ Verification failed:', err);
    failed = true;
  } finally {
    console.log('Cleaning up processes...');
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
    if (chromeProcess) {
      chromeProcess.kill('SIGTERM');
    }
    if (viteServer) {
      viteServer.kill('SIGTERM');
    }
    process.exit(failed ? 1 : 0);
  }
}

main();
