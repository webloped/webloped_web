# Legacy route map — Webloped redesign

Prepared 2026-09-23 (Stage 3). Inventory of every legacy route on `webloped/webloped_web@main`
and its planned destination in the v4 redesign. Redirects are implemented at production-deploy
time, not during the staged redesign. GitHub Pages cannot issue server-side 301s, so legacy
routes are handled with static redirect pages (meta refresh + `location.replace` + canonical link).

## Route map

| Legacy route (on `main`) | v4 destination | Handling |
|---|---|---|
| `index.html` | `/` (v4 `index.html`) | Replaced directly — the v4 homepage ships at root |
| `aboutUs.html` | `/#people` | Static redirect page |
| `getAQuote.html` | `/#contact` | Static redirect page |
| `webDev.html` | `/#services` | Static redirect page |
| `marketing.html` | `/#services` | Static redirect page |
| `gmo.html` | `/#services` | Static redirect page |
| `portfolio-details.html` | `/#work` | Static redirect page |
| `portfolio-details.php` | `/#work` | Static redirect page (Pages serves the file path as-is) |
| `services/webDev.php` | `/#services` | Static redirect page |
| `team.php` | `/#people` | Static redirect page |
| `privacyPolicy.html` | `/privacy-policy.html` (new) | Static redirect page; v4 needs a privacy-policy page before production (see gap below) |
| `inner-page.html`, `template.html` | — | Retire (unused template scaffolding; confirm no inbound links first) |
| `new-page.php` | — | Retire (confirm no inbound links first) |
| `Email-Template.html` | — | Retire from the site (internal asset; confirm no inbound links first) |

## v4 anchor inventory (redirect targets must exist)

All redirect targets resolve to anchors present in v4 `index.html`, verified 2026-09-23:

- `#work`, `#workshop`, `#services`, `#process`, `#people`, `#faq`, `#contact`, `#top`

Plus the new Stage 3 routes:

- `work/case-study-01.html`, `work/case-study-02.html`

## Redirect page pattern (GitHub Pages)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/#services">
  <link rel="canonical" href="https://webloped.ca/#services">
  <title>Redirecting…</title>
  <script>location.replace("/#services");</script>
</head>
<body>
  <p>This page has moved. <a href="/#services">Continue to Webloped services</a>.</p>
</body>
</html>
```

Notes:

- `location.replace` avoids polluting browser history; the meta refresh covers no-JS.
- Keep one static file per legacy path at deploy time. Do not delete legacy files until the
  redirect pages are in place on `main`.

## Pre-production gaps found by this check

1. **Privacy policy page missing in v4.** `privacyPolicy.html` exists on production and must not
   404 after launch. Add `privacy-policy.html` to v4 before production deploy. Content must be
   honest: the v4 form opens the visitor's email app (no server collection); Calendly bookings
   are handled by Calendly; no analytics currently ship.
2. **Inbound-link audit.** Before retiring `inner-page.html`, `template.html`, `new-page.php`, and
   `Email-Template.html`, grep the repo and check search-console/analytics for inbound links.
3. **Canonical consistency.** v4 ships `<link rel="canonical" href="https://webloped.ca/">`; the
   case-study pages use their own canonical paths. Keep `noindex` off before production.
