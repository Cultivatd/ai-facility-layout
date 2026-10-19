import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { THEME_PALETTES } from '../../utils/dimensions';
import { computeShellBounds, FT } from './canvasConstants';

export const ShellLayer: React.FC = () => {
  const shellPerimeter = useLayoutStore((s) => s.layout.shellPerimeter);
  const pdfCalibration = useLayoutStore((s) => s.layout.pdfCalibration);
  const theme = useViewStore((s) => s.theme);
  const showGrid = useViewStore((s) => s.showGrid);
  const showPdfUnderlay = useViewStore((s) => s.showPdfUnderlay);
  const pdfUnderlayMode = useViewStore((s) => s.pdfUnderlayMode);

  const palette = THEME_PALETTES[theme];
  const shellBounds = computeShellBounds(shellPerimeter);

  const pointsAttr = shellPerimeter
    .map((pt) => `${pt.x * FT},${pt.y * FT}`)
    .join(' ');

  const hasUnderlay = Boolean(
    pdfCalibration &&
      (pdfCalibration.fullImageUrl ||
        pdfCalibration.lineworkDarkUrl ||
        pdfCalibration.lineworkLightUrl ||
        pdfCalibration.pixelsPerFoot > 0)
  );

  return (
    <g className="select-none">
      <defs>
        <clipPath id="facility-shell-clip">
          <polygon points={pointsAttr} />
        </clipPath>
        <pattern
          id="grid-minor-pattern"
          width={1 * FT}
          height={1 * FT}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${1 * FT} 0 L 0 0 0 ${1 * FT}`}
            fill="none"
            stroke={palette.gridMinor}
            strokeWidth={0.35}
          />
        </pattern>
        <pattern
          id="grid-major-pattern"
          width={5 * FT}
          height={5 * FT}
          patternUnits="userSpaceOnUse"
        >
          <rect width={5 * FT} height={5 * FT} fill="url(#grid-minor-pattern)" />
          <path
            d={`M ${5 * FT} 0 L 0 0 0 ${5 * FT}`}
            fill="none"
            stroke={palette.gridMajor}
            strokeWidth={0.7}
          />
        </pattern>
      </defs>

      {/* Interior Floor Slab Fill */}
      <polygon
        points={pointsAttr}
        fill={
          hasUnderlay && showPdfUnderlay && pdfUnderlayMode === 'full'
            ? 'transparent'
            : palette.shellFill
        }
      />

      {/* Architectural 1ft / 5ft Grid Clipped to Building Perimeter */}
      {showGrid && (
        <rect
          x={(shellBounds.minXFt - 5) * FT}
          y={(shellBounds.minYFt - 5) * FT}
          width={(shellBounds.widthFt + 10) * FT}
          height={(shellBounds.heightFt + 10) * FT}
          fill="url(#grid-major-pattern)"
          clipPath="url(#facility-shell-clip)"
          className="pointer-events-none"
        />
      )}

      {/* Exterior Double-Wall Pooche / Thickness */}
      <polygon
        points={pointsAttr}
        fill="none"
        stroke={palette.shellWallOuterStroke}
        strokeWidth={6}
        strokeLinejoin="miter"
        opacity={0.32}
      />

      {/* Crisp Interior Shell Perimeter Line */}
      <polygon
        points={pointsAttr}
        fill="none"
        stroke={palette.shellWallStroke}
        strokeWidth={2.4}
        strokeLinejoin="miter"
      />
    </g>
  );
};
