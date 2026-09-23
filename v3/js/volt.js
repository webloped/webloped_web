/* Volt — Webloped spark-bot mascot. Hand-built SVG + GSAP state machine.
   States: idle (bob+blink), wave, point, sad, celebrate. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function svgHTML() {
    return '' +
    '<svg class="volt" viewBox="0 0 120 150" aria-hidden="true">' +
      '<g class="v-float">' +
        '<line x1="60" y1="28" x2="60" y2="14" stroke="#6a5cf0" stroke-width="4" stroke-linecap="round"/>' +
        '<g class="v-antenna">' +
          '<circle class="v-halo" cx="60" cy="10" r="11" fill="#b9a8ff" opacity="0.35"/>' +
          '<path class="v-spark" d="M60 2 L62.5 7.5 L68 10 L62.5 12.5 L60 18 L57.5 12.5 L52 10 L57.5 7.5 Z"/>' +
        '</g>' +
        '<g class="v-head">' +
          '<rect x="28" y="28" width="64" height="56" rx="20" class="v-body"/>' +
          '<rect x="34" y="34" width="20" height="10" rx="5" fill="#fff" opacity="0.18"/>' +
          '<g class="v-eye v-eye-l"><rect x="40" y="46" width="14" height="20" rx="7" class="v-eye"/><circle class="v-pupil" cx="47" cy="58" r="5"/><circle cx="48.6" cy="56" r="1.7" fill="#fff"/></g>' +
          '<g class="v-eye v-eye-r"><rect x="66" y="46" width="14" height="20" rx="7" class="v-eye"/><circle class="v-pupil" cx="73" cy="58" r="5"/><circle cx="74.6" cy="56" r="1.7" fill="#fff"/></g>' +
          '<circle cx="37" cy="68" r="4" class="v-glow" opacity="0.45"/>' +
          '<circle cx="83" cy="68" r="4" class="v-glow" opacity="0.45"/>' +
          '<path class="v-smile" d="M52 71 Q60 77.5 68 71" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
          '<path class="v-frown" d="M52 76 Q60 69.5 68 76" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" style="display:none"/>' +
        '</g>' +
        '<rect class="v-torso" x="44" y="86" width="32" height="26" rx="10" fill="url(#voltGradSoft)"/>' +
        '<rect class="v-belt" x="44" y="98" width="32" height="5" fill="#0d0d16" opacity="0.35"/>' +
        '<g class="v-arm v-arm-l"><rect x="27" y="88" width="13" height="28" rx="6.5"/></g>' +
        '<g class="v-arm v-arm-r"><rect x="80" y="88" width="13" height="28" rx="6.5"/></g>' +
        '<rect x="43" y="114" width="15" height="13" rx="6.5" class="v-arm"/>' +
        '<rect x="62" y="114" width="15" height="13" rx="6.5" class="v-arm"/>' +
      '</g>' +
    '</svg>';
  }

  function mount(el) {
    el.innerHTML = svgHTML();
    if (typeof gsap === "undefined") return null; /* static fallback */
    var q = function (s) { return el.querySelector(s); };
    var inst = {
      el: el, svg: q(".volt"), float: q(".v-float"), head: q(".v-head"),
      eyeL: q(".v-eye-l"), eyeR: q(".v-eye-r"), pupils: el.querySelectorAll(".v-pupil"),
      armL: q(".v-arm-l"), armR: q(".v-arm-r"), halo: q(".v-halo"), spark: q(".v-spark"),
      smile: q(".v-smile"), frown: q(".v-frown"),
      state: "idle", timers: [], tls: []
    };
    [inst.armL, inst.armR].forEach(function (a) {
      a.style.transformBox = "fill-box"; a.style.transformOrigin = "50% 12%";
    });
    [inst.eyeL, inst.eyeR].forEach(function (e) {
      e.style.transformBox = "fill-box"; e.style.transformOrigin = "50% 50%";
    });
    inst.float.style.transformBox = "fill-box";
    inst.float.style.transformOrigin = "50% 60%";
    el._volt = inst;
    if (inst) { startIdle(inst); setState(inst, el.getAttribute("data-volt") || "idle"); }
    return inst;
  }

  function clearTimers(inst) {
    inst.timers.forEach(clearTimeout); inst.timers = [];
    inst.tls.forEach(function (t) { t.kill(); }); inst.tls = [];
  }

  function blinkLoop(inst) {
    if (inst.state === "sad") return;
    var t = setTimeout(function () {
      if (inst.state === "sad") return;
      gsap.to([inst.eyeL, inst.eyeR], { scaleY: 0.08, duration: 0.07, yoyo: true, repeat: 1,
        onComplete: function () { blinkLoop(inst); } });
    }, 2200 + Math.random() * 2200);
    inst.timers.push(t);
  }

  function startIdle(inst) {
    var bob = gsap.to(inst.float, { y: -7, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    var halo = gsap.to(inst.halo, { opacity: 0.12, scale: 0.8, transformOrigin: "50% 50%", duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    inst.tls.push(bob, halo);
    blinkLoop(inst);
  }

  function setState(inst, state) {
    clearTimers(inst);
    gsap.killTweensOf([inst.float, inst.head, inst.armL, inst.armR, inst.eyeL, inst.eyeR, inst.halo, inst.spark]);
    gsap.set([inst.armL, inst.armR], { rotation: 0 });
    gsap.set(inst.float, { y: 0, rotation: 0, scale: 1 });
    gsap.set(inst.head, { y: 0, rotation: 0 });
    gsap.set([inst.eyeL, inst.eyeR], { scaleY: 1 });
    gsap.set(inst.pupils, { y: 0 });
    gsap.set(inst.halo, { opacity: 0.35, scale: 1 });
    inst.smile.style.display = ""; inst.frown.style.display = "none";
    inst.state = state;

    if (state === "wave") {
      startIdle(inst);
      var w = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
      w.to(inst.armR, { rotation: -135, duration: 0.28, ease: "power2.out" })
       .to(inst.armR, { rotation: -95, duration: 0.22, ease: "sine.inOut" })
       .to(inst.armR, { rotation: -135, duration: 0.22, ease: "sine.inOut" })
       .to(inst.armR, { rotation: -95, duration: 0.22, ease: "sine.inOut" })
       .to(inst.armR, { rotation: 0, duration: 0.4, ease: "power2.inOut" });
      inst.tls.push(w);
      var hop = gsap.to(inst.float, { y: -12, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1, delay: 0.1 });
      inst.tls.push(hop);
    } else if (state === "point") {
      startIdle(inst);
      var p = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      p.to(inst.armR, { rotation: -78, duration: 0.4, ease: "back.out(2)" })
       .to(inst.armR, { rotation: -70, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" })
       .to(inst.armR, { rotation: 0, duration: 0.45, ease: "power2.inOut" });
      inst.tls.push(p);
    } else if (state === "sad") {
      gsap.to(inst.float, { y: 10, rotation: 5, duration: 0.8, ease: "power2.out" });
      gsap.to(inst.head, { y: 5, duration: 0.8, ease: "power2.out" });
      gsap.to(inst.pupils, { y: 5, duration: 0.8 });
      gsap.to(inst.halo, { opacity: 0.08, duration: 0.8 });
      gsap.to([inst.armL, inst.armR], { rotation: 14, duration: 0.8 });
      inst.smile.style.display = "none"; inst.frown.style.display = "";
      var droop = gsap.to(inst.float, { y: 14, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      inst.tls.push(droop);
    } else if (state === "celebrate") {
      startIdle(inst);
      var c = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });
      c.to([inst.armL, inst.armR], { rotation: -160, duration: 0.3, ease: "back.out(2)" }, 0)
       .to(inst.float, { y: -26, scale: 1.06, duration: 0.32, ease: "power2.out" }, 0)
       .to(inst.float, { y: 0, scale: 1, duration: 0.5, ease: "bounce.out" })
       .to(inst.float, { rotation: "+=360", duration: 0.6, ease: "power2.inOut" }, "-=0.5")
       .to([inst.armL, inst.armR], { rotation: 0, duration: 0.4 }, "-=0.2");
      inst.tls.push(c);
    } else {
      startIdle(inst);
    }
  }

  function mountAll() {
    document.querySelectorAll(".volt-mount").forEach(function (el) {
      if (!el._volt) mount(el);
    });
  }

  window.Volt = { mountAll: mountAll, setState: function (el, s) { if (el && el._volt) setState(el._volt, s); } };
})();
