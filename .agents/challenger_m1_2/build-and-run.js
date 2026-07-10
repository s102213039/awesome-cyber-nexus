// build-and-run.js
import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  try {
    console.log("Bundling test runner with Vite...");
    await build({
      configFile: false,
      plugins: [react({ jsxRuntime: 'classic' })],
      resolve: {
        alias: {
          'react': path.resolve(__dirname, 'mock-react.js')
        }
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, 'verify-entry.js'),
          formats: ['es'],
          fileName: 'verify-bundle'
        },
        outDir: __dirname,
        emptyOutDir: false
      }
    });
    
    console.log("Running bundle...");
    // Force cache-busting on rerun
    await import(`./verify-bundle.js?t=${Date.now()}`);
  } catch (err) {
    console.error("Build/Run failed:", err);
    process.exit(1);
  }
}

run();
