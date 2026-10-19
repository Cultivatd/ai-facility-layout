import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { computeShellBounds, FT } from './canvasConstants';

function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export const DisciplineOverlayLayer: React.FC = () => {
  const disciplineView = useViewStore((s) => s.disciplineView);
  const rooms = useLayoutStore((s) => s.layout.rooms);
  const doors = useLayoutStore((s) => s.layout.doors);
  const equipment = useLayoutStore((s) => s.layout.equipment);
  const shellPerimeter = useLayoutStore((s) => s.layout.shellPerimeter);
  const enabledModules = useLayoutStore((s) => s.layout.enabledModules ?? []);

  const shellBounds = computeShellBounds(shellPerimeter);

  if (disciplineView === 'evac-safety') {
    // Identify exterior egress doors: marked explicitly, near bounding box, or within 2.5 ft of any exterior shell edge
    const exteriorDoors = doors.filter((d) => {
      if (d.type === 'overhead-dock' || d.type === 'cased-opening') return false;
      if (d.isExteriorEgress) return true;
      const nearNorth = Math.abs(d.y - shellBounds.minYFt) <= 3.0;
      const nearSouth = Math.abs(d.y - shellBounds.maxYFt) <= 3.0;
      const nearWest = Math.abs(d.x - shellBounds.minXFt) <= 3.5;
      const nearEast = Math.abs(d.x - shellBounds.maxXFt) <= 3.5;
      if (nearNorth || nearSouth || nearWest || nearEast) return true;

      return shellPerimeter.some((p1, idx) => {
        const p2 = shellPerimeter[(idx + 1) % shellPerimeter.length];
        return distanceToSegment(d.x, d.y, p1.x, p1.y, p2.x, p2.y) <= 2.5;
      });
    });

    // Find corridor spine X or default to building center X
    const corridorRoom = rooms.find((r) => r.category === 'corridor');
    const spineX = corridorRoom
      ? corridorRoom.x + Math.min(corridorRoom.width * 0.45, 7)
      : shellBounds.centerXFt;
    const midY = shellBounds.centerYFt;

    return (
      <g className="pointer-events-none select-none">
        <defs>
          <marker
            id="egress-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
        </defs>

        {/* Egress travel paths from central corridor spine to each exterior exit door */}
        {exteriorDoors.map((d) => {
          const elbowY =
            d.y < midY
              ? Math.max(shellBounds.minYFt + 4, d.y + 6)
              : Math.min(shellBounds.maxYFt - 4, d.y - 6);
          return (
            <path
              key={`egress-path-${d.id}`}
              d={`M ${spineX * FT} ${midY * FT} L ${spineX * FT} ${elbowY * FT} L ${
                d.x * FT
              } ${d.y * FT}`}
              fill="none"
              stroke="#10b981"
              strokeWidth={2.2}
              strokeDasharray="5 3"
              markerEnd="url(#egress-arrow)"
            />
          );
        })}

        {/* Illuminated EXIT Signs at Exterior Egress Doors */}
        {exteriorDoors.map((d) => {
          const isNorth = Math.abs(d.y - shellBounds.minYFt) <= 3.5;
          const isSouth = Math.abs(d.y - shellBounds.maxYFt) <= 3.5;
          const signY = isNorth ? d.y - 3.2 : isSouth ? d.y + 3.2 : d.y - 2.8;
          return (
            <g
              key={`exit-sign-${d.id}`}
              transform={`translate(${d.x * FT}, ${signY * FT})`}
            >
              <rect
                x={-26}
                y={-5.5}
                width={52}
                height={11}
                rx={2}
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth={1}
              />
              <text
                x={0}
                y={2}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={4.8}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
              >
                EXIT • {d.label}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  if (disciplineView === 'contractor-mep') {
    const plumbingItems = equipment.filter((e) => e.category === 'plumbing');

    // Determine rooms with pressure differential badges
    const pressureTags = rooms
      .map((r) => {
        let text = r.pressureDifferential;
        if (!text) {
          if (r.category === 'cleanroom' && enabledModules.includes('edible-cleanroom')) {
            text = '+0.05" WC POS. PRESSURE HEPA';
          } else if (
            r.category === 'cultivation' &&
            enabledModules.includes('cultivation')
          ) {
            text = '-0.03" WC NEG. PRESSURE • SEALED LOOP';
          }
        }
        if (!text) return null;
        const color = text.includes('+') ? '#0284c7' : '#059669';
        return {
          id: r.id,
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
          text,
          color,
        };
      })
      .filter((t): t is NonNullable<typeof t> => Boolean(t));

    return (
      <g className="pointer-events-none select-none">
        {/* Sanitary & Domestic Water Wet-Wall Manifold connecting plumbing fixtures */}
        {plumbingItems.length >= 2 && (
          <polyline
            points={plumbingItems
              .map((p) => `${(p.x + p.width / 2) * FT},${(p.y + p.height / 2) * FT}`)
              .join(' ')}
            fill="none"
            stroke="#0284c7"
            strokeWidth={2.0}
            strokeDasharray="3 2"
          />
        )}

        {/* Pressure Differential Badges for Cleanrooms & Closed-Loop Rooms */}
        {pressureTags.map((tag) => (
          <g
            key={tag.id}
            transform={`translate(${tag.x * FT}, ${tag.y * FT})`}
          >
            <rect
              x={-54}
              y={-4.5}
              width={108}
              height={9}
              rx={2}
              fill={tag.color}
              opacity={0.92}
            />
            <text
              x={0}
              y={1.6}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={4.1}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {tag.text}
            </text>
          </g>
        ))}
      </g>
    );
  }

  return null;
};
