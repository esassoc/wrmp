/* ── WRMP Data Loader ─────────────────────────────
   Fetches JSON data files relative to the exhibit.
   Returns promises so exhibits can await the data
   they need before rendering.

   Usage:
     WRMP.loadData({ stations: true, species: true })
       .then(function(data) {
         // data.stations, data.species
       });
*/

var WRMP = window.WRMP || {};

(function () {
    // Resolve data/ from this script's OWN url rather than guessing how far
    // the exhibit sits from the repo root. document.currentScript is the
    // <script> tag executing this file; its .src is fully resolved by the
    // browser, so stripping the trailing shared/js/data-loader.js yields the
    // repo root, and data/ is a sibling of shared/. This keeps the loader
    // depth-independent: round-1 exhibits (exhibits/{slug}/) and round-2
    // exhibits (exhibits/round-2-2026-05/{slug}/) both resolve correctly.
    var script = document.currentScript;
    var dataBase = script
        ? script.src.replace(/shared\/js\/data-loader\.js(\?.*)?$/, "data/")
        : "../../data/";

    var FILES = {
        stations: "stations.json",
        species: "species.json",
        gear: "gear.json",
        benthos: "benthos.json",
    };

    /**
     * Load one or more data files.
     * @param {Object} requested - Keys to load, e.g. { stations: true, species: true }
     * @returns {Promise<Object>} - Resolved object with requested data
     */
    WRMP.loadData = function (requested) {
        var keys = Object.keys(requested).filter(function (k) {
            return requested[k] && FILES[k];
        });

        var fetches = keys.map(function (key) {
            return fetch(dataBase + FILES[key]).then(function (r) {
                if (!r.ok) throw new Error("Failed to load " + key + ": " + r.status);
                return r.json();
            });
        });

        return Promise.all(fetches).then(function (results) {
            var data = {};
            keys.forEach(function (key, i) {
                data[key] = results[i];
            });
            return data;
        });
    };

    window.WRMP = WRMP;
})();
