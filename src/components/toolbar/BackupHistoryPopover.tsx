import React, { useEffect, useState } from 'react';
import { History, Plus, RotateCcw, Trash2, Check } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { BackupSnapshotMeta } from '../../types/facility';

function formatRelativeTime(isoString: string): string {
  const diffSec = Math.round((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const BackupHistoryPopover: React.FC = () => {
  const layout = useLayoutStore((s) => s.layout);
  const recordHistorySnapshot = useLayoutStore((s) => s.recordHistorySnapshot);
  const replaceLayout = useLayoutStore((s) => s.replaceLayout);
  const setSyncInfo = useLayoutStore((s) => s.setSyncInfo);

  const [open, setOpen] = useState(false);
  const [backups, setBackups] = useState<BackupSnapshotMeta[]>([]);
  const [customLabel, setCustomLabel] = useState('');
  const [savingBackup, setSavingBackup] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {
      // Ignore offline errors
    }
  };

  useEffect(() => {
    void fetchBackups();
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetchBackups();
    const onPointerDown = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBackup(true);
    try {
      const reason = customLabel.trim() || 'Manual Checkpoint';
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, layout }),
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
        setCustomLabel('');
      }
    } finally {
      setSavingBackup(false);
    }
  };

  const handleRestoreBackup = async (id: string) => {
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        recordHistorySnapshot();
        replaceLayout(data.layout, false);
        setSyncInfo(data.mtimeMs ?? Date.now(), 'synced');
        setRestoredId(id);
        setTimeout(() => setRestoredId(null), 1800);
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteBackup = async (id: string) => {
    try {
      const res = await fetch(`/api/backups?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div ref={popoverRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition ${
          open
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
        }`}
        title="View Periodic Auto-Backups & Manual Checkpoints (src/data/backups/)"
      >
        <History className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden xl:inline">Backups</span>
        {backups.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-emerald-300">
            {backups.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 space-y-3 text-xs z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                Layout Backups &amp; Snapshots
              </div>
              <div className="text-[10px] text-slate-400">
                Auto-saves every 2 min on changes to <code className="text-slate-300">src/data/backups/</code>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white text-sm px-1"
            >
              &times;
            </button>
          </div>

          {/* Create Manual Checkpoint Form */}
          <form onSubmit={handleCreateBackup} className="flex gap-1.5">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Checkpoint label (optional)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={savingBackup}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shrink-0 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </form>

          {/* List of Saved Backups */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
            {backups.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                No backups saved yet. Click Save above to create a checkpoint.
              </div>
            ) : (
              backups.map((b) => (
                <div
                  key={b.id}
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-200 truncate">
                      {b.reason}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span>{formatRelativeTime(b.createdAt)}</span>
                      <span>&bull;</span>
                      <span>
                        {b.roomCount} rm / {b.equipmentCount} eq
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRestoreBackup(b.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${
                        restoredId === b.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white'
                      }`}
                      title="Restore this backup snapshot"
                    >
                      {restoredId === b.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Restored</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(b.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
