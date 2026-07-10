async function runCommand(client, commandText) {
  await client.type('.cyber-terminal-container input', commandText);
  await client.evaluate(`
    (() => {
      const form = document.querySelector('.cyber-terminal-container form');
      if (!form) throw new Error('Terminal form not found');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    })()
  `);
}

async function waitForScanToFinish(client) {
  const startTime = Date.now();
  while (true) {
    const isScanning = await client.evaluate(`
      (() => {
        const input = document.querySelector('.cyber-terminal-container input');
        return input ? input.disabled : false;
      })()
    `);
    if (!isScanning) return;
    if (Date.now() - startTime > 10000) {
      throw new Error('Timeout waiting for scan to finish');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

export const tests = [
  {
    name: 'T2-1: Focus is automatically directed to input when the terminal area is clicked',
    run: async (client) => {
      await client.evaluate(`document.querySelector('.cyber-terminal-container input').blur()`);
      const isActiveBefore = await client.evaluate(`document.activeElement === document.querySelector('.cyber-terminal-container input')`);
      if (isActiveBefore) {
        throw new Error('Expected input to be blurred before click');
      }
      await client.click('.cyber-terminal-container');
      const isActiveAfter = await client.evaluate(`document.activeElement === document.querySelector('.cyber-terminal-container input')`);
      if (!isActiveAfter) {
        throw new Error('Input is not focused after clicking terminal container');
      }
    }
  },
  {
    name: 'T2-2: Typing characters correctly populates the terminal input field',
    run: async (client) => {
      await client.type('.cyber-terminal-container input', 'test-command');
      const val = await client.evaluate(`document.querySelector('.cyber-terminal-container input').value`);
      if (val !== 'test-command') {
        throw new Error(`Expected input value to be 'test-command', got '${val}'`);
      }
    }
  },
  {
    name: 'T2-3: Submitting empty commands clears the line and produces a fresh prompt',
    run: async (client) => {
      await client.type('.cyber-terminal-container input', '');
      await client.evaluate(`document.querySelector('.cyber-terminal-container form').dispatchEvent(new Event('submit'))`);
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('op@cyber-nexus:~#')) {
        throw new Error('Fresh prompt not found in history');
      }
    }
  },
  {
    name: 'T2-4: Running \'system\' outputs system metrics',
    run: async (client) => {
      await runCommand(client, 'system');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('--- COGNITIVE NEXUS SYSTEM STATUS ---') || !text.includes('MAINFRAME STATUS: STABLE')) {
        throw new Error(`Expected system output metrics, got: ${text}`);
      }
    }
  },
  {
    name: 'T2-5: Running \'logs\' outputs firewall security events',
    run: async (client) => {
      await runCommand(client, 'logs');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('--- INTERCEPTING FIREWALL LOG STREAM ---') || !text.includes('[IDS_WARN]')) {
        throw new Error(`Expected firewall logs output, got: ${text}`);
      }
    }
  },
  {
    name: 'T2-6: Running \'matrix\' triggers digital cascade stream',
    run: async (client) => {
      await runCommand(client, 'matrix');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      const canvasExists = await client.evaluate(`!!document.querySelector('.cyber-terminal-container canvas')`);
      if (!text.includes('ENGAGING DIGITAL CASCADE STREAM...') || !canvasExists) {
        throw new Error('Matrix stream not engaged or canvas missing');
      }
    }
  },
  {
    name: 'T2-7: Typing \'exit\' exits the matrix screensaver',
    run: async (client) => {
      await runCommand(client, 'exit');
      const canvasExists = await client.evaluate(`!!document.querySelector('.cyber-terminal-container canvas')`);
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (canvasExists || !text.includes('MATRIX RAIN CONCLUDED. SCREEN RESTORED.')) {
        throw new Error('Matrix screensaver still active after exit command');
      }
    }
  },
  {
    name: 'T2-8: Typing an unrecognized command renders an error warning',
    run: async (client) => {
      await runCommand(client, 'invalidcommandxyz');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('COMMAND "invalidcommandxyz" NOT ENCODED')) {
        throw new Error('Expected unrecognized command warning not found');
      }
    }
  },
  {
    name: 'T2-9: Running \'scan\' (without argument) triggers default port scan',
    run: async (client) => {
      await runCommand(client, 'scan');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('CONNECTING TO NEURAL ROUTER NODE: 172.16.84.103')) {
        throw new Error('Default port scan not started on default IP');
      }
    }
  },
  {
    name: 'T2-10: Running \'scan 10.0.0.1\' starts node connectivity diagnostic sweep',
    run: async (client) => {
      await waitForScanToFinish(client);
      await runCommand(client, 'scan 10.0.0.1');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('CONNECTING TO NEURAL ROUTER NODE: 10.0.0.1')) {
        throw new Error('Scan not started on 10.0.0.1');
      }
    }
  },
  {
    name: 'T2-11: Check that input is disabled during scan',
    run: async (client) => {
      const isDisabled = await client.evaluate(`document.querySelector('.cyber-terminal-container input').disabled`);
      if (!isDisabled) {
        throw new Error('Input is not disabled during scan execution');
      }
    }
  },
  {
    name: 'T2-12: Scan completion displays a diagnostic status report (wait for scan completion)',
    run: async (client) => {
      await waitForScanToFinish(client);
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('SCAN PROTOCOL COMPLETION')) {
        throw new Error('Scan completion status report not found');
      }
    }
  },
  {
    name: 'T2-13: Running \'decrypt\' initializes hex bypass challenge',
    run: async (client) => {
      await runCommand(client, 'decrypt');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('COGNITIVE MAINFRAME DECRYPTION TERMINAL ACTIVE')) {
        throw new Error('Decryption challenge not initialized');
      }
    }
  },
  {
    name: 'T2-14: Decryption module generates a list of candidates',
    run: async (client) => {
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('CANDIDATES:')) {
        throw new Error('Candidates list not generated');
      }
    }
  },
  {
    name: 'T2-15: Guessing an invalid candidate displays a \'BAD SYMBOL STREAM\' error',
    run: async (client) => {
      await runCommand(client, 'INVALIDGUESS');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('BAD SYMBOL STREAM: "INVALIDGUESS" IS NOT A VALID CANDIDATE.')) {
        throw new Error('Invalid candidate error not displayed');
      }
    }
  },
  {
    name: 'T2-16: Guessing a wrong candidate decreases tries remaining',
    run: async (client) => {
      let candidates = ['CRYPTO', 'TROJAN', 'MATRIX', 'FIREWALL'];
      let foundWrong = false;
      for (const cand of candidates) {
        await runCommand(client, cand);
        const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
        const lastLines = text.split('\n').slice(-5).join('\n');
        if (lastLines.includes('ACCESS GRANTED')) {
          // Restart decryption and try next candidate
          await runCommand(client, 'decrypt');
        } else {
          if (!text.includes('TRIES REMAINING: 3')) {
            throw new Error(`Expected tries remaining to be 3 after wrong guess, text: ${text}`);
          }
          foundWrong = true;
          break;
        }
      }
      if (!foundWrong) {
        throw new Error('Could not verify wrong guess tries decrement');
      }
    }
  },
  {
    name: 'T2-17: Guessing the correct candidate (or entering wrong guesses to trigger lockout) works correctly',
    run: async (client) => {
      let lockoutFound = false;
      for (let i = 0; i < 10; i++) {
        await runCommand(client, 'CRYPTO');
        const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
        const lastLines = text.split('\n').slice(-5).join('\n');
        if (lastLines.includes('DECRYPTION LOCKOUT INITIATED')) {
          lockoutFound = true;
          break;
        }
        if (lastLines.includes('ACCESS GRANTED')) {
          await runCommand(client, 'decrypt');
        }
      }
      if (!lockoutFound) {
        throw new Error('Lockout warning not triggered after wrong guesses');
      }
    }
  },
  {
    name: 'T2-18: Running \'clear\' clears the terminal history',
    run: async (client) => {
      await runCommand(client, 'clear');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (text.includes('WELCOME') || text.includes('CYBER-NEXUS SECURITY')) {
        throw new Error('Terminal history was not cleared');
      }
    }
  },
  {
    name: 'T2-19: Terminal displays custom help options when \'help\' command is executed',
    run: async (client) => {
      await runCommand(client, 'help');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      if (!text.includes('scan [ip]') || !text.includes('decrypt') || !text.includes('system')) {
        throw new Error('Help subroutines menu not found');
      }
    }
  },
  {
    name: 'T2-20: Terminal line feed scroll-into-view triggers automatically',
    run: async (client) => {
      for (let i = 0; i < 20; i++) {
        await runCommand(client, 'help');
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      const scrollResult = await client.evaluate(`
        (() => {
          const el = Array.from(document.querySelectorAll('.cyber-terminal-container div')).find(d => getComputedStyle(d).overflowY === 'auto');
          if (!el) return { found: false };
          return {
            found: true,
            isScrolled: el.scrollTop > 0,
            scrollTop: el.scrollTop,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight
          };
        })()
      `);
      if (!scrollResult.found) {
        throw new Error('Scrollable terminal container not found');
      }
      if (!scrollResult.isScrolled) {
        throw new Error('Terminal output did not scroll automatically. ' + JSON.stringify(scrollResult));
      }
    }
  },
  {
    name: 'T2-21: Typing \'exit\' when decryption terminal is active terminates decryption and restores core',
    run: async (client) => {
      await runCommand(client, 'decrypt');
      await runCommand(client, 'exit');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      const lastLines = text.split('\n').slice(-5).join('\n');
      if (!lastLines.includes('DECRYPTION TERMINATED. CORE RESTORED.')) {
        throw new Error('Expected decryption to terminate with DECRYPTION TERMINATED. CORE RESTORED. when typing exit');
      }
    }
  },
  {
    name: 'T2-22: Typing \'quit\' (case-insensitive) when decryption terminal is active terminates decryption and restores core',
    run: async (client) => {
      await runCommand(client, 'decrypt');
      await runCommand(client, 'QuIt');
      const text = await client.evaluate(`document.querySelector('.cyber-terminal-container').innerText`);
      const lastLines = text.split('\n').slice(-5).join('\n');
      if (!lastLines.includes('DECRYPTION TERMINATED. CORE RESTORED.')) {
        throw new Error('Expected decryption to terminate with DECRYPTION TERMINATED. CORE RESTORED. when typing quit');
      }
    }
  }
];
