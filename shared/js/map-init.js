/* ── WRMP Map Utilities ───────────────────────────
   Shared Leaflet map initialization, panel-aware
   padding, popup builder, and POI helper.

   Usage:
     var map = WRMP.initMap("map", { bounds: BAY_FULL });
     var popup = WRMP.makePopup(station, ["Region", "Network"]);
     WRMP.flyTo(map, bounds);
     WRMP.addPOI(poiLayer, lat, lon, "Label text");
*/

var WRMP = window.WRMP || {};

(function () {
    var TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    var TILE_OPTS = {
        attribution: "&copy; OSM &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 17,
    };

    /**
     * Calculate map padding that accounts for the story panel overlay.
     * @returns {Object} - Leaflet padding options
     */
    WRMP.getMapPadding = function () {
        var frame = document.querySelector(".exhibit-frame");
        var panelW = frame ? frame.offsetWidth * 0.44 : 400;
        return { paddingTopLeft: [panelW + 20, 30], paddingBottomRight: [30, 30] };
    };

    /**
     * Initialize a Leaflet map with WRMP defaults.
     * @param {string} elementId - DOM element ID for the map
     * @param {Object} opts - { bounds: [[lat,lon],[lat,lon]], maxZoom: number }
     * @returns {L.Map}
     */
    WRMP.initMap = function (elementId, opts) {
        opts = opts || {};
        var map = L.map(elementId, {
            zoomControl: false,
            scrollWheelZoom: true,
            dragging: true,
            doubleClickZoom: true,
            touchZoom: true,
            keyboard: false, // exhibits handle arrow keys via stepper
            attributionControl: true,
        });

        if (opts.bounds) {
            map.fitBounds(opts.bounds, WRMP.getMapPadding());
        }

        L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
        return map;
    };

    /**
     * Fly to bounds with panel-aware padding.
     * @param {L.Map} map
     * @param {Array} bounds - [[lat,lon],[lat,lon]]
     * @param {Object} [extraOpts] - Additional flyToBounds options
     */
    WRMP.flyTo = function (map, bounds, extraOpts) {
        var opts = WRMP.getMapPadding();
        opts.duration = 1.2;
        opts.maxZoom = 14;
        if (extraOpts) {
            Object.keys(extraOpts).forEach(function (k) {
                opts[k] = extraOpts[k];
            });
        }
        map.flyToBounds(bounds, opts);
    };

    /**
     * Build a DOM-based popup for a station.
     * @param {Object} station - Station data object
     * @param {Array} fields - Array of [label, key] pairs, e.g. [["Region", "region"]]
     * @returns {HTMLElement}
     */
    WRMP.makePopup = function (station, fields) {
        var container = document.createElement("div");
        var title = document.createElement("div");
        title.className = "popup-title";
        title.textContent = station.station_code + " — " + station.station_name;
        container.appendChild(title);

        fields.forEach(function (pair) {
            var row = document.createElement("div");
            row.className = "popup-row";
            var k = document.createElement("span");
            k.className = "k";
            k.textContent = pair[0];
            var v = document.createElement("span");
            v.className = "v";
            v.textContent = station[pair[1]] || "—";
            row.appendChild(k);
            row.appendChild(v);
            container.appendChild(row);
        });
        return container;
    };

    /**
     * Add a floating text label to the map (non-interactive).
     * @param {L.LayerGroup} layer - Layer group to add the POI to
     * @param {number} lat
     * @param {number} lon
     * @param {string} text
     */
    WRMP.addPOI = function (layer, lat, lon, text) {
        var icon = L.divIcon({
            className: "poi-label",
            html: document.createTextNode(text).textContent,
            iconSize: null,
            iconAnchor: [0, -12],
        });
        L.marker([lat, lon], { icon: icon, interactive: false }).addTo(layer);
    };

    window.WRMP = WRMP;
})();
