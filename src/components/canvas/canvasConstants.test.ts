import { describe, it, expect } from 'vitest';
import {
  FT,
  computeShellBounds,
  computeSheetBounds,
} from './canvasConstants';

describe('canvasConstants', () => {
  it('defines FT constant as 10 SVG units per foot', () => {
    expect(FT).toBe(10);
  });

  describe('computeShellBounds', () => {
    it('computes correct bounds for rectangular perimeter', () => {
      const perimeter = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 80 },
        { x: 0, y: 80 },
      ];
      const bounds = computeShellBounds(perimeter);
      expect(bounds.minXFt).toBe(0);
      expect(bounds.maxXFt).toBe(50);
      expect(bounds.minYFt).toBe(0);
      expect(bounds.maxYFt).toBe(80);
      expect(bounds.widthFt).toBe(50);
      expect(bounds.heightFt).toBe(80);
    });

    it('computes correct bounds for offset or irregular polygon', () => {
      const perimeter = [
        { x: 10, y: 5 },
        { x: 70, y: 5 },
        { x: 70, y: 105 },
        { x: 10, y: 105 },
      ];
      const bounds = computeShellBounds(perimeter);
      expect(bounds.minXFt).toBe(10);
      expect(bounds.maxXFt).toBe(70);
      expect(bounds.minYFt).toBe(5);
      expect(bounds.maxYFt).toBe(105);
      expect(bounds.widthFt).toBe(60);
      expect(bounds.heightFt).toBe(100);
    });

    it('falls back safely for empty or missing perimeter', () => {
      const bounds = computeShellBounds([]);
      expect(bounds.widthFt).toBeGreaterThan(0);
      expect(bounds.heightFt).toBeGreaterThan(0);
    });
  });

  describe('computeSheetBounds', () => {
    it('computes valid SVG sheet bounds with margins and title blocks', () => {
      const perimeter = [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 60, y: 100 },
        { x: 0, y: 100 },
      ];

      const withLegend = computeSheetBounds(perimeter, true);
      const withoutLegend = computeSheetBounds(perimeter, false);

      expect(withLegend.width).toBeGreaterThan(60 * FT);
      expect(withLegend.height).toBeGreaterThan(100 * FT);
      expect(withLegend.minX).toBeLessThan(0);
      expect(withLegend.minY).toBeLessThan(0);

      // Allocating the right legend box expands the total width
      expect(withLegend.width).toBeGreaterThan(withoutLegend.width);
      expect(withLegend.titleBlockWSvg).toBeGreaterThan(0);
      expect(withLegend.titleBlockHSvg).toBeGreaterThan(0);
    });
  });
});
