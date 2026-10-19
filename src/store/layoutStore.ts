import { create } from 'zustand';
import initialLayoutJson from '../data/facility-layout.json';
import {
  DomainModuleId,
  FacilityDoor,
  FacilityEquipment,
  FacilityLayoutData,
  FacilityMetadata,
  FacilityRoom,
  FacilityStructuralElement,
} from '../types/facility';

const MAX_HISTORY = 60;

interface LayoutStoreState {
  layout: FacilityLayoutData;
  past: FacilityLayoutData[];
  future: FacilityLayoutData[];
  lastSyncedMtimeMs: number;
  syncStatus: 'synced' | 'saving' | 'external-update' | 'offline';
  setSyncInfo: (mtimeMs: number, status: LayoutStoreState['syncStatus']) => void;
  recordHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;
  replaceLayout: (nextLayout: FacilityLayoutData, persist?: boolean) => void;
  updateMetadata: (patch: Partial<FacilityMetadata>) => void;
  toggleDomainModule: (moduleId: DomainModuleId) => void;
  setRectangularShell: (widthFt: number, lengthFt: number) => void;
  updateRoom: (id: string, patch: Partial<FacilityRoom>, persist?: boolean) => void;
  addRoom: (room: FacilityRoom) => void;
  deleteRoom: (id: string) => void;
  updateDoor: (id: string, patch: Partial<FacilityDoor>, persist?: boolean) => void;
  addDoor: (door: FacilityDoor) => void;
  deleteDoor: (id: string) => void;
  updateEquipment: (id: string, patch: Partial<FacilityEquipment>, persist?: boolean) => void;
  addEquipment: (item: FacilityEquipment) => void;
  deleteEquipment: (id: string) => void;
  updateStructural: (
    id: string,
    patch: Partial<FacilityStructuralElement>,
    persist?: boolean
  ) => void;
  addStructural: (item: FacilityStructuralElement) => void;
  deleteStructural: (id: string) => void;
  persistCurrentLayout: () => Promise<void>;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let saveRevision = 0;
let lastDiscreteSnapshotTimeMs = 0;

export function hasPendingDiskWrite(): boolean {
  return saveTimeout !== null;
}

async function writeLayoutToDisk(
  layout: FacilityLayoutData,
  revision: number,
  onDone: (mtimeMs: number, status: LayoutStoreState['syncStatus']) => void
) {
  try {
    const res = await fetch('/api/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layout),
    });
    if (res.ok) {
      const data = await res.json();
      // Only transition to synced if no newer revision was queued in-flight
      if (revision === saveRevision) {
        onDone(data.mtimeMs ?? Date.now(), 'synced');
      }
    } else {
      if (revision === saveRevision) {
        onDone(Date.now(), 'offline');
      }
    }
  } catch {
    if (revision === saveRevision) {
      onDone(Date.now(), 'offline');
    }
  }
}

function scheduleDiskWrite(
  layout: FacilityLayoutData,
  setSyncInfo: (mtimeMs: number, status: LayoutStoreState['syncStatus']) => void
) {
  saveRevision++;
  const thisRevision = saveRevision;
  setSyncInfo(Date.now(), 'saving');
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    void writeLayoutToDisk(layout, thisRevision, setSyncInfo);
  }, 200);
}

function pushSnapshot(
  past: FacilityLayoutData[],
  current: FacilityLayoutData
): FacilityLayoutData[] {
  const cloned = structuredClone(current);
  const nextPast = [...past, cloned];
  if (nextPast.length > MAX_HISTORY) {
    return nextPast.slice(nextPast.length - MAX_HISTORY);
  }
  return nextPast;
}

export const useLayoutStore = create<LayoutStoreState>((set, get) => ({
  layout: initialLayoutJson as unknown as FacilityLayoutData,
  past: [],
  future: [],
  lastSyncedMtimeMs: 0,
  syncStatus: 'synced',

  setSyncInfo: (mtimeMs, syncStatus) => set({ lastSyncedMtimeMs: mtimeMs, syncStatus }),

  recordHistorySnapshot: () => {
    set((state) => ({
      past: pushSnapshot(state.past, state.layout),
      future: [],
    }));
  },

  undo: () => {
    const { past, future, layout, setSyncInfo } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const nextPast = past.slice(0, past.length - 1);
    const nextFuture = [structuredClone(layout), ...future].slice(0, MAX_HISTORY);
    set({
      layout: previous,
      past: nextPast,
      future: nextFuture,
    });
    scheduleDiskWrite(previous, setSyncInfo);
  },

  redo: () => {
    const { past, future, layout, setSyncInfo } = get();
    if (future.length === 0) return;
    const next = future[0];
    const nextFuture = future.slice(1);
    const nextPast = pushSnapshot(past, layout);
    set({
      layout: next,
      past: nextPast,
      future: nextFuture,
    });
    scheduleDiskWrite(next, setSyncInfo);
  },

  replaceLayout: (nextLayout, persist = true) => {
    if (persist) {
      set((state) => ({
        past: pushSnapshot(state.past, state.layout),
        future: [],
        layout: nextLayout,
      }));
      scheduleDiskWrite(nextLayout, get().setSyncInfo);
    } else {
      set({ layout: nextLayout });
    }
  },

  updateMetadata: (patch) => {
    const now = Date.now();
    const shouldPush = now - lastDiscreteSnapshotTimeMs > 1200;
    lastDiscreteSnapshotTimeMs = now;

    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      metadata: { ...current.metadata, ...patch },
    };
    set((state) => ({
      past: shouldPush ? pushSnapshot(state.past, current) : state.past,
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  toggleDomainModule: (moduleId) => {
    const current = get().layout;
    const existing = current.enabledModules ?? [];
    const nextModules = existing.includes(moduleId)
      ? existing.filter((m) => m !== moduleId)
      : [...existing, moduleId];

    const nextLayout: FacilityLayoutData = {
      ...current,
      enabledModules: nextModules,
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  setRectangularShell: (widthFt, lengthFt) => {
    const w = Math.max(15, Number(widthFt.toFixed(2)));
    const h = Math.max(15, Number(lengthFt.toFixed(2)));
    const usf = Math.round(w * h);
    const current = get().layout;

    const nextLayout: FacilityLayoutData = {
      ...current,
      pdfCalibration: undefined,
      metadata: {
        ...current.metadata,
        usableSqFt: usf,
        rentableSqFt: Math.round(usf * 1.05),
      },
      shellPerimeter: [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
      ],
      dimensions: [
        {
          id: 'dim-shell-top',
          x1: 0,
          y1: -2.2,
          x2: w,
          y2: -2.2,
          offsetFt: 2.2,
          orientation: 'horizontal',
          isShellDimension: true,
        },
        {
          id: 'dim-shell-left',
          x1: -2.2,
          y1: 0,
          x2: -2.2,
          y2: h,
          offsetFt: 2.2,
          orientation: 'vertical',
          isShellDimension: true,
        },
      ],
    };

    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  updateRoom: (id, patch, persist = true) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      rooms: current.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    };
    if (persist) {
      const now = Date.now();
      const shouldPush = now - lastDiscreteSnapshotTimeMs > 900;
      lastDiscreteSnapshotTimeMs = now;
      set((state) => ({
        past: shouldPush ? pushSnapshot(state.past, current) : state.past,
        future: [],
        layout: nextLayout,
      }));
      scheduleDiskWrite(nextLayout, get().setSyncInfo);
    } else {
      set({ layout: nextLayout });
    }
  },

  addRoom: (room) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      rooms: [...current.rooms, room],
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  deleteRoom: (id) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      rooms: current.rooms.filter((r) => r.id !== id),
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  updateDoor: (id, patch, persist = true) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      doors: current.doors.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    };
    if (persist) {
      const now = Date.now();
      const shouldPush = now - lastDiscreteSnapshotTimeMs > 900;
      lastDiscreteSnapshotTimeMs = now;
      set((state) => ({
        past: shouldPush ? pushSnapshot(state.past, current) : state.past,
        future: [],
        layout: nextLayout,
      }));
      scheduleDiskWrite(nextLayout, get().setSyncInfo);
    } else {
      set({ layout: nextLayout });
    }
  },

  addDoor: (door) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      doors: [...current.doors, door],
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  deleteDoor: (id) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      doors: current.doors.filter((d) => d.id !== id),
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  updateEquipment: (id, patch, persist = true) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      equipment: current.equipment.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    };
    if (persist) {
      const now = Date.now();
      const shouldPush = now - lastDiscreteSnapshotTimeMs > 900;
      lastDiscreteSnapshotTimeMs = now;
      set((state) => ({
        past: shouldPush ? pushSnapshot(state.past, current) : state.past,
        future: [],
        layout: nextLayout,
      }));
      scheduleDiskWrite(nextLayout, get().setSyncInfo);
    } else {
      set({ layout: nextLayout });
    }
  },

  addEquipment: (item) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      equipment: [...current.equipment, item],
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  deleteEquipment: (id) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      equipment: current.equipment.filter((e) => e.id !== id),
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  updateStructural: (id, patch, persist = true) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      structuralElements: current.structuralElements.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    };
    if (persist) {
      const now = Date.now();
      const shouldPush = now - lastDiscreteSnapshotTimeMs > 900;
      lastDiscreteSnapshotTimeMs = now;
      set((state) => ({
        past: shouldPush ? pushSnapshot(state.past, current) : state.past,
        future: [],
        layout: nextLayout,
      }));
      scheduleDiskWrite(nextLayout, get().setSyncInfo);
    } else {
      set({ layout: nextLayout });
    }
  },

  addStructural: (item) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      structuralElements: [...current.structuralElements, item],
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  deleteStructural: (id) => {
    const current = get().layout;
    const nextLayout: FacilityLayoutData = {
      ...current,
      structuralElements: current.structuralElements.filter((s) => s.id !== id),
    };
    set((state) => ({
      past: pushSnapshot(state.past, current),
      future: [],
      layout: nextLayout,
    }));
    scheduleDiskWrite(nextLayout, get().setSyncInfo);
  },

  persistCurrentLayout: async () => {
    if (saveTimeout !== null) {
      window.clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    saveRevision++;
    const thisRevision = saveRevision;
    await writeLayoutToDisk(get().layout, thisRevision, get().setSyncInfo);
  },
}));
