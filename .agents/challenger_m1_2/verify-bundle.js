//#region .agents/challenger_m1_2/mock-react.js
var e = [], t = 0, n = [], r = 0, i = [];
function a(n) {
	let r = t++;
	return e[r] === void 0 && (e[r] = [n, (t) => {
		e[r][0] = t;
	}]), e[r];
}
function o(e) {
	let t = r++;
	return n[t] === void 0 && (n[t] = { current: e }), n[t];
}
function s(e, t) {
	i.push(e);
}
function c(e) {
	return { Provider: ({ children: e, value: t }) => e };
}
function l(e, t, ...n) {
	return {
		type: e,
		props: t,
		children: n
	};
}
var u = {
	useState: a,
	useRef: o,
	useEffect: s,
	createContext: c,
	createElement: l,
	Fragment: "Symbol(React.Fragment)"
};
function d() {
	e = [], t = 0, n = [], r = 0, i = [];
}
function f() {
	return i;
}
function p() {
	return e;
}
function m() {
	return n;
}
//#endregion
//#region src/utils/themePresets.js
var h = {
	cyan: {
		name: "Cyan Cyber",
		materialColor: "#00f0ff",
		glowColor: "#00f0ff",
		glowIntensity: 1.2,
		fogColor: "#02050a",
		fogDensity: .02,
		fogNear: 1,
		fogFar: 50
	},
	crimson: {
		name: "Crimson Threat",
		materialColor: "#ff0055",
		glowColor: "#ff0055",
		glowIntensity: 1.5,
		fogColor: "#070104",
		fogDensity: .025,
		fogNear: 1,
		fogFar: 40
	},
	acid: {
		name: "Acid Matrix",
		materialColor: "#39ff14",
		glowColor: "#39ff14",
		glowIntensity: 1.4,
		fogColor: "#010601",
		fogDensity: .022,
		fogNear: 1,
		fogFar: 45
	},
	obsidian: {
		name: "Obsidian Gold",
		materialColor: "#c5a059",
		glowColor: "#c5a059",
		glowIntensity: .8,
		fogColor: "#060606",
		fogDensity: .015,
		fogNear: 1,
		fogFar: 60
	}
}, g = new class {
	constructor() {
		this.ctx = null, this.muted = !1;
	}
	init() {
		if (!this.ctx) try {
			this.ctx = new (window.AudioContext || window.webkitAudioContext)();
		} catch (e) {
			console.warn("Web Audio API not supported", e);
		}
	}
	toggleMute() {
		return this.muted = !this.muted, this.muted;
	}
	playTone(e, t, n, r, i = .001) {
		if (this.init(), !(!this.ctx || this.muted)) {
			this.ctx.state === "suspended" && this.ctx.resume();
			try {
				let a = this.ctx.createOscillator(), o = this.ctx.createGain();
				a.type = t, a.frequency.setValueAtTime(e, this.ctx.currentTime), o.gain.setValueAtTime(r, this.ctx.currentTime), o.gain.exponentialRampToValueAtTime(i, this.ctx.currentTime + n), a.connect(o), o.connect(this.ctx.destination), a.start(), a.stop(this.ctx.currentTime + n);
			} catch (e) {
				console.error("Error playing tone", e);
			}
		}
	}
	playClick() {
		this.playTone(1800, "sine", .05, .05);
	}
	playHover() {
		this.playTone(1200, "sine", .02, .02);
	}
	playBeep() {
		this.playTone(880, "triangle", .1, .08);
	}
	playSuccess() {
		this.init(), !(!this.ctx || this.muted) && (this.playTone(523.25, "sine", .1, .05), setTimeout(() => this.playTone(659.25, "sine", .1, .05), 80), setTimeout(() => this.playTone(783.99, "sine", .1, .05), 160), setTimeout(() => this.playTone(1046.5, "sine", .2, .08), 240));
	}
	playError() {
		this.init(), !(!this.ctx || this.muted) && (this.playTone(180, "sawtooth", .25, .1), setTimeout(() => this.playTone(130, "sawtooth", .35, .1), 100));
	}
	playAlarm() {
		if (this.init(), !this.ctx || this.muted) return;
		let e = this.ctx.currentTime, t = this.ctx.createOscillator(), n = this.ctx.createGain();
		t.type = "sawtooth", t.frequency.setValueAtTime(330, e), t.frequency.linearRampToValueAtTime(660, e + .25), t.frequency.linearRampToValueAtTime(330, e + .5), t.frequency.linearRampToValueAtTime(660, e + .75), t.frequency.linearRampToValueAtTime(330, e + 1), n.gain.setValueAtTime(.08, e), n.gain.linearRampToValueAtTime(.08, e + .8), n.gain.exponentialRampToValueAtTime(.001, e + 1), t.connect(n), n.connect(this.ctx.destination), t.start(), t.stop(e + 1);
	}
	playScan() {
		if (this.init(), !this.ctx || this.muted) return;
		let e = this.ctx.currentTime, t = .8, n = this.ctx.createOscillator(), r = this.ctx.createGain();
		n.type = "sine", n.frequency.setValueAtTime(100, e), n.frequency.exponentialRampToValueAtTime(2500, e + t), r.gain.setValueAtTime(.03, e), r.gain.exponentialRampToValueAtTime(.001, e + t), n.connect(r), r.connect(this.ctx.destination), n.start(), n.stop(e + t);
	}
	playMatrix() {
		let e = 800 + Math.random() * 1200;
		this.playTone(e, "sine", .04, .015);
	}
}(), _ = c(null);
//#endregion
//#region src/context/WebGLContext.jsx
function v({ children: e }) {
	let [t, n] = a("cyan"), r = o({
		x: 0,
		y: 0
	}), i = o({
		bass: .5,
		mid: .5,
		treble: .5
	});
	return s(() => {
		let e = (e) => {
			let t = e.clientX / window.innerWidth * 2 - 1, n = -(e.clientY / window.innerHeight) * 2 + 1;
			r.current = {
				x: t,
				y: n
			};
		};
		return window.addEventListener("mousemove", e), () => {
			window.removeEventListener("mousemove", e);
		};
	}, []), s(() => {
		let e, t = (n) => {
			let r = n * .001;
			i.current = {
				bass: .5 + .3 * Math.sin(r * 2),
				mid: .4 + .25 * Math.sin(r * 3.5),
				treble: .3 + .2 * Math.sin(r * 5)
			}, e = requestAnimationFrame(t);
		};
		return e = requestAnimationFrame(t), () => {
			cancelAnimationFrame(e);
		};
	}, []), /* @__PURE__ */ u.createElement(_.Provider, { value: {
		activeTheme: t,
		changeTheme: (e) => {
			h[e] && (n(e), document.documentElement.setAttribute("data-theme", e), g.playClick());
		},
		themePresets: h,
		mouseRef: r,
		audioDataRef: i
	} }, e);
}
//#endregion
//#region .agents/challenger_m1_2/verify-entry.js
var y = {}, b = {}, x = null;
globalThis.window = {
	innerWidth: 1024,
	innerHeight: 768,
	addEventListener: (e, t) => {
		b[e] = t;
	},
	removeEventListener: (e, t) => {
		b[e] === t && delete b[e];
	}
}, globalThis.document = { documentElement: {
	setAttribute: (e, t) => {
		y[e] = t;
	},
	getAttribute: (e) => y[e]
} };
var S = class {
	constructor() {
		this.state = "running", this.currentTime = 0;
	}
	createOscillator() {
		return {
			type: "sine",
			frequency: {
				setValueAtTime: (e) => {
					this.lastFreq = e;
				},
				exponentialRampToValueAtTime: () => {},
				linearRampToValueAtTime: () => {}
			},
			connect: () => {},
			start: () => {},
			stop: () => {}
		};
	}
	createGain() {
		return {
			gain: {
				setValueAtTime: (e) => {
					this.lastGain = e;
				},
				exponentialRampToValueAtTime: () => {},
				linearRampToValueAtTime: () => {}
			},
			connect: () => {}
		};
	}
	resume() {
		return this.state = "running", Promise.resolve();
	}
};
globalThis.window.AudioContext = S;
var C = null;
globalThis.requestAnimationFrame = (e) => (C = e, 1), globalThis.cancelAnimationFrame = (e) => {
	C = null;
};
var w = g.playTone;
g.playTone = function(e, t, n, r, i) {
	x = {
		freq: e,
		type: t,
		duration: n,
		gainStart: r,
		gainEnd: i
	}, w.call(this, e, t, n, r, i);
};
function T(e, t) {
	if (!e) throw Error(`Assertion failed: ${t}`);
	console.log(`[PASS] ${t}`);
}
try {
	console.log("--- 1. Verifying Theme Presets ---"), T(h.cyan !== void 0, "themePresets has cyan theme"), T(h.cyan.materialColor === "#00f0ff", "cyan materialColor matches"), T(h.cyan.glowColor === "#00f0ff", "cyan glowColor matches"), T(h.cyan.glowIntensity === 1.2, "cyan glowIntensity matches"), T(h.cyan.fogColor === "#02050a", "cyan fogColor matches"), T(h.cyan.fogDensity === .02, "cyan fogDensity matches"), T(h.cyan.fogNear === 1, "cyan fogNear matches"), T(h.cyan.fogFar === 50, "cyan fogFar matches"), T(h.crimson !== void 0, "themePresets has crimson theme"), T(h.crimson.materialColor === "#ff0055", "crimson materialColor matches"), T(h.crimson.glowColor === "#ff0055", "crimson glowColor matches"), T(h.crimson.glowIntensity === 1.5, "crimson glowIntensity matches"), T(h.crimson.fogColor === "#070104", "crimson fogColor matches"), T(h.crimson.fogDensity === .025, "crimson fogDensity matches"), T(h.crimson.fogNear === 1, "crimson fogNear matches"), T(h.crimson.fogFar === 40, "crimson fogFar matches"), T(h.acid !== void 0, "themePresets has acid theme"), T(h.acid.materialColor === "#39ff14", "acid materialColor matches"), T(h.acid.glowIntensity === 1.4, "acid glowIntensity matches"), T(h.acid.fogColor === "#010601", "acid fogColor matches"), T(h.acid.fogDensity === .022, "acid fogDensity matches"), T(h.acid.fogNear === 1, "acid fogNear matches"), T(h.acid.fogFar === 45, "acid fogFar matches"), T(h.obsidian !== void 0, "themePresets has obsidian theme"), T(h.obsidian.materialColor === "#c5a059", "obsidian materialColor matches"), T(h.obsidian.glowIntensity === .8, "obsidian glowIntensity matches"), T(h.obsidian.fogColor === "#060606", "obsidian fogColor matches"), T(h.obsidian.fogDensity === .015, "obsidian fogDensity matches"), T(h.obsidian.fogNear === 1, "obsidian fogNear matches"), T(h.obsidian.fogFar === 60, "obsidian fogFar matches"), console.log("\n--- 2. Render WebGLProvider & Verify Hooks Setup ---"), d();
	let e = v({ children: "test-child" }), t = p(), n = m(), r = f();
	T(t.length === 1, "Should have 1 state (activeTheme)"), T(t[0][0] === "cyan", "activeTheme defaults to 'cyan'"), T(n.length === 2, "Should have 2 refs (mouseRef and audioDataRef)"), T(n[0].current.x === 0 && n[0].current.y === 0, "mouseRef defaults to {x: 0, y: 0}"), T(n[1].current.bass === .5 && n[1].current.mid === .5 && n[1].current.treble === .5, "audioDataRef defaults to 0.5"), T(r.length === 2, "Should have 2 useEffects registered"), console.log("\n--- 3. Trigger Effects & Verify mousemove listener ---"), r.forEach((e) => e()), T(b.mousemove !== void 0, "global mousemove listener should be active"), b.mousemove({
		clientX: 512,
		clientY: 384
	}), T(n[0].current.x === 0 && n[0].current.y === 0, "normalized coordinates at center (512, 384) are (0, 0)"), b.mousemove({
		clientX: 1024,
		clientY: 0
	}), T(n[0].current.x === 1 && n[0].current.y === 1, "normalized coordinates at top right (1024, 0) are (1, 1)"), b.mousemove({
		clientX: 0,
		clientY: 768
	}), T(n[0].current.x === -1 && n[0].current.y === -1, "normalized coordinates at bottom left (0, 768) are (-1, -1)"), console.log("\n--- 4. Verify changeTheme updates DOM state & plays sound ---"), T(e !== null && e.props !== void 0, "WebGLProvider returned virtual DOM element");
	let i = e.props.value;
	T(i !== void 0, "WebGLContext.Provider value was found in props"), T(i.activeTheme === "cyan", "activeTheme in context is 'cyan'"), x = null, i.changeTheme("crimson"), T(t[0][0] === "crimson", "changeTheme('crimson') updates activeTheme state"), T(y["data-theme"] === "crimson", "changeTheme('crimson') updates documentElement data-theme attribute"), T(x !== null, "soundManager.playClick was triggered"), T(x.freq === 1800, "playClick plays at 1800Hz"), T(x.type === "sine", "playClick plays sine wave"), T(x.duration === .05, "playClick plays for 0.05s"), x = null;
	let a = t[0][0];
	i.changeTheme("non-existent-theme"), T(t[0][0] === a, "invalid theme does not update activeTheme state"), T(x === null, "invalid theme does not play click sound"), console.log("\n--- 5. Verify audioDataRef updates/oscillates correctly ---"), T(C !== null, "requestAnimationFrame callback is registered"), C(0);
	let o = n[1].current;
	T(Math.abs(o.bass - .5) < 1e-4, "bass at t=0 is 0.5"), T(Math.abs(o.mid - .4) < 1e-4, "mid at t=0 is 0.4"), T(Math.abs(o.treble - .3) < 1e-4, "treble at t=0 is 0.3"), C(1e3), o = n[1].current;
	let s = .5 + .3 * Math.sin(2), c = .4 + .25 * Math.sin(3.5), l = .3 + .2 * Math.sin(5);
	console.log(`At t=1s: bass=${o.bass} (expected ${s}), mid=${o.mid} (expected ${c}), treble=${o.treble} (expected ${l})`), T(Math.abs(o.bass - s) < 1e-4, "bass oscillation at t=1s is correct"), T(Math.abs(o.mid - c) < 1e-4, "mid oscillation at t=1s is correct"), T(Math.abs(o.treble - l) < 1e-4, "treble oscillation at t=1s is correct"), C(2e3), o = n[1].current;
	let u = .5 + .3 * Math.sin(4), g = .4 + .25 * Math.sin(7), _ = .3 + .2 * Math.sin(10);
	console.log(`At t=2s: bass=${o.bass} (expected ${u}), mid=${o.mid} (expected ${g}), treble=${o.treble} (expected ${_})`), T(Math.abs(o.bass - u) < 1e-4, "bass oscillation at t=2s is correct"), T(Math.abs(o.mid - g) < 1e-4, "mid oscillation at t=2s is correct"), T(Math.abs(o.treble - _) < 1e-4, "treble oscillation at t=2s is correct"), console.log("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!"), process.exit(0);
} catch (e) {
	console.error("\n[FAIL] Verification error:", e), process.exit(1);
}
//#endregion
