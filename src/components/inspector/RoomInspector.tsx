import React from 'react';
import { Trash2, Copy } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { CeilingType, FloorFinish, RoomCategory } from '../../types/facility';
import { formatFeetInches, ROOM_CATEGORY_STYLES } from '../../utils/dimensions';

interface RoomInspectorProps {
  roomId: string;
}

export const RoomInspector: React.FC<RoomInspectorProps> = ({ roomId }) => {
  const room = useLayoutStore((s) => s.layout.rooms.find((r) => r.id === roomId));
  const updateRoom = useLayoutStore((s) => s.updateRoom);
  const addRoom = useLayoutStore((s) => s.addRoom);
  const deleteRoom = useLayoutStore((s) => s.deleteRoom);
  const setSelectedEntity = useViewStore((s) => s.setSelectedEntity);

  if (!room) return null;

  const sqFt = Math.round(room.width * room.height);
  const perimeterFt = Math.round((room.width + room.height) * 2);

  const handleDuplicate = () => {
    const newId = `room-${Date.now()}`;
    addRoom({
      ...room,
      id: newId,
      name: `${room.name} (Copy)`,
      code: `${room.code}-B`,
      x: Number((room.x + 2).toFixed(2)),
      y: Number((room.y + 2).toFixed(2)),
      isExisting: false,
    });
    setSelectedEntity({ type: 'room', id: newId });
  };

  const handleDelete = () => {
    deleteRoom(room.id);
    setSelectedEntity(null);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
            Room / Zone Inspector
          </span>
          <h3 className="text-sm font-semibold text-white">{room.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Duplicate Room"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 transition"
            title="Delete Room"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Area & Perimeter Metrics Card */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
        <div>
          <div className="text-[10px] text-slate-400">Net Area</div>
          <div className="text-sm font-mono font-bold text-emerald-400">
            {sqFt.toLocaleString()} SF
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Dimensions</div>
          <div className="text-xs font-mono font-semibold text-slate-200">
            {formatFeetInches(room.width)} × {formatFeetInches(room.height)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Wall Linear</div>
          <div className="text-xs font-mono font-semibold text-slate-200">
            {perimeterFt} LF
          </div>
        </div>
      </div>

      {/* Room Name & Code */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="block text-slate-400 mb-1">Room Code</label>
          <input
            type="text"
            value={room.code}
            onChange={(e) => updateRoom(room.id, { code: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-slate-400 mb-1">Room Name</label>
          <input
            type="text"
            value={room.name}
            onChange={(e) => updateRoom(room.id, { name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Room Category */}
      <div>
        <label className="block text-slate-400 mb-1">Program Category</label>
        <select
          value={room.category}
          onChange={(e) =>
            updateRoom(room.id, { category: e.target.value as RoomCategory })
          }
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
        >
          {Object.entries(ROOM_CATEGORY_STYLES).map(([key, style]) => (
            <option key={key} value={key}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      {/* Position & Size in Decimal Feet (with Feet-Inches Subtitle) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">
            Width (E-W ft){' '}
            <span className="text-slate-500 font-mono">
              ({formatFeetInches(room.width)})
            </span>
          </label>
          <input
            type="number"
            step="0.25"
            min="2"
            value={room.width}
            onChange={(e) =>
              updateRoom(room.id, {
                width: Math.max(2, parseFloat(e.target.value) || 2),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">
            Length (N-S ft){' '}
            <span className="text-slate-500 font-mono">
              ({formatFeetInches(room.height)})
            </span>
          </label>
          <input
            type="number"
            step="0.25"
            min="2"
            value={room.height}
            onChange={(e) =>
              updateRoom(room.id, {
                height: Math.max(2, parseFloat(e.target.value) || 2),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">
            X Offset (ft){' '}
            <span className="text-slate-500 font-mono">
              ({formatFeetInches(room.x)})
            </span>
          </label>
          <input
            type="number"
            step="0.25"
            value={room.x}
            onChange={(e) =>
              updateRoom(room.id, { x: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">
            Y Offset (ft){' '}
            <span className="text-slate-500 font-mono">
              ({formatFeetInches(room.y)})
            </span>
          </label>
          <input
            type="number"
            step="0.25"
            value={room.y}
            onChange={(e) =>
              updateRoom(room.id, { y: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Ceiling Height, Finish, and Construction Scope */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-400 mb-1">Wall / Ceiling Ht (ft)</label>
          <input
            type="number"
            step="1"
            min="7"
            max="18"
            value={room.wallHeight}
            onChange={(e) =>
              updateRoom(room.id, {
                wallHeight: Math.max(7, parseFloat(e.target.value) || 10),
              })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Ceiling Type</label>
          <select
            value={room.ceilingType || 'open-deck'}
            onChange={(e) =>
              updateRoom(room.id, { ceilingType: e.target.value as CeilingType })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          >
            <option value="open-deck">Open Structure</option>
            <option value="acoustic-drop">2x4 Acoustic Grid</option>
            <option value="clean-panel">Cleanroom Walkable Panel</option>
            <option value="imp-insulated">Insulated Metal Panel (IMP)</option>
            <option value="gypsum">Hard Gypsum Board</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 items-center">
        <div>
          <label className="block text-slate-400 mb-1">Floor Finish</label>
          <select
            value={room.floorFinish || 'sealed-concrete'}
            onChange={(e) =>
              updateRoom(room.id, { floorFinish: e.target.value as FloorFinish })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          >
            <option value="sealed-concrete">Sealed Concrete</option>
            <option value="epoxy-coat">Industrial Epoxy</option>
            <option value="coved-epoxy">Coved-Edge Sanitary Epoxy</option>
            <option value="esd-epoxy">ESD Conductive Epoxy</option>
            <option value="vct-tile">VCT Tile</option>
            <option value="carpet-tile">Commercial Carpet Tile</option>
          </select>
        </div>
        <div className="pt-4 space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(room.isExisting)}
              onChange={(e) => updateRoom(room.id, { isExisting: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-blue-500"
            />
            <span>Existing Shell Room</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-red-300 font-medium">
            <input
              type="checkbox"
              checked={Boolean(room.isLimitedAccess)}
              onChange={(e) =>
                updateRoom(room.id, { isLimitedAccess: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 text-red-500"
            />
            <span>Limited Access Area (L.A.A.)</span>
          </label>
        </div>
      </div>

      {/* Subtitle, Material Callouts & MEP Pressure Differential */}
      <div className="space-y-2">
        <div>
          <label className="block text-slate-400 mb-1">
            Zone Subtitle (e.g. Closed-Loop Environmental Zone)
          </label>
          <input
            type="text"
            value={room.subtitle || ''}
            onChange={(e) => updateRoom(room.id, { subtitle: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">
            Wall &amp; Floor Material Callout
          </label>
          <input
            type="text"
            value={room.materialCallout || ''}
            onChange={(e) =>
              updateRoom(room.id, { materialCallout: e.target.value })
            }
            placeholder="e.g. Walls: FRP • Floor: Coved-Edge Epoxy"
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">
            MEP Room Pressure Tag (Sheet M-101)
          </label>
          <input
            type="text"
            value={room.pressureDifferential || ''}
            onChange={(e) =>
              updateRoom(room.id, { pressureDifferential: e.target.value })
            }
            placeholder='e.g. +0.05" WC POS. PRESSURE HEPA'
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 font-mono text-white focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Contractor Build-Out Notes */}
      <div>
        <label className="block text-slate-400 mb-1">
          Contractor / MEP Build-Out Specs
        </label>
        <textarea
          rows={3}
          value={room.notes || ''}
          onChange={(e) => updateRoom(room.id, { notes: e.target.value })}
          placeholder="Stud gauge, insulation, electrical drops, HVAC CFM..."
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
};
