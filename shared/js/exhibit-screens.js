/* ── WRMP Exhibit Screens ──────────────────────────
   Wire-up for cover and end-card screens that bookend a stepper exhibit.
   Expects these element IDs in the DOM when present:
     #exhibit-cover      — opening screen with #btn-enter
     #exhibit-end-card   — closing screen with #btn-restart
     #btn-next           — stepper's next button (repurposed on last step)

   Usage:
     var screens = WRMP.wireExhibitScreens({
       totalSteps: 5,
       lastStepLabel: "Learn more",         // optional, default "Learn more"
       onStepEnter: function (n) { ... },   // exhibit-specific per-step logic
       onEnter:     function () { ... },    // called when Step Inside clicked
       onRestart:   function () { ... }     // called when Restart clicked
     });

     var stepper = WRMP.createStepper({
       totalSteps: 5,
       onStepEnter: screens.onStepEnter      // pre-wrapped with button logic
     });

   The helper wraps onStepEnter to manage btn-next's label + enabled state
   on the final step so clicking "Learn more" reveals the end card.
*/

var WRMP = window.WRMP || {};

(function () {
  WRMP.wireExhibitScreens = function (opts) {
    opts = opts || {};
    var totalSteps = opts.totalSteps;
    var lastStepLabel = opts.lastStepLabel || "Learn more";
    var exhibitOnStepEnter = opts.onStepEnter;

    var enterBtn = document.getElementById("btn-enter");
    var exhibitCover = document.getElementById("exhibit-cover");
    var endCard = document.getElementById("exhibit-end-card");
    var restartBtn = document.getElementById("btn-restart");
    var btnNext = document.getElementById("btn-next");

    function showEndCard() {
      if (!endCard) return;
      endCard.classList.remove("is-leaving");
      endCard.classList.remove("is-hidden");
      endCard.classList.remove("is-entering");
      void endCard.offsetHeight;
      endCard.classList.add("is-entering");
    }

    function hideEndCard() {
      if (!endCard) return;
      endCard.classList.add("is-leaving");
      window.setTimeout(function () {
        endCard.classList.add("is-hidden");
        endCard.classList.remove("is-leaving");
      }, 800);
    }

    // Cover → Step 1 transition
    if (enterBtn && exhibitCover) {
      enterBtn.addEventListener("click", function () {
        exhibitCover.classList.add("is-leaving");
        window.setTimeout(function () {
          exhibitCover.classList.add("is-hidden");
        }, 800);
        if (opts.onEnter) opts.onEnter();
      });
    }

    // Last-step Next → reveal end card
    if (btnNext) {
      btnNext.addEventListener("click", function () {
        if (btnNext.textContent === lastStepLabel) {
          showEndCard();
        }
      });
    }

    // Restart → hide end card + exhibit callback (reset stepper)
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        hideEndCard();
        if (opts.onRestart) opts.onRestart();
      });
    }

    // Wrap onStepEnter: manage btn-next state/text on final step
    function onStepEnterWrapped(n) {
      if (btnNext && typeof n === "number" && typeof totalSteps === "number") {
        if (n === totalSteps - 1) {
          btnNext.disabled = false;
          btnNext.textContent = lastStepLabel;
        } else {
          btnNext.textContent = "Next";
        }
      }
      if (exhibitOnStepEnter) exhibitOnStepEnter(n);
    }

    return {
      onStepEnter: onStepEnterWrapped,
      showEndCard: showEndCard,
      hideEndCard: hideEndCard,
    };
  };

  window.WRMP = WRMP;
})();
