# WRMP Data Visualization Project

Interactive "museum exhibit" style visualizations for the Wetland Regional Monitoring Program (wrmp.org), focused on Fish & Fish Habitat (FFH) data from the San Francisco Estuary.

## Project Context

- **Client:** WRMP (Wetland Regional Monitoring Program)
- **PM:** Andrew Lovseth at ESA
- **Timeline:** Phase 3 visualization work through September 2026
- **Website:** wrmp.org (WordPress, Divi theme)
- **Data PI:** Dr. Levi Lewis, UC Davis
- **Key contacts:** Sasha Harris-Lovett, Cristina Grosso, Tony Hale, Karen Verpeet

### What We're Building

Interactive exhibit experiences ("natural history museum type exhibitions") that embed into the WRMP WordPress site. Each exhibit is a self-contained HTML/CSS/JS artifact rendered inside a fixed 16:9 frame with a stepper/narrative panel overlaying an interactive background (Leaflet map, video, photo, or gradient).

### Architecture Decision

**HTML/CSS/JS owns the exhibit wrapper. R Shiny is NOT the wrapper.**

- Exhibits are custom HTML with Leaflet maps, narrative panels, and interactive legends
- R produces data widgets (via `htmlwidgets` — plotly, leaflet, DT) that get embedded as components
- If server-side computation is needed later, Shiny serves as a backend API, not a page shell
- Think of it like YouTube embeds: HTML page = the experience, R widgets = embedded interactive elements
- Design system bridges both: CSS tokens that HTML exhibits and R htmlwidgets share

## Exhibits

### Built

| Exhibit | Directory | Steps | Background | Description |
|---------|-----------|-------|------------|-------------|
| **The Bay: Where We're Watching** | `2026-04-03-station-map-stepper/` | 5 | Leaflet map | Station network narrative — regions, networks, site types, planned restoration |
| **Delta Smelt: The Smallest Giant** | `2026-04-10-delta-smelt/` | 6 | Video + map + photo | Species profile with video hero, range map, conservation status |
| **How We Monitor** | `2026-04-10-how-we-look/` | 4 | Photo backgrounds | Sampling gear infographic — otter trawl, beach seine, gill net |
| **Native vs. Invasive** | `2026-04-10-native-vs-invasive/` | 6 | Map + gradient | Species composition timeline, drought regime shift story |
| **Designing the Experiment** | `2026-04-10-restoration-network/` | 5 | Leaflet map | Restoration site network, benchmark vs. project sites |

### Planned (needs catch data from Sasha/Levi)

- **"What Changed"** — Temporal narrative with actual CPUE time series (2010-2024 SBOTS data). The marquee data story: drought regime shift.
- **"Meet the Residents"** — Searchable species catalog, deep dives on featured species (Longfin Smelt, Chinook Salmon, Leopard Shark, Green Crab).

## Project Structure

```
wrmp/
├── CLAUDE.md                          # AI collaborator context (this file)
├── README.md                          # Human collaborator onboarding
├── data/                              # JSON metadata converted from Excel sources
│   ├── stations.json                  # 119 stations with lat/lon, region, network, habitat, site type
│   ├── species.json                   # 237 species with taxonomy, native/invasive status, habitat
│   ├── gear.json                      # 9 sampling gear types with descriptions
│   └── benthos.json                   # 31 substrate/benthos classification types
├── shared/                            # Single source of truth for CSS, JS, images
│   ├── css/
│   │   ├── tokens.css                 # Design tokens (colors, typography, spacing)
│   │   ├── exhibit-frame.css          # Structural CSS (frame, panel, legend, nav, backgrounds)
│   │   └── leaflet-overrides.css      # Popup and control styling
│   ├── js/
│   │   ├── data-loader.js             # WRMP.loadData() — fetch JSON relative to exhibit
│   │   ├── map-init.js                # WRMP.initMap(), flyTo(), makePopup(), addPOI()
│   │   └── stepper.js                 # WRMP.createStepper() — config-driven step navigation
│   └── img/
│       └── wrmp-logo.png              # Nav bar logo
├── exhibits/                          # Date-versioned exhibit prototypes
│   ├── 2026-04-03-station-map-stepper/
│   ├── 2026-04-10-delta-smelt/        # includes delta-smelt.mp4 (2.9 MB)
│   ├── 2026-04-10-how-we-look/        # includes gear photos (~9.6 MB)
│   ├── 2026-04-10-native-vs-invasive/
│   └── 2026-04-10-restoration-network/
├── reference/                         # Branding assets + source data (gitignored)
│   ├── WRMP branding elements/        # Official fonts, color swatches, logos
│   └── WRMP data examples.../         # Source Excel files for JSON conversion
└── design-system/                     # Reserved for formal design system docs
```

### Conventions

- **Exhibit versioning:** `exhibits/YYYY-MM-DD-{slug}/index.html`. New revisions get new dates. Keep old versions as reference.
- **Self-contained exhibits:** Each is a single `index.html` — no build step, all CDN dependencies.
- **Shared assets:** All exhibits load from `../../shared/css/` and `../../shared/js/`. Exhibit-specific CSS goes in `<style>` within the HTML.
- **Media assets:** Large images and video live alongside their exhibit's `index.html`.

## Design System — WRMP Brand

Extracted from wrmp.org. All exhibits must use these tokens.

### Typography

- **Headings:** `Source Serif 4`, weight 400, color `#005E6A`
- **Body:** `Source Sans 3` (fallback: Source Sans Pro, Helvetica, Arial), weight 400
- **Base size:** 16px minimum (ADA requirement)
- Load from Google Fonts: `Source+Sans+3` and `Source+Serif+4`

### Brand Colors

| Token                | Hex       | Usage                                     |
| -------------------- | --------- | ----------------------------------------- |
| `--wrmp-teal`        | `#228B9C` | Primary brand teal                        |
| `--wrmp-ada-teal`    | `#005E6A` | Dark teal (headings, links, ADA contrast) |
| `--wrmp-orange`      | `#E09337` | Accent orange                             |
| `--wrmp-green`       | `#379352` | Heritage green                            |
| `--wrmp-light-green` | `#92BB4D` | Light green accent                        |
| `--wrmp-dark`        | `#4E4E50` | Dark gray (text, UI)                      |

### Map Color Palettes

**Regions:** South Bay `#005E6A`, North Bay `#379352`, Suisun Bay `#E09337`

**Networks (9):** Santa Clara `#005E6A`, Alameda `#228B9C`, Wildcat `#008297`, Novato `#379352`, Napa `#92BB4D`, Suisun `#E09337`, Montezuma `#D4A96A`, Petaluma `#6A9E3A`, Belmont `#6BB5C2`

**Site Types:** Benchmark `#C7D865`, Reference `#005E6A`, Project `#379352`, Other Restored `#6A9E3A`, Planned `#E09337`

### UI Patterns

- **Exhibit frame:** Fixed 16:9 aspect ratio, max-width 1200px, 10px border-radius
- **Story panel:** Inset 16px from frame edges, 12px border-radius, glassmorphism (`backdrop-filter: blur(20px)`, ~8% white opacity), 42% width
- **Map legend:** Floating top-right, glassmorphism chips, clickable to filter/zoom, "All" option resets
- **Navigation:** Apple-style dots (active = wide teal pill 36px, inactive = 8px circle), Back/Next buttons
- **Map offset:** `paddingTopLeft` in Leaflet accounts for panel overlay so stations render in visible area
- **Popups:** DOM-built (no innerHTML), show station code, name, region, network, habitat, site type

## Shared JavaScript API (`WRMP.*`)

All exhibits use the `WRMP` namespace. Scripts must load in this order: `data-loader.js` → `map-init.js` → `stepper.js`.

| Function | Purpose | Example |
|----------|---------|---------|
| `WRMP.loadData({ stations: true })` | Fetch JSON files, returns Promise | `.then(function(data) { data.stations })` |
| `WRMP.initMap("map", { bounds })` | Create Leaflet map with WRMP defaults | `var map = WRMP.initMap("map", { bounds: BAY_FULL })` |
| `WRMP.flyTo(map, bounds, opts)` | Animated pan with panel-aware padding | `WRMP.flyTo(map, SOUTH_BAY)` |
| `WRMP.makePopup(station, fields)` | DOM-built popup (no innerHTML) | `WRMP.makePopup(s, [["Region", "region"]])` |
| `WRMP.addPOI(layer, lat, lon, text)` | Floating non-interactive label | `WRMP.addPOI(poiLayer, 37.5, -122, "Label")` |
| `WRMP.createStepper({ totalSteps, onStepEnter })` | Config-driven step navigation | Returns controller with `goToStep(n)` and `currentStep` |
| `WRMP.getMapPadding()` | Calculate padding for story panel overlay | Used internally by `initMap` and `flyTo` |

### Exhibit HTML Pattern

Every exhibit follows this structure:
1. **Head:** Google Fonts + Leaflet CSS + `shared/css/` (tokens, exhibit-frame, leaflet-overrides)
2. **Body:** `.exhibit-frame` > background layers + `#map` + `.map-legend` + `.story-panel`
3. **Story panel:** `.story-panel-inner` with `.step[data-step="N"]` divs + `.nav-bar` with dots
4. **Scripts:** Leaflet JS + `shared/js/` (data-loader, map-init, stepper) + exhibit-specific `<script>`
5. **Exhibit script:** Config objects, `STEP_DEFS` array, legend builder, render function, stepper init

### Background Layer Types

Exhibits can mix background types per step using `.bg-layer` divs:
- `.bg-video` — fullscreen video with gradient overlay (e.g., delta-smelt)
- `.bg-photo` — CSS background-image with gradient overlay
- `.bg-gradient` — simple CSS gradient
- `.bg-map` — step where the Leaflet map is visible
- Panel switches between light (default) and dark (`.panel-dark`) variants depending on background

## Data Sources

### What We Have (metadata only)

Converted from Excel files provided by Sasha. Source files in `reference/WRMP data examples for visualizations/` (gitignored).

- **Station metadata** → `data/stations.json` (119 records)
- **Species metadata** → `data/species.json` (237 records)
- **Gear metadata** → `data/gear.json` (9 records)
- **Benthos metadata** → `data/benthos.json` (31 records)

### What We Need (data request backlog for Sasha/Levi)

| Priority | Data                                                    | Format    | For Exhibit |
| -------- | ------------------------------------------------------- | --------- | ----------- |
| 1        | Annual CPUE time series by species (SBOTS 2010-2024)    | CSV       | 2, 3        |
| 2        | Species catch by station (WRMP Q2+ 2025)                | CSV       | 1, 3        |
| 3        | Environmental data by station/date (temp, salinity, DO) | CSV       | 1, 2        |
| 4        | Monthly catch summaries                                 | CSV       | 2           |
| 5        | Levi's R visualization code                             | R scripts | All         |
| 6        | Water year type classifications (2010-2024)             | Any       | 2           |
| 7        | Length frequency data by species                        | CSV       | 3           |

### Key Research Documents (in `reference/`, gitignored)

- `SBOTS_Report_2025_v3.pdf` — 14-year Alviso Marsh monitoring report (richest analytical findings)
- `Otter Trawl Sampling Analysis_Alviso Marsh.pdf` — Gear/design pilot study
- `SBOTS_Cluster_Ordinations.docx` — Multivariate community analysis
- `SBSP_Gear_Comparisons.docx` — Gear selectivity study
- `2026 Annual Report Draft Content_Data Highlights.docx` — Annual report template with "by the numbers" metrics
- `TEMPLATE Metric Cards WRMP.docx` — Website metric card format

## Key Ecological Context

The FFH data tells several interconnected stories:

1. **The Estuary Gradient** — Salinity drives everything. Suisun (fresh) → North Bay (brackish) → South Bay (saline). Different water = different species.
2. **The 2014-2015 Drought Shift** — 14 years of SBOTS data show a regime shift. Native species lost dominance to non-natives after the drought. This is the marquee temporal story.
3. **Restoration Works** — Restored tidal ponds at Alviso Marsh support fish communities equivalent to natural sloughs. 15,000-acre South Bay Salt Pond Restoration is the largest in the US.
4. **Seasonal Pulse** — Winter (marine species), spring (recruitment), summer-fall (warmwater). The estuary breathes.
5. **Top 7 species = 90% of catch** — A few dominant taxa drive the system.

## Development

### Running Locally

```bash
python3 -m http.server 8765
# Open http://localhost:8765/exhibits/2026-04-03-station-map-stepper/
```

### Building New Exhibits

Use the `/exhibit` skill if available (scaffolds the full HTML structure). Otherwise:

1. Create `exhibits/YYYY-MM-DD-{slug}/index.html`
2. Copy the HTML skeleton from an existing exhibit (station-map-stepper is the simplest)
3. Load shared CSS/JS from `../../shared/`
4. Load data from `../../data/*.json` via `WRMP.loadData()`
5. Define `STEP_DEFS` array with legend, bounds, and render function per step
6. Init stepper with `WRMP.createStepper({ totalSteps, onStepEnter })`
7. Test with VoiceOver for ADA baseline

### Converting New Data Files

```python
# Excel → JSON conversion pattern (Python 3 + openpyxl)
import openpyxl, json
wb = openpyxl.load_workbook('file.xlsx', read_only=True)
ws = wb[wb.sheetnames[1]]  # data sheet (first is often metadata description)
rows = list(ws.iter_rows(values_only=True))
headers = [str(h).strip() for h in rows[0]]
data = [{h: v for h, v in zip(headers, row)} for row in rows[1:]]
json.dump(data, open('data/output.json', 'w'), indent=2)
```

## Strategic Context (from meeting history)

This section summarizes key decisions from 4 meetings (Sep 2025 – Mar 2026) that shaped the project direction. Full notes live in `~/Dev/andy-work/meetings/`.

### Phase Arc
- **Phase 2** (ended Sep 2025): WordPress site functionality complete, $3k remaining, pivot to UX
- **Phase 3** (Feb–Sep 2026, $50k): Data visualization — the current work. 80% ready-to-go visualizations, 20% conceptual/exploratory
- **Phase 4** (through Jun 2027): Annual report release, continued viz development

### Key Decisions
- **FFH dataset chosen** as primary focus for Phase 3 (Mar 2026 kickoff)
- **"Natural history museum exhibitions"** as the design metaphor — not dashboards, not reports
- **HTML/CSS/JS canonical atoms** — R Shiny produces widgets that embed, not page shells
- **Design system required** for subcontractor handoff — they work in R, we provide CSS tokens
- **ADA compliance** is a hard requirement (16px min, VoiceOver testing, color contrast)
- **WordPress embed target** — exhibits will iframe into wrmp.org (Divi theme)

### People
- **Sasha Harris-Lovett** — data request point of contact, sends Excel files
- **Dr. Levi Lewis (UC Davis)** — data PI, leads field team, produces R visualizations
- **Cristina Grosso** — WRMP program lead
- **Tony Hale** — technical oversight
- **Karen Verpeet** — comms/website
