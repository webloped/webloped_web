# Stage 7 — Custom media & social metadata (2026-09-23)

Scope: generate custom brand imagery (honest, decorative only — no fake
client work, no invented claims) and wire it in with proper social metadata.

## Generated assets (media pipeline, 2026-09-23)

All four reviewed visually before wiring in:

- `v4/assets/img/og-card.jpg` (1200x630, 46KB): dark ink card with violet
  gradient, "Webloped / Web Design & AI Automation / Cambridge, Ontario".
  Text renders correctly.
- `v4/assets/img/service-design.jpg` (800x450, 49KB): layered browser
  wireframes in violet/lilac on paper — for "Websites & redesigns".
- `v4/assets/img/service-commerce.jpg` (800x450, 31KB): storefront awning
  flowing into checkout cards with a glowing checkmark — for "E-commerce".
- `v4/assets/img/service-automation.jpg` (800x450, 44KB): glowing network
  nodes forming a chat bubble on dark ink — for "Automation & ongoing growth".

Total new image weight: ~170KB. Pipeline sidecar JSONs were not shipped.

## Markup / style changes

- `index.html` head: `og:image` (+ width/height/alt, production
  `https://webloped.ca` host — standard practice), Twitter card upgraded to
  `summary_large_image` with `twitter:image`.
- `index.html` services: each `.service-group` now leads with a
  `.service-visual` img (descriptive alt, width/height, loading="lazy").
- `work/case-study-01.html`, `work/case-study-02.html`: minimal OG block
  (type/site_name/title/url/image) added — they previously had none.
- `css/style.css`: `.service-visual` — 16/9 aspect, cover, 12px radius,
  1px line border, fits the existing flex-column card layout.

## Validation (local, 2026-09-23)
- node --check js/main.js: pass. CSS braces balanced: pass.
- All 4 JPEGs open/verify: pass. og:image present 4x in index.html,
  3x in each case study; 3 service-visual imgs in index.html.

## Rendered inspection (live preview, 2026-09-23 ~23:22 UTC, hard refresh)
All checks PASS:
1. Services: all three illustrations load, 3-column layout intact, no
   overflow, text readable, alt text confirmed.
2. OG image: direct fetch returns 200, renders 1200x630 correctly.
3. Meta tags: og:image (+dims), twitter:image present; twitter:card is
   summary_large_image. (Values point at webloped.ca — correct practice.)
4. Full-page regression: no breakage, no horizontal overflow; workshop
   assembly animation behaves as designed.
5. Console: no direct devtools read available in the inspection
   environment; indirect evidence clean (no broken images, no missing-asset
   symptoms anywhere).

## Limitations (still unverified)
- Interactive 390px mobile / 768px tablet rendering.
- prefers-reduced-motion emulation, devtools console, screen reader,
  Lighthouse, physical devices, real form delivery.
- How social platforms actually render the share card (needs a real share).

## Deployed preview
- webloped/webloped-v3-preview@main commits: 78fe3460 (index.html),
  66e73093 (css/style.css), 24bd9cb9 (case-study-01), a9ad912a
  (case-study-02), a9da5dbf (og-card.jpg), 5e3c54fe (service-design.jpg),
  0a114e10 (service-commerce.jpg), 2c3b2f59 (service-automation.jpg).
- https://webloped.github.io/webloped-v3-preview/ (CDN lags ~10-15 min).

## Changed files
- v4/index.html — OG/Twitter metadata, service visuals.
- v4/css/style.css — .service-visual.
- v4/work/case-study-01.html, v4/work/case-study-02.html — OG blocks.
- v4/assets/img/og-card.jpg, service-design.jpg, service-commerce.jpg,
  service-automation.jpg — new.

## Next stage (proposed, needs approval)
Stage 8 candidates: form-endpoint integration (needs owner-provisioned
Formspree/Basin/Web3Forms endpoint or a confirmed Google Form destination),
hero visual elevation (custom hero artwork or video), or a
production-readiness review against the open blockers. Production main
untouched.
