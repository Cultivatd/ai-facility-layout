import React, { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { snapToGrid, THEME_PALETTES } from '../../utils/dimensions';
import { clientToFeetCoords } from '../../utils/svgMouse';
import { FT } from './canvasConstants';

interface StructuralNodeProps {
  structuralId: string;
}

export const StructuralNode: React.FC<StructuralNodeProps> = ({ structuralId }) => {
  const elem = useLayoutStore((s) =>
    s.layout.structuralElements.find((st) => st.id === structuralId)
  );
  const updateStructural = useLayoutStore((s) => s.updateStructural);
  const recordHistorySnapshot = useLayoutStore((s) => s.recordHistorySnapshot);
  const persistCurrentLayout = useLayoutStore((s) => s.persistCurrentLayout);

  const theme = useViewStore((s) => s.theme);
  const snapStepFt = useViewStore((s) => s.snapStepFt);
  const activeTool = useViewStore((s) => s.activeTool);
  const lockExistingElements = useViewStore((s) => s.lockExistingElements);
  const selectedEntity = useViewStore((s) => s.selectedEntity);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  const [isDragging, setIsDragging] = useState(false);

  if (!elem) return null;

  const isSelected =
    selectedEntity?.type === 'structural' && selectedEntity.id === elem.id;
  const isLocked = Boolean(elem.isExisting && lockExistingElements);
  const palette = THEME_PALETTES[theme];

  const x = elem.x * FT;
  const y = elem.y * FT;
  const w = elem.width * FT;
  const h = elem.height * FT;

  const strokeColor = isSelected ? '#f59e0b' : palette.shellWallStroke;

  const handleMoveStart = (e: React.PointerEvent<SVGGElement>) => {
    if (activeTool !== 'select' || e.button !== 0 || e.altKey) return;
    setSelectedEntity({ type: 'structural', id: elem.id });
    if (isLocked) return;

    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const origX = elem.x;
    const origY = elem.y;
    let didMove = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!didMove) {
        if (Math.hypot(moveEvt.clientX - startClientX, moveEvt.clientY - startClientY) < 5) {
          return;
        }
        didMove = true;
        setIsDragging(true);
        recordHistorySnapshot();
      }
      const curPt = clientToFeetCoords(svg, moveEvt.clientX, moveEvt.clientY);
      const nextX = snapToGrid(origX + (curPt.xFt - startPt.xFt), snapStepFt);
      const nextY = snapToGrid(origY + (curPt.yFt - startPt.yFt), snapStepFt);
      updateStructural(elem.id, { x: nextX, y: nextY }, false);
    };

    const onPointerUp = () => {
      if (didMove) {
        setIsDragging(false);
        void persistCurrentLayout();
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={handleMoveStart}
      style={{
        cursor:
          activeTool === 'pan'
            ? 'grab'
            : activeTool === 'select'
            ? isLocked
              ? 'pointer'
              : isDragging
              ? 'grabbing'
              : 'grab'
            : 'crosshair',
      }}
    >
      {elem.type === 'steel-column' && (
        <g>
          <circle
            cx={w / 2}
            cy={h / 2}
            r={Math.max(w, h) * 0.95}
            fill="rgba(239, 68, 68, 0.14)"
            stroke={isSelected ? '#f59e0b' : '#ef4444'}
            strokeWidth={0.75}
            strokeDasharray="2 1.5"
          />
          <circle
            cx={w / 2}
            cy={h / 2}
            r={Math.max(w, h) / 2}
            fill={palette.shellWallStroke}
            stroke={strokeColor}
            strokeWidth={1.5}
          />
          <text
            x={w / 2}
            y={-5}
            textAnchor="middle"
            fill={palette.textPrimary}
            fontSize={5.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            className="pointer-events-none select-none"
          >
            COL
          </text>
        </g>
      )}

      {elem.type === 'dock-leveler-pit' && (
        <g>
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="rgba(249, 115, 22, 0.08)"
            stroke={strokeColor}
            strokeWidth={1.1}
            strokeDasharray="5 2.5"
          />
          <line
            x1={0}
            y1={0}
            x2={w}
            y2={h}
            stroke={strokeColor}
            strokeWidth={0.5}
            opacity={0.45}
          />
          <line
            x1={w}
            y1={0}
            x2={0}
            y2={h}
            stroke={strokeColor}
            strokeWidth={0.5}
            opacity={0.45}
          />
          <text
            x={w / 2}
            y={h / 2 + 2}
            textAnchor="middle"
            fill={palette.textSecondary}
            fontSize={5.4}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            className="pointer-events-none select-none"
          >
            DOCK PIT
          </text>
        </g>
      )}

      {(elem.type === 'unit-heater' || elem.type === 'utility-chase') && (
        <g>
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill={palette.equipmentFill}
            stroke={strokeColor}
            strokeWidth={1.1}
          />
          <line x1={0} y1={0} x2={w} y2={h} stroke={strokeColor} strokeWidth={0.8} />
          <line x1={w} y1={0} x2={0} y2={h} stroke={strokeColor} strokeWidth={0.8} />
        </g>
      )}

      {elem.type === 'floor-pad' && (
        <g>
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill={
              elem.id === 'struct-elec-alcove-pad'
                ? theme === 'dark-cad'
                  ? 'rgba(250, 204, 21, 0.12)'
                  : '#fefce8'
                : 'none'
            }
            stroke={elem.id === 'struct-elec-alcove-pad' ? '#d97706' : strokeColor}
            strokeWidth={elem.id === 'struct-elec-alcove-pad' ? 1.2 : 1.1}
            strokeDasharray={elem.id === 'struct-elec-alcove-pad' ? '3 2' : undefined}
          />
          {elem.id === 'struct-elec-alcove-pad' ? (
            <g className="pointer-events-none select-none">
              {/* NEC 36" Working Clearance Hatch Zone */}
              <rect
                x={2}
                y={8}
                width={Math.max(4, w - 20)}
                height={Math.max(4, h - 16)}
                fill="rgba(239, 68, 68, 0.08)"
                stroke="#dc2626"
                strokeWidth={0.65}
                strokeDasharray="2 1.5"
              />
              <text
                x={w / 2 - 4}
                y={6.2}
                textAnchor="middle"
                fill="#b45309"
                fontSize={3.7}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                DRY ELEC. CLOSET
              </text>
              <text
                x={w / 2 - 7}
                y={h - 3.2}
                textAnchor="middle"
                fill="#dc2626"
                fontSize={3.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                NEC 36&quot; CLEAR
              </text>
            </g>
          ) : (
            <text
              x={w / 2}
              y={h / 2 + 2}
              textAnchor="middle"
              fill={palette.textSecondary}
              fontSize={4.8}
              fontFamily="JetBrains Mono, monospace"
              className="pointer-events-none select-none"
            >
              PAD
            </text>
          )}
        </g>
      )}

      {elem.type === 'window-glazing' && (
        <g>
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="#38bdf8"
            fillOpacity={0.35}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <line
            x1={w / 3}
            y1={0}
            x2={w / 3}
            y2={h}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <line
            x1={(w * 2) / 3}
            y1={0}
            x2={(w * 2) / 3}
            y2={h}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </g>
      )}

      {elem.type === 'partition-wall' && (
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={palette.shellWallStroke}
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}
    </g>
  );
};
