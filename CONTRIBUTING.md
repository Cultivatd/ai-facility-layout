# Contributing to AI Facility Layout Studio

Thank you for your interest in contributing to **AI Facility Layout Studio**! We welcome contributions from developers, architects, industrial planners, and the AI engineering community.

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Modern Chromium or WebKit browser with WebGL support

### Local Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/Cultivatd/ai-facility-layout.git
   cd ai-facility-layout
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite server includes live bidirectional disk synchronization with `src/data/facility-layout.json`.

---

## Development Workflow

### Scripts
- `npm run dev`: Start development server with live reload and disk sync middleware.
- `npm run typecheck`: Run TypeScript compiler check without emitting output.
- `npm test`: Run the test suite once with Vitest.
- `npm run test:watch`: Run tests in watch mode during development.
- `npm run test:coverage`: Generate a code coverage report.
- `npm run build`: Compile and build the production bundle into `dist/`.

### Branching Strategy
- Feature development happens on branch off `main` (e.g. `feature/plumbing-slopes`, `fix/door-mask-clipping`).
- Submit pull requests against the `main` branch.

---

## Architectural & CAD Drafting Standards

When contributing features or fixes, ensure compliance with these architectural CAD standards:

1. **Units**: All dimensions and coordinate values are in **decimal feet** (`1.0` = 1'-0", `0.5` = 6", `0.25` = 3").
2. **Coordinate System**:
   - `(0, 0)` is the top-left (North-West) interior corner of the building shell.
   - `+X` points East, `+Y` points South.
   - SVG scale is `FT = 10` (10 SVG user units per foot).
3. **Coordinate Anchors**:
   - Rooms, equipment, and structural elements anchor at **top-left `(x, y)`**.
   - Doors anchor at the **geometric center** of the opening along the wall centerline.
4. **Three.js & WebGL Hygiene**:
   - Never create new `WebGLRenderer` instances on every render.
   - Always call `.dispose()` on unused geometries, materials, and textures to prevent memory leaks and `CONTEXT_LOST_WEBGL` errors.
5. **Decentralized State**:
   - Prefer updating leaf Zustand stores (`layoutStore.ts`, `viewStore.ts`) rather than introducing monolithic wrapper contexts.

---

## Testing Guidelines

- Every new store mutation, math utility, or UI component must have accompanying unit/component tests in `src/`.
- Run `npm test` and `npm run typecheck` before pushing your branch.
- PRs that break existing tests or fail typechecking will not be merged.

---

## Submitting a Pull Request

1. Ensure all tests and type checks pass cleanly:
   ```bash
   npm run typecheck && npm test && npm run build
   ```
2. Commit your changes with clear, descriptive commit messages (following Conventional Commits where possible: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
3. Push to your fork and submit a PR using the provided PR template.
