# ADR-0002: Bidirectional Disk Sync & State Race Condition Mitigation

## Status
Accepted

## Context
AI Facility Layout Studio is designed for pair programming between human architects and autonomous AI agents (Claude Code, Cursor, Windsurf, Copilot).
The human interacts with the browser UI via direct manipulation (dragging rooms, resizing walls, placing equipment), while the AI agent directly reads and modifies `src/data/facility-layout.json` on disk.
Without proper synchronization and concurrency handling, this architecture risks:
1. **Local write overwrites**: Rapid user edits debounced in memory clobbering disk updates made by an AI agent.
2. **Infinite echo loops**: A browser-initiated save triggering a disk-watcher change event, which re-imports the layout and triggers another save.
3. **Out-of-order writes**: Slower asynchronous disk writes resolving after faster subsequent edits, corrupting state with stale data.

## Decision

### 1. File-Based Bridge via Vite Dev Server Middleware
Rather than requiring a separate backend service or database, a lightweight Vite plugin (`facilityLayoutDiskSyncPlugin` in `vite.config.ts`) provides HTTP endpoints:
- `GET /api/layout`: Returns current layout JSON and file modification timestamp (`mtimeMs`).
- `POST /api/layout`: Writes incoming JSON to `src/data/facility-layout.json` and creates throttled snapshots in `src/data/backups/`.
- `GET /api/layout/backups`: Lists automated and manual snapshots.
- `POST /api/layout/restore`: Restores an earlier snapshot to disk.

### 2. Revision Monotonic Counter & Debounce Handling
To prevent out-of-order writes and race conditions:
- `saveRevision`: A monotonic integer in `src/store/layoutStore.ts` increments before every scheduled or immediate write.
- `writeLayoutToDisk` captures its calling revision. If a subsequent edit occurred while the HTTP request was in flight (`revision !== saveRevision`), the completion callback does not transition sync status to `'synced'`.
- `hasPendingDiskWrite()`: Exposed by `layoutStore.ts` to report whether an unsaved debounce timer (`saveTimeout`) is currently pending.

### 3. Smart Polling in `DiskSyncWatcher`
The browser's polling loop (`DiskSyncWatcher.tsx`, interval 1.5s):
1. Calls `GET /api/layout`.
2. Compares disk `mtimeMs` with the store's `lastDiskMtimeMs`.
3. **Guards against local overwrite**: If `hasPendingDiskWrite()` is true, the disk watcher suppresses the update to allow local edits to flush to disk first.
4. If disk `mtimeMs` is strictly newer and no local write is pending, `replaceLayout(diskLayout)` is invoked, updating the canvas without clearing the undo/redo history stack unnecessarily.

### 4. Undo/Redo Timeline Integrity
When mutations occur, the redo stack (`future`) is unconditionally cleared (`future: []`). Undo snapshots are capped at 50 historical steps using structured clones (`pushSnapshot`), preventing memory leaks while ensuring deterministic timeline navigation.

## Consequences
- **Positive**: Smooth, near real-time collaboration between AI agents modifying disk files and humans editing in the browser. Zero setup beyond `npm run dev`.
- **Trade-off**: Polling creates small periodic localhost HTTP requests (negligible CPU and network overhead).
