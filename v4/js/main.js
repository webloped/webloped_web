/* Webloped v4 — minimal progressive enhancement (Stage 2: static) */
(function () {
  "use strict";

  // Mobile navigation toggle
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  // Contact form: honest mailto compose (direct delivery arrives in Stage 3).
  // Nothing is sent silently — the visitor reviews the email before sending.
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName");
      var email = document.getElementById("fEmail");
      var company = document.getElementById("fCompany");
      var msg = document.getElementById("fMsg");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var subject = "Project enquiry from " + name.value.trim();
      var body = "Name: " + name.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n" +
        "Company: " + (company.value.trim() || "—") + "\n\n" +
        "About the project:\n" + msg.value.trim();

      window.location.href = "mailto:contact@webloped.ca" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();
