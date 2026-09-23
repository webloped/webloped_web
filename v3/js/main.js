/* Webloped v3 — "The Leak" scrollytelling engine */
(function () {
  "use strict";
  if (typeof gsap === "undefined") { /* CDN/vendor failed: show static page */
    var p = document.getElementById("preloader"); if (p) p.style.display = "none";
    if (window.Volt) Volt.mountAll();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var hasST = (typeof ScrollTrigger !== "undefined");
  if (hasST) { try { gsap.registerPlugin(ScrollTrigger); } catch (e) { hasST = false; } }
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(pointer: fine)").matches;
  /* No ScrollTrigger (vendor blocked) -> fall back to native scroll layouts. */
  var MOBILE = window.matchMedia("(max-width: 1020px)").matches || !hasST;

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (!RM && window.Lenis) {
    try {
      lenis = new Lenis({ duration: 1.25, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      if (hasST) lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }

  /* ---------- Volt mounts ----------
     volt3d.js runs before this file: if the 3D guide is active it owns the
     mascots (SVG mounts stay hidden as waypoint anchors). Otherwise SVG. */
  if (!(window.Volt3D && Volt3D.active) && window.Volt) Volt.mountAll();
  var volt3D = (window.Volt3D && Volt3D.active) ? Volt3D : null;
  /* Preload both brand logos so the nav theme swap never flashes. */
  ["assets/img/Logo.png", "assets/img/logo-w.png"].forEach(function (s) { var im = new Image(); im.src = s; });
  /* One debounced resize refresh for ScrollTrigger (cheap canvas resizers keep their own). */
  var rzT = null;
  window.addEventListener("resize", function () {
    if (rzT) clearTimeout(rzT);
    rzT = setTimeout(function () { if (hasST) ScrollTrigger.refresh(); }, 250);
  }, { passive: true });

  /* ---------- Custom cursor ---------- */
  if (FINE && !RM) {
    var dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
    if (dot && ring) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    gsap.ticker.add(function () {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform = "translate(" + (mx - 4) + "px," + (my - 4) + "px)";
      var s = ring.classList.contains("is-hover") ? 32 : 19;
      ring.style.transform = "translate(" + (rx - s) + "px," + (ry - s) + "px)";
    });
    document.querySelectorAll("a, button, [data-hover]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
    }
  }

  /* ---------- Magnetic ---------- */
  if (FINE && !RM) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () { gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }); });
    });
  }

  /* ---------- Preloader ---------- */
  var pre = document.getElementById("preloader");
  var plCount = pre.querySelector(".pl-count"), plBar = pre.querySelector(".pl-bar i");
  var heroEls = document.querySelectorAll(".hero-el");
  if (!RM) gsap.set(heroEls, { y: 60, opacity: 0 });
  var loadObj = { v: 0 };
  function finishLoad() {
    var tl = gsap.timeline();
    tl.to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.25 })
      .set(pre, { display: "none" })
      .to(heroEls, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.12 }, "-=0.55");
    if (RM) { pre.style.display = "none"; }
  }
  if (RM) { finishLoad(); }
  else {
    gsap.to(loadObj, { v: 100, duration: 1.7, ease: "power2.inOut",
      onUpdate: function () { var n = Math.round(loadObj.v); plCount.textContent = n; plBar.style.width = n + "%"; },
      onComplete: finishLoad });
    gsap.to(pre.querySelector(".pl-blink"), { scaleY: 0.1, transformOrigin: "50% 50%", duration: 0.08, yoyo: true, repeat: 5 });
  }

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  var brandLogo = document.getElementById("brandLogo");
  /* ---------- Nav theme + active link (rect-based: immune to pin-spacer shifts) ---------- */
  var navLinks = [];
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) navLinks.push({ a: a, sec: sec });
  });
  var themeChapters = Array.prototype.slice.call(document.querySelectorAll(".chapter[data-theme]"));
  var navTicking = false;
  function updateNav() {
    navTicking = false;
    var line = 76, mid = window.innerHeight * 0.45, theme = "dark";
    for (var i = 0; i < themeChapters.length; i++) {
      var r = themeChapters[i].getBoundingClientRect();
      if (r.top <= line && r.bottom >= line) theme = themeChapters[i].getAttribute("data-theme");
    }
    var light = theme === "light";
    nav.classList.toggle("on-light", light);
    brandLogo.src = light ? "assets/img/Logo.png" : "assets/img/logo-w.png";
    navLinks.forEach(function (n) {
      var sr = n.sec.getBoundingClientRect();
      n.a.classList.toggle("active", sr.top <= mid && sr.bottom >= mid);
    });
  }
  function requestNavUpdate() { if (!navTicking) { navTicking = true; requestAnimationFrame(updateNav); } }
  function onScrollPos(y) { nav.classList.toggle("scrolled", y > 30); }
  function onScrollAll(y) { onScrollPos(y); requestNavUpdate(); }
  if (lenis) lenis.on("scroll", function (e) { onScrollAll(e.scroll); });
  else window.addEventListener("scroll", function () { onScrollAll(window.scrollY); }, { passive: true });

  var mmenu = document.getElementById("mmenu");
  document.getElementById("hamburger").addEventListener("click", function () { mmenu.classList.add("open"); });
  document.getElementById("mclose").addEventListener("click", function () { mmenu.classList.remove("open"); });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault(); mmenu.classList.remove("open");
      if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.4 });
      else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* (active-link state is handled by the rect-based updateNav above) */

  /* ---------- Hero starfield ---------- */
  (function stars() {
    var cv = document.getElementById("stars"); if (!cv || RM) return;
    var ctx = cv.getContext("2d"), W, H, pts = [], pmx = 0, pmy = 0;
    function size() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
    size(); window.addEventListener("resize", size);
    for (var i = 0; i < 130; i++) pts.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.4, s: Math.random() * 0.0006 + 0.0002, o: Math.random() * 0.5 + 0.2, tw: Math.random() * 6.28 });
    window.addEventListener("mousemove", function (e) { pmx = (e.clientX / window.innerWidth - 0.5); pmy = (e.clientY / window.innerHeight - 0.5); });
    gsap.ticker.add(function (t) {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(function (p) {
        p.y -= p.s; if (p.y < -0.02) p.y = 1.02;
        var tw = 0.6 + 0.4 * Math.sin(t * 0.001 + p.tw);
        ctx.beginPath();
        ctx.arc(p.x * W + pmx * 30 * p.r, p.y * H + pmy * 30 * p.r, p.r, 0, 6.29);
        ctx.fillStyle = "rgba(180,160,255," + (p.o * tw).toFixed(3) + ")";
        ctx.fill();
      });
    });
  })();

  /* ---------- IntersectionObserver helper (pin-proof reveals) ---------- */
  function onVisible(sel, fn, opts) {
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    if (RM || !("IntersectionObserver" in window)) { els.forEach(function (el) { fn(el, true); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.unobserve(en.target); fn(en.target, false); }
      });
    }, opts || { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- CH.2 THE LEAK ---------- */
  (function leak() {
    var stage = document.querySelector(".leak-stage"); if (!stage) return;
    var cv = document.getElementById("leakCanvas"), ctx = cv.getContext("2d");
    var site = stage.querySelector(".leak-site"), count = document.getElementById("leakCount");
    var W, H, siteBox = { x: 0, y: 0, w: 0, h: 0 };
    function measure() {
      W = cv.width = stage.offsetWidth; H = cv.height = stage.offsetHeight;
      var sr = site.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      siteBox = { x: sr.left - cr.left, y: sr.top - cr.top, w: sr.width, h: sr.height };
    }
    var dots = [], progress = 0, last = 0;
    function spawn() {
      dots.push({ x: siteBox.x + Math.random() * siteBox.w, y: -12, vx: (Math.random() - 0.5) * 0.6, vy: 1.6 + Math.random() * 1.4, r: 2.5 + Math.random() * 2.5, mode: "in", a: 1 });
    }
    function step(dt) {
      ctx.clearRect(0, 0, W, H);
      var target = Math.floor(progress * 60);
      if (dots.length < target && Math.random() < 0.5) spawn();
      var lost = Math.floor(progress * 2840);
      if (count.textContent !== String(lost)) count.textContent = lost;
      dots = dots.filter(function (d) { return d.a > 0.02 && d.y < H + 30; });
      dots.forEach(function (d) {
        if (d.mode === "in") {
          d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.y >= siteBox.y + 8) {
            if (Math.random() < 0.14) { d.mode = "kept"; }
            else { d.mode = "bounce"; d.vy = -(1.5 + Math.random() * 2.5); d.vx = (Math.random() - 0.5) * 5; }
          }
        } else if (d.mode === "bounce") {
          d.vy += 0.09 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.a -= 0.006 * dt;
        } else { d.a -= 0.05 * dt; d.r *= 0.97; }
        ctx.beginPath(); ctx.arc(d.x, d.y, Math.max(d.r, 0.4), 0, 6.29);
        ctx.fillStyle = d.mode === "kept" ? "rgba(123,39,216," + d.a.toFixed(2) + ")"
          : d.mode === "bounce" ? "rgba(255,110,130," + (d.a * 0.85).toFixed(2) + ")"
          : "rgba(190,175,255," + (d.a * 0.9).toFixed(2) + ")";
        ctx.fill();
      });
    }
    var prevT = 0;
    gsap.ticker.add(function (t) { var dt = Math.min((t - prevT) * 1000 / 16.7, 3) || 1; prevT = t; step(dt); });
    measure(); window.addEventListener("resize", measure);
    setTimeout(measure, 500);
    if (RM || !hasST) { progress = 1; return; }
    var mm = gsap.matchMedia();
    mm.add("(min-width: 1021px)", function () {
      ScrollTrigger.create({ trigger: "#leak", start: "top top", end: "+=260%", pin: ".leak-pin", scrub: 0.6,
        onUpdate: function (s) { progress = s.progress; } });
    });
    mm.add("(max-width: 1020px)", function () {
      ScrollTrigger.create({ trigger: ".leak-stage", start: "top bottom", end: "bottom 45%", scrub: 0.6,
        onUpdate: function (s) { progress = s.progress; } });
    });
  })();

  /* ---------- CH.3 typed speech ---------- */
  (function typed() {
    var el = document.getElementById("voltTyped"); if (!el) return;
    var text = "Hi, I'm Volt. I turn leaking websites into customer machines.";
    onVisible("#meet", function () {
      if (RM) { el.textContent = text; return; }
      if (el.dataset.done) return; el.dataset.done = "1";
      var i = 0;
      (function tick() { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 26); })();
    }, { threshold: 0.3 });
  })();

  /* ---------- CH.4 TRANSFORMATION ---------- */
  (function transform() {
    var sec = document.getElementById("transform"); if (!sec) return;
    var oldM = sec.querySelector(".mock-old"), newM = sec.querySelector(".mock-new");
    var vid = document.getElementById("xfVideo"), vwrap = sec.querySelector(".xf-video");
    var cap = document.getElementById("xfCaption"), bar = document.getElementById("xfBar");
    var caps = ["Before: invisible. Forgettable. Leaking.", "The rebuild begins\u2026", "After: built to convert."];
    /* Crossfade captions (instant text swaps flash during scrub). */
    function setCap(p) {
      var c = caps[p < 0.33 ? 0 : p < 0.66 ? 1 : 2];
      if (cap.textContent === c) return;
      gsap.to(cap, { opacity: 0, y: 8, duration: 0.16, ease: "power2.in", overwrite: "auto", onComplete: function () {
        cap.textContent = c;
        gsap.to(cap, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      } });
    }
    if (RM || !hasST) { oldM.style.opacity = 0; newM.style.opacity = 1; setCap(1); return; }
    var tl = gsap.timeline({ scrollTrigger: { trigger: "#transform", start: "top top", end: "+=300%", pin: ".xf-pin", scrub: 0.8,
      onUpdate: function (s) {
        var p = s.progress;
        bar.style.width = (p * 100).toFixed(1) + "%"; setCap(p);
        var show = p > 0.3 && p < 0.68;
        if (show && vid.paused) { vid.play().catch(function () {}); }
        if (!show && !vid.paused) vid.pause();
      } } });
    tl.to(oldM, { scale: 0.96, filter: "grayscale(0.4) brightness(0.7)", duration: 1, ease: "none" }, 0)
      .to(vwrap, { opacity: 1, duration: 0.6, ease: "none" }, 1)
      .to(oldM, { opacity: 0, duration: 0.6, ease: "none" }, 1)
      .to(vwrap, { opacity: 0, scale: 1.06, duration: 0.6, ease: "none" }, 2.2)
      .fromTo(newM, { opacity: 0, scale: 0.94, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "none" }, 2.2);
    /* The 3D guide owns its own moods per chapter; only drive the SVG fallback. */
    if (!volt3D) ScrollTrigger.create({ trigger: "#transform", start: "top 80%", end: "top 20%",
      onEnter: function () { if (window.Volt) Volt.setState(document.querySelector(".xf-volt"), "celebrate"); },
      onLeaveBack: function () { if (window.Volt) Volt.setState(document.querySelector(".xf-volt"), "point"); } });
  })();

  /* ---------- Generic reveals ---------- */
  if (!RM) {
    onVisible(".sec-head, .b-card, .stat, .p-card, .t-card, .why, .faq, .speech, .meet-points li, .funding-inner > *", function (el) {
      gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "expo.out" });
    });
    /* scrubbed word reveals for big headlines */
    onVisible(".display", function (h) {
      if (h.closest("#hero")) return;
      gsap.from(h, { y: 70, opacity: 0, duration: 1.2, ease: "expo.out" });
    });
  }

  /* ---------- CH.6 THE PLAN beats ---------- */
  (function plan() {
    var beats = document.querySelectorAll("#planVisual .beat"); if (!beats.length) return;
    var dots = document.querySelectorAll(".plan-dots i");
    var lastBeat = -1;
    function show(i) {
      /* Only animate on index change: scrub calls this continuously, and
         re-launching tweens every frame caused flicker at boundaries. */
      if (i === lastBeat) return; lastBeat = i;
      beats.forEach(function (b, j) {
        var on = i === j;
        gsap.to(b, { autoAlpha: on ? 1 : 0, y: on ? 0 : 30, duration: 0.6, ease: "power3.out" });
      });
      dots.forEach(function (d, j) { d.classList.toggle("on", j <= i); });
    }
    if (RM || !hasST) { show(2); return; }
    gsap.set(beats, { autoAlpha: 0, y: 30 }); show(0);
    var pmm = gsap.matchMedia();
    pmm.add("(min-width: 1021px)", function () {
      var tl = gsap.timeline({ scrollTrigger: { trigger: "#plan", start: "top top", end: "+=220%", pin: ".plan-pin", scrub: 0.7,
        onUpdate: function (s) { show(Math.min(2, Math.floor(s.progress * 3))); } } });
      tl.to({}, { duration: 3 });
    });
    pmm.add("(max-width: 1020px)", function () {
      ScrollTrigger.create({ trigger: ".plan-grid", start: "top 70%", end: "bottom 45%", scrub: 0.7,
        onUpdate: function (s) { show(Math.min(2, Math.floor(s.progress * 3))); } });
    });
  })();

  /* ---------- CH.7 counters ---------- */
  onVisible(".counter", function (el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    if (RM) { el.textContent = target; return; }
    var o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.8, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
  });

  /* ---------- CH.7 horizontal work gallery ---------- */
  (function work() {
    var track = document.getElementById("workTrack"); if (!track) return;
    var wrap = track.parentElement;
    if (RM || MOBILE) { wrap.style.overflowX = "auto"; return; }
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
    gsap.to(track, { x: function () { return -dist(); }, ease: "none",
      scrollTrigger: { trigger: "#proof", start: "top top", end: function () { return "+=" + (dist() + 400); }, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
  })();

  /* ---------- CH.7 testimonials ---------- */
  (function tst() {
    var quotes = [
      { q: "\u201CWebloped rebuilt our site in three weeks and the phone hasn't stopped ringing. It finally looks like the business we've actually become.\u201D", r: "Home services owner, Ontario" },
      { q: "\u201CThe AI chatbot answers customers at 2am and books jobs while we sleep. It paid for itself in the first month.\u201D", r: "E-commerce store owner, Ontario" },
      { q: "\u201CNo jargon, no surprises, no chasing. They told us the price, hit the date, and the site brings in leads every single week.\u201D", r: "Restaurant owner, Cambridge ON" }
    ];
    var qi = document.getElementById("tstQuote"), ri = document.getElementById("tstRole"), dots = document.getElementById("tstDots");
    var idx = 0, timer = null;
    quotes.forEach(function (_, i) { var d = document.createElement("i"); if (i === 0) d.classList.add("on"); dots.appendChild(d); });
    var ds = dots.querySelectorAll("i");
    function render() { qi.textContent = quotes[idx].q; ri.textContent = quotes[idx].r; ds.forEach(function (d, i) { d.classList.toggle("on", i === idx); }); }
    function go(n) {
      idx = (n + quotes.length) % quotes.length;
      if (RM) { render(); return; }
      gsap.to([qi, ri], { opacity: 0, y: 14, duration: 0.35, ease: "power2.in", onComplete: function () {
        render(); gsap.to([qi, ri], { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" });
      } });
    }
    function auto() { if (timer) clearInterval(timer); if (!RM) timer = setInterval(function () { go(idx + 1); }, 7000); }
    document.getElementById("tstPrev").addEventListener("click", function () { go(idx - 1); auto(); });
    document.getElementById("tstNext").addEventListener("click", function () { go(idx + 1); auto(); });
    render(); auto();
  })();

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq").forEach(function (item) {
    var btn = item.querySelector(".q"), panel = item.querySelector(".a");
    btn.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq.open").forEach(function (o) { o.classList.remove("open"); o.querySelector(".a").style.maxHeight = null; });
      if (!open) { item.classList.add("open"); panel.style.maxHeight = panel.scrollHeight + "px"; }
    });
  });

  /* ---------- CH.11 confetti ---------- */
  (function confetti() {
    var cv = document.getElementById("confetti"); if (!cv || RM) return;
    var ctx = cv.getContext("2d"), W, H, parts = [], running = false;
    var colors = ["#5846f9", "#7b27d8", "#a49bf5", "#ffffff", "#18d26e", "#ffbb2c"];
    function size() { var r = cv.parentElement.getBoundingClientRect(); W = cv.width = r.width; H = cv.height = r.height; }
    function burst(n, spread) {
      size();
      for (var i = 0; i < n; i++) parts.push({ x: W / 2 + (Math.random() - 0.5) * spread, y: H * 0.32, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 3, r: 3 + Math.random() * 5, c: colors[i % colors.length], rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, life: 1 });
      if (!running) { running = true; gsap.ticker.add(tick); }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      parts = parts.filter(function (p) { return p.life > 0 && p.y < H + 20; });
      if (!parts.length) { running = false; gsap.ticker.remove(tick); return; }
      parts.forEach(function (p) {
        p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.006;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.62); ctx.restore();
      });
    }
    onVisible("#yourturn", function () { burst(150, 300); }, { threshold: 0.35 });
    var cta = document.querySelector('#yourturn .btn-primary');
    if (cta) cta.addEventListener("mouseenter", function () { burst(40, 120); });
    window.addEventListener("resize", size);
  })();

  /* ---------- Quote form ---------- */
  document.getElementById("quoteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fName").value.trim(),
        email = document.getElementById("fEmail").value.trim(),
        msg = document.getElementById("fMsg").value.trim();
    if (!name || !email || !msg) { alert("Please fill in your name, email and a few words about your project."); return; }
    var body = "Name: " + name + "\nEmail: " + email + "\nService: " + document.getElementById("fService").value +
      "\nBudget: " + document.getElementById("fBudget").value + "\n\nProject details:\n" + msg;
    window.location.href = "mailto:contact@webloped.ca?subject=" + encodeURIComponent("Website quote request \u2014 " + name) + "&body=" + encodeURIComponent(body);
  });

  window.addEventListener("load", function () { if (hasST) ScrollTrigger.refresh(); requestNavUpdate(); });
  updateNav();
})();
