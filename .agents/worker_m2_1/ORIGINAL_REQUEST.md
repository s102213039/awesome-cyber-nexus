## 2026-07-10T07:11:53Z
You are the Worker for Milestone 2: 3D WebGL Particle Cyber Space.
Your working directory is /Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/worker_m2_1.
Your task is to:
1. Create `src/components/ParticleCyberSpace.jsx`. You should base your implementation on the proposed code found in:
   `/Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/explorer_m2_1/proposed_ParticleCyberSpace.jsx`
   Ensure you cover:
   - High-density points (3000 particles).
   - Cylindrical coordinates to form a tunnel shape.
   - Forward drift/tunnel flow along the Z axis, wrapping particles when they pass the camera or plane.
   - Trigonometric noise-based drifting on all three dimensions.
   - Localized mouse distortion: projects mouseRef.current coordinates onto the scene focal plane at Z=0, repelling and swirling particles inside an influence radius.
   - Smooth LERP transitions for particle material colors, fog color, and fog density based on WebGLContext activeTheme.
   - Modulate particle size, flow velocity, and drift amplitude dynamically using audioDataRef.current.
   - Graceful cleanup of WebGL resources (disposing geometries, materials, renderers, listeners) on unmount.
2. Modify `src/App.jsx` to import and render `ParticleCyberSpace` as a fixed background, and remove `CyberMesh` as outlined in the patch:
   `/Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/explorer_m2_1/proposed_App.jsx.patch`
3. Run the linter (`rtk npm run lint`) and verify that there are no syntax or style errors.
4. Run the production build (`rtk npm run build`) and E2E tests (`rtk npm run test:e2e`) to ensure that all tests pass.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your implementation report in `/Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/worker_m2_1/changes.md` and handoff report in `/Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/worker_m2_1/handoff.md`. Communicate your completion back to parent.
