(function () {
  "use strict";
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
    });
  });
})();
