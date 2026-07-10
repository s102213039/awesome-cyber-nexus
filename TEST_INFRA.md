# E2E Testing Infrastructure

This document describes the design and usage of the offline-first, zero-dependency End-to-End (E2E) testing suite for the awesomeWeb application.

## Design Architecture

The E2E testing suite is built on a custom lightweight test runner using the native Chrome DevTools Protocol (CDP).

- **Zero External Dependencies**: The test runner is written in pure JavaScript, utilizing Node.js v22's native global `WebSocket` implementation.
- **Real Browser Testing**: The runner automates Google Chrome Headless Shell to ensure that CSS variables, SVG dash offsets, HTML5 Canvas 2D render loops, and WebGL elements are rendered and executed identically to user environments.
- **Parallel Port Scanning**: The runner dynamically selects open TCP ports for both the Vite preview server and Chrome remote debugging, preventing port conflicts.
- **Automated Lifecycle Management**: Spawns Vite preview server and Chrome headless shell in background processes, runs all tests sequentially, takes screenshots on failure, and shuts down all processes gracefully using SIGTERM.

## CDP Client wrapper (`tests/cdp-client.js`)

Provides a clean, promise-based API around the CDP WebSocket connection:
- `navigate(url)`: Navigates to a page and waits for `Page.loadEventFired`.
- `evaluate(expression)`: Evaluates JavaScript in the browser context and returns results.
- `click(selector)`: Triggers clicks on DOM elements.
- `type(selector, text)`: Simulates keyboard input by typing.
- `waitForSelector(selector, timeoutMs)`: Waits for selector visibility.
- `captureScreenshot(path)`: Captures the viewport and saves it as a PNG.

## Test Runner (`tests/runner.js`)

Main orchestration script that manages server and browser lifecycles:
1. Compiles the React build (`npm run build`).
2. Scans for free ports.
3. Launches the Vite production preview server.
4. Launches Chrome Headless Shell.
5. Connects via native WebSocket to CDP.
6. Automatically loads test cases from the `tests` directory.
7. Executes tests, capturing failure screenshots to the `screenshots/` directory.
8. Cleans up all background processes gracefully.

## How to Run Tests

Ensure the project dependencies are installed, then run E2E tests:

```bash
npm run test:e2e
```
