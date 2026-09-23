/* Volt 3D — real-time Three.js spark-bot guide for Webloped v3.
   A single persistent 3D character on a fixed full-viewport canvas. He travels
   between story chapters along damped (never snapping) paths, idles with
   sine-based life (bob, sway, blinks, spark pulse) and reacts at story beats
   (sad / wave / point / celebrate) via an interruptible damped pose system.
   Falls back to the SVG Volt (volt.js) when WebGL or THREE is unavailable.
   prefers-reduced-motion: static posed Volt, no travel, no idle motion. */
(function () {
  "use strict";

  var api = { active: false, setMood: function () {} };
  window.Volt3D = api;

  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function init() {
    if (api.active || !webglOK() || typeof THREE === "undefined") return false;

    var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var MOBILE = window.innerWidth <= 768;

    /* ---------- renderer / scene / camera ---------- */
    var canvas = document.createElement("canvas");
    canvas.id = "volt3d";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) { canvas.remove(); return false; }
    var DPR = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);
    if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var CAM_Z = 9, CAM_FOV = 35;
    var camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    function layout() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    layout();
    var rszT = null;
    window.addEventListener("resize", function () {
      if (rszT) clearTimeout(rszT);
      rszT = setTimeout(function () { MOBILE = window.innerWidth <= 768; layout(); }, 200);
    }, { passive: true });

    /* ---------- lights ---------- */
    scene.add(new THREE.HemisphereLight(0xcfc6ff, 0x0a0a14, 0.95));
    var key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(3.5, 5, 6);
    scene.add(key);
    var rim = new THREE.PointLight(0x7b27d8, 1.4, 30);
    rim.position.set(-4, -1.5, 4);
    scene.add(rim);
    var fill = new THREE.PointLight(0x5846f9, 0.7, 25);
    fill.position.set(4, 2, 3);
    scene.add(fill);

    /* ---------- materials ---------- */
    function brandTexture() {
      var c = document.createElement("canvas");
      c.width = 4; c.height = 256;
      var g = c.getContext("2d");
      var gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0.0, "#8a76ff");
      gr.addColorStop(0.45, "#5846f9");
      gr.addColorStop(1.0, "#7b27d8");
      g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
      var t = new THREE.CanvasTexture(c);
      return t;
    }
    var bodyMat = new THREE.MeshStandardMaterial({
      map: brandTexture(), roughness: 0.32, metalness: 0.18,
      emissive: 0x241259, emissiveIntensity: 0.55
    });
    var limbMat = new THREE.MeshStandardMaterial({
      color: 0x6a5cf0, roughness: 0.4, metalness: 0.1,
      emissive: 0x1c0f4a, emissiveIntensity: 0.5
    });
    var eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.25, emissive: 0xffffff, emissiveIntensity: 0.55
    });
    var pupilMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d16, roughness: 0.35, emissive: 0x0d0d16, emissiveIntensity: 0.4
    });
    var sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xb9a8ff, transparent: true, opacity: 0.35 });
    var cheekMat = new THREE.MeshStandardMaterial({
      color: 0xc9a8ff, emissive: 0xa06ee8, emissiveIntensity: 0.9, roughness: 0.5
    });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x14141f, roughness: 0.6 });

    /* ---------- build Volt ---------- */
    var root = new THREE.Group();   // world position / travel / facing
    var floatG = new THREE.Group(); // idle bob + mood offsets
    root.add(floatG);
    scene.add(root);

    function mesh(geo, mat, x, y, z, parent) {
      var m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      (parent || floatG).add(m);
      return m;
    }

    // head + torso (one friendly rounded form, two volumes)
    var head = mesh(new THREE.SphereGeometry(1, 28, 22), bodyMat, 0, 0.95, 0);
    head.scale.set(1, 0.94, 0.9);
    var torso = mesh(new THREE.SphereGeometry(0.62, 24, 18), bodyMat, 0, -0.62, 0);
    torso.scale.set(1, 1.18, 0.85);
    var belt = mesh(new THREE.TorusGeometry(0.52, 0.055, 12, 32), darkMat, 0, -0.62, 0);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1, 0.85, 1);

    // eyes (groups so blinking = scale y)
    function makeEye(x) {
      var g = new THREE.Group();
      g.position.set(x, 1.02, 0.72);
      var white = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 16), eyeMat);
      white.scale.set(1, 1.4, 0.55);
      var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), pupilMat);
      pupil.position.set(0, 0.02, 0.1);
      var hl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), sparkMat);
      hl.position.set(0.05, 0.1, 0.16);
      g.add(white); g.add(pupil); g.add(hl);
      g.userData.pupil = pupil;
      floatG.add(g);
      return g;
    }
    var eyeL = makeEye(-0.36), eyeR = makeEye(0.36);

    // cheeks
    var cheekL = mesh(new THREE.SphereGeometry(0.09, 12, 10), cheekMat, -0.62, 0.72, 0.6);
    cheekL.scale.set(1, 0.7, 0.5);
    var cheekR = mesh(new THREE.SphereGeometry(0.09, 12, 10), cheekMat, 0.62, 0.72, 0.6);
    cheekR.scale.set(1, 0.7, 0.5);

    // smile / frown (torus arcs)
    var smile = mesh(new THREE.TorusGeometry(0.27, 0.042, 10, 24, Math.PI * 0.75), sparkMat, 0, 0.78, 0.78);
    smile.rotation.z = Math.PI * 1.125;
    var frown = mesh(new THREE.TorusGeometry(0.24, 0.042, 10, 24, Math.PI * 0.7), sparkMat, 0, 0.52, 0.78);
    frown.rotation.z = Math.PI * 0.14;
    frown.visible = false;

    // antenna + spark
    mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.5, 10), limbMat, 0, 2.05, 0);
    var spark = mesh(new THREE.OctahedronGeometry(0.15), sparkMat, 0, 2.42, 0);
    var sparkGlow = mesh(new THREE.OctahedronGeometry(0.26), glowMat, 0, 2.42, 0);

    // arms (pivot groups at shoulders)
    function makeArm(x) {
      var g = new THREE.Group();
      g.position.set(x, -0.35, 0);
      var a = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.5, 6, 12), limbMat);
      a.position.y = -0.32;
      g.add(a);
      floatG.add(g);
      return g;
    }
    var armL = makeArm(-0.66), armR = makeArm(0.66);

    // feet
    function makeFoot(x) {
      var f = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.22, 6, 12), limbMat);
      f.position.set(x, -1.42, 0.08);
      f.rotation.x = Math.PI / 2.15;
      floatG.add(f);
      return f;
    }
    makeFoot(-0.28); makeFoot(0.28);

    /* ---------- pose / mood system (damped, interruptible) ---------- */
    var mood = "idle", moodT = 0;
    var cur = { armL: 0, armR: 0, lean: 0, headYaw: 0, headPitch: 0, droop: 0, eyeOpen: 1 };
    var faceY = 0, spin = 0;
    var blinkT = -1, nextBlink = 2.5;

    var MOODS = {
      idle:      { armL: 0,    armR: 0,    lean: 0,    headYaw: 0,   headPitch: 0,    droop: 0,    eyeOpen: 1 },
      wave:      { armL: 0,    armR: 2.35, lean: -0.06, headYaw: 0,   headPitch: -0.06, droop: 0,    eyeOpen: 1 },
      point:     { armL: 0,    armR: 1.3,  lean: -0.12, headYaw: 0.3, headPitch: 0,    droop: 0,    eyeOpen: 1 },
      sad:       { armL: -0.4, armR: 0.4,  lean: 0.08, headYaw: 0,   headPitch: 0.38, droop: 0.4,  eyeOpen: 0.5 },
      celebrate: { armL: -2.75, armR: 2.75, lean: 0,    headYaw: 0,   headPitch: -0.12, droop: 0,    eyeOpen: 1 }
    };

    api.setMood = function (m) {
      if (!MOODS[m] || m === mood) return;
      mood = m; moodT = 0;
      frown.visible = (m === "sad");
      smile.visible = (m !== "sad");
    };

    /* ---------- chapter tracking + waypoints ---------- */
    var anchorSel = {
      leak: ".leak-volt", meet: "#voltHero", transform: ".xf-volt",
      plan: ".plan-volt", yourturn: "#voltClimax"
    };
    var moodFor = { leak: "sad", meet: "wave", transform: "point", plan: "point", yourturn: "celebrate" };
    var scaleFor = { meet: 0.62, yourturn: 0.55 };
    var offFor = { yourturn: { dx: 380, dy: 60 }, transform: { dx: -10, dy: -30 } };
    var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter[id]"));
    var anchors = {};
    Object.keys(anchorSel).forEach(function (k) { anchors[k] = document.querySelector(anchorSel[k]); });

    var activeChapter = null;
    function detectChapter() {
      var mid = window.innerHeight * 0.5, best = null, bestD = 1e12, i, r, d;
      for (i = 0; i < chapters.length; i++) {
        r = chapters[i].getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          d = Math.abs((r.top + r.bottom) / 2 - mid);
          if (d < bestD) { bestD = d; best = chapters[i].id; }
        }
      }
      if (best !== activeChapter) {
        activeChapter = best;
        api.setMood(moodFor[best] || "idle");
      }
    }
    detectChapter();
    setInterval(detectChapter, 200);

    var worldTarget = { x: 0, y: 0, s: 0 };
    var tmpV = { x: 0, y: 0 };
    function pxToWorld(px, py) {
      var hPx = window.innerHeight, wPx = window.innerWidth;
      var wh = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2));
      var wpp = wh / hPx;
      tmpV.x = (px - wPx / 2) * wpp;
      tmpV.y = (hPx / 2 - py) * wpp;
      return tmpV;
    }
    function computeTarget() {
      var wPx = window.innerWidth, hPx = window.innerHeight;
      // Volt's body extends ~2.75 world units above his anchor point (spark tip)
      // and ~1.5 below — the edge margin must grow with his scale or he clips.
      var wpp = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2))) / hPx;
      var base = (MOBILE ? 0.78 : 1);
      // Volt's body extends ~2.75 world units above his anchor point (spark tip)
      // and ~1.05 to the sides — clampPxS accounts for both (see below).
      var a = anchors[activeChapter];
      var off = offFor[activeChapter] || { dx: 0, dy: 0 };
      var sA = (scaleFor[activeChapter] || 0.5) * base;
      function clampPxS(px, py, s) {
        // Volt is taller than wide: generous vertical margin, modest horizontal.
        // Guarded so narrow screens still get a sane clamp.
        var mgX = Math.min(90 + (1.05 * s) / wpp, wPx / 2 - 40);
        var mgY = Math.min(120 + (2.75 * s) / wpp, hPx / 2 - 40);
        return pxToWorld(
          Math.max(mgX, Math.min(wPx - mgX, px)),
          Math.max(mgY, Math.min(hPx - mgY, py))
        );
      }
      if (activeChapter === "hero") {
        // hidden until the story starts
        var sH = (window.scrollY > hPx * 0.35) ? 0.42 * base : 0.0001;
        var p0 = clampPxS(wPx - 90, hPx * 0.7, sH);
        worldTarget.x = p0.x; worldTarget.y = p0.y;
        worldTarget.s = (window.scrollY > hPx * 0.35) ? 0.42 * base : 0;
        return;
      }
      if (a) {
        var r = a.getBoundingClientRect();
        // ignore anchors scrolled far off-screen (park instead of chasing)
        if (r.bottom < -hPx * 0.4 || r.top > hPx * 1.4) a = null;
        else {
          var p = clampPxS(r.left + r.width / 2 + off.dx, r.top + r.height / 2 + off.dy, sA);
          worldTarget.x = p.x; worldTarget.y = p.y;
          worldTarget.s = sA;
          return;
        }
      }
      var pp = clampPxS(wPx - 84, hPx * 0.74, 0.42 * base);
      worldTarget.x = pp.x; worldTarget.y = pp.y;
      worldTarget.s = 0.42 * base;
    }

    /* ---------- animation loop ---------- */
    var clock = new THREE.Clock();
    var t = 0;
    var damp = THREE.MathUtils.damp;

    // start parked/hidden until first compute
    root.position.set(0, -10, 0);
    root.scale.setScalar(0.0001);

    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!RM) { t += dt; moodT += dt; }

      computeTarget();

      var tg = MOODS[mood];
      var L = RM ? 1000 : 7; // RM: snap, no travel

      // travel (damped — never snaps)
      root.position.x = damp(root.position.x, worldTarget.x, RM ? 1000 : 4.2, dt);
      root.position.y = damp(root.position.y, worldTarget.y, RM ? 1000 : 4.2, dt);
      var cs = root.scale.x;
      root.scale.setScalar(damp(cs, Math.max(worldTarget.s, 0.0001), RM ? 1000 : 4.2, dt));
      // face travel direction, gently (plus one joyful spin on celebrate)
      var faceT = THREE.MathUtils.clamp((worldTarget.x - root.position.x) * 0.55, -0.55, 0.55);
      if (!RM && mood === "celebrate" && moodT < 1.6) spin += dt * 7;
      else if (!RM) {
        var twoPi = Math.PI * 2;
        spin = damp(spin, Math.round(spin / twoPi) * twoPi, 3, dt);
      }
      faceY = damp(faceY, faceT, RM ? 1000 : 5, dt);
      root.rotation.y = faceY + spin;

      // damped pose
      cur.armL = damp(cur.armL, tg.armL, L, dt);
      cur.armR = damp(cur.armR, tg.armR, L, dt);
      cur.lean = damp(cur.lean, tg.lean, L, dt);
      cur.headYaw = damp(cur.headYaw, tg.headYaw, L, dt);
      cur.headPitch = damp(cur.headPitch, tg.headPitch, L, dt);
      cur.droop = damp(cur.droop, tg.droop, L, dt);
      cur.eyeOpen = damp(cur.eyeOpen, tg.eyeOpen, L, dt);

      // mood oscillations (eased by sine — never mechanical)
      var hopY = 0;
      var armRz = cur.armR;
      if (!RM) {
        if (mood === "wave") { armRz += Math.sin(t * 9) * 0.45; hopY = Math.abs(Math.sin(t * 4.2)) * 0.16; }
        else if (mood === "celebrate") hopY = Math.abs(Math.sin(t * 6.5)) * 0.55;
        else if (mood === "point") armRz += Math.sin(t * 2.2) * 0.08;
      }
      armR.rotation.z = armRz;
      armL.rotation.z = cur.armL;

      // idle life
      var bob = RM ? 0 : Math.sin(t * 1.5) * 0.12;
      floatG.position.y = bob + hopY - cur.droop * 0.8;
      floatG.rotation.z = (RM ? 0 : Math.sin(t * 0.9) * 0.045) + cur.lean;
      floatG.rotation.x = RM ? 0 : Math.sin(t * 1.1) * 0.03;
      head.rotation.y = (RM ? 0 : Math.sin(t * 0.55) * 0.12) + cur.headYaw;
      head.rotation.x = cur.headPitch;

      // blink (eye scale y)
      var eyeSY = cur.eyeOpen;
      if (!RM) {
        if (blinkT < 0 && t > nextBlink && mood !== "sad") blinkT = 0;
        if (blinkT >= 0) {
          blinkT += dt / 0.16;
          if (blinkT >= 1) { blinkT = -1; nextBlink = t + 2.2 + Math.random() * 2.4; }
          else eyeSY *= 1 - Math.sin(blinkT * Math.PI) * 0.94;
        }
        // pupils drift subtly
        var px = Math.sin(t * 0.5) * 0.035, py = Math.cos(t * 0.7) * 0.025;
        eyeL.userData.pupil.position.x = px; eyeL.userData.pupil.position.y = 0.02 + py;
        eyeR.userData.pupil.position.x = px; eyeR.userData.pupil.position.y = 0.02 + py;
        // spark pulse
        var sp = 1 + Math.sin(t * 3.1) * 0.12;
        spark.scale.setScalar(sp);
        sparkGlow.material.opacity = 0.28 + 0.18 * Math.sin(t * 3.1);
        sparkGlow.scale.setScalar(sp * 1.05);
        spark.rotation.y += dt * 1.5;
      }
      eyeL.scale.y = eyeSY; eyeR.scale.y = eyeSY;

      renderer.render(scene, camera);
    }
    frame();

    document.documentElement.classList.add("volt3d-on");
    api.active = true;
    // introspection for verification: current vs target pose
    api.debugPos = function () {
      function r3(v) { return Math.round(v * 1000) / 1000; }
      return { x: r3(root.position.x), y: r3(root.position.y), s: r3(root.scale.x),
               tx: r3(worldTarget.x), ty: r3(worldTarget.y), ts: r3(worldTarget.s),
               chapter: activeChapter, mood: mood };
    };
    return true;
  }

  try {
    if (!init() && window.Volt) Volt.mountAll();
  } catch (e) {
    if (window.Volt) { try { Volt.mountAll(); } catch (e2) {} }
  }
})();
