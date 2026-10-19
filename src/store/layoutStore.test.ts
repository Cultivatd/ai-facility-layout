import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLayoutStore } from './layoutStore';
import { GENERAL_INDUSTRIAL_PRESET, BLANK_SHELL_PRESET } from '../data/layout-presets';

describe('layoutStore', () => {
  beforeEach(() => {
    // Reset to BLANK_SHELL_PRESET before each test and clear history
    useLayoutStore.getState().replaceLayout(structuredClone(BLANK_SHELL_PRESET), false);
    useLayoutStore.setState({ past: [], future: [] });
  });

  it('initializes with a valid layout', () => {
    const layout = useLayoutStore.getState().layout;
    expect(layout.version).toBe('2.0.0');
    expect(layout.shellPerimeter.length).toBeGreaterThanOrEqual(4);
    expect(layout.metadata).toBeDefined();
  });

  describe('module management', () => {
    it('toggles domain modules on and off', () => {
      expect(useLayoutStore.getState().layout.enabledModules).not.toContain('cultivation');

      useLayoutStore.getState().toggleDomainModule('cultivation');
      expect(useLayoutStore.getState().layout.enabledModules).toContain('cultivation');

      useLayoutStore.getState().toggleDomainModule('cultivation');
      expect(useLayoutStore.getState().layout.enabledModules).not.toContain('cultivation');
    });
  });

  describe('shell resizing', () => {
    it('resizes rectangular shell and recalculates area', () => {
      useLayoutStore.getState().setRectangularShell(70, 110);
      const layout = useLayoutStore.getState().layout;

      expect(layout.shellPerimeter).toEqual([
        { x: 0, y: 0 },
        { x: 70, y: 0 },
        { x: 70, y: 110 },
        { x: 0, y: 110 },
      ]);
      expect(layout.metadata.usableSqFt).toBe(7700);
      expect(layout.metadata.rentableSqFt).toBe(Math.round(7700 * 1.05));
    });
  });

  describe('room CRUD operations', () => {
    it('adds, updates, and deletes a room', () => {
      const newRoom = {
        id: 'test-room-1',
        name: 'Prototype Testing Lab',
        code: 'LAB-101',
        category: 'production' as const,
        x: 10,
        y: 10,
        width: 20,
        height: 15,
        wallHeight: 12,
      };

      // Add
      useLayoutStore.getState().addRoom(newRoom);
      expect(useLayoutStore.getState().layout.rooms.find((r) => r.id === 'test-room-1')).toBeDefined();

      // Update
      useLayoutStore.getState().updateRoom('test-room-1', { name: 'Advanced Robotics Lab', width: 25 }, false);
      const updated = useLayoutStore.getState().layout.rooms.find((r) => r.id === 'test-room-1');
      expect(updated?.name).toBe('Advanced Robotics Lab');
      expect(updated?.width).toBe(25);

      // Delete
      useLayoutStore.getState().deleteRoom('test-room-1');
      expect(useLayoutStore.getState().layout.rooms.find((r) => r.id === 'test-room-1')).toBeUndefined();
    });
  });

  describe('equipment CRUD operations', () => {
    it('adds, updates, rotates, and deletes equipment', () => {
      const newEq = {
        id: 'test-eq-1',
        name: 'CNC Milling Center',
        code: 'CNC-1',
        category: 'machinery' as const,
        x: 12,
        y: 14,
        width: 8,
        height: 6,
        elevationHeight: 6,
        rotation: 0,
        clearanceFt: 3,
      };

      // Add
      useLayoutStore.getState().addEquipment(newEq);
      expect(useLayoutStore.getState().layout.equipment.find((e) => e.id === 'test-eq-1')).toBeDefined();

      // Rotate
      useLayoutStore.getState().updateEquipment('test-eq-1', { rotation: 90 }, false);
      expect(useLayoutStore.getState().layout.equipment.find((e) => e.id === 'test-eq-1')?.rotation).toBe(90);

      // Delete
      useLayoutStore.getState().deleteEquipment('test-eq-1');
      expect(useLayoutStore.getState().layout.equipment.find((e) => e.id === 'test-eq-1')).toBeUndefined();
    });
  });

  describe('door CRUD operations', () => {
    it('adds, updates swing, and deletes a door', () => {
      const newDoor = {
        id: 'test-door-1',
        label: 'D-101',
        type: 'single-swing' as const,
        x: 20,
        y: 10,
        width: 3,
        orientation: 'horizontal' as const,
        swing: 'north-east' as const,
      };

      // Add
      useLayoutStore.getState().addDoor(newDoor);
      expect(useLayoutStore.getState().layout.doors.find((d) => d.id === 'test-door-1')).toBeDefined();

      // Update swing
      useLayoutStore.getState().updateDoor('test-door-1', { swing: 'south-west' }, false);
      expect(useLayoutStore.getState().layout.doors.find((d) => d.id === 'test-door-1')?.swing).toBe('south-west');

      // Delete
      useLayoutStore.getState().deleteDoor('test-door-1');
      expect(useLayoutStore.getState().layout.doors.find((d) => d.id === 'test-door-1')).toBeUndefined();
    });
  });

  describe('structural elements CRUD', () => {
    it('adds and deletes structural columns', () => {
      const column = {
        id: 'col-1',
        name: 'Structural Steel Column C1',
        type: 'steel-column' as const,
        x: 25,
        y: 25,
        width: 1.5,
        height: 1.5,
      };

      useLayoutStore.getState().addStructural(column);
      expect(useLayoutStore.getState().layout.structuralElements.find((s) => s.id === 'col-1')).toBeDefined();

      useLayoutStore.getState().deleteStructural('col-1');
      expect(useLayoutStore.getState().layout.structuralElements.find((s) => s.id === 'col-1')).toBeUndefined();
    });
  });

  describe('history (undo & redo)', () => {
    it('records snapshots and supports undo/redo', () => {
      const initialRoomCount = useLayoutStore.getState().layout.rooms.length;

      useLayoutStore.getState().recordHistorySnapshot();
      useLayoutStore.getState().addRoom({
        id: 'history-room',
        name: 'Temporary Staging',
        code: 'STG-1',
        category: 'warehouse',
        x: 5,
        y: 5,
        width: 10,
        height: 10,
        wallHeight: 10,
      });

      expect(useLayoutStore.getState().layout.rooms.length).toBe(initialRoomCount + 1);

      // Undo
      useLayoutStore.getState().undo();
      expect(useLayoutStore.getState().layout.rooms.length).toBe(initialRoomCount);

      // Redo
      useLayoutStore.getState().redo();
      expect(useLayoutStore.getState().layout.rooms.length).toBe(initialRoomCount + 1);
    });
  });

  describe('preset loading', () => {
    it('loads general industrial preset cleanly', () => {
      useLayoutStore.getState().replaceLayout(structuredClone(GENERAL_INDUSTRIAL_PRESET), false);
      const layout = useLayoutStore.getState().layout;

      expect(layout.metadata.projectName).toContain('General Industrial');
      expect(layout.rooms.length).toBeGreaterThan(0);
      expect(layout.equipment.length).toBeGreaterThan(0);
    });
  });
});
