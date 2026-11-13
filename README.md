# Mohit Panaliya — Portfolio

A living, igloo.inc-inspired portfolio: dark-ice aesthetic, Three.js 3D hero, GSAP ScrollTrigger choreography, Lenis smooth scroll, and a WebAudio-synthesized soundscape. No frameworks, no build step — plain HTML/CSS/JS that GitHub Pages serves as-is.

## Always current, zero CI

The site doesn't rebuild — it calls the GitHub REST API at runtime:

- **Push any repo** → it appears on the portfolio on the next visit
- **Repo topics** → project tags · **description** → blurb · **primary language** → tech
- **Repo homepage field** (Settings → Website URL) → "LIVE" badge + live-site link; no homepage → details-only card
- **Stars / forks / repo & language counts** → stats band, computed live
- Flagship copy lives in `assets/js/data.js` (`CURATED` map, keyed by repo name) and wins over API text
- Session-cached 10 min; falls back to a bundled snapshot if the API is unreachable or rate-limited

Unauthenticated API limits (60 req/hr per IP) are plenty — one call per page view.

## Run locally

```bash
cd portfolio
python -m http.server 8080   # or npx serve
```

Open http://localhost:8080.

## Structure

```
index.html            — structure & content
resume.html           — printable résumé (live GitHub projects, Print/Save PDF)
assets/css/style.css  — design system + responsive + reduced-motion
assets/js/audio.js    — WebAudio engine (ambient drone + koto plucks, opt-in)
assets/js/data.js     — curated copy + offline snapshot
assets/js/github.js   — runtime GitHub REST layer
assets/js/petals.js   — 2D falling petals & leaves canvas overlay
assets/js/scene.js    — Three.js hero: GLB cherry tree, moon, 3D petals
assets/js/app.js      — Lenis + GSAP choreography + theme toggle
assets/models/        — flowering-cherry-tree.glb
```

## Deploy

GitHub Pages, `main` branch root — every push to `main` redeploys automatically.

© Mohit Panaliya
