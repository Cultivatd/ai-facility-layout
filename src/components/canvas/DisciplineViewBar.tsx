import React from 'react';
import {
  Layers,
  LayoutGrid,
  Cpu,
  ShieldCheck,
  Flame,
  Wrench,
  Tag,
} from 'lucide-react';
import { DISCIPLINE_VIEWS, LABEL_MODE_OPTIONS } from '../../data/discipline-views';
import { useViewStore } from '../../store/viewStore';
import { DisciplineView, RoomLabelMode } from '../../types/facility';

export const DisciplineIcon: React.FC<{ view: DisciplineView }> = ({ view }) => {
  switch (view) {
    case 'room-usage':
      return <LayoutGrid className="w-3.5 h-3.5" />;
    case 'equipment':
      return <Cpu className="w-3.5 h-3.5" />;
    case 'security':
      return <ShieldCheck className="w-3.5 h-3.5" />;
    case 'evac-safety':
      return <Flame className="w-3.5 h-3.5" />;
    case 'contractor-mep':
      return <Wrench className="w-3.5 h-3.5" />;
    case 'overview':
    default:
      return <Layers className="w-3.5 h-3.5" />;
  }
};

export const DisciplineViewBar: React.FC = () => {
  const disciplineView = useViewStore((s) => s.disciplineView);
  const setDisciplineView = useViewStore((s) => s.setDisciplineView);
  const roomLabelMode = useViewStore((s) => s.roomLabelMode);
  const setRoomLabelMode = useViewStore((s) => s.setRoomLabelMode);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/95 backdrop-blur border border-slate-700/90 p-1.5 rounded-xl shadow-2xl max-w-[92%] print:hidden">
      {/* Sheet Discipline View Pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {DISCIPLINE_VIEWS.map((view) => {
          const isActive = disciplineView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setDisciplineView(view.id)}
              title={`${view.sheetTitle}\n${view.subtitle} (Shortcut: ${view.shortcut})`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isActive
                  ? `${view.accentClass} shadow-md`
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <DisciplineIcon view={view.id} />
              <span className="font-mono text-[10px] opacity-85 hidden xl:inline">
                {view.sheetCode}
              </span>
              <span>{view.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="h-5 w-px bg-slate-700/80 mx-0.5 hidden md:block" />

      {/* Room Label Density / Placement Selector */}
      <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[11px]">
        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
        <select
          value={roomLabelMode}
          onChange={(e) => setRoomLabelMode(e.target.value as RoomLabelMode)}
          title="Control how Room Labels & Badges are placed relative to equipment"
          className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
        >
          {LABEL_MODE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
