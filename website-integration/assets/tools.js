/* ════════════════════════════════════════════════════════════
   WRMP.org — Tools index
   ───────────────────────────────────────────────────────────
   Two things live here.

   1. TOOLS — the record set. One object per tool, shaped as the
      WordPress custom post type would be: a title, a post body of
      one sentence, and five taxonomy / meta fields (family, type,
      topics, questions, host). Nothing on the page is invented outside this
      array, and nothing in the array is invented outside wrmp.org
      and the sites it links to.

   2. The renderer — builds the grouped index table from that array
      and narrows it with the three filter-bar controls: a keyword
      field, the Topic <select> the Metrics page uses, and the
      management-question listbox the Exhibits page uses. All three
      combine.

   The `questions` codes are a first pass, assigned here from each
   tool's subject against the question text. They are the field SFEI
   should review, which is why every row also prints its codes as
   chips: the tagging is reviewable on the page, not just filterable.
   Everything else came off wrmp.org.
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
    questions: ["1A", "3A", "4B"],
    host: "wrmp.org",
    url: "https://www.wrmp.org/monitoring-site-network/",
    desc: "Every WRMP monitoring site in the estuary, grouped by site type, monitoring zone, or survey."
  },
  {
    id: "set-water-level-station-map",
    name: "Interactive Surface Elevation Table and Water Level Station Map",
    family: "maps",
    type: "Web map",
    topics: ["Wetlands & Sea Level Rise"],
    questions: ["2A"],
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
    questions: ["1A", "3A"],
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
    questions: ["1A"],
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
    questions: ["1A", "3A"],
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
    questions: ["1A"],
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
    questions: ["3B"],
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
    questions: ["3B", "5C"],
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
    questions: ["2A", "3B"],
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
    questions: ["5C"],
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
    questions: ["5C"],
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
    questions: ["1B"],
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
    questions: ["1A", "2A", "3A"],
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
    questions: ["1A", "3A"],
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
    questions: ["1A", "1B", "2A", "3A", "4A"],
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
    questions: ["3A"],
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
    questions: ["1A", "3A"],
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
    questions: ["5C"],
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
    questions: ["2A", "3B"],
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
    questions: ["1B", "4A", "4B"],
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
    questions: ["1B"],
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
    questions: ["4A", "4B"],
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
    questions: ["1B", "4A", "4B"],
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
    questions: ["1B", "2B"],
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
    questions: ["1A", "1B", "2A", "3A", "4A"],
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
    questions: ["1A", "1B", "2A", "3A", "4A"],
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
    questions: ["1A"],
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
    questions: ["1A"],
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
    questions: ["1A", "3A"],
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
    questions: ["5C"],
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
    questions: [],
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
    questions: ["1A", "2A", "3A"],
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
    questions: ["1A", "2A"],
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
    questions: ["1A"],
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
    questions: ["1A"],
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
    questions: ["1A"],
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
    questions: ["3A"],
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
    questions: [],
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
    questions: [],
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
    questions: ["2A", "3B"],
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
    questions: ["1A", "4A"],
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
    questions: ["1A", "1B"],
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
    questions: ["3A"],
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
    questions: ["3A"],
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

/* ═════════════════════════════════════════════════════════════
   2. The index
   ═════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var table = document.getElementById("tool-index");
  var select = document.getElementById("topic-select");
  var keywordEl = document.getElementById("keyword-input");
  var mqMount = document.getElementById("mq-filter");
  var emptyEl = document.getElementById("index-empty");
  if (!table || !select || !keywordEl) return;

  // The management-question vocabulary is the exhibits plugin's
  // taxonomy, read from the same file the Exhibits gallery reads.
  var TAXONOMY_URL = "../data/exhibits.json";
  var FRAMEWORK_PAGE = "science-framework.html";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var ARROW = ["M7 7h10v10", "M7 17 17 7"]; // leaves-the-site glyph

  var activeTopic = ""; // "" = every topic
  var activeMq = ""; // "" = every management question
  var keyword = ""; // "" = no keyword

  var mqText = {};
  var mqTextShort = {};
  var mqTrigger = null;
  var mqValue = null;
  var mqDot = null;
  var mqList = null;
  var mqOptions = [];

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function svgPaths(className, ds) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", className);
    ds.forEach(function (d) {
      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  /* ── Filtering ─────────────────────────────────────────────
     The three controls narrow the same set: a record has to clear
     all of them to stay on the page. */
  function matchesTopic(tool) {
    if (!activeTopic) return true;
    if (tool.topics === "all") return true;
    return tool.topics.indexOf(activeTopic) !== -1;
  }

  function matchesMq(tool) {
    if (!activeMq) return true;
    return tool.questions.indexOf(activeMq) !== -1;
  }

  function matchesKeyword(tool) {
    if (!keyword) return true;
    return (
      tool.name.toLowerCase().indexOf(keyword) !== -1 ||
      tool.desc.toLowerCase().indexOf(keyword) !== -1
    );
  }

  function matchesFilter(tool) {
    return matchesTopic(tool) && matchesMq(tool) && matchesKeyword(tool);
  }

  function topicText(tool) {
    return tool.topics === "all" ? "All topics" : tool.topics.join(", ");
  }

  /* ── The table ─────────────────────────────────────────────── */
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
      link.appendChild(svgPaths("tool-index__external", ARROW));
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
    questionCell(tr, tool);
    cell(tr, "Where", "tool-index__host").textContent = tool.host;

    return tr;
  }

  // Science-Framework codes, as the chip the metric dialog and the
  // exhibit posters carry: colour from the leading guiding-question
  // digit, link to the question on the framework page, full wording
  // from sf-popover.js on hover or focus. The title is the popover's
  // preferred text source; before the taxonomy lands it is absent and
  // the popover falls back to its own fetch, so a chip is never mute.
  function questionCell(tr, tool) {
    var td = cell(tr, "Questions", "tool-index__questions");
    var codes = tool.questions || [];
    if (!codes.length) {
      // Untagged records show nothing here. On a phone the cell would
      // otherwise print a bare "Questions" label with no value.
      td.classList.add("is-empty");
      return td;
    }
    var wrap = el("div", "exhibit-tags");
    codes.forEach(function (code) {
      var chip = el("a", "exhibit-tag");
      chip.setAttribute("data-gq", code.charAt(0));
      chip.href = FRAMEWORK_PAGE + "#mq-" + code;
      if (mqText[code]) chip.setAttribute("title", mqText[code]);
      chip.textContent = code;
      wrap.appendChild(chip);
    });
    td.appendChild(wrap);
    return td;
  }

  function groupRow(label, n) {
    var tr = document.createElement("tr");
    tr.className = "tool-index__group";
    var th = document.createElement("th");
    th.setAttribute("colspan", "5");
    th.setAttribute("scope", "colgroup");

    var mark = el("span", "tool-mark");
    mark.setAttribute("aria-hidden", "true");
    var name = el("span", "tool-index__group-name");
    name.textContent = label;
    var count = el("span", "tool-index__group-count");
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

    var shown = 0;
    FAMILIES.forEach(function (family) {
      var rows = TOOLS.filter(function (tool) {
        return tool.family === family.key && matchesFilter(tool);
      });
      if (!rows.length) return;
      shown += rows.length;

      var tbody = document.createElement("tbody");
      tbody.appendChild(groupRow(family.label, rows.length));
      rows.forEach(function (tool) {
        tbody.appendChild(recordRow(tool));
      });
      table.appendChild(tbody);
    });

    // With nothing left the column headers would stand over an empty
    // page, so the table steps aside for the empty message.
    table.hidden = shown === 0;
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  /* ── Topic <select> ────────────────────────────────────────
     The seven topics come from the same vocabulary the records are
     tagged with, so the control can never offer a value no record
     carries. "All topics" is already in the markup. */
  function fillSelect() {
    TOPICS.forEach(function (topic) {
      var option = document.createElement("option");
      option.value = topic;
      option.textContent = topic;
      select.appendChild(option);
    });
  }

  /* ── Management-question listbox ───────────────────────────
     A native <option> cannot carry the science-framework dot beside
     a code, so this is the button + role="listbox" pair the Exhibits
     gallery uses, built from the same taxonomy and wearing the same
     .mq-select classes. */
  function makeMqOption(code, codeLabel, textLabel, fullText) {
    var li = el("li", "mq-select__option");
    li.setAttribute("role", "option");
    li.setAttribute("data-mq", code);
    li.setAttribute("tabindex", "-1");
    if (fullText) li.setAttribute("title", fullText);

    var dot = el("span", "mq-select__dot" + (code ? "" : " mq-select__dot--all"));
    if (code) dot.style.background = "var(--q" + code.charAt(0) + "-mq)";
    var codeEl = el("span", "mq-select__opt-code");
    codeEl.textContent = codeLabel;
    var textEl = el("span", "mq-select__opt-text");
    textEl.textContent = textLabel;

    li.appendChild(dot);
    li.appendChild(codeEl);
    li.appendChild(textEl);
    li.addEventListener("click", function () {
      selectMq(code);
      closeMqList(true);
    });
    mqOptions.push({ code: code, li: li });
    return li;
  }

  function selectMq(code) {
    activeMq = code;
    mqOptions.forEach(function (option) {
      option.li.classList.toggle("is-selected", option.code === code);
      option.li.setAttribute("aria-selected", option.code === code ? "true" : "false");
    });
    if (code) {
      mqValue.textContent = code + " " + (mqTextShort[code] || mqText[code] || "");
      mqDot.style.background = "var(--q" + code.charAt(0) + "-mq)";
      mqDot.classList.remove("mq-select__dot--all");
    } else {
      mqValue.textContent = "All management questions";
      mqDot.style.background = "";
      mqDot.classList.add("mq-select__dot--all");
    }
    renderIndex();
  }

  function focusMqOption(i) {
    if (i < 0) i = mqOptions.length - 1;
    if (i >= mqOptions.length) i = 0;
    mqOptions[i].li.focus();
  }

  function mqIndex() {
    for (var i = 0; i < mqOptions.length; i++) {
      if (mqOptions[i].li === document.activeElement) return i;
    }
    return -1;
  }

  function openMqList() {
    mqList.hidden = false;
    mqTrigger.setAttribute("aria-expanded", "true");
    var sel = 0;
    for (var i = 0; i < mqOptions.length; i++) {
      if (mqOptions[i].code === activeMq) {
        sel = i;
        break;
      }
    }
    focusMqOption(sel);
  }

  function closeMqList(returnFocus) {
    if (mqList.hidden) return;
    mqList.hidden = true;
    mqTrigger.setAttribute("aria-expanded", "false");
    if (returnFocus) mqTrigger.focus();
  }

  function onMqKeydown(e) {
    var i = mqIndex();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusMqOption(i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusMqOption(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusMqOption(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusMqOption(mqOptions.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (i >= 0) {
        selectMq(mqOptions[i].code);
        closeMqList(true);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMqList(true);
    } else if (e.key === "Tab") {
      closeMqList(false);
    }
  }

  function buildMqDropdown(codes) {
    var wrap = el("div", "mq-select");

    mqTrigger = el("button", "mq-select__trigger");
    mqTrigger.type = "button";
    mqTrigger.setAttribute("aria-haspopup", "listbox");
    mqTrigger.setAttribute("aria-expanded", "false");
    mqTrigger.setAttribute("aria-labelledby", "mq-label");
    mqDot = el("span", "mq-select__dot mq-select__dot--all");
    mqValue = el("span", "mq-select__value");
    mqValue.textContent = "All management questions";
    mqTrigger.appendChild(mqDot);
    mqTrigger.appendChild(mqValue);
    mqTrigger.appendChild(svgPaths("mq-select__chevron", ["m6 9 6 6 6-6"]));

    mqList = el("ul", "mq-select__list");
    mqList.setAttribute("role", "listbox");
    mqList.setAttribute("aria-label", "Management question");
    mqList.hidden = true;
    mqList.appendChild(makeMqOption("", "All", "management questions"));
    codes.forEach(function (code) {
      // Code + a short label, as the metric dialog lists them; the
      // full question text stays on hover.
      mqList.appendChild(
        makeMqOption(code, code, mqTextShort[code] || mqText[code] || "", mqText[code] || "")
      );
    });

    mqTrigger.addEventListener("click", function () {
      if (mqList.hidden) openMqList();
      else closeMqList(true);
    });
    mqTrigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMqList();
      }
    });
    mqList.addEventListener("keydown", onMqKeydown);

    wrap.appendChild(mqTrigger);
    wrap.appendChild(mqList);
    mqMount.appendChild(wrap);

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) closeMqList(false);
    });
  }

  /* ── Wiring ────────────────────────────────────────────────── */
  keywordEl.addEventListener("input", function () {
    keyword = keywordEl.value.trim().toLowerCase();
    renderIndex();
  });

  select.addEventListener("change", function () {
    activeTopic = select.value;
    renderIndex();
  });

  fillSelect();
  renderIndex();

  if (mqMount) {
    fetch(TAXONOMY_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var tax = data.taxonomy || {};
        mqText = tax.managementQuestions || {};
        mqTextShort = tax.managementQuestionsShort || {};
        // The control lists every question, not only those a tool
        // carries today; picking an empty one shows the empty state.
        buildMqDropdown(Object.keys(mqText).sort());
        // The first render ran before this resolved, so its chips
        // carry no question text. Rebuild the rows now they can.
        renderIndex();
      })
      .catch(function (err) {
        // Without the taxonomy the control has no vocabulary. Drop
        // the group rather than show a dropdown of codes.
        var group = mqMount.closest(".filter-group");
        // .filter-group sets display:flex, which outranks the UA
        // [hidden] rule — take it out of layout directly.
        if (group) group.style.display = "none";
        if (window.console) console.error("Management questions: " + err.message);
      });
  }
})();
