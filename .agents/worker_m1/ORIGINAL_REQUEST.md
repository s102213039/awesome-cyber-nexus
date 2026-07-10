## 2026-07-10T07:02:34Z

You are the Worker for Milestone 1: Core Foundation & WebGL Setup.
Your working directory is /Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/worker_m1.
Your task is to implement the following:
1. Install three.js as a production dependency. Use `rtk npm install three` (always prefix commands with rtk to minimize tokens).
2. Ensure React folder structure in `src/`: context, components, hooks, utils (create context and hooks folders).
3. Create `src/context/WebGLContext.jsx` with the global WebGL context wrapper. Define the theme presets mapping theme names (cyan, crimson, acid, obsidian) to WebGL material colors, glow properties, and fog parameters. Also track normalized mouse coordinates global listener and keep an audioDataRef that falls back to simulated oscillation values until Milestone 3.
4. Modify `src/main.jsx` to wrap `<App />` inside `<WebGLProvider>`.
5. Modify `src/App.jsx` to consume theme state (`activeTheme`, `changeTheme`) from the global `useWebGL()` hook instead of local state.
6. Run `rtk npm run build` to verify that the project compiles without errors.

MANDATORY INTEGRITY WARNING — include this verbatim in your work:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write a handoff report handoff.md and changes.md in your working directory /Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/worker_m1. Include the build output and passing verification command in your report. Send a completion message to recipient ID f7371d60-2cca-427b-9e02-1d5ea21ed6d8.
