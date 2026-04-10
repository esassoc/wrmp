/* ── WRMP Stepper ─────────────────────────────────
   Configuration-driven step navigation for exhibits.
   Handles dots, buttons, keyboard, and step visibility.
   Each exhibit provides an onStepEnter callback for
   exhibit-specific behavior (map rendering, backgrounds).

   Usage:
     var stepper = WRMP.createStepper({
       totalSteps: 6,
       onStepEnter: function(stepIndex) {
         // render map, toggle backgrounds, build legend, etc.
       },
       onInit: function() {
         // optional: called once after stepper is ready
       }
     });

     // Programmatic navigation:
     stepper.goToStep(2);
     stepper.currentStep;  // read current step index
*/

var WRMP = window.WRMP || {};

(function () {
    /**
     * Create a stepper controller.
     * @param {Object} config
     * @param {number} config.totalSteps - Number of steps
     * @param {Function} config.onStepEnter - Called with (stepIndex) on each step change
     * @param {Function} [config.onInit] - Called once after DOM binding
     * @returns {Object} - Stepper controller with goToStep() and currentStep
     */
    WRMP.createStepper = function (config) {
        var totalSteps = config.totalSteps;
        var onStepEnter = config.onStepEnter;
        var currentStep = 0;

        // DOM references
        var btnPrev = document.getElementById("btn-prev");
        var btnNext = document.getElementById("btn-next");
        var stepDots = document.querySelectorAll(".step-dot");
        var stepEls = document.querySelectorAll(".step");
        var counter = document.querySelector(".step-counter");

        function goToStep(n) {
            if (n < 0 || n >= totalSteps) return;
            currentStep = n;

            // Update step content visibility
            stepEls.forEach(function (el) { el.classList.remove("active"); });
            stepEls[currentStep].classList.add("active");

            // Update dots
            stepDots.forEach(function (d) { d.classList.remove("active"); });
            stepDots[currentStep].classList.add("active");

            // Update buttons
            btnPrev.disabled = currentStep === 0;
            btnNext.disabled = currentStep === totalSteps - 1;

            // Update counter
            if (counter) {
                counter.textContent = (currentStep + 1) + " / " + totalSteps;
            }

            // Exhibit-specific behavior
            onStepEnter(currentStep);
        }

        // Button listeners
        btnPrev.addEventListener("click", function () { goToStep(currentStep - 1); });
        btnNext.addEventListener("click", function () { goToStep(currentStep + 1); });

        // Dot listeners
        stepDots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                goToStep(parseInt(dot.dataset.step, 10));
            });
        });

        // Keyboard navigation
        document.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                goToStep(currentStep + 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                goToStep(currentStep - 1);
            }
        });

        // Optional init callback
        if (config.onInit) config.onInit();

        // Public API
        var controller = {
            goToStep: goToStep,
            get currentStep() { return currentStep; }
        };

        return controller;
    };

    window.WRMP = WRMP;
})();
