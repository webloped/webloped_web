# Stage 6 — Accessibility, performance, SEO hardening (2026-09-23)

Approved scope: Lighthouse-driven performance/SEO hardening, accessibility
audit. Form-endpoint integration stays a blocker (needs an owner-provisioned
endpoint); custom media polish deferred to a later stage.

## Audit results (before changes)

### Contrast (computed with actual CSS variable values)
All real text/background pairs PASS WCAG AA (4.5:1):
- body ink #101014 on paper #F6F5F1: 17.40
- muted-light #57535F on paper: 6.86
- muted-dark #B8B5C2 on #0b0b0e (footer): 9.76
- muted-dark on #101014 (on-dark lede): 9.43
- violet #6D38E8 on paper (eyebrow): 5.69
- white on violet #6D38E8 (primary buttons): 6.21
No color changes needed. Two phantom failures from an early pass were
re-checked against real values and dismissed: the "layer label" text does
not exist (hero poster is aria-hidden with no text), and the signal path is
decorative.

### Keyboard / focus
- Skip link appears on first Tab; `:focus-visible` violet outline exists.
- All interactive elements are native: nav toggle (button), stage buttons
  (buttons with aria-current), FAQ (details/summary), form fields with
  associated labels, mailto CTA links.
- Veil is aria-hidden and pointer-events:none when off.

### Heading order
- One issue found: the investment card title "Quoted per project. Fixed
  before we start." was an h3 inside a section whose next heading was an
  h2 ("Before you ask."). Fixed: now an h2, CSS selector updated
  (.invest-card h3 -> .invest-card h2), visual style unchanged.

### Page weight
- logo-w.png 360x360 RGBA (178KB) displayed at 40/44px -> resized to
  160x160, optimized: 43KB (saved 135KB). Visually verified intact.
- dhruv.jpg 675x900 (162KB) -> 540x720 q78: 131KB (saved 31KB).
- lakshay.jpg 36KB: already small, untouched.
- logo.png favicon 192x192: 52KB -> 51KB (negligible, optimized in place).
- Total image saving: ~167KB. HTML/CSS/JS unchanged in weight.
- Fonts: Google Fonts with display=swap + preconnect; scripts already defer;
  single CSS file, no @import. No render-blocking JS.

### SEO
- Added v4/sitemap.xml (3 URLs: /, /work/case-study-01.html,
  /work/case-study-02.html, production webloped.ca host).
- Added v4/robots.txt (Allow all, references sitemap).
- Preview keeps its meta noindex; these files are production-ready.

## Validation (local, 2026-09-23)
- node --check js/main.js: pass. CSS braces balanced: pass.
- sitemap.xml parses as valid XML: pass.
- One h1, invest title is h2: pass.
- Optimized images open and verify with PIL: pass.

## Rendered inspection (live preview, 2026-09-23 ~22:58 UTC, hard refresh)
All 5 checks PASS:
1. Images: header/footer logos crisp at 40px, both portraits load, none broken or degraded.
2. Headings: h1 -> h2s -> h3s via accessibility tree, invest title confirmed level 2, no skipped levels.
3. sitemap.xml returns 200, valid XML, exactly 3 URLs. robots.txt returns 200 with Allow + Sitemap lines.
4. Full-page regression scroll: no visual breakage, no horizontal overflow, workshop assembly still assembles through all 4 stages.
5. Keyboard: skip link appears on first Tab with violet outline; focus outlines visible on nav links. Mobile menu + Escape could not be exercised (wide desktop viewport, no resize API) — no verdict.

## Limitations (still unverified)
- Interactive 390px mobile / 768px tablet rendering (no viewport control in the inspection environment).
- prefers-reduced-motion emulation, DevTools console, screen-reader walkthrough, Lighthouse scores, physical devices, real form delivery.

## Deployed preview
- webloped/webloped-v3-preview@main commits: 028c47c9 (index.html),
  2d5e6b98 (css/style.css), cf3fef8b (logo-w.png), 2e86af1e (dhruv.jpg),
  54a11594 (logo.png), 799491bb (sitemap.xml), 673b2a95 (robots.txt).
- https://webloped.github.io/webloped-v3-preview/ (CDN lags ~10-15 min).

## Changed files
- v4/index.html — invest-card h3 -> h2.
- v4/css/style.css — .invest-card h2 selector.
- v4/assets/img/logo-w.png — resized 360 -> 160px, optimized (178KB -> 43KB).
- v4/assets/img/dhruv.jpg — resized to 540x720 q78 (162KB -> 131KB).
- v4/assets/img/logo.png — optimized (52KB -> 51KB).
- v4/sitemap.xml, v4/robots.txt — new.

## Next stage (proposed, needs approval)
Stage 7 candidates: custom media polish (hero imagery, work placeholder
visuals, video), form-endpoint integration (needs owner-provisioned endpoint),
or a production-readiness review against the open blockers list. Production
main untouched.
