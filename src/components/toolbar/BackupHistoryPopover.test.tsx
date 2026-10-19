import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BackupHistoryPopover } from './BackupHistoryPopover';

describe('BackupHistoryPopover component', () => {
  const mockBackups = [
    {
      id: 'backup-12345',
      createdAt: new Date().toISOString(),
      reason: 'Auto checkpoint before edit',
      roomCount: 12,
      equipmentCount: 45,
      filename: 'backup-12345.json',
      sizeBytes: 15420,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
        if (url === '/api/backups' && opts?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ backups: [...mockBackups, { id: 'backup-new', reason: 'New Snapshot', createdAt: new Date().toISOString(), roomCount: 12, equipmentCount: 45 }] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ backups: mockBackups }),
        });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders backup button and toggles open popover', async () => {
    render(<BackupHistoryPopover />);

    const btn = screen.getByTitle(/View Periodic Auto-Backups/);
    expect(btn).toBeDefined();

    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText('Layout Backups & Snapshots')).toBeDefined();
      expect(screen.getByText('Auto checkpoint before edit')).toBeDefined();
    });
  });

  it('submits new checkpoint through form', async () => {
    render(<BackupHistoryPopover />);

    const btn = screen.getByTitle(/View Periodic Auto-Backups/);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Checkpoint label/)).toBeDefined();
    });

    const input = screen.getByPlaceholderText(/Checkpoint label/);
    fireEvent.change(input, { target: { value: 'Milestone Pre-Production' } });

    const saveBtn = screen.getByRole('button', { name: /Save/ });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('New Snapshot')).toBeDefined();
    });
  });
});
