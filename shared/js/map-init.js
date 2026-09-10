/* ── WRMP Map Utilities ───────────────────────────
   Shared Leaflet map initialization, panel-aware
   padding, popup builder, and POI helper.

   Usage:
     var map = WRMP.initMap("map", { bounds: BAY_FULL });
     WRMP.flyTo(map, bounds);
     WRMP.addPOI(poiLayer, lat, lon, "Label text");
     // For marker popups see: shared/js/marker-popup.js → WRMP.makeMarkerPopup()
*/

var WRMP = window.WRMP || {};

(function () {
    /* Basemap: Esri World Light Gray Canvas, keyless.
       Replaces CARTO light_all, which now returns "API KEY REQUIRED"
       watermark tiles. This block is the single definition of the WRMP
       basemap — exhibit-r4.js and website-integration/assets/tools.js
       both attach it through WRMP.addBasemap() rather than restating it.

       Note: the Esri canvas ships place names as a SEPARATE reference
       layer, so a full basemap is two tile layers, where CARTO's
       light_all was one. maxZoom 16 is the service ceiling. */
    var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";

    WRMP.BASEMAP = {
        url: ESRI + "World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        opts: {
            attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS",
            maxZoom: 16,
        },
        labelsUrl: ESRI + "World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        labelsOpts: { maxZoom: 16 },
    };

    /**
     * Attach the WRMP basemap (base tiles + place-name reference layer).
     * @param {L.Map} map
     * @param {Object} [tile] - Optional override { url, opts }. When given,
     *   that single layer is used verbatim and no labels layer is added.
     * @returns {L.Map} the same map, for chaining
     */
    WRMP.addBasemap = function (map, tile) {
        if (tile && tile.url) {
            L.tileLayer(tile.url, tile.opts || {}).addTo(map);
            return map;
        }
        var b = WRMP.BASEMAP;
        L.tileLayer(b.url, b.opts).addTo(map);
        L.tileLayer(b.labelsUrl, b.labelsOpts).addTo(map);
        return map;
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

        WRMP.addBasemap(map);
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

    // Popup building is handled by WRMP.makeMarkerPopup() in marker-popup.js.

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
