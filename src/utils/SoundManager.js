class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type, duration, gainStart, gainEnd = 0.001) {
    this.init();
    if (!this.ctx || this.muted) return;
    
    // Resume context if suspended (browser security policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.error("Error playing tone", e);
    }
  }

  playClick() {
    this.playTone(1800, 'sine', 0.05, 0.05);
  }

  playHover() {
    this.playTone(1200, 'sine', 0.02, 0.02);
  }

  playBeep() {
    this.playTone(880, 'triangle', 0.1, 0.08);
  }

  playSuccess() {
    this.init();
    if (!this.ctx || this.muted) return;
    
    // Arpeggio
    this.playTone(523.25, 'sine', 0.1, 0.05); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.05), 80); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.1, 0.05), 160); // G5
    setTimeout(() => this.playTone(1046.50, 'sine', 0.2, 0.08), 240); // C6
  }

  playError() {
    this.init();
    if (!this.ctx || this.muted) return;
    this.playTone(180, 'sawtooth', 0.25, 0.1);
    setTimeout(() => this.playTone(130, 'sawtooth', 0.35, 0.1), 100);
  }

  playAlarm() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    
    // Pulsing siren
    const duration = 1.0;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.25);
    osc.frequency.linearRampToValueAtTime(330, now + 0.5);
    osc.frequency.linearRampToValueAtTime(660, now + 0.75);
    osc.frequency.linearRampToValueAtTime(330, now + 1.0);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + duration);
  }

  playScan() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    
    // Sweeping radar sound
    const duration = 0.8;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(2500, now + duration);

    gainNode.gain.setValueAtTime(0.03, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + duration);
  }

  playMatrix() {
    // Single digital chirp
    const pitch = 800 + Math.random() * 1200;
    this.playTone(pitch, 'sine', 0.04, 0.015);
  }
}

const soundManager = new SoundManager();
export default soundManager;
