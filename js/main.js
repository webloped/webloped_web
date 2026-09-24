/* Webloped v5 — progressive enhancement, vanilla JS, no dependencies. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile menu ---------- */
  (function () {
    var toggle = document.getElementById("menuToggle");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) { return; }
    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        var first = nav.querySelector("a");
        if (first) { first.focus(); }
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { close(); toggle.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close(); toggle.focus();
      }
    });
  })();

  /* ---------- veil page transitions (same-site page loads only) ---------- */
  (function () {
    var veil = document.getElementById("veil");
    if (!veil || reducedMotion) { return; }
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) { return; }
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) { return; }
      var url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) { return; }
      e.preventDefault();
      veil.classList.add("is-on");
      setTimeout(function () { location.href = url.href; }, 300);
    });
    window.addEventListener("pageshow", function () { veil.classList.remove("is-on"); });
  })();

  /* ---------- scroll reveals ---------- */
  (function () {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) { io.observe(el); });
  })();

  /* ---------- hero pointer response (fine pointers only, subtle) ---------- */
  (function () {
    if (reducedMotion) { return; }
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var hero = document.querySelector(".hero");
    var frame = document.getElementById("heroFrame");
    if (!fine || !hero || !frame) { return; }
    var raf = null;
    hero.addEventListener("pointermove", function (e) {
      if (raf) { return; }
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform = "translate3d(" + (x * 14).toFixed(1) + "px," +
          (y * 10).toFixed(1) + "px,0)";
      });
    });
    hero.addEventListener("pointerleave", function () {
      frame.style.transform = "";
    });
  })();

  /* ---------- workshop assembly ---------- */
  (function initWorkshop() {
    var section = document.getElementById("workshop");
    var pin = document.getElementById("wsPin");
    var assembly = document.getElementById("wsAssembly");
    if (!section || !pin || !assembly) { return; }

    var supports3D = window.CSS && CSS.supports && CSS.supports("transform-style", "preserve-3d");
    var layers = Array.prototype.slice.call(assembly.querySelectorAll("[data-layer]"));
    var steps = Array.prototype.slice.call(section.querySelectorAll(".ws-step"));
    var dots = Array.prototype.slice.call(section.querySelectorAll(".ws-dot"));
    var prev = document.getElementById("wsPrev");
    var next = document.getElementById("wsNext");
    var skip = document.getElementById("wsSkip");
    var currentStage = -1;

    function setStage(i) {
      i = Math.max(0, Math.min(3, i));
      if (i === currentStage) { return; }
      currentStage = i;
      steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
      dots.forEach(function (d, idx) {
        d.classList.toggle("is-active", idx === i);
        d.setAttribute("aria-selected", idx === i ? "true" : "false");
      });
      if (prev) { prev.disabled = i === 0; }
      if (next) { next.disabled = i === 3; }
    }

    /* Static, complete build for reduced motion, no 3D, or no scroll room. */
    if (!supports3D || reducedMotion) {
      section.classList.add("ws-static");
      layers.forEach(function (el) { el.style.transform = ""; });
      setStage(3);
      return;
    }
    section.classList.add("ws-enhanced");

    var STAGE_STARTS = [0, 0.22, 0.44, 0.66];
    var SPAN = 0.42;
    function clamp01(v) { return Math.min(1, Math.max(0, v)); }
    function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function render(p) {
      assembly.style.transform =
        "rotateX(" + lerp(58, 54, p).toFixed(2) + "deg) rotateZ(" +
        lerp(-38, -32, p).toFixed(2) + "deg)";
      layers.forEach(function (el, i) {
        var lp = smooth((p - STAGE_STARTS[i]) / SPAN);
        var inv = 1 - lp;
        var x = (i - 1.5) * 150 * inv;
        var y = (1.5 - i) * 78 * inv;
        var z = (3 - i) * 165 * inv + i * 26 * lp;
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px," +
          z.toFixed(1) + "px) rotateY(" + ((i - 1.5) * 15 * inv).toFixed(2) + "deg)" +
          " scale(" + (0.94 + 0.06 * lp).toFixed(3) + ")";
        el.style.opacity = (0.55 + 0.45 * lp).toFixed(3);
      });
      setStage(Math.min(3, Math.floor(p * 4)));
    }

    function scrollable() { return pin.offsetHeight - window.innerHeight; }
    function trackProgress() {
      var total = scrollable();
      if (total <= 0) { return 1; }
      return clamp01(-pin.getBoundingClientRect().top / total);
    }
    function gotoStage(i) {
      var total = scrollable();
      if (total <= 0) { setStage(i); render(1); return; }
      var top = pin.getBoundingClientRect().top + window.pageYOffset;
      var y = top + (i / 3) * total * 0.999;
      window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
    }

    var scheduled = false, active = true;
    function onScroll() {
      if (scheduled) { return; }
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        if (active) { render(trackProgress()); }
      });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active) { onScroll(); }
      }, { rootMargin: "120px" }).observe(pin);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        gotoStage(parseInt(d.getAttribute("data-goto"), 10));
      });
    });
    if (prev) { prev.addEventListener("click", function () { gotoStage(currentStage - 1); }); }
    if (next) { next.addEventListener("click", function () { gotoStage(currentStage + 1); }); }
    if (skip) {
      skip.addEventListener("click", function () {
        var total = scrollable();
        if (total <= 0) { setStage(3); render(1); return; }
        var top = pin.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: top + total, behavior: reducedMotion ? "auto" : "smooth" });
      });
    }

    render(trackProgress());
  })();

  /* ---------- FAQ accordion ---------- */
  (function () {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var btn = item.querySelector(".faq-q");
      if (!btn) { return; }
      btn.addEventListener("click", function () {
        var open = item.getAttribute("data-open") === "true";
        item.setAttribute("data-open", String(!open));
        btn.setAttribute("aria-expanded", String(!open));
      });
    });
  })();

  /* ---------- enquiry form: validated mailto fallback ---------- */
  (function () {
    var form = document.getElementById("enquiryForm");
    if (!form) { return; }
    var status = document.getElementById("formStatus");
    var summary = document.getElementById("formErrors");
    var fields = {
      name: {
        input: document.getElementById("fName"),
        test: function (v) { return v.trim().length >= 2; }
      },
      email: {
        input: document.getElementById("fEmail"),
        test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
      },
      message: {
        input: document.getElementById("fMsg"),
        test: function (v) { return v.trim().length >= 10; }
      }
    };

    function setInvalid(key, bad) {
      var wrap = document.querySelector('.field[data-field="' + key + '"]');
      if (!wrap) { return; }
      wrap.classList.toggle("invalid", bad);
      fields[key].input.setAttribute("aria-invalid", bad ? "true" : "false");
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener("input", function () { setInvalid(key, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = [];
      Object.keys(fields).forEach(function (key) {
        var ok = fields[key].test(fields[key].input.value);
        setInvalid(key, !ok);
        if (!ok) { bad.push(key); }
      });
      if (bad.length) {
        var links = bad.map(function (key) {
          var label = fields[key].input.closest(".field").querySelector("label").textContent.trim();
          return '<a href="#' + fields[key].input.id + '">' + label + "</a>";
        });
        summary.innerHTML = "<strong>Please fix " + bad.length + " field" +
          (bad.length > 1 ? "s" : "") + ":</strong> " + links.join(", ") + ".";
        summary.classList.add("show");
        summary.focus();
        status.textContent = "";
        status.className = "form-status";
        return;
      }
      summary.classList.remove("show");
      summary.innerHTML = "";

      var type = document.getElementById("fType").value;
      var subject = "Project enquiry from " + fields.name.input.value.trim();
      var body = "Name: " + fields.name.input.value.trim() + "\n" +
        "Email: " + fields.email.input.value.trim() + "\n" +
        (type ? "Project type: " + type + "\n" : "") + "\n" +
        fields.message.input.value.trim();
      status.textContent = "Opening your email app — review and send when ready.";
      status.className = "form-status info";
      window.location.href = "mailto:contact@webloped.ca?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  })();
})();
