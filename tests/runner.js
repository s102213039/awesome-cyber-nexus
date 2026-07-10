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
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
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

    // Enable console API and exception logs from browser
    await client.send('Runtime.enable');
    client.on('Runtime.consoleAPICalled', (params) => {
      const args = params.args.map(arg => arg.value || arg.description || '').join(' ');
      console.log(`[Browser Console ${params.type}]:`, args);
    });
    client.on('Runtime.exceptionThrown', (params) => {
      console.error('[Browser Uncaught Exception]:', params.exceptionDetails.exception.description);
    });

    // 5. Discover and run test files
    const testDir = path.resolve('tests');
    const files = fs.readdirSync(testDir);
    const testFiles = files.filter((f) => f.endsWith('.test.js') && f !== 'cdp-client.js' && f !== 'runner.js');

    const context = { appUrl };
    const results = [];

    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    for (const file of testFiles) {
      console.log(`\nRunning test file: ${file}`);
      const filePath = path.join(testDir, file);
      const module = await import(`file://${filePath}`);
      const tests = module.tests || [];

      for (const test of tests) {
        console.log(`  -> Running: ${test.name}`);
        const start = Date.now();
        try {
          await test.run(client, context);
          const duration = Date.now() - start;
          results.push({ name: test.name, status: 'pass', duration });
          console.log(`  ✅ PASSED (${duration}ms)`);
        } catch (err) {
          const duration = Date.now() - start;
          results.push({ name: test.name, status: 'fail', duration, error: err.message });
          console.log(`  ❌ FAILED (${duration}ms): ${err.message}`);

          // Capture screenshot on error
          const safeName = test.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const screenshotPath = `screenshots/error_${safeName}.png`;
          try {
            await client.captureScreenshot(screenshotPath);
            console.log(`     Screenshot captured: ${screenshotPath}`);
          } catch (screenErr) {
            console.error(`     Failed to capture screenshot: ${screenErr.message}`);
          }
        }
      }
    }

    // 6. Summarize results
    console.log('\n==================================================');
    console.log('               E2E TEST REPORT                    ');
    console.log('==================================================');
    let passedCount = 0;
    let failedCount = 0;
    results.forEach((r) => {
      if (r.status === 'pass') {
        passedCount++;
        console.log(`[PASS] ${r.name} (${r.duration}ms)`);
      } else {
        failedCount++;
        console.log(`[FAIL] ${r.name} (${r.duration}ms)`);
        console.log(`       Error: ${r.error}`);
      }
    });
    console.log('--------------------------------------------------');
    console.log(`TOTAL: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    console.log('==================================================');

    if (failedCount > 0) {
      failed = true;
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed = true;
  } finally {
    console.log('Cleaning up processes gracefully...');
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // Ignored
      }
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
    process.exit(failed ? 1 : 0);
  }
}

main();
