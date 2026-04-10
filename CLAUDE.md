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

Three exhibit experiences ("natural history museum type exhibitions") that embed into the WRMP WordPress site. Each exhibit is a self-contained HTML/CSS/JS artifact rendered inside a fixed 16:9 frame with a stepper/narrative panel overlaying an interactive Leaflet map.

### Architecture Decision

**HTML/CSS/JS owns the exhibit wrapper. R Shiny is NOT the wrapper.**

- Exhibits are custom HTML with Leaflet maps, narrative panels, and interactive legends
- R produces data widgets (via `htmlwidgets` — plotly, leaflet, DT) that get embedded as components
- If server-side computation is needed later, Shiny serves as a backend API, not a page shell
- Think of it like YouTube embeds: HTML page = the experience, R widgets = embedded interactive elements
- Design system bridges both: CSS tokens that HTML exhibits and R htmlwidgets share

## Three Exhibits (Planned)

### Exhibit 1: "The Bay — Where We're Watching" (in progress)

5-step narrative stepper showing monitoring station network. Steps:

1. The Estuary — intro, all 119 stations as uniform dots
2. Three Worlds — color by region (salinity gradient story)
3. The Network — color by 9 sampling networks
4. Restoration in Progress — zoom to South Bay, color by site type
5. What Comes Next — highlight 17 planned restoration sites

### Exhibit 2: "What Changed" (needs catch data)

Temporal narrative — the 2014-2015 drought regime shift, native vs. non-native species trends over 14 years of SBOTS monitoring data.

### Exhibit 3: "Meet the Residents" (needs catch data)

Species profiles — searchable catalog of 237 species, deep dives on featured species (Longfin Smelt, Chinook Salmon, Leopard Shark, Green Crab).

## Project Structure

```
wrmp/
├── CLAUDE.md              # this file
├── data/                  # JSON metadata converted from Excel sources
│   ├── stations.json      # 119 stations with lat/lon, region, network, habitat, site type
│   ├── species.json       # 237 species with taxonomy, native/invasive status, habitat
│   ├── gear.json          # 9 sampling gear types with descriptions
│   └── benthos.json       # 31 substrate/benthos classification types
├── design-system/         # shared CSS tokens, palette, typography (to be built)
└── exhibits/              # date-versioned exhibit prototypes
    ├── 2026-04-02-station-map/          # v1: standalone map with filter controls (reference)
    │   └── index.html
    └── 2026-04-02-station-map-stepper/  # v2: narrative stepper exhibit (current)
        └── index.html
```

### Versioning Convention

Exhibits are date-slugged: `exhibits/YYYY-MM-DD-{slug}/index.html`. New revisions get new dates. Keep old versions as reference.

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

## Data Sources

### What We Have (metadata only)

Converted from Excel files provided by Sasha. Source files in `~/Downloads/WRMP data examples for visualizations/`.

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

### Key Research Documents (in Downloads folder)

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
cd /Users/andrewlovseth/Dev/wrmp
python3 -m http.server 8765
# Open http://localhost:8765/exhibits/2026-04-02-station-map-stepper/
```

### Building New Exhibits

1. Create `exhibits/YYYY-MM-DD-{slug}/index.html`
2. Self-contained HTML — no build step, all dependencies via CDN
3. Load data from `../../data/*.json` via fetch
4. Use the design system tokens defined above
5. Test with VoiceOver for ADA baseline

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

## Kickoff Meeting Reference

See `~/Dev/andy-work/meetings/2026-03-26-wrmp-website-kickoff.md` for full meeting notes including:

- FFH chosen as primary dataset for Phase 3
- "Natural history museum type exhibitions" as the design goal
- ADA compliance requirements
- Design system for subcontractor use
- Integration with wrmp.org WordPress site
