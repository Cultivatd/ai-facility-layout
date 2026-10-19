# ADR-0001: SVG Coordinate System, Scale Invariants & Placement Anchors

## Status
Accepted

## Context
When designing 2D architectural CAD interfaces paired with 3D isometric projections and real-time AI generation, units and coordinate systems often suffer from unit confusion (meters vs. feet vs. pixels vs. inches) and anchor ambiguity (top-left vs. center). Furthermore, rendering CAD drawings directly in web SVG requires an intuitive ratio between user units and real-world dimensions.

## Decision

### 1. Canonical Units: Decimal Feet
All positions (`x`, `y`), dimensions (`width`, `height`), wall heights, and safety clearances stored in `src/data/facility-layout.json` are strictly expressed in **decimal feet**:
- `1.0` = 1'-0"
- `0.5` = 6"
- `0.25` = 3"
- `0.0833` ≈ 1"

### 2. SVG Rendering Scale Factor (`FT = 10`)
To provide crisp vector rendering, smooth sub-pixel panning/zooming, and clean grid subdivisions, the scale factor is set to:
$$\text{FT} = 10$$
1 foot in physical space corresponds to 10 SVG user units. Thus, a 40' × 60' building shell renders as a 400 × 600 unit SVG geometry.

### 3. Coordinate Origin & Axes
- **Origin `(0, 0)`**: Set to the top-left (North-West) interior corner of the building shell.
- **Axes**:
  - `+X` points East (Building Width).
  - `+Y` points South (Building Length).
- **Exterior Setbacks**: Property lines, setback fences, truck aprons, and exterior chillers may use negative coordinates (e.g. `x = -15`, `y = -10`) without breaking canvas clipping or viewBox bounding box math (`computeShellBounds`).

### 4. Element Coordinate Anchors
To eliminate placement ambiguity for AI models and human drafting tools:
- **Rooms, Equipment & Structural Elements**: Anchor at top-left `(x, y)` (`minX`, `minY`). The element bounds occupy $[x, x + \text{width}] \times [y, y + \text{height}]$.
- **Doors**: Anchor at the **geometric center** of the opening along the wall centerline `(x, y)`. The opening cutout extends $x \pm \frac{\text{width}}{2}$ (horizontal wall) or $y \pm \frac{\text{width}}{2}$ (vertical wall).

### 5. Rotation Semantics
- Rotation angle is in degrees clockwise $[0^\circ, 360^\circ)$.
- Default rotation for equipment is `0` so all typography and tags remain upright.
- Resizing rotated equipment projects world mouse deltas through the inverse 2D rotation matrix:
  $$\begin{bmatrix} \Delta x_{\text{local}} \\ \Delta y_{\text{local}} \end{bmatrix} = \begin{bmatrix} \cos(-\theta) & -\sin(-\theta) \\ \sin(-\theta) & \cos(-\theta) \end{bmatrix} \begin{bmatrix} \Delta x_{\text{world}} \\ \Delta y_{\text{world}} \end{bmatrix}$$
  This prevents bounding box explosion and coordinate drift during interactive resize operations.

## Consequences
- **Positive**: Clean math across 2D SVG canvas and 3D Three.js camera centering. No ambiguous coordinate interpretations between AI agent and UI rendering.
- **Trade-off**: When exporting to external DXF/DWG tools, dimensions must be scaled from feet to inches or millimeters depending on the target system's drawing units.
