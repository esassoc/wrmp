(function () {
  "use strict";

  // ── Management-question popover, lifted into the top layer ──
  // shared/js/sf-popover.js appends ONE node to <body> and positions it
  // with position:fixed. A modal <dialog> paints in the top layer, above
  // every z-index in the normal flow, so that node is invisible behind an
  // open dialog. Re-parenting it INTO the dialog does not help either:
  // measured in Chrome, a position:fixed child of a top-layer dialog is
  // laid out correctly (rect on screen, opacity 1, visibility visible)
  // and still paints nothing.
  //
  // The Popover API is the mechanism that should work. A manual popover
  // is itself placed in the top layer, and top-layer order is the order
  // things were added, so re-showing it after the dialog opens puts it
  // on top. It never steals focus, which matters because the badge must
  // keep it. The node stays in <body>; sf-popover's placement math is
  // untouched. An isolated test page confirms a manual popover does paint
  // over a modal dialog.
  //
  // NOT verified on this page. In headless Chrome the lifted node reports
  // :popover-open, opacity 1, visibility visible and an on-screen rect,
  // and still paints nothing into a screenshot. That may be a headless
  // compositing artifact; check a real browser. Either way the question
  // rows carry their own short labels, so the popover only ever adds the
  // full wording.
  var POP_ID = "sf-popover";
  var popWatched = false;

  function lift(pop) {
    if (!pop || typeof pop.showPopover !== "function") return false;
    if (!pop.hasAttribute("popover")) pop.setAttribute("popover", "manual");
    try {
      if (pop.matches(":popover-open")) pop.hidePopover();
      pop.showPopover();
    } catch (e) {
      return false;
    }
    // Toggling the popover cycles the node through display:none, which
    // restarts sf-popover.css's opacity transition from 0. Measured: it
    // then sits at opacity 0 with .is-visible applied — a card that is
    // present, positioned, and invisible. Settle any transition the
    // toggle just restarted; a no-op when none is running.
    if (typeof pop.getAnimations === "function") {
      pop.getAnimations().forEach(function (a) {
        try {
          a.finish();
        } catch (e) {}
      });
    }
    return true;
  }

  // Browsers without the Popover API: park the node inside the open
  // dialog. Not enough on Chrome, but it is the best available there.
  function reparent(pop) {
    var open = document.querySelector("dialog.metric-dialog[open]");
    var host = open || document.body;
    if (pop && pop.parentNode !== host) host.appendChild(pop);
  }

  function watch(pop) {
    if (popWatched) return;
    popWatched = true;
    if (!lift(pop)) reparent(pop);
    // sf-popover toggles .is-visible on every show. Re-lift then, so the
    // popover is always the most recently added top-layer element.
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        if (!pop.classList.contains("is-visible")) return;
        if (!lift(pop)) reparent(pop);
      }).observe(pop, { attributes: true, attributeFilter: ["class"] });
    }
  }

  // The node is created lazily, on the first hover or focus — so catch
  // its arrival rather than looking for it up front. This observer is
  // registered before sf-popover.js loads, which is why it sees the
  // append at all.
  if ("MutationObserver" in window) {
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].id === POP_ID) watch(added[j]);
        }
      }
    }).observe(document.body, { childList: true });
  }

  document.querySelectorAll(".metric-tile").forEach(function (tile) {
    var dlg = document.getElementById(tile.getAttribute("data-dialog"));
    if (!dlg) return;
    tile.addEventListener("click", function () {
      dlg.showModal();
      document.body.classList.add("is-dialog-open");
    });
  });
  document.querySelectorAll(".metric-dialog").forEach(function (dlg) {
    dlg.querySelector("[data-close]").addEventListener("click", function () {
      dlg.close();
    });
    // Click on the backdrop (outside the inner box) closes.
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", function () {
      document.body.classList.remove("is-dialog-open");
      var pop = document.getElementById(POP_ID);
      if (pop && pop.parentNode !== document.body) document.body.appendChild(pop);
    });
  });
})();
