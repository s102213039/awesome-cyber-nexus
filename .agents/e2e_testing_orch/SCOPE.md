# Scope: awesomeWeb E2E Testing Suite

## Architecture
The E2E test suite will be opaque-box, testing the compiled output (`dist/`) or the running dev server of the awesomeWeb application. It will verify:
1. 3D WebGL Particle Cyber Space (canvas rendering, particle count/activity, mouse interactive displacement).
2. Audio Visualization Engine (audio play/pause controls, frequency analyser connection and data propagation, visual updates in sync).
3. Glitch Art & FUI HUD Interface (CSS animations, scanner/CRT filter, RGB split, flowing SVG path stroke-dashoffset).
4. Multi-Theme System (theme switching updates CSS variables, Three.js colors, and triggers synth transition sound).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | E2E Test Infra & Strategy | Investigate env, choose/implement E2E runner & mocks (e.g., custom browser harness or jsdom mock), publish `TEST_INFRA.md`. | None | DONE |
| M2 | Tier 1 Feature Coverage Tests | Implement >= 20 Tier 1 tests covering all 4 core features in isolation. | M1 | DONE |
| M3 | Tier 2 Boundary & Corner Tests | Implement >= 20 Tier 2 tests covering boundaries (empty, limits, transitions, error robustness). | M2 | DONE |
| M4 | Tier 3 & Tier 4 Tests | Implement >= 4 Tier 3 (cross-feature) and >= 5 Tier 4 (real-world application scenario) tests. | M3 | DONE |
| M5 | Test Run & TEST_READY | Execute the complete suite, verify output, and publish `TEST_READY.md`. | M4 | DONE |

## Interface Contracts
### E2E Test Runner ↔ Test Cases
- The runner must be executable via a single command (e.g. `npm run test:e2e` or `node scripts/run-e2e-tests.js`).
- Test cases must output clear results (pass/fail status, error details) to stdout and a summary file.
- The runner must exit with code 0 if all tests pass, and code 1 otherwise.
