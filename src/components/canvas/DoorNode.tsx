import React, { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { DoorSwing } from '../../types/facility';
import { snapToGrid, THEME_PALETTES } from '../../utils/dimensions';
import { clientToFeetCoords } from '../../utils/svgMouse';
import { FT } from './canvasConstants';

interface DoorNodeProps {
  doorId: string;
}

const SWING_ORDER: DoorSwing[] = [
  'north-east',
  'south-east',
  'south-west',
  'north-west',
];

export const DoorNode: React.FC<DoorNodeProps> = ({ doorId }) => {
  const door = useLayoutStore((s) => s.layout.doors.find((d) => d.id === doorId));
  const updateDoor = useLayoutStore((s) => s.updateDoor);
  const recordHistorySnapshot = useLayoutStore((s) => s.recordHistorySnapshot);
  const persistCurrentLayout = useLayoutStore((s) => s.persistCurrentLayout);

  const theme = useViewStore((s) => s.theme);
  const snapStepFt = useViewStore((s) => s.snapStepFt);
  const activeTool = useViewStore((s) => s.activeTool);
  const lockExistingElements = useViewStore((s) => s.lockExistingElements);
  const selectedEntity = useViewStore((s) => s.selectedEntity);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  const [isDragging, setIsDragging] = useState(false);

  if (!door) return null;

  const isSelected = selectedEntity?.type === 'door' && selectedEntity.id === door.id;
  const isLocked = Boolean(door.isExisting && lockExistingElements);
  const palette = THEME_PALETTES[theme];

  const cx = door.x * FT;
  const cy = door.y * FT;
  const w = door.width * FT;
  const halfW = w / 2;

  const strokeColor = isSelected ? '#f59e0b' : palette.doorStroke;
  const arcColor = isSelected ? '#f59e0b' : palette.doorArcStroke;

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (activeTool !== 'select' || e.button !== 0 || e.altKey) return;
    setSelectedEntity({ type: 'door', id: door.id });
    if (isLocked) return;

    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const origX = door.x;
    const origY = door.y;
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
      updateDoor(door.id, { x: nextX, y: nextY }, false);
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = SWING_ORDER.indexOf(door.swing);
    const nextSwing = SWING_ORDER[(idx + 1) % SWING_ORDER.length];
    updateDoor(door.id, { swing: nextSwing }, true);
  };

  const isHoriz = door.orientation === 'horizontal';
  const dirY = door.swing.startsWith('north') ? -1 : 1;
  const dirX = door.swing.endsWith('west') ? -1 : 1;

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
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
      {/* Wall Break Mask */}
      <rect
        x={isHoriz ? -halfW : -3.2}
        y={isHoriz ? -3.2 : -halfW}
        width={isHoriz ? w : 6.4}
        height={isHoriz ? 6.4 : w}
        fill={palette.shellFill}
      />

      {door.type === 'single-swing' && isHoriz && (
        <g>
          <line
            x1={dirX * -halfW}
            y1={0}
            x2={dirX * -halfW}
            y2={dirY * w}
            stroke={strokeColor}
            strokeWidth={1.8}
          />
          <path
            d={`M ${dirX * -halfW} ${dirY * w} A ${w} ${w} 0 0 ${
              dirX * dirY > 0 ? 0 : 1
            } ${dirX * halfW} 0`}
            fill="none"
            stroke={arcColor}
            strokeWidth={0.95}
            strokeDasharray="2.5 1.8"
          />
        </g>
      )}

      {door.type === 'single-swing' && !isHoriz && (
        <g>
          <line
            x1={0}
            y1={dirY * -halfW}
            x2={dirX * w}
            y2={dirY * -halfW}
            stroke={strokeColor}
            strokeWidth={1.8}
          />
          <path
            d={`M ${dirX * w} ${dirY * -halfW} A ${w} ${w} 0 0 ${
              dirX * dirY > 0 ? 1 : 0
            } 0 ${dirY * halfW}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={0.95}
            strokeDasharray="2.5 1.8"
          />
        </g>
      )}

      {door.type === 'double-swing' && isHoriz && (
        <g>
          <line
            x1={-halfW}
            y1={0}
            x2={-halfW}
            y2={dirY * halfW}
            stroke={strokeColor}
            strokeWidth={1.7}
          />
          <path
            d={`M ${-halfW} ${dirY * halfW} A ${halfW} ${halfW} 0 0 ${
              dirY > 0 ? 0 : 1
            } 0 0`}
            fill="none"
            stroke={arcColor}
            strokeWidth={0.9}
            strokeDasharray="2.2 1.6"
          />
          <line
            x1={halfW}
            y1={0}
            x2={halfW}
            y2={dirY * halfW}
            stroke={strokeColor}
            strokeWidth={1.7}
          />
          <path
            d={`M ${halfW} ${dirY * halfW} A ${halfW} ${halfW} 0 0 ${
              dirY > 0 ? 1 : 0
            } 0 0`}
            fill="none"
            stroke={arcColor}
            strokeWidth={0.9}
            strokeDasharray="2.2 1.6"
          />
        </g>
      )}

      {door.type === 'double-swing' && !isHoriz && (
        <g>
          <line
            x1={0}
            y1={-halfW}
            x2={dirX * halfW}
            y2={-halfW}
            stroke={strokeColor}
            strokeWidth={1.7}
          />
          <path
            d={`M ${dirX * halfW} ${-halfW} A ${halfW} ${halfW} 0 0 ${
              dirX > 0 ? 1 : 0
            } 0 0`}
            fill="none"
            stroke={arcColor}
            strokeWidth={0.9}
            strokeDasharray="2.2 1.6"
          />
          <line
            x1={0}
            y1={halfW}
            x2={dirX * halfW}
            y2={halfW}
            stroke={strokeColor}
            strokeWidth={1.7}
          />
          <path
            d={`M ${dirX * halfW} ${halfW} A ${halfW} ${halfW} 0 0 ${
              dirX > 0 ? 0 : 1
            } 0 0`}
            fill="none"
            stroke={arcColor}
            strokeWidth={0.9}
            strokeDasharray="2.2 1.6"
          />
        </g>
      )}

      {door.type === 'overhead-dock' && (
        <g>
          <rect
            x={isHoriz ? -halfW : -3.5}
            y={isHoriz ? -3.5 : -halfW}
            width={isHoriz ? w : 7}
            height={isHoriz ? 7 : w}
            fill={theme === 'dark-cad' ? '#0ea5e9' : '#f97316'}
            fillOpacity={0.22}
            stroke={strokeColor}
            strokeWidth={1.8}
          />
          <line
            x1={isHoriz ? -halfW : 0}
            y1={isHoriz ? 0 : -halfW}
            x2={isHoriz ? halfW : 0}
            y2={isHoriz ? 0 : halfW}
            stroke={strokeColor}
            strokeWidth={2.2}
            strokeDasharray="4 2"
          />
        </g>
      )}

      {(door.type === 'sliding' || door.type === 'cased-opening') && (
        <g>
          <line
            x1={isHoriz ? -halfW : -1.5}
            y1={isHoriz ? -1.5 : -halfW}
            x2={isHoriz ? 2 : -1.5}
            y2={isHoriz ? -1.5 : 2}
            stroke={strokeColor}
            strokeWidth={1.8}
          />
          <line
            x1={isHoriz ? -2 : 1.5}
            y1={isHoriz ? 1.5 : -2}
            x2={isHoriz ? halfW : 1.5}
            y2={isHoriz ? 1.5 : halfW}
            stroke={strokeColor}
            strokeWidth={1.8}
          />
        </g>
      )}

      {/* Door Tag Pill */}
      <g
        transform={`translate(0, ${isHoriz ? (dirY > 0 ? -7 : 7) : 0})`}
        className="pointer-events-none select-none"
      >
        <rect
          x={-13}
          y={-4.8}
          width={26}
          height={9.6}
          rx={2}
          fill={isSelected ? '#f59e0b' : palette.dimensionTextBg}
          stroke={strokeColor}
          strokeWidth={0.6}
        />
        <text
          x={0}
          y={2.4}
          textAnchor="middle"
          fill={isSelected ? '#0f172a' : palette.textPrimary}
          fontSize={5.6}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={700}
        >
          {door.label}
        </text>
      </g>
    </g>
  );
};
