import React, { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import {
  formatFeetInches,
  ROOM_CATEGORY_STYLES,
  snapToGrid,
  THEME_PALETTES,
} from '../../utils/dimensions';
import { clientToFeetCoords } from '../../utils/svgMouse';
import { FT } from './canvasConstants';

interface RoomNodeProps {
  roomId: string;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export const RoomNode: React.FC<RoomNodeProps> = ({ roomId }) => {
  const room = useLayoutStore((s) => s.layout.rooms.find((r) => r.id === roomId));
  const updateRoom = useLayoutStore((s) => s.updateRoom);
  const recordHistorySnapshot = useLayoutStore((s) => s.recordHistorySnapshot);
  const persistCurrentLayout = useLayoutStore((s) => s.persistCurrentLayout);

  const theme = useViewStore((s) => s.theme);
  const disciplineView = useViewStore((s) => s.disciplineView);
  const snapStepFt = useViewStore((s) => s.snapStepFt);
  const activeTool = useViewStore((s) => s.activeTool);
  const lockExistingElements = useViewStore((s) => s.lockExistingElements);
  const selectedEntity = useViewStore((s) => s.selectedEntity);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  const [isDragging, setIsDragging] = useState(false);

  if (!room) return null;

  const isSelected = selectedEntity?.type === 'room' && selectedEntity.id === room.id;
  const isLocked = Boolean(room.isExisting && lockExistingElements);
  const catStyle = ROOM_CATEGORY_STYLES[room.category] ?? ROOM_CATEGORY_STYLES.production;
  const palette = THEME_PALETTES[theme];

  const x = room.x * FT;
  const y = room.y * FT;
  const w = room.width * FT;
  const h = room.height * FT;

  const fillColor =
    disciplineView === 'security' && room.isLimitedAccess
      ? 'rgba(220, 38, 38, 0.10)'
      : theme === 'investor-color'
      ? room.color
        ? `${room.color}28`
        : catStyle.fillInvestor
      : theme === 'dark-cad'
      ? 'rgba(56, 189, 248, 0.06)'
      : 'rgba(15, 23, 42, 0.02)';

  const strokeColor = isSelected
    ? '#f59e0b'
    : disciplineView === 'security' && room.isLimitedAccess
    ? '#dc2626'
    : theme === 'investor-color'
    ? room.color || catStyle.strokeInvestor
    : palette.shellWallStroke;

  const handleMoveStart = (e: React.PointerEvent<SVGGElement>) => {
    if (activeTool !== 'select' || e.button !== 0 || e.altKey) return;
    setSelectedEntity({ type: 'room', id: room.id });
    if (isLocked) return;

    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const startX = room.x;
    const startY = room.y;
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
      const nextX = snapToGrid(startX + (curPt.xFt - startPt.xFt), snapStepFt);
      const nextY = snapToGrid(startY + (curPt.yFt - startPt.yFt), snapStepFt);
      updateRoom(room.id, { x: nextX, y: nextY }, false);
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

  const handleResizeStart = (
    e: React.PointerEvent<SVGRectElement>,
    handle: ResizeHandle
  ) => {
    if (isLocked) return;
    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startPt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const orig = { x: room.x, y: room.y, width: room.width, height: room.height };
    let didResize = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!didResize) {
        didResize = true;
        recordHistorySnapshot();
      }
      const curPt = clientToFeetCoords(svg, moveEvt.clientX, moveEvt.clientY);
      const dx = curPt.xFt - startPt.xFt;
      const dy = curPt.yFt - startPt.yFt;

      let nextX = orig.x;
      let nextY = orig.y;
      let nextW = orig.width;
      let nextH = orig.height;

      if (handle.includes('e')) {
        nextW = Math.max(3, snapToGrid(orig.width + dx, snapStepFt));
      }
      if (handle.includes('s')) {
        nextH = Math.max(3, snapToGrid(orig.height + dy, snapStepFt));
      }
      if (handle.includes('w')) {
        const candidateX = snapToGrid(orig.x + dx, snapStepFt);
        const candidateW = orig.x + orig.width - candidateX;
        if (candidateW >= 3) {
          nextX = candidateX;
          nextW = Number(candidateW.toFixed(2));
        }
      }
      if (handle.includes('n')) {
        const candidateY = snapToGrid(orig.y + dy, snapStepFt);
        const candidateH = orig.y + orig.height - candidateY;
        if (candidateH >= 3) {
          nextY = candidateY;
          nextH = Number(candidateH.toFixed(2));
        }
      }

      updateRoom(
        room.id,
        { x: nextX, y: nextY, width: nextW, height: nextH },
        false
      );
    };

    const onPointerUp = () => {
      if (didResize) {
        void persistCurrentLayout();
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const hasExpandable = room.expandableSides && room.expandableSides.length > 0;

  return (
    <g
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
      {/* Room Fill & Base Wall */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={
          isSelected
            ? 2.4
            : disciplineView === 'security' && room.isLimitedAccess
            ? 2.2
            : room.isExisting
            ? 2.0
            : room.category === 'corridor'
            ? 0.9
            : 1.7
        }
        strokeDasharray={room.category === 'corridor' ? '3.5 2.5' : undefined}
      />

      {/* Security View: Red Dashed Limited Access Perimeter Inner Boundary */}
      {disciplineView === 'security' && room.isLimitedAccess && (
        <rect
          x={x + 2.2}
          y={y + 2.2}
          width={Math.max(0, w - 4.4)}
          height={Math.max(0, h - 4.4)}
          fill="none"
          stroke="#dc2626"
          strokeWidth={1.1}
          strokeDasharray="4 2.5"
          className="pointer-events-none"
        />
      )}

      {/* Contractor Insulated / Stud Partition Inner Line */}
      {!room.isExisting && room.category !== 'corridor' && disciplineView !== 'security' && (
        <rect
          x={x + 1.5}
          y={y + 1.5}
          width={Math.max(0, w - 3.0)}
          height={Math.max(0, h - 3.0)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={0.6}
          opacity={0.65}
          className="pointer-events-none"
        />
      )}

      {/* Modular / Non-Load-Bearing Expandable Wall Highlight & Arrows */}
      {hasExpandable && (
        <g className="pointer-events-none">
          {room.expandableSides?.includes('west') && (
            <>
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={y + h}
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 2.5"
              />
              {/* Expansion Arrow West */}
              <path
                d={`M ${x - 2} ${y + h * 0.32} L ${x - 10} ${y + h * 0.32} M ${
                  x - 7
                } ${y + h * 0.32 - 2.5} L ${x - 10} ${y + h * 0.32} L ${x - 7} ${
                  y + h * 0.32 + 2.5
                }`}
                stroke="#0284c7"
                strokeWidth={1.3}
                fill="none"
              />
              <text
                x={x + 3.5}
                y={y + h / 2}
                textAnchor="middle"
                fill="#0284c7"
                fontSize={4.2}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                transform={`rotate(-90, ${x + 3.5}, ${y + h / 2})`}
              >
                MODULAR EXPANDABLE WALL
              </text>
            </>
          )}
          {room.expandableSides?.includes('east') && (
            <>
              <line
                x1={x + w}
                y1={y}
                x2={x + w}
                y2={y + h}
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 2.5"
              />
              {/* Expansion Arrow East */}
              <path
                d={`M ${x + w + 2} ${y + h * 0.32} L ${x + w + 10} ${y + h * 0.32} M ${
                  x + w + 7
                } ${y + h * 0.32 - 2.5} L ${x + w + 10} ${y + h * 0.32} L ${x + w + 7} ${
                  y + h * 0.32 + 2.5
                }`}
                stroke="#0284c7"
                strokeWidth={1.3}
                fill="none"
              />
              <text
                x={x + w - 3.5}
                y={y + h / 2}
                textAnchor="middle"
                fill="#0284c7"
                fontSize={4.2}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                transform={`rotate(-90, ${x + w - 3.5}, ${y + h / 2})`}
              >
                MODULAR EXPANDABLE WALL
              </text>
            </>
          )}
          {room.expandableSides?.includes('north') && (
            <>
              <line
                x1={x}
                y1={y}
                x2={x + w}
                y2={y}
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 2.5"
              />
              {/* Expansion Arrow North */}
              <path
                d={`M ${x + w / 2} ${y - 1.5} L ${x + w / 2} ${y - 8.5} M ${
                  x + w / 2 - 2.5
                } ${y - 6} L ${x + w / 2} ${y - 8.5} L ${x + w / 2 + 2.5} ${
                  y - 6
                }`}
                stroke="#0284c7"
                strokeWidth={1.3}
                fill="none"
              />
              <text
                x={x + w / 2}
                y={y - 10.5}
                textAnchor="middle"
                fill="#0284c7"
                fontSize={3.9}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                MODULAR / NON-LOAD-BEARING
              </text>
            </>
          )}
          {room.expandableSides?.includes('south') && (
            <>
              <line
                x1={x}
                y1={y + h}
                x2={x + w}
                y2={y + h}
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 2.5"
              />
              {/* Expansion Arrow South */}
              <path
                d={`M ${x + w / 2} ${y + h + 1.5} L ${x + w / 2} ${y + h + 8.5} M ${
                  x + w / 2 - 2.5
                } ${y + h + 6} L ${x + w / 2} ${y + h + 8.5} L ${x + w / 2 + 2.5} ${
                  y + h + 6
                }`}
                stroke="#0284c7"
                strokeWidth={1.3}
                fill="none"
              />
              <text
                x={x + w / 2}
                y={y + h + 13.5}
                textAnchor="middle"
                fill="#0284c7"
                fontSize={3.9}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                MODULAR / NON-LOAD-BEARING
              </text>
            </>
          )}
        </g>
      )}

      {/* 8-Way Resize Handles When Selected & Unlocked */}
      {isSelected && activeTool === 'select' && !isLocked && (
        <g>
          {(
            [
              ['nw', x, y, 'nwse-resize'],
              ['n', x + w / 2, y, 'ns-resize'],
              ['ne', x + w, y, 'nesw-resize'],
              ['e', x + w, y + h / 2, 'ew-resize'],
              ['se', x + w, y + h, 'nwse-resize'],
              ['s', x + w / 2, y + h, 'ns-resize'],
              ['sw', x, y + h, 'nesw-resize'],
              ['w', x, y + h / 2, 'ew-resize'],
            ] as [ResizeHandle, number, number, string][]
          ).map(([handle, hx, hy, cursor]) => (
            <rect
              key={handle}
              x={hx - 3.2}
              y={hy - 3.2}
              width={6.4}
              height={6.4}
              rx={1.2}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={1.1}
              style={{ cursor }}
              onPointerDown={(e) => handleResizeStart(e, handle)}
            />
          ))}
        </g>
      )}
    </g>
  );
};
