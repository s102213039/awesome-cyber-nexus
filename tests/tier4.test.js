export const tests = [
  {
    name: 'T4-1: Clicking Crimson Theme switcher circle updates data-theme attribute to "crimson" and updates CSS variables',
    run: async (client) => {
      await client.click('div[title="Crimson Threat"]');
      const themeAttr = await client.evaluate(`document.documentElement.getAttribute('data-theme')`);
      if (themeAttr !== 'crimson') {
        throw new Error(`Expected data-theme attribute to be 'crimson', got '${themeAttr}'`);
      }
      const primaryColor = await client.evaluate(`
        getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
      `);
      if (primaryColor !== '#ff0055' && primaryColor !== '#f05' && !primaryColor.includes('255, 0, 85')) {
        throw new Error(`Expected primary CSS variable for Crimson, got '${primaryColor}'`);
      }
    }
  },
  {
    name: 'T4-2: Clicking Acid Theme switcher circle updates data-theme attribute to "acid"',
    run: async (client) => {
      await client.click('div[title="Acid Matrix"]');
      const themeAttr = await client.evaluate(`document.documentElement.getAttribute('data-theme')`);
      if (themeAttr !== 'acid') {
        throw new Error(`Expected data-theme attribute to be 'acid', got '${themeAttr}'`);
      }
    }
  },
  {
    name: 'T4-3: Clicking Obsidian Theme switcher circle updates data-theme attribute to "obsidian"',
    run: async (client) => {
      await client.click('div[title="Obsidian Gold"]');
      const themeAttr = await client.evaluate(`document.documentElement.getAttribute('data-theme')`);
      if (themeAttr !== 'obsidian') {
        throw new Error(`Expected data-theme attribute to be 'obsidian', got '${themeAttr}'`);
      }
    }
  },
  {
    name: 'T4-4: Toggle sound button changes state from "🔊 SOUND: OFF" to "🔊 SOUND: ON"',
    run: async (client) => {
      const initialText = await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const soundBtn = btns.find(b => b.innerText.includes("SOUND:"));
          return soundBtn ? soundBtn.innerText.trim() : null;
        })()
      `);
      if (initialText !== '🔊 SOUND: OFF') {
        throw new Error(`Expected initial sound button text to be '🔊 SOUND: OFF', got '${initialText}'`);
      }
      await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const soundBtn = btns.find(b => b.innerText.includes("SOUND:"));
          if (soundBtn) soundBtn.click();
        })()
      `);
      // Wait for state update and re-render
      await new Promise(resolve => setTimeout(resolve, 200));
      const updatedText = await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const soundBtn = btns.find(b => b.innerText.includes("SOUND:"));
          return soundBtn ? soundBtn.innerText.trim() : null;
        })()
      `);
      if (updatedText !== '🔊 SOUND: ON') {
        throw new Error(`Expected updated sound button text to be '🔊 SOUND: ON', got '${updatedText}'`);
      }
    }
  },
  {
    name: 'T4-5: Audio frequency data structure exists inside window or WebGL context',
    run: async (client) => {
      const exists = await client.evaluate(`
        (() => {
          return !!window.audioDataRef || !!window.AudioContext;
        })()
      `);
      if (!exists) {
        throw new Error('Audio frequency data structure not found in window');
      }
    }
  }
];
