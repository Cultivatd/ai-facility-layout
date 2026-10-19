import React, { useEffect, useRef, useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { ActiveTool } from '../../types/facility';
import { formatFeetInches, snapToGrid, THEME_PALETTES } from '../../utils/dimensions';
import { clientToFeetCoords } from '../../utils/svgMouse';
import { computeSheetBounds, FT } from './canvasConstants';
import { CanvasToolDock } from './CanvasToolDock';
import { DisciplineOverlayLayer } from './DisciplineOverlayLayer';
import { DoorNode } from './DoorNode';
import { EquipmentNode } from './EquipmentNode';
import { PdfUnderlayLayer } from './PdfUnderlayLayer';
import { RoomLabelsLayer } from './RoomLabelsLayer';
import { RoomNode } from './RoomNode';
import { ShellDimensionsLayer } from './ShellDimensionsLayer';
import { ShellLayer } from './ShellLayer';
import { StructuralNode } from './StructuralNode';
import { TitleBlockOverlay } from './TitleBlockOverlay';

export const FacilityCanvas2D: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const previousToolRef = useRef<ActiveTool | null>(null);
  const isPanningRef = useRef<boolean>(false);

  const shellPerimeter = useLayoutStore((s) => s.layout.shellPerimeter);
  const rooms = useLayoutStore((s) => s.layout.rooms);
  const doors = useLayoutStore((s) => s.layout.doors);
  const equipment = useLayoutStore((s) => s.layout.equipment);
  const structuralElements = useLayoutStore((s) => s.layout.structuralElements);

  const addRoom = useLayoutStore((s) => s.addRoom);
  const addDoor = useLayoutStore((s) => s.addDoor);
  const addEquipment = useLayoutStore((s) => s.addEquipment);
  const addStructural = useLayoutStore((s) => s.addStructural);
  const undo = useLayoutStore((s) => s.undo);
  const redo = useLayoutStore((s) => s.redo);

  const theme = useViewStore((s) => s.theme);
  const showExistingWallLegend = useViewStore((s) => s.showExistingWallLegend);
  const activeTool = useViewStore((s) => s.activeTool);
  const setActiveTool = useViewStore((s) => s.setActiveTool);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);
  const snapStepFt = useViewStore((s) => s.snapStepFt);
  const zoom = useViewStore((s) => s.zoom);
  const panX = useViewStore((s) => s.panX);
  const panY = useViewStore((s) => s.panY);
  const setViewport = useViewStore((s) => s.setViewport);
  const resetViewport = useViewStore((s) => s.resetViewport);

  const [cursorFt, setCursorFt] = useState<{ x: number; y: number } | null>(null);
  const [measureLine, setMeasureLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const palette = THEME_PALETTES[theme];
  const sheetBounds = computeSheetBounds(shellPerimeter, showExistingWallLegend);

  // Global keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo), and Spacebar (Temporary Pan)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (!isInput && (e.ctrlKey || e.metaKey)) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }
        if (
          e.key.toLowerCase() === 'y' ||
          (e.key.toLowerCase() === 'z' && e.shiftKey)
        ) {
          e.preventDefault();
          redo();
          return;
        }
      }

      if (!isInput && e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        const curTool = useViewStore.getState().activeTool;
        if (curTool !== 'pan') {
          previousToolRef.current = curTool;
          setActiveTool('pan');
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && previousToolRef.current) {
        setActiveTool(previousToolRef.current);
        previousToolRef.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [undo, redo, setActiveTool]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Ignore accidental scroll-wheel rotation while the middle mouse button is held down for panning
    if (isPanningRef.current || (e.buttons & 4) !== 0) {
      return;
    }
    const { zoom: curZoom, panX: curPanX, panY: curPanY } = useViewStore.getState();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const nextZoom = Math.min(4.5, Math.max(0.45, Number((curZoom * factor).toFixed(3))));
    setViewport(nextZoom, curPanX, curPanY);
  };

  const startCanvasPan = (clientX: number, clientY: number) => {
    if (isPanningRef.current) return;
    isPanningRef.current = true;
    setIsPanning(true);
    const { panX: origPanX, panY: origPanY } = useViewStore.getState();

    const onPanMove = (moveEvt: PointerEvent) => {
      const liveZoom = useViewStore.getState().zoom;
      setViewport(
        liveZoom,
        origPanX + (moveEvt.clientX - clientX),
        origPanY + (moveEvt.clientY - clientY)
      );
    };

    const onPanUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
      window.removeEventListener('pointermove', onPanMove);
      window.removeEventListener('pointerup', onPanUp);
      window.removeEventListener('pointercancel', onPanUp);
    };

    window.addEventListener('pointermove', onPanMove);
    window.addEventListener('pointerup', onPanUp);
    window.addEventListener('pointercancel', onPanUp);
  };

  // Capture middle-mouse click or Alt+Click anywhere on the viewport container so it pans immediately
  const handleContainerPointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
      startCanvasPan(e.clientX, e.clientY);
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    // Middle mouse button, Alt+Click, or explicit Pan tool always pans immediately
    if (activeTool === 'pan' || e.button === 1 || e.altKey) {
      e.preventDefault();
      startCanvasPan(e.clientX, e.clientY);
      return;
    }

    const pt = clientToFeetCoords(svg, e.clientX, e.clientY);
    const snappedX = snapToGrid(pt.xFt, snapStepFt);
    const snappedY = snapToGrid(pt.yFt, snapStepFt);

    if (activeTool === 'add-room') {
      const nextNum = rooms.length + 100;
      const newId = `room-${Date.now()}`;
      addRoom({
        id: newId,
        name: 'New Room / Zone',
        code: `RM-${nextNum}`,
        category: 'production',
        x: Math.max(0, snappedX - 7),
        y: Math.max(0, snappedY - 6),
        width: 14,
        height: 12,
        wallHeight: 10,
        isExisting: false,
        ceilingType: 'acoustic-drop',
        floorFinish: 'epoxy-coat',
        notes: 'Added via interactive studio',
        showDimensions: true,
      });
      setSelectedEntity({ type: 'room', id: newId });
      setActiveTool('select');
      return;
    }

    if (activeTool === 'add-door') {
      const nextNum = doors.length + 200;
      const newId = `door-${Date.now()}`;
      addDoor({
        id: newId,
        label: `D-${nextNum}`,
        type: 'single-swing',
        x: snappedX,
        y: snappedY,
        width: 3,
        orientation: 'horizontal',
        swing: 'north-east',
        isExisting: false,
        notes: 'New 3\'-0" interior door',
      });
      setSelectedEntity({ type: 'door', id: newId });
      setActiveTool('select');
      return;
    }

    if (activeTool === 'add-equipment') {
      const nextNum = equipment.length + 101;
      const newId = `eq-${Date.now()}`;
      addEquipment({
        id: newId,
        name: 'New Equipment Unit',
        code: `EQ-${nextNum}`,
        category: 'machinery',
        x: snappedX - 3,
        y: snappedY - 2,
        width: 6,
        height: 4,
        elevationHeight: 5,
        rotation: 0,
        clearanceFt: 2,
        specs: '208V 3Ph • 30A',
        isExisting: false,
      });
      setSelectedEntity({ type: 'equipment', id: newId });
      setActiveTool('select');
      return;
    }

    if (activeTool === 'add-structural') {
      const newId = `struct-${Date.now()}`;
      addStructural({
        id: newId,
        name: 'Interior Partition / Column',
        type: 'partition-wall',
        x: snappedX,
        y: snappedY,
        width: 10,
        height: 0.5,
        isExisting: false,
        notes: 'Structural / partition element',
      });
      setSelectedEntity({ type: 'structural', id: newId });
      setActiveTool('select');
      return;
    }

    if (activeTool === 'measure') {
      setMeasureLine({ x1: snappedX, y1: snappedY, x2: snappedX, y2: snappedY });
      const onPointerMove = (moveEvt: PointerEvent) => {
        const cur = clientToFeetCoords(svg, moveEvt.clientX, moveEvt.clientY);
        setMeasureLine((prev) =>
          prev
            ? {
                ...prev,
                x2: snapToGrid(cur.xFt, 0.25),
                y2: snapToGrid(cur.yFt, 0.25),
              }
            : null
        );
      };
      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      return;
    }

    // Default: click on empty background (or locked existing element) pans viewport
    if (e.target === svg || (e.target as Element)?.tagName === 'polygon') {
      setSelectedEntity(null);
    }
    startCanvasPan(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const pt = clientToFeetCoords(svgRef.current, e.clientX, e.clientY);
    setCursorFt({
      x: Number(pt.xFt.toFixed(2)),
      y: Number(pt.yFt.toFixed(2)),
    });
  };

  return (
    <div
      className="relative flex-1 h-full overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: palette.canvasBg }}
      onWheel={handleWheel}
      onPointerDownCapture={handleContainerPointerDownCapture}
      onMouseDown={(e) => {
        if (e.button === 1) e.preventDefault();
      }}
      onAuxClick={(e) => {
        if (e.button === 1) e.preventDefault();
      }}
    >
      {/* Left Floating Tool Palette */}
      <CanvasToolDock />

      {/* Pan & Zoom Transform Stage */}
      <div
        id="canvas-pan-zoom-stage"
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 60ms ease-out',
        }}
      >
        <svg
          id="facility-layout-svg"
          ref={svgRef}
          viewBox={`${sheetBounds.minX} ${sheetBounds.minY} ${sheetBounds.width} ${sheetBounds.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-[98%] w-auto max-w-[99%] shadow-2xl rounded"
          style={{
            backgroundColor: palette.sheetBg,
            cursor:
              activeTool === 'pan' || isPanning
                ? isPanning
                  ? 'grabbing'
                  : 'grab'
                : activeTool !== 'select'
                ? 'crosshair'
                : 'default',
          }}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
        >
          {/* Sheet Outer Border */}
          <rect
            x={sheetBounds.minX + 1.0 * FT}
            y={sheetBounds.minY + 1.0 * FT}
            width={sheetBounds.width - 2.0 * FT}
            height={sheetBounds.height - 2.0 * FT}
            fill="none"
            stroke={palette.sheetBorder}
            strokeWidth={1.6}
          />

          {/* 1. Base Shell & Grid */}
          <ShellLayer />

          {/* 2. Calibrated Original PDF Blueprint Underlay */}
          <PdfUnderlayLayer />

          {/* 3. Rooms & Zones Geometry */}
          <g>
            {rooms.map((r) => (
              <RoomNode key={r.id} roomId={r.id} />
            ))}
          </g>

          {/* 4. Structural Columns, Dock Pits, Glazing, Pads */}
          <g>
            {structuralElements.map((s) => (
              <StructuralNode key={s.id} structuralId={s.id} />
            ))}
          </g>

          {/* 5. Industrial Equipment, Cultivation Benches, Safes & Fixtures */}
          <g>
            {equipment.map((eq) => (
              <EquipmentNode key={eq.id} equipmentId={eq.id} />
            ))}
          </g>

          {/* 6. Doors & Overhead Loading Docks */}
          <g>
            {doors.map((d) => (
              <DoorNode key={d.id} doorId={d.id} />
            ))}
          </g>

          {/* 7. Discipline Overlays (Egress Travel Arrows, EXIT Signs, MEP Wet-Wall Tie-Ins) */}
          <DisciplineOverlayLayer />

          {/* 8. Dedicated Top-Level Room Headers & Schedule Plates (Never Buried Under Equipment) */}
          <RoomLabelsLayer />

          {/* 9. Architectural Shell Dimensions */}
          <ShellDimensionsLayer />

          {/* 8. Interactive Tape Measure Overlay */}
          {measureLine && (
            <g className="pointer-events-none">
              <line
                x1={measureLine.x1 * FT}
                y1={measureLine.y1 * FT}
                x2={measureLine.x2 * FT}
                y2={measureLine.y2 * FT}
                stroke="#ec4899"
                strokeWidth={1.8}
                strokeDasharray="3 2"
              />
              <circle
                cx={measureLine.x1 * FT}
                cy={measureLine.y1 * FT}
                r={3}
                fill="#ec4899"
              />
              <circle
                cx={measureLine.x2 * FT}
                cy={measureLine.y2 * FT}
                r={3}
                fill="#ec4899"
              />
              <g
                transform={`translate(${
                  ((measureLine.x1 + measureLine.x2) / 2) * FT
                }, ${((measureLine.y1 + measureLine.y2) / 2) * FT - 8})`}
              >
                <rect
                  x={-48}
                  y={-8}
                  width={96}
                  height={16}
                  rx={3}
                  fill="#be185d"
                />
                <text
                  x={0}
                  y={2.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={6.5}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                >
                  {formatFeetInches(
                    Math.hypot(
                      measureLine.x2 - measureLine.x1,
                      measureLine.y2 - measureLine.y1
                    )
                  )}{' '}
                  (ΔX:{formatFeetInches(Math.abs(measureLine.x2 - measureLine.x1))}, ΔY:
                  {formatFeetInches(Math.abs(measureLine.y2 - measureLine.y1))})
                </text>
              </g>
            </g>
          )}

          {/* 9. Architectural Title Block, Room Schedule & Legend */}
          <TitleBlockOverlay />
        </svg>
      </div>

      {/* Bottom Floating HUD: Live Coordinates + Pan Hint + Zoom Controls */}
      <div className="no-print print:hidden absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 shadow-lg">
        <span>
          X: <strong className="text-white">{cursorFt ? formatFeetInches(cursorFt.x) : '--'}</strong>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          Y: <strong className="text-white">{cursorFt ? formatFeetInches(cursorFt.y) : '--'}</strong>
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
          Hold <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200 font-mono text-[10px]">Space</kbd> to Pan
        </span>
        {measureLine && (
          <>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setMeasureLine(null)}
              className="text-pink-400 hover:text-pink-300 underline"
            >
              Clear Measure
            </button>
          </>
        )}
      </div>

      <div className="no-print print:hidden absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1 rounded-lg text-xs font-mono text-slate-200 shadow-lg">
        <button
          onClick={() => setViewport(Math.max(0.45, Number((zoom - 0.15).toFixed(2))), panX, panY)}
          className="px-2 py-1 rounded hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          &minus;
        </button>
        <button
          onClick={resetViewport}
          className="px-2 py-1 rounded hover:bg-slate-800 transition min-w-[54px] text-center"
          title="Reset View"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setViewport(Math.min(4.5, Number((zoom + 0.15).toFixed(2))), panX, panY)}
          className="px-2 py-1 rounded hover:bg-slate-800 transition"
          title="Zoom In"
        >
          +
        </button>
      </div>
    </div>
  );
};
