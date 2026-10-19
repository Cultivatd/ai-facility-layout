# GitHub Copilot Instructions — AI Facility Layout Studio

## Project Overview
This repository is an open-source **2D Architectural CAD + 3D Isometric Facility Layout Studio** designed for human + AI real-time iteration.

## Key Data Architecture
- **Active Document**: `src/data/facility-layout.json`
- **Schema & Types**: `src/types/facility.ts`
- **Domain Modules**: `src/data/domain-modules.ts`
- **Presets**: `src/data/layout-presets.ts`
- **Live Sync**: Modifying `src/data/facility-layout.json` immediately syncs with the running browser canvas via `/api/layout`.

## Coordinate System & Units
- All coordinates and dimensions are in **decimal feet** (`1.0` = 1'-0", `0.5` = 6", `0.25` = 3").
- Origin `(0, 0)` is the North-West interior building shell corner.
- `+X` points East (Width), `+Y` points South (Length).
- Scale: `FT = 10` (10 SVG user units per foot).

## Coordinate Anchors
- **Rooms, Equipment, Structural Elements**: Top-left `(x, y)` (`minX`, `minY`).
- **Doors**: Geometric center of the opening `(x, y)` along the wall centerline.
- **Exterior Setbacks**: Can use negative coordinates relative to `(0, 0)`.

## Code Conventions
- Decentralized Zustand stores: `layoutStore.ts` (data and disk sync), `viewStore.ts` (view/sheet selection).
- Functional React components with SVG layers and Three.js 3D viewport.
- Maintain test coverage across all domain data, stores, and UI components using Vitest and Happy-DOM.
