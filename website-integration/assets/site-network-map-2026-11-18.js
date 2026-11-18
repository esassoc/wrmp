/* ════════════════════════════════════════════════════════════
   WRMP.org — WRMP Monitoring Map
   ────────────────────────────────────────────────────────────
   One map page for every kind of monitoring map. A Topic control
   picks which set of layers is loaded; each layer can then be
   switched on and off. ?topic=<key> opens the map on a topic,
   which is what topic-page map badges, menu links and All
   Resources rows link to, so there is one map page rather than
   one page per map.

   TOPICS is the registry: one entry per topic, each listing its
   layers. A layer is a filter over the station list plus a color.
   `sample: true` marks a layer drawn at real WRMP station
   locations as a stand-in until SFEI supplies the real point set;
   `sample: "none"` marks a layer with no data yet. Swapping a
   sample for real data is a change to that layer's `test` (or a
   new data file), not to the page.

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
    PURPLE: "#6E56CF",
    GRAY: "#bbbbbb"
  };

  // ── Station helpers ───────────────────────────────────────
  function zoneOf(s) {
    var net = s.WRMP_Network || "";
    if (net.indexOf("Montezuma") !== -1) return "Montezuma";
    if (net.indexOf("Primary") !== -1) return "Primary";
    return "Secondary";
  }
  function siteType(s) {
    return s.WRMP_Site_Type || "NA";
  }
  function is(field, values) {
    return function (s) {
      return values.indexOf(field(s)) !== -1;
    };
  }
  // First station per key, in file order: one point per subregion or
  // network for the sample instrument layers.
  function firstPer(keyFn, extra) {
    var seen = {};
    return function (s, all) {
      if (extra && !extra(s)) return false;
      var key = keyFn(s);
      if (!(key in seen)) {
        for (var i = 0; i < all.length; i++) {
          if ((!extra || extra(all[i])) && keyFn(all[i]) === key) {
            seen[key] = all[i];
            break;
          }
        }
      }
      return seen[key] === s;
    };
  }
  function prop(name) {
    return function (s) {
      return s[name];
    };
  }

  var SITE_TYPE_LAYERS = [
    { id: "Benchmark", label: "Benchmark", color: C.LIGHT_GREEN },
    { id: "Benchmark-Reference", label: "Benchmark and Reference", color: "#C7D865" },
    { id: "Reference", label: "Reference", color: C.ADA_TEAL },
    { id: "Reference Site Candidate", label: "Reference site candidate", color: C.TEAL },
    { id: "Project", label: "Project", color: C.GREEN },
    { id: "Other Restored Site", label: "Other restored site", color: "#6A9E3A" },
    { id: "Planned Restoration", label: "Planned restoration", color: C.ORANGE },
    { id: "NA", label: "Not classified", color: C.GRAY }
  ].map(function (l) {
    l.test = is(siteType, [l.id]);
    return l;
  });

  // "All monitoring sites" can be regrouped three ways.
  var GROUPINGS = {
    siteType: SITE_TYPE_LAYERS,
    zone: [
      { id: "Primary", label: "Primary Network", color: C.ADA_TEAL },
      { id: "Secondary", label: "Secondary Network", color: C.TEAL },
      { id: "Montezuma", label: "Montezuma", color: C.DARK_ORANGE }
    ].map(function (l) {
      l.test = is(zoneOf, [l.id]);
      return l;
    }),
    survey: [
      { id: "WRMP", label: "WRMP Monitoring Site Network", color: C.ADA_TEAL },
      { id: "SBSP", label: "South Bay Salt Pond Restoration", color: C.GREEN },
      { id: "SBOTS", label: "South Bay Otter Trawl Survey", color: C.SKY_BLUE },
      { id: "NBOTS", label: "North Bay Otter Trawl Survey", color: C.TEAL },
      { id: "SMFS", label: "Suisun Marsh Fish Study", color: C.ORANGE }
    ].map(function (l) {
      l.test = is(prop("projects"), [l.id]);
      return l;
    })
  };

  var wrmpSite = is(prop("projects"), ["WRMP", "SBSP"]);

  // ── The registry ──────────────────────────────────────────
  var TOPICS = [
    { key: "all", label: "All monitoring sites", grouped: true },
    {
      key: "baylands-geography",
      label: "Baylands Geography",
      layers: SITE_TYPE_LAYERS.filter(function (l) {
        return l.id !== "NA";
      })
    },
    {
      key: "wetlands-sea-level-rise",
      label: "Wetlands & Sea Level Rise",
      layers: [
        {
          id: "set",
          label: "Surface elevation tables (SET-MH)",
          color: C.ADA_TEAL,
          sample: true,
          test: is(siteType, ["Benchmark", "Benchmark-Reference", "Reference"])
        },
        {
          id: "water-level",
          label: "Water level stations",
          color: C.SKY_BLUE,
          radius: 8,
          sample: true,
          test: firstPer(prop("subregion"), is(prop("habitat"), ["Slough"]))
        },
        {
          id: "transects",
          label: "Elevation transects",
          color: C.EARTH,
          sample: true,
          test: function (s) {
            return s.projects === "WRMP" && siteType(s) === "Project";
          }
        }
      ]
    },
    {
      key: "wetland-condition",
      label: "Wetland Condition",
      layers: [
        {
          id: "cram-reference",
          label: "CRAM at benchmark and reference sites",
          color: C.ADA_TEAL,
          sample: true,
          test: function (s) {
            return wrmpSite(s) && is(siteType, ["Benchmark", "Benchmark-Reference", "Reference"])(s);
          }
        },
        {
          id: "cram-restoration",
          label: "CRAM at restoration sites",
          color: C.GREEN,
          sample: true,
          test: function (s) {
            return wrmpSite(s) && is(siteType, ["Project", "Other Restored Site"])(s);
          }
        }
      ]
    },
    {
      key: "water-quality",
      label: "Water Quality",
      layers: [
        {
          id: "sondes",
          label: "Continuous water quality sondes",
          color: C.SKY_BLUE,
          radius: 8,
          sample: true,
          test: firstPer(prop("WRMP_Network"))
        },
        {
          id: "discrete",
          label: "Discrete water samples",
          color: C.TEAL,
          sample: true,
          test: is(prop("habitat"), ["Open Bay"])
        }
      ]
    },
    {
      key: "fish-wildlife",
      label: "Fish & Wildlife",
      layers: GROUPINGS.survey.filter(function (l) {
        return ["SBOTS", "NBOTS", "SMFS"].indexOf(l.id) !== -1;
      })
    },
    {
      key: "plant-communities",
      label: "Plant Communities",
      layers: [
        {
          id: "vegetation",
          label: "Vegetation surveys",
          color: C.GREEN,
          sample: true,
          test: function (s) {
            return s.projects === "WRMP" && is(siteType, ["Benchmark", "Benchmark-Reference", "Reference", "Project"])(s);
          }
        }
      ]
    },
    {
      key: "people-wetlands",
      label: "People & Wetlands",
      layers: [
        {
          id: "access",
          label: "Public access points",
          color: C.PURPLE,
          sample: "none",
          test: function () {
            return false;
          }
        }
      ]
    }
  ];

  var BAY_FULL = [
    [37.4, -122.58],
    [38.27, -121.83]
  ];

  // ── State ─────────────────────────────────────────────────
  var stations = [];
  var topic = TOPICS[0];
  var grouping = "siteType";
  var layers = []; // the active layer set
  var enabled = {}; // layer id -> bool

  var map = WRMP.initMap("tools-map", {});
  map.fitBounds(BAY_FULL, { padding: [24, 24] });
  L.control.zoom({ position: "topright" }).addTo(map);
  var markerLayer = L.layerGroup().addTo(map);

  var listEl = document.getElementById("layer-list");
  var countEl = document.getElementById("map-count");
  var countLabelEl = document.getElementById("map-count-label");
  var resetEl = document.getElementById("layer-reset");
  var tabsWrap = document.getElementById("grouping");
  var tabsEl = document.getElementById("grouping-tabs");
  var topicSelect = document.getElementById("map-topic");
  var doorsEl = document.getElementById("topic-doors");
  var defsEl = document.querySelector(".site-type-defs");

  function membersOf(layer) {
    return stations.filter(function (s) {
      return layer.test(s, stations);
    });
  }

  function makePopup(station, layer) {
    var rows = [];
    if (topic.key !== "all" || grouping !== "siteType") {
      rows.push({ type: "row", label: layer.label, value: "Layer" });
    }
    [
      ["Region", "region"],
      ["Network", "WRMP_Network"],
      ["Habitat", "habitat"],
      ["Site Type", "WRMP_Site_Type"]
    ].forEach(function (pair) {
      if (station[pair[1]]) rows.push({ type: "row", label: station[pair[1]], value: pair[0] });
    });
    return WRMP.makeMarkerPopup({
      code: station.station_code,
      name: station.station_name,
      dotColor: layer.color,
      showImage: false,
      sections: [{ rows: rows }]
    });
  }

  // ── Render ────────────────────────────────────────────────
  function renderMarkers() {
    markerLayer.clearLayers();
    var shown = {};
    // Larger points draw first, so a few instruments that share a site
    // with a denser layer stay visible as a ring around it.
    layers
      .slice()
      .sort(function (a, b) {
        return (b.radius || 5) - (a.radius || 5);
      })
      .forEach(function (layer) {
      if (!enabled[layer.id]) return;
      membersOf(layer).forEach(function (s) {
        shown[s.station_code] = true;
        L.circleMarker([s.lat, s.lon], {
          radius: layer.radius || 5,
          fillColor: layer.color,
          color: "#fff",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9
        })
          .addTo(markerLayer)
          .bindPopup(makePopup(s, layer));
      });
    });
    countEl.textContent = String(Object.keys(shown).length);
  }

  // Frame the points the topic draws, so a South Bay-only layer set
  // does not sit small in a whole-region view.
  function frameTopic() {
    var pts = [];
    layers.forEach(function (layer) {
      membersOf(layer).forEach(function (s) {
        pts.push([s.lat, s.lon]);
      });
    });
    if (pts.length) map.fitBounds(pts, { padding: [36, 36], maxZoom: 11 });
    else map.fitBounds(BAY_FULL, { padding: [24, 24] });
  }

  function renderLayers() {
    listEl.textContent = "";
    layers.forEach(function (layer) {
      var n = membersOf(layer).length;
      if (!n && layer.sample !== "none") return;

      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "layer";
      var empty = layer.sample === "none";
      btn.setAttribute("aria-pressed", enabled[layer.id] && !empty ? "true" : "false");
      if (empty) btn.disabled = true;

      var swatch = document.createElement("span");
      swatch.className = "layer__swatch";
      swatch.style.background = layer.color;
      swatch.setAttribute("aria-hidden", "true");

      var name = document.createElement("span");
      name.className = "layer__name";
      name.textContent = layer.label;
      if (layer.sample) {
        var tag = document.createElement("span");
        tag.className = "layer__sample";
        tag.textContent = empty ? "To come" : "Sample";
        name.appendChild(tag);
      }

      var count = document.createElement("span");
      count.className = "layer__count";
      count.textContent = empty ? "" : String(n);

      btn.appendChild(swatch);
      btn.appendChild(name);
      btn.appendChild(count);
      btn.addEventListener("click", function () {
        enabled[layer.id] = !enabled[layer.id];
        btn.setAttribute("aria-pressed", enabled[layer.id] ? "true" : "false");
        renderMarkers();
      });

      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function setLayers(next) {
    layers = next;
    enabled = {};
    layers.forEach(function (l) {
      enabled[l.id] = true;
    });
    renderLayers();
    renderMarkers();
  }

  function setGrouping(next) {
    grouping = next;
    Array.prototype.forEach.call(tabsEl.querySelectorAll(".tab"), function (tab) {
      tab.setAttribute("aria-selected", tab.getAttribute("data-grouping") === grouping ? "true" : "false");
    });
    setLayers(GROUPINGS[grouping]);
  }

  function setTopic(key, push) {
    topic =
      TOPICS.filter(function (t) {
        return t.key === key;
      })[0] || TOPICS[0];
    topicSelect.value = topic.key;
    tabsWrap.hidden = !topic.grouped;
    countLabelEl.textContent = topic.grouped ? "Monitoring sites shown" : "Locations shown";
    if (topic.grouped) setGrouping(grouping);
    else setLayers(topic.layers);
    if (defsEl) defsEl.hidden = !(topic.grouped || topic.key === "baylands-geography");
    frameTopic();
    if (push) {
      var url = new URL(window.location.href);
      if (topic.key === "all") url.searchParams.delete("topic");
      else url.searchParams.set("topic", topic.key);
      window.history.replaceState(null, "", url);
    }
  }

  // The topic list under the map: every topic, its layers, and
  // whether the points are real, sample, or still to come.
  function renderDoors() {
    if (!doorsEl) return;
    doorsEl.textContent = "";
    TOPICS.forEach(function (t) {
      if (t.grouped) return;
      var li = document.createElement("li");
      li.className = "topic-door topic-door--open";
      var a = document.createElement("a");
      a.className = "topic-door__name";
      a.href = "?topic=" + t.key + "#map";
      a.textContent = t.label;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setTopic(t.key, true);
        document.getElementById("map").scrollIntoView({ behavior: "smooth" });
      });
      var chips = document.createElement("span");
      chips.className = "topic-door__layers";
      var real = 0;
      var anySample = false;
      var anyNone = false;
      t.layers.forEach(function (l) {
        var chip = document.createElement("span");
        chip.className = "layer-chip";
        chip.textContent = l.label;
        chips.appendChild(chip);
        if (l.sample === "none") anyNone = true;
        else if (l.sample) anySample = true;
        else real += membersOf(l).length;
      });
      var state = document.createElement("span");
      state.className = "topic-door__state";
      state.textContent = anyNone ? "Layer to come" : anySample ? "Sample locations" : real + " sites";
      li.appendChild(a);
      li.appendChild(chips);
      li.appendChild(state);
      doorsEl.appendChild(li);
    });
  }

  // ── Wiring ────────────────────────────────────────────────
  TOPICS.forEach(function (t) {
    var o = document.createElement("option");
    o.value = t.key;
    o.textContent = t.label;
    topicSelect.appendChild(o);
  });
  topicSelect.addEventListener("change", function () {
    setTopic(topicSelect.value, true);
  });
  Array.prototype.forEach.call(tabsEl.querySelectorAll(".tab"), function (tab) {
    tab.addEventListener("click", function () {
      setGrouping(tab.getAttribute("data-grouping"));
    });
  });
  resetEl.addEventListener("click", function () {
    setLayers(layers);
  });

  // ── Boot ──────────────────────────────────────────────────
  WRMP.loadData({ stations: true }).then(function (data) {
    stations = data.stations.filter(function (s) {
      return typeof s.lat === "number" && typeof s.lon === "number";
    });
    setTopic(new URLSearchParams(window.location.search).get("topic") || "all", false);
    renderDoors();
    map.invalidateSize();
    frameTopic();
  });
})();
