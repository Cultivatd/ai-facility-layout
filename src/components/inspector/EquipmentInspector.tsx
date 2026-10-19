import React from 'react';
import { Trash2, Copy, RotateCw, Compass } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { EquipmentCategory } from '../../types/facility';
import { formatFeetInches } from '../../utils/dimensions';

interface EquipmentInspectorProps {
  equipmentId: string;
}

export const EquipmentInspector: React.FC<EquipmentInspectorProps> = ({
  equipmentId,
}) => {
  const item = useLayoutStore((s) =>
    s.layout.equipment.find((e) => e.id === equipmentId)
  );
  const updateEquipment = useLayoutStore((s) => s.updateEquipment);
  const addEquipment = useLayoutStore((s) => s.addEquipment);
  const deleteEquipment = useLayoutStore((s) => s.deleteEquipment);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  if (!item) return null;

  const currentAngle = ((item.rotation ?? 0) % 360 + 360) % 360;

  const setAngle = (deg: number) => {
    const normalized = ((Math.round(deg) % 360) + 360) % 360;
    updateEquipment(item.id, { rotation: normalized });
  };

  const handleSwap90 = () => {
    updateEquipment(item.id, {
      width: item.height,
      height: item.width,
    });
  };

  const handleDuplicate = () => {
    const newId = `eq-${Date.now()}`;
    addEquipment({
      ...item,
      id: newId,
      code: `${item.code}-B`,
      x: Number((item.x + 2).toFixed(2)),
      y: Number((item.y + 2).toFixed(2)),
      isExisting: false,
    });
    setSelectedEntity({ type: 'equipment', id: newId });
  };

  return (
    <div className="space-y-3.5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
            Equipment / Fixture Inspector
          </span>
          <h3 className="text-sm font-semibold text-white">{item.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSwap90}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Swap Width & Depth (90° Footprint Flip)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Duplicate Equipment"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              deleteEquipment(item.id);
              setSelectedEntity(null);
            }}
            className="p-1.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 transition"
            title="Delete Equipment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="block text-slate-400 mb-1">Tag Code</label>
          <input
            type="text"
            value={item.code}
            onChange={(e) => updateEquipment(item.id, { code: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-slate-400 mb-1">Equipment Name</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateEquipment(item.id, { name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 mb-1">Category</label>
        <select
          value={item.category}
          onChange={(e) =>
            updateEquipment(item.id, {
              category: e.target.value as EquipmentCategory,
            })
          }
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
        >
          <optgroup label="Core Industrial & Architectural">
            <option value="machinery">Process Machinery / Workcell</option>
            <option value="racking">Pallet Racking / Vertical Shelving</option>
            <option value="workstation">Workstation / Prep Table</option>
            <option value="material-handling">Material Handling / Pallets</option>
            <option value="electrical-mep">Electrical / MEP Switchgear</option>
            <option value="plumbing">Plumbing / Sink / Interceptor</option>
            <option value="safety-equipment">Life Safety / Fire Ext. / Eyewash</option>
            <option value="custom">Custom Footprint</option>
          </optgroup>
          <optgroup label="Add-On Modules (Cultivation, Cleanroom & Security)">
            <option value="rolling-bench">4×8 Rolling Ebb &amp; Flow Bench</option>
            <option value="hvac-scrubber">HVAC Split-System / Carbon Scrubber</option>
            <option value="secure-vault">Secure Vault Safe / Product Cage</option>
            <option value="access-control">RFID Badge Reader / Strike Lock</option>
            <option value="security-camera">24/7 Security Camera (FOV)</option>
          </optgroup>
        </select>
      </div>

      {/* Free-Angle Rotation Control (0° - 360°) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-medium flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Rotation Angle (0°–360°)</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="360"
              step="1"
              value={currentAngle}
              onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
              className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-right text-amber-300 focus:border-amber-500 outline-none"
            />
            <span className="text-slate-400 font-mono">°</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="359"
          step="1"
          value={currentAngle}
          onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
          className="w-full accent-amber-500 cursor-pointer"
        />

        <div className="flex items-center justify-between gap-1">
          {[
            { label: '-45°', fn: () => setAngle(currentAngle - 45) },
            { label: '-15°', fn: () => setAngle(currentAngle - 15) },
            { label: '0°', fn: () => setAngle(0) },
            { label: '+15°', fn: () => setAngle(currentAngle + 15) },
            { label: '+45°', fn: () => setAngle(currentAngle + 45) },
            { label: 'Swap W/D', fn: handleSwap90 },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.fn}
              className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-200 transition"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">
            Width (ft) <span className="text-slate-500">({formatFeetInches(item.width)})</span>
          </label>
          <input
            type="number"
            step="0.25"
            min="1"
            value={item.width}
            onChange={(e) =>
              updateEquipment(item.id, {
                width: Math.max(1, parseFloat(e.target.value) || 1),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">
            Depth (ft) <span className="text-slate-500">({formatFeetInches(item.height)})</span>
          </label>
          <input
            type="number"
            step="0.25"
            min="1"
            value={item.height}
            onChange={(e) =>
              updateEquipment(item.id, {
                height: Math.max(1, parseFloat(e.target.value) || 1),
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
            value={item.x}
            onChange={(e) =>
              updateEquipment(item.id, { x: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Y Position (ft)</label>
          <input
            type="number"
            step="0.25"
            value={item.y}
            onChange={(e) =>
              updateEquipment(item.id, { y: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">3D Height (ft)</label>
          <input
            type="number"
            step="0.5"
            min="1"
            value={item.elevationHeight}
            onChange={(e) =>
              updateEquipment(item.id, {
                elevationHeight: Math.max(1, parseFloat(e.target.value) || 3),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Safety Clearance (ft)</label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={item.clearanceFt ?? 0}
            onChange={(e) =>
              updateEquipment(item.id, {
                clearanceFt: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 mb-1">
          Power / Air / Utility Requirements
        </label>
        <input
          type="text"
          value={item.specs || ''}
          onChange={(e) => updateEquipment(item.id, { specs: e.target.value })}
          placeholder="e.g. 480V 3Ph • 60A • 90 PSI CDA"
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
        />
      </div>
    </div>
  );
};
