export const tests = [
  {
    name: 'T3-1: Neural net visualizer header title is displayed correctly',
    run: async (client) => {
      const headerText = await client.evaluate(`
        (() => {
          const el = document.querySelector('.network-visualizer-container');
          return el ? el.innerText : '';
        })()
      `);
      if (!headerText.includes('NEURAL NETWORK CORE INTRUSION VISUALIZER')) {
        throw new Error(`Expected header title to contain 'NEURAL NETWORK CORE INTRUSION VISUALIZER', got '${headerText}'`);
      }
    }
  },
  {
    name: 'T3-2: Tool buttons "Inject Virus" and "Deploy Patch" are present',
    run: async (client) => {
      const buttonsExist = await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.network-visualizer-container button'));
          const injectBtn = btns.find(b => b.innerText.includes('Inject Virus'));
          const deployBtn = btns.find(b => b.innerText.includes('Deploy Patch'));
          return !!injectBtn && !!deployBtn;
        })()
      `);
      if (!buttonsExist) {
        throw new Error('Inject Virus and/or Deploy Patch buttons not found');
      }
    }
  },
  {
    name: 'T3-3: Clicking "Deploy Patch" updates the tool mode to patch (verify style changes on the button)',
    run: async (client) => {
      // Click Deploy Patch button
      await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.network-visualizer-container button'));
          const deployBtn = btns.find(b => b.innerText.includes('Deploy Patch'));
          if (!deployBtn) throw new Error('Deploy Patch button not found');
          deployBtn.click();
        })()
      `);
      // Verify style changes (color/borderColor should match the active patch style)
      const color = await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.network-visualizer-container button'));
          const deployBtn = btns.find(b => b.innerText.includes('Deploy Patch'));
          return deployBtn ? getComputedStyle(deployBtn).color : null;
        })()
      `);
      if (color !== 'rgb(57, 255, 20)' && color !== '#39ff14') {
        throw new Error(`Expected color to be active green (#39ff14 / rgb(57, 255, 20)), got '${color}'`);
      }
    }
  },
  {
    name: 'T3-4: Clicking "Inject Virus" updates the tool mode to virus',
    run: async (client) => {
      // Click Inject Virus button
      await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.network-visualizer-container button'));
          const injectBtn = btns.find(b => b.innerText.includes('Inject Virus'));
          if (!injectBtn) throw new Error('Inject Virus button not found');
          injectBtn.click();
        })()
      `);
      // Verify style changes
      const color = await client.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.network-visualizer-container button'));
          const injectBtn = btns.find(b => b.innerText.includes('Inject Virus'));
          return injectBtn ? getComputedStyle(injectBtn).color : null;
        })()
      `);
      if (color !== 'rgb(255, 0, 85)' && color !== '#ff0055') {
        throw new Error(`Expected color to be active red (#ff0055 / rgb(255, 0, 85)), got '${color}'`);
      }
    }
  }
];
