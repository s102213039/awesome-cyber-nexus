import { spawn } from 'child_process';

const chromePath = '/Users/yanli/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';

async function run() {
  console.log('Spawning Chrome...');
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  chrome.on('error', (err) => {
    console.error('Failed to start Chrome:', err);
  });

  // Wait 2 seconds for Chrome to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('Fetching targets from http://127.0.0.1:9222/json/version...');
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const versionInfo = await res.json();

    const browserWsUrl = versionInfo.webSocketDebuggerUrl;
    console.log('Connecting to Browser WebSocket:', browserWsUrl);
    const browserWs = new WebSocket(browserWsUrl);

    let pageTargetId = null;

    browserWs.onopen = () => {
      // Create a target
      browserWs.send(JSON.stringify({
        id: 1,
        method: 'Target.createTarget',
        params: { url: 'about:blank' }
      }));
    };

    browserWs.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 1) {
        pageTargetId = data.result.targetId;
        console.log('Target created:', pageTargetId);
        browserWs.close();
      }
    };

    // Wait for the browser connection to close
    await new Promise((resolve) => {
      browserWs.onclose = resolve;
    });

    if (pageTargetId) {
      const pageWsUrl = `ws://127.0.0.1:9222/devtools/page/${pageTargetId}`;
      console.log('Connecting to Page WebSocket:', pageWsUrl);
      const pageWs = new WebSocket(pageWsUrl);

      pageWs.onopen = () => {
        console.log('Page WebSocket opened! Enabling Page...');
        pageWs.send(JSON.stringify({
          id: 1,
          method: 'Page.enable'
        }));
      };

      pageWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received from Page CDP:', data.method || `ID: ${data.id}`, data.result || data.params || '');

        if (data.id === 1) {
          // Page enabled, let's navigate to example.com
          console.log('Navigating to https://example.com...');
          pageWs.send(JSON.stringify({
            id: 2,
            method: 'Page.navigate',
            params: { url: 'https://example.com' }
          }));
        } else if (data.id === 2) {
          console.log('Navigation call sent.');
        }

        // Listen for Page.loadEventFired
        if (data.method === 'Page.loadEventFired') {
          console.log('Page loaded! Evaluating script...');
          pageWs.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: '({ title: document.title, heading: document.querySelector("h1")?.innerText })',
              returnByValue: true
            }
          }));
        }

        if (data.id === 3) {
          console.log('Script evaluation result:', data.result.result.value);
          pageWs.close();
        }
      };

      await new Promise((resolve) => {
        pageWs.onclose = resolve;
      });
    }
  } catch (err) {
    console.error('Error during CDP communication:', err);
  } finally {
    console.log('Killing Chrome gracefully...');
    chrome.kill('SIGTERM');
  }
}

run();
