/* Safe Harbour Toronto — demo concept. Single-file app logic. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  /* ================= Verified directory data (Sept 2026) ================= */
  var CATS = [
    { key: "crisis", label: "Crisis support" },
    { key: "shelter", label: "Shelter and housing" },
    { key: "legal", label: "Legal support" },
    { key: "counselling", label: "Counselling and community support" },
    { key: "basic", label: "Food and basic needs" }
  ];
  function catLabel(k) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].key === k) return CATS[i].label;
    return k;
  }

  var SERVICES = [
    {
      name: "Interval House", site: "https://intervalhouse.ca",
      purpose: "Emergency shelter plus counselling, legal support and children's programs for women survivors of intimate partner violence and their children.",
      audience: "Women and children escaping abuse; women survivors of intimate partner violence and their children",
      hours: "Crisis line 24/7", languages: null,
      contacts: [
        { label: "Call 416-924-1491", href: "tel:+14169241491", kind: "call" },
        { label: "Call 1-888-293-5516", href: "tel:+18882935516", kind: "call", note: "Toll-free crisis line" },
        { label: "TTY 416-924-0899", href: "tel:+14169240899", kind: "call" }
      ],
      cats: ["shelter", "crisis"]
    },
    {
      name: "Nellie's", site: "https://nellies.org",
      purpose: "Emergency shelter with community outreach, skill-building programs and transitional housing support.",
      audience: "Women and their children facing violence, poverty and homelessness (includes trans women, cis women, and nonbinary people who are femme-presenting)",
      hours: null, languages: null,
      contacts: [
        { label: "Call (416) 461-1084", href: "tel:+14164611084", kind: "call", note: "Crisis line" },
        { label: "Call (416) 461-8903", href: "tel:+14164618903", kind: "call", note: "General line" }
      ],
      cats: ["shelter", "crisis"]
    },
    {
      name: "Central Intake (City of Toronto)", site: "https://www.toronto.ca/community-people/housing-shelter/homeless-help/central-intake/",
      purpose: "City-run telephone service that matches callers with available emergency shelter spaces and connects them to related services.",
      audience: "People experiencing homelessness who need emergency shelter, including families",
      hours: "24/7", languages: null,
      contacts: [
        { label: "Call 416-338-4766", href: "tel:+14163384766", kind: "call" },
        { label: "Call 1-877-338-3398", href: "tel:+18773383398", kind: "call", note: "Toll-free" },
        { label: "Call 311", href: "tel:311", kind: "call" }
      ],
      cats: ["shelter"]
    },
    {
      name: "Assaulted Women's Helpline", site: "https://awhl.org",
      purpose: "Free, anonymous, confidential crisis line offering crisis counselling, safety planning, emotional support and referrals.",
      audience: "All women in Ontario who have experienced any form of abuse",
      hours: "24/7, 365 days", languages: "200+ languages (per Ontario.ca)",
      contacts: [
        { label: "Call 1-866-863-0511", href: "tel:+18668630511", kind: "call", note: "Toll-free" },
        { label: "Call 416-863-0511", href: "tel:+14168630511", kind: "call", note: "GTA" },
        { label: "TTY 1-866-863-7868", href: "tel:+18668637868", kind: "call" }
      ],
      extraNote: "#SAFE (#7233) also works from Bell, Rogers, Fido and Telus mobiles.",
      cats: ["crisis"]
    },
    {
      name: "Toronto Rape Crisis Centre (TRCC/MWAR)", site: "https://trccmwar.ca",
      purpose: "24-hour crisis line plus peer counselling, support groups, legal accompaniment and advocacy.",
      audience: "Survivors of sexual violence",
      hours: "Crisis line 24/7 including holidays", languages: null,
      contacts: [
        { label: "Call 416-597-8808", href: "tel:+14165978808", kind: "call", note: "Crisis line, 24/7" },
        { label: "Text 416-597-8808", href: "sms:+14165978808", kind: "text", note: "Wed\u2013Fri, 6pm\u2013midnight" }
      ],
      cats: ["crisis", "counselling"]
    },
    {
      name: "Talk4Healing (by Beendigen)", site: "https://talk4healing.com",
      purpose: "Free, confidential helpline offering culturally grounded support, counselling, referrals and crisis help.",
      audience: "Indigenous women (services provided by Indigenous women)",
      hours: null, languages: null,
      contacts: [
        { label: "Call 1-855-554-4325", href: "tel:+18555544325", kind: "call" },
        { label: "Text 1-855-554-4325", href: "sms:+18555544325", kind: "text" }
      ],
      extraNote: "Call or text — hours not published on the official site.",
      cats: ["crisis", "counselling"]
    },
    {
      name: "Fem'aide", site: "https://femaide.ca",
      purpose: "Provincial support line by phone, text and live chat, connecting victims and survivors to community services.",
      audience: "Francophone women in Ontario affected by violence",
      hours: "24/7", languages: "French",
      contacts: [
        { label: "Call 1-877-336-2433", href: "tel:+18773362433", kind: "call" },
        { label: "Text 1-877-336-2433", href: "sms:+18773362433", kind: "text" }
      ],
      cats: ["crisis"]
    },
    {
      name: "Victim Services Toronto", site: "https://victimservicestoronto.com",
      purpose: "Trauma-informed crisis response, emotional support, safety planning, practical help and referrals.",
      audience: "Anyone in Toronto who has experienced crime or sudden tragedy",
      hours: "Crisis line 24/7, 365 days", languages: "35+ languages capacity",
      contacts: [
        { label: "Call (416) 808-7066", href: "tel:+14168087066", kind: "call" }
      ],
      cats: ["crisis", "counselling"]
    },
    {
      name: "Barbra Schlifer Commemorative Clinic", site: "https://schliferclinic.com",
      purpose: "Legal representation, counselling, interpretation and referral services, including a Family Court Support Program.",
      audience: "Women who have experienced violence",
      hours: null, languages: "Multilingual interpretation arranged",
      contacts: [
        { label: "Call 416-323-9149", href: "tel:+14163239149", kind: "call", note: "Intake, option 1" }
      ],
      cats: ["legal", "counselling"]
    },
    {
      name: "Legal Aid Ontario", site: "https://legalaid.on.ca",
      purpose: "Funds lawyers for eligible clients; summary legal advice, duty counsel and family law services.",
      audience: "People who qualify financially and have a covered legal issue",
      hours: "Mon\u2013Fri 8am\u20135pm ET", languages: "300+ languages",
      contacts: [
        { label: "Call 416-979-1446", href: "tel:+14169791446", kind: "call", note: "Toronto" },
        { label: "Call 1-800-668-8258", href: "tel:+18006688258", kind: "call", note: "Toll-free" }
      ],
      cats: ["legal"]
    },
    {
      name: "Daily Bread Food Bank", site: "https://dailybread.ca",
      purpose: "Food bank providing food plus information and referral services (housing, legal, ID, employment and more).",
      audience: null,
      hours: "Food bank drop-in Sun & Mon (see site); Tue\u2013Sat by appointment; Info & Referral Mon\u2013Fri 9am\u20134pm, Sun 11am\u20133pm",
      languages: null,
      contacts: [
        { label: "Call 416-203-0050", href: "tel:+14162030050", kind: "call", note: "Ext. 1" }
      ],
      cats: ["basic"]
    },
    {
      name: "211 Ontario", site: "https://211ontario.ca",
      purpose: "Free helpline connecting people to community, social, health and government services.",
      audience: "People in Ontario looking for community services",
      hours: "24/7 in 150+ languages; live chat Mon\u2013Fri 7am\u20139pm ET", languages: "150+ languages by phone",
      contacts: [
        { label: "Call 2-1-1", href: "tel:211", kind: "call" },
        { label: "Text 2-1-1", href: "sms:211", kind: "text" }
      ],
      cats: ["counselling"]
    },
    {
      name: "9-8-8 Suicide Crisis Helpline", site: "https://988.ca",
      purpose: "Canada's national suicide crisis line connecting callers with trained responders.",
      audience: "Anyone thinking about suicide, or worried about someone else",
      hours: "24/7, 365 days", languages: "English and French 24/7; other languages via interpreter on request",
      contacts: [
        { label: "Call 9-8-8", href: "tel:988", kind: "call" },
        { label: "Text 9-8-8", href: "sms:988", kind: "text" }
      ],
      cats: ["crisis"]
    }
  ];

  /* ================= Routing ================= */
  var ROUTES = {
    home: { title: "Support for your next step", label: "Home" },
    find: { title: "Find help", label: "Find Help" },
    plan: { title: "Make a safety plan", label: "Safety Plan" },
    calm: { title: "Calm", label: "Calm" },
    learn: { title: "Learn", label: "Learn" },
    about: { title: "About", label: "About" },
    privacy: { title: "Privacy", label: "Privacy" },
    accessibility: { title: "Accessibility", label: "Accessibility" },
    contact: { title: "Contact", label: "Contact" }
  };
  var liveRegion = $("live-region");

  function parseHash() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    var parts = h.split("?");
    var path = parts[0] || "home";
    var params = {};
    if (parts[1]) {
      parts[1].split("&").forEach(function (kv) {
        var p = kv.split("=");
        params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
      });
    }
    if (!ROUTES[path]) path = "home";
    return { path: path, params: params };
  }

  var currentRoute = null;
  function render() {
    var r = parseHash();
    var leavingPlan = currentRoute === "plan" && r.path !== "plan";
    currentRoute = r.path;

    if (leavingPlan) resetPlan();
    stopBreath();

    document.querySelectorAll(".view").forEach(function (v) { v.hidden = true; });
    var view = $("view-" + r.path);
    view.hidden = false;

    document.querySelectorAll(".tab, .desktop-nav a").forEach(function (a) {
      if (a.getAttribute("data-route") === r.path) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    if (r.path === "find" && r.params.need) {
      var need = r.params.need;
      if (CATS.some(function (c) { return c.key === need; })) {
        filterState.cats = {};
        filterState.cats[need] = true;
        syncFilterUI();
      }
    }
    applyFilters(false);

    document.title = "Safe Harbour Toronto \u2014 " + ROUTES[r.path].title;
    window.scrollTo(0, 0);
    var h1 = view.querySelector("h1");
    if (h1) h1.focus({ preventScroll: true });
    liveRegion.textContent = ROUTES[r.path].label;
  }
  window.addEventListener("hashchange", render);

  /* ================= Quick Exit ================= */
  function quickExit() {
    try { location.replace("https://www.google.com"); }
    catch (e) { location.href = "https://www.google.com"; }
  }
  $("quick-exit").addEventListener("click", quickExit);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") quickExit();
  });

  /* ================= Discreet mode ================= */
  var discreetOverlay = $("discreet-overlay");
  var lastFocusBeforeDiscreet = null;
  $("discreet-btn").addEventListener("click", function () {
    lastFocusBeforeDiscreet = document.activeElement;
    discreetOverlay.hidden = false;
    $("discreet-return").focus();
  });
  function closeDiscreet() {
    discreetOverlay.hidden = true;
    if (lastFocusBeforeDiscreet && lastFocusBeforeDiscreet.focus) lastFocusBeforeDiscreet.focus();
    else $("discreet-btn").focus();
  }
  $("discreet-return").addEventListener("click", closeDiscreet);

  /* ================= Directory: search + filters ================= */
  var filterState = { cats: {}, q: "" };
  var searchInput = $("find-search");
  var serviceList = $("service-list");
  var resultCount = $("result-count");
  var noResults = $("no-results");
  var filtersCount = $("filters-count");

  function icon(name) {
    return '<svg aria-hidden="true" focusable="false"><use href="#' + name + '"/></svg>';
  }

  function renderFilterLists() {
    ["filter-list-desktop", "filter-list-mobile"].forEach(function (id, idx) {
      var host = $(id);
      var prefix = idx === 0 ? "d" : "m";
      host.innerHTML = CATS.map(function (c) {
        var checked = filterState.cats[c.key] ? " checked" : "";
        return '<label><input type="checkbox" id="' + prefix + "-cat-" + c.key +
          '" data-cat="' + c.key + '"' + checked + '><span>' + c.label + "</span></label>";
      }).join("");
    });
  }
  function syncFilterUI() {
    renderFilterLists();
    updateCountBadge();
  }
  function readDialogCats() {
    var cats = {};
    document.querySelectorAll("#filter-list-mobile input[type=checkbox]").forEach(function (cb) {
      if (cb.checked) cats[cb.getAttribute("data-cat")] = true;
    });
    return cats;
  }
  function activeCatCount() { return Object.keys(filterState.cats).length; }
  function updateCountBadge() {
    var n = activeCatCount();
    filtersCount.hidden = n === 0;
    filtersCount.textContent = n;
  }

  function serviceMatches(s) {
    var keys = Object.keys(filterState.cats);
    if (keys.length && !s.cats.some(function (c) { return filterState.cats[c]; })) return false;
    var q = filterState.q.trim().toLowerCase();
    if (!q) return true;
    var hay = (s.name + " " + s.purpose + " " + (s.audience || "") + " " + (s.languages || "") +
      " " + s.cats.map(catLabel).join(" ")).toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function contactHTML(c) {
    var ic = c.kind === "text" ? "i-msg" : "i-phone";
    var sub = c.note ? '<span class="visually-hidden"> \u2014 ' + c.note + "</span>" : "";
    return '<a class="contact-btn" href="' + c.href + '">' + icon(ic) +
      "<span>" + c.label + sub + "</span></a>";
  }

  function serviceHTML(s) {
    var tags = s.cats.map(function (c) { return '<span class="tag">' + catLabel(c) + "</span>"; }).join("");
    var contacts = s.contacts.map(contactHTML).join("");
    var note = s.extraNote ? '<p class="contact-note">' + s.extraNote + "</p>" : "";
    var rows = "";
    if (s.audience) rows += "<dt>Audience</dt><dd>" + s.audience + "</dd>";
    if (s.hours) rows += "<dt>Hours</dt><dd>" + s.hours + "</dd>";
    if (s.languages) rows += "<dt>Languages</dt><dd>" + s.languages + "</dd>";
    rows += '<dt>Website</dt><dd><a href="' + s.site + '" target="_blank" rel="noopener">' +
      s.site.replace(/^https?:\/\/(www\.)?/, "") + "</a></dd>";
    return '<article class="service">' +
      '<h3 class="service-name">' + s.name + "</h3>" +
      '<p class="service-tags">' + tags + "</p>" +
      '<p class="service-purpose">' + s.purpose + "</p>" +
      '<div class="service-contacts">' + contacts + "</div>" + note +
      '<details class="service-more"><summary>Details</summary><dl>' + rows + "</dl></details>" +
      "</article>";
  }

  function applyFilters(announce) {
    var matches = SERVICES.filter(serviceMatches);
    serviceList.innerHTML = matches.map(serviceHTML).join("");
    var n = matches.length;
    resultCount.textContent = n + (n === 1 ? " service" : " services") +
      (activeCatCount() || filterState.q ? " matching your search" : "") + ".";
    noResults.hidden = n !== 0;
    serviceList.style.display = n === 0 ? "none" : "";
    updateCountBadge();
    if (announce) liveRegion.textContent = resultCount.textContent;
  }

  searchInput.addEventListener("input", function () {
    filterState.q = searchInput.value;
    applyFilters(true);
  });

  /* Desktop sidebar: immediate */
  $("filter-list-desktop").addEventListener("change", function (e) {
    var cb = e.target;
    if (cb && cb.getAttribute("data-cat")) {
      if (cb.checked) filterState.cats[cb.getAttribute("data-cat")] = true;
      else delete filterState.cats[cb.getAttribute("data-cat")];
      applyFilters(true);
      updateCountBadge();
    }
  });
  $("clear-desktop").addEventListener("click", function () {
    filterState.cats = {};
    syncFilterUI();
    applyFilters(true);
  });

  /* Mobile dialog */
  var backdrop = $("filters-backdrop");
  var lastFocusBeforeDialog = null;
  function openDialog() {
    lastFocusBeforeDialog = document.activeElement;
    renderFilterLists();
    backdrop.hidden = false;
    $("filters-close").focus();
  }
  function closeDialog() {
    backdrop.hidden = true;
    if (lastFocusBeforeDialog && lastFocusBeforeDialog.focus) lastFocusBeforeDialog.focus();
  }
  $("filters-btn").addEventListener("click", openDialog);
  $("filters-close").addEventListener("click", closeDialog);
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeDialog(); });
  $("filters-clear").addEventListener("click", function () {
    document.querySelectorAll("#filter-list-mobile input[type=checkbox]").forEach(function (cb) { cb.checked = false; });
  });
  $("filters-apply").addEventListener("click", function () {
    filterState.cats = readDialogCats();
    closeDialog();
    syncFilterUI();
    applyFilters(true);
  });
  $("reset-filters").addEventListener("click", function () {
    filterState.cats = {};
    filterState.q = "";
    searchInput.value = "";
    syncFilterUI();
    applyFilters(true);
  });
  /* Basic focus trap for the dialog */
  backdrop.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var focusables = backdrop.querySelectorAll("button, input[type=checkbox]");
    focusables = Array.prototype.filter.call(focusables, function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ================= Safety plan ================= */
  var PLAN_STEPS = [
    { key: "trust", title: "Who is one person you could reach out to?",
      text: "Think of someone you trust \u2014 a friend, a family member, a neighbour, a support worker.",
      hint: "A first name or nickname is enough. You don\u2019t have to write anything." },
    { key: "codeword", title: "A code word or phrase",
      text: "Something ordinary you could say or text to signal that you need help \u2014 like asking about the cat.",
      hint: "Pick something that would sound normal to anyone else." },
    { key: "places", title: "Two places you could go at any hour",
      text: "Somewhere you could get to quickly, any time of day or night \u2014 a friend\u2019s home, a 24-hour shop, a shelter.",
      hint: "Two options gives you a backup." },
    { key: "documents", title: "Where to keep documents and a go bag",
      text: "Important papers and a small bag with essentials \u2014 somewhere you can reach quickly, or with someone you trust.",
      hint: "See the go-bag checklist below for what to include." },
    { key: "reach", title: "The safest way to reach out",
      text: "How would you ask for help if you needed to right now? A friend\u2019s phone, a work computer, a public library.",
      hint: "Choose whatever feels safest for you." }
  ];
  var planIdx = 0;
  var planAnswers = {};

  function planProgressText() { return "Step " + (planIdx + 1) + " of 6"; }

  function renderPlan() {
    $("plan-progress").textContent = planProgressText();
    $("plan-bar-fill").style.width = ((planIdx + 1) / 6 * 100) + "%";
    var host = $("plan-step");
    var nav = $("plan-nav");
    if (planIdx < PLAN_STEPS.length) {
      var s = PLAN_STEPS[planIdx];
      var val = planAnswers[s.key] || "";
      host.innerHTML =
        '<div class="plan-step">' +
        '<h2 class="plan-step-title">' + s.title + "</h2>" +
        '<p class="plan-step-text">' + s.text + "</p>" +
        '<label for="plan-answer" class="visually-hidden">Your notes (optional)</label>' +
        '<textarea id="plan-answer" placeholder="Your notes (optional)">' + val.replace(/</g, "&lt;") + "</textarea>" +
        '<p class="field-hint">' + s.hint + "</p></div>";
      nav.style.display = "";
      $("plan-back").disabled = planIdx === 0;
      $("plan-next").textContent = "Next";
    } else {
      var items = PLAN_STEPS.map(function (s) {
        var a = (planAnswers[s.key] || "").trim();
        return "<li><strong>" + s.title + "</strong><span>" + (a ? a.replace(/</g, "&lt;") : "\u2014") + "</span></li>";
      }).join("");
      host.innerHTML =
        '<div class="plan-step"><h2 class="plan-step-title">Your plan so far</h2>' +
        '<p class="plan-step-text">Read it over. You can go back and change anything, or leave whenever you like.</p>' +
        '<ul class="review-list">' + items + "</ul></div>";
      nav.style.display = "";
      $("plan-back").disabled = false;
      $("plan-next").textContent = "Finish";
    }
    var ta = $("plan-answer");
    if (ta) ta.focus();
  }
  function savePlanStep() {
    var ta = $("plan-answer");
    if (ta && planIdx < PLAN_STEPS.length) planAnswers[PLAN_STEPS[planIdx].key] = ta.value;
  }
  function resetPlan() {
    planIdx = 0;
    planAnswers = {};
    if (currentRoute === "plan") renderPlan();
  }

  $("plan-next").addEventListener("click", function () {
    savePlanStep();
    if (planIdx >= PLAN_STEPS.length) { location.hash = "#/home"; return; }
    planIdx++;
    renderPlan();
  });
  $("plan-back").addEventListener("click", function () {
    savePlanStep();
    if (planIdx > 0) { planIdx--; renderPlan(); }
  });
  $("plan-skip").addEventListener("click", function () {
    if (planIdx < PLAN_STEPS.length) { planIdx++; renderPlan(); }
  });
  $("plan-clear").addEventListener("click", function () {
    planAnswers = {};
    renderPlan();
    liveRegion.textContent = "Your answers have been cleared.";
  });
  $("plan-leave").addEventListener("click", function () {
    planAnswers = {};
    planIdx = 0;
  });

  /* ================= Calm: tool switch ================= */
  var tabBreath = $("calm-tab-breath"), tabGround = $("calm-tab-ground");
  function showCalm(which) {
    var breath = which === "breath";
    tabBreath.setAttribute("aria-pressed", breath ? "true" : "false");
    tabGround.setAttribute("aria-pressed", breath ? "false" : "true");
    $("calm-breath").hidden = !breath;
    $("calm-ground").hidden = breath;
  }
  tabBreath.addEventListener("click", function () { showCalm("breath"); });
  tabGround.addEventListener("click", function () { showCalm("ground"); });

  /* ================= Calm: breathing ================= */
  var PHASES = [
    { label: "Breathe in", dur: 4000 },
    { label: "Hold", dur: 4000 },
    { label: "Breathe out", dur: 6000 }
  ];
  var ROUNDS = 4;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var breath = { running: false, paused: false, round: 1, phase: 0, phaseStart: 0, timer: 0 };
  var circle = $("breath-circle"), phaseEl = $("breath-phase"), roundEl = $("breath-round");
  var bStart = $("breath-start"), bPause = $("breath-pause"), bStop = $("breath-stop"), bReset = $("breath-reset");

  function setBreathButtons() {
    bStart.disabled = breath.running && !breath.paused;
    bPause.disabled = !breath.running;
    bStop.disabled = !breath.running;
    bReset.disabled = !breath.running && breath.round === 1 && breath.phase === 0;
    bPause.innerHTML = breath.paused
      ? icon("i-play") + "Resume"
      : icon("i-pause") + "Pause";
  }
  function breathIdle(msg) {
    breath.running = false; breath.paused = false;
    breath.round = 1; breath.phase = 0;
    clearInterval(breath.timer);
    phaseEl.textContent = msg || "Press start when you are ready.";
    roundEl.textContent = "";
    circle.style.transform = "";
    setBreathButtons();
  }
  function tickBreath() {
    var now = Date.now();
    var ph = PHASES[breath.phase];
    var elapsed = now - breath.phaseStart;
    if (elapsed >= ph.dur) {
      breath.phase++;
      if (breath.phase >= PHASES.length) {
        breath.phase = 0;
        breath.round++;
        if (breath.round > ROUNDS) {
          breathIdle("Complete \u2014 thank you for taking a minute.");
          return;
        }
      }
      breath.phaseStart = now;
      phaseEl.textContent = PHASES[breath.phase].label + "\u2026";
      roundEl.textContent = "Round " + breath.round + " of " + ROUNDS;
      return;
    }
    var p = elapsed / ph.dur;
    var scale;
    if (breath.phase === 0) scale = 1 + 0.4 * p;
    else if (breath.phase === 1) scale = 1.4;
    else scale = 1.4 - 0.4 * p;
    if (!reducedMotion) circle.style.transform = "scale(" + scale.toFixed(3) + ")";
  }
  bStart.addEventListener("click", function () {
    if (breath.running && !breath.paused) return;
    if (breath.paused) {
      breath.paused = false;
      breath.phaseStart = Date.now() - (breath.pausedElapsed || 0);
      breath.timer = setInterval(tickBreath, 100);
    } else {
      breath.running = true; breath.paused = false;
      breath.round = 1; breath.phase = 0;
      breath.phaseStart = Date.now();
      phaseEl.textContent = PHASES[0].label + "\u2026";
      roundEl.textContent = "Round 1 of " + ROUNDS;
      breath.timer = setInterval(tickBreath, 100);
    }
    setBreathButtons();
  });
  bPause.addEventListener("click", function () {
    if (!breath.running) return;
    if (breath.paused) {
      bStart.click();
    } else {
      breath.paused = true;
      breath.pausedElapsed = Date.now() - breath.phaseStart;
      clearInterval(breath.timer);
      phaseEl.textContent = "Paused. Resume when you are ready.";
      setBreathButtons();
    }
  });
  bStop.addEventListener("click", function () { breathIdle("Stopped. Press start when you are ready."); });
  bReset.addEventListener("click", function () { breathIdle(); });
  function stopBreath() { if (breath.running) breathIdle(); }

  /* ================= Calm: grounding ================= */
  var GROUND = [
    { t: "Name 5 things you can see", h: "Look around slowly. Notice colours, shapes and light." },
    { t: "Notice 4 things you can feel", h: "Your feet on the floor, the air on your skin, the chair beneath you." },
    { t: "Listen for 3 things you can hear", h: "Near or far \u2014 just notice them, without judging." },
    { t: "Notice 2 things you can smell", h: "Take a gentle breath in through your nose." },
    { t: "Name 1 thing you can taste", h: "Or one thing you look forward to tasting later." }
  ];
  var gIdx = 0, gDone = false;
  function renderGround() {
    $("ground-step").textContent = gDone ? "Complete" : "Step " + (gIdx + 1) + " of 5";
    if (gDone) {
      $("ground-prompt").textContent = "You\u2019ve finished the exercise.";
      $("ground-hint").textContent = "Well done for taking a moment. You can return here any time.";
      $("ground-next").textContent = "Start over";
    } else {
      $("ground-prompt").textContent = GROUND[gIdx].t;
      $("ground-hint").textContent = GROUND[gIdx].h;
      $("ground-next").textContent = gIdx === GROUND.length - 1 ? "Finish" : "Next";
    }
    $("ground-back").disabled = gIdx === 0 && !gDone;
  }
  $("ground-next").addEventListener("click", function () {
    if (gDone) { gDone = false; gIdx = 0; }
    else if (gIdx < GROUND.length - 1) gIdx++;
    else gDone = true;
    renderGround();
  });
  $("ground-back").addEventListener("click", function () {
    if (gDone) { gDone = false; gIdx = GROUND.length - 1; }
    else if (gIdx > 0) gIdx--;
    renderGround();
  });

  /* ================= Init ================= */
  renderFilterLists();
  renderPlan();
  renderGround();
  setBreathButtons();
  render();
})();
