# Stage 4 — Interactive workshop assembly

Date: 2026-09-23
Status: complete, live-verified on preview
Preview: https://webloped.github.io/webloped-v3-preview/ (commits 0084cb42, 740ba9b9, 9c821083, f01a53b5)

## What was built

The workshop section ("02 — The workshop") is now an interactive scroll-driven 3D
website assembly instead of a static four-stage list:

- Four translucent layers — Structure/blueprint, Content, Imagery, Interface/automation —
  float separated in an exploded 3D view and snap together into a complete website card
  as the user scrolls a ~340vh sticky track.
- Stage text panels (Strategy / Design / Development / Automation) swap as each stage
  completes; four stage buttons let the user jump to any stage; a thin progress bar fills
  with scroll; a "Skip the assembly" link jumps to Services; a "Scroll to assemble" hint
  shows at the section start.

## Technical decision

- Pure CSS 3D (`transform-style: preserve-3d`, perspective) with a small vanilla
  JavaScript `requestAnimationFrame` scroll driver.
- No GSAP, ScrollTrigger, Lenis, Three.js, framework, or polyfill — keeps the
  "no competing animation systems" rule intact and adds zero dependencies.
- Compositor-friendly: transforms + opacity only, passive scroll listeners batched
  through rAF, `IntersectionObserver` pauses work when the section is off-screen.

## Progressive enhancement / fallbacks

- No JS or no CSS-3D support: readable static four-stage list (original content intact).
- `prefers-reduced-motion`: static assembled scene with tab-style stage controls —
  no scroll animation.
- Nothing starts hidden unless JS confirms 3D support.

## Accessibility

- Stage buttons use `aria-current`; panels use hidden/active states.
- Skip link targets Services; hint and progress are decorative-friendly.

## Validation evidence

- Local checks (2026-09-23): `node --check` on main.js; single `h1`; required
  assembly IDs present in HTML and referenced by JS; 4 layers / 4 panels / 4 buttons;
  balanced CSS braces; required assembly classes present.
- Live-browser QA (2026-09-23, desktop ~1920px after hard refresh): new build
  confirmed in production of CDN ("Four stages, one assembled result..." intro).
  Start/middle/end screenshots captured and verified (exploded layers, partially
  merged, fully assembled). No horizontal overflow, no text overlap, layers stay in
  panel, no clipped controls. "3 Development" button: smooth-scroll + panel switch —
  pass. "Skip the assembly" -> #services — pass. "Scroll to assemble" hint visible —
  pass. Progress bar 0% / ~40% / 100% — pass.
- First QA run hit the preview CDN lag (served the Stage 3 build); re-ran after
  ~10 min propagation and passed.

## Changed files (v4 source)

- `v4/index.html` — assembly section markup, SVG stage figures, skip link, hint
- `v4/css/style.css` — 3D scene, sticky track, controls, reduced-motion paths
- `v4/js/main.js` — scroll driver, stage controls, fallbacks

## Limitations (not yet verified)

- Interactive 390px mobile and 768px tablet rendering.
- Screen-reader walkthrough of the assembly.
- Lighthouse / performance profile on a physical device.
- Real contact-form delivery (still honest mailto flow — needs owner endpoint).

## What Stage 5 would do

Proposed scope (needs explicit approval): hero motion polish and poster animation,
page-level transitions, scroll-triggered reveals for later sections, and the mobile
assembly refinement — reusing the same vanilla driver, no new dependencies.
