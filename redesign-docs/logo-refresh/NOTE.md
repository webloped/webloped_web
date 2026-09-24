# Logo refresh (2026-09-24)

User request: "Update the logo. Same design but enhanced and with proper contrast
with the background."

## What changed
- `v4/assets/img/logo-w.png` (header/footer on dark): same W-brushstroke + purple
  swoosh design, regenerated sharper with a more luminous violet-to-lavender
  gradient swoosh for strong contrast against the near-black header/footer.
- `v4/assets/img/logo.png` (favicon): same design, deep navy W, richer swoosh,
  readable at small sizes.
- Both are 512x512 RGBA with true transparency (the generator baked in solid
  backgrounds; these were keyed out programmatically with feathered edges and
  verified halo-free on dark, grey, white, and light-lavender backgrounds).
- Originals backed up at `~/workspace/webloped_revamp/logo-backup/`.

## Deploy
- Preview: https://webloped.github.io/webloped-v3-preview/ (commits 78798314, a1968107)
- Archive: this note + both PNGs on webloped/webloped_web@redesign.
- Production main untouched.
