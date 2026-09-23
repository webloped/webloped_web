# Webloped redesign — Stage 1 audit

Prepared 2026-09-23. Source: `webloped/webloped_web` branch `main` @ `11dfb286`, cloned to `/tmp/webloped_prod` and served locally; v3 preview source at `~/workspace/webloped_revamp/v3/index.html`. Nothing on `main` was modified. No production deployment was made.

## 1. Build / deployment setup (observed)

- **No build system.** No `package.json`, no bundler, no CI (`.github/workflows` 404s via API). The site is hand-maintained static HTML/CSS/JS.
- **GitHub Pages** serves the repo root of `main`; `CNAME` contains `webloped.ca`.
- **PHP is dead on this host.** `forms/contact.php` requires `assets/vendor/php-email-form/php-email-form.php`, which is **not in the repo** (only `validate.js` ships). Even if present, Pages cannot execute PHP. The script would die with `Unable to load the "PHP Email Form" Library!` and its hardcoded recipient is the stale `info@lakshays.me`.
- **All HTML forms are dead.** Every page (`index.html`, `aboutUs.html`, `webDev.html`, `marketing.html`, `gmo.html`, `getAQuote.html`, `privacyPolicy.html`, `inner-page.html`) uses `<form action="" method="post">`. `getAQuote.html`'s multi-step JS (`assets/js/getAQuote.js`) only advances steps; nothing is ever submitted.
- The only functioning enquiry paths today are third-party embeds: **Calendly badge** (`https://calendly.com/webloped/30min`) and a **Google Form iframe** (`docs.google.com/forms/d/e/1FAIpQLSc4TGTbtL0AfjNYqh58UkSwjgv8AVdkz5Pu3uLgMEE1Rbmgeg/viewform?embedded=true`) in `#contact`. The Google Form's destination mailbox is not visible in the repo.
- **No analytics.** No GA/GTM/pixel snippet in `index.html`. No measurement exists.
- `service-worker.js` caches a stale URL list (`my-site-cache-v1`); `manifest.json` description is generic template text. PWA assets referenced (`icon-192x192.png`) were not verified present.
- Repo hygiene: 839 files including unrelated baggage (`BiostateAI/`, `OptimusWeb/`, `web-templates/`, `canadaWaleYar/`), an empty `React/react` experiment dir, and duplicate `CNAME`/`cname` files.

## 2. Animation / script dependencies (observed)

`index.html` loads: `purecounter_vanilla.js`, `aos.js` + `aos.css`, Bootstrap 5 bundle **and** Bootstrap 4.5.2 + jQuery 3.5.1 slim + Popper (duplicate, conflicting generations), `glightbox`, `isotope-layout`, `swiper-bundle`, `php-email-form/validate.js`, Calendly widget, Trustpilot widget, `assets/js/main.js`, `assets/js/getAQuote.js`. Google Fonts: Open Sans, Roboto, Poppins (no licence issue; CDN).

**Fail-closed animation defect:** AOS CSS sets `[data-aos^=fade] { opacity: 0 }` until JS adds `.aos-animate` on scroll into view. 19 elements carry `data-aos`. If AOS fails to load or IntersectionObserver never fires (observed in headless capture: hero text present in DOM, `opacity:1` only after scroll), content stays invisible. There is no `prefers-reduced-motion` handling and no no-JS fallback. The redesign must reveal content by default and enhance, not hide-then-reveal.

## 3. Observed defects with file locations

### P0 — honesty / conversion-critical
| # | Defect | Location |
|---|---|---|
| D1 | Unverified animated counters: 232 Clients / 521 Projects / 1463 Hours Of Support / 15 Hard Workers | `index.html` counts section (`data-purecounter-end`) |
| D2 | Template pricing tiers Free $0 / Business $19 / Developer $29 / Ultimate $49 with dead `href="#"` "Buy Now" buttons | `index.html` `#pricing` |
| D3 | CDAP "Grow Your Business Online grant offers up to **$2,400**" presented as current incentive; program currency unverified | `index.html` `#grow-your-business` features section |
| D4 | Contact email inconsistent: `contact@webloped.com` (`index.html` contact box + footer), `webloped@gmail.com` (`aboutUs.html`, `getAQuote.html`), `contact@webloped.ca` (other pages). Owner-confirmed canonical: `contact@webloped.ca` | multiple files |
| D5 | No working form submission (see §1). The PHP handler is doubly dead | `forms/contact.php`, all `<form action="">` |
| D6 | Unverified promises: "Get a response in less than 24 hours", "Available 9am - 9pm EST" | `index.html` `#contact` info boxes |
| D7 | v3 preview fictional proof (quarantined from production path — see §6) | `~/workspace/webloped_revamp/v3/index.html` |

### P1 — structure / UX
| # | Defect | Location |
|---|---|---|
| D8 | Nav "Book a Call" link has empty `href=""`; only the Calendly badge works | `index.html` header nav + `onclick=Calendly.initPopupWidget` in hero |
| D9 | Template leftovers: page title "Portfolio Details - Vesperr Bootstrap Template" (`portfolio-details.html`); `#` links for Terms of service, Privacy policy, footer service links, "Drop Down 1-4" menus | various |
| D10 | About section commented out in `index.html` but nav "About" links to `index.html#about` (dead anchor) | `index.html` |
| D11 | Service copy mismatches: AI chatbot description discusses Google Sites; automation discusses review listings | `index.html` services (per brief §3 P1) |
| D12 | Duplicate Bootstrap generations + jQuery (bloat, conflict risk) | `index.html` script tags |

### P2 — polish / tech debt
- Trustpilot TrustBox widget present (`trustpilot.com/review/webloped.ca`); review content not verified in repo.
- `React/` empty experiment; repo baggage noted in §1.
- No sitemap, no SEO titles per page (all pages titled "Webloped").

## 4. Reusable assets

- **Logo (PNG only, no SVG found):** `assets/img/Logo.png`, `assets/img/logo-w.png` (reversed), `assets/img/FullLogo.png`, `assets/img/favicon.png`, `assets/img/apple-touch-icon.png`. Recommend vectorizing or requesting SVG originals.
- **Founder photos (production repo):** `assets/img/Lakshay.JPG` (+ `Lakshay2.jpg/.HEIC`, `Lakshay3.JPG`, `Lakshay4.JPG`, `Lakshay5.png`), `assets/img/Dhruv.jpeg` (+ `Dhruv2.jpeg`, `dhruv3-6.jpg`), `assets/img/team/`. v3 used `Lakshay.JPG` / `Dhruv.jpeg`.
- **v3 service illustrations** (coherent violet/glass style, may be reused if licence/originals confirmed): `~/workspace/webloped_revamp/v3/assets/img/svc-web.jpg`, `svc-ecommerce.jpg`, `svc-chatbot.jpg`, `svc-automation.jpg`, `svc-marketing.jpg`, `svc-maps.jpg`, plus `hero-art.jpg`, `process-glow.jpg`, `funding-texture.jpg`.
- **v3 video:** `assets/video/hero-ambient.mp4`, `assets/video/transform.mp4` (decorative; keep out of critical path per brief asset budget).
- **NOT reusable as evidence:** `assets/img/portfolio/portfolio-1..6.jpg` (generic), v3 testimonial/pricing/counter content (fictional — see §6).
- **Working booking path to keep:** Calendly `webloped/30min` badge.

## 5. Technical constraints

1. Pages = static only. No server-side form handling, no PHP, no secrets.
2. No build pipeline: edits are per-file by hand unless Stage 2 adopts a tiny static structure (still no bundler needed).
3. AOS-style hide-then-reveal is banned; content must be visible without JS.
4. Asset budget (brief §11): critical JS ≤150KB gzip excl. deferred 3D; hero poster ≤200KB; no Lenis/Three.js until justified.
5. Production branch `main` untouched until owner-approved launch; all work on `redesign` branch; preview via `webloped-v3-preview` repo.

## 6. v3 fictional-proof quarantine

The following exist **only** in the preview source `~/workspace/webloped_revamp/v3/index.html` and must not enter the production path:
- `.leak-counter` — animated "visitors lost this month" counter (demonstration presented as measurement).
- `.stats-band` counters `data-target="120/85/14/98"` → "120+ projects shipped", "85+ happy clients", "14 days average launch", "98% would recommend", with "Illustrative figures" disclaimer.
- Process copy "honed over 120+ launches".
- "Sample reviews — real client quotes to be added."
- Sample pricing Launch $1,499 / Growth $2,999 / Scale $4,999 ("Sample tiers"), "loads in ~1s", "2–3 weeks".
- "Grow Your Business Online grant offers up to $2,400" (FAQ + funding band).
- v3 already uses canonical `contact@webloped.ca` and `+1 647 694 7001` — keep those.

## 7. Prioritized implementation map

- **Stage 2 — Foundation & truth pass:** `redesign` branch baseline = current `main` minus P0 fictional content (remove D1/D2/D3 or gate behind owner verification; unify email to `contact@webloped.ca`; strip dead pricing buttons). Adopt design tokens (ink/paper/violet/lilac), Space Grotesk + Inter via Google Fonts, 12-col/1280px grid, spacing scale. No visual redesign of sections yet.
- **Stage 3 — Information architecture:** new section order (Hero → Selected work → Workshop → Services → Process → People & proof → Investment & FAQ → Contact), plain labels, anchor nav, valid hrefs (fix D8/D9/D10), preserve useful routes (`webDev.html`, `marketing.html`, `gmo.html`, `getAQuote.html`, `privacyPolicy.html`, `aboutUs.html`) with redirects where renamed.
- **Stage 4 — Hero + selected work:** clarity-first hero (proposed copy), contained signature visual + poster; honest work section (concept-labelled placeholders until owner supplies real case studies).
- **Stage 5 — Workshop signature scene:** CSS-3D-first website-assembly, scroll-bounded, 4 stage controls, poster/reduced-motion/no-WebGL fallbacks. GSAP+ScrollTrigger only if CSS proves insufficient.
- **Stage 6 — Services/Process/People/FAQ/Contact:** rewritten service copy from real deliverables; real form endpoint (see `content-inventory.md` §4); Calendly retained.
- **Stage 7 — Motion/restraint + responsive + a11y pass:** remove competing signatures, motion-system values, keyboard/focus/contrast.
- **Stage 8 — QA gates:** Lighthouse lab runs, link validation, SEO (titles/sitemap/robots, preview noindex), launch checklist.

## 8. Architecture decision (smallest compatible)

**Static hand-maintained HTML/CSS/JS, no build step, no framework** — matches the repo; nothing to migrate.
- Rejected: React/Next.js (no evidenced need; `React/` dir is an empty experiment), CSS frameworks beyond a minimal reset (Bootstrap 5 kept only if needed; dual-version load removed), Tailwind (new toolchain, no need).
- GSAP + ScrollTrigger: allowed **only** for the single workshop timeline, and only if CSS scroll-driven animations prove insufficient.
- Lenis: not installed; add only after a side-by-side test proves improvement with keyboard/anchor/touch/find/reduced-motion intact.
- 3D: CSS perspective first; Three.js only if real geometry/lighting materially improves the assembly scene.
- Fonts: Space Grotesk (display) + Inter (body) via Google Fonts CDN (licences permit); self-hosted subsets optional later.
- Forms: external endpoint (owner-provisioned); no backend code in repo.

## Appendix — baseline evidence

- `baseline/desktop-home-top.png` (1440×900): nav renders; hero content hidden in headless because AOS never fired (see §2) — environment artifact, also the fail-closed defect.
- `baseline/mobile-home-top.png` (390×844): same state, hamburger shown.
- Local server: `python3 -m http.server` on :8321 serving `/tmp/webloped_prod` — HTTP 200 confirmed.
- Renderer note: headless Chromium 152 crashed intermittently on this page until launched with `--disable-extensions` (a bundled extension's service worker wedged the renderer). Section screenshots below the fold could not be captured reliably; DOM/API inspection substituted.
