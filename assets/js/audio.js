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
      const droneGain = ctx.createGain(); droneGain.gain.value = 0.09;
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

      /* ── felt piano — soft Japanese piano with delay (間) ── */
      /* spacious feedback delay for ma */
      const dly = ctx.createDelay(1.2); dly.delayTime.value = 0.42;
      const fb = ctx.createGain(); fb.gain.value = 0.38;
      const dlp = ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 1600;
      const wet = ctx.createGain(); wet.gain.value = 0.5;
      dly.connect(dlp); dlp.connect(fb); fb.connect(dly);
      dly.connect(wet); wet.connect(out);
      this._pianoBus = ctx.createGain(); this._pianoBus.gain.value = 1;
      this._pianoBus.connect(out);
      this._pianoBus.connect(dly);

      /* D minor pentatonic across two octaves, plus a fragment of
         the "Sakura Sakura" melody (A A B · A A B · A B C5 B A)
         that surfaces every few phrases */
      const PENT = [293.66, 349.23, 392, 440, 523.25, 587.33, 698.46, 783.99];
      const SAKURA = [440, 440, 493.88, 0, 440, 440, 493.88, 0, 440, 493.88, 523.25, 493.88, 440, 493.88];
      let phrase = 0;

      const note = (f, vel) => {
        const now = ctx.currentTime;
        const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 2.0;
        const o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = f * 3.01;
        const g1 = ctx.createGain(); g1.gain.value = 1;
        const g2 = ctx.createGain(); g2.gain.value = 0.18;
        const g3 = ctx.createGain(); g3.gain.value = 0.05;
        /* felt-piano tone: warm lowpass, soft touch, long natural decay */
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
        lp.frequency.setValueAtTime(2600, now);
        lp.frequency.exponentialRampToValueAtTime(600, now + 2.8);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(vel, now + 0.012); /* soft hammer */
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8); /* ringing decay */
        o1.connect(g1); o2.connect(g2); o3.connect(g3);
        g1.connect(lp); g2.connect(lp); g3.connect(lp);
        lp.connect(g); g.connect(this._pianoBus);
        o1.start(now); o2.start(now); o3.start(now);
        o1.stop(now + 4); o2.stop(now + 4); o3.stop(now + 4);
      };

      /* generative phrasing — sparse, breathing, never busy */
      this._pianoToken = (this._pianoToken || 0) + 1;
      const token = this._pianoToken;
      const schedule = () => {
        if (this._pianoToken !== token) return; /* stopped */
        if (!this.enabled || document.hidden) {
          this._pianoTimer = setTimeout(schedule, 3000);
          return;
        }
        phrase++;
        if (phrase % 5 === 0) {
          /* the sakura motif, unhurried */
          let i = 0;
          const step = () => {
            if (this._pianoToken !== token) return;
            const f = SAKURA[i++];
            if (f) note(f, 0.038 + Math.random() * 0.012);
            if (i < SAKURA.length) this._pianoTimer = setTimeout(step, f ? 620 : 900);
          };
          step();
          this._pianoTimer = setTimeout(schedule, 12500);
        } else {
          /* one or two gentle pentatonic notes */
          const n = Math.random() < 0.35 ? 2 : 1;
          note(PENT[(Math.random() * PENT.length) | 0], 0.035 + Math.random() * 0.02);
          if (n === 2) this._pianoTimer = setTimeout(() =>
            note(PENT[(Math.random() * PENT.length) | 0], 0.03 + Math.random() * 0.015), 480);
          this._pianoTimer = setTimeout(schedule, 3200 + Math.random() * 3800);
        }
      };
      this._pianoTimer = setTimeout(schedule, 1200);
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
        /* silence the piano phrasing */
        this._pianoToken = (this._pianoToken || 0) + 1;
        clearTimeout(this._pianoTimer);
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
  try { const _s = localStorage.getItem("mp-sound"); if (_s === "1" || _s === null) MPAudio._pendingEnable = true; } catch (e) { MPAudio._pendingEnable = true; }
})();
