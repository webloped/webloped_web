// Safe Harbour Toronto — demo concept

(function () {
  "use strict";

  // ---- Quick exit: Esc key also exits instantly ----
  function quickExit() {
    // replace() so this page does not stay in browser history
    window.location.replace("https://www.google.com");
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") quickExit();
  });
  document.getElementById("quickExit").addEventListener("click", function (e) {
    e.preventDefault();
    quickExit();
  });

  // ---- Mobile nav toggle ----
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
    }
  });

  // ---- Breathing exercise: in 4, hold 4, out 6, 4 cycles ----
  var btn = document.getElementById("breathBtn");
  var circle = document.getElementById("breathCircle");
  var phase = document.getElementById("breathPhase");
  var count = document.getElementById("breathCount");
  var timers = [];
  var running = false;

  function stopBreathing() {
    timers.forEach(clearTimeout);
    timers = [];
    running = false;
    circle.style.transform = "scale(1)";
    btn.textContent = "Start breathing exercise";
    phase.textContent = "Press start when you are ready.";
    count.textContent = "4";
  }

  function schedule(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function breathe() {
    if (running) { stopBreathing(); return; }
    running = true;
    btn.textContent = "Stop";
    var steps = [
      ["Breathe in", 4, 1.45],
      ["Hold", 4, 1.45],
      ["Breathe out", 6, 1.0]
    ];
    var cycles = 4, t = 0;
    for (var c = 0; c < cycles; c++) {
      (function (cycle) {
        steps.forEach(function (s) {
          var label = s[0], secs = s[1], scale = s[2], start = t;
          schedule(function () {
            phase.textContent = label + " \u2026";
            circle.style.transform = "scale(" + scale + ")";
            var remaining = secs;
            count.textContent = remaining;
            for (var i = 1; i < secs; i++) {
              schedule((function (n) {
                return function () { count.textContent = n; };
              })(secs - i), i * 1000);
            }
          }, start * 1000);
          t += secs;
        });
        schedule(function () {
          if (cycle === cycles - 1) {
            phase.textContent = "Well done. Take this calm with you.";
            circle.style.transform = "scale(1)";
            setTimeout(stopBreathing, 2500);
          }
        }, t * 1000);
      })(c);
    }
  }

  btn.addEventListener("click", breathe);
})();
