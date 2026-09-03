/* ════════════════════════════════════════════════════════════
   WRMP.org — Tools landing page: the Monitoring Site Network Map
   ────────────────────────────────────────────────────────────
   One Leaflet map over data/stations.json (119 sites). Three
   groupings — monitoring zone, site type, survey — each with its
   own layer set, and a ?topic= parameter that lands the map with
   one topic's layers already selected. That parameter is what a
   topic page's map badge links to.

   Colors, popup fields and the site-type palette are inherited
   from exhibits/2026-04-03-station-map-stepper so the same data
   reads the same way wherever it is drawn.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var canvas = document.getElementById("tools-map");
  if (!canvas || typeof L === "undefined" || !window.WRMP) return;

  // ── Palette ───────────────────────────────────────────────
  function tokenColor(name, fallback) {
    var v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v || fallback;
  }
  var C = {
    ADA_TEAL: tokenColor("--wrmp-ada-teal", "#005E6A"),
    TEAL: tokenColor("--wrmp-teal", "#228B9C"),
    GREEN: tokenColor("--wrmp-green", "#379352"),
    LIGHT_GREEN: tokenColor("--wrmp-light-green", "#92BB4D"),
    ORANGE: tokenColor("--wrmp-orange", "#E09337"),
    DARK_ORANGE: tokenColor("--wrmp-dark-orange", "#D66B2C"),
    SKY_BLUE: tokenColor("--wrmp-sky-blue", "#00ACEC"),
    EARTH: tokenColor("--wrmp-earth", "#664D26"),
    GRAY: "#bbbbbb"
  };

  // ── Derived fields ────────────────────────────────────────
  // The site's three monitoring zones (Primary, Secondary,
  // Montezuma) are encoded in WRMP_Network, not stored on their
  // own, so read them back out of the network name.
  function zoneOf(station) {
    var net = station.WRMP_Network || "";
    if (net.indexOf("Montezuma") !== -1) return "Montezuma";
    if (net.indexOf("Primary") !== -1) return "Primary";
    return "Secondary";
  }

  var GROUPINGS = {
    zone: {
      field: zoneOf,
      layers: [
        { value: "Primary", label: "Primary Network", color: C.ADA_TEAL },
        { value: "Secondary", label: "Secondary Network", color: C.TEAL },
        { value: "Montezuma", label: "Montezuma", color: C.DARK_ORANGE }
      ]
    },
    siteType: {
      field: function (s) {
        return s.WRMP_Site_Type || "NA";
      },
      layers: [
        { value: "Benchmark", label: "Benchmark", color: C.LIGHT_GREEN },
        { value: "Benchmark-Reference", label: "Benchmark and Reference", color: "#C7D865" },
        { value: "Reference", label: "Reference", color: C.ADA_TEAL },
        { value: "Reference Site Candidate", label: "Reference site candidate", color: C.TEAL },
        { value: "Project", label: "Project", color: C.GREEN },
        { value: "Other Restored Site", label: "Other restored site", color: "#6A9E3A" },
        { value: "Planned Restoration", label: "Planned restoration", color: C.ORANGE },
        { value: "NA", label: "Not classified", color: C.GRAY }
      ]
    },
    survey: {
      field: function (s) {
        return s.projects || "WRMP";
      },
      layers: [
        { value: "WRMP", label: "WRMP Monitoring Site Network", color: C.ADA_TEAL },
        { value: "SBSP", label: "South Bay Salt Pond Restoration", color: C.GREEN },
        { value: "SBOTS", label: "South Bay Otter Trawl Survey", color: C.SKY_BLUE },
        { value: "NBOTS", label: "North Bay Otter Trawl Survey", color: C.TEAL },
        { value: "SMFS", label: "Suisun Marsh Fish Study", color: C.ORANGE }
      ]
    }
  };

  // A topic opens the map on one grouping with one set of layers
  // already on. Topics whose layers are not yet mapped are listed
  // on the page but do not appear here.
  var TOPIC_PRESETS = {
    "baylands-geography": { grouping: "siteType", layers: null },
    "fish-wildlife": { grouping: "survey", layers: ["SBOTS", "NBOTS", "SMFS"] }
  };

  // The extent of stations.json (lat 37.437–38.226, lon -122.520
  // to -121.886) with a little air, rather than the wider framing
  // the stepper exhibits use behind their story panel.
  var BAY_FULL = [
    [37.4, -122.58],
    [38.27, -121.83]
  ];
  var POPUP_FIELDS = [
    ["Region", "region"],
    ["Network", "WRMP_Network"],
    ["Habitat", "habitat"],
    ["Site Type", "WRMP_Site_Type"]
  ];

  // ── State ─────────────────────────────────────────────────
  var stations = [];
  var grouping = "siteType";
  var enabled = {}; // value -> bool, for the active grouping

  var map = WRMP.initMap("tools-map", {});

  // WRMP.initMap attaches the CARTO light_all basemap, which now
  // returns an "API KEY REQUIRED" watermark tile. Swap it here for
  // Esri's keyless light gray canvas rather than editing the shared
  // helper, which every exhibit depends on. The same swap is owed to
  // shared/js/map-init.js as its own change.
  map.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) map.removeLayer(layer);
  });
  var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";
  L.tileLayer(ESRI + "World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS",
    maxZoom: 16
  }).addTo(map);
  // Place names ship as a separate reference layer on this basemap.
  L.tileLayer(ESRI + "World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 16
  }).addTo(map);

  map.fitBounds(BAY_FULL, { padding: [24, 24] });
  L.control.zoom({ position: "topright" }).addTo(map);
  var markerLayer = L.layerGroup().addTo(map);

  var listEl = document.getElementById("layer-list");
  var countEl = document.getElementById("map-count");
  var resetEl = document.getElementById("layer-reset");
  var tabsEl = document.getElementById("grouping-tabs");

  function activeLayers() {
    return GROUPINGS[grouping].layers;
  }
  function valueOf(station) {
    return GROUPINGS[grouping].field(station);
  }
  function countFor(value) {
    return stations.filter(function (s) {
      return valueOf(s) === value;
    }).length;
  }
  function colorFor(value) {
    var found = null;
    activeLayers().forEach(function (l) {
      if (l.value === value) found = l.color;
    });
    return found || C.GRAY;
  }

  function makePopup(station, dotColor) {
    return WRMP.makeMarkerPopup({
      code: station.station_code,
      name: station.station_name,
      dotColor: dotColor,
      showImage: false,
      sections: [
        {
          rows: POPUP_FIELDS.filter(function (pair) {
            return station[pair[1]];
          }).map(function (pair) {
            // marker-popup.js renders `value` as the field name and
            // `label` as the datum, matching the stepper exhibit.
            return { type: "row", label: station[pair[1]], value: pair[0] };
          })
        }
      ]
    });
  }

  // ── Render ────────────────────────────────────────────────
  function renderMarkers() {
    markerLayer.clearLayers();
    var shown = 0;
    stations.forEach(function (s) {
      var value = valueOf(s);
      if (!enabled[value]) return;
      shown++;
      var color = colorFor(value);
      L.circleMarker([s.lat, s.lon], {
        radius: 5,
        fillColor: color,
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9
      })
        .addTo(markerLayer)
        .bindPopup(makePopup(s, color));
    });
    countEl.textContent = String(shown);
  }

  function renderLayers() {
    listEl.textContent = "";
    activeLayers().forEach(function (layer) {
      var n = countFor(layer.value);
      if (!n) return;

      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "layer";
      btn.setAttribute("aria-pressed", enabled[layer.value] ? "true" : "false");

      var swatch = document.createElement("span");
      swatch.className = "layer__swatch";
      swatch.style.background = layer.color;
      swatch.setAttribute("aria-hidden", "true");

      var name = document.createElement("span");
      name.className = "layer__name";
      name.textContent = layer.label;

      var count = document.createElement("span");
      count.className = "layer__count";
      count.textContent = String(n);

      btn.appendChild(swatch);
      btn.appendChild(name);
      btn.appendChild(count);
      btn.addEventListener("click", function () {
        enabled[layer.value] = !enabled[layer.value];
        btn.setAttribute("aria-pressed", enabled[layer.value] ? "true" : "false");
        renderMarkers();
      });

      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function setGrouping(next, onlyValues) {
    grouping = next;
    enabled = {};
    activeLayers().forEach(function (layer) {
      enabled[layer.value] = onlyValues ? onlyValues.indexOf(layer.value) !== -1 : true;
    });
    Array.prototype.forEach.call(tabsEl.querySelectorAll(".tab"), function (tab) {
      tab.setAttribute(
        "aria-selected",
        tab.getAttribute("data-grouping") === grouping ? "true" : "false"
      );
    });
    renderLayers();
    renderMarkers();
  }

  Array.prototype.forEach.call(tabsEl.querySelectorAll(".tab"), function (tab) {
    tab.addEventListener("click", function () {
      setGrouping(tab.getAttribute("data-grouping"), null);
    });
  });
  resetEl.addEventListener("click", function () {
    setGrouping(grouping, null);
  });

  // ── Boot ──────────────────────────────────────────────────
  WRMP.loadData({ stations: true }).then(function (data) {
    stations = data.stations.filter(function (s) {
      return typeof s.lat === "number" && typeof s.lon === "number";
    });

    var topic = new URLSearchParams(window.location.search).get("topic");
    var preset = topic ? TOPIC_PRESETS[topic] : null;
    if (preset) {
      setGrouping(preset.grouping, preset.layers);
    } else {
      setGrouping("siteType", null);
    }
    map.invalidateSize();
  });
})();
