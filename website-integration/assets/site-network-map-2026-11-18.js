/* ════════════════════════════════════════════════════════════
   WRMP.org — WRMP Monitoring Map (viewer)
   ────────────────────────────────────────────────────────────
   One map page for every kind of monitoring map. The topic picker
   loads a set of layers; each layer can be switched on and off,
   inspected, and traced to where its data is held. ?topic=<key>
   opens the map on a topic (map badges, menus and All Resources
   rows link that way).

   Layers draw what the data really is:
     points   station snapshots in assets/map-data/ (NOAA, USGS,
              CDFW BIOS) and the WRMP station list
     wms      SFEI's own SET and water level map service, live
     export   ArcGIS dynamic map services drawn per tile, live
              (NOAA sea level rise, California Protected Areas)
     lines    Bay Trail segments (snapshot)
     polygons Baylands Habitat Map 2020, larger patches (snapshot)
     unpublished  monitoring with no public data yet: a row with
              where it will be held, never placeholder points
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var canvas = document.getElementById("tools-map");
  if (!canvas || typeof L === "undefined" || !window.WRMP) return;

  // ── Palette ───────────────────────────────────────────────
  function tokenColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  var C = {
    ADA_TEAL: tokenColor("--wrmp-ada-teal", "#005E6A"),
    TEAL: tokenColor("--wrmp-teal", "#228B9C"),
    GREEN: tokenColor("--wrmp-green", "#379352"),
    LIGHT_GREEN: tokenColor("--wrmp-light-green", "#92BB4D"),
    ORANGE: tokenColor("--wrmp-orange", "#E09337"),
    SKY: "#2C8FD6",
    NAVY: "#1B3A5C",
    EARTH: "#8A6A3B",
    PURPLE: "#6E56CF",
    MARSH: "#6FA35A",
    FLAT: "#C9B98F",
    DIKED: "#B9A7C9"
  };

  var SITE_TYPES = [
    { id: "Benchmark", label: "Benchmark", color: C.LIGHT_GREEN },
    { id: "Benchmark-Reference", label: "Benchmark and reference", color: "#C7D865" },
    { id: "Reference", label: "Reference", color: C.ADA_TEAL },
    { id: "Reference Site Candidate", label: "Reference candidate", color: C.TEAL },
    { id: "Project", label: "Project", color: C.GREEN },
    { id: "Other Restored Site", label: "Other restored", color: "#6A9E3A" },
    { id: "Planned Restoration", label: "Planned restoration", color: C.ORANGE }
  ];
  function siteTypeOf(s) {
    for (var i = 0; i < SITE_TYPES.length; i++) if (SITE_TYPES[i].id === s.WRMP_Site_Type) return SITE_TYPES[i];
    return null;
  }

  // ── Symbols ───────────────────────────────────────────────
  var SVGNS = "http://www.w3.org/2000/svg";
  function symbolSVG(sym, size) {
    size = size || 18;
    var c = sym.color;
    var s = '<svg xmlns="' + SVGNS + '" width="' + size + '" height="' + size + '" viewBox="0 0 20 20" aria-hidden="true">';
    var stroke = ' stroke="#fff" stroke-width="1.6"';
    switch (sym.shape) {
      case "square":
        s += '<rect x="4" y="4" width="12" height="12" rx="1.5" fill="' + c + '"' + stroke + "/>";
        break;
      case "square-open":
        s += '<rect x="4.5" y="4.5" width="11" height="11" rx="1" fill="#fff" stroke="' + c + '" stroke-width="2.4"/>';
        break;
      case "diamond":
        s += '<rect x="5" y="5" width="10" height="10" rx="1" transform="rotate(45 10 10)" fill="' + c + '"' + stroke + "/>";
        break;
      case "square-hatched":
        s += '<defs><pattern id="h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.4" height="3" fill="' + c + '"/></pattern></defs><rect x="4.5" y="4.5" width="11" height="11" rx="1" fill="url(#h)" stroke="' + c + '" stroke-width="1.8"/>';
        break;
      case "triangle":
        s += '<path d="M10 3.5 17 16H3z" fill="' + c + '"' + stroke + ' stroke-linejoin="round"/>';
        break;
      case "line":
        s += '<path d="M2 14 C7 4, 13 16, 18 6" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"' + (sym.dash ? ' stroke-dasharray="3 3"' : "") + "/>";
        break;
      case "fill":
        s += '<rect x="2.5" y="4" width="15" height="12" rx="2" fill="' + c + '" fill-opacity="' + (sym.alpha || 0.55) + '" stroke="' + (sym.edge || c) + '" stroke-width="1.2"/>';
        break;
      case "raster":
        s += '<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#c6e3f5"/><stop offset="1" stop-color="#08306b"/></linearGradient></defs><rect x="2.5" y="4" width="15" height="12" rx="2" fill="url(#g)"/>';
        break;
      case "none":
        s += '<circle cx="10" cy="10" r="6" fill="none" stroke="#9a9a9a" stroke-width="1.6" stroke-dasharray="2.5 2.5"/>';
        break;
      default:
        s += '<circle cx="10" cy="10" r="6" fill="' + c + '"' + stroke + "/>";
    }
    return s + "</svg>";
  }
  function pointIcon(sym) {
    var size = sym.size || 16;
    return L.divIcon({
      className: "mv-pt",
      html: symbolSVG(sym, size),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }
  var EXT =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

  // ── Sources: where each dataset is held ───────────────────
  var SRC = {
    wrmpSites: { label: "WRMP monitoring site network", href: "https://www.wrmp.org/monitoring-site-network/" },
    wrmpCatalog: { label: "WRMP Data Catalog", href: "https://data.wrmp.org/" },
    setMap: { label: "SFEI SET and water level map", href: "https://set-map.ecoatlas.org/" },
    setData: { label: "USGS ScienceBase SET data", href: "https://www.sciencebase.gov/catalog/item/67c0d5ddd34e8876fcbfd106" },
    noaaTides: { label: "NOAA Tides & Currents", href: "https://tidesandcurrents.noaa.gov/map/index.html" },
    noaaSlr: { label: "NOAA Sea Level Rise Viewer", href: "https://coast.noaa.gov/slr/" },
    bhm: { label: "Baylands Habitat Map 2020 (SFEI)", href: "https://www.sfei.org/data/baylands-habitat-map-2020-gis-data" },
    ecoatlas: { label: "EcoAtlas", href: "https://www.ecoatlas.org/" },
    cram: { label: "CRAM assessments in EcoAtlas", href: "https://www.cramwetlands.org/" },
    usgs: { label: "USGS Water Data", href: "https://waterdata.usgs.gov/" },
    smfs: { label: "Suisun Marsh Fish Study (CDFW BIOS ds1964)", href: "https://map.dfg.ca.gov/metadata/ds1964.html" },
    bayTrail: { label: "San Francisco Bay Trail", href: "https://baytrail.org/" },
    cpad: { label: "California Protected Areas Database", href: "https://www.calands.org/" }
  };

  // ── Live services ─────────────────────────────────────────
  var SFEI_WMS = "https://mapserver.sfei.org/cgi-bin/mapserv?map=/var/mapwork/mapfiles/";
  function slrService(ft) {
    return "https://coast.noaa.gov/arcgis/rest/services/dc_slr/slr_" + ft + "ft/MapServer";
  }
  var CPAD = "https://gis.cnra.ca.gov/arcgis/rest/services/Boundaries/CPAD_AccessType/MapServer";

  // An ArcGIS dynamic map service drawn as 256px tiles: each tile asks
  // the service to export exactly its own extent.
  var ExportLayer = L.TileLayer.extend({
    initialize: function (service, opts) {
      this._service = service;
      L.TileLayer.prototype.initialize.call(this, "", opts);
    },
    setService: function (service) {
      this._service = service;
      this.redraw();
    },
    getTileUrl: function (coords) {
      var b = this._tileCoordsToBounds(coords);
      var sw = L.CRS.EPSG3857.project(b.getSouthWest());
      var ne = L.CRS.EPSG3857.project(b.getNorthEast());
      return (
        this._service +
        "/export?bbox=" + [sw.x, sw.y, ne.x, ne.y].join(",") +
        "&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image" +
        (this.options.show ? "&layers=show:" + this.options.show : "")
      );
    }
  });

  // ── State ─────────────────────────────────────────────────
  var data = { stations: [], smfs: [], gauges: [], usgs: [], trail: null, habitat: null };
  var map = WRMP.initMap("tools-map", {});
  map.eachLayer(function (l) {
    if (l instanceof L.TileLayer) map.removeLayer(l);
  });
  map.createPane("rasters").style.zIndex = 300;
  map.createPane("polys").style.zIndex = 350;
  map.createPane("lines").style.zIndex = 420;
  map.createPane("wms").style.zIndex = 450;
  L.control.zoom({ position: "topright" }).addTo(map);
  L.control.scale({ position: "bottomleft", maxWidth: 140 }).addTo(map);

  var BAY = [
    [37.42, -122.56],
    [38.25, -121.85]
  ];
  map.fitBounds(BAY);

  // ── Basemaps ──────────────────────────────────────────────
  var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
  var BASEMAPS = [
    {
      id: "light",
      label: "Light",
      layers: [ESRI + "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", ESRI + "Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"],
      attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS"
    },
    {
      id: "imagery",
      label: "Imagery",
      layers: [ESRI + "World_Imagery/MapServer/tile/{z}/{y}/{x}", ESRI + "Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
      attribution: "Esri, Maxar, Earthstar Geographics"
    },
    {
      id: "topo",
      label: "Topographic",
      layers: [ESRI + "World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
      attribution: "Esri, HERE, Garmin, USGS, NPS"
    }
  ];
  var basemapGroup = L.layerGroup().addTo(map);
  var basemapEl = document.getElementById("basemaps");
  function setBasemap(id) {
    var bm = BASEMAPS.filter(function (b) { return b.id === id; })[0] || BASEMAPS[0];
    basemapGroup.clearLayers();
    bm.layers.forEach(function (url, i) {
      L.tileLayer(url, { maxZoom: 19, attribution: i === 0 ? bm.attribution : "" }).addTo(basemapGroup);
    });
    Array.prototype.forEach.call(basemapEl.children, function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-id") === bm.id ? "true" : "false");
    });
  }
  BASEMAPS.forEach(function (bm) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "mv-basemap";
    b.setAttribute("role", "radio");
    b.setAttribute("data-id", bm.id);
    b.textContent = bm.label;
    b.addEventListener("click", function () { setBasemap(bm.id); });
    basemapEl.appendChild(b);
  });
  setBasemap("light");
  L.DomEvent.disableClickPropagation(basemapEl);

  // ── Layer catalogue ───────────────────────────────────────
  // Each layer: id, group (monitoring | context), label, kind, sym,
  // meta() -> short line under the name, about, sources[], and the
  // kind's own fields. build() returns the Leaflet layer.
  function sitesLayer(id, label, filter) {
    return {
      id: id,
      group: "monitoring",
      label: label,
      kind: "points",
      sym: { shape: "circle", color: C.ADA_TEAL },
      categories: SITE_TYPES,
      features: function () {
        return data.stations.filter(function (s) { return siteTypeOf(s) && (!filter || filter(s)); });
      },
      symFor: function (s) { return { shape: "circle", color: siteTypeOf(s).color, size: 14 }; },
      unit: "sites",
      about: "WRMP monitoring sites by site type, from the program's monitoring site network.",
      sources: [SRC.wrmpSites, SRC.wrmpCatalog],
      record: function (s) {
        return {
          title: s.station_name,
          fields: [
            ["Station", s.station_code],
            ["Site type", siteTypeOf(s).label],
            ["Region", s.region],
            ["Network", s.WRMP_Network],
            ["Habitat", s.habitat]
          ],
          link: SRC.wrmpCatalog
        };
      }
    };
  }
  function surveyLayer(id, label, project, sym) {
    return {
      id: id,
      group: "monitoring",
      label: label,
      kind: "points",
      sym: sym,
      features: function () {
        return data.stations.filter(function (s) { return s.projects === project; });
      },
      unit: "stations",
      about: label + " sampling stations in the WRMP fish and fish habitat dataset.",
      sources: [SRC.wrmpCatalog],
      record: function (s) {
        return {
          title: s.station_name,
          fields: [["Station", s.station_code], ["Survey", label], ["Region", s.region], ["Habitat", s.habitat]],
          link: SRC.wrmpCatalog
        };
      }
    };
  }
  function habitatLayer(id, label, cls, color, on) {
    return {
      id: id,
      group: "context",
      label: label,
      kind: "polygons",
      sym: { shape: "fill", color: color },
      cls: cls,
      color: color,
      off: !on,
      opacity: 0.55,
      unit: "patches",
      about: "Baylands Habitat Map 2020 class “" + cls + "”. Larger patches, simplified for this view; the full map has 168,502 polygons.",
      sources: [SRC.bhm, SRC.ecoatlas],
      record: function (p) {
        return {
          title: cls,
          fields: [["Class", p.Level4], ["Status", p.Status || "—"], ["Source", "Baylands Habitat Map 2020"]],
          link: SRC.bhm
        };
      }
    };
  }
  function unpublished(id, label, sym, about, sources) {
    return { id: id, group: "monitoring", label: label, kind: "unpublished", sym: { shape: "none" }, about: about, sources: sources };
  }

  var L_ = {
    sites: sitesLayer("sites", "WRMP monitoring sites"),
    set: {
      id: "set",
      group: "monitoring",
      label: "Surface elevation tables (SET)",
      kind: "wms",
      mapfile: "set.map",
      layers: "SET",
      sym: { shape: "circle", color: "#6D5FA8" },
      meta: "Live from SFEI",
      about: "Each point is a site with several SET-MH stations. Click through to SFEI's SET map for elevation trends and data.",
      sources: [SRC.setMap, SRC.setData]
    },
    wlActive: {
      id: "wl-active",
      group: "monitoring",
      label: "Water level stations, active",
      kind: "wms",
      mapfile: "waterlevels.map",
      layers: "active",
      sym: { shape: "square-open", color: "#2E6E6A" },
      meta: "Live from SFEI",
      about: "Tide loggers recording marsh water levels, operated by WRMP partners.",
      sources: [SRC.setMap]
    },
    wlRetired: {
      id: "wl-retired",
      group: "monitoring",
      label: "Water level stations, retired",
      kind: "wms",
      mapfile: "waterlevels.map",
      layers: "retired",
      sym: { shape: "square-hatched", color: "#7A8A88" },
      off: true,
      meta: "Live from SFEI",
      about: "Former water level stations with archived records.",
      sources: [SRC.setMap]
    },
    gauges: {
      id: "gauges",
      group: "monitoring",
      label: "NOAA tide gauges",
      kind: "points",
      sym: { shape: "square", color: C.NAVY },
      features: function () { return data.gauges; },
      unit: "stations",
      about: "NOAA National Water Level Observation Network stations in the Bay; the long-term record that marsh water levels are compared with.",
      sources: [SRC.noaaTides],
      record: function (g) {
        return {
          title: g.name,
          fields: [["Station", g.id], ["Operator", "NOAA CO-OPS"], ["Measures", "Water level, 6-minute"], ["Location", g.lat.toFixed(4) + ", " + g.lon.toFixed(4)]],
          link: { label: "Station home at NOAA", href: "https://tidesandcurrents.noaa.gov/stationhome.html?id=" + g.id }
        };
      }
    },
    transects: unpublished("transects", "Elevation transects", null, "Marsh surface elevation surveys (RTK GPS) at WRMP sites. Not yet in a public map service.", [SRC.wrmpCatalog]),
    slr: {
      id: "slr",
      group: "context",
      label: "Sea level rise, inundation",
      kind: "export",
      sym: { shape: "raster" },
      steps: [1, 2, 3, 4, 6],
      step: 2,
      service: function (ft) { return slrService(ft); },
      show: "1",
      off: true,
      opacity: 0.5,
      meta: "Live from NOAA",
      about: "Areas below high tide with the chosen rise in sea level, and their depth. Pick a scenario in feet.",
      sources: [SRC.noaaSlr]
    },
    marsh: habitatLayer("marsh", "Tidal marsh", "Tidal Marsh", C.MARSH, true),
    flat: habitatLayer("flat", "Tidal flat", "Tidal Flat", C.FLAT, false),
    diked: habitatLayer("diked", "Diked baylands", "Non-Aquatic Diked Bayland", C.DIKED, false),
    cram: unpublished("cram", "CRAM assessments", null, "California Rapid Assessment Method condition scores. Assessment areas are held in EcoAtlas; not yet loaded here.", [SRC.cram, SRC.ecoatlas]),
    usgs: {
      id: "usgs",
      group: "monitoring",
      label: "USGS estuary water quality stations",
      kind: "points",
      sym: { shape: "square-open", color: C.SKY },
      features: function () { return data.usgs; },
      unit: "stations",
      about: "Active USGS estuary stations with continuous temperature, conductance, oxygen or turbidity.",
      sources: [SRC.usgs],
      record: function (u) {
        return {
          title: u.name,
          fields: [["Station", u.id], ["Operator", "USGS"], ["Record", "Continuous, 15-minute"], ["Location", u.lat.toFixed(4) + ", " + u.lon.toFixed(4)]],
          link: { label: "Monitoring location at USGS", href: "https://waterdata.usgs.gov/monitoring-location/USGS-" + u.id + "/" }
        };
      }
    },
    sondes: unpublished("sondes", "WRMP water quality sondes", null, "Continuous sondes at WRMP sites. Station list not yet public.", [SRC.wrmpCatalog]),
    discrete: unpublished("discrete", "WRMP discrete water samples", null, "Grab samples at WRMP sites. Not yet in a public map service.", [SRC.wrmpCatalog]),
    smfs: {
      id: "smfs",
      group: "monitoring",
      label: "Suisun Marsh Fish Study",
      kind: "points",
      sym: { shape: "triangle", color: C.ORANGE },
      features: function () { return data.smfs; },
      unit: "stations",
      about: "UC Davis otter trawl and beach seine stations in Suisun Marsh sloughs, sampled monthly since 1980.",
      sources: [SRC.smfs],
      record: function (f) {
        return {
          title: f.name,
          fields: [["Station", f.code], ["Methods", f.methods.join(", ")], ["Record", (f.from || "?") + "–" + (f.to || "?")], ["Program", "Suisun Marsh Fish Study"]],
          link: SRC.smfs
        };
      }
    },
    sbots: surveyLayer("sbots", "South Bay Otter Trawl Survey", "SBOTS", { shape: "diamond", color: C.SKY }),
    nbots: surveyLayer("nbots", "North Bay Otter Trawl Survey", "NBOTS", { shape: "diamond", color: C.TEAL }),
    veg: unpublished("veg", "Vegetation surveys", null, "Plant community plots at WRMP sites. Not yet in a public map service; tidal marsh habitat is shown for context.", [SRC.wrmpCatalog]),
    trail: {
      id: "trail",
      group: "monitoring",
      label: "Bay Trail",
      kind: "lines",
      sym: { shape: "line", color: C.PURPLE },
      about: "San Francisco Bay Trail segments, existing and proposed.",
      sources: [SRC.bayTrail],
      record: function (p) {
        return {
          title: "Bay Trail segment",
          fields: [["Status", p.status], ["Class", p.class || "—"], ["County", p.county || "—"], ["Length", p.miles ? p.miles.toFixed(2) + " mi" : "—"]],
          link: SRC.bayTrail
        };
      }
    },
    cpad: {
      id: "cpad",
      group: "context",
      label: "Parks and protected lands",
      kind: "export",
      sym: { shape: "fill", color: "#7FAF6E", alpha: 0.45 },
      service: function () { return CPAD; },
      show: "2",
      opacity: 0.6,
      meta: "Live from CPAD",
      about: "Public and protected lands by public access type (open, restricted, no access).",
      sources: [SRC.cpad]
    }
  };

  var TOPICS = [
    { key: "all", label: "All monitoring sites", color: C.ADA_TEAL, layers: ["sites", "marsh"] },
    { key: "baylands-geography", label: "Baylands Geography", color: C.MARSH, layers: ["sites", "marsh", "flat", "diked"] },
    { key: "wetlands-sea-level-rise", label: "Wetlands & Sea Level Rise", color: C.SKY, layers: ["set", "wlActive", "wlRetired", "gauges", "transects", "slr", "marsh"] },
    { key: "wetland-condition", label: "Wetland Condition", color: C.LIGHT_GREEN, layers: ["cram", "sites", "marsh", "diked"] },
    { key: "water-quality", label: "Water Quality", color: C.TEAL, layers: ["usgs", "sondes", "discrete", "marsh"] },
    { key: "fish-wildlife", label: "Fish & Wildlife", color: C.ORANGE, layers: ["smfs", "sbots", "nbots", "marsh", "flat"] },
    { key: "plant-communities", label: "Plant Communities", color: C.GREEN, layers: ["veg", "marsh", "flat"] },
    { key: "people-wetlands", label: "People & Wetlands", color: C.PURPLE, layers: ["trail", "cpad", "marsh"] }
  ];

  var topic = TOPICS[0];
  var active = []; // layer defs for the topic
  var state = {}; // id -> { on, opacity, step, leaflet }

  // ── Building Leaflet layers ───────────────────────────────
  function featureCount(def) {
    if (def.kind === "points") return def.features().length;
    if (def.kind === "polygons") return habitatOf(def).length;
    if (def.kind === "lines") return data.trail ? data.trail.features.length : 0;
    return null;
  }
  function habitatOf(def) {
    if (!data.habitat) return [];
    return data.habitat.features.filter(function (f) { return f.properties.Level4 === def.cls; });
  }
  function metaOf(def) {
    if (def.kind === "unpublished") return "Not yet published";
    if (def.meta) return def.meta;
    if (def.kind === "lines") {
      if (!data.trail) return "Loading…";
      var mi = 0;
      data.trail.features.forEach(function (f) {
        if (f.properties.status === "Existing") mi += f.properties.miles || 0;
      });
      return Math.round(mi).toLocaleString() + " miles open";
    }
    if (def.kind === "polygons") {
      if (!data.habitat) return "Loading…";
      return habitatOf(def).length.toLocaleString() + " larger patches";
    }
    var n = featureCount(def);
    var line = n + " " + def.unit;
    if (def.id === "smfs" && data.smfs.length) line += " · 1980–2018";
    return line;
  }

  function build(def) {
    var st = state[def.id];
    if (def.kind === "points") {
      var g = L.layerGroup();
      def.features().forEach(function (f) {
        var lat = f.lat, lon = f.lon;
        var m = L.marker([lat, lon], { icon: pointIcon(def.symFor ? def.symFor(f) : def.sym), keyboard: true, title: f.station_name || f.name });
        m.on("click", function () { inspect(def, def.record(f)); });
        g.addLayer(m);
      });
      return g;
    }
    if (def.kind === "wms") {
      return L.tileLayer.wms(SFEI_WMS + def.mapfile, {
        layers: def.layers,
        format: "image/png",
        transparent: true,
        pane: "wms",
        attribution: "SFEI"
      });
    }
    if (def.kind === "export") {
      var ex = new ExportLayer(def.service(st.step), { pane: "rasters", opacity: st.opacity, show: def.show, attribution: def.id === "slr" ? "NOAA OCM" : "CPAD" });
      return ex;
    }
    if (def.kind === "lines") {
      if (!data.trail) return null;
      return L.geoJSON(data.trail, {
        pane: "lines",
        style: function (f) {
          var existing = f.properties.status === "Existing";
          return { color: C.PURPLE, weight: existing ? 3 : 2, opacity: 0.9, dashArray: existing ? null : "4 5" };
        },
        onEachFeature: function (f, lyr) {
          lyr.on("click", function () { inspect(def, def.record(f.properties)); });
        }
      });
    }
    if (def.kind === "polygons") {
      if (!data.habitat) return null;
      return L.geoJSON({ type: "FeatureCollection", features: habitatOf(def) }, {
        pane: "polys",
        style: function () {
          return { color: def.color, weight: 0.6, fillColor: def.color, fillOpacity: st.opacity, opacity: Math.min(1, st.opacity + 0.3) };
        },
        onEachFeature: function (f, lyr) {
          lyr.on("click", function () { inspect(def, def.record(f.properties)); });
        }
      });
    }
    return null;
  }

  function sync(def) {
    var st = state[def.id];
    if (st.leaflet) {
      map.removeLayer(st.leaflet);
      st.leaflet = null;
    }
    if (!st.on || def.kind === "unpublished") return;
    st.leaflet = build(def);
    if (st.leaflet) st.leaflet.addTo(map);
  }

  // ── Panel ─────────────────────────────────────────────────
  var listEl = document.getElementById("layer-list");
  var uid = 0;
  function renderPanel() {
    listEl.textContent = "";
    [["monitoring", "Monitoring"], ["context", "Context"]].forEach(function (grp) {
      var defs = active.filter(function (d) { return d.group === grp[0]; });
      if (!defs.length) return;
      var sec = document.createElement("section");
      sec.className = "layer-group";
      var h = document.createElement("h3");
      h.className = "layer-group__head";
      h.textContent = grp[1];
      sec.appendChild(h);
      var ul = document.createElement("ul");
      defs.forEach(function (def) { ul.appendChild(layerRow(def)); });
      sec.appendChild(ul);
      listEl.appendChild(sec);
    });
  }

  function layerRow(def) {
    var st = state[def.id];
    var id = "lyr-" + ++uid;
    var li = document.createElement("li");
    li.className = "lyr" + (def.kind === "unpublished" ? " lyr--unpublished" : "") + (!st.on && def.kind !== "unpublished" ? " lyr--off" : "");

    var row = document.createElement("div");
    row.className = "lyr__row";

    var box = document.createElement("input");
    box.type = "checkbox";
    box.className = "lyr__check";
    box.id = id;
    box.checked = st.on && def.kind !== "unpublished";
    box.disabled = def.kind === "unpublished";

    var sym = document.createElement("span");
    sym.className = "lyr__symbol";
    sym.innerHTML = symbolSVG(def.sym, 20);

    var label = document.createElement("label");
    label.className = "lyr__label";
    label.htmlFor = id;
    label.textContent = def.label;
    var meta = document.createElement("span");
    meta.className = "lyr__meta";
    meta.textContent = metaOf(def);
    label.appendChild(meta);

    var info = document.createElement("button");
    info.type = "button";
    info.className = "lyr__info";
    info.setAttribute("aria-label", "About " + def.label);
    info.setAttribute("aria-expanded", "false");
    info.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5v.01"/></svg>';

    row.appendChild(box);
    row.appendChild(sym);
    row.appendChild(label);
    row.appendChild(info);
    li.appendChild(row);

    if (def.steps) {
      var steps = document.createElement("div");
      steps.className = "lyr__steps";
      steps.setAttribute("role", "group");
      steps.setAttribute("aria-label", "Sea level rise scenario");
      def.steps.forEach(function (ft) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "lyr__step";
        b.textContent = ft + " ft";
        b.setAttribute("aria-pressed", ft === st.step ? "true" : "false");
        b.addEventListener("click", function () {
          st.step = ft;
          Array.prototype.forEach.call(steps.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          if (st.leaflet && st.leaflet.setService) st.leaflet.setService(def.service(ft));
          renderLegend();
        });
        steps.appendChild(b);
      });
      li.appendChild(steps);
    }

    var details = document.createElement("div");
    details.className = "lyr__details";
    details.hidden = true;
    var p = document.createElement("p");
    p.textContent = def.about;
    details.appendChild(p);
    def.sources.forEach(function (s) {
      var sp = document.createElement("p");
      sp.className = "lyr__source";
      var a = document.createElement("a");
      a.href = s.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = EXT;
      a.insertBefore(document.createTextNode(s.label + " "), a.firstChild);
      sp.appendChild(a);
      details.appendChild(sp);
    });
    if (st.opacity != null && def.kind !== "unpublished") {
      var op = document.createElement("label");
      op.className = "lyr__opacity";
      op.textContent = "Opacity";
      var r = document.createElement("input");
      r.type = "range";
      r.min = "10";
      r.max = "100";
      r.value = String(Math.round(st.opacity * 100));
      r.addEventListener("input", function () {
        st.opacity = Number(r.value) / 100;
        if (!st.leaflet) return;
        if (st.leaflet.setOpacity) st.leaflet.setOpacity(st.opacity);
        else if (st.leaflet.setStyle) st.leaflet.setStyle({ fillOpacity: st.opacity, opacity: Math.min(1, st.opacity + 0.3) });
      });
      op.appendChild(r);
      details.appendChild(op);
    }
    li.appendChild(details);

    info.addEventListener("click", function () {
      details.hidden = !details.hidden;
      info.setAttribute("aria-expanded", details.hidden ? "false" : "true");
    });
    box.addEventListener("change", function () {
      st.on = box.checked;
      li.classList.toggle("lyr--off", !st.on);
      sync(def);
      renderLegend();
    });
    return li;
  }

  // ── Legend ────────────────────────────────────────────────
  var legendBody = document.getElementById("legend-body");
  var legendToggle = document.getElementById("legend-toggle");
  legendToggle.addEventListener("click", function () {
    var open = legendToggle.getAttribute("aria-expanded") === "true";
    legendToggle.setAttribute("aria-expanded", open ? "false" : "true");
    legendBody.hidden = open;
  });
  L.DomEvent.disableClickPropagation(document.getElementById("legend"));
  L.DomEvent.disableScrollPropagation(document.getElementById("legend"));

  var arcLegendCache = {};
  function arcLegend(service, show, into) {
    var key = service + "|" + show;
    function paint(items) {
      items.forEach(function (it) {
        var row = document.createElement("div");
        row.className = "lg-item";
        var im = document.createElement("img");
        im.alt = "";
        im.width = 18;
        im.height = 18;
        im.src = "data:" + it.contentType + ";base64," + it.imageData;
        row.appendChild(im);
        row.appendChild(document.createTextNode(it.label));
        into.appendChild(row);
      });
    }
    if (arcLegendCache[key]) return paint(arcLegendCache[key]);
    fetch(service + "/legend?f=json")
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var items = [];
        (j.layers || []).forEach(function (l) {
          if (String(l.layerId) === String(show)) {
            l.legend.forEach(function (it) { items.push({ label: it.label || l.layerName, imageData: it.imageData, contentType: it.contentType }); });
          }
        });
        arcLegendCache[key] = items;
        paint(items);
      })
      .catch(function () {});
  }

  function lgItem(svg, text) {
    var row = document.createElement("div");
    row.className = "lg-item";
    row.innerHTML = svg;
    row.appendChild(document.createTextNode(text));
    return row;
  }
  function renderLegend() {
    legendBody.textContent = "";
    active.forEach(function (def) {
      var st = state[def.id];
      if (!st.on || def.kind === "unpublished") return;
      var g = document.createElement("div");
      g.className = "lg-group";
      var t = document.createElement("p");
      t.className = "lg-title";
      t.textContent = def.id === "slr" ? def.label + ", " + st.step + " ft" : def.label;
      g.appendChild(t);
      if (def.categories) {
        var present = {};
        def.features().forEach(function (s) { present[siteTypeOf(s).id] = true; });
        def.categories.forEach(function (c) {
          if (present[c.id]) g.appendChild(lgItem(symbolSVG({ shape: "circle", color: c.color }, 16), c.label));
        });
      } else if (def.kind === "wms") {
        g.appendChild(lgItem(symbolSVG(def.sym, 16), def.id === "set" ? "SET site (several stations)" : "Station"));
      } else if (def.kind === "export") {
        arcLegend(def.service(st.step), def.show, g);
      } else if (def.kind === "lines") {
        g.appendChild(lgItem(symbolSVG({ shape: "line", color: C.PURPLE }, 16), "Existing"));
        g.appendChild(lgItem(symbolSVG({ shape: "line", color: C.PURPLE, dash: true }, 16), "Proposed"));
      } else {
        g.appendChild(lgItem(symbolSVG(def.sym, 16), def.kind === "polygons" ? def.cls : metaOf(def)));
      }
      legendBody.appendChild(g);
    });
    document.getElementById("legend").hidden = !legendBody.children.length;
  }

  // ── Feature panel ─────────────────────────────────────────
  var inspectEl = document.getElementById("inspect");
  var inspectBody = document.getElementById("inspect-body");
  document.getElementById("inspect-close").addEventListener("click", function () { inspectEl.hidden = true; });
  L.DomEvent.disableClickPropagation(inspectEl);
  L.DomEvent.disableScrollPropagation(inspectEl);
  function inspect(def, rec) {
    inspectBody.textContent = "";
    var lay = document.createElement("p");
    lay.className = "fi-layer";
    lay.innerHTML = symbolSVG(def.sym, 14);
    lay.appendChild(document.createTextNode(def.label));
    var h = document.createElement("h3");
    h.className = "fi-name";
    h.textContent = rec.title;
    var dl = document.createElement("dl");
    dl.className = "fi-fields";
    rec.fields.forEach(function (f) {
      if (!f[1]) return;
      var dt = document.createElement("dt");
      dt.textContent = f[0];
      var dd = document.createElement("dd");
      dd.textContent = f[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    inspectBody.appendChild(lay);
    inspectBody.appendChild(h);
    inspectBody.appendChild(dl);
    if (rec.link) {
      var a = document.createElement("a");
      a.className = "mv-link";
      a.href = rec.link.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = EXT;
      a.insertBefore(document.createTextNode((rec.link.label.indexOf(" at ") > -1 ? rec.link.label : "Get the data: " + rec.link.label) + " "), a.firstChild);
      inspectBody.appendChild(a);
    }
    inspectEl.hidden = false;
  }

  // ── Topic picker ──────────────────────────────────────────
  var pickerBtn = document.getElementById("topic-button");
  var pickerList = document.getElementById("topic-list");
  var pickerDot = document.getElementById("topic-dot");
  var pickerText = document.getElementById("topic-text");
  var activeIdx = 0;

  function renderPicker() {
    pickerList.textContent = "";
    TOPICS.forEach(function (t, i) {
      var li = document.createElement("li");
      li.className = "topic-option";
      li.id = "topic-opt-" + t.key;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", t === topic ? "true" : "false");
      var dot = document.createElement("span");
      dot.className = "topic-dot";
      dot.style.setProperty("--dot", t.color);
      var name = document.createElement("span");
      name.className = "topic-option__name";
      name.textContent = t.label;
      var check = document.createElementNS(SVGNS, "svg");
      check.setAttribute("viewBox", "0 0 24 24");
      check.setAttribute("class", "topic-option__check");
      check.innerHTML = '<path d="M20 6 9 17l-5-5"/>';
      var sub = document.createElement("span");
      sub.className = "topic-option__layers";
      sub.textContent = t.layers
        .map(function (id) { return L_[id]; })
        .filter(function (d) { return d.group === "monitoring"; })
        .map(function (d) { return d.label.replace(/,.*$/, ""); })
        .filter(function (v, j, a) { return a.indexOf(v) === j; })
        .join(" · ");
      li.appendChild(dot);
      li.appendChild(name);
      li.appendChild(check);
      li.appendChild(sub);
      li.addEventListener("click", function () {
        closePicker(true);
        setTopic(t.key, true);
      });
      li.addEventListener("mousemove", function () { setActive(i); });
      pickerList.appendChild(li);
    });
  }
  function setActive(i) {
    activeIdx = (i + TOPICS.length) % TOPICS.length;
    Array.prototype.forEach.call(pickerList.children, function (li, j) { li.classList.toggle("is-active", j === activeIdx); });
    pickerList.setAttribute("aria-activedescendant", "topic-opt-" + TOPICS[activeIdx].key);
  }
  function openPicker() {
    renderPicker();
    pickerList.hidden = false;
    pickerBtn.setAttribute("aria-expanded", "true");
    setActive(TOPICS.indexOf(topic));
    pickerList.focus();
  }
  function closePicker(focusBtn) {
    pickerList.hidden = true;
    pickerBtn.setAttribute("aria-expanded", "false");
    if (focusBtn) pickerBtn.focus();
  }
  pickerBtn.addEventListener("click", function () {
    if (pickerList.hidden) openPicker();
    else closePicker(false);
  });
  pickerBtn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openPicker();
    }
  });
  pickerList.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIdx + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIdx - 1); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(TOPICS.length - 1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      var t = TOPICS[activeIdx];
      closePicker(true);
      setTopic(t.key, true);
    } else if (e.key === "Escape" || e.key === "Tab") closePicker(e.key === "Escape");
  });
  document.addEventListener("click", function (e) {
    if (!pickerList.hidden && !document.getElementById("topic-picker").contains(e.target)) closePicker(false);
  });

  // ── Topic ─────────────────────────────────────────────────
  function setTopic(key, push) {
    active.forEach(function (def) {
      var st = state[def.id];
      if (st && st.leaflet) map.removeLayer(st.leaflet);
    });
    topic = TOPICS.filter(function (t) { return t.key === key; })[0] || TOPICS[0];
    pickerDot.style.setProperty("--dot", topic.color);
    pickerText.textContent = topic.label;
    active = topic.layers.map(function (id) { return L_[id]; });
    state = {};
    active.forEach(function (def) {
      state[def.id] = { on: !def.off, opacity: def.opacity != null ? def.opacity : null, step: def.step, leaflet: null };
      sync(def);
    });
    inspectEl.hidden = true;
    renderPanel();
    renderLegend();
    frame();
    if (push) {
      var url = new URL(window.location.href);
      if (topic.key === "all") url.searchParams.delete("topic");
      else url.searchParams.set("topic", topic.key);
      window.history.replaceState(null, "", url);
    }
  }
  function frame() {
    var pts = [];
    active.forEach(function (def) {
      if (def.kind === "points" && state[def.id].on) def.features().forEach(function (f) { pts.push([f.lat, f.lon]); });
    });
    if (pts.length > 4) map.fitBounds(pts, { padding: [40, 40], maxZoom: 11 });
    else map.fitBounds(BAY);
  }

  // ── Status bar ────────────────────────────────────────────
  var coordsEl = document.getElementById("coords");
  map.on("mousemove", function (e) {
    var la = e.latlng.lat, lo = e.latlng.lng;
    coordsEl.textContent = Math.abs(la).toFixed(4) + "° " + (la >= 0 ? "N" : "S") + ", " + Math.abs(lo).toFixed(4) + "° " + (lo >= 0 ? "E" : "W");
  });
  var copyBtn = document.getElementById("copy-link");
  var copyText = document.getElementById("copy-link-text");
  copyBtn.addEventListener("click", function () {
    var done = function () {
      copyText.textContent = "Link copied";
      setTimeout(function () { copyText.textContent = "Copy link"; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).then(done, done);
    else done();
  });

  // ── Boot ──────────────────────────────────────────────────
  function getJSON(path) {
    return fetch(path).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  var startKey = new URLSearchParams(window.location.search).get("topic") || "all";
  Promise.all([
    WRMP.loadData({ stations: true }),
    getJSON("assets/map-data/smfs-stations.json"),
    getJSON("assets/map-data/noaa-tide-gauges.json"),
    getJSON("assets/map-data/usgs-wq-sites.json")
  ]).then(function (r) {
    data.stations = r[0].stations.filter(function (s) { return typeof s.lat === "number" && typeof s.lon === "number"; });
    data.smfs = r[1] || [];
    data.gauges = r[2] || [];
    data.usgs = (r[3] || []).filter(function (u) { return u.type === "ES"; });
    setTopic(startKey, false);
    map.invalidateSize();
    // Heavier context layers arrive after the map is usable.
    Promise.all([getJSON("assets/map-data/bay-trail.geojson"), getJSON("assets/map-data/baylands-habitat.geojson")]).then(function (h) {
      data.trail = h[0];
      data.habitat = h[1];
      active.forEach(function (def) {
        if (def.kind === "lines" || def.kind === "polygons") sync(def);
      });
      renderPanel();
      renderLegend();
    });
  });
})();
