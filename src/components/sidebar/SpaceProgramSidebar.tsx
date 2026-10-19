import React, { useState } from 'react';
import {
  Box,
  DoorOpen,
  Cpu,
  Columns,
  Plus,
  FileText,
  Layers,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import {
  DOMAIN_MODULES,
  EQUIPMENT_QUICK_TEMPLATES,
  EquipmentQuickTemplate,
  ROOM_QUICK_TEMPLATES,
  RoomQuickTemplate,
} from '../../data/domain-modules';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import {
  calculatePolygonAreaSqFt,
  formatFeetInches,
  ROOM_CATEGORY_STYLES,
} from '../../utils/dimensions';
import { computeShellBounds } from '../canvas/canvasConstants';
import { DoorInspector } from '../inspector/DoorInspector';
import { EquipmentInspector } from '../inspector/EquipmentInspector';
import { RoomInspector } from '../inspector/RoomInspector';
import { StructuralInspector } from '../inspector/StructuralInspector';

type SidebarTab = 'entities' | 'catalog' | 'metadata';

export const SpaceProgramSidebar: React.FC = () => {
  const rooms = useLayoutStore((s) => s.layout.rooms);
  const doors = useLayoutStore((s) => s.layout.doors);
  const equipment = useLayoutStore((s) => s.layout.equipment);
  const structuralElements = useLayoutStore((s) => s.layout.structuralElements);
  const shellPerimeter = useLayoutStore((s) => s.layout.shellPerimeter);
  const metadata = useLayoutStore((s) => s.layout.metadata);
  const enabledModules = useLayoutStore((s) => s.layout.enabledModules ?? []);

  const addRoom = useLayoutStore((s) => s.addRoom);
  const addEquipment = useLayoutStore((s) => s.addEquipment);
  const updateMetadata = useLayoutStore((s) => s.updateMetadata);
  const toggleDomainModule = useLayoutStore((s) => s.toggleDomainModule);
  const setRectangularShell = useLayoutStore((s) => s.setRectangularShell);

  const selectedEntity = useViewStore((s) => s.selectedEntity);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);
  const setActiveTool = useViewStore((s) => s.setActiveTool);

  const [tab, setTab] = useState<SidebarTab>('entities');

  const shellBounds = computeShellBounds(shellPerimeter);
  const [shellWInput, setShellWInput] = useState<string>(
    String(Math.round(shellBounds.widthFt * 100) / 100)
  );
  const [shellHInput, setShellHInput] = useState<string>(
    String(Math.round(shellBounds.heightFt * 100) / 100)
  );

  const usableShellSqFt = Math.round(calculatePolygonAreaSqFt(shellPerimeter));
  const enclosedRoomSqFt = Math.round(
    rooms
      .filter((r) => r.category !== 'corridor')
      .reduce((sum, r) => sum + r.width * r.height, 0)
  );
  const openCirculationSqFt = Math.max(0, usableShellSqFt - enclosedRoomSqFt);
  const enclosedPct = Math.min(
    100,
    Math.round((enclosedRoomSqFt / Math.max(1, usableShellSqFt)) * 100)
  );

  const availableRoomTemplates = ROOM_QUICK_TEMPLATES.filter(
    (tpl) => !tpl.moduleId || enabledModules.includes(tpl.moduleId)
  );
  const availableEquipmentTemplates = EQUIPMENT_QUICK_TEMPLATES.filter(
    (tpl) => !tpl.moduleId || enabledModules.includes(tpl.moduleId)
  );

  const handleInsertRoomTemplate = (tpl: RoomQuickTemplate) => {
    const newId = `room-${Date.now()}`;
    const num = rooms.length + 1;
    addRoom({
      ...tpl.room,
      id: newId,
      code: `${tpl.room.code.replace(/-\d+$/, '')}-${num}`,
      x: Math.max(0, Math.round(shellBounds.centerXFt - tpl.room.width / 2)),
      y: Math.max(0, Math.round(shellBounds.centerYFt - tpl.room.height / 2)),
    });
    setSelectedEntity({ type: 'room', id: newId });
  };

  const handleInsertEquipmentTemplate = (tpl: EquipmentQuickTemplate) => {
    const newId = `eq-${Date.now()}`;
    const num = equipment.length + 1;
    addEquipment({
      ...tpl.equipment,
      id: newId,
      code: `${tpl.equipment.code.replace(/-\d+$/, '')}-${num}`,
      x: Math.max(0, Math.round(shellBounds.centerXFt - tpl.equipment.width / 2)),
      y: Math.max(0, Math.round(shellBounds.centerYFt - tpl.equipment.height / 2)),
    });
    setSelectedEntity({ type: 'equipment', id: newId });
  };

  return (
    <aside className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col h-full overflow-hidden shrink-0 print:hidden">
      {/* Top Space Allocation Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {metadata.suiteName} Space Program
            </div>
            <div className="text-sm font-bold text-white">
              {metadata.rentableSqFt.toLocaleString()} RSF{' '}
              <span className="text-xs font-normal text-slate-400">
                ({usableShellSqFt.toLocaleString()} USF Net Shell)
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold">
            {enclosedPct}% Enclosed
          </span>
        </div>

        {/* Stacked Utilization Bar */}
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
          {rooms.map((r) => {
            const pct = ((r.width * r.height) / Math.max(1, usableShellSqFt)) * 100;
            const style = ROOM_CATEGORY_STYLES[r.category];
            return (
              <div
                key={r.id}
                style={{
                  width: `${pct}%`,
                  backgroundColor: r.color || style?.badgeColor || '#3b82f6',
                }}
                title={`${r.name}: ${Math.round(r.width * r.height)} SF`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Programmed: {enclosedRoomSqFt.toLocaleString()} SF</span>
          <span>Aisles/Open: {openCirculationSqFt.toLocaleString()} SF</span>
        </div>
      </div>

      {/* Selected Entity Property Inspector (Leaf Owned) */}
      {selectedEntity && (
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/30 overflow-y-auto max-h-[55%]">
          {selectedEntity.type === 'room' && (
            <RoomInspector roomId={selectedEntity.id} />
          )}
          {selectedEntity.type === 'door' && (
            <DoorInspector doorId={selectedEntity.id} />
          )}
          {selectedEntity.type === 'equipment' && (
            <EquipmentInspector equipmentId={selectedEntity.id} />
          )}
          {selectedEntity.type === 'structural' && (
            <StructuralInspector structuralId={selectedEntity.id} />
          )}
        </div>
      )}

      {/* Outliner / Module Catalog / Sheet Metadata Switcher */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs font-medium">
        <button
          onClick={() => setTab('entities')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition ${
            tab === 'entities'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Elements</span>
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition ${
            tab === 'catalog'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Catalog</span>
        </button>
        <button
          onClick={() => setTab('metadata')}
          className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition ${
            tab === 'metadata'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Shell &amp; Info</span>
        </button>
      </div>

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5 text-xs">
        {tab === 'entities' && (
          <>
            {/* Rooms Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                  Rooms &amp; Zones ({rooms.length})
                </span>
                <button
                  onClick={() => setActiveTool('add-room')}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Room
                </button>
              </div>
              <div className="space-y-1">
                {rooms.map((r) => {
                  const isSel =
                    selectedEntity?.type === 'room' && selectedEntity.id === r.id;
                  const sf = Math.round(r.width * r.height);
                  const style = ROOM_CATEGORY_STYLES[r.category];
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedEntity({ type: 'room', id: r.id })}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                        isSel
                          ? 'bg-blue-600/25 border border-blue-500/50 text-white'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{
                            backgroundColor: r.color || style?.badgeColor || '#3b82f6',
                          }}
                        />
                        <span className="font-mono text-[11px] text-slate-400">
                          {r.code}
                        </span>
                        <span className="truncate font-medium">{r.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0 ml-2">
                        {sf} SF
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  Equipment &amp; Fixtures ({equipment.length})
                </span>
                <button
                  onClick={() => setActiveTool('add-equipment')}
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Equip
                </button>
              </div>
              <div className="space-y-1">
                {equipment.map((eq) => {
                  const isSel =
                    selectedEntity?.type === 'equipment' &&
                    selectedEntity.id === eq.id;
                  return (
                    <button
                      key={eq.id}
                      onClick={() =>
                        setSelectedEntity({ type: 'equipment', id: eq.id })
                      }
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                        isSel
                          ? 'bg-purple-600/25 border border-purple-500/50 text-white'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-mono text-[11px] text-purple-300 mr-1.5">
                          {eq.code}
                        </span>
                        <span>{eq.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                        {formatFeetInches(eq.width)}×{formatFeetInches(eq.height)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Doors Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                  Doors &amp; Loading Docks ({doors.length})
                </span>
                <button
                  onClick={() => setActiveTool('add-door')}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Door
                </button>
              </div>
              <div className="space-y-1">
                {doors.map((d) => {
                  const isSel =
                    selectedEntity?.type === 'door' && selectedEntity.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedEntity({ type: 'door', id: d.id })}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                        isSel
                          ? 'bg-amber-600/25 border border-amber-500/50 text-white'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-mono text-[11px] text-amber-300 mr-1.5">
                          {d.label}
                        </span>
                        <span className="text-slate-300 capitalize">
                          {d.type.replace('-', ' ')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {formatFeetInches(d.width)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Structural Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Columns className="w-3.5 h-3.5 text-rose-400" />
                  Structural Elements ({structuralElements.length})
                </span>
                <button
                  onClick={() => setActiveTool('add-structural')}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-1">
                {structuralElements.map((st) => {
                  const isSel =
                    selectedEntity?.type === 'structural' &&
                    selectedEntity.id === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() =>
                        setSelectedEntity({ type: 'structural', id: st.id })
                      }
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                        isSel
                          ? 'bg-rose-600/25 border border-rose-500/50 text-white'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                      }`}
                    >
                      <span className="truncate">{st.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {st.isExisting ? 'EXIST' : 'NEW'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === 'catalog' && (
          <div className="space-y-4">
            {/* Active Domain Modules Quick Toggles */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Enabled Add-On Modules
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DOMAIN_MODULES.map((mod) => {
                  const active = enabledModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleDomainModule(mod.id)}
                      className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {mod.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Quick-Add Templates */}
            <div>
              <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-blue-400" />
                <span>Quick-Add Room Templates</span>
              </div>
              <div className="space-y-1.5">
                {availableRoomTemplates.map((tpl) => {
                  const mod = DOMAIN_MODULES.find((m) => m.id === tpl.moduleId);
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleInsertRoomTemplate(tpl)}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 transition flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 truncate">
                          {tpl.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {tpl.room.subtitle}
                        </div>
                      </div>
                      {mod ? (
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            backgroundColor: `${mod.badgeColor}20`,
                            color: mod.badgeColor,
                          }}
                        >
                          {mod.shortLabel}
                        </span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment Quick-Add Templates */}
            <div>
              <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Quick-Add Equipment &amp; Fixtures</span>
              </div>
              <div className="space-y-1.5">
                {availableEquipmentTemplates.map((tpl) => {
                  const mod = DOMAIN_MODULES.find((m) => m.id === tpl.moduleId);
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleInsertEquipmentTemplate(tpl)}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 transition flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 truncate">
                          {tpl.label}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {tpl.equipment.specs}
                        </div>
                      </div>
                      {mod ? (
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            backgroundColor: `${mod.badgeColor}20`,
                            color: mod.badgeColor,
                          }}
                        >
                          {mod.shortLabel}
                        </span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'metadata' && (
          /* Building Shell Resizer & Sheet Metadata Form */
          <div className="space-y-4">
            {/* Rectangular Building Shell Resizer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Building Shell Footprint (ft)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Set a custom rectangular building shell width (E–W) and length (N–S) in feet.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Width (E–W ft)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="1"
                    value={shellWInput}
                    onChange={(e) => setShellWInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Length (N–S ft)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="1"
                    value={shellHInput}
                    onChange={(e) => setShellHInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 font-mono text-white"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const w = parseFloat(shellWInput) || 50;
                  const h = parseFloat(shellHInput) || 80;
                  setRectangularShell(w, h);
                }}
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                Apply Rectangular Shell ({shellWInput}&apos; × {shellHInput}&apos;)
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Proposal / Project Title</label>
                <input
                  type="text"
                  value={metadata.projectName}
                  onChange={(e) => updateMetadata({ projectName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Building Name</label>
                <input
                  type="text"
                  value={metadata.buildingName}
                  onChange={(e) => updateMetadata({ buildingName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={metadata.address}
                  onChange={(e) => updateMetadata({ address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Suite / Bay</label>
                  <input
                    type="text"
                    value={metadata.suiteName}
                    onChange={(e) => updateMetadata({ suiteName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Clear Height (ft)</label>
                  <input
                    type="number"
                    value={metadata.clearHeightFt}
                    onChange={(e) =>
                      updateMetadata({ clearHeightFt: parseFloat(e.target.value) || 18 })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Revision / Package Label</label>
                <input
                  type="text"
                  value={metadata.revisionName}
                  onChange={(e) => updateMetadata({ revisionName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Prepared By</label>
                  <input
                    type="text"
                    value={metadata.preparedBy}
                    onChange={(e) => updateMetadata({ preparedBy: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Revision Date</label>
                  <input
                    type="text"
                    value={metadata.revisionDate}
                    onChange={(e) => updateMetadata({ revisionDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
