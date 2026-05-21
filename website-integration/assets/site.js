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
