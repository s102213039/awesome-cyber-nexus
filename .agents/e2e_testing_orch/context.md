# Context for E2E Testing Orchestrator

## Directories
- Project Root: `/Users/yanli/AndroidStudioProjects/awesomeWeb`
- Working Directory: `/Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/e2e_testing_orch`

## Current Environment
- Node.js environment
- Vite project with Three.js (planned), React, SVG HUD
- No existing tests or test frameworks.

## Goals & Requirements
- Target: 49+ tests (20 Tier 1, 20 Tier 2, 4 Tier 3, 5 Tier 4).
- Output: `TEST_INFRA.md`, `TEST_READY.md`, test runner command.
- Opaque-box E2E testing of WebGL canvas, music visualizer, HUD controls, theme switching.
- Since it is a React app run in standard web browsers, we might need a headless browser (like Playwright, Puppeteer) or a mock environment.
- Let's check what tools and commands are available to run tests, and what packages are installed in the node_modules.
