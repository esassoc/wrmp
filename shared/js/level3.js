/* ── WRMP Level 3 Drawer ───────────────────────────
   Behaviour for Pattern C — the persistent "Data & tools"
   drawer. Pure markup patterns (A inline, B end-card hub)
   need no JavaScript; only the drawer does.

   Expects this markup inside the .exhibit-frame:
     <button class="level3-drawer-toggle" aria-expanded="false"
             aria-controls="level3-drawer"> … </button>
     <aside class="level3-drawer" id="level3-drawer" … >
       … <button class="level3-drawer-close"> … </button> …
     </aside>

   Usage (after the DOM exists):
     WRMP.initLevel3Drawer();
*/

var WRMP = window.WRMP || {};

(function () {
  WRMP.initLevel3Drawer = function () {
    var toggle = document.querySelector(".level3-drawer-toggle");
    var drawer = document.querySelector(".level3-drawer");
    if (!toggle || !drawer) return;

    var closeBtn = drawer.querySelector(".level3-drawer-close");

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      // Move focus into the drawer on open, back to the toggle on close,
      // so keyboard users aren't stranded. preventScroll stops the browser
      // from scrolling the document to reveal the focused element — that
      // scroll is what made the exhibit behind the drawer jump.
      if (open && closeBtn) closeBtn.focus({ preventScroll: true });
      else if (!open) toggle.focus({ preventScroll: true });
    }

    toggle.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("is-open"));
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }

    // Escape closes the drawer from anywhere in the exhibit.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  };

  window.WRMP = WRMP;
})();
