# WRMP Design System

Reference guide for the exhibit design language — tokens, components, layout patterns, and conventions.

---

## Principles

1. **Museum, not dashboard.** Information reveals itself through narrative steps, not controls. Interaction serves exploration, not configuration.
2. **Map is the stage.** The Leaflet map (or video/photo) fills the frame completely. The story panel is an overlay, not a sidebar.
3. **Glassmorphism for hierarchy.** Story panel, legend, and nav use backdrop blur + translucency to float above the map without masking it.
4. **Brand over decoration.** Teal headings, lime kickers, amber warnings — every color choice has a semantic reason rooted in the WRMP palette.
5. **ADA-first.** 16px minimum body text, VoiceOver-tested, WCAG AA contrast on all text over backgrounds.

---

## Color

### Brand Palette

Original hex values, preserved in `--wrmp-*-brand` variables. These are reference only — use the semantic tokens below in code.

| Name | Hex | Use |
|------|-----|-----|
| Ada Teal | `#005E6A` | Headings, links, primary text |
| Teal | `#228B9C` | Decorative accents, step dots |
| Orange | `#E09337` | Accent, warnings |
| Dark Orange | `#D66B2C` | Dark accent |
| Green | `#379352` | Heritage, callout bars |
| Light Green | `#92BB4D` | Kicker labels, callout accent |
| Sky Blue | `#00ACEC` | Sky/water accents |
| Earth | `#664D26` | Earth/sediment accents |
| Dark | `#4E4E50` | Secondary text, UI chrome |
| Text | `#272525` | Primary body text |

### Active Semantic Tokens → Radix Colors

Brand colors are mapped to [Radix UI Colors](https://www.radix-ui.com/colors) v3.0.0 for consistent perceptual scales and dark-mode compatibility. **Use these tokens in all CSS.**

| Token | Radix Scale | Usage |
|-------|-------------|-------|
| `--wrmp-ada-teal` | `--cyan-12` | Headings, links, primary text |
| `--wrmp-teal` | `--cyan-9` | Decorative, step dots, accents |
| `--wrmp-dark` | `--gray-11` | Secondary text, UI chrome |
| `--wrmp-text` | `--gray-12` | Body text |
| `--wrmp-light-green` | `--lime-9` | Kicker labels, callout bar accent |
| `--wrmp-orange` | `--amber-9` | Accent, warning callouts |
| `--wrmp-dark-orange` | `--orange-9` | Dark accent |
| `--wrmp-green` | `--grass-9` | Heritage green, callout bar default |
| `--wrmp-sky-blue` | `--sky-9` | Sky/water contexts |
| `--wrmp-earth` | `--brown-9` | Earth/sediment contexts |

### Map Data Palettes

**Regions**

| Region | Token | Hex |
|--------|-------|-----|
| South Bay | `--color-south-bay` → `--cyan-12` | `#005E6A` |
| North Bay | `--color-north-bay` → `--grass-9` | `#379352` |
| Suisun Bay | `--color-suisun` → `--amber-9` | `#E09337` |

**Networks (9)**

| Network | Hex |
|---------|-----|
| Santa Clara | `#005E6A` |
| Alameda | `#228B9C` |
| Wildcat | `#008297` |
| Novato | `#379352` |
| Napa | `#92BB4D` |
| Suisun | `#E09337` |
| Montezuma | `#D4A96A` |
| Petaluma | `#6A9E3A` |
| Belmont | `#6BB5C2` |

**Site Types**

| Type | Hex |
|------|-----|
| Benchmark | `#C7D865` |
| Reference | `#005E6A` |
| Project | `#379352` |
| Other Restored | `#6A9E3A` |
| Planned | `#E09337` |

### Text Color Roles

| Token | Radix | Role |
|-------|-------|------|
| `--color-text` | `--gray-12` | Primary text, headings |
| `--color-text-subtle` | `--gray-11` | De-emphasized, secondary labels |

---

## Typography

### Font Stack

```css
--font-body: "Source Sans Pro", "Source Sans 3", Helvetica, Arial, sans-serif;
--font-heading: var(--font-body);
```

Source Sans Pro is self-hosted (300, 400, 600 weights) from `shared/fonts/`. Headings and body share the same family — distinction comes from weight and size, not typeface.

### Fluid Type Scale

Generated with [Utopia](https://utopia.fyi) — scales from 360px to 1240px viewport.

| Step | Token | Range | Usage |
|------|-------|-------|-------|
| -1 | `--step--1` | ~12–13px | Kickers, captions, labels |
| 0 | `--step-0` | ~14–16px | Body, nav, legend |
| 1 | `--step-1` | ~17–20px | `heading-sm`, stats, callouts |
| 2 | `--step-2` | ~20–25px | `heading-md` |
| 3 | `--step-3` | ~24–31px | `heading-lg` |
| 4 | `--step-4` | ~29–39px | Display, cover title |

Semantic aliases: `--size-sm` (`--step-0`) through `--size-xxl` (`--step-4`).

### Heading Levels

| Class | Size Token | Weight | Line-height | Use |
|-------|-----------|--------|-------------|-----|
| `.heading-display` | `--step-3` | 400 | 1.1 | Cover/hero titles |
| `.heading-lg` | `--step-2` | 400 | 1.15 | Main panel h2 |
| `.heading-md` | `--step-1` | 600 | 1.2 | Section titles |
| `.heading-sm` | `--step-0` | 600 | 1.3 | Subsection labels |
| `.body-text` | `--step-0` | 400 | 1.7 | Body copy |

Append `.subtle` to any heading class for `--color-text-subtle` coloring.

---

## Spacing

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 4px | Tight gaps, icon margins |
| `--space-sm` | 8px | Chip padding, small gaps |
| `--space-md` | 16px | Panel inset, section gaps |
| `--space-lg` | 24px | Between narrative blocks |
| `--space-xl` | 40px | Major section separation |

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Chips, tags, small badges |
| `--radius-md` | 6px | Images, inner cards |
| `--radius-lg` | 8px | Popup cards, map controls |
| `--radius-xl` | 12px | Story panel, exhibit frame |

---

## Elevation

Single shadow token for card elevation:

```css
--shadow-card: 0px 4px 8px rgba(0,0,0,0.07),
               0px 14px 14px rgba(0,0,0,0.06),
               0px 32px 19px rgba(0,0,0,0.04),
               0px 57px 23px rgba(0,0,0,0.01),
               0px 89px 25px rgba(0,0,0,0);
```

---

## Layout: Exhibit Frame

Every exhibit lives inside `.exhibit-frame`:

- Fixed 16:9 aspect ratio
- Max-width 1200px, centered on page
- 10px border-radius
- Background layers (`#map`, `.bg-layer`) fill the full frame at z-index 1
- Story panel and legend overlay at z-index 10+

### Background Layers

Each step can activate different `.bg-layer` types:

| Class | Description |
|-------|-------------|
| `.bg-map` | Leaflet map is visible; no overlay needed |
| `.bg-photo` | CSS `background-image` with a left-to-right gradient (45% → 5% opacity) |
| `.bg-video` | Fullscreen video with gradient overlay |
| `.bg-gradient` | Pure CSS gradient, no media |

Layers use `opacity` transitions (default 0, active 1) for cross-fading between steps.

---

## Component: Story Panel

The narrative container that overlays the map on the left side.

```
--panel-width: 42%
--panel-inset: 16px
--color-panel-translucent: #ffffffb3
backdrop-filter: blur(20px)
border-radius: --radius-xl (12px)
```

### Light vs. Dark Variants

| Variant | When to use | Background | Blur |
|---------|-------------|------------|------|
| Default (light) | Map, gradient, light photo backgrounds | `rgba(255,255,255,0.70)` | 20px |
| `.panel-dark` | Dark video, dark photo backgrounds | `rgba(30,30,30,0.82)` | 62px |

Apply `.panel-dark` to `.story-panel` when the background behind the panel is dark.

### Step Structure

Each step inside `.story-panel-inner` follows this DOM order:

```html
<div class="step" data-step="1">
  <div class="step-header">
    <!-- optional: icon image -->
    <div class="step-kicker">Step label / category</div>
    <h2>Step title</h2>
  </div>
  <div class="body">
    <!-- scrollable narrative content -->
  </div>
  <div class="nav-bar">
    <button class="btn-back">Back</button>
    <div class="step-dots"><!-- generated by stepper.js --></div>
    <button class="btn-next">Next</button>
  </div>
</div>
```

Steps are hidden by default and shown with a `fadeIn` animation when given `.active`.

---

## Component: Navigation Bar

Sticky at the bottom of the story panel with backdrop blur.

**Step dots:**
- Inactive: 8×8px circle, `--gray-5` fill
- Active: pill 36×8px, `--wrmp-teal` fill (smooth `width` transition)

**Buttons:** `Back` (secondary, left) and `Next` (primary teal, right). Both have disabled states that reduce opacity and remove pointer events.

---

## Component: Map Legend

Floating top-right of the exhibit frame. Chips are clickable to filter map markers.

```html
<div class="map-legend">
  <div class="map-legend-chip" data-value="south-bay">
    <span class="map-legend-dot" style="background:#005E6A"></span>
    <span class="map-legend-chip-label">South Bay</span>
  </div>
</div>
```

- Active chip: semibold, slightly elevated
- Label uses a `::after` pseudo-element with `font-weight:600` to reserve bold width — prevents layout shift when activating
- Includes an "All" chip that resets filters

---

## Component: Callout Box

Left-accent bar inside story panel body content.

```html
<div class="callout">Text here.</div>
<div class="callout warning">Warning text.</div>
```

- Default: 4px left bar in `--wrmp-green`
- `.warning`: 4px left bar in `--wrmp-orange`

---

## Component: Stat Pill Row

Horizontal metric display inside step `.body`:

```html
<div class="stat-row">
  <div class="stat">
    <div class="stat-label">Sites</div>
    <div class="stat-number">119</div>
    <div class="stat-sublabel">monitored</div>
  </div>
</div>
```

Stat items have optional right borders as visual dividers. Three text parts: label (small, muted), number (large, teal), sublabel (small, muted).

---

## Component: Overlay Card

Full-screen interstitial that fades over the exhibit (z-index 30). Used for intro screens or deep-dive modals.

```html
<div class="overlay-screen">
  <div class="overlay-card">
    <div class="overlay-kicker">Category</div>
    <h1 class="overlay-heading">Title</h1>
    <p class="overlay-body">Description</p>
    <div class="overlay-actions">
      <button class="btn-primary">Enter</button>
    </div>
  </div>
</div>
```

Max-width 760px, backdrop blur, centered.

---

## Component: Marker Popup

Built via `WRMP.makeMarkerPopup(opts)` — DOM-constructed, no innerHTML. Requires `shared/css/marker-popup.css`.

```js
WRMP.makeMarkerPopup({
  name: "Station Name",
  network: "Alameda Creek",
  region: "South Bay",
  habitat: "Tidal Slough",
  siteType: "Project",
  lat: 37.5,
  lon: -122.1,
  color: "#005E6A"      // dot color
})
```

Card layout: colored dot + name header, then label/value rows for each field present. Fields are omitted if undefined — popups adapt to the exhibit's data shape.

---

## Component: POI Label

Non-interactive floating geographic label on the map:

```js
WRMP.addPOI(poiLayer, 37.5, -122.1, "Label text")
```

White chip with gray text, border, and shadow. Does not respond to click events.

---

## CSS File Responsibilities

| File | Purpose |
|------|---------|
| `shared/css/tokens.css` | All custom properties. No selectors. Load first. |
| `shared/css/exhibit-frame.css` | Frame, panel, steps, nav, backgrounds, utility classes |
| `shared/css/leaflet-overrides.css` | Leaflet control chrome + base popup styling |
| `shared/css/marker-popup.css` | Station marker popup card |
| `shared/css/metrics-card.css` | Standalone metric card pattern (for embeds) |

**Load order:**
```html
<link rel="stylesheet" href="../../shared/css/tokens.css">
<link rel="stylesheet" href="../../shared/css/exhibit-frame.css">
<link rel="stylesheet" href="../../shared/css/leaflet-overrides.css">
<link rel="stylesheet" href="../../shared/css/marker-popup.css">
```

Exhibit-specific overrides go in a `<style>` block inside the exhibit's `<head>`.

---

## Design–System Sync Rule

Any change to `tokens.css` or `exhibit-frame.css` must be reflected in `design-system/index.html` in the same commit. The design-system page is the living specimen — it should always match what tokens are active.
