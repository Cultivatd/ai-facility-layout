import React from 'react';
import { DISCIPLINE_VIEWS } from '../../data/discipline-views';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import {
  calculatePolygonAreaSqFt,
  formatFeetInches,
  ROOM_CATEGORY_STYLES,
  THEME_PALETTES,
} from '../../utils/dimensions';
import { computeSheetBounds, FT } from './canvasConstants';

export const TitleBlockOverlay: React.FC = () => {
  const metadata = useLayoutStore((s) => s.layout.metadata);
  const rooms = useLayoutStore((s) => s.layout.rooms);
  const shellPerimeter = useLayoutStore((s) => s.layout.shellPerimeter);
  const enabledModules = useLayoutStore((s) => s.layout.enabledModules ?? []);

  const showTitleBlock = useViewStore((s) => s.showTitleBlock);
  const showExistingWallLegend = useViewStore((s) => s.showExistingWallLegend);
  const theme = useViewStore((s) => s.theme);
  const disciplineView = useViewStore((s) => s.disciplineView);

  if (!showTitleBlock) return null;

  const activeDiscipline =
    DISCIPLINE_VIEWS.find((d) => d.id === disciplineView) ?? DISCIPLINE_VIEWS[0];

  const palette = THEME_PALETTES[theme];
  const sheet = computeSheetBounds(shellPerimeter, showExistingWallLegend);

  const enclosedRooms = rooms.filter((r) => r.category !== 'corridor');
  const allocatedSqFt = Math.round(
    enclosedRooms.reduce((sum, r) => sum + r.width * r.height, 0)
  );
  const shellUsf = Math.round(calculatePolygonAreaSqFt(shellPerimeter));
  const openCirculationSqFt = Math.max(0, shellUsf - allocatedSqFt);

  const hasSecurityModule =
    enabledModules.includes('security-compliance') ||
    rooms.some((r) => r.isLimitedAccess);
  const hasCultivationModule = enabledModules.includes('cultivation');

  const tbX = sheet.titleBlockXSvg;
  const tbY = sheet.titleBlockYSvg;
  const tbW = sheet.titleBlockWSvg;
  const tbH = sheet.titleBlockHSvg;
  const headerCenterX = sheet.minX + sheet.width / 2;
  const headerTopY = (sheet.shell.minYFt - 5.4) * FT;

  return (
    <g className="pointer-events-none select-none">
      {/* Top Sheet Header */}
      <g transform={`translate(${headerCenterX}, ${headerTopY})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fill={palette.textPrimary}
          fontSize={9.6}
          fontWeight={700}
          letterSpacing={1.0}
        >
          {activeDiscipline.sheetTitle}
        </text>
        <text
          x={0}
          y={9}
          textAnchor="middle"
          fill={palette.textSecondary}
          fontSize={6.8}
          fontFamily="JetBrains Mono, monospace"
        >
          {metadata.projectName} &mdash; {activeDiscipline.subtitle}
        </text>
      </g>

      {/* Wall, Compliance & Room Schedule on Right Margin */}
      {showExistingWallLegend && (
        <g
          transform={`translate(${sheet.legendXSvg}, ${
            (sheet.shell.minYFt + 0.5) * FT
          })`}
        >
          <rect
            x={0}
            y={0}
            width={18.0 * FT}
            height={166 + rooms.length * 16.5}
            rx={3}
            fill={palette.dimensionTextBg}
            stroke={palette.sheetBorder}
            strokeWidth={1}
          />

          <text
            x={8}
            y={12}
            fill={palette.textPrimary}
            fontSize={6.8}
            fontWeight={700}
            letterSpacing={0.5}
          >
            ARCHITECTURAL &amp; FACILITY LEGEND
          </text>

          {/* Existing Wall Sample */}
          <line
            x1={8}
            y1={21}
            x2={32}
            y2={21}
            stroke={palette.shellWallStroke}
            strokeWidth={2.5}
          />
          <text x={38} y={23} fill={palette.textSecondary} fontSize={5.6}>
            Existing Shell / Wall to Remain
          </text>

          {/* New Partition Wall Sample */}
          <line
            x1={8}
            y1={30}
            x2={32}
            y2={30}
            stroke={theme === 'investor-color' ? '#059669' : palette.shellWallStroke}
            strokeWidth={1.6}
          />
          <line
            x1={8}
            y1={32.2}
            x2={32}
            y2={32.2}
            stroke={theme === 'investor-color' ? '#059669' : palette.shellWallStroke}
            strokeWidth={0.6}
          />
          <text x={38} y={33} fill={palette.textSecondary} fontSize={5.6}>
            New Insulated / Partition Wall
          </text>

          {/* Modular Expandable Wall Sample */}
          <line
            x1={8}
            y1={41}
            x2={32}
            y2={41}
            stroke="#0284c7"
            strokeWidth={2.2}
            strokeDasharray="4 2"
          />
          <text x={38} y={43} fill={palette.textSecondary} fontSize={5.6}>
            Modular Expandable Wall (Non-Load-Bearing)
          </text>

          {/* Limited Access Area / Security or Clearance Sample */}
          {hasSecurityModule ? (
            <>
              <rect x={8} y={48} width={24} height={7.5} rx={1.5} fill="#dc2626" />
              <text
                x={20}
                y={53.2}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={4.2}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                L.A.A.
              </text>
              <text x={38} y={53.5} fill={palette.textSecondary} fontSize={5.6}>
                Limited Access Area (Restricted Zone)
              </text>

              <rect x={13} y={59} width={14} height={8.5} rx={1.8} fill="#7c3aed" />
              <text
                x={20}
                y={64.8}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={4.2}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                KEY
              </text>
              <text x={38} y={65} fill={palette.textSecondary} fontSize={5.6}>
                Electronic Strike Lock / Badge Reader
              </text>

              <g transform="translate(16, 74)">
                <polygon
                  points="0,0 14,-5 14,5"
                  fill="rgba(239, 68, 68, 0.2)"
                  stroke="#ef4444"
                  strokeWidth={0.5}
                />
                <circle cx={0} cy={0} r={4} fill="#991b1b" />
              </g>
              <text x={38} y={76} fill={palette.textSecondary} fontSize={5.6}>
                24/7 Security Camera &amp; FOV Cone
              </text>
            </>
          ) : (
            <>
              <rect
                x={8}
                y={48}
                width={24}
                height={7.5}
                rx={1.5}
                fill="rgba(245, 158, 11, 0.12)"
                stroke="#f59e0b"
                strokeWidth={0.8}
                strokeDasharray="2.5 1.5"
              />
              <text x={38} y={53.5} fill={palette.textSecondary} fontSize={5.6}>
                Equipment Operator / Safety Clearance
              </text>

              <rect
                x={10}
                y={59}
                width={20}
                height={8.5}
                rx={1.8}
                fill="#dc2626"
              />
              <text
                x={20}
                y={64.8}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={4.2}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                FE-1
              </text>
              <text x={38} y={65} fill={palette.textSecondary} fontSize={5.6}>
                Life Safety / Fire Extinguisher / AED
              </text>

              <rect
                x={10}
                y={70}
                width={20}
                height={8}
                rx={1.5}
                fill="#dbeafe"
                stroke="#1e293b"
                strokeWidth={0.9}
              />
              <text x={38} y={76} fill={palette.textSecondary} fontSize={5.6}>
                Process Machinery &amp; Workstations
              </text>
            </>
          )}

          {/* HVAC / Mechanical Sample */}
          <rect
            x={10}
            y={81}
            width={20}
            height={8}
            rx={1.5}
            fill="#cffafe"
            stroke="#0891b2"
            strokeWidth={1}
          />
          <circle cx={16} cy={85} r={2.2} fill="none" stroke="#0891b2" strokeWidth={0.7} />
          <circle cx={24} cy={85} r={2.2} fill="none" stroke="#0891b2" strokeWidth={0.7} />
          <text x={38} y={87} fill={palette.textSecondary} fontSize={5.6}>
            {hasCultivationModule
              ? 'Split-System AC & Carbon Scrubber'
              : 'HVAC / Mechanical & Utility Equipment'}
          </text>

          <line
            x1={8}
            y1={95}
            x2={18.0 * FT - 8}
            y2={95}
            stroke={palette.sheetBorder}
            strokeWidth={0.7}
          />

          {/* Room & Space Program Schedule */}
          <text
            x={8}
            y={106}
            fill={palette.textPrimary}
            fontSize={6.8}
            fontWeight={700}
            letterSpacing={0.5}
          >
            ZONING &amp; SPATIAL ALLOCATION
          </text>

          {rooms.map((r, idx) => {
            const ry = 118 + idx * 16.5;
            const sf = Math.round(r.width * r.height);
            const cat = ROOM_CATEGORY_STYLES[r.category];
            const cleanName = r.name.replace(/^Zone [A-Z0-9-]+:\s*/i, '');
            return (
              <g key={r.id} transform={`translate(8, ${ry})`}>
                <rect
                  x={0}
                  y={-5}
                  width={5.5}
                  height={5.5}
                  rx={1}
                  fill={r.color || cat?.badgeColor || '#3b82f6'}
                />
                <text
                  x={8.5}
                  y={0}
                  fill={palette.textPrimary}
                  fontSize={4.9}
                  fontWeight={700}
                >
                  {r.code}: {cleanName.slice(0, 28)}
                </text>
                <text
                  x={18.0 * FT - 16}
                  y={0}
                  textAnchor="end"
                  fill={palette.textPrimary}
                  fontSize={5.4}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                >
                  {sf.toLocaleString()} SF
                </text>
                <text
                  x={8.5}
                  y={6.2}
                  fill={palette.textSecondary}
                  fontSize={4.5}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {formatFeetInches(r.width)} × {formatFeetInches(r.height)} • {r.wallHeight}&apos; H
                </text>
                <text
                  x={18.2 * FT - 16}
                  y={6.2}
                  textAnchor="end"
                  fill={r.isLimitedAccess ? '#dc2626' : palette.textSecondary}
                  fontSize={4.3}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                >
                  {r.isLimitedAccess ? 'LIMITED ACCESS' : r.isExisting ? 'EXISTING' : 'NEW ZONE'}
                </text>
              </g>
            );
          })}

          {/* Totals Footer inside Schedule */}
          <g transform={`translate(8, ${122 + rooms.length * 16.5})`}>
            <line
              x1={0}
              y1={-5}
              x2={18.2 * FT - 16}
              y2={-5}
              stroke={palette.sheetBorder}
              strokeWidth={0.7}
            />
            <text x={0} y={5} fill={palette.textSecondary} fontSize={5.3}>
              Enclosed Zones Total:
            </text>
            <text
              x={18.2 * FT - 16}
              y={5}
              textAnchor="end"
              fill={palette.textPrimary}
              fontSize={5.6}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {allocatedSqFt.toLocaleString()} USF
            </text>

            <text x={0} y={14.5} fill={palette.textSecondary} fontSize={5.3}>
              Open Circulation / Aisles:
            </text>
            <text
              x={18.2 * FT - 16}
              y={14.5}
              textAnchor="end"
              fill={palette.textPrimary}
              fontSize={5.6}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {openCirculationSqFt.toLocaleString()} USF
            </text>

            <text x={0} y={24} fill={palette.textSecondary} fontSize={5.3}>
              Net Usable Shell Area:
            </text>
            <text
              x={18.2 * FT - 16}
              y={24}
              textAnchor="end"
              fill={palette.textPrimary}
              fontSize={5.6}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {shellUsf.toLocaleString()} USF
            </text>

            <text x={0} y={34.5} fill={palette.textPrimary} fontSize={5.8} fontWeight={700}>
              Total Lease / Building Area:
            </text>
            <text
              x={18.2 * FT - 16}
              y={34.5}
              textAnchor="end"
              fill={palette.textPrimary}
              fontSize={6.0}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {metadata.rentableSqFt.toLocaleString()} RSF
            </text>
          </g>
        </g>
      )}

      {/* Compact Bottom Building & Scale Title Strip */}
      <g transform={`translate(${tbX}, ${tbY})`}>
        <rect
          x={0}
          y={0}
          width={tbW}
          height={tbH}
          rx={2.5}
          fill={palette.dimensionTextBg}
          stroke={palette.shellWallStroke}
          strokeWidth={1.6}
        />

        {/* Divider between Building Details and Scale / North Block */}
        <line
          x1={tbW * 0.67}
          y1={5}
          x2={tbW * 0.67}
          y2={tbH - 5}
          stroke={palette.shellWallStroke}
          strokeWidth={1.1}
        />

        {/* Specific Building & Suite Details (Left / Center) */}
        <g transform="translate(14, 23)">
          <text
            x={0}
            y={0}
            fill={palette.textPrimary}
            fontSize={11.5}
            fontWeight={700}
          >
            {metadata.buildingName} &mdash; {metadata.suiteName} ({metadata.rentableSqFt.toLocaleString()} RSF / {shellUsf.toLocaleString()} USF)
          </text>
          <text
            x={0}
            y={17}
            fill={palette.textSecondary}
            fontSize={7.8}
            fontWeight={600}
          >
            {metadata.address} &bull; {metadata.clearHeightFt}&apos;-0&quot; Clear Structural Height
          </text>
          <text
            x={0}
            y={32}
            fill={palette.textSecondary}
            fontSize={6.4}
            fontFamily="JetBrains Mono, monospace"
          >
            {metadata.projectName} &bull; Rev: {metadata.revisionDate}
          </text>
        </g>

        {/* Plan North Compass & Graphic Scale Bar (Right) */}
        <g transform={`translate(${tbW * 0.695}, 18)`}>
          {/* Plan North Compass */}
          <g transform="translate(16, 12)">
            <circle
              cx={0}
              cy={0}
              r={10.5}
              fill="none"
              stroke={palette.shellWallStroke}
              strokeWidth={1.3}
            />
            <polygon
              points="0,-9 -5.5,3 -2,3 -2,8 2,8 2,3 5.5,3"
              fill="none"
              stroke={palette.shellWallStroke}
              strokeWidth={1.2}
            />
            <text
              x={0}
              y={20}
              textAnchor="middle"
              fill={palette.textPrimary}
              fontSize={5.8}
              fontWeight={700}
              letterSpacing={0.5}
            >
              NORTH
            </text>
          </g>

          {/* Graphic Scale Bar (0 - 5 - 10 - 15 FT) */}
          <g transform="translate(46, 8)">
            <text x={0} y={-3} fontSize={5.6} fill={palette.textSecondary} textAnchor="middle">
              0
            </text>
            <text
              x={5 * FT}
              y={-3}
              fontSize={5.6}
              fill={palette.textSecondary}
              textAnchor="middle"
            >
              5
            </text>
            <text
              x={10 * FT}
              y={-3}
              fontSize={5.6}
              fill={palette.textSecondary}
              textAnchor="middle"
            >
              10
            </text>
            <text
              x={15 * FT}
              y={-3}
              fontSize={5.6}
              fill={palette.textSecondary}
              textAnchor="middle"
            >
              15 FT
            </text>
            <rect
              x={0}
              y={0}
              width={5 * FT}
              height={4.5}
              fill={palette.shellWallStroke}
            />
            <rect
              x={5 * FT}
              y={0}
              width={5 * FT}
              height={4.5}
              fill="none"
              stroke={palette.shellWallStroke}
              strokeWidth={1}
            />
            <rect
              x={10 * FT}
              y={0}
              width={5 * FT}
              height={4.5}
              fill={palette.shellWallStroke}
            />
            <text
              x={7.5 * FT}
              y={17}
              textAnchor="middle"
              fill={palette.textSecondary}
              fontSize={5.6}
              fontFamily="JetBrains Mono, monospace"
            >
              GRAPHIC SCALE (FEET)
            </text>
          </g>
        </g>
      </g>
    </g>
  );
};
