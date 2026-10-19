import React, { useEffect } from 'react';
import { CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { useLayoutStore, hasPendingDiskWrite } from '../../store/layoutStore';

export const DiskSyncWatcher: React.FC = () => {
  const syncStatus = useLayoutStore((s) => s.syncStatus);

  useEffect(() => {
    let active = true;

    const pollDiskFile = async () => {
      if (useLayoutStore.getState().syncStatus === 'saving' || hasPendingDiskWrite()) return;
      try {
        const res = await fetch('/api/layout');
        if (!res.ok || !active) return;
        const data = await res.json();
        const currentMtime = useLayoutStore.getState().lastSyncedMtimeMs;
        if (currentMtime === 0) {
          useLayoutStore.getState().replaceLayout(data.layout, false);
          useLayoutStore.getState().setSyncInfo(data.mtimeMs, 'synced');
        } else if (data.mtimeMs > currentMtime + 50) {
          useLayoutStore.getState().replaceLayout(data.layout, false);
          useLayoutStore.getState().setSyncInfo(data.mtimeMs, 'external-update');
          setTimeout(() => {
            if (active) {
              useLayoutStore.getState().setSyncInfo(data.mtimeMs, 'synced');
            }
          }, 2200);
        }
      } catch {
        // Ignore when offline/static build
      }
    };

    void pollDiskFile();
    const interval = setInterval(pollDiskFile, 1200);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
      title="Bidirectional sync with src/data/facility-layout.json — edits in UI or by AI in code sync automatically"
    >
      {syncStatus === 'saving' && (
        <>
          <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
          <span className="text-amber-300">Saving JSON...</span>
        </>
      )}
      {syncStatus === 'external-update' && (
        <>
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300">Updated from Disk (AI)</span>
        </>
      )}
      {(syncStatus === 'synced' || syncStatus === 'offline') && (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-400">facility-layout.json</span>
        </>
      )}
    </div>
  );
};
