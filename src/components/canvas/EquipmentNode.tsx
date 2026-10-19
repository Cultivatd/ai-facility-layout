import React, { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import {
  DisciplineView,
  EquipmentCategory,
} from '../../types/facility';
import { formatFeetInches, snapToGrid, THEME_PALETTES } from '../../utils/dimensions';
import { clientToFeetCoords } from '../../utils/svgMouse';
import { FT } from './canvasConstants';

interface EquipmentNodeProps {
  equipmentId: string;
}

function getEquipmentVisibility(
  category: EquipmentCategory,
  view: DisciplineView,
  isSelected: boolean
): 'primary' | 'ghost' | 'hidden' {
  if (isSelected) return 'primary';

  switch (view) {
    case 'room-usage':
      if (
        category === 'security-camera' ||
        category === 'access-control' ||
        category === 'safety-equipment' ||
        category === 'hvac-scrubber'
      ) {
        return 'hidden';
      }
      return 'ghost';

    case 'equipment':
      if (
        category === 'security-camera' ||
        category === 'access-control' ||
        category === 'safety-equipment'
      ) {
        return 'hidden';
      }
      if (category === 'hvac-scrubber') return 'ghost';
      return 'primary';

    case 'security':
      if (
        category === 'security-camera' ||
        category === 'access-control' ||
        category === 'secure-vault'
      ) {
        return 'primary';
      }
      if (category === 'safety-equipment' || category === 'hvac-scrubber') {
        return 'hidden';
      }
      return 'ghost';

    case 'evac-safety':
      if (category === 'safety-equipment') return 'primary';
      if (
        category === 'security-camera' ||
        category === 'access-control' ||
        category === 'hvac-scrubber'
      ) {
        return 'hidden';
      }
      return 'ghost';

    case 'contractor-mep':
      if (
        category === 'plumbing' ||
        category === 'hvac-scrubber' ||
        category === 'electrical-mep'
      ) {
        return 'primary';
      }
      if (
        category === 'security-camera' ||
        category === 'access-control' ||
        category === 'safety-equipment'
      ) {
        return 'hidden';
      }
      return 'ghost';

    case 'overview':
    default:
      if (category === 'safety-equipment') return 'hidden';
      return 'primary';
  }
}

export const EquipmentNode: React.FC<EquipmentNodeProps> = ({ equipmentId }) => {
  const item = useLayoutStore((s) =>
    s.layout.equipment.find((e) => e.id === equipmentId)
  );
  const updateEquipment = useLayoutStore((s) => s.updateEquipment);
  const recordHistorySnapshot = useLayoutStore((s) => s.recordHistorySnapshot);
  const persistCurrentLayout = useLayoutStore((s) => s.persistCurrentLayout);

  const theme = useViewStore((s) => s.theme);
  const disciplineView = useViewStore((s) => s.disciplineView);
  const showClearanceZones = useViewStore((s) => s.showClearanceZones);
  const snapStepFt = useViewStore((s) => s.snapStepFt);
  const activeTool = useViewStore((s) => s.activeTool);
  const lockExistingElements = useViewStore((s) => s.lockExistingElements);
  const selectedEntity = useViewStore((s) => s.selectedEntity);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  const [isDragging, setIsDragging] = useState(false);

  if (!item) return null;

  const isSelected =
    selectedEntity?.type === 'equipment' && selectedEntity.id === item.id;
  const vis = getEquipmentVisibility(item.category, disciplineView, isSelected);
  if (vis === 'hidden') return null;

  const isGhost = vis === 'ghost';
  const isLocked = Boolean(item.isExisting && lockExistingElements);
  const palette = THEME_PALETTES[theme];

  const x = item.x * FT;
  const y = item.y * FT;
  const w = item.width * FT;
  const h = item.height * FT;
  const angle = item.rotation || 0;
  const clearance = (item.clearanceFt ?? 0) * FT;

  const strokeColor = isSelected ? '#f59e0b' : palette.equipmentStroke;

  const handleMoveStart = (e: React.PointerEvent<SVGGElement>) => {
    if (activeTool !== 'select' || e.button !== 0 || e.altKey) return;
    setSelectedEntity({ type: 'equipment', id: item.id });
    if (isLocked) return;

    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const origX = item.x;
    const origY = item.y;
    let didMove = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!didMove) {
        if (
          Math.hypot(
            moveEvt.clientX - startClientX,
            moveEvt.clientY - startClientY
          ) < 5
        ) {
          return;
        }
        didMove = true;
        setIsDragging(true);
        recordHistorySnapshot();
      }
      const curPt = clientToFeetCoords(svg, moveEvt.clientX, moveEvt.clientY);
      const nextX = snapToGrid(origX + (curPt.xFt - startPt.xFt), snapStepFt);
      const nextY = snapToGrid(origY + (curPt.yFt - startPt.yFt), snapStepFt);
      updateEquipment(item.id, { x: nextX, y: nextY }, false);
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

  const handleRotateHandleStart = (
    e: React.PointerEvent<SVGCircleElement>,
    offsetDeg = 90
  ) => {
    if (isLocked) return;
    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const centerXFt = item.x + item.width / 2;
    const centerYFt = item.y + item.height / 2;
    let didRotate = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!didRotate) {
        didRotate = true;
        recordHistorySnapshot();
      }
      const curPt = clientToFeetCoords(svg, moveEvt.clientX, moveEvt.clientY);
      const rad = Math.atan2(curPt.yFt - centerYFt, curPt.xFt - centerXFt);
      let rawDeg = (rad * 180) / Math.PI + offsetDeg;
      rawDeg = ((rawDeg % 360) + 360) % 360;
      // Snap to 5° increments by default; hold Shift for 1° precision
      const step = moveEvt.shiftKey ? 1 : 5;
      const snappedDeg = (Math.round(rawDeg / step) * step) % 360;
      updateEquipment(item.id, { rotation: snappedDeg }, false);
    };

    const onPointerUp = () => {
      if (didRotate) {
        void persistCurrentLayout();
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResizeSE = (e: React.PointerEvent<SVGRectElement>) => {
    if (isLocked) return;
    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const startPt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const origW = item.width;
    const origH = item.height;
    let didResize = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!didResize) {
        didResize = true;
        recordHistorySnapshot();
      }
      const curPt = clientToFeetCoords(svg, moveEvt.clientX, moveEvt.clientY);
      const nextW = Math.max(
        1.2,
        snapToGrid(origW + (curPt.xFt - startPt.xFt), snapStepFt)
      );
      const nextH = Math.max(
        1.2,
        snapToGrid(origH + (curPt.yFt - startPt.yFt), snapStepFt)
      );
      updateEquipment(item.id, { width: nextW, height: nextH }, false);
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

  // 1. Dedicated Regulatory Compliance Icon: 24/7 Security Camera with FOV Cone
  if (item.category === 'security-camera') {
    const cx = w / 2;
    const cy = h / 2;
    const coneLen = disciplineView === 'security' ? 62 : 28;
    const coneSpread = disciplineView === 'security' ? 28 : 13;

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onPointerDown={handleMoveStart}
        style={{
          cursor:
            activeTool === 'pan'
              ? 'grab'
              : activeTool === 'select'
              ? 'grab'
              : 'crosshair',
        }}
      >
        <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
          {/* Camera Field of View Cone */}
          <polygon
            points={`0,0 ${coneLen},-${coneSpread} ${coneLen},${coneSpread}`}
            fill={
              disciplineView === 'security'
                ? 'rgba(239, 68, 68, 0.16)'
                : 'rgba(239, 68, 68, 0.08)'
            }
            stroke="#ef4444"
            strokeWidth={disciplineView === 'security' ? 0.75 : 0.45}
            strokeDasharray="2.5 2"
            className="pointer-events-none"
          />
          {/* Camera Housing */}
          <circle
            cx={0}
            cy={0}
            r={5.8}
            fill="#991b1b"
            stroke={isSelected ? '#f59e0b' : '#ffffff'}
            strokeWidth={1.1}
          />
          {/* Lens Direction Indicator */}
          <polygon points="2.5,-2.5 7.2,0 2.5,2.5" fill="#ffffff" />

          {/* Interactive Camera Aim Handle when selected */}
          {isSelected && activeTool === 'select' && !isLocked && (
            <g>
              <line
                x1={6}
                y1={0}
                x2={20}
                y2={0}
                stroke="#10b981"
                strokeWidth={1.2}
              />
              <circle
                cx={20}
                cy={0}
                r={3.5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={1}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => handleRotateHandleStart(e, 0)}
              >
                <title>Drag to aim camera angle ({angle}°)</title>
              </circle>
            </g>
          )}
        </g>
        <rect
          x={cx - 11.5}
          y={cy + 6.5}
          width={23}
          height={6.8}
          rx={1.5}
          fill={palette.dimensionTextBg}
          opacity={0.9}
          className="pointer-events-none"
        />
        <text
          x={cx}
          y={cy + 11.2}
          textAnchor="middle"
          fill="#b91c1c"
          fontSize={4.3}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={700}
          className="pointer-events-none select-none"
        >
          {item.code}
        </text>
      </g>
    );
  }

  // 2. Dedicated Regulatory Compliance Icon: Electronic Strike Lock / Badge Reader
  if (item.category === 'access-control') {
    const cx = w / 2;
    const cy = h / 2;
    return (
      <g
        transform={`translate(${x}, ${y})`}
        onPointerDown={handleMoveStart}
        style={{
          cursor:
            activeTool === 'pan'
              ? 'grab'
              : activeTool === 'select'
              ? 'grab'
              : 'crosshair',
        }}
      >
        <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
          <rect
            x={cx - 7.5}
            y={cy - 5.5}
            width={15}
            height={11}
            rx={2.5}
            fill="#7c3aed"
            stroke={isSelected ? '#f59e0b' : '#ffffff'}
            strokeWidth={1.1}
          />
        </g>
        <text
          x={cx}
          y={cy + 1.8}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={4.4}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={700}
          className="pointer-events-none select-none"
        >
          KEY
        </text>
        {disciplineView === 'security' && (
          <text
            x={cx}
            y={cy + 10.2}
            textAnchor="middle"
            fill="#6d28d9"
            fontSize={4.1}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            className="pointer-events-none select-none"
          >
            {item.code}
          </text>
        )}
      </g>
    );
  }

  // 3. Dedicated Life Safety Equipment Icon (Fire Extinguisher, Eyewash, Fire Alarm, AED)
  if (item.category === 'safety-equipment') {
    const cx = w / 2;
    const cy = h / 2;
    const isEyewash = item.code.startsWith('EW');
    const isAED = item.code.startsWith('AED');
    const bgFill = isEyewash ? '#059669' : isAED ? '#0284c7' : '#dc2626';

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onPointerDown={handleMoveStart}
        style={{
          cursor:
            activeTool === 'pan'
              ? 'grab'
              : activeTool === 'select'
              ? 'grab'
              : 'crosshair',
        }}
      >
        <rect
          x={cx - 9}
          y={cy - 7}
          width={18}
          height={14}
          rx={3}
          fill={bgFill}
          stroke={isSelected ? '#f59e0b' : '#ffffff'}
          strokeWidth={1.3}
        />
        <text
          x={cx}
          y={cy + 1.8}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={4.6}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={700}
          className="pointer-events-none select-none"
        >
          {item.code}
        </text>
        <rect
          x={cx - 24}
          y={cy + 8}
          width={48}
          height={7}
          rx={1.5}
          fill={palette.dimensionTextBg}
          stroke={bgFill}
          strokeWidth={0.5}
          opacity={0.94}
          className="pointer-events-none"
        />
        <text
          x={cx}
          y={cy + 12.8}
          textAnchor="middle"
          fill={palette.textPrimary}
          fontSize={4.0}
          fontWeight={700}
          className="pointer-events-none select-none"
        >
          {item.name.slice(0, 16)}
        </text>
      </g>
    );
  }

  // 4. Dedicated Regulatory Environmental Icon: High-Tonnage Split-System AC & Carbon Scrubber
  if (item.category === 'hvac-scrubber') {
    return (
      <g
        transform={`translate(${x}, ${y}) rotate(${angle}, ${w / 2}, ${h / 2})`}
        onPointerDown={handleMoveStart}
        opacity={isGhost ? 0.25 : 1}
        style={{
          cursor:
            activeTool === 'pan'
              ? 'grab'
              : activeTool === 'select'
              ? 'grab'
              : 'crosshair',
        }}
      >
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          rx={2}
          fill={theme === 'investor-color' ? '#cffafe' : palette.equipmentFill}
          stroke={isSelected ? '#f59e0b' : '#0891b2'}
          strokeWidth={1.4}
        />
        {/* Dual Impellers */}
        <circle
          cx={w * 0.24}
          cy={h / 2}
          r={Math.min(w, h) * 0.26}
          fill="none"
          stroke="#0891b2"
          strokeWidth={0.8}
          opacity={0.55}
        />
        <circle
          cx={w * 0.76}
          cy={h / 2}
          r={Math.min(w, h) * 0.26}
          fill="none"
          stroke="#0891b2"
          strokeWidth={0.8}
          opacity={0.55}
        />
        {!isGhost && (
          <g transform={`rotate(${-angle}, ${w / 2}, ${h / 2})`}>
            <text
              x={w / 2}
              y={h / 2 + 1.8}
              textAnchor="middle"
              fill="#0e7490"
              fontSize={4.6}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              className="pointer-events-none select-none"
            >
              {item.code}
            </text>
            {disciplineView === 'contractor-mep' && (
              <g transform={`translate(${w / 2}, ${h + 6})`} className="pointer-events-none">
                <rect
                  x={-34}
                  y={-4.5}
                  width={68}
                  height={7.5}
                  rx={1.5}
                  fill={palette.dimensionTextBg}
                  stroke="#0891b2"
                  strokeWidth={0.5}
                />
                <text
                  x={0}
                  y={0.8}
                  textAnchor="middle"
                  fill="#0e7490"
                  fontSize={4.0}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                >
                  AC + CARBON SCRUB
                </text>
              </g>
            )}
          </g>
        )}
        {isSelected && activeTool === 'select' && !isLocked && (
          <g>
            <line
              x1={w / 2}
              y1={0}
              x2={w / 2}
              y2={-10}
              stroke="#10b981"
              strokeWidth={1.2}
            />
            <circle
              cx={w / 2}
              cy={-10}
              r={3.5}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={1}
              style={{ cursor: 'grab' }}
              onPointerDown={(e) => handleRotateHandleStart(e, 90)}
            >
              <title>Drag to rotate ({angle}°)</title>
            </circle>
          </g>
        )}
      </g>
    );
  }

  // Standard Equipment Footprint (Rolling Benches, Racking, Secure Vault Safes, Plumbing, Workstations)
  const isCompact = w < 38 || h < 22;
  const maxChars = Math.max(6, Math.floor((w - 6) / 3.2));
  const fittedName =
    item.name.length > maxChars
      ? `${item.name.slice(0, Math.max(5, maxChars - 1))}…`
      : item.name;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle}, ${w / 2}, ${h / 2})`}
      onPointerDown={handleMoveStart}
      opacity={isGhost ? 0.16 : 1}
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
      {/* Safety / Operator Clearance Perimeter */}
      {!isGhost &&
        showClearanceZones &&
        (disciplineView === 'equipment' || disciplineView === 'overview') &&
        clearance > 0 && (
          <rect
            x={-clearance}
            y={-clearance}
            width={w + clearance * 2}
            height={h + clearance * 2}
            rx={2}
            fill={
              theme === 'dark-cad'
                ? 'rgba(245, 158, 11, 0.05)'
                : 'rgba(245, 158, 11, 0.08)'
            }
            stroke="#f59e0b"
            strokeWidth={0.75}
            strokeDasharray="3 2.5"
            className="pointer-events-none"
          />
        )}

      {/* Main Equipment Footprint */}
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={1.5}
        fill={
          theme === 'investor-color'
            ? item.category === 'rolling-bench'
              ? '#dcfce7'
              : item.category === 'secure-vault'
              ? '#fde68a'
              : item.category === 'machinery'
              ? '#dbeafe'
              : item.category === 'racking'
              ? '#fef3c7'
              : item.category === 'plumbing'
              ? '#e0f2fe'
              : item.category === 'electrical-mep'
              ? '#fee2e2'
              : '#f1f5f9'
            : palette.equipmentFill
        }
        stroke={
          isSelected
            ? '#f59e0b'
            : item.category === 'rolling-bench'
            ? '#15803d'
            : item.category === 'secure-vault'
            ? '#b45309'
            : item.category === 'plumbing'
            ? '#0369a1'
            : strokeColor
        }
        strokeWidth={
          isSelected ? 2 : item.category === 'secure-vault' ? 1.6 : 1.15
        }
      />

      {/* 4x8 Rolling Ebb-and-Flow Bench Schematic */}
      {item.category === 'rolling-bench' && (
        <g
          stroke="#15803d"
          strokeWidth={0.5}
          opacity={0.45}
          className="pointer-events-none"
        >
          <rect
            x={2.5}
            y={2.5}
            width={Math.max(2, w - 5)}
            height={Math.max(2, h - 5)}
            fill="none"
          />
          <line x1={0} y1={h / 2} x2={w} y2={h / 2} strokeDasharray="2 1.5" />
          <line x1={w / 2} y1={0} x2={w / 2} y2={h} strokeDasharray="2 1.5" />
        </g>
      )}

      {/* Racking / Vertical Cloning Rack Schematic */}
      {item.category === 'racking' && (
        <g
          stroke={strokeColor}
          strokeWidth={0.5}
          opacity={0.45}
          className="pointer-events-none"
        >
          <line x1={0} y1={0} x2={w} y2={h} />
          <line x1={0} y1={h} x2={w} y2={0} />
        </g>
      )}

      {/* Secure Vault Safe / Cage Double-Wall Schematic */}
      {item.category === 'secure-vault' && (
        <g
          stroke="#b45309"
          strokeWidth={0.65}
          opacity={0.7}
          className="pointer-events-none"
        >
          <rect
            x={2}
            y={2}
            width={Math.max(2, w - 4)}
            height={Math.max(2, h - 4)}
            fill="none"
            strokeDasharray="2 1.2"
          />
        </g>
      )}

      {/* Electrical Power Box / MDP Panel Schematic */}
      {item.category === 'electrical-mep' && (
        <g
          stroke="#dc2626"
          strokeWidth={0.75}
          opacity={0.75}
          className="pointer-events-none"
        >
          <line x1={0} y1={0} x2={w} y2={h} />
          <line x1={w} y1={0} x2={0} y2={h} />
        </g>
      )}

      {/* Commercial Plumbing Symbols */}
      {item.category === 'plumbing' && (
        <g
          stroke="#0369a1"
          strokeWidth={0.7}
          opacity={0.65}
          className="pointer-events-none"
        >
          {w >= 45 || h >= 45 ? (
            <>
              <rect x={w * 0.08} y={h * 0.15} width={w * 0.24} height={h * 0.7} fill="none" />
              <rect x={w * 0.38} y={h * 0.15} width={w * 0.24} height={h * 0.7} fill="none" />
              <rect x={w * 0.68} y={h * 0.15} width={w * 0.24} height={h * 0.7} fill="none" />
            </>
          ) : (
            <ellipse
              cx={w / 2}
              cy={h / 2}
              rx={Math.max(2, w * 0.3)}
              ry={Math.max(2, h * 0.3)}
              fill="none"
            />
          )}
        </g>
      )}

      {/* Only render equipment text labels when NOT ghosted so room/security/evac callouts never collide */}
      {!isGhost &&
        (!isCompact ? (
          <g
            transform={`translate(${w / 2}, ${h / 2}) rotate(${-angle})`}
            className="pointer-events-none select-none"
          >
            <rect
              x={-Math.min(w / 2 - 2, 36)}
              y={-7.2}
              width={Math.min(w - 4, 72)}
              height={14.4}
              rx={2}
              fill={palette.dimensionTextBg}
              opacity={0.86}
            />
            <text
              x={0}
              y={-1.4}
              textAnchor="middle"
              fill={palette.textPrimary}
              fontSize={4.8}
              fontWeight={700}
            >
              {fittedName}
            </text>
            <text
              x={0}
              y={4.6}
              textAnchor="middle"
              fill={palette.textSecondary}
              fontSize={4.2}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
            >
              {item.code} • {formatFeetInches(item.width)}×{formatFeetInches(item.height)}
            </text>
          </g>
        ) : (
          <g
            transform={`translate(${w / 2}, ${h / 2}) rotate(${-angle})`}
            className="pointer-events-none select-none"
          >
            <rect
              x={-Math.min(w / 2 - 1, 16)}
              y={-4.5}
              width={Math.min(w - 2, 32)}
              height={9}
              rx={1.5}
              fill={palette.dimensionTextBg}
              opacity={0.88}
            />
            <text
              x={0}
              y={1.6}
              textAnchor="middle"
              fill={palette.textPrimary}
              fontSize={4.1}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {item.code}
            </text>
          </g>
        ))}

      {/* Interactive Rotation & Resize Handles when Selected */}
      {isSelected && activeTool === 'select' && !isLocked && (
        <g>
          {/* Top Circular Rotation Handle */}
          <line
            x1={w / 2}
            y1={0}
            x2={w / 2}
            y2={-10}
            stroke="#10b981"
            strokeWidth={1.2}
          />
          <circle
            cx={w / 2}
            cy={-10}
            r={3.5}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth={1}
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => handleRotateHandleStart(e, 90)}
          >
            <title>Drag to rotate ({angle}° • Hold Shift for 1° precision)</title>
          </circle>

          {/* Bottom-Right Resize Handle */}
          <rect
            x={w - 3}
            y={h - 3}
            width={6}
            height={6}
            rx={1}
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth={1}
            style={{ cursor: 'nwse-resize' }}
            onPointerDown={handleResizeSE}
          />
        </g>
      )}
    </g>
  );
};
