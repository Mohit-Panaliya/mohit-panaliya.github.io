/* ═══════════════════════════════════════════════
   AUDIO — WebAudio synthesized. No files, no fees.
   Ambient drone + UI blips. Off until user opts in.
   ═══════════════════════════════════════════════ */
(() => {
  const MPAudio = {
    ctx: null, master: null, ambient: null, enabled: false, _nodes: [],

    _ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      return true;
    },

    /* Ambient: detuned drone + filtered air noise, breathing LFO */
    _buildAmbient() {
      const ctx = this.ctx, out = this.master;
      const droneGain = ctx.createGain(); droneGain.gain.value = 0.16;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 320; filter.Q.value = 0.8;
      droneGain.connect(filter); filter.connect(out);

      [[55, "sine", 0], [55.4, "triangle", 3], [110, "sine", -5]].forEach(([f, type, det]) => {
        const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
        const g = ctx.createGain(); g.gain.value = f > 100 ? 0.35 : 1;
        o.connect(g); g.connect(droneGain); o.start();
        this._nodes.push(o);
      });

      /* breathing filter sweep */
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 140;
      lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
      this._nodes.push(lfo);

      /* airy noise bed */
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 0.6;
      const ng = ctx.createGain(); ng.gain.value = 0.012;
      const nlfo = ctx.createOscillator(); nlfo.frequency.value = 0.09;
      const nlg = ctx.createGain(); nlg.gain.value = 0.008;
      nlfo.connect(nlg); nlg.connect(ng.gain); nlfo.start();
      noise.connect(bp); bp.connect(ng); ng.connect(out); noise.start();
      this._nodes.push(noise, nlfo);

      /* koto-ish pentatonic plucks, sparse and random (D minor pentatonic) */
      const NOTES = [293.66, 349.23, 392, 440, 523.25, 587.33];
      this._pluckTimer = setInterval(() => {
        if (!this.enabled || document.hidden) return;
        if (Math.random() < 0.45) return;
        const f = NOTES[(Math.random() * NOTES.length) | 0];
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
        const o2 = this.ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2.01;
        const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.05, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        const g2 = this.ctx.createGain(); g2.gain.value = 0.25;
        o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(this.master);
        o.start(now); o2.start(now); o.stop(now + 1.5); o2.stop(now + 1.5);
      }, 2600);
    },

    toggle(force) {
      const want = force !== undefined ? force : !this.enabled;
      if (want) {
        if (!this._ensure()) return false;
        this.ctx.resume();
        if (!this.ambient) { this._buildAmbient(); this.ambient = true; }
        this.enabled = true;
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(0.9, this.ctx.currentTime + 1.2);
      } else if (this.ctx) {
        this.enabled = false;
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        clearInterval(this._pluckTimer);
      }
      try { localStorage.setItem("mp-sound", want ? "1" : "0"); } catch (e) {}
      document.documentElement.classList.toggle("sound-on", this.enabled);
      return this.enabled;
    },

    /* short UI blip — hover ticks */
    tick() {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(920, t);
      o.frequency.exponentialRampToValueAtTime(520, t + 0.07);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.1);
    },

    /* deep thump — CTA / menu */
    boom() {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.32);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.4);
    },

    /* rising shimmer — panel hover */
    shimmer() {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      [660, 990].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t + i * 0.03);
        g.gain.exponentialRampToValueAtTime(0.035, t + 0.05 + i * 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22 + i * 0.03);
        o.connect(g); g.connect(this.master);
        o.start(t + i * 0.03); o.stop(t + 0.3 + i * 0.03);
      });
    },
  };

  window.MPAudio = MPAudio;

  /* restore last choice — but browsers require a gesture before audio,
     so only reflect the saved intent; the context starts on next toggle/click */
  try { if (localStorage.getItem("mp-sound") === "1") MPAudio._pendingEnable = true; } catch (e) {}
})();
