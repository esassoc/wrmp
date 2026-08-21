/* ════════════════════════════════════════════════════════════
   WRMP — Science-Framework question popover
   ────────────────────────────────────────────────────────────
   Upgrades every .exhibit-tag badge so hovering (or keyboard-
   focusing) it shows the management question's FULL text in a
   styled popover — the client ask "the entire question shows when
   mousing over the label". Replaces the old site.js tooltip IIFE.

   Why body-appended + position:fixed: the old bubble anchored
   inside the tag and was clipped by overflow:hidden on poster
   cards. One shared node on <body>, placed from the badge's
   viewport rect, cannot be clipped by anything in the tree.

   Question-text sources, in order:
     1. the tag's own title="4A — full question…" (removed on
        upgrade to suppress the native tooltip) — website pages
        and the gallery renderer already carry this;
     2. taxonomy.managementQuestions in data/exhibits.json,
        fetched once, lazily, at a path resolved from THIS
        script's own src — covers exhibit covers whose tags carry
        only the MQ code. No second data table in this file.

   Load order: exhibit-tags.css + sf-popover.css, then this file
   (any position; a MutationObserver catches badges rendered at
   runtime — gallery cards, the featured switcher, exhibit covers).
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (window.__wrmpSfPopover) return; // double-include guard
  window.__wrmpSfPopover = true;

  var SEL = ".exhibit-tag";
  var GAP = 10; // px between badge and popover
  var PAD = 12; // min inset from viewport edges
  var SHOW_MS = 70; // hover intent — skip drive-by flashes
  var HIDE_MS = 90;

  // data/exhibits.json relative to shared/js/ — correct from any page depth.
  var script = document.currentScript;
  var dataUrl = script && script.src
    ? new URL("../../data/exhibits.json", script.src).href
    : null;

  var pop = null;
  var chipEl = null;
  var textEl = null;
  var activeTag = null;
  var showTimer = 0;
  var hideTimer = 0;
  var mqText = null;
  var mqFetching = false;

  function ensurePop() {
    if (pop) return;
    pop = document.createElement("div");
    pop.className = "sf-popover";
    pop.id = "sf-popover";
    pop.setAttribute("role", "tooltip");

    var arrow = document.createElement("span");
    arrow.className = "sf-popover__arrow";
    arrow.setAttribute("aria-hidden", "true");

    var head = document.createElement("div");
    head.className = "sf-popover__head";
    chipEl = document.createElement("span");
    chipEl.className = "exhibit-tag sf-popover__id";
    var kicker = document.createElement("span");
    kicker.className = "sf-popover__kicker";
    kicker.textContent = "Management question";
    head.appendChild(chipEl);
    head.appendChild(kicker);

    textEl = document.createElement("p");
    textEl.className = "sf-popover__text";

    pop.appendChild(arrow);
    pop.appendChild(head);
    pop.appendChild(textEl);
    document.body.appendChild(pop);
  }

  function loadTaxonomy(done) {
    if (mqText || mqFetching || !dataUrl || typeof fetch === "undefined") return;
    mqFetching = true;
    fetch(dataUrl)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        mqText = (d.taxonomy && d.taxonomy.managementQuestions) || {};
        if (done) done();
      })
      .catch(function () { mqText = {}; });
  }

  function tagCode(tag) {
    return tag.getAttribute("data-sf-code") || tag.textContent.trim();
  }

  function tagText(tag) {
    return (
      tag.getAttribute("data-sf-text") ||
      (mqText ? mqText[tagCode(tag)] : null) ||
      null
    );
  }

  // Centered over the badge, clamped to the viewport, above by default —
  // flipped below only when there's no headroom. The arrow tracks the
  // badge center through the clamp.
  function place(tag) {
    var r = tag.getBoundingClientRect();
    pop.classList.remove("is-below");
    var pw = pop.offsetWidth;
    var ph = pop.offsetHeight;
    var left = r.left + r.width / 2 - pw / 2;
    left = Math.max(PAD, Math.min(left, window.innerWidth - pw - PAD));
    var top = r.top - GAP - ph;
    if (top < PAD) {
      pop.classList.add("is-below");
      top = r.bottom + GAP;
    }
    pop.style.left = Math.round(left) + "px";
    pop.style.top = Math.round(top) + "px";
    var arrowX = r.left + r.width / 2 - left;
    arrowX = Math.max(16, Math.min(arrowX, pw - 16));
    pop.style.setProperty("--sf-arrow-x", arrowX + "px");
  }

  function show(tag) {
    activeTag = tag;
    var text = tagText(tag);
    if (!text) {
      // Cover badges carry only the code — fetch the taxonomy once,
      // then show if the pointer/focus is still on this tag.
      loadTaxonomy(function () {
        if (activeTag === tag) show(tag);
      });
      return;
    }
    ensurePop();
    chipEl.textContent = tagCode(tag);
    chipEl.setAttribute(
      "data-gq",
      tag.getAttribute("data-gq") || tagCode(tag).charAt(0)
    );
    textEl.textContent = text;
    place(tag);
    pop.classList.add("is-visible");
    tag.setAttribute("aria-describedby", "sf-popover");
  }

  function hide() {
    if (activeTag) activeTag.removeAttribute("aria-describedby");
    activeTag = null;
    if (pop) pop.classList.remove("is-visible");
  }

  function onEnter(e) {
    var tag = e.currentTarget;
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(function () { show(tag); }, SHOW_MS);
  }

  function onLeave() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, HIDE_MS);
  }

  function upgrade(tag) {
    if (tag.hasAttribute("data-sf-ready")) return;
    if (tag.closest(".sf-popover")) return; // the popover's own id chip
    var title = tag.getAttribute("title");
    if (title) {
      tag.removeAttribute("title"); // suppress the native tooltip
      var m = title.match(/^\s*(\d[A-Z])\s*[—–-]\s*([\s\S]*\S)\s*$/);
      if (m) {
        tag.setAttribute("data-sf-code", m[1]);
        tag.setAttribute("data-sf-text", m[2]);
      } else {
        tag.setAttribute("data-sf-text", title);
      }
    }
    tag.setAttribute("data-sf-ready", "");
    // Keyboard users get the question too; links/buttons already focus.
    if (
      !tag.hasAttribute("tabindex") &&
      tag.tagName !== "A" &&
      tag.tagName !== "BUTTON"
    ) {
      tag.setAttribute("tabindex", "0");
    }
    tag.addEventListener("mouseenter", onEnter);
    tag.addEventListener("mouseleave", onLeave);
    tag.addEventListener("focus", onEnter);
    tag.addEventListener("blur", onLeave);
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches(SEL)) upgrade(root);
    if (root.querySelectorAll) root.querySelectorAll(SEL).forEach(upgrade);
  }

  scan(document.body);

  // Badges rendered after load: gallery cards, featured switcher,
  // exhibit covers built by exhibit-r4.js.
  if ("MutationObserver" in window && document.body) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) scan(m.addedNodes[i]);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Escape dismisses; focus stays on the badge (APG tooltip pattern).
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") hide();
  });

  // A fixed popover can't track a scrolling anchor — dismiss, don't drift.
  window.addEventListener("scroll", hide, { passive: true, capture: true });
  window.addEventListener("resize", hide);
})();
