# AI Facility Layout Studio

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-0.170-black.svg?logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

An open-source, interactive **2D Architectural CAD + 3D Isometric Facility Layout Studio** engineered for **real-time Human + AI co-design**.

Built for space planners, industrial engineers, architects, operations leaders, and AI coding assistants, this studio bridges the gap between quick schematic mockups and professional engineering deliverables. It combines an ultra-fast SVG canvas, real-time Three.js 3D isometric orbit, six multi-discipline architectural sheet views, and an open declarative JSON data model that syncs bidirectionally with your IDE and AI coding agent.

---

## Table of Contents

- [Key Capabilities](#key-capabilities)
- [Pluggable Industry Modules](#pluggable-industry-modules)
- [Quick Start](#quick-start)
- [Workflow 1: Starting a New Layout from Scratch](#workflow-1-starting-a-new-layout-from-scratch)
- [Workflow 2: Digitizing an Architectural PDF or Lease Plan (Calibrated Underlay Method)](#workflow-2-digitizing-an-architectural-pdf-or-lease-plan-calibrated-underlay-method)
- [AI Model & Harness Integration Guide](#ai-model--harness-integration-guide)
  - [Supported AI Harnesses](#supported-ai-harnesses)
  - [The Bidirectional Sync Loop](#the-bidirectional-sync-loop)
  - [Prompt Cookbook for AI Agents](#prompt-cookbook-for-ai-agents)
- [Discipline Sheet Views & Hotkeys](#discipline-sheet-views--hotkeys)
- [Declarative JSON Schema Reference](#declarative-json-schema-reference)
- [Exporting Deliverables](#exporting-deliverables)
- [Contributing & Open Source Standards](#contributing--open-source-standards)
- [License](#license)

---

## Key Capabilities

- **Bidirectional Human + AI Co-Design**: All facility geometry lives in a single human-readable JSON document on disk (`src/data/facility-layout.json`). UI edits auto-save to disk, and edits made by AI agents or scripts hot-update the browser without reload.
- **Architectural 2D Vector CAD**: Precision millimeter/inch rendering with interactive snap grid (1', 6", 3", 1"), wall break masks, door swing arcs, clearance envelopes, and dynamic exterior dimension strings.
- **Real-Time 3D Isometric Model**: Instant Three.js isometric visualization with orbit controls, ceiling heights, wall thickness extrusion, and room color coding.
- **Dynamic Building Shell Scaling**: The canvas automatically calculates bounding boxes for any building shell—from a 1,500 SF suite to a 100,000+ SF distribution center—adjusting sheet dimensions, title blocks, and camera orbits on the fly.
- **6 Engineering Discipline Sheets**: Switch between Master Plan (`A-100`), Room Zoning (`A-101`), Equipment Schedule (`Q-101`), Regulated Security (`SEC-101`), Evacuation & Life Safety (`LS-101`), and Contractor MEP Utilities (`M-101`).
- **Calibrated Underlay Engine**: Import architectural PDFs, scans, or lease plans, calibrate the scale (`pixelsPerFoot`), and trace existing elements with pixel precision.
- **Zero Lock-In**: Export production-ready vector SVG, high-resolution PNG blueprints, print-to-PDF engineering sheets, and raw JSON.

---

## Pluggable Industry Modules

The studio includes a core general-purpose industrial engine and **pluggable domain modules** that can be toggled on or off at any time via the top-bar **Modules** menu or the `enabledModules` array in JSON:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ CORE STUDIO (Always Active)                                                  │
│ General Industrial • Manufacturing Cells • Pallet Racking • R&D Labs         │
│ Offices • Shipping / Receiving Docks • Life Safety Egress • Contractor MEP   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   cultivation    │          │ edible-cleanroom │          │security-complianc│
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│ • Grow/Flower rms│          │ • Washable rooms │          │ • Sheet SEC-101  │
│ • Rolling benches│          │ • Positive press.│          │ • L.A.A. borders │
│ • Clone racks    │          │ • 3-comp sinks   │          │ • 24/7 FOV cams  │
│ • AC/Scrubbers   │          │ • Grease traps   │          │ • Badge readers  │
│ • Neg. pressure  │          │ • Modular walls  │          │ • Secure vaults  │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

1. **Core Studio (Always On)**:
   - Manufacturing workcells, assembly tables, tool cribs, and CNC stations.
   - High-bay pallet racking, forklift aisles, and dock leveler pits.
   - Administrative offices, conference rooms, breakrooms, and restrooms.
   - Automated NFPA/IBC life-safety egress travel paths, illuminated `EXIT` signs, and fire extinguisher placements.
   - Contractor MEP schedules: wet-wall plumbing tie-ins, electrical main panels, and wall finish schedules.

2. **Controlled-Environment Cultivation & Nursery (`cultivation`)**:
   - Closed-loop flower and veg cultivation rooms with temperature/humidity zoning.
   - `4×8` rolling ebb-and-flow benches with rolling aisle clearance visualization.
   - Multi-tier vertical LED propagation and mother plant racks.
   - High-tonnage split-system AC units with integrated carbon scrubbers.
   - Negative air pressure differentials (`-0.03" WC`) for odor mitigation.

3. **Edible / Food-Grade & GMP Cleanroom (`edible-cleanroom`)**:
   - Washable FRP / IMP wall assemblies and coved epoxy sanitary baseboards.
   - Positive air pressure differentials (`+0.05" WC`) with HEPA supply callouts.
   - Commercial 3-compartment wash/rinse/sanitize sinks and floor grease interceptors.
   - Modular, non-load-bearing expandable wall callouts and phased expansion arrows.

4. **Regulated Security, L.A.A. & Vault Compliance (`security-compliance`)**:
   - Dedicated engineering sheet `SEC-101`.
   - Regulated Limited Access Area (`L.A.A.`) perimeter boundary styling.
   - 24/7 security cameras with interactive 0°–360° Field of View (FOV) coverage cones.
   - Electronic strike locks and biometric/RFID badge readers.
   - Reinforced double-wall secure vaults, narcotics safes, and quarantine cages.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` v9.0.0 or higher

### Installation

> [!TIP]
> **Starting your own facility design?** Click the green **"Use this template"** button at the top of the [GitHub repository](https://github.com/Cultivatd/ai-facility-layout) to generate a clean, independent repository under your own account (or organization), then clone your new repository.

```bash
# 1. Clone your repository (or this template)
git clone https://github.com/Cultivatd/ai-facility-layout.git
cd ai-facility-layout

# 2. Install dependencies
npm install

# 3. Launch the development server
npm run dev
```

Open your browser to `http://localhost:5173/`. The studio starts with the active layout loaded and the live bidirectional disk sync active.

### Included Starter Presets

In the top toolbar, click **Presets** to load any of the included baseline templates:
- **General Industrial & Lab (`60' × 100'`)**: 6,000 SF light manufacturing, assembly workcells, QC metrology lab, engineering office, and pallet warehouse.
- **Blank Rectangular Shell (`50' × 80'`)**: Clean, empty 4,000 SF building shell ready to resize and build from scratch.
- **Showcase: Cultivation & Edible Cleanroom (`43.4' × 96.0'`)**: Comprehensive multi-zone facility showcasing all three pluggable domain modules.

> [!WARNING]
> Selecting a preset in the UI immediately syncs to and updates `src/data/facility-layout.json`. Use the **Backups** menu in the top toolbar to create manual checkpoints before switching templates.

---

## Workflow 1: Starting a New Layout from Scratch

Follow this step-by-step workflow to plan any building from a blank slate:

```text
[Step 1: Set Shell] ➔ [Step 2: Partition Rooms] ➔ [Step 3: Add Doors] ➔ [Step 4: Equip Workcells] ➔ [Step 5: Code & MEP]
```

### Step 1: Define the Building Shell
1. Load the **Blank Rectangular Shell** from the **Presets** dropdown.
2. In the right-hand sidebar, open the **Shell & Info** tab.
3. Enter your building dimensions (e.g., `Width = 60 ft`, `Length = 120 ft`, `Clear Height = 22 ft`).
4. Update project metadata (Project Name, Building Name, Address, Architect, Revision).

> **Custom Non-Rectangular Shells**: You can define arbitrary polygon building shapes by editing `shellPerimeter` vertices in `src/data/facility-layout.json` (e.g., L-shaped, angled corners, or multi-bay footprints).

### Step 2: Partition Rooms & Space Programming
1. Select the **Room** tool (`R`) from the floating toolbar or left dock.
2. Click on the canvas to drop a room footprint, then drag the bottom-right corner handle to resize or drag the room body to reposition.
3. With the room selected, use the right-hand **Room Inspector** to customize:
   - **Name & Code**: e.g., `Assembly Cell A`, `ASM-101`.
   - **Category**: `production`, `warehouse`, `cleanroom`, `office`, `corridor`, `mechanical`, etc.
   - **Dimensions**: Fine-tune `Width`, `Height`, and `Wall Height` in feet and inches.
   - **Finishes**: Specify wall construction (e.g., `Drywall / Steel Stud`, `Insulated Metal Panel`, `Washable FRP`) and floor finish (`Sealed Concrete`, `ESD Epoxy`, `Coved Epoxy`).
   - **Pressurization**: Set design pressure differentials (`+0.05" WC` positive cleanroom, `-0.03" WC` negative odor control, or `Neutral`).

### Step 3: Insert Doors & Openings
1. Select the **Door** tool (`D`).
2. Click along any wall line to place a door opening.
3. Inspect and configure:
   - **Type**: `single-swing`, `double-swing`, `overhead-dock`, `sliding`, or `cased-opening`.
   - **Width**: Standard 3'-0" (36"), 4'-0", 6'-0" double, or 10'-14' overhead dock doors.
   - **Handing & Swing**: Double-click any door directly on the canvas to cycle its swing quadrant (`north-east`, `south-east`, `south-west`, `north-west`), or toggle handing in the inspector.

### Step 4: Place Process Equipment & Furniture
1. Select the **Equipment** tool (`E`), or browse the **Catalog** tab in the sidebar.
2. Drag or drop equipment blocks into rooms (workstations, pallet racks, machinery, sinks, panels).
3. Select an item to reveal its **interactive green rotation handle** (rotate from 0° to 360°) and bottom-right resize handle.
4. Clearance envelopes automatically appear around equipment when clearance zones are toggled on (`C` key).

### Step 5: Life Safety, Egress & MEP Review
1. Switch to **Evacuation & Life Safety** (`5` key):
   - The studio automatically traces green dashed egress travel paths from interior spaces to exterior doors and calculates total travel distance.
   - Place fire extinguishers (`FE`), emergency eyewash stations (`EW`), and first aid/AED kits.
2. Switch to **Contractor MEP** (`6` key):
   - Review utility connections, wet-wall sanitary lines, and electrical main distribution panels (`MDP`).
3. Press **Spacebar** or click **3D Preview** to inspect your layout in 3D isometric perspective.

---

## Workflow 2: Digitizing an Architectural PDF or Lease Plan (Calibrated Underlay Method)

When working from an existing architectural lease brochure, CAD PDF, blueprint, or building scan, you can calibrate a raster underlay directly beneath the interactive vector layers:

```text
[PDF / Scan] ──► [Export High-Res PNG] ──► [Calibrate Scale & Origin] ──► [Trace As-Built] ──► [Design TI Fit-Out]
```

### Step 1: Prepare the Image File
1. Export the PDF floorplan page as a high-resolution PNG (300 DPI recommended):
   ```bash
   # Using poppler / pdftoppm (macOS / Linux):
   pdftoppm -png -r 300 architectural-plan.pdf public/facility-underlay
   ```
2. Save the resulting image into the `public/` directory (e.g., `public/facility-underlay.png`).
3. *(Optional)* For optimal contrast in dark CAD mode, create an inverted high-contrast linework PNG using any photo editor or image processing tool, and save it as `public/facility-linework-dark.png`.

### Step 2: Establish the Scale (`pixelsPerFoot`)
1. Open the image in any viewer (e.g., Preview, Photoshop, GIMP, or Figma).
2. Find a dimensioned architectural line on the drawing (e.g., a wall labeled `50'-0"`).
3. Measure the distance in pixels between the two dimension tick marks:
   $$\text{pixelsPerFoot} = \frac{\text{Pixel Distance}}{\text{Dimension in Feet}}$$
   *Example*: If a `50'-0"` wall measures `491.5` pixels in your image:
   $$\text{pixelsPerFoot} = \frac{491.5}{50.0} = 9.83$$

### Step 3: Establish the Origin `(0, 0)`
1. Identify the interior **North-West corner** of the building shell. In this studio, that corner is canonical `(0, 0)`.
2. Find the pixel coordinates $(X, Y)$ of that exact corner inside the image (e.g., $X = 233$, $Y = 48$).
3. Record the total pixel width and height of the image (e.g., `imageWidthPx = 1800`, `imageHeightPx = 2600`).

### Step 4: Add `pdfCalibration` to `facility-layout.json`
Add the calibration block to your active layout document:

```json
{
  "version": "2.0.0",
  "enabledModules": [],
  "metadata": { ... },
  "pdfCalibration": {
    "fullImageUrl": "/facility-underlay.png",
    "lineworkDarkUrl": "/facility-linework-dark.png",
    "lineworkLightUrl": "/facility-underlay.png",
    "originPxX": 233,
    "originPxY": 48,
    "pixelsPerFoot": 9.83,
    "imageWidthPx": 1800,
    "imageHeightPx": 2600
  },
  "shellPerimeter": [ ... ],
  "rooms": [ ... ]
}
```

### Step 5: Trace & Lock As-Built Geometry
1. In the studio toolbar, toggle **Underlay: On** (or press `U`). Adjust the underlay opacity slider to your preferred drafting brightness.
2. Align your `shellPerimeter` vertices with the exterior perimeter lines of the underlay.
3. Trace existing demising walls, structural columns, and utility rooms.
4. Mark existing elements with `"isExisting": true`.
5. Turn on **Lock As-Built** in the header. Existing walls and columns become tamper-proof and visually muted, allowing you to design new tenant improvements (`TI`) directly on top.

---

## AI Model & Harness Integration Guide

This studio was architected from day one for **agentic pair programming**. Rather than locking CAD data into binary formats or complex internal component state, all facility geometry lives in a single human-readable file: [`src/data/facility-layout.json`](src/data/facility-layout.json).

```text
┌───────────────────────┐                    ┌─────────────────────────┐
│                       │   POST /api/layout │                         │
│  Browser Studio UI    ├───────────────────►│ src/data/               │
│  (React / Canvas / 3D)│                    │   facility-layout.json  │
│                       │◄───────────────────┤                         │
└───────────────────────┘   GET /api/layout  └────────────┬────────────┘
                                                          ▲
                                    File Edits / Patches  │
                                                          ▼
                                             ┌─────────────────────────┐
                                             │ AI Coding Agent         │
                                             │ Claude Code • Cursor    │
                                             │ Windsurf • Copilot      │
                                             │ Gemini • Aider          │
                                             └─────────────────────────┘
```

### Supported AI Harnesses

The repository comes pre-configured with harness rules out of the box:

| Harness | Configuration File | Behavior |
| :--- | :--- | :--- |
| **Cursor** | [`.cursorrules`](.cursorrules) | Automatically loaded in Composer and Chat; provides coordinates, units, and module rules. |
| **Windsurf** | [`.windsurfrules`](.windsurfrules) | Injects facility architectural rules and file locations into Cascade. |
| **Claude Code** | [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) | Guides the CLI agent through data structures, commands, and schemas. |
| **Google Antigravity / Gemini** | Built-in pair agent | Uses `AGENTS.md` context and tools to inspect and patch layout JSON. |
| **Aider / CLI Agents** | Point agent to `AGENTS.md` | Run `aider src/data/facility-layout.json src/types/facility.ts`. |
| **GitHub Copilot Workspace** | Repository instructions | Inlined architectural instructions through standard markdown files. |

### The Bidirectional Sync Loop

1. **Browser → Disk (`POST /api/layout`)**:
   - Any drag, resize, rotation, or deletion in the browser triggers `persistCurrentLayout()`.
   - The Vite dev server receives the update and writes formatted JSON directly to `src/data/facility-layout.json`.
   - Automatic timestamped backups are preserved in `src/data/backups/`.
2. **AI Agent → Browser (`GET /api/layout`)**:
   - When your AI agent edits `src/data/facility-layout.json`, the browser's `DiskSyncWatcher` detects the change within ~1 second.
   - The canvas and 3D preview update in real time without refreshing the page or resetting your zoom/pan position.

---

### Prompt Cookbook for AI Agents

Here are tested, high-leverage prompts you can paste directly into your AI harness:

#### 1. Generating a Space Program from Requirements
> *"I have a 60'x100' industrial shell in `src/data/facility-layout.json`. Please partition the space for a light manufacturing facility: include a 1,200 SF machining workcell along the west wall, an 800 SF QC metrology lab with antistatic epoxy flooring, a 400 SF breakroom, two ADA restrooms, and dedicate the remaining east bay to high-bay pallet storage with a 10'x12' overhead dock door."*

#### 2. Optimizing Aisle Spacing & Pallet Racking
> *"Analyze the warehouse room in `src/data/facility-layout.json`. Populate it with standard 42\"x96\" pallet rack runs (`racking` category) oriented north-south. Maintain minimum 10-foot forklift aisles between racks and ensure a 4-foot clear egress path along the exterior perimeter."*

#### 3. Designing a GMP / Food-Grade Cleanroom with Pressure Cascades
> *"Enable the `'edible-cleanroom'` module in `src/data/facility-layout.json`. Design an ISO-7 cleanroom suite inside Zone K: add a 600 SF main cleanroom with `+0.05\" WC` positive pressure, a 150 SF gowning airlock / anteroom with `+0.025\" WC` pressure, a 3-compartment sink (`FS-1`), and a commercial grease interceptor on the plumbing wet-wall."*

#### 4. Conducting an Egress & Life-Safety Compliance Audit
> *"Review all rooms and doors in `src/data/facility-layout.json` against standard IBC / NFPA life-safety guidelines. Check that every occupied room has a clear exit path, verify that travel distance to an exterior door does not exceed 150 feet, and add fire extinguishers (`safety-equipment` code `FE`) so that travel distance to an extinguisher is under 75 feet."*

#### 5. Configuring Regulated Security & Camera Coverage
> *"Enable `'security-compliance'` in `src/data/facility-layout.json`. Mark the vault as `isLimitedAccess: true`, add RFID badge readers (`access-control`) at all entry doors, and position 24/7 security cameras (`security-camera`) with appropriate FOV aim angles so that all perimeter doors and interior storage areas have complete visual coverage."*

---

## Discipline Sheet Views & Hotkeys

Switch sheet views instantly using the top-bar dropdown or number keys `1`–`6`:

| Key | Sheet | Title | Discipline Focus |
| :-: | :---: | :--- | :--- |
| **`1`** | `A-100` | **Master Architectural Plan** | Master facility overview displaying all rooms, equipment, doors, structural columns, and exterior dimension strings. |
| **`2`** | `A-101` | **Room Usage & Finishes** | Mutes equipment footprints; expands room schedules to display SF, ceiling heights, wall assemblies, and floor finishes. |
| **`3`** | `Q-101` | **Equipment Schedule** | Highlights process equipment, machinery, and workstations; renders 3-foot operator safety clearance zones (`C` key). |
| **`4`** | `SEC-101`| **Security & Compliance** | *(Security Module)* Highlights 24/7 cameras with interactive FOV coverage cones, badge readers, vault boundaries, and red dashed `L.A.A.` borders. |
| **`5`** | `LS-101`| **Life Safety & Egress** | Highlights life safety stations (`FE`, `EW`, `AED`); computes green dashed egress travel lines and illuminates `EXIT` signs. |
| **`6`** | `M-101` | **Contractor MEP Utilities** | Highlights plumbing sinks, floor drains, HVAC scrubbers, electrical MDPs, and room pressure differential badges. |

### Keyboard Shortcuts Reference

| Shortcut | Action | Shortcut | Action |
| :--- | :--- | :--- | :--- |
| **`V`** | Select / Pointer tool | **`S`** | Place Structural Partition / Column |
| **`H`** | Hand / Pan tool | **`M`** | Tape Measure Distance tool |
| **`R`** | Place Room tool | **`Esc`** | Cancel active tool / Return to Select |
| **`D`** | Place Door tool | **`Cmd/Ctrl + Z`** | Undo |
| **`E`** | Place Equipment tool | **`Cmd/Ctrl + Shift + Z`** | Redo |
| **`Hold Space`** | Temporary Pan Canvas | **`Shift + Drag`** | Fine 1° rotation precision |
| **`1`–`6`** | Switch Discipline Sheet View (A-100 to M-101) | | |

---

## Declarative JSON Schema Reference

The layout document is structured cleanly according to TypeScript definitions in [`src/types/facility.ts`](src/types/facility.ts):

```typescript
interface FacilityLayoutData {
  version: string;                          // Semantic schema version (e.g., "2.0.0")
  enabledModules: DomainModuleId[];         // Active modules: "cultivation" | "edible-cleanroom" | "security-compliance"
  metadata: FacilityMetadata;               // Project name, address, architect, square footages
  shellPerimeter: Point2D[];                // Array of { x, y } boundary vertices in decimal feet
  rooms: FacilityRoom[];                    // Partitioned spaces, categories, finishes, pressures
  doors: FacilityDoor[];                    // Single/double swing, overhead docks, sliding doors
  equipment: FacilityEquipment[];           // Machinery, racks, benches, cameras, sinks, MEP
  structuralElements: FacilityStructuralElement[]; // Interior demising walls, columns, dock pits
  dimensions: DimensionAnnotation[];        // Exterior architectural dimension strings
  pdfCalibration?: PdfCalibration;          // Optional raster floorplan calibration parameters
}
```

### Essential Units & Coordinates
- **Units**: All dimensions (`x`, `y`, `width`, `height`, `wallHeight`, `clearanceFt`) are stored in **decimal feet** (`1.0` = 1'-0", `0.5` = 6", `0.25` = 3").
- **Origin `(0, 0)`**: Top-left (North-West) interior reference corner of the building shell.
- **Axes**: `+X` extends East (Width), `+Y` extends South (Length).
- **Coordinate Anchors**:
  - **Rooms, Equipment, Structural Elements**: `(x, y)` marks the **top-left corner** of the element in feet.
  - **Doors**: `(x, y)` marks the **geometric center of the wall opening** in feet.
  - **Exterior / Setback Elements**: Items outside the North or West walls (e.g. exterior security cameras, storefront entry glazing, dimension strings) naturally use negative coordinates (e.g. `y: -3.4`).
- **Scale**: In 2D SVG space, `FT = 10` ($1\text{ foot} = 10\text{ SVG user units}$).

---

## Exporting Deliverables

The studio provides one-click export actions in the top-right toolbar:

- **Vector SVG Blueprint (`.svg`)**: Scalable, high-precision architectural vector output formatted for CAD tools, Illustrator, or web viewing.
- **High-Resolution PNG (`.png`)**: 2× resolution raster blueprint with title block and legend plate, ideal for contractor bids and landlord submittals.
- **Print / PDF Blueprint**: Clean browser print stylesheet calibrated for standard 11"×17" (Tabloid) and 24"×36" (Arch D) architectural layouts.
- **Layout JSON (`.json`)**: Download the active declarative layout document for version control, backup, or sharing.

---

## Contributing & Open Source Standards

We welcome contributions from architects, facility engineers, software developers, and AI researchers!
Please read our **[Contributing Guide](CONTRIBUTING.md)** and **[Code of Conduct](CODE_OF_CONDUCT.md)** before submitting pull requests.

### Developer Documentation & Architecture Decisions
- **[Extending the Studio](docs/extending-the-studio.md)**: Playbook for adding new domain modules, presets, and discipline sheets.
- **[ADR-0001: SVG Coordinate System & Scale Invariants](docs/adr/ADR-0001-svg-coordinate-system-and-scale.md)**
- **[ADR-0002: Bidirectional Disk Sync & Concurrency Control](docs/adr/ADR-0002-bidirectional-disk-sync-architecture.md)**

### Code Standards
- **Strict TypeScript**: No `any` types; all entities must satisfy interfaces in [`src/types/facility.ts`](src/types/facility.ts).
- **Decentralized Leaf Architecture**: Avoid monolithic wrapper hooks. Keep state subscriptions, pointer events, and persistence calls inside the individual leaf components (`RoomNode`, `DoorNode`, `EquipmentNode`).
- **Clean Git Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`).

### Development Workflow

```bash
# Start Vite dev server with live /api/layout sync
npm run dev

# Run unit & integration test suite (Vitest)
npm test

# Run tests with code coverage report
npm run test:coverage

# Typecheck the codebase
npm run typecheck

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## License

This project is open-source software licensed under the **[MIT License](LICENSE)**. You are free to use, modify, distribute, and integrate this software into commercial or personal projects.
