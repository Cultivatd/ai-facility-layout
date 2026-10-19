import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

interface StoredBackupFile {
  id: string;
  createdAt: string;
  reason: string;
  layout: {
    rooms?: unknown[];
    doors?: unknown[];
    equipment?: unknown[];
    [key: string]: unknown;
  };
}

function facilityLayoutDiskSyncPlugin(): Plugin {
  const layoutFilePath = path.resolve(__dirname, 'src/data/facility-layout.json');
  const backupsDir = path.resolve(__dirname, 'src/data/backups');
  const AUTO_BACKUP_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
  const MAX_BACKUPS = 40;

  let lastAutoBackupTimeMs = 0;
  let lastBackedUpRaw = '';

  function ensureBackupsDir() {
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
  }

  function pruneOldBackups() {
    ensureBackupsDir();
    const files = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({
        name: f,
        fullPath: path.join(backupsDir, f),
        mtimeMs: fs.statSync(path.join(backupsDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    if (files.length > MAX_BACKUPS) {
      for (const old of files.slice(MAX_BACKUPS)) {
        try {
          fs.unlinkSync(old.fullPath);
        } catch {
          // ignore
        }
      }
    }
  }

  function createBackupSnapshot(layoutObj: StoredBackupFile['layout'], reason: string) {
    ensureBackupsDir();
    const now = new Date();
    const safeTs = now.toISOString().replace(/[:.]/g, '-');
    const id = `backup-${safeTs}`;
    const filename = `${id}.json`;
    const record: StoredBackupFile = {
      id,
      createdAt: now.toISOString(),
      reason,
      layout: layoutObj,
    };
    fs.writeFileSync(
      path.join(backupsDir, filename),
      JSON.stringify(record, null, 2) + '\n',
      'utf-8'
    );
    lastAutoBackupTimeMs = Date.now();
    lastBackedUpRaw = JSON.stringify(layoutObj);
    pruneOldBackups();
    return {
      id,
      filename,
      createdAt: record.createdAt,
      reason: record.reason,
      roomCount: Array.isArray(layoutObj.rooms) ? layoutObj.rooms.length : 0,
      doorCount: Array.isArray(layoutObj.doors) ? layoutObj.doors.length : 0,
      equipmentCount: Array.isArray(layoutObj.equipment)
        ? layoutObj.equipment.length
        : 0,
    };
  }

  function listBackups() {
    ensureBackupsDir();
    const files = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith('.json'));

    const metas = [];
    for (const filename of files) {
      try {
        const raw = fs.readFileSync(path.join(backupsDir, filename), 'utf-8');
        const parsed = JSON.parse(raw) as StoredBackupFile;
        metas.push({
          id: parsed.id || filename.replace(/\.json$/, ''),
          filename,
          createdAt: parsed.createdAt,
          reason: parsed.reason || 'Snapshot',
          roomCount: Array.isArray(parsed.layout?.rooms)
            ? parsed.layout.rooms.length
            : 0,
          doorCount: Array.isArray(parsed.layout?.doors)
            ? parsed.layout.doors.length
            : 0,
          equipmentCount: Array.isArray(parsed.layout?.equipment)
            ? parsed.layout.equipment.length
            : 0,
        });
      } catch {
        // skip malformed backup file
      }
    }

    return metas.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return {
    name: 'facility-layout-disk-sync',
    configureServer(server) {
      // Ensure at least one initial baseline backup exists on startup
      try {
        ensureBackupsDir();
        const existing = fs
          .readdirSync(backupsDir)
          .filter((f) => f.endsWith('.json'));
        if (existing.length === 0 && fs.existsSync(layoutFilePath)) {
          const initialLayout = JSON.parse(
            fs.readFileSync(layoutFilePath, 'utf-8')
          );
          createBackupSnapshot(initialLayout, 'Initial Baseline Snapshot');
        }
      } catch {
        // ignore startup check errors
      }

      server.middlewares.use('/api/backups/restore', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const { id } = JSON.parse(body);
            const targetPath = path.join(backupsDir, `${id}.json`);
            if (!fs.existsSync(targetPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Backup not found' }));
              return;
            }
            const backupRecord = JSON.parse(
              fs.readFileSync(targetPath, 'utf-8')
            ) as StoredBackupFile;
            const formatted = JSON.stringify(backupRecord.layout, null, 2) + '\n';
            fs.writeFileSync(layoutFilePath, formatted, 'utf-8');
            const stat = fs.statSync(layoutFilePath);
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: true,
                mtimeMs: stat.mtimeMs,
                layout: backupRecord.layout,
              })
            );
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      server.middlewares.use('/api/backups', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ backups: listBackups() }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const layoutToSave =
                parsed.layout ??
                JSON.parse(fs.readFileSync(layoutFilePath, 'utf-8'));
              const reason = parsed.reason || 'Manual Checkpoint';
              const meta = createBackupSnapshot(layoutToSave, reason);
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({ ok: true, created: meta, backups: listBackups() })
              );
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          try {
            const urlObj = new URL(req.url || '', 'http://localhost');
            const id = urlObj.searchParams.get('id');
            if (id) {
              const targetPath = path.join(backupsDir, `${id}.json`);
              if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);
              }
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, backups: listBackups() }));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: String(err) }));
          }
          return;
        }

        next();
      });

      server.middlewares.use('/api/layout', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const stat = fs.statSync(layoutFilePath);
            const raw = fs.readFileSync(layoutFilePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                mtimeMs: stat.mtimeMs,
                layout: JSON.parse(raw),
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const formatted = JSON.stringify(parsed, null, 2) + '\n';
              fs.writeFileSync(layoutFilePath, formatted, 'utf-8');
              const stat = fs.statSync(layoutFilePath);

              // Periodic auto-backup if interval elapsed and content changed
              const compactRaw = JSON.stringify(parsed);
              if (
                Date.now() - lastAutoBackupTimeMs >= AUTO_BACKUP_INTERVAL_MS &&
                compactRaw !== lastBackedUpRaw
              ) {
                createBackupSnapshot(parsed, 'Periodic Auto-Backup');
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, mtimeMs: stat.mtimeMs }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        next();
      });
    },
    handleHotUpdate({ file }) {
      const resolved = path.resolve(file);
      if (resolved === layoutFilePath || resolved.startsWith(backupsDir)) {
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), facilityLayoutDiskSyncPlugin()],
  server: {
    port: 5173,
  },
});
