---
name: wrmp-exhibit
description: Scaffold a new WRMP museum-style exhibit with stepper navigation, Leaflet maps, and narrative panels. Two modes - map-centric or mixed-media storytelling.
triggers:
  - exhibit
  - new exhibit
  - wrmp exhibit
  - create exhibit
  - scaffold exhibit
---

# WRMP Exhibit Scaffold

Use this skill to create a new interactive exhibit for the WRMP data visualization project. Each exhibit is a self-contained `index.html` inside a date-slugged directory under `exhibits/`.

## Invocation

```
/exhibit <type> "<title>"
```

- **type**: `map` (Leaflet map as primary background) or `story` (mixed-media backgrounds per step)
- **title**: The exhibit title (used in `<title>` and the first step's `<h2>`)

Examples:
```
/exhibit map "The Trawl Network"
/exhibit story "Meet the Delta Smelt"
```

## What Gets Created

A new directory `exhibits/YYYY-MM-DD-{slug}/index.html` with:
- Today's date as the prefix
- Slug derived from the title (lowercase, hyphenated)
- Full HTML scaffold ready to customize

## Architecture

All exhibits share this structure:

### Head
```html
<link rel="stylesheet" href="../../shared/css/tokens.css" />
<link rel="stylesheet" href="../../shared/css/exhibit-frame.css" />
<link rel="stylesheet" href="../../shared/css/leaflet-overrides.css" />
```

### Body Structure
```
.exhibit-frame
  ├── [background layers]     (story type only)
  ├── #map                    (Leaflet map)
  ├── .map-legend             (floating top-right)
  └── .story-panel
       ├── .story-panel-inner
       │    └── .step[data-step="N"] (one per step)
       │         └── .step-header → .step-header-mark + .step-header-text (.kicker + h2) + .body…
       └── .nav-bar
            ├── .nav-logo
            ├── #btn-prev
            ├── .step-dots > .step-dot[data-step="N"]
            └── #btn-next
```

### Scripts (load order matters)
```html
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="../../shared/js/data-loader.js"></script>
<script src="../../shared/js/map-init.js"></script>
<script src="../../shared/js/stepper.js"></script>
```

## Exhibit Types

### `map` — Map-Centric

Best for: station networks, spatial data, geographic narratives.

Reference exhibit: `2026-04-03-station-map-stepper/`

Pattern:
- Leaflet map fills the entire frame background
- Story panel overlays the left 42% with glassmorphism
- Legend chips (top-right) filter map markers and fly to matching bounds
- Each step has a `render(stations, filter)` function in `STEP_DEFS`
- Panel is always light theme

Key code pattern:
```javascript
var STEP_DEFS = [
  {
    legend: [{ label: "Label", color: "#hex", value: "field_value" }],
    field: "data_field_name",
    colors: COLOR_MAP,
    bounds: BOUNDS_ARRAY,
    pois: [[lat, lon, "Label text"]],
    render: function(stations, filter) {
      // Create L.circleMarker for each station
      // Apply filter highlighting (match vs dimmed)
    }
  }
];
```

### `story` — Mixed-Media

Best for: species profiles, gear explanations, temporal narratives, anything with photos/video.

Reference exhibits: `2026-04-10-delta-smelt/`, `2026-04-10-how-we-look/`

Pattern:
- Background layers (`.bg-layer`) swap per step: video, photo, map, or gradient
- Panel toggles between light and dark (`.panel-dark`) based on background
- Map div exists but starts hidden, shown only on map steps
- `onStepEnter` manages background visibility and panel theme

Key code pattern:
```javascript
// Background layer management
var bgLayers = document.querySelectorAll('.bg-layer');
var mapEl = document.getElementById('map');
var panel = document.getElementById('story-panel');

function showStep(n) {
  // Hide all backgrounds, show the one for this step
  bgLayers.forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('bg-' + n).classList.add('active');

  // Toggle panel theme
  var isMapStep = STEP_DEFS[n].type === 'map';
  var isDark = STEP_DEFS[n].darkPanel;
  panel.classList.toggle('panel-dark', isDark);

  // Show/hide map
  mapEl.style.opacity = isMapStep ? '1' : '0';
  mapEl.style.pointerEvents = isMapStep ? 'auto' : 'none';
}
```

## Step Content Elements

Every step must start with a **step header** row: transparent icon mark (WRMP logo only) on the left, then the kicker and `h2` inside `.step-header-text`.

```html
<div class="step-header">
  <img
    class="step-header-mark"
    src="../../shared/img/wrmp-logo-2in-mark-crop.png"
    alt=""
    width="40"
    height="40"
    decoding="async"
  />
  <div class="step-header-text">
    <span class="kicker">Section Label</span>
    <h2>Step Title</h2>
  </div>
</div>
```

Then body and optional blocks:

```html
<!-- Body text -->
<div class="body">
  <p>Paragraph text...</p>

  <!-- Stat pills (numeric highlights) -->
  <div class="stat-row">
    <div class="stat-pill">
      <div class="num">119</div>
      <div class="lbl">Stations</div>
    </div>
  </div>

  <!-- Callout box (teal border) -->
  <div class="callout">Important finding or context.</div>

  <!-- Warning callout (orange border) -->
  <div class="callout warning">Conservation concern.</div>
</div>
```

## Data Loading

```javascript
WRMP.loadData({ stations: true, species: true }).then(function(data) {
  STATIONS = data.stations;
  stepper.goToStep(0);
});
```

Available datasets: `stations`, `species`, `gear`, `benthos`.

## Common Bounds

```javascript
var BAY_FULL = [[37.4, -122.55], [38.28, -121.85]];
var SOUTH_BAY = [[37.42, -122.1], [37.62, -121.88]];
var NORTH_BAY = [[37.8, -122.55], [38.18, -122.3]];
var SUISUN = [[38.03, -122.15], [38.22, -121.75]];
```

## Checklist Before Finishing

- [ ] All step dots match `totalSteps` count
- [ ] `data-step` attributes are sequential starting from 0
- [ ] Each step includes `.step-header` with mark, kicker, and `h2`
- [ ] First step has `class="step active"`
- [ ] `btn-prev` starts with `disabled` attribute
- [ ] Popup uses `WRMP.makeMarkerPopup()` (DOM-built, no innerHTML; `marker-popup.js` + `marker-popup.css` linked)
- [ ] Colors use CSS custom properties from tokens.css where possible
- [ ] Body text is at least 16px (ADA requirement)
- [ ] Photo/video backgrounds include `.photo-credit` attribution
