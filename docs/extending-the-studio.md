# Extending AI Facility Layout Studio

This guide explains how to extend **AI Facility Layout Studio** by creating self-contained pluggable industry modules, layout presets, and discipline sheet views.

---

## 1. Creating a Self-Contained Domain Module

Pluggable domain modules package industry-specific templates, category metadata, and visual styling into **a single, self-contained file**. Modules can be shared as standalone files, GitHub gists, or npm packages.

### Automatic Type Safety
All module identifiers (`DomainModuleId`), room categories (`RoomCategory`), and equipment categories (`EquipmentCategory`) use open TypeScript string unions (`Builtin | (string & {})`). This means:
- You get **full IDE autocompletion** for all built-in options.
- Any custom module ID or custom category is **automatically valid TypeScript** without modifying core type definitions in `src/types/facility.ts`.

---

### Step 1: Define Your Module in a Single File

Create a file for your module (e.g. `src/modules/custom/cold-storage.ts`):

```typescript
import { defineDomainModule } from '../types';

export const coldStorageModule = defineDomainModule({
  id: 'cold-storage',
  name: 'Industrial Cold Storage & Blast Freezing',
  shortLabel: 'Cold Storage',
  badgeColor: '#0284c7',
  description:
    'Walk-in blast freezers, insulated metal panels (IMP), defrost condensate lines, and dock thermal seals.',
  features: [
    'Blast Freezer (-20°F) insulated room category',
    'Ceiling-Hung Evaporator Coil and Compressor Rack symbols',
    'Refrigerant piping line callouts and thermal break thresholds',
  ],
  roomCategories: ['cold-storage'],
  equipmentCategories: ['machinery', 'plumbing'],

  // Quick-Add Room Templates
  roomTemplates: [
    {
      id: 'tpl-room-blast-freezer',
      label: 'Blast Freezer -20°F (30×20)',
      room: {
        name: 'Blast Freezer -20°F',
        code: 'FRZ-1',
        category: 'cold-storage',
        subtitle: 'Insulated Metal Panel (-20°F)',
        width: 30,
        height: 20,
        wallHeight: 16,
        isExisting: false,
        materialCallout: 'Walls: 5" IMP R-40 • Floor: Heated Sub-Slab + Insulated Epoxy',
        pressureDifferential: '-0.02" WC THERMAL SEAL',
        ceilingType: 'imp-insulated',
        floorFinish: 'sealed-concrete',
        showDimensions: true,
      },
    },
  ],

  // Quick-Add Equipment Templates
  equipmentTemplates: [
    {
      id: 'tpl-eq-evap-fan',
      label: 'Ceiling Evaporator Unit (8×4)',
      equipment: {
        name: 'Ceiling Evaporator Coil',
        code: 'EVAP-1',
        category: 'machinery',
        width: 8,
        height: 4,
        elevationHeight: 4,
        rotation: 0,
        clearanceFt: 3,
        specs: '460V 3Ph • DX Ammonia/Freon • Hot Gas Defrost',
        isExisting: false,
      },
    },
  ],

  // Self-Contained Visual Styling (2D Canvas & 3D Isometric)
  roomCategoryStyles: {
    'cold-storage': {
      label: 'Cold Storage / Freezer',
      fillInvestor: 'rgba(2, 132, 199, 0.20)',
      strokeInvestor: '#0284c7',
      badgeColor: '#0284c7',
      fill3D: '#0284c7',
      hatchPattern: 'grid',
    },
  },
});
```

---

### Step 2: Register Your Module

Register the module with a single line:

```typescript
import { registerDomainModule } from './modules';
import { coldStorageModule } from './modules/custom/cold-storage';

registerDomainModule(coldStorageModule);
```

That's it!
- The module immediately appears in the **Modules** menu in the top bar and sidebar.
- Enabling the module unlocks its room and equipment templates in the **Space Program** catalog.
- The 2D SVG canvas and 3D isometric viewport automatically use your custom category colors and hatching styles.

---

## 2. Adding a Layout Preset

Presets allow users to quickly instantiate standard facility types from the **Presets** dropdown in `StudioHeader.tsx`.

### Step 1: Define the Preset Data
In `src/data/layout-presets.ts`:
1. Create a preset layout object matching `FacilityLayoutData`:
```typescript
export const PRESET_COLD_STORAGE: FacilityLayoutData = {
  schemaVersion: 1,
  metadata: {
    facilityName: 'Cold Storage & Distribution Center',
    revision: 'REV-01',
    designer: 'AI Cold Chain Specialist',
    lastModified: new Date().toISOString(),
  },
  enabledModules: ['cold-storage'],
  shellPerimeter: [
    { x: 0, y: 0 },
    { x: 120, y: 0 },
    { x: 120, y: 80 },
    { x: 0, y: 80 },
  ],
  rooms: [...],
  equipment: [...],
  doors: [...],
  structuralElements: [...],
};
```

2. Add it to `FACILITY_PRESETS` list in `src/data/layout-presets.ts`:
```typescript
export const FACILITY_PRESETS: LayoutPreset[] = [
  // ... existing presets
  {
    id: 'cold-storage-distribution',
    name: 'Cold Storage & Distribution Center (120×80)',
    description: 'Walk-in blast freezers, ambient staging docks, and refrigeration engine room.',
    layout: PRESET_COLD_STORAGE,
  },
];
```

### Step 2: Add Preset Unit Tests
Add verification tests in `src/data/layout-presets.test.ts` to ensure:
- Elements reside within shell bounds.
- Door orientations and swing parameters are valid.
- Equipment IDs are unique.

---

## 3. Adding a Discipline Sheet View

Discipline views filter elements and render specialized engineering overlays (e.g. Life Safety, Security, Electrical/MEP).

### Step 1: Add Discipline View Definition in `src/data/discipline-views.ts`
```typescript
export const DISCIPLINE_VIEWS: DisciplineViewConfig[] = [
  // ...
  {
    id: 'refrigeration-piping',
    sheetCode: 'R-101',
    title: 'Refrigeration & Condensate Piping Plan',
    description: 'Highlights suction/liquid refrigerant lines, defrost piping, and compressors.',
    visibleCategories: ['hvac', 'plumbing'],
    highlightClass: 'ring-2 ring-cyan-500',
    overlayLayer: 'refrigeration',
  },
];
```

### Step 2: Add Overlay Rendering Logic
In `src/components/canvas/DisciplineOverlayLayer.tsx`:
- Render custom SVG annotations, line paths, directional flow arrows, or code compliance symbols when `currentSheetView === 'refrigeration-piping'`.

---

## 4. Architectural Drafting Best Practices

1. **Decimal Feet Invariant**: Never store inches or metric units directly in the JSON document; convert to decimal feet (`1.0 = 1'-0"`).
2. **Top-Left vs. Center Anchors**:
   - Rooms & Equipment: Top-left `(x, y)` (`minX, minY`).
   - Doors: Wall opening centerline `(x, y)`.
3. **SVG Transform Scale**: Use `FT = 10` for converting decimal feet to SVG coordinate space.
4. **Three.js Garbage Collection**: Always dispose geometries and materials in `useEffect` cleanup handlers or when reconstructing nodes.
