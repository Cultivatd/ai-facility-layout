import {
  Point2D,
  PresentationTheme,
  RoomCategory,
} from '../types/facility';

/**
 * Formats decimal feet into architectural feet and inches, e.g., 44.25 -> 44'-3"
 */
export function formatFeetInches(feetDecimal: number): string {
  const sign = feetDecimal < 0 ? '-' : '';
  const abs = Math.abs(feetDecimal);
  const totalInches = Math.round(abs * 12);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${sign}${feet}'-${inches}"`;
}

/**
 * Parses either decimal feet ("22.67"), feet-inches ("22'-8\"", "22'-8 1/2\""), or inches-only ("36\"") into decimal feet.
 */
export function parseFeetInput(input: string, fallback: number): number {
  const trimmed = input.trim();
  if (!trimmed) return fallback;

  // Pure inches check, e.g. '36"' or '36 in'
  const inchOnlyMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(?:"|in|inches)$/i);
  if (inchOnlyMatch) {
    const inches = parseFloat(inchOnlyMatch[1]);
    return Number.isFinite(inches) ? Number((inches / 12).toFixed(2)) : fallback;
  }

  // Feet and inches with optional fractional inch, e.g. 22'-8", 22' 8 1/2", 22'-8.5"
  const ftInMatch = trimmed.match(
    /^(-?\d+)\s*'\s*-?\s*(\d+)?(?:\s+(\d+)\/(\d+))?(?:\.(\d+))?\s*"?$/
  );
  if (ftInMatch) {
    const ft = parseFloat(ftInMatch[1]);
    const wholeInches = ftInMatch[2] ? parseFloat(ftInMatch[2]) : 0;
    const fracInches =
      ftInMatch[3] && ftInMatch[4]
        ? parseFloat(ftInMatch[3]) / parseFloat(ftInMatch[4])
        : ftInMatch[5]
        ? parseFloat(`0.${ftInMatch[5]}`)
        : 0;
    const totalInches = wholeInches + fracInches;
    return Number((ft + (ft < 0 ? -totalInches : totalInches) / 12).toFixed(2));
  }

  const num = parseFloat(trimmed.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(num) ? Number(num.toFixed(2)) : fallback;
}

/**
 * Snap value in feet to a given grid step (e.g. 0.5 ft = 6", or 0.25 ft = 3")
 */
export function snapToGrid(val: number, stepFt: number): number {
  if (stepFt <= 0) return Number(val.toFixed(2));
  return Number((Math.round(val / stepFt) * stepFt).toFixed(2));
}

/**
 * Calculates polygon area in square feet using the Shoelace formula.
 */
export function calculatePolygonAreaSqFt(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

export interface CategoryStyle {
  label: string;
  fillInvestor: string;
  strokeInvestor: string;
  badgeColor: string;
  fill3D: string;
  hatchPattern?: 'diagonal' | 'grid' | 'dots' | 'cross' | 'none';
}

export const ROOM_CATEGORY_STYLES: Record<RoomCategory, CategoryStyle> = {
  production: {
    label: 'Production / Assembly',
    fillInvestor: 'rgba(59, 130, 246, 0.20)',
    strokeInvestor: '#2563eb',
    badgeColor: '#3b82f6',
    fill3D: '#3b82f6',
    hatchPattern: 'grid',
  },
  office: {
    label: 'Office / Admin',
    fillInvestor: 'rgba(16, 185, 129, 0.20)',
    strokeInvestor: '#059669',
    badgeColor: '#10b981',
    fill3D: '#10b981',
    hatchPattern: 'none',
  },
  cleanroom: {
    label: 'Cleanroom / Controlled',
    fillInvestor: 'rgba(6, 182, 212, 0.24)',
    strokeInvestor: '#0891b2',
    badgeColor: '#06b6d4',
    fill3D: '#06b6d4',
    hatchPattern: 'cross',
  },
  lab: {
    label: 'R&D / QC Lab',
    fillInvestor: 'rgba(139, 92, 246, 0.20)',
    strokeInvestor: '#7c3aed',
    badgeColor: '#8b5cf6',
    fill3D: '#8b5cf6',
    hatchPattern: 'dots',
  },
  warehouse: {
    label: 'Storage / Racking',
    fillInvestor: 'rgba(245, 158, 11, 0.20)',
    strokeInvestor: '#d97706',
    badgeColor: '#f59e0b',
    fill3D: '#f59e0b',
    hatchPattern: 'diagonal',
  },
  shipping: {
    label: 'Shipping & Receiving',
    fillInvestor: 'rgba(249, 115, 22, 0.20)',
    strokeInvestor: '#ea580c',
    badgeColor: '#f97316',
    fill3D: '#f97316',
    hatchPattern: 'diagonal',
  },
  restroom: {
    label: 'Restroom / Sanitary',
    fillInvestor: 'rgba(100, 116, 139, 0.26)',
    strokeInvestor: '#475569',
    badgeColor: '#64748b',
    fill3D: '#64748b',
    hatchPattern: 'grid',
  },
  utility: {
    label: 'Mechanical / Electrical',
    fillInvestor: 'rgba(239, 68, 68, 0.20)',
    strokeInvestor: '#dc2626',
    badgeColor: '#ef4444',
    fill3D: '#ef4444',
    hatchPattern: 'cross',
  },
  breakroom: {
    label: 'Breakroom / Lounge',
    fillInvestor: 'rgba(236, 72, 153, 0.18)',
    strokeInvestor: '#db2777',
    badgeColor: '#ec4899',
    fill3D: '#ec4899',
    hatchPattern: 'none',
  },
  corridor: {
    label: 'Logistics & Main Corridor',
    fillInvestor: 'rgba(148, 163, 184, 0.14)',
    strokeInvestor: '#64748b',
    badgeColor: '#64748b',
    fill3D: '#94a3b8',
    hatchPattern: 'none',
  },
  cultivation: {
    label: 'Cultivation / Closed-Loop Env.',
    fillInvestor: 'rgba(16, 185, 129, 0.22)',
    strokeInvestor: '#059669',
    badgeColor: '#10b981',
    fill3D: '#10b981',
    hatchPattern: 'grid',
  },
};

export interface ThemePalette {
  canvasBg: string;
  sheetBg: string;
  sheetBorder: string;
  shellFill: string;
  shellWallStroke: string;
  shellWallOuterStroke: string;
  gridMajor: string;
  gridMinor: string;
  textPrimary: string;
  textSecondary: string;
  dimensionLine: string;
  dimensionTextBg: string;
  dimensionText: string;
  doorStroke: string;
  doorArcStroke: string;
  equipmentFill: string;
  equipmentStroke: string;
}

export const THEME_PALETTES: Record<PresentationTheme, ThemePalette> = {
  'investor-color': {
    canvasBg: '#0f172a',
    sheetBg: '#ffffff',
    sheetBorder: '#cbd5e1',
    shellFill: '#f8fafc',
    shellWallStroke: '#0f172a',
    shellWallOuterStroke: '#334155',
    gridMajor: 'rgba(148, 163, 184, 0.28)',
    gridMinor: 'rgba(148, 163, 184, 0.12)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    dimensionLine: '#334155',
    dimensionTextBg: 'rgba(255, 255, 255, 0.92)',
    dimensionText: '#0f172a',
    doorStroke: '#0f172a',
    doorArcStroke: '#64748b',
    equipmentFill: '#f1f5f9',
    equipmentStroke: '#1e293b',
  },
  'contractor-blueprint': {
    canvasBg: '#1e293b',
    sheetBg: '#ffffff',
    sheetBorder: '#0f172a',
    shellFill: '#ffffff',
    shellWallStroke: '#000000',
    shellWallOuterStroke: '#1e293b',
    gridMajor: 'rgba(15, 23, 42, 0.14)',
    gridMinor: 'rgba(15, 23, 42, 0.06)',
    textPrimary: '#000000',
    textSecondary: '#334155',
    dimensionLine: '#0f172a',
    dimensionTextBg: '#ffffff',
    dimensionText: '#000000',
    doorStroke: '#000000',
    doorArcStroke: '#475569',
    equipmentFill: '#ffffff',
    equipmentStroke: '#000000',
  },
  'dark-cad': {
    canvasBg: '#020617',
    sheetBg: '#091124',
    sheetBorder: '#1e3a5f',
    shellFill: '#0c1830',
    shellWallStroke: '#38bdf8',
    shellWallOuterStroke: '#0284c7',
    gridMajor: 'rgba(56, 189, 248, 0.16)',
    gridMinor: 'rgba(56, 189, 248, 0.06)',
    textPrimary: '#f0f9ff',
    textSecondary: '#7dd3fc',
    dimensionLine: '#38bdf8',
    dimensionTextBg: '#091124',
    dimensionText: '#7dd3fc',
    doorStroke: '#facc15',
    doorArcStroke: '#38bdf8',
    equipmentFill: 'rgba(14, 165, 233, 0.15)',
    equipmentStroke: '#38bdf8',
  },
};
