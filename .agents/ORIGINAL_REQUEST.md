# Original User Request

## Initial Request — 2026-07-10T06:57:31Z

一個創意的 WebGL/Canvas 視覺特效藝廊與互動式概念作品集。網頁將著重於極致的迷幻賽博視覺效果、3D 粒子碎裂、故障藝術 (Glitch)、動態 HUD 與音樂視覺化互動，用於展示前端創意思維與互動設計。

Working directory: `/Users/yanli/AndroidStudioProjects/awesomeWeb`
Integrity mode: development

## Requirements

### R1. 3D WebGL 粒子太空背景 (3D WebGL Particle Cyber Space)
使用 Three.js 建立一個沉浸式的 3D 粒子太空背景。粒子需具有平滑飄動、流體軌跡、空間縮放（如黑洞/星空隧道效應）等動態，並能根據滑鼠位置產生局部形變或偏向。

### R2. 音效與音樂視覺化引擎 (Audio Visualization Engine)
利用瀏覽器 Web Audio API 建立音訊分析節點（AnalyserNode），連結網頁內建的電子背景音樂。當音樂播放時，動態讀取頻譜數據（高音、中音、低音），並即時連動 3D 粒子的運動幅度、大小、色彩亮度以及 SVG 幾何線條的跳動。

### R3. 故障藝術與高科技 HUD 介面 (Glitch Art & FUI HUD Interface)
疊加一層高科技 HUD (FUI) 控制面板，包含隨機跳動數據、幾何切角外框。實作 CSS 故障藝術（Glitch Effect），包含文字與圖片抖動、RGB 色彩分離（RGB Split）與單色掃描線效果。HUD 中的 SVG 線條需具備流動延伸動畫（使用 stroke-dashoffset 實作）。

### R4. 多主題色彩系統 (Multi-Theme System)
支援動態主題切換（Cyan Cyber, Crimson Threat, Acid Matrix, Obsidian Gold），切換時需同時改變網頁 CSS 變數與 Three.js 3D 粒子的材質色彩，並伴隨 Web Audio 合成的轉場音效。

## Acceptance Criteria

### WebGL 3D 粒子與互動性 (WebGL 3D Particles & Interaction)
- [ ] 成功載入 Three.js 並渲染超過 2000 個以上的發光粒子。
- [ ] 粒子背景能感知滑鼠移動，產生波紋、吸引或排斥的力場偏移動態。
- [ ] 切換主題色彩時，3D 粒子的發光色澤與材質顏色需平滑變換為主題色。

### 音訊分析與視覺連動 (Audio Analysis & Visual Sync)
- [ ] 整合背景電子樂播放控制器（播放/暫停/靜音）。
- [ ] 啟用音樂播放時，AnalyserNode 需順暢回傳頻譜數據。
- [ ] 3D 粒子的大小、速度或波動幅度，需顯著地隨音樂的節奏/頻率強度產生跳動連動。

### 故障藝術與 HUD 視覺特效 (Glitch & HUD VFX)
- [ ] 網頁核心文字標題與容器需具備 CSS RGB-Split 或字體剪裁故障抖動動畫。
- [ ] 螢幕具備單色掃描線（Scanlines）或微微閃爍的 CRT 濾鏡效果。
- [ ] HUD 面板中的 SVG 幾何邊框或進度條，具備以 `stroke-dashoffset` 驅動的電路流動效果。

### 編譯與構建 (Compilation & Build)
- [ ] 專案在執行 `npm run build` 時順利通過，沒有任何 TypeScript/JavaScript 編譯與打包錯誤。
