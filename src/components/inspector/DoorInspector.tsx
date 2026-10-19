import React from 'react';
import { Trash2, RotateCw } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { DoorSwing, DoorType, WallOrientation } from '../../types/facility';
import { formatFeetInches } from '../../utils/dimensions';

interface DoorInspectorProps {
  doorId: string;
}

export const DoorInspector: React.FC<DoorInspectorProps> = ({ doorId }) => {
  const door = useLayoutStore((s) => s.layout.doors.find((d) => d.id === doorId));
  const updateDoor = useLayoutStore((s) => s.updateDoor);
  const deleteDoor = useLayoutStore((s) => s.deleteDoor);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  if (!door) return null;

  const toggleOrientation = () => {
    const nextOrientation: WallOrientation =
      door.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    updateDoor(door.id, { orientation: nextOrientation });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
            Door / Opening Inspector
          </span>
          <h3 className="text-sm font-semibold text-white">
            {door.label} ({formatFeetInches(door.width)})
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleOrientation}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Rotate Wall Orientation 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteDoor(door.id);
              setSelectedEntity(null);
            }}
            className="p-1.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 transition"
            title="Delete Door"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">Door Tag</label>
          <input
            type="text"
            value={door.label}
            onChange={(e) => updateDoor(door.id, { label: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Door Type</label>
          <select
            value={door.type}
            onChange={(e) => {
              const nextType = e.target.value as DoorType;
              const defaultW =
                nextType === 'double-swing'
                  ? 6
                  : nextType === 'overhead-dock'
                  ? 8
                  : 3;
              updateDoor(door.id, { type: nextType, width: defaultW });
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          >
            <option value="single-swing">Single Swing (3&apos;-0&quot;)</option>
            <option value="double-swing">Double Swing (6&apos;-0&quot;)</option>
            <option value="overhead-dock">Overhead Dock (8&apos;-0&quot;)</option>
            <option value="sliding">Sliding / Pocket</option>
            <option value="cased-opening">Cased Opening</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-slate-400 mb-1">Width (ft)</label>
          <input
            type="number"
            step="0.5"
            min="2"
            max="16"
            value={door.width}
            onChange={(e) =>
              updateDoor(door.id, {
                width: Math.max(2, parseFloat(e.target.value) || 3),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">X (ft)</label>
          <input
            type="number"
            step="0.25"
            value={door.x}
            onChange={(e) =>
              updateDoor(door.id, { x: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Y (ft)</label>
          <input
            type="number"
            step="0.25"
            value={door.y}
            onChange={(e) =>
              updateDoor(door.id, { y: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">Wall Axis</label>
          <select
            value={door.orientation}
            onChange={(e) =>
              updateDoor(door.id, {
                orientation: e.target.value as WallOrientation,
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          >
            <option value="horizontal">Horizontal Wall (E-W)</option>
            <option value="vertical">Vertical Wall (N-S)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Swing Quadrant</label>
          <select
            value={door.swing}
            onChange={(e) =>
              updateDoor(door.id, { swing: e.target.value as DoorSwing })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          >
            <option value="north-east">North / East</option>
            <option value="north-west">North / West</option>
            <option value="south-east">South / East</option>
            <option value="south-west">South / West</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
        <input
          type="checkbox"
          checked={Boolean(door.isExisting)}
          onChange={(e) => updateDoor(door.id, { isExisting: e.target.checked })}
          className="rounded border-slate-700 bg-slate-900 text-blue-500"
        />
        <span>Existing Door to Remain</span>
      </label>

      <div>
        <label className="block text-slate-400 mb-1">Door Schedule Notes</label>
        <textarea
          rows={2}
          value={door.notes || ''}
          onChange={(e) => updateDoor(door.id, { notes: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
};
