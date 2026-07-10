export const tests = [
  {
    name: 'T1-1: Verify main page loads (HTTP 200)',
    run: async (client, context) => {
      await client.navigate(context.appUrl);
      const ready = await client.evaluate('document.readyState');
      if (ready !== 'complete' && ready !== 'interactive') {
        throw new Error(`Page readyState is ${ready}`);
      }
    }
  },
  {
    name: 'T1-2: Check document title matches "Cyber-Nexus"',
    run: async (client) => {
      const title = await client.evaluate('document.title');
      if (!title.includes('Cyber-Nexus')) {
        throw new Error(`Expected title to contain 'Cyber-Nexus', got '${title}'`);
      }
    }
  },
  {
    name: 'T1-3: Assert the presence of the WebGL/Canvas CyberMesh element',
    run: async (client) => {
      let exists = false;
      for (let i = 0; i < 20; i++) {
        exists = await client.evaluate('!!document.querySelector("#hero-section canvas")');
        if (exists) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!exists) {
        throw new Error('CyberMesh canvas in hero section not found');
      }
    }
  },
  {
    name: 'T1-4: Assert the presence of the NetworkVisualizer canvas',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector(".network-visualizer-container canvas")');
      if (!exists) {
        throw new Error('NetworkVisualizer canvas not found');
      }
    }
  },
  {
    name: 'T1-5: Verify the SVG dashboard HUD element exists in the DOM',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector("link[type*=\'svg\']")');
      if (!exists) {
        throw new Error('SVG link icon element not found in DOM');
      }
    }
  },
  {
    name: 'T1-6: Verify the command terminal overlay container is visible',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector(".cyber-terminal-container")');
      if (!exists) {
        throw new Error('CyberTerminal container not found');
      }
    }
  },
  {
    name: 'T1-7: Check that default theme CSS variables (Cyan Cyber) are present on the root element',
    run: async (client) => {
      const primary = await client.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()');
      if (primary !== '#00f0ff' && !primary.includes('0, 240, 255')) {
        throw new Error(`Expected Cyan theme primary color, got '${primary}'`);
      }
    }
  },
  {
    name: 'T1-8: Verify CRT scanline overlay element is rendered',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector(".crt-scanlines")');
      if (!exists) {
        throw new Error('CRT scanlines overlay not found');
      }
    }
  },
  {
    name: 'T1-9: Assert initial headers and diagnostic titles display correctly',
    run: async (client) => {
      const headerText = await client.evaluate('document.querySelector("header").innerText');
      if (!headerText.includes('CYBER-NEXUS')) {
        throw new Error(`Expected header to contain 'CYBER-NEXUS', got '${headerText}'`);
      }
    }
  },
  {
    name: 'T1-10: Verify the sound controls (mute/unmute buttons) are visible',
    run: async (client) => {
      const buttonText = await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const soundBtn = btns.find(b => b.innerText.includes("SOUND:"));
          return soundBtn ? soundBtn.innerText : null;
        })()
      `);
      if (!buttonText) {
        throw new Error('Mute/unmute button containing "SOUND:" not found');
      }
    }
  },
  {
    name: 'T1-11: Verify #hero-section container is present',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector("#hero-section")');
      if (!exists) {
        throw new Error('#hero-section container not found');
      }
    }
  },
  {
    name: 'T1-12: Verify #specs-section container is present',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector("#specs-section")');
      if (!exists) {
        throw new Error('#specs-section container not found');
      }
    }
  },
  {
    name: 'T1-13: Verify #terminal-section container is present',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector("#terminal-section")');
      if (!exists) {
        throw new Error('#terminal-section container not found');
      }
    }
  },
  {
    name: 'T1-14: Verify #neural-section container is present',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector("#neural-section")');
      if (!exists) {
        throw new Error('#neural-section container not found');
      }
    }
  },
  {
    name: 'T1-15: Verify footer elements are present in the DOM',
    run: async (client) => {
      const exists = await client.evaluate('!!document.querySelector("footer")');
      if (!exists) {
        throw new Error('Footer element not found');
      }
    }
  },
  {
    name: 'T1-16: Check the sticky header navigation contains link for Core',
    run: async (client) => {
      const linkText = await client.evaluate(`
        (() => {
          const el = document.querySelector('header nav a[href="#hero-section"]');
          return el ? el.innerText : null;
        })()
      `);
      if (!linkText || !linkText.includes('CORE')) {
        throw new Error(`Expected sticky header Core navigation link, got '${linkText}'`);
      }
    }
  },
  {
    name: 'T1-17: Check the sticky header navigation contains link for Specs',
    run: async (client) => {
      const linkText = await client.evaluate(`
        (() => {
          const el = document.querySelector('header nav a[href="#specs-section"]');
          return el ? el.innerText : null;
        })()
      `);
      if (!linkText || !linkText.includes('SPECS')) {
        throw new Error(`Expected sticky header Specs navigation link, got '${linkText}'`);
      }
    }
  },
  {
    name: 'T1-18: Check the sticky header navigation contains link for Shell',
    run: async (client) => {
      const linkText = await client.evaluate(`
        (() => {
          const el = document.querySelector('header nav a[href="#terminal-section"]');
          return el ? el.innerText : null;
        })()
      `);
      if (!linkText || !linkText.includes('SHELL')) {
        throw new Error(`Expected sticky header Shell navigation link, got '${linkText}'`);
      }
    }
  },
  {
    name: 'T1-19: Check the sticky header navigation contains link for Synapse',
    run: async (client) => {
      const linkText = await client.evaluate(`
        (() => {
          const el = document.querySelector('header nav a[href="#neural-section"]');
          return el ? el.innerText : null;
        })()
      `);
      if (!linkText || !linkText.includes('SYNAPSE')) {
        throw new Error(`Expected sticky header Synapse navigation link, got '${linkText}'`);
      }
    }
  },
  {
    name: 'T1-20: Verify that news status ticker has active text container',
    run: async (client) => {
      const hasStatusFeed = await client.evaluate(`
        (() => {
          const footer = document.querySelector('footer');
          return footer ? footer.innerText.includes('STATUS FEED') : false;
        })()
      `);
      if (!hasStatusFeed) {
        throw new Error('News status ticker or active text container not found in footer');
      }
    }
  }
];
