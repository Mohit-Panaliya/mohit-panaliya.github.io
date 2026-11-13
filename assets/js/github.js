/* ═══════════════════════════════════════════════════════════
   GITHUB LIVE — runtime REST layer. Zero CI, zero builds.
   Push a repo → it appears here on next visit.
   · repos list  → panels + stats (session-cached 10 min)
   · topics      → tags
   · repo language / description → tech + blurb fallback
   · homepage field → LIVE badge (set it in repo Settings)
   · CURATED overrides in data.js win for flagship copy
   Falls back to bundled snapshot if offline / rate-limited.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const USER = "Mohit-Panaliya";
  const API = "https://api.github.com";
  const CACHE_KEY = "mp-gh-repos-v1";
  const CACHE_TTL = 10 * 60 * 1000;

  /* low-signal repos kept out of the highlight reel */
  const BLOCKLIST = new Set([
    "Portfolio", "GreenTree", "Upskill-Tasks", "Digital-S",
    "kilocode-web-ui-repo", "hermes-opencode-bridge", "GeoAi",
    "ridemanagement", "sea-orm-turso", "Dokploy-Codespace",
    "Frappe15_codespace", "odoo17_codespace", "odoo18_codespace", "odoo19_codespace",
    "Frappe16_General_Ubuntu24", "fast-entry-app", "oil-distribution", "toolbox",
  ]);

  const el = (sel) => document.querySelector(sel);
  const track = () => el("#workTrack");

  /* ── panel markup ── */
  function panelHTML(p, i) {
    const art = p.art || `art-${String.fromCharCode(97 + (i % 8))}`;
    const orbs = (p.orbs || [[70, 30, 150], [25, 78, 110]]).map(([x, y, s]) =>
      `<span class="orb" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px"></span>`).join("");
    const tags = (p.tags || []).slice(0, 6).map((t) => `<span>${t}</span>`).join("");
    const live = p.live
      ? `<a class="panel-live" href="${p.live}" target="_blank" rel="noopener">● LIVE</a>` : "";
    return `
      <article class="panel" data-sound="shimmer">
        <div class="panel-art ${art}">${orbs}</div>
        <div class="panel-top">
          <span class="panel-idx">${p.idx}</span>
          <div class="panel-top-right">
            ${live}
            <a href="${p.link}" target="_blank" rel="noopener">SOURCE ↗</a>
            ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">LIVE SITE ↗</a>` : ""}
          </div>
        </div>
        <div class="panel-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="panel-tags">${tags}</div>
        </div>
      </article>`;
  }

  function render(projects) {
    track().innerHTML = projects.map(panelHTML).join("");
  }

  /* ── stats ── */
  function renderStats(repos) {
    const stars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const forks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
    const langs = new Set(repos.map((r) => r.language).filter(Boolean));
    const set = (sel, val) => { const n = el(sel); if (n) n.dataset.count = val; };
    set('[data-count="32"]', repos.length);
    set('[data-count="11"]', stars);
    set('[data-count="22"]', forks);
    set('[data-count="7"]', langs.size);
    const st = el("#ghStatus");
    if (st) st.textContent = `● LIVE — SYNCED WITH GITHUB ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}`;
  }

  /* ── merge API data with curated copy ── */
  function toProject(r, i) {
    const c = (window.CURATED && window.CURATED[r.name]) || {};
    const pretty = r.name.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
    return {
      idx: String(i + 1).padStart(2, "0"),
      title: c.title || pretty.charAt(0).toUpperCase() + pretty.slice(1),
      desc: c.desc || r.description || "No description — the code speaks for itself.",
      tags: [...new Set([...(c.tags || []), ...(r.topics || []).slice(0, 3)])].slice(0, 6),
      link: r.html_url,
      live: r.homepage && r.homepage.startsWith("http") ? r.homepage : null,
      art: c.art, orbs: c.orbs,
      _score: 0, _r: r,
    };
  }

  function score(p) {
    const r = p._r;
    const c = (window.CURATED && window.CURATED[r.name]) || {};
    const months = (Date.now() - new Date(r.updated_at)) / (1000 * 60 * 60 * 24 * 30);
    let s = 0;
    s += c.prio || 0; /* flagship ordering */
    s += (r.stargazers_count || 0) * 4;
    s += (r.forks_count || 0) * 3;
    if (r.homepage) s += 4;
    if (r.language) s += 2;
    s += Math.max(0, 6 - months); /* recency */
    return s;
  }

  async function cachedFetch(url) {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { t, data } = JSON.parse(raw);
        if (Date.now() - t < CACHE_TTL) return data;
      }
    } catch (e) {}
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GH ${res.status}`);
    const data = await res.json();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) {}
    return data;
  }

  /* ── boot: paint snapshot now, refresh live, signal app ── */
  window.GH_READY = (async () => {
    /* 1 — instant paint from bundled snapshot so layout never waits */
    render(window.FALLBACK_PROJECTS);
    document.dispatchEvent(new CustomEvent("gh:rendered", { detail: { live: false } }));

    /* 2 — live refresh */
    try {
      const repos = await cachedFetch(`${API}/users/${USER}/repos?per_page=100&sort=updated`);
      const mine = repos.filter((r) => !r.fork && !BLOCKLIST.has(r.name));
      const projects = mine
        .map(toProject)
        .map((p) => ((p._score = score(p)), p))
        .sort((a, b) => b._score - a._score)
        .slice(0, 8)
        .map((p, i) => ({ ...p, idx: String(i + 1).padStart(2, "0") })); /* re-index after slice */
      render(projects);
      renderStats(mine);
      document.dispatchEvent(new CustomEvent("gh:rendered", { detail: { live: true } }));
    } catch (err) {
      const st = el("#ghStatus");
      if (st) st.textContent = "○ SNAPSHOT MODE — GITHUB API UNREACHABLE";
      console.warn("[gh] falling back to snapshot:", err.message);
    }
  })();
})();
