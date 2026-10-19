import { describe, it, expect } from 'vitest';
import {
  formatFeetInches,
  parseFeetInput,
  snapToGrid,
  calculatePolygonAreaSqFt,
  ROOM_CATEGORY_STYLES,
  THEME_PALETTES,
} from './dimensions';

describe('formatFeetInches', () => {
  it('formats whole feet with zero inches', () => {
    expect(formatFeetInches(10)).toBe(`10'-0"`);
    expect(formatFeetInches(0)).toBe(`0'-0"`);
  });

  it('formats feet and exact inches correctly', () => {
    expect(formatFeetInches(10.5)).toBe(`10'-6"`);
    expect(formatFeetInches(5.25)).toBe(`5'-3"`);
    expect(formatFeetInches(8.75)).toBe(`8'-9"`);
  });

  it('rounds fractional inches to the nearest integer', () => {
    expect(formatFeetInches(6 + 1 / 12)).toBe(`6'-1"`);
    expect(formatFeetInches(4 + 11 / 12)).toBe(`4'-11"`);
  });

  it('handles negative dimensions gracefully', () => {
    expect(formatFeetInches(-5.5)).toBe(`-5'-6"`);
  });
});

describe('parseFeetInput', () => {
  it('parses standard feet and inches input', () => {
    expect(parseFeetInput(`10'-6"`, 0)).toBe(10.5);
    expect(parseFeetInput(`24'-0"`, 0)).toBe(24);
    expect(parseFeetInput(`5' 3"`, 0)).toBe(5.25);
  });

  it('parses decimal feet input', () => {
    expect(parseFeetInput('22.5', 0)).toBe(22.5);
    expect(parseFeetInput('18', 0)).toBe(18);
  });

  it('parses pure inch inputs and fractional inches', () => {
    expect(parseFeetInput('36"', 0)).toBe(3.0);
    expect(parseFeetInput('48 in', 0)).toBe(4.0);
    expect(parseFeetInput(`22'-8 1/2"`, 0)).toBe(22.71);
  });

  it('falls back to provided fallback for empty or invalid input', () => {
    expect(parseFeetInput('', 15)).toBe(15);
    expect(parseFeetInput('invalid', 20)).toBe(20);
  });
});

describe('snapToGrid', () => {
  it('snaps to 1-foot grid', () => {
    expect(snapToGrid(10.3, 1)).toBe(10);
    expect(snapToGrid(10.7, 1)).toBe(11);
    expect(snapToGrid(10.5, 1)).toBe(11);
  });

  it('snaps to 6-inch grid (0.5 ft)', () => {
    expect(snapToGrid(10.2, 0.5)).toBe(10);
    expect(snapToGrid(10.3, 0.5)).toBe(10.5);
    expect(snapToGrid(10.7, 0.5)).toBe(10.5);
    expect(snapToGrid(10.8, 0.5)).toBe(11);
  });

  it('snaps to 3-inch grid (0.25 ft)', () => {
    expect(snapToGrid(5.12, 0.25)).toBe(5);
    expect(snapToGrid(5.15, 0.25)).toBe(5.25);
    expect(snapToGrid(5.4, 0.25)).toBe(5.5);
    expect(snapToGrid(5.7, 0.25)).toBe(5.75);
  });

  it('returns original rounded value when step is 0 or negative', () => {
    expect(snapToGrid(12.345, 0)).toBe(12.35);
    expect(snapToGrid(12.345, -1)).toBe(12.35);
  });
});

describe('calculatePolygonAreaSqFt', () => {
  it('calculates area of a rectangle', () => {
    const rect = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 80 },
      { x: 0, y: 80 },
    ];
    expect(calculatePolygonAreaSqFt(rect)).toBe(4000);
  });

  it('calculates area of an L-shaped building shell', () => {
    const lShape = [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 60, y: 60 },
      { x: 40, y: 60 },
      { x: 40, y: 100 },
      { x: 0, y: 100 },
    ];
    expect(calculatePolygonAreaSqFt(lShape)).toBe(5200);
  });

  it('returns 0 for degenerate or fewer than 3 points', () => {
    expect(calculatePolygonAreaSqFt([])).toBe(0);
    expect(calculatePolygonAreaSqFt([{ x: 0, y: 0 }])).toBe(0);
    expect(calculatePolygonAreaSqFt([{ x: 0, y: 0 }, { x: 10, y: 0 }])).toBe(0);
  });
});

describe('THEME_PALETTES & ROOM_CATEGORY_STYLES', () => {
  it('provides all 3 architectural themes with required color tokens', () => {
    const requiredThemes = ['investor-color', 'contractor-blueprint', 'dark-cad'] as const;
    for (const t of requiredThemes) {
      expect(THEME_PALETTES[t]).toBeDefined();
      expect(THEME_PALETTES[t].sheetBg).toBeTypeOf('string');
      expect(THEME_PALETTES[t].shellFill).toBeTypeOf('string');
      expect(THEME_PALETTES[t].gridMajor).toBeTypeOf('string');
      expect(THEME_PALETTES[t].dimensionText).toBeTypeOf('string');
    }
  });

  it('provides room category styling for all standard categories', () => {
    const categories = [
      'production',
      'office',
      'cleanroom',
      'lab',
      'warehouse',
      'shipping',
      'restroom',
      'utility',
      'breakroom',
      'corridor',
      'cultivation',
    ] as const;

    for (const cat of categories) {
      expect(ROOM_CATEGORY_STYLES[cat]).toBeDefined();
      expect(ROOM_CATEGORY_STYLES[cat].label).toBeTypeOf('string');
      expect(ROOM_CATEGORY_STYLES[cat].fillInvestor).toBeTypeOf('string');
    }
  });
});
