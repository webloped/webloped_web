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

    // Mobile menu CTA: mirror the header CTA inside the menu, since the
    // header CTA is hidden below 900px. CSS shows it only when the menu opens.
    var headerCta = document.querySelector(".site-header .header-cta");
    if (headerCta) {
      var menuCta = headerCta.cloneNode(true);
      menuCta.classList.add("nav-cta");
      menuCta.removeAttribute("id");
      nav.appendChild(menuCta);
    }
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
        var dest = top + p * (track.offsetHeight - window.innerHeight);
        // Stage 1 motion foundation: glide through Lenis when it's driving scroll.
        if (window.__wlScrollTo) { window.__wlScrollTo(dest); }
        else { window.scrollTo({ top: dest, behavior: "smooth" }); }
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
      " .process-step, .person, .invest-card, .faq-list details, .contact-grid > *," +
      " .case-fact, .case-body .work-visual, .prose, .post-card, .plan-card, .step, .team-card";
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

  // ---- Stage 8: hero particle constellation (vanilla canvas).
  // Decorative only. Pauses off-screen; disabled under reduced motion.
  (function initHeroFx() {
    var canvas = document.getElementById("heroFx");
    var hero = canvas && canvas.closest(".hero");
    if (!canvas || !hero || !canvas.getContext) { return; }
    if (reducedMotion) { return; }
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, parts = [], running = false, raf = 0;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var r = hero.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function seed() {
      var n = Math.min(90, Math.floor(W * H / 22000));
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: 1 + Math.random() * 1.8,
          c: Math.random() < 0.7 ? "139,91,240" : "200,181,255",
          a: 0.25 + Math.random() * 0.45
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      var i, a, b, p, dx, dy, d2;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) { p.x = W + 10; } else if (p.x > W + 10) { p.x = -10; }
        if (p.y < -10) { p.y = H + 10; } else if (p.y > H + 10) { p.y = -10; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + p.c + "," + p.a.toFixed(2) + ")";
        ctx.fill();
      }
      ctx.lineWidth = 1;
      for (a = 0; a < parts.length; a++) {
        for (b = a + 1; b < parts.length; b++) {
          dx = parts[a].x - parts[b].x;
          dy = parts[a].y - parts[b].y;
          d2 = dx * dx + dy * dy;
          if (d2 < 16900) {
            ctx.strokeStyle = "rgba(139,91,240," +
              (0.14 * (1 - d2 / 16900)).toFixed(2) + ")";
            ctx.beginPath();
            ctx.moveTo(parts[a].x, parts[a].y);
            ctx.lineTo(parts[b].x, parts[b].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!running) { running = true; tick(); } }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    }
    resize();
    seed();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { start(); } else { stop(); }
      }).observe(hero);
    } else {
      start();
    }
    window.addEventListener("resize", function () { resize(); seed(); });
  })();

  // ---- Stage 8: kinetic headline (word-by-word rise).
  // Progressive enhancement: no-JS keeps the plain h1; reduced motion skips it.
  (function initKinetic() {
    var h1 = document.querySelector("[data-kinetic]");
    if (!h1 || reducedMotion) { return; }
    var words = [];
    function pushWords(node, cls) {
      node.textContent.split(/\s+/).forEach(function (w) {
        if (w) { words.push({ t: w, c: cls }); }
      });
    }
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      if (node.nodeType === 3) { pushWords(node, ""); }
      else if (node.nodeType === 1) { pushWords(node, node.className); }
    });
    h1.textContent = "";
    words.forEach(function (w, i) {
      var outer = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "wi" + (w.c ? " " + w.c : "");
      inner.style.setProperty("--wd", (150 + i * 70) + "ms");
      inner.textContent = w.t;
      outer.appendChild(inner);
      h1.appendChild(outer);
      h1.appendChild(document.createTextNode(" "));
    });
    // Screen readers use the full sentence via aria-label; word spans are hidden.
    h1.setAttribute("aria-label", words.map(function (w) { return w.t; }).join(" "));
  })();

  // ---- Stage 8: magnetic buttons (fine pointers only, no reduced motion). ----
  (function initMagnetic() {
    if (!window.matchMedia("(pointer: fine)").matches || reducedMotion) { return; }
    Array.prototype.forEach.call(
      document.querySelectorAll(".hero-ctas .btn, .cta-band .btn"),
      function (btn) {
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) / r.width;
          var y = (e.clientY - r.top - r.height / 2) / r.height;
          btn.style.transform = "translate(" + (x * 8).toFixed(1) + "px," +
            (y * 8).toFixed(1) + "px)";
        });
        btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
      }
    );
  })();

  // ---- Stage 8: cascade the CTA band into the scroll-reveal system ----
  if (!reducedMotion && "IntersectionObserver" in window) {
    var ctaKids = document.querySelectorAll(".cta-band .cta-inner > *");
    var ctaIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          ctaIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    Array.prototype.forEach.call(ctaKids, function (el, i) {
      el.classList.add("rv");
      el.style.setProperty("--rd", Math.min(i, 5) * 80 + "ms");
      ctaIO.observe(el);
    });
  }

  // ---- v4 polish Stage 2: hero elevation ----
  // Load-veil lift: the inline head script covered first paint with .veiled;
  // lift it shortly after DOM ready so the entrance plays behind the curtain.
  (function initVeilLift() {
    if (!document.documentElement.classList.contains("veiled")) { return; }
    window.setTimeout(function () {
      document.documentElement.classList.remove("veiled");
    }, 240);
  })();

  // Poster cursor tilt: lerped --tx/--tz compose with the posterDrift
  // keyframes (calc inside rotateX/rotateZ). Fine pointers only, no motion
  // when the visitor prefers reduced motion.
  (function initPosterTilt() {
    if (!window.matchMedia("(pointer: fine)").matches || reducedMotion) { return; }
    var stage = document.querySelector(".hero .assembly-stage");
    var hero = document.querySelector(".hero");
    if (!stage || !hero) { return; }
    var tx = 0, tz = 0, cx = 0, cy = 0, active = false;
    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (tz - cy) * 0.08;
      stage.style.setProperty("--tx", cy.toFixed(2) + "deg");
      stage.style.setProperty("--tz", cx.toFixed(2) + "deg");
      if (Math.abs(tx - cx) > 0.02 || Math.abs(tz - cy) > 0.02) {
        requestAnimationFrame(loop);
      } else { active = false; }
    }
    function kick() {
      if (!active) { active = true; requestAnimationFrame(loop); }
    }
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      tx = (nx * 10).toFixed(2);
      tz = (-ny * 8).toFixed(2);
      kick();
    });
    hero.addEventListener("mouseleave", function () {
      tx = 0; tz = 0; kick();
    });
  })();

  // ---- v4 polish Stage 3: FAQ smooth open/close ----
  // Opening animates for free (CSS grid-template-rows 0fr -> 1fr on [open]).
  // Closing needs a hand: hold 1fr, ease to 0fr, then drop the open state.
  (function initFaqMotion() {
    if (reducedMotion) { return; }
    Array.prototype.forEach.call(document.querySelectorAll(".faq-list details"), function (d) {
      var s = d.querySelector("summary");
      var a = d.querySelector(".faq-a");
      if (!s || !a) { return; }
      s.addEventListener("click", function (e) {
        if (!d.open) { return; }
        e.preventDefault();
        a.style.gridTemplateRows = "1fr";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { a.style.gridTemplateRows = "0fr"; });
        });
        function done(ev) {
          if (ev && ev.propertyName !== "grid-template-rows") { return; }
          d.open = false;
          a.style.gridTemplateRows = "";
          a.removeEventListener("transitionend", done);
        }
        a.addEventListener("transitionend", done);
        window.setTimeout(function () {
          if (d.open && a.style.gridTemplateRows === "0fr") { done(); }
        }, 650);
      });
    });
  })();
})();
