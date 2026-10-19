import { describe, it, expect } from 'vitest';
import {
  GENERAL_INDUSTRIAL_PRESET,
  BLANK_SHELL_PRESET,
  SHOWCASE_CULTIVATION_FACILITY,
  COLD_STORAGE_LOGISTICS_PRESET,
  BIOTECH_LAB_PRESET,
} from './layout-presets';
import activeLayoutJson from './facility-layout.json';
import { calculatePolygonAreaSqFt } from '../utils/dimensions';

describe('layout-presets and data integrity', () => {
  const allPresets = [
    { name: 'GENERAL_INDUSTRIAL_PRESET', data: GENERAL_INDUSTRIAL_PRESET },
    { name: 'COLD_STORAGE_LOGISTICS_PRESET', data: COLD_STORAGE_LOGISTICS_PRESET },
    { name: 'BIOTECH_LAB_PRESET', data: BIOTECH_LAB_PRESET },
    { name: 'BLANK_SHELL_PRESET', data: BLANK_SHELL_PRESET },
    { name: 'SHOWCASE_CULTIVATION_FACILITY', data: SHOWCASE_CULTIVATION_FACILITY },
    { name: 'Active facility-layout.json', data: activeLayoutJson },
  ];

  for (const { name, data } of allPresets) {
    describe(`Preset: ${name}`, () => {
      it('has valid metadata and version', () => {
        expect(data.version).toBe('2.0.0');
        expect(data.metadata.projectName).toBeTypeOf('string');
        expect(data.metadata.usableSqFt).toBeGreaterThan(0);
        expect(data.metadata.rentableSqFt).toBeGreaterThan(0);
      });

      it('has valid non-degenerate shell perimeter', () => {
        expect(data.shellPerimeter.length).toBeGreaterThanOrEqual(4);
        const area = calculatePolygonAreaSqFt(data.shellPerimeter);
        expect(area).toBeGreaterThan(0);
      });

      it('has all rooms with positive dimensions and valid non-negative coordinates', () => {
        for (const room of data.rooms) {
          expect(room.id).toBeTypeOf('string');
          expect(room.name).toBeTypeOf('string');
          expect(room.code).toBeTypeOf('string');
          expect(room.width).toBeGreaterThan(0);
          expect(room.height).toBeGreaterThan(0);
          expect(room.wallHeight).toBeGreaterThan(0);
          expect(room.x).toBeGreaterThanOrEqual(0);
          expect(room.y).toBeGreaterThanOrEqual(0);
        }
      });

      it('has all doors with valid orientation and swing', () => {
        const validOrientations = ['horizontal', 'vertical'];
        const validSwings = ['north-east', 'north-west', 'south-east', 'south-west'];

        for (const door of data.doors) {
          expect(validOrientations).toContain(door.orientation);
          expect(validSwings).toContain(door.swing);
          expect(door.width).toBeGreaterThan(0);
        }
      });

      it('has valid rotation angles (non-camera fixtures not upside down at 180°)', () => {
        for (const eq of data.equipment) {
          expect(eq.id).toBeTypeOf('string');
          expect(eq.name).toBeTypeOf('string');
          expect(eq.width).toBeGreaterThan(0);
          expect(eq.height).toBeGreaterThan(0);
          expect(eq.rotation ?? 0).toBeGreaterThanOrEqual(0);
          expect(eq.rotation ?? 0).toBeLessThan(360);

          if (eq.category !== 'security-camera') {
            // Equipment text should not be upside-down
            expect(eq.rotation ?? 0).not.toBe(180);
          }
        }
      });

      it('contains no legacy real-world building identifiers', () => {
        const jsonStr = JSON.stringify(data);
        expect(jsonStr).not.toContain('Suite 304');
        expect(jsonStr).not.toContain('Chester St');
        expect(jsonStr).not.toContain('Riverview Business Plaza');
        expect(jsonStr).not.toContain('Wellington');
        expect(jsonStr).not.toContain('Winther');
      });
    });
  }
});
