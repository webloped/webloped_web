# Stage 8 — Elevation (2026-09-24)

Next-version pass authorized by the user: "The website looks good now. Now we need
to further improve on every single aspect. We need next version to be twice as good."

## What changed (all in ~/workspace/webloped_revamp/v4/)

### index.html
- Hero: added `<canvas id="heroFx">` particle field, `.hero-orbs` glow layer,
  badge pill with pulsing green dot, `data-kinetic` on the headline,
  `.scroll-cue` anchor to #work.
- New CTA band section before `</main>`: "Let's build your best salesperson."
  with subcopy and large primary button linking to #contact.
- Footer: giant ghost "Webloped" wordmark (`aria-hidden`).

### css/style.css (+~225 lines, Stage 8 block)
- Tokens: card/lift shadows, brand gradient, gradient-text.
- Buttons: gradient primary, shine sweep on hover, lift on hover/active.
- Hero 2.0: full-viewport flex hero, canvas + orbs with slow drift keyframes,
  glassy badge pill, pulse dot, scroll-cue mouse with dropping dot,
  floating poster glow, word-by-word rise-in (JS-split, no-preference only).
- CTA band: dark radial-gradient panel, clamp headline, centered.
- Hover systems: lift+zoom on service cards, work blocks, people, invest card;
  contact rows slide; gradient mesh + blueprint grid on work placeholders;
  gradient step numerals; footer wordmark.
- Reduced motion: all Stage 8 animation/transforms disabled.
- Responsive: hero/CTA tightening at 900px; at 640px scroll cue hidden,
  headline clamp tightened, footer word margin reduced.

### js/main.js (Stage 8 block, after reducedMotion assignment)
- initHeroFx: vanilla canvas particle constellation (~90 pts, links <130px),
  DPR-capped at 2, pauses via IntersectionObserver when hero off-screen,
  skipped under reduced motion.
- initKinetic: splits [data-kinetic] into word spans with staggered rise;
  sets aria-label with full sentence, word spans aria-hidden; no-JS keeps h1.
- initMagnetic: subtle button pull on fine pointers only.
- CTA band children cascaded into the existing .rv reveal system.

No new dependencies. No framework changes. Reduced-motion and no-JS fallbacks kept.

## Validation
- `node --check js/main.js` PASS; braces/parens balanced; HTML tag balance PASS.
- NOTE: during implementation an edit mis-targeted `})();` and inserted the Stage 8
  block inside initAssembly (where reducedMotion was still undefined). Caught and
  fixed: block moved after the reducedMotion assignment, extra closer removed,
  verified via grep ordering + node --check.

## Live inspection (browser task, 2026-09-24 ~03:34 UTC)
Desktop 1440x900-ish (hard refresh): PASS on all checks.
- Hero: particles, orbs, badge, headline fully rendered (no clipped descenders),
  poster visual floating, scroll cue present.
- All sections render; workshop stages advance; hover states observed
  (button glow, service image zoom + shadow).
- No horizontal overflow, no overlap, no broken images.
- Button copy note: hero buttons read "Get a project quote" / "Explore our work"
  (consistent with header CTA) — task spec names were outdated, not a defect.
- Could NOT verify: DevTools console (would not open in that environment);
  mobile 390x844 (no viewport tooling). Mobile rules reviewed statically
  (scroll cue hidden, clamps, stacked hero) — interactive mobile testing still
  pending per standing QA list.

## Deploy
- Preview: https://webloped.github.io/webloped-v3-preview/ (commits 5fbb7f03,
  1e9bed22, 7f9aecd1 on webloped-v3-preview@main).
- Archive: this note + v4 tree committed on webloped/webloped_web@redesign.

## Limitations / next
- Interactive mobile/tablet testing, screen-reader walkthrough, Lighthouse,
  console-error check, and physical-device testing still open (standing).
- Form delivery endpoint still unverified (mailto flow in place).
- Production main untouched.
