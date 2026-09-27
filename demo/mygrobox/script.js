/* MyGroBox concept site — interactions */
(function () {
  "use strict";

  /* ── Sticky nav state ── */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ── Mobile menu ── */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("open");
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ── Scroll reveal ── */
  var revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.transitionDelay = d + "ms";
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ── Animated counters ── */
  var counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var dur = 1400;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ── Parallax: hero frame + band ── */
  var heroFrame = document.getElementById("heroFrame");
  var band = document.querySelector(".band");
  var bandBg = document.getElementById("bandBg");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function parallax() {
    if (reduceMotion) return;
    var y = window.scrollY;
    if (heroFrame && y < window.innerHeight * 1.2) {
      heroFrame.style.transform = "translateY(" + y * 0.08 + "px)";
    }
    if (band && bandBg) {
      var r = band.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.bottom > 0 && r.top < vh) {
        var progress = (vh - r.top) / (vh + r.height); // 0..1 through viewport
        bandBg.style.transform = "translateY(" + (progress - 0.5) * 18 + "%)";
      }
    }
  }
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          parallax();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  parallax();

  /* ── FAQ accordion ── */
  document.querySelectorAll(".acc-item").forEach(function (item) {
    var btn = item.querySelector(".acc-btn");
    var panel = item.querySelector(".acc-panel");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // close others
      document.querySelectorAll(".acc-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".acc-panel").style.maxHeight = null;
        other.querySelector(".acc-btn").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ── Footer year ── */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
