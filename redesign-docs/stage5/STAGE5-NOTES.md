# Stage 5 — Motion polish, transitions, reveals, mobile assembly (2026-09-23)

Approved scope: hero motion polish, poster animation, page-level transitions,
scroll-triggered reveals for later sections, mobile assembly refinement.
Reuse the vanilla animation driver, add no new dependencies.

## What changed (source: ~/workspace/webloped_revamp/v4/)

### 1. Hero entrance (css/style.css, prefers-reduced-motion gated)
- Hero copy blocks stagger-fade-up on load: eyebrow 40ms, headline 130ms,
  sub 220ms, CTAs 310ms, note 400ms; hero visual fades in at 280ms.
- 720ms cubic-bezier(0.2, 0.7, 0.2, 1), `backwards` fill, transform/opacity only.
- Content is visible by default; the keyframe only animates from hidden, so
  reduced-motion visitors (and any engine that skips animations) get static content.

### 2. Hero poster life (css/style.css, gated the same way)
- Whole-stage slow drift: 16s ease-in-out loop, rotateX 52->47deg,
  rotateZ -36->-31deg, translateZ 0->18px. One element, one transform.
- Automation signal path: 6s draw loop via stroke-dasharray/dashoffset
  (920 -> 0 -> -920, opacity gated so the path draws in, holds, draws out).
- Endpoint dots pulse (scale 1 -> 1.5) with transform-box: fill-box.
- No per-layer bobbing: the poster layers already carry translateZ transforms,
  and overriding them per-frame would cost the positioning; the stage-level
  drift plus signal draw gives life without touching layer layout.

### 3. Scroll reveals (js/main.js + css/style.css)
- IntersectionObserver (threshold 0.12, rootMargin -6% bottom) adds `.in`
  to `.rv` targets; unobserves after reveal. Stagger via `--rd` = sibling
  index x 80ms, capped at 400ms.
- Targets: section heads, work blocks, service groups/strip, process steps,
  people cards, invest card, FAQ details, contact-grid children.
  The workshop section is excluded (it drives its own Stage 4 animation).
- Progressive enhancement: `.rv` is only ever added by JS (under `.js` on
  <html>), and hidden state only exists as `.js .rv`. No-JS visitors see
  full content — verified: neither class appears in static markup.
- Reduced-motion visitors skip reveal setup entirely; a CSS belt-and-suspenders
  rule also forces `.js .rv` visible with no transition.

### 4. Page-level transitions (index.html, work/case-study-*.html, js/main.js)
- A `.veil` overlay div added to all three pages (aria-hidden, fixed, z-index 400).
- JS: same-origin, non-hash, cross-page link clicks are intercepted; the veil
  fades in over 200ms, navigation fires at 210ms. Anchors, external links,
  and new-tab links are untouched. Reduced-motion users skip the veil.
- `pageshow` clears the veil so back/forward restores never land on a dark page.
- Works across index.html <-> work/case-study-01.html / case-study-02.html
  (both case pages load the shared ../js/main.js).

### 5. Header scroll state
- `.site-header.is-scrolled` toggles past 8px: darker background
  (rgba(16,16,20,0.96)) + 0 10px 30px shadow. Passive scroll listener.

### 6. Mobile assembly refinement (<=640px)
- Stack scale 0.6 -> 0.52, viewport min-height 330 -> 300px (height 44 -> 42vh),
  grid gap 44 -> 28px, hint 12 -> 11px, last panel line 18 -> 16px.
- Controls already wrapped; button padding/font kept tappable.
- Fixed stale CSS comment: workshop block now reads "interactive 3D assembly — Stage 4".

### What was deliberately NOT done
- No per-layer hero bobbing (see section 2).
- No scroll-jacking / smooth-scroll library; anchor scrolling stays native.
- No View Transitions API: cross-browser MPA support is uneven, so the
  veil pattern was chosen — simpler, dependency-free, no-JS safe.

## Validation (local, 2026-09-23)
- node --check js/main.js: pass.
- One h1 per page (index, case-study-01, case-study-02): pass.
- Veil div present in all three pages: pass.
- CSS braces balanced: pass. All new classes/animations present in CSS
  and referenced in JS: pass.

## Rendered inspection (live preview, 2026-09-23 ~22:21 UTC, hard refresh)
- Desktop 1440x900: hero entrance plays, all blocks visible; poster drifts;
  signal path draws on its 6s loop (observed mid-draw); reveals fire with
  stagger across Work/Services/Process/People/Investment/FAQ/Contact;
  header deepens on scroll; veil transition works index -> case-study-01,
  case-study-02, and back ("Back to selected work"); browser back/forward
  works, veil clears via pageshow.
- Stage 4 regression: exploded -> stacked assembly, stage buttons jump to
  the right stage with aria-current, progress bar fills 0->100%, skip link
  reaches Services; no overflow, overlap, or clipped controls.
- Inspector note: the signal path is purple (#8F5BF0), not orange — the
  inspection brief mis-described it; the site CSS is as designed.

## Limitations (still unverified, same as Stage 4)
- Tablet 768px and mobile 390px could not be exercised at runtime: the
  inspection environment has no viewport-resize API. Mobile assembly values
  were verified in CSS only (stack --ss 0.52, viewport min-height 300px,
  wrapping 14px controls). Interactive 390px rendering remains unverified.
- prefers-reduced-motion could not be emulated without DevTools access.
  Verified statically: reveals forced visible, assembly has is-reduced static
  assembled state with tab-style buttons, hero/poster/signal animations are
  no-preference gated, JS skips reveal + veil setup when reduced.
- DevTools console could not be opened in the inspection environment; no
  errors observed behaviorally (assembly transforms, reveals, header toggle,
  veil navigations all ran per js/main.js).
- Screen-reader walkthrough, Lighthouse, physical-device testing, and real
  form delivery remain unverified (carried over from Stage 4).

## Deployed preview
- webloped/webloped-v3-preview@main commits: 389fb928 (index.html),
  c190cc2f (css/style.css), f47cbee7 (js/main.js), 09a51b88 + 060467fd
  (work/case-study-01/02.html). Pages build status: built.
- https://webloped.github.io/webloped-v3-preview/ (CDN lags ~10-15 min;
  hard refresh with Ctrl+Shift+R).

## Changed files
- v4/index.html — veil div.
- v4/work/case-study-01.html, v4/work/case-study-02.html — veil div.
- v4/css/style.css — Stage 5 block (entrance, poster life, reveals, veil,
  header state), mobile assembly refinement, stale comment fix.
- v4/js/main.js — Stage 5 block (js class, header scroll, reveals,
  veil transitions).

## Next stage (proposed, needs approval)
Stage 6 candidates: performance/SEO hardening (Lighthouse-driven), form
endpoint integration (still a blocker), accessibility audit (screen-reader
walkthrough, focus management), or media polish (custom imagery/video for
hero and work placeholders). None started; production main untouched.
