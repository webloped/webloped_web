/* Safe Harbour Toronto — 3D harbour scene + breath orb. Progressive enhancement:
   if WebGL, the CDN, or the module fails, the page works exactly as before. */
(function () {
  "use strict";
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init(THREE, reducedMotion) {
    function spriteTexture() {
      var c = document.createElement("canvas");
      c.width = c.height = 64;
      var g = c.getContext("2d");
      var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,240,210,1)");
      grad.addColorStop(0.4, "rgba(255,225,170,.55)");
      grad.addColorStop(1, "rgba(255,225,170,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return c;
    }

    var scenes = [];

    /* ============ HERO: animated harbour at first light ============ */
    (function initHero() {
      var canvas = document.getElementById("hero-gl");
      var hero = document.getElementById("hero");
      if (!canvas || !hero) return;
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      } catch (e) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

      var scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0a2421, 26, 70);
      var camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
      camera.position.set(0, 6.2, 19);
      camera.lookAt(0, 2.2, -12);

      // Water: displaced plane with custom shader
      var waterUniforms = { uTime: { value: 0 } };
      var waterMat = new THREE.ShaderMaterial({
        uniforms: waterUniforms,
        vertexShader: [
          "uniform float uTime;",
          "varying float vElev;",
          "varying vec2 vUv;",
          "void main() {",
          "  vUv = uv;",
          "  vec3 p = position;",
          "  float w = sin(p.x * 0.32 + uTime * 0.7) * 0.55",
          "          + sin(p.y * 0.5 - uTime * 0.5) * 0.35",
          "          + sin((p.x + p.y) * 0.16 + uTime * 0.32) * 0.6;",
          "  p.z += w;",
          "  vElev = w;",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform float uTime;",
          "varying float vElev;",
          "varying vec2 vUv;",
          "void main() {",
          "  vec3 deep = vec3(0.039, 0.141, 0.129);",
          "  vec3 teal = vec3(0.071, 0.243, 0.227);",
          "  vec3 warm = vec3(0.710, 0.541, 0.278);",
          "  float horizon = smoothstep(0.2, 0.9, vUv.y);",
          "  vec3 col = mix(deep, teal, smoothstep(-1.2, 1.2, vElev) * 0.55 + 0.22);",
          "  float dx = (vUv.x - 0.68) * 1.5;",
          "  float glow = exp(-dx * dx * 5.0) * horizon * horizon;",
          "  col = mix(col, warm, glow * 0.8);",
          "  float sp = smoothstep(0.72, 1.0, vElev) * (0.5 + 0.5 * sin(uTime * 2.0 + vUv.x * 44.0));",
          "  col += vec3(1.0, 0.88, 0.66) * sp * glow * 0.5;",
          "  gl_FragColor = vec4(col, 1.0);",
          "}"
        ].join("\n")
      });
      var water = new THREE.Mesh(new THREE.PlaneGeometry(90, 46, 130, 64), waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -1.6, -8);
      scene.add(water);

      // Sun disc + halo
      var sunMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: [
          "varying vec2 vUv;",
          "void main() {",
          "  float d = length(vUv - 0.5) * 2.0;",
          "  vec3 col = mix(vec3(1.0, 0.87, 0.62), vec3(0.84, 0.60, 0.30), smoothstep(0.0, 1.0, d));",
          "  float a = smoothstep(1.0, 0.12, d) * 0.96;",
          "  gl_FragColor = vec4(col, a);",
          "}"
        ].join("\n")
      });
      var sun = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), sunMat);
      sun.position.set(13, 7.5, -38);
      scene.add(sun);
      var halo = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), sunMat.clone());
      halo.material.opacity = 0.35;
      halo.material.transparent = true;
      halo.position.set(13, 7.5, -39);
      scene.add(halo);

      // Drifting light particles
      var tex = new THREE.CanvasTexture(spriteTexture());
      var COUNT = 220;
      var pos = new Float32Array(COUNT * 3);
      var spd = new Float32Array(COUNT);
      for (var i = 0; i < COUNT; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 1] = Math.random() * 14 - 2;
        pos[i * 3 + 2] = -Math.random() * 34 + 4;
        spd[i] = 0.25 + Math.random() * 0.7;
      }
      var pgeo = new THREE.BufferGeometry();
      pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var pmat = new THREE.PointsMaterial({
        size: 0.5, map: tex, transparent: true, opacity: 0.65,
        color: 0xffe2ae, depthWrite: false, blending: THREE.AdditiveBlending
      });
      var particles = new THREE.Points(pgeo, pmat);
      scene.add(particles);

      var mx = 0, my = 0, tx = 0, ty = 0;
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });

      var visible = true;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.02 }).observe(hero);
      }
      function resize() {
        var w = hero.clientWidth, h = hero.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      if ("ResizeObserver" in window) {
        new ResizeObserver(function () { resize(); }).observe(hero);
      } else {
        window.addEventListener("resize", resize);
      }
      resize();

      scenes.push({
        render: function (t, dt) {
          if (!visible) return;
          waterUniforms.uTime.value = t;
          var arr = pgeo.attributes.position.array;
          for (var j = 0; j < COUNT; j++) {
            arr[j * 3 + 1] += spd[j] * dt;
            arr[j * 3] += Math.sin(t * 0.4 + j) * dt * 0.35;
            if (arr[j * 3 + 1] > 13) arr[j * 3 + 1] = -2;
          }
          pgeo.attributes.position.needsUpdate = true;
          mx += (tx - mx) * 0.04;
          my += (ty - my) * 0.04;
          camera.position.x = Math.sin(t * 0.06) * 1.4 + mx * 1.6;
          camera.position.y = 6.2 - my * 0.9;
          camera.lookAt(mx * 1.2, 2.2, -12);
          sun.position.y = 7.5 + Math.sin(t * 0.25) * 0.35;
          halo.position.y = sun.position.y;
          renderer.render(scene, camera);
        },
        still: function () { waterUniforms.uTime.value = 1.2; renderer.render(scene, camera); }
      });
    })();

    /* ============ BREATH ORB: synced 3D breathing visual ============ */
    var breathCtl = { phase: -1, progress: 0, running: false, target: 1, cur: 1 };
    window.SHBreath = {
      set: function (phase, progress, running) {
        breathCtl.phase = phase; breathCtl.progress = progress; breathCtl.running = running;
        if (phase === 0) breathCtl.target = 1 + 0.4 * progress;
        else if (phase === 1) breathCtl.target = 1.4;
        else if (phase === 2) breathCtl.target = 1.4 - 0.4 * progress;
        else breathCtl.target = 1;
      }
    };
    (function initBreath() {
      var canvas = document.getElementById("breath-gl");
      var stage = canvas ? canvas.parentElement : null;
      if (!canvas || !stage) return;
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      } catch (e) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
      camera.position.set(0, 0, 9);
      camera.lookAt(0, 0, 0);

      var group = new THREE.Group();
      var wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.1, 1),
        new THREE.MeshBasicMaterial({ color: 0xe8c98a, wireframe: true, transparent: true, opacity: 0.75 })
      );
      var core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.55, 2),
        new THREE.MeshBasicMaterial({ color: 0xb58a47, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      var inner = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xfff3d9, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      group.add(wire); group.add(core); group.add(inner);
      scene.add(group);

      var tex = new THREE.CanvasTexture(spriteTexture());
      var COUNT = 90;
      var pos = new Float32Array(COUNT * 3);
      for (var i = 0; i < COUNT; i++) {
        var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), rr = 3.1 + Math.random() * 1.6;
        pos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = rr * Math.cos(ph);
      }
      var pgeo = new THREE.BufferGeometry();
      pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var motes = new THREE.Points(pgeo, new THREE.PointsMaterial({
        size: 0.22, map: tex, transparent: true, opacity: 0.5,
        color: 0xffdca0, depthWrite: false, blending: THREE.AdditiveBlending
      }));
      scene.add(motes);

      function resize() {
        var w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      if ("ResizeObserver" in window) {
        new ResizeObserver(function () { resize(); }).observe(stage);
      } else {
        window.addEventListener("resize", resize);
      }
      resize();

      function panelVisible() {
        var panel = document.getElementById("calm-breath");
        return panel && !panel.hidden && panel.offsetParent !== null &&
          (location.hash || "#/home").indexOf("#/calm") === 0;
      }
      scenes.push({
        render: function (t, dt) {
          if (!panelVisible()) return;
          breathCtl.cur += (breathCtl.target - breathCtl.cur) * Math.min(1, dt * 5);
          var idle = 1 + Math.sin(t * 1.1) * 0.02;
          var s = breathCtl.cur * idle;
          group.scale.set(s, s, s);
          group.rotation.y += dt * (breathCtl.running ? 0.35 : 0.12);
          group.rotation.x = Math.sin(t * 0.3) * 0.18;
          motes.rotation.y -= dt * 0.06;
          renderer.render(scene, camera);
        },
        still: function () { if (panelVisible()) renderer.render(scene, camera); }
      });
    })();

    /* ============ Shared frame loop ============ */
    if (reducedMotion) {
      scenes.forEach(function (s) { try { s.still(); } catch (e) {} });
      return;
    }
    var last = performance.now();
    var clockT = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clockT += dt;
      for (var i = 0; i < scenes.length; i++) {
        try { scenes[i].render(clockT, dt); } catch (e) {}
      }
    }
    requestAnimationFrame(frame);
  }

  // Load three.js; any failure leaves the plain page untouched.
  function boot() {
    var s = document.createElement("script");
    s.type = "module";
    s.textContent = "import * as THREE from 'three'; (" + init.toString() + ")(THREE, " + (reducedMotion ? "true" : "false") + ");";
    s.onerror = function () { /* decorative only */ };
    document.head.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
