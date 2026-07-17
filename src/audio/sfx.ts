// All SFX are synthesized with WebAudio — zero audio assets needed for the slice.
export class Sfx {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;

  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const len = Math.floor(this.ctx.sampleRate * 0.15);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private env(g: GainNode, t: number, peak: number, dur: number): void {
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  }

  slap(force = 1): void {
    if (!this.ctx || !this.noise) return;
    const c = this.ctx;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200 + Math.random() * 900;
    bp.Q.value = 0.8;
    const g = c.createGain();
    this.env(g, t, Math.min(0.55, 0.4 * force), 0.1);
    src.connect(bp);
    bp.connect(g);
    g.connect(c.destination);
    src.start(t);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(150 + force * 40, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    const g2 = c.createGain();
    this.env(g2, t, 0.5, 0.13);
    o.connect(g2);
    g2.connect(c.destination);
    o.start(t);
    o.stop(t + 0.16);
  }

  grunt(): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime + 0.05;
    const o = c.createOscillator();
    o.type = "sawtooth";
    const f = 150 + Math.random() * 80;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.18);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 750;
    const g = c.createGain();
    this.env(g, t, 0.18, 0.18);
    o.connect(lp);
    lp.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.22);
  }

  tick(): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = "square";
    o.frequency.value = 1100 + Math.random() * 200;
    const g = c.createGain();
    this.env(g, t, 0.05, 0.035);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.05);
  }

  fanfare(): void {
    if (!this.ctx) return;
    const c = this.ctx;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = c.currentTime + i * 0.1;
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq;
      const g = c.createGain();
      this.env(g, t, 0.2, 0.3);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.32);
    });
  }
}
