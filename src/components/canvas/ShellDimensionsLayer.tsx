import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { formatFeetInches, THEME_PALETTES } from '../../utils/dimensions';
import { FT } from './canvasConstants';

export const ShellDimensionsLayer: React.FC = () => {
  const dimensions = useLayoutStore((s) => s.layout.dimensions);
  const showShellDimensions = useViewStore((s) => s.showShellDimensions);
  const theme = useViewStore((s) => s.theme);

  if (!showShellDimensions) return null;

  const palette = THEME_PALETTES[theme];

  return (
    <g className="pointer-events-none select-none">
      {dimensions.map((dim) => {
        const x1 = dim.x1 * FT;
        const y1 = dim.y1 * FT;
        const x2 = dim.x2 * FT;
        const y2 = dim.y2 * FT;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const distFt = Math.hypot(dim.x2 - dim.x1, dim.y2 - dim.y1);
        const label = dim.label || formatFeetInches(distFt);

        const isHorizontal = dim.orientation === 'horizontal';
        const tickSize = 2.8;

        return (
          <g key={dim.id}>
            {/* Main Dimension Line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={palette.dimensionLine}
              strokeWidth={0.85}
              opacity={0.85}
            />

            {/* Architectural 45-degree Slash Ticks + Perpendicular Witness Ticks */}
            {isHorizontal ? (
              <>
                <line
                  x1={x1}
                  y1={y1 - 3.5}
                  x2={x1}
                  y2={y1 + 3.5}
                  stroke={palette.dimensionLine}
                  strokeWidth={0.9}
                />
                <line
                  x1={x1 - tickSize}
                  y1={y1 + tickSize}
                  x2={x1 + tickSize}
                  y2={y1 - tickSize}
                  stroke={palette.dimensionLine}
                  strokeWidth={1.25}
                />
                <line
                  x1={x2}
                  y1={y2 - 3.5}
                  x2={x2}
                  y2={y2 + 3.5}
                  stroke={palette.dimensionLine}
                  strokeWidth={0.9}
                />
                <line
                  x1={x2 - tickSize}
                  y1={y2 + tickSize}
                  x2={x2 + tickSize}
                  y2={y2 - tickSize}
                  stroke={palette.dimensionLine}
                  strokeWidth={1.25}
                />
              </>
            ) : (
              <>
                <line
                  x1={x1 - 3.5}
                  y1={y1}
                  x2={x1 + 3.5}
                  y2={y1}
                  stroke={palette.dimensionLine}
                  strokeWidth={0.9}
                />
                <line
                  x1={x1 - tickSize}
                  y1={y1 + tickSize}
                  x2={x1 + tickSize}
                  y2={y1 - tickSize}
                  stroke={palette.dimensionLine}
                  strokeWidth={1.25}
                />
                <line
                  x1={x2 - 3.5}
                  y1={y2}
                  x2={x2 + 3.5}
                  y2={y2}
                  stroke={palette.dimensionLine}
                  strokeWidth={0.9}
                />
                <line
                  x1={x2 - tickSize}
                  y1={y2 + tickSize}
                  x2={x2 + tickSize}
                  y2={y2 - tickSize}
                  stroke={palette.dimensionLine}
                  strokeWidth={1.25}
                />
              </>
            )}

            {/* Dimension Label Callout */}
            <g
              transform={
                isHorizontal
                  ? `translate(${midX}, ${midY})`
                  : `translate(${midX}, ${midY}) rotate(-90)`
              }
            >
              <rect
                x={-16}
                y={-5.2}
                width={32}
                height={10.4}
                rx={2}
                fill={palette.dimensionTextBg}
              />
              <text
                x={0}
                y={2.7}
                textAnchor="middle"
                fill={palette.dimensionText}
                fontSize={7.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {label}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
