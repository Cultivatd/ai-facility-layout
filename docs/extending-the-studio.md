# Extending AI Facility Layout Studio

This guide explains how to extend **AI Facility Layout Studio** by adding new pluggable industry domain modules, layout presets, and discipline sheet views.

---

## 1. Adding a Pluggable Domain Module

Domain modules (`DomainModuleId` in `src/types/facility.ts`) allow customizing the studio for specific industries (e.g. cold storage, semiconductor fabrication, commercial kitchens, pharmaceutical compounding).

### Step 1: Update TypeScript Definitions
In `src/types/facility.ts`, add your module ID to `DomainModuleId`:

```typescript
export type DomainModuleId =
  | 'cultivation'
  | 'edible-cleanroom'
  | 'security-compliance'
  | 'cold-storage'; // New module
```

If your module introduces new room types, equipment types, or structural elements, extend the corresponding union types:
```typescript
export type RoomType =
  | 'office'
  | 'restroom'
  // ...
  | 'blast-freezer'; // New room type

export type EquipmentCategory =
  | 'process'
  | 'storage'
  // ...
  | 'refrigeration-rack'; // New category
```

### Step 2: Register Module in `src/data/domain-modules.ts`
Define your module metadata, quick-add templates, and color palettes:

```typescript
export const DOMAIN_MODULES: Record<DomainModuleId, DomainModuleDefinition> = {
  // ... existing modules
  'cold-storage': {
    id: 'cold-storage',
    name: 'Industrial Cold Storage & Blast Freezing',
    description: 'Walk-in freezers, insulated metal panels (IMP), defrost condensate lines, and dock thermal seals.',
    badge: 'COLD',
    roomTemplates: [
      {
        name: 'Blast Freezer -20°F',
        type: 'storage',
        width: 30,
        height: 20,
        color: '#0284c7',
        clearanceRequirements: '48" perimeter airflow',
      },
    ],
    equipmentTemplates: [
      {
        name: 'Evaporator Fan Unit',
        category: 'hvac',
        width: 8,
        height: 4,
        clearanceZone: { front: 4, back: 2, sides: 1 },
      },
    ],
  },
};
```

### Step 3: Add Styling and 3D Material Mappings
- **2D Color & Rendering**: Add corresponding room/equipment color themes in `src/utils/dimensions.ts` (`ROOM_TYPE_COLORS`, `EQUIPMENT_COLORS`).
- **3D Isometric**: Add specialized Three.js material representations in `src/components/preview3d/IsometricPreview3D.tsx` (e.g. insulated wall panel textures or metallic refrigeration components).

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
