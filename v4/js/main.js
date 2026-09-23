/* Webloped v4 — minimal progressive enhancement (Stage 3) */
(function () {
  "use strict";

  // ---- Mobile navigation: toggle, Escape to close, focus management ----
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (toggle && nav) {
    var navLinks = nav.querySelectorAll("a");

    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open && navLinks.length) {
        navLinks[0].focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        setOpen(false);
      }
    });
  }

  // ---- Contact form: honest mailto compose (real endpoint = owner-provisioned).
  // Nothing is sent silently — the visitor reviews the email before sending.
  var form = document.getElementById("quoteForm");
  if (form) {
    var errorsBox = document.getElementById("formErrors");
    var statusBox = document.getElementById("formStatus");

    function field(id) { return document.getElementById(id); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = field("fName");
      var email = field("fEmail");
      var company = field("fCompany");
      var type = field("fType");
      var msg = field("fMsg");

      // Accessible error summary: list missing/invalid fields, focus it.
      var problems = [];
      if (!name.value.trim()) { problems.push({ el: name, label: "Your name" }); }
      if (!email.value.trim()) {
        problems.push({ el: email, label: "Email" });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        problems.push({ el: email, label: "Email (must look like name@example.com)" });
      }
      if (!msg.value.trim()) { problems.push({ el: msg, label: "About your project" }); }

      if (errorsBox) { errorsBox.hidden = true; errorsBox.innerHTML = ""; }
      if (problems.length) {
        if (errorsBox) {
          var list = document.createElement("ul");
          problems.forEach(function (p) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "#" + p.el.id;
            a.textContent = "Enter " + p.label;
            a.addEventListener("click", function (ev) {
              ev.preventDefault();
              p.el.focus();
            });
            li.appendChild(a);
            list.appendChild(li);
          });
          var heading = document.createElement("strong");
          heading.textContent = "Please fix " + problems.length + " field" +
            (problems.length > 1 ? "s" : "") + ":";
          errorsBox.appendChild(heading);
          errorsBox.appendChild(list);
          errorsBox.hidden = false;
          errorsBox.setAttribute("tabindex", "-1");
          errorsBox.focus();
        }
        return;
      }

      var subject = "Project enquiry from " + name.value.trim();
      var body = "Name: " + name.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n" +
        "Company: " + (company.value.trim() || "—") + "\n" +
        "Project type: " + (type ? type.value : "Not specified") + "\n\n" +
        "About the project:\n" + msg.value.trim();

      if (statusBox) {
        statusBox.textContent = "Opening your email app — review and send the message yourself. " +
          "Nothing is sent automatically.";
      }
      window.location.href = "mailto:contact@webloped.ca" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  // ---- Stage 4: workshop assembly (CSS 3D scene + tiny vanilla scroll driver).
  // No animation libraries: the scene is pure CSS 3D (GPU-composited,
  // transform-only); JS only maps scroll position to layer transforms.
  // Fallbacks: no preserve-3d -> plain stage list; reduced motion -> static
  // assembled scene with tab-style controls; no JS -> stage list (default).
  (function initAssembly() {
    var asm = document.getElementById("assembly");
    var track = document.getElementById("assemblyTrack");
    if (!asm || !track) { return; }
    var supports3D = window.CSS && CSS.supports && CSS.supports("transform-style", "preserve-3d");
    if (!supports3D) { return; }

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var tilt = document.getElementById("aTilt");
    var glow = document.getElementById("aGlow");
    var hint = document.getElementById("assemblyHint");
    var bar = document.getElementById("assemblyBar");
    var list = document.getElementById("stageList");
    var layers = Array.prototype.slice.call(track.querySelectorAll("[data-layer]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("#assemblyControls button"));

    // Each layer assembles during its own overlapping window of overall progress.
    var STAGE_STARTS = [0, 0.18, 0.36, 0.54];
    var SPAN = 0.5;
    var currentStage = -1;

    function clamp01(v) { return Math.min(1, Math.max(0, v)); }
    function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function setStage(i) {
      if (i === currentStage) { return; }
      currentStage = i;
      panels.forEach(function (p, idx) {
        var on = idx === i;
        p.classList.toggle("is-active", on);
        if (on) { p.removeAttribute("hidden"); } else { p.setAttribute("hidden", ""); }
      });
      buttons.forEach(function (b, idx) {
        b.setAttribute("aria-current", idx === i ? "true" : "false");
      });
    }

    function render(p) {
      // The whole stack settles from a steep exploded view to a calm 3/4 view.
      tilt.style.transform = "rotateX(" + lerp(58, 47, p).toFixed(2) + "deg) rotateZ(" +
        lerp(-16, -9, p).toFixed(2) + "deg)";
      layers.forEach(function (el, i) {
        var lp = smooth((p - STAGE_STARTS[i]) / SPAN);
        var inv = 1 - lp;
        var x = (i - 1.5) * 84 * inv;
        var y = (1.5 - i) * 40 * inv;
        var z = (3 - i) * 150 * inv + i * 20 * lp;
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px," +
          z.toFixed(1) + "px) rotateY(" + ((i - 1.5) * 16 * inv).toFixed(2) + "deg)" +
          " scale(" + (0.92 + 0.08 * lp).toFixed(3) + ")";
        el.style.opacity = (0.4 + 0.6 * lp).toFixed(3);
      });
      if (glow) { glow.style.opacity = (p * 0.85).toFixed(3); }
      if (bar) { bar.style.transform = "scaleX(" + p.toFixed(4) + ")"; }
      if (hint) { hint.classList.toggle("is-done", p > 0.03); }
      setStage(Math.min(3, Math.floor(p * 4)));
    }

    function trackProgress() {
      var total = track.offsetHeight - window.innerHeight;
      if (total <= 0) { return 1; }
      return clamp01(-track.getBoundingClientRect().top / total);
    }

    // Reveal the enhancement, retire the static list.
    asm.removeAttribute("hidden");
    if (list) { list.setAttribute("hidden", ""); }

    if (reduced) {
      asm.classList.add("is-reduced");
      render(1);
      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          setStage(parseInt(b.getAttribute("data-stage"), 10));
        });
      });
      return;
    }

    var scheduled = false;
    var active = true;
    function onScroll() {
      if (scheduled) { return; }
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        if (active) { render(trackProgress()); }
      });
    }
    // Don't burn frames while the section is off-screen.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active) { onScroll(); }
      }, { rootMargin: "100px" }).observe(track);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var p = parseInt(b.getAttribute("data-stage"), 10) / 3;
        var top = track.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: top + p * (track.offsetHeight - window.innerHeight), behavior: "smooth" });
      });
    });

    render(trackProgress());
  })();

  // ---- Stage 5: motion polish, scroll reveals, page transitions ----
  // Same driver philosophy: vanilla JS, transform/opacity only, no libraries.
  // Progressive enhancement: .rv is only ever added by JS (under .js on <html>),
  // so no-JS visitors see full content; reduced-motion visitors skip the effects.
  document.documentElement.classList.add("js");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header deepens once the page is scrolled.
  (function () {
    var header = document.querySelector(".site-header");
    if (!header) { return; }
    function onScroll() {
      header.classList.toggle("is-scrolled", window.pageYOffset > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  // Scroll reveals for section content (the workshop drives its own animation).
  if (!reducedMotion && "IntersectionObserver" in window) {
    var SELECTORS = ".section-head, .work-block, .service-group, .service-strip," +
      " .process-step, .person, .invest-card, .faq-list details, .contact-grid > *";
    var els = Array.prototype.filter.call(
      document.querySelectorAll(SELECTORS),
      function (el) { return !el.closest("#workshop"); }
    );
    var byParent = new Map();
    els.forEach(function (el) {
      el.classList.add("rv");
      var p = el.parentElement;
      if (!byParent.has(p)) { byParent.set(p, []); }
      byParent.get(p).push(el);
    });
    // Stagger siblings so groups cascade instead of popping in together.
    byParent.forEach(function (list) {
      list.forEach(function (el, i) {
        el.style.setProperty("--rd", Math.min(i, 5) * 80 + "ms");
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  // Page transitions: fade a veil over same-site page navigations.
  (function () {
    var veil = document.getElementById("veil");
    if (!veil || reducedMotion) { return; }
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || a.target === "_blank") { return; }
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") { return; }
      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) { return; }
      if (url.pathname === window.location.pathname) { return; }
      e.preventDefault();
      veil.classList.add("is-on");
      window.setTimeout(function () { window.location.href = url.href; }, 210);
    });
    // Clear the veil when arriving (including back/forward cache restores).
    window.addEventListener("pageshow", function () {
      veil.classList.remove("is-on");
    });
  })();
})();
