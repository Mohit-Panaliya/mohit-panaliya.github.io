/* ═══════════════════════════════════════════════
   PETALS — 2D canvas overlay. Sakura petals +
   leaves falling across the whole page, swaying
   on a wind field. Theme-aware, DPR-capped,
   respects prefers-reduced-motion, pauses hidden.
   ═══════════════════════════════════════════════ */
(() => {
  const canvas = document.getElementById("petals");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  let W = 0, H = 0, dpr = 1;
  let petals = [];
  let palette = [];
  let windT = 0;
  let running = true;

  const rand = (a, b) => a + Math.random() * (b - a);

  /* read theme colors from CSS variables */
  function refreshPalette() {
    const cs = getComputedStyle(document.documentElement);
    const read = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    palette = [
      read("--accent", "#f2a9bd"),
      read("--accent-2", "#e26a8d"),
      read("--gold", "#d9b380"),
    ];
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makePetal(initial) {
    const isLeaf = Math.random() < 0.35;
    return {
      type: isLeaf ? "leaf" : "petal",
      x: rand(-40, W + 40),
      y: initial ? rand(-H, H) : rand(-120, -20),
      s: isLeaf ? rand(7, 13) : rand(6, 12),
      vy: rand(0.35, 1.0),
      swayAmp: rand(18, 55),
      swayFreq: rand(0.0006, 0.0016),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.015, 0.015),
      color: palette[(Math.random() * palette.length) | 0],
      alpha: rand(0.45, 0.85),
    };
  }

  function populate() {
    const n = Math.min(56, Math.max(24, Math.floor(W / 26)));
    petals = Array.from({ length: n }, () => makePetal(true));
  }

  /* sakura petal: rounded teardrop with a notched tip */
  function drawPetal(p) {
    const s = p.s;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.85, s * 0.7, 0, s);
    ctx.bezierCurveTo(-s * 0.85, s * 0.7, -s * 0.95, -s * 0.55, 0, -s);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
    /* notch at the tip — cut with destination-out */
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(0, -s - 0.5);
    ctx.lineTo(s * 0.28, -s * 0.45);
    ctx.lineTo(-s * 0.28, -s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  /* simple leaf with a vein */
  function drawLeaf(p) {
    const s = p.s;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha * 0.8;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, 0);
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    windT += 0.004;
    /* slow global wind + gentle gusts */
    const wind = Math.sin(windT * 0.7) * 0.55 + Math.sin(windT * 0.23 + 1.7) * 0.35;

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.y += p.vy;
      p.x += wind * 0.8 + Math.sin(t * p.swayFreq + p.phase) * 0.5;
      p.rot += p.vr + wind * 0.004;

      if (p.y > H + 60 || p.x < -80 || p.x > W + 80) {
        petals[i] = makePetal(false);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.type === "leaf") drawLeaf(p); else drawPetal(p);
      ctx.restore();
    }
  }

  document.addEventListener("visibilitychange", () => { running = !document.hidden; });
  document.addEventListener("mp:theme", () => {
    refreshPalette();
    petals.forEach((p) => { p.color = palette[(Math.random() * palette.length) | 0]; });
  });
  addEventListener("resize", () => { resize(); populate(); }, { passive: true });

  refreshPalette();
  resize();
  populate();
  requestAnimationFrame(frame);
})();
