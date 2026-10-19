import React from 'react';
import { Trash2 } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { StructuralElementType } from '../../types/facility';

interface StructuralInspectorProps {
  structuralId: string;
}

export const StructuralInspector: React.FC<StructuralInspectorProps> = ({
  structuralId,
}) => {
  const elem = useLayoutStore((s) =>
    s.layout.structuralElements.find((st) => st.id === structuralId)
  );
  const updateStructural = useLayoutStore((s) => s.updateStructural);
  const deleteStructural = useLayoutStore((s) => s.deleteStructural);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  if (!elem) return null;

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
            Structural Element Inspector
          </span>
          <h3 className="text-sm font-semibold text-white">{elem.name}</h3>
        </div>
        <button
          onClick={() => {
            deleteStructural(elem.id);
            setSelectedEntity(null);
          }}
          className="p-1.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 transition"
          title="Delete Structural Element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <label className="block text-slate-400 mb-1">Element Name</label>
        <input
          type="text"
          value={elem.name}
          onChange={(e) => updateStructural(elem.id, { name: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-slate-400 mb-1">Structural Type</label>
        <select
          value={elem.type}
          onChange={(e) =>
            updateStructural(elem.id, {
              type: e.target.value as StructuralElementType,
            })
          }
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
        >
          <option value="steel-column">Structural Steel Column</option>
          <option value="partition-wall">Interior Partition Wall</option>
          <option value="dock-leveler-pit">Loading Dock Leveler Pit</option>
          <option value="floor-pad">Concrete Equipment Pad / Drain</option>
          <option value="unit-heater">Suspended Unit Heater / Panel</option>
          <option value="utility-chase">Plumbing / Utility Chase</option>
          <option value="window-glazing">Storefront Window Glazing</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">Width (ft)</label>
          <input
            type="number"
            step="0.25"
            min="0.5"
            value={elem.width}
            onChange={(e) =>
              updateStructural(elem.id, {
                width: Math.max(0.5, parseFloat(e.target.value) || 1),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Depth (ft)</label>
          <input
            type="number"
            step="0.25"
            min="0.5"
            value={elem.height}
            onChange={(e) =>
              updateStructural(elem.id, {
                height: Math.max(0.5, parseFloat(e.target.value) || 1),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">X Position (ft)</label>
          <input
            type="number"
            step="0.25"
            value={elem.x}
            onChange={(e) =>
              updateStructural(elem.id, { x: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Y Position (ft)</label>
          <input
            type="number"
            step="0.25"
            value={elem.y}
            onChange={(e) =>
              updateStructural(elem.id, { y: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 mb-1">Structural Notes</label>
        <textarea
          rows={2}
          value={elem.notes || ''}
          onChange={(e) => updateStructural(elem.id, { notes: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
};
