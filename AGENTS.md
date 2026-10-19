# AGENTS.md — Maintainer & AI Agent Guide

This document provides the architectural context, coordinate system rules, pluggable module system, and extension playbooks needed for engineers and AI coding agents to co-design layouts and extend the **AI Facility Layout Studio**.

---

## 1. Project Purpose & Pluggable Module Architecture

This repository powers an open-source **2D Architectural CAD + 3D Isometric Facility Layout Studio** designed for **human + AI pair iteration** across:
1. **General Industrial, Manufacturing, R&D Lab & Warehouse Planning** (space programming, pallet racking, machinery clearances, shipping/receiving docks).
2. **Contractor & MEP Build-Out Bidding** (architectural blueprints, wet-wall plumbing manifolds, room pressure differentials, wall heights, finish schedules).
3. **Optional Pluggable Industry Modules** (`src/data/domain-modules.ts`), toggled per-layout via `layout.enabledModules` or the top-bar **Modules** menu:
   - **`cultivation`** (*Controlled-Environment Agriculture & CEA*): Adds sealed flowering & veg canopy rooms, drying/curing suites, automated fertigation dosing skids, `rolling-bench` (`4×8` ebb-and-flow benches), LED clone racks, split AC + scrubbers, and `-0.03" WC` negative-pressure badges.
   - **`edible-cleanroom`** (*Edible / Food-Grade & GMP Cleanroom*): Adds washable FRP/IMP cleanrooms, personnel gowning airlocks (PAL), `+0.05" WC` positive-pressure HEPA tags, commercial kitchen Type-1 hoods, 3-compartment pot sinks, grease interceptors, and inline packaging conveyors.
   - **`security-compliance`** (*Regulated Security, L.A.A. & Vault Compliance*): Unlocks Sheet `SEC-101`, `isLimitedAccess` (`L.A.A.`) perimeters, Security Operations Center (SOC), interlocked mantraps, 24/7 security cameras with rotatable FOV cones, badge readers, optical turnstiles, and secure vaults.
   - **`cold-storage`** (*Industrial Cold Storage & Refrigerated Logistics*): Adds sub-zero blast freezers (`-20°F`), medium-temp coolers (`36°F`), refrigerated cross-dock aprons (`45°F`), compressor engine rooms, ceiling blast evaporators, and high-speed insulated thermal doors.
   - **`logistics-warehouse`** (*Logistics, Warehousing & Fulfillment*): Adds cross-dock loading bays with hydraulic pit levelers, high-bay pallet racking aisles, e-commerce pick/pack fulfillment stations, forklift battery charging bays, and pallet wrappers.
   - **`biotech-lab`** (*Biotechnology, Life Sciences & R&D Lab*): Adds BSL-2 molecular biology wet labs, cell culture cleanrooms, analytical chemistry fume hoods, pass-through autoclaves, -80°C cryo biorepositories, and modular lab island benches.

---

## 2. Coordinate System & Dynamic Building Shell Bounds

### Units & Scale
- **Canonical Data Units (`src/data/facility-layout.json`)**: All positions (`x`, `y`), dimensions (`width`, `height`, `wallHeight`), and clearances are stored in **decimal feet** (`1.0` = `1'-0"`, `0.5` = `6"`, `0.25` = `3"`).
- **2D SVG Scale (`src/components/canvas/canvasConstants.ts`)**: `FT = 10` (`1 foot = 10 SVG user units`). Always multiply feet by `FT` when rendering SVG coordinates.
- **Dynamic Sheet & 3D Bounds**:
  - `computeShellBounds(shellPerimeter)` and `computeSheetBounds(shellPerimeter, showLegend)` in `src/components/canvas/canvasConstants.ts` automatically size the SVG `viewBox`, grid, right-margin legend, bottom title strip, and 3D camera orbit radius to fit any building footprint.
  - Users can resize rectangular building shells (`Width × Length` in feet) from the right sidebar (`Shell & Info` tab) or define arbitrary polygon vertices in `layout.shellPerimeter`.

### Origin `(0, 0)` & Axes
- **Origin `(0, 0)`**: Top-left (**North-West**) interior corner of the building shell:
  - `+X` points **East** (Width).
  - `+Y` points **South** (Length).

### Coordinate Anchors
- **Rooms, Equipment & Structural Elements**: Anchor at top-left `(x, y)` (`x = minX`, `y = minY`). Their bounding box extends from `(x, y)` to `(x + width, y + height)`.
- **Doors**: Anchor at the **geometric center** of the door opening along the wall centerline `(x, y)`. The door leaf opening spans `x ± width/2` (horizontal) or `y ± width/2` (vertical).
- **Exterior Setbacks & Site Features**: Exterior setback fences, utility yards, or dock aprons can use negative coordinates (e.g. `x = -15`, `y = -10`) relative to the building shell's North-West `(0, 0)` origin.

### Optional Raster Floorplan Underlay (`pdfCalibration`)
- If a layout includes `pdfCalibration` in `src/data/facility-layout.json`, `src/components/canvas/PdfUnderlayLayer.tsx` renders the calibrated floorplan image beneath the vector CAD layers:
  ```json
  "pdfCalibration": {
    "fullImageUrl": "/underlay-full.png",
    "lineworkDarkUrl": "/underlay-linework-dark.png",
    "lineworkLightUrl": "/underlay-linework-light.png",
    "originPxX": 233,
    "originPxY": 23,
    "pixelsPerFoot": 4.91507,
    "imageWidthPx": 673,
    "imageHeightPx": 860
  }
  ```

---

## 3. Codebase Architecture & Decentralized React State

### Guiding Principle: Decentralized Leaf Components
- **Strictly avoid monolithic orchestrator hooks or facade components.**
- Push state subscriptions, pointer/drag handlers, keyboard shortcuts, and persistence updates directly into the specific leaf components that own the responsibility.

### Directory Structure
```text
src/
├── components/
│   ├── canvas/                  # 2D Interactive SVG CAD Layers
│   │   ├── canvasConstants.ts   # FT=10 scale & dynamic computeSheetBounds()
│   │   ├── FacilityCanvas2D.tsx # Pan/zoom viewport, placement tools & layer stack
│   │   ├── PdfUnderlayLayer.tsx # Optional calibrated raster floorplan underlay
│   │   ├── RoomNode.tsx         # Draggable/resizable rooms & modular wall callouts
│   │   ├── RoomLabelsLayer.tsx  # Top-level room schedule plates & edge ribbons
│   │   ├── ShellLayer.tsx       # Building shell perimeter & clipped 1'/5' grid
│   │   ├── StructuralNode.tsx   # Custom interior walls, columns & dock pits
│   │   ├── EquipmentNode.tsx    # CAD equipment blocks + 0°-360° rotation handle
│   │   ├── DoorNode.tsx         # Architectural doors with swing arcs & hand flips
│   │   ├── DisciplineOverlayLayer.tsx # Dynamic Egress paths, EXIT signs & MEP tags
│   │   ├── ShellDimensionsLayer.tsx   # Exterior architectural dimension strings
│   │   ├── TitleBlockOverlay.tsx      # Right-margin schedules, legend & title block
│   │   └── CanvasToolDock.tsx   # Floating left-hand tool & snap dock
│   ├── inspector/               # Right-hand contextual property inspectors
│   │   ├── RoomInspector.tsx
│   │   ├── EquipmentInspector.tsx
│   │   ├── DoorInspector.tsx
│   │   └── StructuralInspector.tsx
│   ├── preview3d/
│   │   └── IsometricPreview3D.tsx # Auto-centering Three.js 3D isometric model
│   ├── sidebar/
│   │   └── SpaceProgramSidebar.tsx # Elements list, Module Catalog & Shell Resizer
│   └── toolbar/
│       ├── StudioHeader.tsx         # Top bar: Presets, Modules, Sheet views, Undo/Redo
│       ├── BackupHistoryPopover.tsx # Snapshot restore & manual backup manager
│       ├── DiskSyncWatcher.tsx      # Bidirectional disk <-> browser live sync
│       └── ExportActions.tsx        # SVG, High-Res PNG, PDF Print & JSON exporters
├── data/
│   ├── facility-layout.json     # Active live-synced layout document
│   ├── showcase-cultivation-facility.json  # Full regulated showcase preset data
│   ├── domain-modules.ts        # Pluggable industry modules & quick-add templates
│   ├── discipline-views.ts      # 6 engineering & compliance sheet configurations
│   └── layout-presets.ts        # General Industrial, Blank Shell & Showcase presets
├── store/
│   ├── layoutStore.ts           # Canonical layout state, CRUD, module & shell actions
│   └── viewStore.ts             # Viewport state, active sheet view, tool & layer flags
├── types/
│   └── facility.ts              # TypeScript interfaces for all entities & modules
└── utils/
    ├── dimensions.ts            # Feet/inches formatting, polygon area & theme palettes
    └── svgMouse.ts              # Screen clientX/Y -> SVG feet coordinate conversion
```

---

## 4. Bidirectional AI / Disk Live Sync & Backups

Configured in `vite.config.ts` via custom Vite dev-server middleware (`facilityLayoutDiskSyncPlugin`):

1. **Browser UI → Disk (`POST /api/layout`)**:
   - Whenever `persistCurrentLayout()` runs in the browser, it `POST`s the JSON to `/api/layout`.
   - The Vite server writes the formatted JSON directly to `src/data/facility-layout.json` and automatically saves a timestamped snapshot in `src/data/backups/` (throttled to at most once every 2 minutes for auto-saves).
2. **Disk / AI Agent → Browser UI (`GET /api/layout`)**:
   - `src/components/toolbar/DiskSyncWatcher.tsx` polls `/api/layout` and detects when an AI agent or developer edits `src/data/facility-layout.json` on disk, updating the canvas immediately.

---

## 5. Discipline Sheet Views (`1`–`6`)

Defined in `src/data/discipline-views.ts` and selectable via the header **Sheet Views** dropdown or number keys `1`–`6`:

| Key | ID | Sheet Code | Purpose & Filtering Behavior |
| :-: | :--- | :---: | :--- |
| `1` | `overview` | `A-100` | **Master Plan**: Shows all rooms, equipment, doors, and dimensions. |
| `2` | `room-usage` | `A-101` | **Room Usage & Zoning**: Ghosts equipment and expands all room plates to show full SF, dimensions, ceiling heights, and wall/floor finishes. |
| `3` | `equipment` | `Q-101` | **Equipment Schedule**: Highlights process machinery, racking, benches, plumbing, and operator safety clearance zones. |
| `4` | `security` | `SEC-101` | **Security & Access Control** (*Security Module*): Highlights `security-camera` (with FOV cones), `access-control` badge readers, and `secure-vault` cages; outlines Limited Access (`L.A.A.`) rooms in red. |
| `5` | `evac-safety` | `LS-101` | **Evacuation & Life Safety**: Highlights `safety-equipment` (`FE`, `EW`, `AED`) and automatically computes green dashed egress travel paths + illuminated `EXIT` signs at exterior egress doors. |
| `6` | `contractor-mep` | `M-101` | **Contractor MEP & Utilities**: Highlights `plumbing`, `hvac-scrubber`, and `electrical-mep`; renders wet-wall sanitary tie-in lines, room pressure differential tags, and wall-height/finish callouts. |

---

## 6. Development & Verification Commands

```bash
# Start the Vite dev server (includes live /api/layout disk sync & backup middleware)
npm run dev

# Type-check the entire project without emitting files
npx tsc --noEmit

# Build production bundle to dist/
npm run build
```
