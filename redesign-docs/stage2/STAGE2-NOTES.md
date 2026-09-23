# Stage 2 — static art direction + hero (build notes)

Built 2026-09-23. Source: `~/workspace/webloped_revamp/v4/` (fresh; nothing reused from v3 structure).
Deployed: preview repo `webloped/webloped-v3-preview@main` (commit 74ed8aba, Pages "built"),
source archived on `webloped/webloped_web` branch `redesign` under `v4/` (commit bcc746da).

## What was built
- Design tokens per brief §5 (ink/paper/violet/lilac/muted), Space Grotesk + Inter via Google Fonts,
  12-col / 1280px grid, 56px desktop gutters / 20px mobile, spacing scale, section padding 128px / 72px.
- Page order per brief §6: header → hero → selected work → workshop (static shell) →
  services → process → people → investment & FAQ → contact → footer.
- Hero: dark ink, left-aligned eyebrow/H1/CTAs, right-side pure-CSS 3D layered website poster
  (5 layers: charcoal grid, paper content, violet image plane, UI cards, violet signal path).
  Static, decorative (role=img + aria-label), never overlaps copy.
- Selected work: 2 concept placeholder blocks with the case-study schema visible
  (Client/Sector/Problem/Scope/Outcome marked pending). No invented names or results.
- Workshop: 4 plain stage descriptions; interactive 3D deferred to Stage 4 (placeholders say so honestly).
- Services rewritten from actual deliverables (chatbot/automation copy fixed per audit D11).
- Process without invented timelines. People: founder photos + roles, no testimonials (none genuine).
- Investment: quote-led, no prices, no funding claim. FAQ via native <details>.
- Contact: labelled form shell; submit composes an honest mailto (direct delivery = Stage 3);
  mailto/tel/Calendly alternatives listed. Preview carries <meta name="robots" content="noindex">.
- Motion: none. Ordinary cursor. Focus-visible styles, skip link, semantic landmarks, one h1.

## Verification done
- HTML tag balance / single h1 / all anchor ids exist / zero missing local assets (script-checked).
- Contrast computed for 8 foreground/background pairs: all ≥ 5.69:1 (AA pass).
- Deployed preview fetched via browser: correct title, all 8 sections, founder images resolve (200).

## Known limitation (environment)
- Local headless-Chromium screenshots could not be captured: the renderer's zygote
  process fails in this container (tried ~12 flag combinations, Xvfb, non-root user;
  /tmp was also full — 477MB of stale v3 artifacts cleaned). No 390/768/1440/1920
  screenshots were produced. Visual inspection at those widths is still owed —
  recommend a browser-task screenshot pass before Stage 3 sign-off.
- Not run: mobile-device, screen-reader, Lighthouse tests. No such claims made.

## Stage 3 entry point
- Portfolio/content/conversion: case-study page schema + build real case-study pages when
  owner supplies assets; rewrite/extend service copy; replace mailto-compose with real
  submission once the owner provisions a form endpoint (Formspree/Basin/Web3Forms);
  validate legacy routes/redirects, keyboard, SEO metadata. No animation needed to
  reach content or submit.
