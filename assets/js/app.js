/* ═══════════════════════════════════════════════
   APP — preloader, Lenis, GSAP choreography,
   menu, cursor, horizontal work, counters, CTA.
   Easing: strong curves only. transform/opacity.
   ═══════════════════════════════════════════════ */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE_OUT = "power4.out";
  const EASE_IO = "power4.inOut";

  /* ─────────── text splitting ─────────── */
  function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = "";
    const spans = [];
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(s);
      spans.push(s);
    }
    return spans;
  }
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
    return [...el.querySelectorAll(".w")];
  }

  document.querySelectorAll("[data-split]").forEach((el) => el._chars = splitChars(el));
  document.querySelectorAll(".statement [data-words]").forEach((el) => el._words = splitWords(el));

  /* ─────────── lenis + scrolltrigger ─────────── */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ─────────── progress bar ─────────── */
  const progressBar = document.getElementById("progressBar");
  const updProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener("scroll", updProgress, { passive: true });

  /* ─────────── sound bindings ─────────── */
  const audio = () => window.MPAudio;
  document.addEventListener("pointerenter", (e) => {
    const t = e.target.closest("[data-sound]");
    if (t && audio()) audio().tick();
  }, true);
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-sound]");
    if (t && audio() && t.dataset.sound === "boom") audio().boom();
  }, true);
  const soundBtn = document.getElementById("soundToggle");
  soundBtn.addEventListener("click", () => {
    audio().toggle();
    if (audio().enabled) audio().boom();
  });
  /* first gesture anywhere honors the saved "on" choice */
  const kick = () => {
    if (audio()._pendingEnable && !audio().enabled) { audio().toggle(); delete audio()._pendingEnable; }
    removeEventListener("pointerdown", kick);
  };
  addEventListener("pointerdown", kick, { once: false });

  /* ─────────── theme (夜 ⇄ 朝) ─────────── */
  const themeBtn = document.getElementById("themeToggle");
  const currentTheme = () => document.documentElement.dataset.theme || "dark";
  themeBtn.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("mp-theme", next); } catch (e) {}
    document.dispatchEvent(new CustomEvent("mp:theme", { detail: next }));
    audio().tick();
  });

  /* ─────────── cursor ─────────── */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const label = document.querySelector(".cursor-label");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("a, button, [data-cursor], .panel, .craft-row");
      ring.classList.toggle("hovered", !!t);
      if (t) label.textContent = t.tagName === "A" || t.tagName === "BUTTON" ? "" : "EXPLORE";
    });
  }

  /* ─────────── menu ─────────── */
  const menu = document.getElementById("menu");
  const menuToggle = document.getElementById("menuToggle");
  let menuOpen = false;
  const menuLinks = [...menu.querySelectorAll(".menu-link")];
  function setMenu(open) {
    menuOpen = open;
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menu.style.visibility = "visible";
      gsap.to(menu, { clipPath: "inset(0% 0 0% 0)", duration: 0.7, ease: EASE_IO });
      gsap.fromTo(menuLinks, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: EASE_OUT });
      if (lenis) lenis.stop();
    } else {
      gsap.to(menu, {
        clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: EASE_IO,
        onComplete: () => { menu.style.visibility = "hidden"; },
      });
      if (lenis) lenis.start();
    }
  }
  menuToggle.addEventListener("click", () => { audio().tick(); setMenu(!menuOpen); });
  menuLinks.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = a.getAttribute("href");
    setMenu(false);
    setTimeout(() => {
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  }));

  /* ─────────── horizontal work track ─────────── */
  let workTween = null;
  function buildWork() {
    const trackEl = document.getElementById("workTrack");
    if (workTween) { workTween.kill(); workTween = null; gsap.set(trackEl, { clearProps: "x" }); ScrollTrigger.refresh(); }
    if (matchMedia("(min-width: 721px)").matches && !reduced) {
      const getX = () => -(trackEl.scrollWidth - innerWidth + 64);
      workTween = gsap.to(trackEl, {
        x: getX, ease: "none",
        scrollTrigger: {
          trigger: ".work", start: "top top", end: () => `+=${trackEl.scrollWidth - innerWidth + 400}`,
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
    }
    /* panel entrance */
    gsap.fromTo(trackEl.querySelectorAll(".panel"), { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: EASE_OUT,
      scrollTrigger: { trigger: ".work", start: "top 70%" },
    });
  }
  document.addEventListener("gh:rendered", () => buildWork());

  /* ─────────── reveals ─────────── */
  function reveals() {
    /* generic fade-ups */
    gsap.utils.toArray(".reveal-fade").forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: EASE_OUT,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    /* statement — word-by-word scrub */
    document.querySelectorAll(".statement [data-words]").forEach((line, li) => {
      gsap.fromTo(line._words, { opacity: 0.13 }, {
        opacity: 1, stagger: 0.35, ease: "none",
        scrollTrigger: {
          trigger: ".about", start: "top 65%", end: "bottom 55%", scrub: true,
        },
      });
    });

    /* craft rows — slide in */
    gsap.fromTo(".craft-row", { x: -48, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: EASE_OUT,
      scrollTrigger: { trigger: ".craft-list", start: "top 78%" },
    });

    /* stats counters */
    document.querySelectorAll(".stat-num").forEach((n) => {
      const target = parseFloat(n.dataset.count);
      const dec = parseInt(n.dataset.decimals || "0", 10);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: "power2.out",
        scrollTrigger: { trigger: "#stats", start: "top 85%" },
        onUpdate: () => { n.textContent = obj.v.toFixed(dec); },
      });
    });

    /* journey rows */
    gsap.fromTo(".tl-row", { y: 44, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: EASE_OUT,
      scrollTrigger: { trigger: ".tl", start: "top 80%" },
    });

    /* CTA chars */
    document.querySelectorAll(".cta-line").forEach((line) => {
      gsap.fromTo(line._chars || splitChars(line), { yPercent: 110 }, {
        yPercent: 0, duration: 1, stagger: 0.035, ease: EASE_OUT,
        scrollTrigger: { trigger: ".contact", start: "top 72%" },
      });
    });

    /* hero scroll-out parallax */
    gsap.to(".hero-content", {
      yPercent: -22, opacity: 0.15, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    /* marquee — scroll-velocity aware direction */
    const mTrack = document.getElementById("marqueeTrack");
    if (mTrack && !reduced) {
      let mTl = gsap.to(mTrack, { xPercent: -50, ease: "none", duration: 36, repeat: -1 });
      ScrollTrigger.create({
        trigger: ".marquee", start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity() / 300;
          gsap.to(mTl, { timeScale: v > 0 ? Math.min(4, 1 + Math.abs(v)) : Math.max(0.25, 1 - Math.abs(v)), duration: 0.4 });
        },
      });
    }
  }

  /* ─────────── magnetic CTA ─────────── */
  const cta = document.querySelector(".cta");
  if (cta && matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    cta.addEventListener("pointermove", (e) => {
      const r = cta.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 24;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 16;
    });
    cta.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
    (function mag() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      cta.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(mag);
    })();
  }

  /* ─────────── preloader + intro ─────────── */
  function intro() {
    const heroChars = document.querySelectorAll(".hero-title .ch");
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
    tl.to(".pre-name span", { y: 0, duration: 0.9, stagger: 0.04 }, 0)
      .to(".pre-sub", { opacity: 1, duration: 0.6 }, 0.5)
      .to(".hero-title .ch", { y: 0, duration: 1.1, stagger: 0.035 }, 1.05)
      .to(".hero-badge", { opacity: 1, y: 0, duration: 0.8 }, 1.35)
      .to(".hero-cta", { opacity: 1, y: 0, duration: 0.8 }, 1.45)
      .to(".hero-meta", { opacity: 1, y: 0, duration: 0.9 }, 1.55)
      .to("#preloader", {
        clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: EASE_IO,
        onComplete: () => { document.getElementById("preloader").style.display = "none"; },
      }, 1.9);
  }

  async function boot() {
    /* count-up tied to real readiness: window load + GH (max 2s) */
    const preCount = document.getElementById("preCount");
    const ghRace = Promise.race([window.GH_READY || Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]);
    const load = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));

    const prog = { v: 0 };
    gsap.to(prog, {
      v: 92, duration: 1.6, ease: "power2.out",
      onUpdate: () => { preCount.textContent = String(Math.round(prog.v)).padStart(2, "0"); },
    });
    await Promise.all([ghRace, load]);
    gsap.to(prog, {
      v: 100, duration: 0.35, ease: "power1.out",
      onUpdate: () => { preCount.textContent = String(Math.round(prog.v)).padStart(2, "0"); },
      onComplete: () => {
        reveals();
        buildWork();
        intro();
        setTimeout(() => ScrollTrigger.refresh(), 2200);
      },
    });
  }

  if (reduced) {
    /* skip theatre — content first */
    document.getElementById("preloader").style.display = "none";
    document.querySelectorAll(".reveal-fade").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
    document.querySelectorAll(".ch").forEach((c) => { c.style.transform = "none"; });
    document.querySelectorAll(".statement .w").forEach((w) => { w.style.opacity = 1; });
    buildWork();
    const st = document.getElementById("ghStatus");
    if (st && window.GH_READY) window.GH_READY.then(() => ScrollTrigger.refresh());
  } else {
    boot();
  }

  /* image preload guard + final refresh */
  addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 500));
})();
