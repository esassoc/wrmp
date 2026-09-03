/* ════════════════════════════════════════════════════════════
   WRMP.org — Tools index
   ────────────────────────────────────────────────────────────
   Two things live here.

   1. TOOLS — the record set. One object per tool, shaped as the
      WordPress custom post type would be: a title, a post body of
      one sentence, and four taxonomy / meta fields (family, type,
      topics, host). Nothing on the page is invented outside this
      array, and nothing in the array is invented outside wrmp.org
      and the sites it links to.

   2. The renderer — builds the grouped index table and the topic
      filter from that array, and runs the one record flagged
      `featured` as a live Leaflet map at the top of the page.

   The map's three groupings and its ?topic= parameter are carried
   over unchanged; the topic pages' map badges link to
   tools.html?topic={slug}#map.
   ════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   1. The record set
   ══════════════════════════════════════════════════════════════
   family — the index section a record files under. Five values,
            in the display order set by FAMILIES below.
   type   — the record's own content type; finer than the family,
            and what the chip on each row shows.
   topics — WRMP monitoring topics the tool serves. The string
            "all" means the tool is not topic-specific and stays
            visible under every topic filter.
   host   — the domain the tool actually runs on. Anything other
            than wrmp.org leaves the site.
   ══════════════════════════════════════════════════════════════ */
var TOOLS = [
  /* ── Maps and visualizations ──────────────────────────────── */
  {
    id: "monitoring-site-network-map",
    name: "Monitoring Site Network Map",
    family: "maps",
    type: "Web map",
    topics: ["Baylands Geography", "Fish & Wildlife"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/monitoring-site-network/",
    desc: "Every WRMP monitoring site in the estuary, grouped by site type, monitoring zone, or survey.",
    featured: true
  },
  {
    id: "set-water-level-station-map",
    name: "Interactive Surface Elevation Table and Water Level Station Map",
    family: "maps",
    type: "Web map",
    topics: ["Wetlands & Sea Level Rise"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/interactive-set-and-water-level-station-map",
    desc: "Every SET and water level monitoring station in the estuary, on one interactive map."
  },
  {
    id: "ecoatlas-bhm-2020",
    name: "EcoAtlas Baylands Habitat Map 2020",
    family: "maps",
    type: "Web map",
    topics: ["Baylands Geography", "Wetland Condition"],
    host: "ecoatlas.org",
    url: "http://sfei.li/ecoatlas-bhm",
    desc: "The Baylands Habitat Map 2020 displayed alongside restoration efforts and wetland condition assessments."
  },
  {
    id: "baylands-habitat-map-2020-gis",
    name: "Baylands Habitat Map 2020 GIS data",
    family: "maps",
    type: "Dataset",
    topics: ["Baylands Geography"],
    host: "sfei.org",
    url: "https://www.sfei.org/data/baylands-habitat-map-2020-gis-data",
    desc: "Habitats within the lower San Francisco Estuary as of 2020, as downloadable GIS layers."
  },
  {
    id: "pttwrm",
    name: "Project Tracker Tidal Wetland Restoration Map",
    family: "maps",
    type: "Map download",
    topics: ["Baylands Geography"],
    host: "sfei.org",
    url: "https://www.sfei.org/pttwrm",
    desc: "Static, citable maps of every tidal wetland restoration site boundary for 2020 and 2024."
  },
  {
    id: "historical-modern-tidal-wetlands",
    name: "Historical and Modern Tidal Wetlands",
    family: "maps",
    type: "Map download",
    topics: ["Baylands Geography", "People & Wetlands"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/wp-content/uploads/2025/11/Historical-and-Modern-tidal-wetland-comparisons_v7_high-res-for-printing.pdf",
    desc: "Printable handout pairing the mid-1800s distribution of tidal wetlands with the 2020 distribution. Also published in Spanish."
  },
  {
    id: "sapmap",
    name: "Shoreline Adaptation Project Map (SAPMap)",
    family: "maps",
    type: "Web map",
    topics: ["People & Wetlands", "Wetlands & Sea Level Rise"],
    host: "ecoatlas.org",
    url: "https://www.ecoatlas.org/regions/group/303",
    desc: "Tracks shoreline adaptation projects across the region and progress toward resilience goals."
  },
  {
    id: "rsap-atlas",
    name: "Regional Shoreline Adaptation Plan Atlas (RSAP)",
    family: "maps",
    type: "Web map",
    topics: ["Wetlands & Sea Level Rise", "People & Wetlands"],
    host: "bcdc.ca.gov",
    url: "https://rsap-atlas.bcdc.ca.gov/",
    desc: "Shows how sea level rise might affect particular Bay Area communities."
  },
  {
    id: "baylands-resilience-map",
    name: "Baylands Resilience Metrics map",
    family: "maps",
    type: "Web map",
    topics: ["Wetlands & Sea Level Rise"],
    host: "arcgis.com",
    url: "https://experience.arcgis.com/experience/f1af3c0b094d421a8e37a547894fe7aa",
    desc: "The Baylands Resilience Metrics explored online, from the Baylands Resilience Framework."
  },
  {
    id: "ocof-flood-mapper",
    name: "Our Coast, Our Future flood mapper",
    family: "maps",
    type: "Web map",
    topics: ["Wetlands & Sea Level Rise"],
    host: "ourcoastourfuture.org",
    url: "https://ourcoastourfuture.org/",
    desc: "California flood mapper for viewing and downloading Coastal Storm Modeling System results."
  },
  {
    id: "storymap-flood-risk",
    name: "Wetlands and Flood Risk Reduction",
    family: "maps",
    type: "StoryMap",
    topics: ["Wetlands & Sea Level Rise", "People & Wetlands"],
    host: "arcgis.com",
    url: "https://storymaps.arcgis.com/stories/4ebfe02824c04de089f63cf7b9c44da4",
    desc: "Bilingual story on how wetland restoration reduces coastal hazards and improves community resilience."
  },
  {
    id: "storymap-pcbs",
    name: "Wetlands, Water Quality, and PCBs in San Francisco Bay",
    family: "maps",
    type: "StoryMap",
    topics: ["Water Quality"],
    host: "arcgis.com",
    url: "https://storymaps.arcgis.com/stories/170d8cad456d4ca289f25a496ac0b83e",
    desc: "Visualizes the distribution of contamination and environmental quality in wetlands around the Bay."
  },

  /* ── Data tools and catalogs ──────────────────────────────── */
  {
    id: "ecoatlas-wrmp-profile",
    name: "EcoAtlas WRMP Profile tool",
    family: "data",
    type: "Web tool",
    topics: ["Baylands Geography", "Wetland Condition", "Wetlands & Sea Level Rise"],
    host: "ecoatlas.org",
    url: "http://sfei.li/wrmp-lp",
    desc: "Tidal wetland extent, restoration status, unvegetated to vegetated ratio and elevation capital, summarized for any area you draw."
  },
  {
    id: "ecoatlas-sfbra-dashboard",
    name: "EcoAtlas SFBRA Dashboard",
    family: "data",
    type: "Dashboard",
    topics: ["Baylands Geography", "Wetland Condition"],
    host: "ecoatlas.org",
    url: "https://www.ecoatlas.org/dashboard/sfbraDashboard.php",
    desc: "Summarized metrics tracking restoration trajectories in San Francisco Bay Restoration Authority projects and other restoration sites."
  },
  {
    id: "wrmp-data-catalog",
    name: "WRMP Data Catalog",
    family: "data",
    type: "Data catalog",
    topics: "all",
    host: "data.wrmp.org",
    url: "https://data.wrmp.org/",
    desc: "Estuary tidal wetland data, filtered by subregion, topic, source, WRMP indicator, or location."
  },
  {
    id: "wrmp-data-upload",
    name: "WRMP Data Catalog Upload Tool",
    family: "data",
    type: "Upload tool",
    topics: "all",
    host: "dataupload.org",
    url: "https://www.dataupload.org/",
    desc: "Submit validated estuary tidal wetland data and its metadata to the catalog."
  },
  {
    id: "ecoatlas",
    name: "EcoAtlas",
    family: "data",
    type: "Web tool",
    topics: "all",
    host: "ecoatlas.org",
    url: "https://www.ecoatlas.org/",
    desc: "California's aquatic resources: natural and built environment, restoration information, and monitoring results."
  },
  {
    id: "cosmos",
    name: "Coastal Storm Modeling System (CoSMoS)",
    family: "data",
    type: "Model",
    topics: ["Wetlands & Sea Level Rise"],
    host: "usgs.gov",
    url: "https://www.usgs.gov/centers/pcmsc/science/coastal-storm-modeling-system-cosmos",
    desc: "USGS model of tides, waves and storm surge under a range of storm and sea level rise scenarios."
  },
  {
    id: "baylands-resilience-data",
    name: "Baylands Resilience Metrics data",
    family: "data",
    type: "Dataset",
    topics: ["Wetlands & Sea Level Rise"],
    host: "sfei.org",
    url: "https://www.sfei.org/data/baylands-resilience-metrics",
    desc: "Download the GIS data behind the Baylands Resilience Framework."
  },
  {
    id: "bay-delta-live",
    name: "Bay Delta Live",
    family: "data",
    type: "Data portal",
    topics: ["Water Quality", "Fish & Wildlife"],
    host: "baydeltalive.com",
    url: "https://www.baydeltalive.com/home/new-homepage",
    desc: "Delta monitoring data from the Interagency Ecological Program and partner agencies."
  },
  {
    id: "cdec",
    name: "California Data Exchange Center",
    family: "data",
    type: "Data portal",
    topics: ["Water Quality"],
    host: "cdec.water.ca.gov",
    url: "https://cdec.water.ca.gov/",
    desc: "Department of Water Resources station data for water conditions across the state."
  },
  {
    id: "edi",
    name: "Environmental Data Initiative",
    family: "data",
    type: "Data portal",
    topics: ["Water Quality", "Fish & Wildlife"],
    host: "edirepository.org",
    url: "https://edirepository.org/",
    desc: "Archive for ecological datasets, including Delta studies from the Interagency Ecological Program."
  },
  {
    id: "iep-survey-data",
    name: "IEP Survey Data",
    family: "data",
    type: "Data portal",
    topics: ["Fish & Wildlife", "Water Quality"],
    host: "iep.ca.gov",
    url: "https://iep.ca.gov/Data/IEP-Survey-Data",
    desc: "Survey data from the Interagency Ecological Program's multi-disciplinary Delta studies."
  },
  {
    id: "usgs-ca-water",
    name: "USGS California Water Science Center data",
    family: "data",
    type: "Data portal",
    topics: ["Water Quality", "Fish & Wildlife"],
    host: "usgs.gov",
    url: "https://www.usgs.gov/centers/california-water-science-center/data",
    desc: "Data and publications from USGS research in the Bay and the Delta."
  },

  /* ── Documents and reports ────────────────────────────────── */
  {
    id: "technical-documents",
    name: "Technical Documents and Report Summaries",
    family: "documents",
    type: "Document library",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/technical-documents-and-report-summaries/",
    desc: "Every WRMP technical document and report summary reporting the Program's monitoring results."
  },
  {
    id: "annual-report-2026",
    name: "Tidal Wetland Indicators and Insights 2026",
    family: "documents",
    type: "Document",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/annual-report-2026",
    desc: "The Program's annual report, released August 2026."
  },
  {
    id: "cram-condition-2024",
    name: "2024 Wetland Condition Survey Report",
    family: "documents",
    type: "Document",
    topics: ["Wetland Condition"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/wp-content/uploads/2025/09/2024_WRMP_CRAM_Condition_Report_Final_ADA.pdf",
    desc: "Wetland condition assessed with the California Rapid Assessment Method, released May 2025."
  },
  {
    id: "tidal-extent-2020",
    name: "Tracking Tidal Wetland Extent in San Francisco Bay",
    family: "documents",
    type: "Document",
    topics: ["Baylands Geography"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/wp-content/uploads/2025/09/WRMP-Tidal-Extent-Report_Final_Apr10_2025.pdf",
    desc: "The 2020 tidal wetland mapping update, released April 2025."
  },
  {
    id: "restoration-map-update-plan",
    name: "Restoration Map Annual Update Plan",
    family: "documents",
    type: "Document",
    topics: ["Baylands Geography"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/wp-content/uploads/2025/09/RestorationMap_AnnualUpdatePlan_2025_Final_Formatted_ADA.pdf",
    desc: "How the San Francisco Estuary Project Tracker restoration map is updated each year."
  },
  {
    id: "tidal-wetlands-101",
    name: "Tidal Wetlands 101",
    family: "documents",
    type: "Document",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/wrmp-resources/tidal-wetlands-101/",
    desc: "What tidal wetlands are, what they do for the region, and where to read further."
  },
  {
    id: "data-sharing-policy",
    name: "WRMP Data Sharing Policy",
    family: "documents",
    type: "Document",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/wrmp_data-sharing_policy/",
    desc: "Direction for sharing data, in alignment with the WRMP Program Plan."
  },

  /* ── Webinars and videos ──────────────────────────────────── */
  {
    id: "webinars-library",
    name: "Webinars & Videos",
    family: "video",
    type: "Video library",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/webinars/",
    desc: "Every WRMP webinar and video recording."
  },
  {
    id: "lidar-webinar",
    name: "San Francisco Bay-Delta Estuary 2025 Lidar Collaboration Webinar",
    family: "video",
    type: "Video",
    topics: ["Baylands Geography", "Wetlands & Sea Level Rise"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/lidar-webinar/",
    desc: "The first estuary-wide lidar survey of the San Francisco Bay-Delta."
  },
  {
    id: "lp-tool-webinar",
    name: "Accessing WRMP Geospatial Results Through the Landscape Profile Tool in EcoAtlas",
    family: "video",
    type: "Video",
    topics: ["Baylands Geography"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/ecoatlas-wrmp-lp-tool-webinar/",
    desc: "How to reach WRMP geospatial results through the Landscape Profile tool in EcoAtlas."
  },
  {
    id: "tidal-marsh-extent-webinar",
    name: "Tidal Marsh Extent Webinar",
    family: "video",
    type: "Video",
    topics: ["Baylands Geography"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/4505-2/",
    desc: "How the Program answered its tidal marsh extent question, from April 2025."
  },
  {
    id: "bhm-2020-webinar",
    name: "Introducing the Baylands Habitat Map 2020, Part 1",
    family: "video",
    type: "Video",
    topics: ["Baylands Geography"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/introducing-the-baylands-habitat-map-2020-part-1/",
    desc: "The first session introducing the Baylands Habitat Map 2020."
  },
  {
    id: "sbsp-lunch-and-learn",
    name: "South Bay Salt Pond Restoration Project Lunch and Learn on the WRMP",
    family: "video",
    type: "Video",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/south-bay-salt-pond-restoration-project-lunch-and-learn-on-the-wrmp/",
    desc: "How wetland managers across the Bay Area are collaborating to conduct monitoring."
  },

  /* ── Programs and organizations ───────────────────────────── */
  {
    id: "regional-partner-organizations",
    name: "Regional Partner Organizations",
    family: "programs",
    type: "Directory",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/wrmp-resources/regional-partner-organizations/",
    desc: "The Program's administrating entities and the regional organizations working alongside it."
  },
  {
    id: "other-ca-programs",
    name: "Other California Wetland Monitoring Programs",
    family: "programs",
    type: "Directory",
    topics: "all",
    host: "wrmp.org",
    url: "https://www.wrmp.org/wrmp-resources/other-california-wetland-monitoring-programs/",
    desc: "Statewide monitoring programs and workgroups the WRMP coordinates with."
  },
  {
    id: "baylands-resilience-framework",
    name: "Baylands Resilience Framework",
    family: "programs",
    type: "Program",
    topics: ["Wetlands & Sea Level Rise"],
    host: "sfei.org",
    url: "https://www.sfei.org/projects/baylands-resilience-framework",
    desc: "Quantitative data identifying where adaptation and restoration can increase baylands resilience to sea level rise."
  },
  {
    id: "empa",
    name: "California Estuary Marine Protected Area Monitoring Program",
    family: "programs",
    type: "Program",
    topics: ["Wetland Condition", "Water Quality"],
    host: "sccwrp.org",
    url: "https://empa.sccwrp.org/",
    desc: "Assesses the health of California estuaries inside marine protected areas."
  },
  {
    id: "nwca",
    name: "EPA National Wetland Condition Assessment",
    family: "programs",
    type: "Program",
    topics: ["Wetland Condition"],
    host: "epa.gov",
    url: "https://www.epa.gov/national-aquatic-resource-surveys/nwca",
    desc: "National survey of the chemical, physical and biological properties of the nation's wetlands."
  },
  {
    id: "cwmw",
    name: "California Wetland Monitoring Workgroup",
    family: "programs",
    type: "Program",
    topics: ["Wetland Condition"],
    host: "mywaterquality.ca.gov",
    url: "https://mywaterquality.ca.gov/wetland-monitoring/",
    desc: "Coordinates California agencies, Tribes and NGOs to improve wetland and riparian monitoring."
  },
  {
    id: "cemw",
    name: "California Estuarine Monitoring Workgroup",
    family: "programs",
    type: "Program",
    topics: ["Water Quality", "Wetland Condition"],
    host: "mywaterquality.ca.gov",
    url: "https://mywaterquality.ca.gov/estuary-monitoring/",
    desc: "Improves estuary monitoring and coordination with local communities, Tribal Nations and the public."
  }
];

/* The five index sections, in display order. */
var FAMILIES = [
  { key: "maps", label: "Maps and visualizations" },
  { key: "data", label: "Data tools and catalogs" },
  { key: "documents", label: "Documents and reports" },
  { key: "video", label: "Webinars and videos" },
  { key: "programs", label: "Programs and organizations" }
];

/* The site's seven monitoring topics, in the order the Monitoring
   Results menu lists them. */
var TOPICS = [
  "Baylands Geography",
  "Wetlands & Sea Level Rise",
  "Wetland Condition",
  "Water Quality",
  "Fish & Wildlife",
  "Plant Communities",
  "People & Wetlands"
];

/* ══════════════════════════════════════════════════════════════
   2. The index
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var table = document.getElementById("tool-index");
  var filterEl = document.getElementById("topic-filter");
  var countEl = document.getElementById("tool-count");
  if (!table || !filterEl || !countEl) return;

  var SVG_NS = "http://www.w3.org/2000/svg";
  var ARROW = ["M7 7h10v10", "M7 17 17 7"]; // leaves-the-site glyph
  var FEATURED_COUNT = TOOLS.filter(function (t) {
    return t.featured;
  }).length;
  var activeTopic = null; // null = every topic

  function externalGlyph() {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "tool-index__external");
    ARROW.forEach(function (d) {
      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function matchesFilter(tool) {
    if (!activeTopic) return true;
    if (tool.topics === "all") return true;
    return tool.topics.indexOf(activeTopic) !== -1;
  }

  function topicText(tool) {
    return tool.topics === "all" ? "All topics" : tool.topics.join(", ");
  }

  function cell(row, label, className) {
    var td = document.createElement("td");
    td.setAttribute("data-label", label);
    if (className) td.className = className;
    row.appendChild(td);
    return td;
  }

  function recordRow(tool) {
    var tr = document.createElement("tr");

    var nameCell = cell(tr, "Tool", "tool-index__tool");
    var link = document.createElement("a");
    link.className = "tool-index__name";
    link.href = tool.url;
    link.textContent = tool.name;
    if (tool.host !== "wrmp.org") {
      link.rel = "noopener";
      link.target = "_blank";
      link.appendChild(externalGlyph());
    }
    var desc = document.createElement("span");
    desc.className = "tool-index__desc";
    desc.textContent = tool.desc;
    nameCell.appendChild(link);
    nameCell.appendChild(desc);

    var typeCell = cell(tr, "Type");
    var chip = document.createElement("span");
    chip.className = "type-chip";
    chip.textContent = tool.type;
    typeCell.appendChild(chip);

    cell(tr, "Topics", "tool-index__topics").textContent = topicText(tool);
    cell(tr, "Where", "tool-index__host").textContent = tool.host;

    return tr;
  }

  function groupRow(label, n) {
    var tr = document.createElement("tr");
    tr.className = "tool-index__group";
    var th = document.createElement("th");
    th.setAttribute("colspan", "4");
    th.setAttribute("scope", "colgroup");

    var mark = document.createElement("span");
    mark.className = "tool-mark";
    mark.setAttribute("aria-hidden", "true");
    var name = document.createElement("span");
    name.className = "tool-index__group-name";
    name.textContent = label;
    var count = document.createElement("span");
    count.className = "tool-index__group-count";
    count.textContent = String(n);

    th.appendChild(mark);
    th.appendChild(name);
    th.appendChild(count);
    tr.appendChild(th);
    return tr;
  }

  function renderIndex() {
    Array.prototype.slice
      .call(table.querySelectorAll("tbody"))
      .forEach(function (tbody) {
        tbody.remove();
      });

    var total = 0;
    FAMILIES.forEach(function (family) {
      var rows = TOOLS.filter(function (tool) {
        return tool.family === family.key && !tool.featured && matchesFilter(tool);
      });
      total += rows.length;
      if (!rows.length) return;

      var tbody = document.createElement("tbody");
      tbody.appendChild(groupRow(family.label, rows.length));
      rows.forEach(function (tool) {
        tbody.appendChild(recordRow(tool));
      });
      table.appendChild(tbody);
    });

    // The featured record is drawn as the live map above rather
    // than as a row, and it stays on the page under every filter,
    // so it counts toward what this page is showing.
    countEl.textContent = String(total + FEATURED_COUNT);
  }

  function renderFilter() {
    var options = [{ value: null, label: "All topics" }].concat(
      TOPICS.map(function (t) {
        return { value: t, label: t };
      })
    );
    options.forEach(function (option) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "topic-filter-chip";
      btn.textContent = option.label;
      btn.setAttribute("aria-pressed", option.value === activeTopic ? "true" : "false");
      btn.addEventListener("click", function () {
        activeTopic = option.value;
        Array.prototype.forEach.call(filterEl.children, function (other) {
          other.setAttribute("aria-pressed", other === btn ? "true" : "false");
        });
        renderIndex();
      });
      filterEl.appendChild(btn);
    });
  }

  renderFilter();
  renderIndex();
})();

/* ══════════════════════════════════════════════════════════════
   3. The featured tool — the Monitoring Site Network Map
   ══════════════════════════════════════════════════════════════
   One Leaflet map over data/stations.json (119 sites). Three
   groupings — monitoring zone, site type, survey — each with its
   own layer set, and a ?topic= parameter that lands the map with
   one topic's layers already selected. That parameter is what a
   topic page's map badge links to.

   Colors, popup fields and the site-type palette are inherited
   from exhibits/2026-04-03-station-map-stepper so the same data
   reads the same way wherever it is drawn.
   ══════════════════════════════════════════════════════════════ */
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
  // already on. Topics whose layers are not yet mapped have no
  // preset here, so the map lands on its default.
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

  // initMap attaches the shared WRMP basemap (WRMP.addBasemap in
  // shared/js/map-init.js), so there is nothing to swap here.
  var map = WRMP.initMap("tools-map", {});

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
    // The canvas reaches its final height only after layout, so the
    // fit has to be redone once the size is known — otherwise the
    // zoom is set against a stale box and the Bay sits low.
    map.invalidateSize();
    map.fitBounds(BAY_FULL, { padding: [24, 24] });
  });
})();
