import { Point2D } from '../../types/facility';

/**
 * 1 architectural foot = 10 SVG coordinate units.
 */
export const FT = 10;

export interface ShellBoundsFt {
  minXFt: number;
  maxXFt: number;
  minYFt: number;
  maxYFt: number;
  widthFt: number;
  heightFt: number;
  centerXFt: number;
  centerYFt: number;
}

export interface SheetBoundsSvg {
  minX: number;
  minY: number;
  width: number;
  height: number;
  shell: ShellBoundsFt;
  legendXSvg: number;
  titleBlockXSvg: number;
  titleBlockYSvg: number;
  titleBlockWSvg: number;
  titleBlockHSvg: number;
}

/**
 * Computes the bounding box in architectural feet for any polygon shellPerimeter.
 */
export function computeShellBounds(shellPerimeter: Point2D[]): ShellBoundsFt {
  const validPts = (shellPerimeter || []).filter(
    (pt) => pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)
  );

  if (validPts.length === 0) {
    return {
      minXFt: 0,
      maxXFt: 60,
      minYFt: 0,
      maxYFt: 100,
      widthFt: 60,
      heightFt: 100,
      centerXFt: 30,
      centerYFt: 50,
    };
  }

  let minXFt = Infinity;
  let maxXFt = -Infinity;
  let minYFt = Infinity;
  let maxYFt = -Infinity;

  for (const pt of validPts) {
    if (pt.x < minXFt) minXFt = pt.x;
    if (pt.x > maxXFt) maxXFt = pt.x;
    if (pt.y < minYFt) minYFt = pt.y;
    if (pt.y > maxYFt) maxYFt = pt.y;
  }

  const widthFt = Math.max(10, maxXFt - minXFt);
  const heightFt = Math.max(10, maxYFt - minYFt);

  return {
    minXFt,
    maxXFt,
    minYFt,
    maxYFt,
    widthFt,
    heightFt,
    centerXFt: minXFt + widthFt / 2,
    centerYFt: minYFt + heightFt / 2,
  };
}

/**
 * Dynamically calculates SVG sheet bounds (including margins for exterior dimensions,
 * right-margin legend/schedule, and bottom architectural title block) for any building size.
 */
export function computeSheetBounds(
  shellPerimeter: Point2D[],
  showLegend = true
): SheetBoundsSvg {
  const shell = computeShellBounds(shellPerimeter);

  const leftMarginFt = 5.5;
  const topMarginFt = 8.5;
  const rightMarginFt = showLegend ? 21.5 : 5.5;
  const bottomMarginFt = 13.0;

  const minXFt = shell.minXFt - leftMarginFt;
  const minYFt = shell.minYFt - topMarginFt;
  const totalWidthFt = shell.widthFt + leftMarginFt + rightMarginFt;
  const totalHeightFt = shell.heightFt + topMarginFt + bottomMarginFt;

  const minX = minXFt * FT;
  const minY = minYFt * FT;
  const width = totalWidthFt * FT;
  const height = totalHeightFt * FT;

  const legendXSvg = (shell.maxXFt + 2.0) * FT;
  const titleBlockXSvg = minX + 1.8 * FT;
  const titleBlockYSvg = (shell.maxYFt + 3.7) * FT;
  const titleBlockWSvg = width - 3.6 * FT;
  const titleBlockHSvg = 7.8 * FT;

  return {
    minX,
    minY,
    width,
    height,
    shell,
    legendXSvg,
    titleBlockXSvg,
    titleBlockYSvg,
    titleBlockWSvg,
    titleBlockHSvg,
  };
}

/**
 * Default sheet bounds fallback.
 */
export const SHEET_BOUNDS = {
  minX: -6 * FT,
  minY: -8.5 * FT,
  width: 72.5 * FT,
  height: 129.5 * FT,
};
