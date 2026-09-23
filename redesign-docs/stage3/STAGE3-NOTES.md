# Stage 3 — portfolio/content/conversion (build notes)

Built 2026-09-23. Source: `~/workspace/webloped_revamp/v4/` (continued from Stage 2).
Deployed: preview repo `webloped/webloped-v3-preview@main` (commit 938a4554, Pages "built").
Legacy route map committed to `webloped/webloped_web@redesign` as `docs/legacy-routes.md`
(commit b77b2148). Production `main` untouched.

## What was built

**Reusable case-study routes** (`v4/work/case-study-01.html`, `v4/work/case-study-02.html`):
- Both pages share `../css/style.css` and `../js/main.js` — same header/footer/typography, so the
  template is copy-paste reusable for real projects.
- Each page carries: draft banner (`role="note"`), case-study hero, the five-fact schema
  (Client / Sector / Problem / Scope / Outcome), a labelled visual placeholder panel, and
  prev/next/back navigation.
- Honestly labelled throughout: "Draft — not a published client project." No invented clients,
  results, or imagery. No real projects have been supplied by the owner yet.
- Homepage work blocks now link to the draft routes ("Read the draft case-study format").
- Each page has its own canonical URL (`https://webloped.ca/work/case-study-NN.html`),
  theme-color, description, and `noindex` on the preview.

**SEO / structured data** (index.html head):
- `<link rel="canonical" href="https://webloped.ca/">`, Open Graph tags, Twitter summary card,
  `theme-color`, favicon already present.
- JSON-LD `ProfessionalService` with verified facts only: name, URL, `contact@webloped.ca`,
  `+1-647-694-7001`, Cambridge ON CA address. No invented facts.
- `og:image` deliberately omitted — no 1200x630 social image exists; a cropped logo would
  misrepresent. Pre-production item.

**Service content completed from verified deliverables** (no invented claims):
- Websites & redesigns: added "Contact and enquiry paths that actually work" to the deliverable list.
- E-commerce: added "Product and inventory handover training".
- New "Included in every project" strip: fixed CAD quote before starting, client owns everything
  (domain/site/content/docs), plain-language handover with no lock-in, honest scope boundaries.
  All four statements are consistent with the FAQ (fixed quote, ownership) — no new business claims.
- FAQ: added "Where are you located?" (Cambridge, Ontario — verified; mailto/tel links).

**Contact form — accessible, still honest about delivery** (no endpoint supplied by owner):
- Added "What do you need?" project-type select (New website / Redesign / E-commerce /
  AI-automation / Care plan / Not sure yet) — a visitor choice, not a business claim.
- Validation errors now render an accessible error summary (`role="alert"`, focus moves to it,
  links jump to each field) instead of relying on native bubbles alone.
- Submission status announced via `aria-live="polite"` ("Opening your email app — review and
  send the message yourself. Nothing is sent automatically.").
- `<noscript>` fallback: tells JS-off visitors to email directly.
- Still composes a `mailto:` to `contact@webloped.ca` — no fake success state, no silent send.
  Real direct delivery (Formspree/Basin/Web3Forms) remains an owner decision.

**Keyboard / labels audit**:
- Mobile nav: Escape closes the open menu and returns focus to the toggle; opening the menu
  moves focus to the first link; choosing a link closes the menu. `aria-expanded`/`aria-label`
  stay in sync.
- All form labels pair with inputs (script-checked). Skip link, single h1 per page,
  `:focus-visible` styles unchanged from Stage 2.
- Essential content and the contact alternatives (mailto/tel/Calendly) work with JS disabled;
  the form degrades to the noscript note. Nothing essential depends on animation (there is none).

**Legacy routes checked** (`docs/legacy-routes.md` on the `redesign` branch):
- Inventoried all legacy routes on `main` (verified via API): index, aboutUs, getAQuote, webDev,
  marketing, gmo, portfolio-details(.html/.php), privacyPolicy, inner-page, template,
  new-page.php, Email-Template, services/webDev.php, team.php.
- Mapped each to a v4 destination (anchor or new page); static-redirect-page pattern documented
  for GitHub Pages (meta refresh + `location.replace` + canonical), to be implemented at
  production-deploy time.
- Pre-production gaps found: (1) v4 has no privacy-policy page yet — must add before launch so
  `privacyPolicy.html` doesn't 404; (2) confirm no inbound links before retiring template/scaffold
  files; (3) remove `noindex` at production time.

## Verification done

- HTML tag balance / single h1 per page / all anchor ids exist / zero missing local assets /
  cross-page fragment targets valid / all labels pair with inputs — script-checked, all pass.
- Preview deployed and fetched live: case-study-01.html serves the Stage 3 build.
- Pages build reached "built" for commit 938a4554.

## Rendered inspection (live-browser QA, 2026-09-23)

**Desktop (~1920px): CLEAN.** Full scroll-through (hero → footer): no horizontal overflow,
no overlap, no clipped text, no broken images (header/footer logos and both founder portraits
render), spacing consistent. Header verified (brand, six nav links, quote CTA). Hero headline
confirmed. FAQ expand/collapse works (native details/summary). Both draft case-study pages load
with the draft banner and working prev/next navigation.

**First functional pass caveat:** the QA task's initial page load raced the Pages build
(build "built" at 21:25:42 UTC; task loaded earlier), so three reported "defects" (missing
case-study links, native-only form validation, no Escape handler) described the stale Stage 2
build, not the Stage 3 code.

**Final live verification (21:41 UTC, fresh tab, hard refresh, live-DOM HTML): ALL PASS.**
"work-link" ×2, "formErrors" ×1, "Where are you located?" present, "Included in every
project" present, "What do you need?" present. Interactive empty-submit test: the accessible
error summary appears ("Please fix 3 fields:" with "Enter Your name / Enter Email / Enter
About your project" links), no native validation bubble, no mailto dialog, nothing submitted.
Clicking "Read the draft case-study format" loads work/case-study-01.html with the draft
banner and the five-fact schema. The earlier "defects" were CDN propagation lag after the
Pages build — the deployed commit was correct throughout; no code changes were required.

**Mobile/tablet interactive testing: BLOCKED by environment** (viewport cannot be resized in
the browser environment — same limitation as Stage 2). Static review instead: hamburger
mechanism, breakpoints (≤1100/≤900/≤640), and the Escape/focus code path all verified in the
served js/main.js. Interactive mobile nav and the 390/768 visual pass remain owed before
production.

**Mobile/tablet interactive testing: BLOCKED by environment.** The browser environment cannot
change viewport size (DevTools/F12/window-resize/zoom all ineffective — same limitation as
Stage 2). Static code review instead: hamburger mechanism exists (≤900px), breakpoints sane,
images max-width:100%, padding drops at ≤640, Escape handler and focus management present in
the served main.js (to be confirmed by re-check). Interactive mobile nav open/close and the
390/768 visual scroll-through remain unverified — owed before production.

## Known limitations

- No form endpoint supplied by the owner — direct submission still pending their decision.
- No real portfolio projects supplied — case studies remain labelled drafts.
- No pricing/funding decisions supplied — site stays quote-led, no funding claim.
- No `og:image` social card (no suitable asset).
- Not run: screen-reader, Lighthouse, physical-device tests. No such claims made.

## Pending owner decisions (unchanged from Stage 2)

1. Form endpoint for `contact@webloped.ca` (Formspree/Basin/Web3Forms) or confirmed Google Form.
2. Verify the $2,400 funding claim or keep it removed (currently removed).
3. Verified CAD pricing or stay quote-led (currently quote-led).
4. 2–3 authorized projects for real case studies (currently labelled drafts).

## Stage 4 entry point

Interactive workshop: dimensional assembly prototype with CSS perspective first; GSAP +
ScrollTrigger only for the single workshop timeline if CSS proves insufficient; Lenis only if
a comparison demonstrates real benefit; Three.js only if Stage 4 establishes a material benefit.
