# Webloped redesign — content inventory

Prepared 2026-09-23 from `webloped/webloped_web@main`. Three buckets. Nothing here invents clients, metrics, testimonials, pricing, or business facts.

## (a) Verified facts — evidenced in the repo/files

| Fact | Evidence |
|---|---|
| Business name: Webloped; positioning: web development + AI automation | `index.html`, repo history, memory of owner |
| Founders: Lakshay Sharma — Head of Digital Solutions; Dhruv Sharma — Head of AI Innovation and Automation | v3 preview copy (owner-authored); photos in `assets/img/` |
| Location: Cambridge, Ontario, Canada | v3 preview; memory |
| Phone: +1 647 694 7001 | `index.html` `#contact` info box |
| Canonical email: **contact@webloped.ca** (owner-confirmed 2026-09-23; IONOS mailbox) | owner confirmation; used in `webDev.html`, `marketing.html`, `gmo.html`, `privacyPolicy.html`, `inner-page.html`, v3 |
| Domain: `webloped.ca` primary; `webloped.com` redirects to it | `CNAME` = `webloped.ca`; owner confirmation |
| Booking: Calendly `calendly.com/webloped/30min` badge widget, labelled "Book a Call" | `index.html` (`Calendly.initBadgeWidget`) |
| Services offered (names only): Websites & redesigns, e-commerce, AI chatbots, AI automation, SEO/digital marketing, Google Business/maps & local | `index.html` services section |
| Existing routes: `index.html`, `aboutUs.html`, `getAQuote.html`, `webDev.html`, `marketing.html`, `gmo.html`, `portfolio-details.html`, `privacyPolicy.html`, `inner-page.html`, `services/webDev.php`, `team.php` | repo root listing |
| Logo originals (PNG): `Logo.png`, `logo-w.png`, `FullLogo.png`, `favicon.png` | `assets/img/` |
| Founder photos exist (multiple crops each) | `assets/img/Lakshay*.JPG/png`, `assets/img/Dhruv*.jpeg/jpg`, `assets/img/team/` |

## (b) Owner confirmation needed — do not publish until verified

1. **Pricing:** remove all sample tiers (v3 $1,499/$2,999/$4,999; production Free $0/$19/$29/$49 template leftovers). Publish only owner-confirmed figures with currency (CAD), scope, exclusions, and recurring costs — or stay quote-led.
2. **Timelines/process:** "2–4 week launches", "fixed-price quotes", response-time commitments ("<24 hours"), availability hours ("9am–9pm EST"). Confirm or remove.
3. **Funding program:** the $2,400 "Grow Your Business Online"/CDAP claim — verify current eligibility/availability from the administering source, or remove entirely. Default: remove.
4. **Portfolio:** 2–3 named projects with client permission, URLs, screenshots, scope, factual outcomes. Until supplied: label any shown work explicitly as **concept**.
5. **Testimonials:** genuine quotes with attribution and permission, or omit the section.
6. **Metrics:** any counters (projects, clients, years) need a defensible definition and true numbers, or the counters go.
7. **Canonical email rollout:** unify `contact@webloped.com` (`index.html`) and `webloped@gmail.com` (`aboutUs.html`, `getAQuote.html`) to `contact@webloped.ca`; verify inbox delivery.
8. **Form endpoint:** owner creates a form-service account (Formspree/Basin/Web3Forms or equivalent), verifies the inbox, and supplies the endpoint — no credentials invented by us (see §4).
9. **Google Form embed:** confirm the destination mailbox of `docs.google.com/forms/d/e/1FAIpQLSc4TGTbtL0AfjNYqh58UkSwjgv8AVdkz5Pu3uLgMEE1Rbmgeg/viewform` and whether to keep it.
10. **Trustpilot:** confirm the TrustBox (`trustpilot.com/review/webloped.ca`) shows real reviews; otherwise remove.
11. **Service copy:** rewrite chatbot/automation descriptions from actual deliverables (current copy discusses Google Sites / review listings under the wrong headings).
12. **Market positioning:** confirm SMB web-design positioning vs. $20k+ brand engagements before final pricing/positioning copy (per brief §1).

## (c) Known demonstration content — quarantined, never for production

Each item below is **not evidence** and must not appear on the production path:

1. **Illustrative metrics (production):** 232 Clients / 521 Projects / 1463 Hours Of Support / 15 Hard Workers — `index.html` purecounter spans. Unverified; remove.
2. **Illustrative metrics (v3 preview):** 120+ projects shipped / 85+ happy clients / 14 days average launch / 98% would recommend (`data-target="120/85/14/98"`, "Illustrative figures" disclaimer); "honed over 120+ launches" process copy.
3. **Sample testimonials:** v3 "Sample reviews — real client quotes to be added." No genuine quotes exist in the repo.
4. **Sample pricing:** v3 Launch $1,499 / Growth $2,999 / Scale $4,999 ("Sample tiers"); production Free $0 / $19 / $29 / $49 template tiers with dead "Buy Now" buttons.
5. **Animated lost-visitor counter:** v3 `.leak-counter` ("visitors lost this month") — a demonstration presented as measurement. Remove; no fake analytics.
6. **$2,400 funding claim:** v3 FAQ + funding band; production `#grow-your-business` CDAP section. Unverified currency; default to removal.
7. **Email discrepancy:** `contact@webloped.com` vs `contact@webloped.ca` (canonical, owner-confirmed) vs `webloped@gmail.com`. Unify to `.ca`.
8. **Unsupported timing promises:** v3 "loads in ~1s", "2–3 weeks"; production "response in less than 24 hours", "9am–9pm EST". No measurement or owner confirmation on file.
9. **Ranking promises:** any implied SEO guarantees — none evidenced; describe services, not outcomes.

## 4. Form delivery — how real submission will work on GitHub Pages

**Current state: dead.** `forms/contact.php` requires a missing pro library (`php-email-form.php` not in repo; only `validate.js` ships), targets stale `info@lakshays.me`, and Pages cannot run PHP at all. Every HTML form uses `action=""`. The only live paths are the Calendly badge and the Google Form embed (destination unknown).

**Recommended options:**
- **Option A (recommended): external form endpoint** — Formspree, Basin, or Web3Forms. Owner creates the account, verifies `contact@webloped.ca`, and supplies the endpoint URL/ID. The static form POSTs via fetch with honest states: idle → sending (disabled, duplicate-protected) → confirmed / retryable error. Secrets stay server-side at the provider; nothing sensitive in the repo.
- **Option B (interim): keep the Google Form embed** — only after confirming its destination mailbox; restyle minimally. No custom validation or branding.
- **Fallback (always):** `mailto:contact@webloped.ca` link and the Calendly widget remain as direct alternatives.

**Interim honest behavior (until owner provisions an endpoint):** the form must not show a fake success state. Either disable submission with a clear "email us directly" message, or wire `mailto:`. Owner decisions needed: choose A or B; provision the account; verify inbox delivery with a test submission.
