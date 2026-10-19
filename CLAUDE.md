# Claude Code Guide — AI Facility Layout Studio

## Project Overview
Interactive 2D Architectural CAD + 3D Isometric Facility Layout Studio built for human + AI real-time iteration.

## Key Files & Structure
- **Active Document**: `src/data/facility-layout.json` (editing this file updates the browser canvas live via `/api/layout`)
- **Schema & Types**: `src/types/facility.ts`
- **Domain Modules**: `src/data/domain-modules.ts`
- **Presets**: `src/data/layout-presets.ts`
- **Full Architecture & Maintainer Guide**: `AGENTS.md`

## Coordinate System & Units
- All coordinates and dimensions are in **decimal feet** (`1.0` = 1'-0", `0.5` = 6").
- Origin `(0, 0)` is the North-West interior shell corner.
- `+X` points East (Width), `+Y` points South (Length).
- In SVG rendering, `FT = 10` (10 SVG units per foot).

## Commands
- Dev Server: `npm run dev` (starts on `http://localhost:5173/` with `/api/layout` middleware)
- Typecheck: `npx tsc --noEmit`
- Build: `npm run build`
