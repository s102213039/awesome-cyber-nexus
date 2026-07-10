import { EventEmitter } from 'events';
import fs from 'fs';

export class CDPClient extends EventEmitter {
  constructor(wsUrl) {
    super();
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pendingCommands = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    
    await new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        resolve();
      };
      this.ws.onerror = (err) => {
        reject(err);
      };
    });

    this.ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error('Failed to parse CDP message:', event.data, e);
        return;
      }

      // If it's a response to a pending command
      if (data.id && this.pendingCommands.has(data.id)) {
        const { resolve, reject } = this.pendingCommands.get(data.id);
        this.pendingCommands.delete(data.id);
        if (data.error) {
          reject(new Error(data.error.message || JSON.stringify(data.error)));
        } else {
          resolve(data.result);
        }
      }

      // Also emit any event method received from CDP
      if (data.method) {
        this.emit(data.method, data.params);
      }
    };
  }

  async send(method, params = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pendingCommands.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }

  // --- Required API Methods ---

  async navigate(url) {
    // Enable Page notifications so we receive Page.loadEventFired
    await this.send('Page.enable');
    
    return new Promise((resolve, reject) => {
      const onLoad = () => {
        this.off('Page.loadEventFired', onLoad);
        resolve();
      };
      this.on('Page.loadEventFired', onLoad);
      
      this.send('Page.navigate', { url }).catch((err) => {
        this.off('Page.loadEventFired', onLoad);
        reject(err);
      });
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception.description || JSON.stringify(res.exceptionDetails.exception);
      throw new Error(`Evaluation failed: ${desc}`);
    }
    return res.result.value;
  }

  async click(selector) {
    await this.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("Element not found for click: " + ${JSON.stringify(selector)});
        el.click();
      })()
    `);
  }

  async type(selector, text) {
    await this.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("Element not found for type: " + ${JSON.stringify(selector)});
        el.focus();
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        if (nativeValueSetter) {
          nativeValueSetter.call(el, ${JSON.stringify(text)});
        } else {
          el.value = ${JSON.stringify(text)};
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
  }

  async waitForSelector(selector, timeoutMs = 5000) {
    const startTime = Date.now();
    while (true) {
      const found = await this.evaluate(`
        (() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        })()
      `);
      if (found) return true;
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Timeout waiting for selector: ${selector}`);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async captureScreenshot(path) {
    const res = await this.send('Page.captureScreenshot', {
      format: 'png'
    });
    fs.writeFileSync(path, Buffer.from(res.data, 'base64'));
  }
}
