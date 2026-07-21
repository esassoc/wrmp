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
   Science-Framework tag tooltips
   ────────────────────────────────────────────────────────────
   Progressive enhancement for the guiding-question badges
   (.exhibit-tag) on exhibit poster cards. The full guiding-question
   text already lives in each tag's `title`; the native title tooltip
   is mouse-only, unstyled, and never keyboard-reachable. This upgrade
   swaps it for a styled, ARIA-described bubble that opens on hover AND
   keyboard focus and dismisses on blur, mouseleave, or Escape — the
   WAI-ARIA APG tooltip pattern.

   Page-agnostic: no-ops when no .exhibit-tag[title] is present (like the
   dialog + scroll-spy IIFEs above), and a MutationObserver re-upgrades
   badges rebuilt at runtime — the featured-exhibit switcher clears and
   re-renders its tags — so the tag's own `title` stays the single source
   of truth for current and future badges. No second data table.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var SEL = ".exhibit-tag[title]";
  if (!document.querySelector(SEL)) return;

  var uid = 0;
  var activeTag = null;

  function hide(tag) {
    if (!tag || !tag._tip) return;
    tag._tip.classList.remove("is-visible");
    if (activeTag === tag) activeTag = null;
  }

  // Place the bubble below-left of the tag, then clamp inside the poster
  // card (or the viewport for tags in a plain row) and flip above only
  // when a long question would spill past the card's bottom.
  function position(tag, tip) {
    var card = tag.closest(".exhibit-card");
    var pad = 6;
    var bound = card
      ? card.getBoundingClientRect()
      : {
          left: 8,
          top: 8,
          right: window.innerWidth - 8,
          bottom: window.innerHeight - 8,
        };

    // Reset to the default so we measure the un-shifted bubble.
    tip.classList.remove("is-above");
    tip.style.left = "0px";

    var tagRect = tag.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();

    // Horizontal clamp — keep the bubble inside the bound.
    var left = 0;
    var overRight = tagRect.left + tipRect.width - (bound.right - pad);
    if (overRight > 0) left -= overRight;
    if (tagRect.left + left < bound.left + pad) {
      left = bound.left + pad - tagRect.left;
    }
    tip.style.left = left + "px";

    // Keep the arrow pointing at the tag through the shift.
    var arrowX = tagRect.width / 2 - left;
    arrowX = Math.max(12, Math.min(arrowX, tipRect.width - 12));
    tip.style.setProperty("--arrow-x", arrowX + "px");

    // Vertical flip — only when below spills and above has more room.
    var belowSpill =
      tagRect.bottom + 9 + tipRect.height > bound.bottom - pad;
    var roomAbove = tagRect.top - bound.top;
    var roomBelow = bound.bottom - tagRect.bottom;
    if (belowSpill && roomAbove > roomBelow) tip.classList.add("is-above");
  }

  function show(tag) {
    if (!tag._tip) return;
    if (activeTag && activeTag !== tag) hide(activeTag);
    activeTag = tag;
    position(tag, tag._tip);
    tag._tip.classList.add("is-visible");
  }

  function upgrade(tag) {
    if (tag._tip) return; // already enhanced
    var text = tag.getAttribute("title");
    if (!text) return;
    tag.removeAttribute("title"); // suppress the native browser tooltip
    tag.setAttribute("data-tooltip-ready", "");
    if (!tag.hasAttribute("tabindex")) tag.setAttribute("tabindex", "0");

    var tip = document.createElement("span");
    tip.className = "exhibit-tag-tip";
    tip.setAttribute("role", "tooltip");
    tip.id = "exhibit-tag-tip-" + ++uid;
    tip.textContent = text;
    tag.appendChild(tip);
    tag.setAttribute("aria-describedby", tip.id);
    tag._tip = tip;

    tag.addEventListener("mouseenter", function () {
      show(tag);
    });
    tag.addEventListener("mouseleave", function () {
      hide(tag);
    });
    tag.addEventListener("focus", function () {
      show(tag);
    });
    tag.addEventListener("blur", function () {
      hide(tag);
    });
  }

  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches && node.matches(SEL)) upgrade(node);
    if (node.querySelectorAll) node.querySelectorAll(SEL).forEach(upgrade);
  }

  // Initial pass over the static badges.
  document.querySelectorAll(SEL).forEach(upgrade);

  // Escape dismisses the visible tooltip; focus stays on the tag (APG).
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && activeTag) hide(activeTag);
  });

  // Re-upgrade badges rebuilt at runtime (featured switcher, future pages).
  if ("MutationObserver" in window) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) scan(m.addedNodes[i]);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
