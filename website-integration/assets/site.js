/* ════════════════════════════════════════════════════════════
   WRMP.org — Site behavior
   Exhibit dialog: open / close, iframe src lifecycle, focus,
   body-scroll lock. Page-agnostic — any page linking site.css
   can mark up an exhibit cover + dialog and this wires it up.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var dialog = document.getElementById("exhibit-dialog");
  if (!dialog) return;

  var iframe = dialog.querySelector(".exhibit-dialog__iframe");
  var closeBtn = dialog.querySelector(".exhibit-dialog__close");
  var triggers = document.querySelectorAll("[data-exhibit-src]");
  var lastTrigger = null;

  // Exhibit documents ship with an opaque body background. They load
  // from the same origin, so each time one loads we inject a
  // transparent-background override — this lets the dialog's dark
  // backdrop show around the exhibit instead of a light frame.
  iframe.addEventListener("load", function () {
    try {
      var doc = iframe.contentDocument;
      if (doc && doc.head) {
        var style = doc.createElement("style");
        style.textContent = "html,body{background:transparent !important;}";
        doc.head.appendChild(style);
      }
    } catch (e) {
      /* exhibit not same-origin or not ready — leave as-is */
    }
    // Reveal only now — the iframe was held at opacity 0 so the
    // exhibit's opaque body never flashes before the override above.
    iframe.classList.add("is-ready");
  });

  function openDialog(trigger) {
    lastTrigger = trigger;
    var src = trigger.getAttribute("data-exhibit-src");
    // Set src on open so the exhibit starts fresh each time.
    // Drop is-ready first so the new exhibit starts hidden.
    iframe.classList.remove("is-ready");
    iframe.setAttribute("src", src);
    document.body.classList.add("is-dialog-open");
    dialog.showModal();
  }

  function closeDialog() {
    if (!dialog.open) return;
    dialog.close();
  }

  function onClose() {
    // Clear src so the exhibit stops running in the background.
    iframe.setAttribute("src", "");
    document.body.classList.remove("is-dialog-open");
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      openDialog(trigger);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDialog);
  }

  // Native <dialog> fires `close` for Esc and programmatic close.
  dialog.addEventListener("close", onClose);

  // Click on the backdrop closes. The dialog fills the viewport, so
  // a true backdrop click means the pointer landed outside the
  // exhibit's centred 16:9 frame. Hit-test the click against the
  // bounding box of the iframe (the actual exhibit content).
  dialog.addEventListener("click", function (e) {
    // Clicks bubbling up from the close button / iframe are not backdrop.
    if (e.target.closest(".exhibit-dialog__close")) return;
    var rect = iframe.getBoundingClientRect();
    var inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) {
      closeDialog();
    }
  });
})();

/* ════════════════════════════════════════════════════════════
   Science-Framework TOC scroll-spy
   ────────────────────────────────────────────────────────────
   Highlights the table-of-contents entry for whichever section is
   currently in view (About + each guiding question), so the active
   chip reflects scroll position instead of a hardcoded default.
   Own IIFE — the dialog script above returns early on pages without
   an #exhibit-dialog, and this must still run on the SF pages. No-ops
   anywhere there's no .sf-toc (or where IntersectionObserver is
   unsupported), so it's safe to ship in the shared site.js.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var toc = document.querySelector(".sf-toc");
  if (!toc || !("IntersectionObserver" in window)) return;

  // Map each TOC link to its target section (skip links whose section
  // isn't on the page — keeps this resilient to page-to-page markup).
  var linkById = {};
  var sections = [];
  toc.querySelectorAll(".sf-toc__link").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (href.charAt(0) !== "#") return;
    var id = href.slice(1);
    var section = document.getElementById(id);
    if (!section) return;
    linkById[id] = link;
    sections.push(section);
  });
  if (!sections.length) return;

  var visible = {};
  var activeId = null;

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    Object.keys(linkById).forEach(function (key) {
      linkById[key].classList.toggle("sf-toc__link--active", key === id);
    });
  }

  // Active = the section highest in document order that overlaps the
  // trigger band. A tall section stays active until its bottom clears
  // the band and the next one takes over.
  function update() {
    for (var i = 0; i < sections.length; i++) {
      if (visible[sections[i].id]) {
        setActive(sections[i].id);
        return;
      }
    }
  }

  // Trigger band sits ~15–25% down the viewport (rootMargin crops the
  // root to a thin horizontal strip near the top).
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      update();
    },
    { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();

/* ════════════════════════════════════════════════════════════
   Science-Framework tag popovers — moved to shared/js/sf-popover.js
   ────────────────────────────────────────────────────────────
   The old tooltip IIFE here anchored its bubble inside the tag and
   was clipped by overflow:hidden on poster cards. The replacement
   is a shared, body-appended position:fixed popover used by the
   website pages AND the round-4 exhibits. Pages load
   ../shared/css/sf-popover.css + ../shared/js/sf-popover.js.
   ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   Megamenu — click to toggle, Esc / outside-click to close
   ────────────────────────────────────────────────────────────
   Additive and self-disabling: a page whose header still uses
   plain <a class="site-nav__item"> links has no [data-mega]
   triggers, so this no-ops. Click (not hover) is authoritative
   so the open state survives a screenshot and a keyboard user
   gets the same affordance as a pointer user.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var triggers = Array.prototype.slice.call(
    document.querySelectorAll("[data-mega]")
  );
  if (!triggers.length) return;

  var header = document.querySelector(".site-header");
  var openTrigger = null;

  function panelFor(trigger) {
    return document.getElementById(trigger.getAttribute("data-mega"));
  }

  function close() {
    if (!openTrigger) return;
    var panel = panelFor(openTrigger);
    if (panel) panel.classList.remove("is-open");
    openTrigger.setAttribute("aria-expanded", "false");
    openTrigger = null;
  }

  function open(trigger) {
    if (openTrigger === trigger) {
      close();
      return;
    }
    close();
    var panel = panelFor(trigger);
    if (!panel) return;
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    openTrigger = trigger;
  }

  triggers.forEach(function (trigger) {
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      open(trigger);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !openTrigger) return;
    var focused = openTrigger;
    close();
    focused.focus();
  });

  document.addEventListener("click", function (e) {
    if (!openTrigger) return;
    if (header && header.contains(e.target)) return;
    close();
  });
})();
