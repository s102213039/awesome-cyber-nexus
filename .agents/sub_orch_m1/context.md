# Context - Milestone 1: Core Foundation & WebGL Setup

## Project Overview
- Name: awesomeWeb
- Tech Stack: React 19 + Vite 8
- Core dependency to add: `three.js` (installed as `three` in package.json)
- Themes to define: `cyan`, `crimson`, `acid`, `obsidian`

## Directory Structure to ensure
- `src/components`
- `src/hooks`
- `src/utils`
- `src/context`

## Key Files to examine / modify
- `package.json` (add `three` dependency)
- `src/context/WebGLContext.jsx` (new global WebGL context)
- `src/App.jsx` (integrate context)
- `src/main.jsx` (integrate context)
