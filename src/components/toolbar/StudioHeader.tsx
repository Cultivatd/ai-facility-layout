import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Cuboid,
  Columns2,
  Map,
  SlidersHorizontal,
  Undo2,
  Redo2,
  Lock,
  ChevronDown,
  FolderKanban,
  Palette,
  Layers,
  Tag,
  Blocks,
  Check,
} from 'lucide-react';
import { DISCIPLINE_VIEWS, LABEL_MODE_OPTIONS } from '../../data/discipline-views';
import { DOMAIN_MODULES } from '../../data/domain-modules';
import { LAYOUT_PRESETS } from '../../data/layout-presets';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore, ViewMode } from '../../store/viewStore';
import { PresentationTheme, RoomLabelMode } from '../../types/facility';
import { DisciplineIcon } from '../canvas/DisciplineViewBar';
import { BackupHistoryPopover } from './BackupHistoryPopover';
import { DiskSyncWatcher } from './DiskSyncWatcher';
import { ExportActions } from './ExportActions';

const THEME_LABELS: Record<PresentationTheme, string> = {
  'investor-color': 'Investor Color',
  'contractor-blueprint': 'Contractor Blueprint',
  'dark-cad': 'Dark Engineering CAD',
};

export const StudioHeader: React.FC = () => {
  const metadata = useLayoutStore((s) => s.layout.metadata);
  const pdfCalibration = useLayoutStore((s) => s.layout.pdfCalibration);
  const enabledModules = useLayoutStore((s) => s.layout.enabledModules ?? []);
  const toggleDomainModule = useLayoutStore((s) => s.toggleDomainModule);
  const replaceLayout = useLayoutStore((s) => s.replaceLayout);
  const undo = useLayoutStore((s) => s.undo);
  const redo = useLayoutStore((s) => s.redo);
  const canUndo = useLayoutStore((s) => s.past.length > 0);
  const canRedo = useLayoutStore((s) => s.future.length > 0);

  const theme = useViewStore((s) => s.theme);
  const setTheme = useViewStore((s) => s.setTheme);
  const viewMode = useViewStore((s) => s.viewMode);
  const setViewMode = useViewStore((s) => s.setViewMode);
  const disciplineView = useViewStore((s) => s.disciplineView);
  const setDisciplineView = useViewStore((s) => s.setDisciplineView);
  const roomLabelMode = useViewStore((s) => s.roomLabelMode);
  const setRoomLabelMode = useViewStore((s) => s.setRoomLabelMode);

  const lockExistingElements = useViewStore((s) => s.lockExistingElements);
  const setLockExistingElements = useViewStore((s) => s.setLockExistingElements);

  const showPdfUnderlay = useViewStore((s) => s.showPdfUnderlay);
  const setShowPdfUnderlay = useViewStore((s) => s.setShowPdfUnderlay);
  const pdfUnderlayOpacity = useViewStore((s) => s.pdfUnderlayOpacity);
  const setPdfUnderlayOpacity = useViewStore((s) => s.setPdfUnderlayOpacity);
  const pdfUnderlayMode = useViewStore((s) => s.pdfUnderlayMode);
  const setPdfUnderlayMode = useViewStore((s) => s.setPdfUnderlayMode);

  const showGrid = useViewStore((s) => s.showGrid);
  const setShowGrid = useViewStore((s) => s.setShowGrid);
  const showShellDimensions = useViewStore((s) => s.showShellDimensions);
  const setShowShellDimensions = useViewStore((s) => s.setShowShellDimensions);
  const showRoomDimensions = useViewStore((s) => s.showRoomDimensions);
  const setShowRoomDimensions = useViewStore((s) => s.setShowRoomDimensions);
  const showClearanceZones = useViewStore((s) => s.showClearanceZones);
  const setShowClearanceZones = useViewStore((s) => s.setShowClearanceZones);
  const showTitleBlock = useViewStore((s) => s.showTitleBlock);
  const setShowTitleBlock = useViewStore((s) => s.setShowTitleBlock);

  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showModulesMenu, setShowModulesMenu] = useState(false);
  const [activePresetId, setActivePresetId] = useState('showcase-cultivation');
  const [showDisciplineMenu, setShowDisciplineMenu] = useState(false);
  const [showLayersPopover, setShowLayersPopover] = useState(false);

  const presetsRef = useRef<HTMLDivElement | null>(null);
  const modulesRef = useRef<HTMLDivElement | null>(null);
  const disciplineRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresetsMenu(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(e.target as Node)) {
        setShowModulesMenu(false);
      }
      if (
        disciplineRef.current &&
        !disciplineRef.current.contains(e.target as Node)
      ) {
        setShowDisciplineMenu(false);
      }
      if (layersRef.current && !layersRef.current.contains(e.target as Node)) {
        setShowLayersPopover(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Global keyboard shortcuts 1-6 for switching Discipline Sheet Views
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const match = DISCIPLINE_VIEWS.find((d) => d.shortcut === e.key);
      if (match) {
        e.preventDefault();
        setDisciplineView(match.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setDisciplineView]);

  const currentPreset =
    LAYOUT_PRESETS.find((p) => p.id === activePresetId) ?? LAYOUT_PRESETS[0];
  const currentDiscipline =
    DISCIPLINE_VIEWS.find((d) => d.id === disciplineView) ?? DISCIPLINE_VIEWS[0];

  const badgeText =
    (metadata.suiteName || 'CAD')
      .replace(/^Suite\s+/i, '')
      .slice(0, 4)
      .toUpperCase() || 'CAD';

  return (
    <header className="h-13 bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 shrink-0 print:hidden z-30">
      {/* Left Group: Brand + Presets Menu + Modules Menu + Undo/Redo + Disk Sync */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pr-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-xs text-white shadow">
            {badgeText}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight max-w-[140px] truncate">
              {metadata.suiteName || 'Facility Studio'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {metadata.rentableSqFt.toLocaleString()} RSF &bull; {metadata.clearHeightFt}&apos; Clr
            </div>
          </div>
        </div>

        {/* Presets Openable Menu */}
        <div ref={presetsRef} className="relative">
          <button
            onClick={() => setShowPresetsMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/90 text-xs text-slate-200 font-medium transition"
            title="Switch Facility Starter Template or Load Showcase Preset"
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
            <span className="max-w-[130px] truncate">{currentPreset.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPresetsMenu && (
            <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs z-50 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Load Starter Template / Preset
              </div>
              {LAYOUT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActivePresetId(preset.id);
                    replaceLayout(structuredClone(preset.data), true);
                    setShowPresetsMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition ${
                    activePresetId === preset.id
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pluggable Domain Modules Toggle Menu */}
        <div ref={modulesRef} className="relative">
          <button
            onClick={() => setShowModulesMenu((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              enabledModules.length > 0
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25'
                : 'bg-slate-900 border-slate-700/90 text-slate-200 hover:bg-slate-800'
            }`}
            title="Enable or disable Cultivation, Edible Cleanroom, and Security/Vault add-on modules"
          >
            <Blocks className="w-3.5 h-3.5 text-emerald-400" />
            <span>Modules</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-emerald-300">
              {enabledModules.length}/{DOMAIN_MODULES.length}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showModulesMenu && (
            <div className="absolute left-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 text-xs z-50 space-y-2.5">
              <div className="border-b border-slate-800 pb-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Blocks className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pluggable Industry Modules</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Toggle specialized rooms, CAD symbols, and compliance overlays on top of the general-purpose studio.
                </div>
              </div>

              <div className="space-y-2">
                {DOMAIN_MODULES.map((mod) => {
                  const isOn = enabledModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleDomainModule(mod.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex items-start gap-2.5 ${
                        isOn
                          ? 'bg-emerald-950/35 border-emerald-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                          isOn
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isOn && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">{mod.name}</span>
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
                            style={{
                              backgroundColor: isOn ? `${mod.badgeColor}25` : '#1e293b',
                              color: isOn ? mod.badgeColor : '#94a3b8',
                            }}
                          >
                            {isOn ? 'Enabled' : 'Off'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {mod.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Undo / Redo Pill */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
              canUndo
                ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
              canRedo
                ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <DiskSyncWatcher />
      </div>

      {/* Center Group: Sheet Discipline Menu + 2D / Split / 3D Switcher */}
      <div className="flex items-center gap-2">
        {/* Sheet Discipline View Dropdown */}
        <div ref={disciplineRef} className="relative">
          <button
            onClick={() => setShowDisciplineMenu((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition shadow-sm ${currentDiscipline.accentClass}`}
            title="Switch Sheet Discipline View (Shortcuts: 1 - 6)"
          >
            <DisciplineIcon view={currentDiscipline.id} />
            <span className="font-mono text-[11px] opacity-90">
              {currentDiscipline.sheetCode}:
            </span>
            <span>{currentDiscipline.shortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showDisciplineMenu && (
            <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 text-xs z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Engineering &amp; Compliance Sheets</span>
                <span>Keys 1–6</span>
              </div>
              {DISCIPLINE_VIEWS.map((view) => {
                const isAct = disciplineView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => {
                      setDisciplineView(view.id);
                      setShowDisciplineMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition flex items-start gap-2.5 ${
                      isAct
                        ? 'bg-blue-600/25 border border-blue-500/50 text-white'
                        : 'hover:bg-slate-800 text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 text-blue-400">
                      <DisciplineIcon view={view.id} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          <span className="font-mono text-blue-300 mr-1.5">
                            {view.sheetCode}
                          </span>
                          {view.shortLabel}
                        </span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-300">
                          {view.shortcut}
                        </kbd>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {view.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Label Mode Quick Control inside Discipline Menu */}
              <div className="border-t border-slate-800 pt-2 mt-1.5 px-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-400" />
                  Room Label Placement:
                </span>
                <select
                  value={roomLabelMode}
                  onChange={(e) => setRoomLabelMode(e.target.value as RoomLabelMode)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-white outline-none"
                >
                  {LABEL_MODE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 2D / Split / 3D View Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
          {(
            [
              ['2d', '2D Plan', <Map key="2d" className="w-3.5 h-3.5" />],
              ['split', 'Split 2D/3D', <Columns2 key="sp" className="w-3.5 h-3.5" />],
              ['3d', '3D Isometric', <Cuboid key="3d" className="w-3.5 h-3.5" />],
            ] as [ViewMode, string, React.ReactNode][]
          ).map(([mode, label, icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                viewMode === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {icon}
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Group: Theme & Layers Menu + Backups Menu + Export Menu */}
      <div className="flex items-center gap-2">
        {/* Combined Theme, Underlay & Layers Menu */}
        <div ref={layersRef} className="relative">
          <button
            onClick={() => setShowLayersPopover((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              showLayersPopover
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            title="Presentation Theme, Floorplan Underlay & Layer Visibility"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme &amp; Layers</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showLayersPopover && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 space-y-3.5 text-xs z-50">
              {/* Presentation Theme Section */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  Presentation Theme
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {(Object.keys(THEME_LABELS) as PresentationTheme[]).map((tKey) => (
                    <button
                      key={tKey}
                      onClick={() => setTheme(tKey)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition ${
                        theme === tKey
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{THEME_LABELS[tKey]}</span>
                      {theme === tKey && (
                        <span className="text-[10px] font-mono uppercase">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Label Placement Mode */}
              <div className="border-t border-slate-800 pt-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Room Label Placement Mode
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {LABEL_MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRoomLabelMode(opt.id)}
                      title={opt.tip}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition ${
                        roomLabelMode === opt.id
                          ? 'bg-emerald-600/25 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lock Existing Shell Elements Toggle */}
              <div className="border-t border-slate-800 pt-3">
                <label className="flex items-center justify-between cursor-pointer bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-2">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Lock Existing Shell Items
                  </span>
                  <input
                    type="checkbox"
                    checked={lockExistingElements}
                    onChange={(e) => setLockExistingElements(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500"
                  />
                </label>
              </div>

              {/* Calibrated PDF Underlay Section (shown when layout has pdfCalibration) */}
              {pdfCalibration && (
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-200 font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Show Calibrated PDF Underlay
                    </span>
                    <input
                      type="checkbox"
                      checked={showPdfUnderlay}
                      onChange={(e) => setShowPdfUnderlay(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-800 text-amber-500"
                    />
                  </label>

                  {showPdfUnderlay && (
                    <div className="space-y-2 pl-2.5 border-l-2 border-amber-500/40">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Underlay Opacity</span>
                          <span className="font-mono">
                            {Math.round(pdfUnderlayOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.08"
                          max="1"
                          step="0.02"
                          value={pdfUnderlayOpacity}
                          onChange={(e) =>
                            setPdfUnderlayOpacity(parseFloat(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPdfUnderlayMode('linework')}
                          className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                            pdfUnderlayMode === 'linework'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          Transparent Linework
                        </button>
                        <button
                          onClick={() => setPdfUnderlayMode('full')}
                          className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                            pdfUnderlayMode === 'full'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          Full Original Scan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CAD Layer Checkboxes */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Exterior Shell Dimensions</span>
                  <input
                    type="checkbox"
                    checked={showShellDimensions}
                    onChange={(e) => setShowShellDimensions(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Auto Room Dimensions (W×H)</span>
                  <input
                    type="checkbox"
                    checked={showRoomDimensions}
                    onChange={(e) => setShowRoomDimensions(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Equipment Safety Clearances</span>
                  <input
                    type="checkbox"
                    checked={showClearanceZones}
                    onChange={(e) => setShowClearanceZones(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">1&apos; / 5&apos; Architectural Grid</span>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Sheet Title Block &amp; Schedule</span>
                  <input
                    type="checkbox"
                    checked={showTitleBlock}
                    onChange={(e) => setShowTitleBlock(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Periodic & Manual Backups Menu */}
        <BackupHistoryPopover />

        {/* Consolidated Export Dropdown Menu */}
        <ExportActions />
      </div>
    </header>
  );
};
