// Safe Harbour Toronto - demo concept
// Nothing on this page is persisted: no localStorage, no cookies, no network calls.

(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobileView = function () { return window.matchMedia("(max-width: 768px)").matches; };

  /* ---------- Quick exit: button + Esc both wipe history ---------- */
  function quickExit() {
    window.location.replace("https://www.google.com");
  }
  document.getElementById("quickExit").addEventListener("click", quickExit);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") quickExit();
  });

  /* ---------- View / tab switching ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var views = {};
  Array.prototype.forEach.call(document.querySelectorAll(".view"), function (v) {
    views[v.getAttribute("data-view")] = v;
  });

  function activate(name) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-goto") === name;
      t.classList.toggle("active", on);
      if (on) { t.setAttribute("aria-current", "page"); }
      else { t.removeAttribute("aria-current"); }
    });
    Object.keys(views).forEach(function (k) {
      views[k].classList.toggle("active", k === name);
    });
    if (isMobileView()) window.scrollTo(0, 0);
  }

  function gotoView(name) {
    if (isMobileView()) {
      activate(name);
    } else {
      var el = views[name];
      if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function setChip(cat) {
    var chips = document.querySelectorAll(".chip");
    chips.forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-chip") === cat); });
    applyFilters();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-goto]");
    if (!t) return;
    e.preventDefault();
    var name = t.getAttribute("data-goto");
    gotoView(name);
    if (name === "find" && t.getAttribute("data-chip")) setChip(t.getAttribute("data-chip"));
  });

  activate("home");

  /* ---------- Resource finder: live search + category chips ---------- */
  var search = document.getElementById("finderSearch");
  var cards = Array.prototype.slice.call(document.querySelectorAll("#resourceCards .card"));
  var noResults = document.getElementById("noResults");

  function currentChip() {
    var el = document.querySelector(".chips .chip.active");
    return el ? el.getAttribute("data-chip") : "all";
  }

  function applyFilters() {
    var q = (search.value || "").trim().toLowerCase();
    var chip = currentChip();
    // The empty state may only ever appear while the user is actively filtering.
    var filtering = q !== "" || chip !== "all";
    var shown = 0;
    cards.forEach(function (card) {
      var okCat = chip === "all" || card.getAttribute("data-cat") === chip;
      var okQ = !q || (card.getAttribute("data-name") || "").toLowerCase().indexOf(q) !== -1;
      var show = okCat && okQ;
      card.hidden = !show;
      if (show) shown++;
    });
    noResults.hidden = !(filtering && shown === 0 && cards.length > 0);
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      applyFilters();
    });
  });
  search.addEventListener("input", applyFilters);

  /* ---------- Safety plan: guided 6-step flow, memory only ---------- */
  var steps = [
    { q: "Who is one person you trust?", hint: "A first name or nickname is enough.", encourage: "Good - knowing who to turn to is a strong first step.", ph: "First name or nickname" },
    { q: "Pick a code word to signal them.", hint: "Something ordinary, like asking about the cat.", encourage: "A code word can speak when you can't.", ph: "Your code word" },
    { q: "Where are two places you could go at any hour?", hint: "A friend's home, a 24-hour shop, a shelter\u2026", encourage: "Knowing your options ahead of time matters.", ph: "Place one, place two\u2026" },
    { q: "Where could you keep important documents and a go bag?", hint: "With someone you trust, or somewhere easy to reach.", encourage: "You're thinking ahead - that's brave.", ph: "Somewhere safe\u2026" },
    { q: "What's the safest way for you to reach out for help?", hint: "A friend's phone, a work computer, a public library\u2026", encourage: "Almost done - one more step.", ph: "Your safest way\u2026" }
  ];
  var answers = ["", "", "", "", ""];
  var visited = {};
  var stepIdx = 0;
  var stepCount = document.getElementById("stepCount");
  var stepBarFill = document.getElementById("stepBarFill");
  var stepQ = document.getElementById("stepQ");
  var stepHint = document.getElementById("stepHint");
  var stepInput = document.getElementById("stepInput");
  var stepEncourage = document.getElementById("stepEncourage");
  var stepBack = document.getElementById("stepBack");
  var stepNext = document.getElementById("stepNext");
  var stepper = document.getElementById("safetyStepper");

  function renderStep() {
    var s = steps[stepIdx];
    stepCount.textContent = "Step " + (stepIdx + 1) + " of 6";
    stepBarFill.style.width = ((stepIdx + 1) / 6 * 100) + "%";
    stepQ.textContent = s.q;
    stepHint.textContent = s.hint;
    stepEncourage.textContent = s.encourage;
    stepInput.value = answers[stepIdx];
    stepInput.placeholder = s.ph;
    stepInput.hidden = false;
    // Encouragement appears only once the user has engaged with this step
    stepEncourage.style.display = (visited[stepIdx] || answers[stepIdx]) ? "" : "none";
    stepInput.oninput = function () {
      visited[stepIdx] = true;
      stepEncourage.style.display = "";
    };
    stepBack.disabled = stepIdx === 0;
    stepBack.style.visibility = stepIdx === 0 ? "hidden" : "visible";
    stepNext.textContent = "Next";
  }

  function renderDone() {
    stepCount.textContent = "Step 6 of 6";
    stepBarFill.style.width = "100%";
    stepper.querySelector(".step-body").innerHTML =
      '<div class="step-done"><span class="big" aria-hidden="true">\u2764</span>' +
      "<p><strong>You've just thought through a safety plan.</strong> That's a real, practical step, and it took courage.</p>" +
      "<p>You deserve support. The numbers on the Find Help tab are here whenever you're ready.</p></div>";
    stepBack.style.visibility = "hidden";
    stepNext.textContent = "Start over";
  }

  stepNext.addEventListener("click", function () {
    if (stepNext.textContent === "Start over") {
      answers = ["", "", "", "", ""];
      visited = {};
      stepIdx = 0;
      // rebuild the step body that renderDone replaced
      stepper.querySelector(".step-body").innerHTML =
        '<label class="step-q" id="stepQ" for="stepInput"></label>' +
        '<p class="step-hint" id="stepHint"></p>' +
        '<textarea class="step-input" id="stepInput" rows="3"></textarea>' +
        '<p class="step-encourage" id="stepEncourage"></p>';
      stepQ = document.getElementById("stepQ");
      stepHint = document.getElementById("stepHint");
      stepInput = document.getElementById("stepInput");
      stepEncourage = document.getElementById("stepEncourage");
      renderStep();
      return;
    }
    answers[stepIdx] = stepInput.value;
    visited[stepIdx] = true;
    if (stepIdx < steps.length - 1) {
      stepIdx++;
      renderStep();
    } else {
      renderDone();
    }
  });

  stepBack.addEventListener("click", function () {
    answers[stepIdx] = stepInput.value;
    visited[stepIdx] = true;
    if (stepIdx > 0) { stepIdx--; renderStep(); }
  });

  renderStep();

  /* ---------- Breathing exercise: in 4, hold 4, out 6 - 4 cycles ---------- */
  var breathBtn = document.getElementById("breathBtn");
  var breathStage = document.getElementById("breathStage");
  var breathCircle = document.getElementById("breathCircle");
  var breathRing = document.getElementById("breathRing");
  var breathPhase = document.getElementById("breathPhase");
  var breathCue = document.getElementById("breathCue");
  var breathCount = document.getElementById("breathCount");
  var cycleDots = Array.prototype.slice.call(document.querySelectorAll("#breathCycles span"));
  var RING_FULL = 653.45;
  var timers = [];
  var breathing = false;

  function ringReset() {
    breathRing.style.transition = "none";
    breathRing.style.strokeDashoffset = RING_FULL;
  }
  function ringRun(secs) {
    if (reducedMotion) return;
    // force the reset to paint before starting the sweep
    void breathRing.getBoundingClientRect();
    breathRing.style.transition = "stroke-dashoffset " + secs + "s linear";
    breathRing.style.strokeDashoffset = "0";
  }

  function stopBreathing() {
    timers.forEach(clearTimeout);
    timers = [];
    breathing = false;
    breathCircle.style.transform = "scale(1)";
    breathStage.classList.remove("breathing", "phase-in", "phase-hold", "phase-out");
    ringReset();
    cycleDots.forEach(function (d) { d.classList.remove("done"); });
    breathBtn.textContent = "Start breathing exercise";
    breathPhase.textContent = "Press start when you are ready.";
    breathCue.textContent = "";
    breathCount.textContent = "4";
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  breathBtn.addEventListener("click", function () {
    if (breathing) { stopBreathing(); return; }
    breathing = true;
    breathBtn.textContent = "Stop";
    breathStage.classList.add("breathing");
    var phases = [
      ["Breathe in", "Feel your chest gently rise", 4, 1.5, "phase-in"],
      ["Hold", "Rest here. Soften your shoulders.", 4, 1.5, "phase-hold"],
      ["Breathe out", "Let it all drift away", 6, 1.0, "phase-out"]
    ];
    var cycles = 4, t = 0;
    for (var c = 0; c < cycles; c++) {
      (function (cycle, last) {
        later(function () {
          cycleDots.forEach(function (d, i) { d.classList.toggle("done", i < cycle); });
        }, t * 1000);
        phases.forEach(function (p) {
          var label = p[0], cue = p[1], secs = p[2], scale = p[3], cls = p[4], start = t;
          later(function () {
            breathPhase.textContent = label;
            breathCue.textContent = cue;
            breathStage.classList.remove("phase-in", "phase-hold", "phase-out");
            breathStage.classList.add(cls);
            if (!reducedMotion) breathCircle.style.transform = "scale(" + scale + ")";
            ringReset();
            ringRun(secs);
            breathCount.textContent = secs;
            for (var i = 1; i < secs; i++) {
              later((function (n) { return function () { breathCount.textContent = n; }; })(secs - i), i * 1000);
            }
          }, start * 1000);
          t += secs;
        });
        later(function () {
          cycleDots.forEach(function (d, i) { d.classList.toggle("done", i <= cycle); });
          if (last) {
            breathPhase.textContent = "Well done.";
            breathCue.textContent = "Take this calm with you.";
            breathStage.classList.remove("phase-in", "phase-hold", "phase-out");
            breathCircle.style.transform = "scale(1)";
            ringReset();
            later(stopBreathing, 3000);
          }
        }, t * 1000);
      })(c, c === cycles - 1);
    }
  });

  /* ---------- 5-4-3-2-1 grounding ---------- */
  var groundSteps = [
    "Name 5 things you can see around you.",
    "Notice 4 things you can touch or feel.",
    "Listen for 3 sounds near you.",
    "Notice 2 things you can smell.",
    "Notice 1 thing you can taste."
  ];
  var gIdx = -1;
  var groundStep = document.getElementById("groundStep");
  var groundNext = document.getElementById("groundNext");
  var groundBack = document.getElementById("groundBack");

  function renderGround() {
    if (gIdx === -1) {
      groundStep.textContent = "Press begin, then notice each thing slowly.";
      groundNext.textContent = "Begin";
    } else if (gIdx < groundSteps.length) {
      groundStep.textContent = groundSteps[gIdx];
      groundNext.textContent = gIdx === groundSteps.length - 1 ? "Finish" : "Next";
    } else {
      groundStep.textContent = "Well done - notice how your body feels now.";
      groundNext.textContent = "Restart";
    }
    groundBack.style.display = gIdx <= 0 ? "none" : "";
  }
  groundNext.addEventListener("click", function () {
    if (gIdx >= groundSteps.length) { gIdx = -1; }
    else { gIdx++; }
    renderGround();
  });
  groundBack.addEventListener("click", function () {
    if (gIdx > 0) { gIdx--; renderGround(); }
  });
  renderGround();

  /* ---------- Discreet mode: neutral decoy screen ---------- */
  var decoy = document.getElementById("decoy");
  document.getElementById("discreetBtn").addEventListener("click", function () {
    decoy.hidden = false;
    document.getElementById("decoyBack").focus();
  });
  document.getElementById("decoyBack").addEventListener("click", function () {
    decoy.hidden = true;
    document.getElementById("discreetBtn").focus();
  });

  /* ---------- Subtle fade-up reveals: smooth, slow, once ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(
      ".triage-card, .promise-list li, .crisis-strip, .card, .stepper, " +
      ".checklist-box, .breath-box, .ground-box, .learn-card, .chat-mockup, " +
      ".privacy-panel, .concept-badge, .site-footer"
    );
    var lastParent = null, sibIdx = 0;
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      if (el.parentNode !== lastParent) { lastParent = el.parentNode; sibIdx = 0; }
      if (sibIdx > 0) el.style.transitionDelay = Math.min(sibIdx, 5) * 60 + "ms";
      sibIdx++;
    });
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("revealed");
        revealer.unobserve(en.target);
        // Hand transitions back to the element's own hover rules once revealed
        en.target.addEventListener("transitionend", function done(ev) {
          if (ev.propertyName !== "opacity") return;
          en.target.removeEventListener("transitionend", done);
          en.target.classList.remove("reveal");
          en.target.style.transitionDelay = "";
        });
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -32px 0px" });
    revealEls.forEach(function (el) { revealer.observe(el); });
  }
})();
