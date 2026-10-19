import React, { useEffect } from 'react';
import {
  MousePointer,
  Hand,
  PlusSquare,
  DoorOpen,
  Cpu,
  Columns,
  Ruler,
} from 'lucide-react';
import { useViewStore } from '../../store/viewStore';
import { ActiveTool } from '../../types/facility';

const TOOLS: {
  id: ActiveTool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  group: 'nav' | 'create' | 'util';
}[] = [
  {
    id: 'select',
    label: 'Select / Edit',
    shortcut: 'V',
    icon: <MousePointer className="w-4 h-4" />,
    group: 'nav',
  },
  {
    id: 'pan',
    label: 'Pan Canvas (or Hold Space)',
    shortcut: 'H',
    icon: <Hand className="w-4 h-4" />,
    group: 'nav',
  },
  {
    id: 'add-room',
    label: 'Add Room / Zone',
    shortcut: 'R',
    icon: <PlusSquare className="w-4 h-4" />,
    group: 'create',
  },
  {
    id: 'add-door',
    label: 'Add Door / Opening',
    shortcut: 'D',
    icon: <DoorOpen className="w-4 h-4" />,
    group: 'create',
  },
  {
    id: 'add-equipment',
    label: 'Add Equipment / Fixture',
    shortcut: 'E',
    icon: <Cpu className="w-4 h-4" />,
    group: 'create',
  },
  {
    id: 'add-structural',
    label: 'Add Structural / Partition',
    shortcut: 'S',
    icon: <Columns className="w-4 h-4" />,
    group: 'create',
  },
  {
    id: 'measure',
    label: 'Tape Measure Distance',
    shortcut: 'M',
    icon: <Ruler className="w-4 h-4" />,
    group: 'util',
  },
];

export const CanvasToolDock: React.FC = () => {
  const activeTool = useViewStore((s) => s.activeTool);
  const setActiveTool = useViewStore((s) => s.setActiveTool);

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
      const key = e.key.toUpperCase();
      const match = TOOLS.find((t) => t.shortcut === key);
      if (match) {
        e.preventDefault();
        setActiveTool(match.id);
      } else if (e.key === 'Escape') {
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveTool]);

  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 bg-slate-900/95 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl shadow-2xl print:hidden">
      {TOOLS.map((tool, index) => {
        const prevGroup = index > 0 ? TOOLS[index - 1].group : tool.group;
        const showDivider = prevGroup !== tool.group;
        const isActive = activeTool === tool.id;

        return (
          <React.Fragment key={tool.id}>
            {showDivider && <div className="h-px bg-slate-800 my-0.5 mx-1" />}
            <button
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tool.icon}
              <span>{tool.label.split(' ')[0]}</span>
              <span
                className={`ml-auto pl-1.5 text-[10px] font-mono ${
                  isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {tool.shortcut}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
