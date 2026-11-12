/* ═══════════════════════════════════════════════
   DATA — curated copy overrides (win over API) +
   bundled fallback snapshot (used pre-fetch /
   offline / rate-limited). Keyed by repo name —
   rename-proof: API repos without curated copy
   render from their own name/description/topics.
   ═══════════════════════════════════════════════ */

window.CURATED = {
  "Indtools-PWA": {
    prio: 100,    title: "Indtools PWA",
    desc: "Offline-first B2B storefront for industrial tools & fasteners — Ionic Vue 3 PWA on a Frappe backend, running real orders for a real business.",
    tags: ["Vue 3", "Ionic", "Frappe", "PWA", "Offline-first"],
    art: "art-a",
  },
  "Geeta_Enterprise_Frappe16": {
    prio: 95,    title: "Geeta Enterprise",
    desc: "Oil-distribution ERP on Frappe 16 — stock tracking, reservations, releases, transfers and dual-UOM dashboards for daily warehouse ops.",
    tags: ["Frappe 16", "Python", "ERP", "Dual-UOM"],
    art: "art-b",
  },
  "mann-computer-app": {
    prio: 90,    title: "Mann Computer",
    desc: "Cross-platform business management desktop app — Svelte UI on a Rust core via Tauri. Small binary, native speed, zero Electron bloat.",
    tags: ["Tauri", "Svelte", "Rust", "Desktop"],
    art: "art-c",
  },
  "openwa-rs": {
    prio: 85,    title: "openwa-rs",
    desc: "OpenWA-compatible WhatsApp API gateway in Rust — a single binary, minimal RSS, engine-backed. Self-hostable messaging infrastructure.",
    tags: ["Rust", "API Gateway", "Self-hosted"],
    art: "art-d",
  },
  "ev_workshop": {
    prio: 80,    title: "EV Workshop",
    desc: "Complete workshop management for electric-vehicle service centers on ERPNext — job cards, vehicles, inventory and service history.",
    tags: ["ERPNext", "Frappe", "EV", "Job Cards"],
    art: "art-e",
  },
  "Frappe16_codespace": {
    prio: 75,    title: "Frappe16 Codespace",
    desc: "The fastest way to spin up Frappe 16 — a preconfigured GitHub Codespace with a working bench in minutes. 7★, 6 forks, used by strangers.",
    tags: ["Codespaces", "DevOps", "Frappe", "DX", "7★"],
    art: "art-f",
  },
  "peer-transfer": {
    prio: 70,    title: "peer-transfer",
    desc: "Peer-to-peer data transfer between Frappe v16 sites plus a lightweight Rust envelope relay — move doctypes across instances without dumps.",
    tags: ["Frappe v16", "Rust", "P2P", "Sync"],
    art: "art-g",
  },
  "odoocare": {
    prio: 65,    title: "odoocare",
    desc: "Parses Odoo 17 manifests, resolves dependency graphs and detects broken modules before they take your instance down. Rust, of course.",
    tags: ["Rust", "Odoo 17", "Static Analysis", "CLI"],
    art: "art-h",
  },
  "DairyFlowERP": {
    prio: 55,    title: "DairyFlow ERP",
    desc: "Android app for dairy supplier management — Kotlin, offline-tolerant, built for the supply chain that starts before sunrise.",
    tags: ["Kotlin", "Android", "ERP", "Dairy"],
    art: "art-c",
  },
  "urltoapp": {
    prio: 50,    title: "urltoapp",
    desc: "Turn any URL into a cross-platform Tauri desktop app. One command, one binary, done.",
    tags: ["Tauri", "Rust", "CLI", "Desktop"],
    art: "art-f",
  },
  "finance-game": {
    prio: 45,    title: "finance-game",
    desc: "A finance game written in Rust — because money simulators deserve memory safety too.",
    tags: ["Rust", "Game", "Finance"],
    art: "art-b",
  },
};

/* Snapshot of the live board — replaced at runtime by the API.
   Keep in sync occasionally; it only shows if GitHub is unreachable. */
window.FALLBACK_PROJECTS = [
  {
    idx: "01", title: "Indtools PWA",
    desc: window.CURATED && "Offline-first B2B storefront for industrial tools & fasteners — Ionic Vue 3 PWA on a Frappe backend, running real orders for a real business.",
    tags: ["Vue 3", "Ionic", "Frappe", "PWA", "Offline-first"],
    art: "art-a", link: "https://github.com/Mohit-Panaliya/Indtools-PWA",
    live: "https://order.indtools.in",
  },
  {
    idx: "02", title: "Geeta Enterprise",
    desc: "Oil-distribution ERP on Frappe 16 — stock tracking, reservations, releases, transfers and dual-UOM dashboards for daily warehouse ops.",
    tags: ["Frappe 16", "Python", "ERP", "Dual-UOM"],
    art: "art-b", link: "https://github.com/Mohit-Panaliya/Geeta_Enterprise_Frappe16",
  },
  {
    idx: "03", title: "Mann Computer",
    desc: "Cross-platform business management desktop app — Svelte UI on a Rust core via Tauri. Small binary, native speed, zero Electron bloat.",
    tags: ["Tauri", "Svelte", "Rust", "Desktop"],
    art: "art-c", link: "https://github.com/Mohit-Panaliya/mann-computer-app",
  },
  {
    idx: "04", title: "openwa-rs",
    desc: "OpenWA-compatible WhatsApp API gateway in Rust — a single binary, minimal RSS, engine-backed. Self-hostable messaging infrastructure.",
    tags: ["Rust", "API Gateway", "Self-hosted"],
    art: "art-d", link: "https://github.com/Mohit-Panaliya/openwa-rs",
  },
  {
    idx: "05", title: "EV Workshop",
    desc: "Complete workshop management for electric-vehicle service centers on ERPNext — job cards, vehicles, inventory and service history.",
    tags: ["ERPNext", "Frappe", "EV", "Job Cards"],
    art: "art-e", link: "https://github.com/Mohit-Panaliya/ev_workshop",
  },
  {
    idx: "06", title: "Frappe16 Codespace",
    desc: "The fastest way to spin up Frappe 16 — a preconfigured GitHub Codespace with a working bench in minutes. 7★, 6 forks, used by strangers.",
    tags: ["Codespaces", "DevOps", "Frappe", "DX", "7★"],
    art: "art-f", link: "https://github.com/Mohit-Panaliya/Frappe16_codespace",
  },
  {
    idx: "07", title: "peer-transfer",
    desc: "Peer-to-peer data transfer between Frappe v16 sites plus a lightweight Rust envelope relay — move doctypes across instances without dumps.",
    tags: ["Frappe v16", "Rust", "P2P", "Sync"],
    art: "art-g", link: "https://github.com/Mohit-Panaliya/peer-transfer",
  },
  {
    idx: "08", title: "odoocare",
    desc: "Parses Odoo 17 manifests, resolves dependency graphs and detects broken modules before they take your instance down. Rust, of course.",
    tags: ["Rust", "Odoo 17", "Static Analysis", "CLI"],
    art: "art-h", link: "https://github.com/Mohit-Panaliya/odoocare",
  },
].map((p) => ({ ...p, desc: p.desc || "" }));
