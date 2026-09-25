/* Webloped v4 — Stage 1 motion foundation: Lenis smooth scroll + a tiny
   vanilla parallax driver.
   Self-hosted, zero CDN. Progressive enhancement:
   - Skipped entirely under prefers-reduced-motion (native scroll + static page).
   - No-JS visitors unaffected (this file never runs; content stays fully visible).
   - The parallax driver is a pure function of the LIVE scroll position evaluated
     every frame — it caches no measurements, so it can never desync or get
     stuck; every frame heals the previous one. Transform/opacity only. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { return; }
  if (typeof Lenis === "undefined") { return; }

  /* ---------- Lenis: buttery smooth scroll ---------- */
  var lenis = new Lenis({
    lerp: 0.09,          // gentle glide; lower = heavier, higher = snappier
    smoothWheel: true,   // desktop wheel smoothing; touch stays native
    autoRaf: true,        // Lenis 1.1.x does not run its own loop unless asked
    wheelMultiplier: 1,
    touchMultiplier: 1
  });
  document.documentElement.classList.add("lenis-on");

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  // Programmatic scrolls (workshop stage jumps) route through Lenis when active.
  window.__wlScrollTo = function (top) {
    lenis.scrollTo(top, { duration: 1.4, easing: easeOut });
  };

  /* ---------- Anchor links glide instead of jumping ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) { return; }
    var hash = a.getAttribute("href");
    if (!hash || hash.length < 2) { return; }
    var target = document.querySelector(hash);
    if (!target) { return; }
    e.preventDefault();
    lenis.start(); // a menu link may have been clicked while Lenis was stopped
    lenis.scrollTo(target, {
      offset: -84, // clears the fixed header (matches scroll-margin-top)
      duration: 1.4,
      easing: easeOut
    });
  });

  /* ---------- Freeze background scroll while the mobile menu is open ---------- */
  (function () {
    var toggle = document.getElementById("navToggle");
    if (!toggle) { return; }
    // main.js attaches its toggle handler first (deferred earlier), so by the
    // time this click handler runs, aria-expanded already reflects the new state.
    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") { lenis.stop(); }
      else { lenis.start(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { lenis.start(); }
    });
  })();

  /* ---------- Vanilla parallax driver (pure function of live scroll) ---------- */
  var hero = document.querySelector(".hero");
  var heroCopy = document.querySelector(".hero-copy");
  var heroVisual = document.querySelector(".hero-visual");
  var heroFx = document.querySelector(".hero-fx");
  var heroOrbs = document.querySelector(".hero-orbs");
  var mediaImgs = Array.prototype.slice.call(document.querySelectorAll(".service-media img"));
  var workPanels = Array.prototype.slice.call(document.querySelectorAll(".work-visual.placeholder"));
  var footerWord = document.querySelector(".footer-word");
  var footer = document.querySelector(".site-footer");

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  function render() {
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    // Hero: copy drifts down and fades as the hero scrolls away; the visual
    // floats up slightly slower; ambient layers dissolve first.
    if (hero && y < hero.offsetHeight + vh) {
      var hp = clamp01(y / Math.max(1, hero.offsetHeight));
      if (heroCopy) {
        heroCopy.style.transform = "translate3d(0," + (hp * 120).toFixed(1) + "px,0)";
        heroCopy.style.opacity = (1 - hp * 0.8).toFixed(3);
      }
      if (heroVisual) {
        heroVisual.style.transform = "translate3d(0," + (-hp * 60).toFixed(1) + "px,0)";
      }
      var fade = (1 - hp * 1.6).toFixed(3);
      if (heroFx) { heroFx.style.opacity = Math.max(0, fade); }
      if (heroOrbs) { heroOrbs.style.opacity = Math.max(0, fade); }
    }

    // Media images + work panels: gentle counter-drift while crossing the viewport.
    var i, r, p;
    for (i = 0; i < mediaImgs.length; i++) {
      r = mediaImgs[i].getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        p = (r.top + r.height / 2 - vh / 2) / (vh / 2); // -1..1 through viewport
        mediaImgs[i].style.transform = "translate3d(0," + (-p * 26).toFixed(1) + "px,0)";
      }
    }
    for (i = 0; i < workPanels.length; i++) {
      r = workPanels[i].getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        p = (r.top + r.height / 2 - vh / 2) / (vh / 2);
        workPanels[i].style.transform = "translate3d(0," + (-p * 20).toFixed(1) + "px,0)";
      }
    }

    // Footer wordmark rises out of the dark as the footer arrives.
    if (footer && footerWord) {
      r = footer.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        var fp = clamp01((vh - r.top) / (vh * 0.9));
        footerWord.style.transform = "translate3d(0," + ((1 - fp) * 90).toFixed(1) + "px,0)";
        footerWord.style.opacity = fp.toFixed(3);
      }
    }
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) { return; }
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; render(); });
  }

  lenis.on("scroll", schedule);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  render();
})();
