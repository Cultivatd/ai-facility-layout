import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { FacilityRoom } from '../../types/facility';
import {
  formatFeetInches,
  ROOM_CATEGORY_STYLES,
  THEME_PALETTES,
} from '../../utils/dimensions';
import { FT } from './canvasConstants';

function fitString(str: string, maxPx: number, avgCharPx: number): string {
  const maxChars = Math.max(8, Math.floor(maxPx / avgCharPx));
  if (str.length <= maxChars) return str;
  return `${str.slice(0, maxChars - 1).trimEnd()}…`;
}

export const RoomLabelsLayer: React.FC = () => {
  const rooms = useLayoutStore((s) => s.layout.rooms);
  const equipment = useLayoutStore((s) => s.layout.equipment);
  const theme = useViewStore((s) => s.theme);
  const disciplineView = useViewStore((s) => s.disciplineView);
  const roomLabelMode = useViewStore((s) => s.roomLabelMode);
  const showRoomDimensions = useViewStore((s) => s.showRoomDimensions);
  const selectedEntity = useViewStore((s) => s.selectedEntity);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  const palette = THEME_PALETTES[theme];

  const isRoomEmpty = (room: FacilityRoom) =>
    !equipment.some((e) => {
      const cx = e.x + e.width / 2;
      const cy = e.y + e.height / 2;
      return (
        cx >= room.x &&
        cx <= room.x + room.width &&
        cy >= room.y &&
        cy <= room.y + room.height
      );
    });

  // Determine effective label mode for a room based on user setting + active discipline view
  const getEffectiveMode = (room: FacilityRoom): 'full' | 'header' | 'minimal' => {
    if (roomLabelMode !== 'auto') return roomLabelMode;

    // Rooms with no interior equipment (like an expansion reserve) can show full details
    if (room.category !== 'corridor' && isRoomEmpty(room)) {
      return disciplineView === 'security' ? 'header' : 'full';
    }

    if (disciplineView === 'room-usage' || disciplineView === 'evac-safety') {
      return 'full';
    }

    return 'header';
  };

  return (
    <g className="select-none">
      {rooms.map((room) => {
        const mode = getEffectiveMode(room);
        const isSelected =
          selectedEntity?.type === 'room' && selectedEntity.id === room.id;
        const catStyle =
          ROOM_CATEGORY_STYLES[room.category] ?? ROOM_CATEGORY_STYLES.production;

        const x = room.x * FT;
        const y = room.y * FT;
        const w = room.width * FT;
        const h = room.height * FT;
        const sqFt = Math.round(room.width * room.height);

        const badgeBg =
          theme === 'investor-color'
            ? room.color || catStyle.badgeColor
            : palette.dimensionLine;
        const strokeColor = isSelected
          ? '#f59e0b'
          : theme === 'investor-color'
          ? room.color || catStyle.strokeInvestor
          : palette.shellWallStroke;

        // 1. MINIMAL MODE: Small code pill docked at top/bottom edge
        if (mode === 'minimal') {
          const anchorY =
            room.labelYFt !== undefined
              ? room.labelYFt * FT
              : room.labelAnchor === 'bottom'
              ? y + h - 7
              : y + 7;
          const anchorX =
            room.labelXFt !== undefined
              ? room.labelXFt * FT
              : x + w / 2;

          return (
            <g
              key={room.id}
              transform={`translate(${anchorX}, ${anchorY})`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntity({ type: 'room', id: room.id });
              }}
              className="cursor-pointer"
            >
              <rect
                x={-34}
                y={-5.5}
                width={68}
                height={11}
                rx={2.5}
                fill={badgeBg}
                stroke={isSelected ? '#f59e0b' : '#ffffff'}
                strokeWidth={0.8}
              />
              <text
                x={0}
                y={2}
                textAnchor="middle"
                fill={theme === 'dark-cad' ? '#020617' : '#ffffff'}
                fontSize={5.4}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                {room.code} • {sqFt} SF
              </text>
            </g>
          );
        }

        // 2. HEADER MODE: Sleek non-overlapping edge banner docked along room border away from equipment
        if (mode === 'header') {
          let anchorX = room.labelXFt !== undefined ? room.labelXFt * FT : x + w / 2;
          let anchorY = room.labelYFt !== undefined ? room.labelYFt * FT : y + 6.5;

          if (room.labelXFt === undefined && room.labelYFt === undefined) {
            if (room.labelAnchor === 'bottom') {
              anchorY = y + h - 7.5;
            } else if (room.labelAnchor === 'center') {
              anchorY = y + h / 2;
            }
          }

          const shortTitle = room.name.replace(/^Zone [A-Z0-9-]+:\s*/i, '');
          const dimText = `${formatFeetInches(room.width)}×${formatFeetInches(room.height)} (${sqFt} SF)`;
          const pillW = Math.min(Math.max(w - 4, 96), 148);
          const textAvailW = pillW - 32;

          return (
            <g
              key={room.id}
              transform={`translate(${anchorX}, ${anchorY})`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntity({ type: 'room', id: room.id });
              }}
              className="cursor-pointer"
            >
              {/* Main Edge Ribbon */}
              <rect
                x={-pillW / 2}
                y={-6.5}
                width={pillW}
                height={13}
                rx={3}
                fill={palette.dimensionTextBg}
                stroke={strokeColor}
                strokeWidth={isSelected ? 1.5 : 0.9}
                opacity={0.96}
              />
              {/* Left Color Accent Tab */}
              <rect
                x={-pillW / 2}
                y={-6.5}
                width={28}
                height={13}
                rx={2.5}
                fill={badgeBg}
              />
              <text
                x={-pillW / 2 + 14}
                y={1.8}
                textAnchor="middle"
                fill={theme === 'dark-cad' ? '#020617' : '#ffffff'}
                fontSize={4.7}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                {room.code}
              </text>

              {/* Room Name & SF */}
              <text
                x={13}
                y={-0.3}
                textAnchor="middle"
                fill={palette.textPrimary}
                fontSize={5.1}
                fontWeight={700}
              >
                {fitString(shortTitle, textAvailW, 3.1)}
              </text>
              <text
                x={13}
                y={4.6}
                textAnchor="middle"
                fill={palette.textSecondary}
                fontSize={4.3}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {fitString(dimText, textAvailW, 2.7)}
              </text>

              {/* Compact L.A.A. Pill if Limited Access */}
              {room.isLimitedAccess && (
                <g transform={`translate(${pillW / 2 - 11}, -6.5)`}>
                  <rect
                    x={-11}
                    y={-4.5}
                    width={22}
                    height={6.5}
                    rx={1.5}
                    fill="#dc2626"
                  />
                  <text
                    x={0}
                    y={0.2}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={3.9}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={700}
                  >
                    L.A.A.
                  </text>
                </g>
              )}

              {/* In Contractor MEP view, show wall height & ceiling type tag */}
              {disciplineView === 'contractor-mep' && !room.isExisting && (
                <g transform="translate(0, 11.5)">
                  <rect
                    x={-48}
                    y={-4}
                    width={96}
                    height={8.5}
                    rx={2}
                    fill="#0891b2"
                  />
                  <text
                    x={0}
                    y={1.8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={4.2}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={700}
                  >
                    {room.wallHeight}&apos; H • {(room.ceilingType || 'OPEN').toUpperCase()} •{' '}
                    {(room.floorFinish || 'EPOXY').toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          );
        }

        // 3. FULL SCHEDULE PLATE MODE (Used in Room Usage, Evac/Safety, and open Expansion Reserve)
        const compactRoom = room.width < 10.5 || room.height < 9;
        const centerX = room.labelXFt !== undefined ? room.labelXFt * FT : x + w / 2;
        const centerY = room.labelYFt !== undefined ? room.labelYFt * FT : y + h / 2;

        if (compactRoom) {
          const cPlateW = Math.min(Math.max(w * 0.94, 76), 110);
          return (
            <g
              key={room.id}
              transform={`translate(${centerX}, ${centerY})`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntity({ type: 'room', id: room.id });
              }}
              className="cursor-pointer"
            >
              <rect
                x={-cPlateW / 2}
                y={-12}
                width={cPlateW}
                height={24}
                rx={3}
                fill={palette.dimensionTextBg}
                stroke={strokeColor}
                strokeWidth={0.8}
                opacity={0.96}
              />
              <text
                x={0}
                y={-2}
                textAnchor="middle"
                fill={palette.textPrimary}
                fontSize={5.4}
                fontWeight={700}
              >
                {fitString(room.name, cPlateW - 8, 3.3)}
              </text>
              <text
                x={0}
                y={6.8}
                textAnchor="middle"
                fill={palette.textSecondary}
                fontSize={4.6}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {formatFeetInches(room.width)}×{formatFeetInches(room.height)} ({sqFt} SF)
              </text>
            </g>
          );
        }

        const isNarrowRoom = w < 145;
        const plateW = Math.min(Math.max(w * 0.93, 114), 186);
        const innerMaxPx = plateW - 10;

        const titleFontSize = isNarrowRoom ? 5.8 : 7.0;
        const subFontSize = isNarrowRoom ? 4.5 : 5.1;
        const matFontSize = isNarrowRoom ? 4.2 : 4.7;
        const dimFontSize = isNarrowRoom ? 4.5 : 5.2;

        const hasSub = Boolean(room.subtitle);
        const hasMat = Boolean(room.materialCallout);
        const showDims = showRoomDimensions && room.showDimensions !== false;

        let plateH = 19;
        if (hasSub) plateH += 8;
        if (hasMat) plateH += 8;
        if (showDims) plateH += 8;

        let lineY = 7.8;

        const dimLineStr = `${formatFeetInches(room.width)} × ${formatFeetInches(
          room.height
        )} (${sqFt} SF • ${room.wallHeight}' H)`;

        return (
          <g
            key={room.id}
            transform={`translate(${centerX}, ${centerY})`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntity({ type: 'room', id: room.id });
            }}
            className="cursor-pointer"
          >
            {/* Regulatory Limited Access Area Badge */}
            {room.isLimitedAccess && (
              <g transform="translate(0, -31)">
                <rect
                  x={-45}
                  y={-5}
                  width={90}
                  height={9.5}
                  rx={2}
                  fill="#dc2626"
                />
                <text
                  x={0}
                  y={1.6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={4.9}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                  letterSpacing={0.4}
                >
                  LIMITED ACCESS AREA
                </text>
              </g>
            )}

            {/* Room Code Pill */}
            <rect
              x={-34}
              y={-20}
              width={68}
              height={10}
              rx={2.5}
              fill={badgeBg}
            />
            <text
              x={0}
              y={-13.3}
              textAnchor="middle"
              fill={theme === 'dark-cad' ? '#020617' : '#ffffff'}
              fontSize={5.5}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {room.code} {room.isExisting ? '• EXIST' : `• ~${sqFt.toLocaleString()} SF`}
            </text>

            {/* Main Schedule Plate */}
            <rect
              x={-plateW / 2}
              y={-8.5}
              width={plateW}
              height={plateH}
              rx={3.5}
              fill={palette.dimensionTextBg}
              stroke={strokeColor}
              strokeWidth={isSelected ? 1.5 : 0.8}
              opacity={0.95}
            />

            <text
              x={0}
              y={0.2}
              textAnchor="middle"
              fill={palette.textPrimary}
              fontSize={titleFontSize}
              fontWeight={700}
            >
              {fitString(room.name, innerMaxPx, titleFontSize * 0.57)}
            </text>

            {hasSub && room.subtitle && (
              <text
                x={0}
                y={lineY}
                textAnchor="middle"
                fill={theme === 'investor-color' ? strokeColor : palette.textSecondary}
                fontSize={subFontSize}
                fontWeight={700}
              >
                {fitString(room.subtitle, innerMaxPx, subFontSize * 0.56)}
              </text>
            )}
            {hasSub && (lineY += 7.8)}

            {hasMat && room.materialCallout && (
              <text
                x={0}
                y={lineY}
                textAnchor="middle"
                fill={palette.textSecondary}
                fontSize={matFontSize}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {fitString(room.materialCallout, innerMaxPx, matFontSize * 0.6)}
              </text>
            )}
            {hasMat && (lineY += 7.8)}

            {showDims && (
              <text
                x={0}
                y={lineY}
                textAnchor="middle"
                fill={palette.dimensionText}
                fontSize={dimFontSize}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                {fitString(dimLineStr, innerMaxPx, dimFontSize * 0.58)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
