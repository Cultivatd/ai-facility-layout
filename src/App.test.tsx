import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useViewStore } from './store/viewStore';
import { useLayoutStore } from './store/layoutStore';

// Mock IsometricPreview3D to avoid WebGL initialization in happy-dom
vi.mock('./components/preview3d/IsometricPreview3D', () => ({
  IsometricPreview3D: () => <div data-testid="mock-preview-3d">Isometric 3D Viewport</div>,
}));

describe('App root component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ layout: useLayoutStore.getState().layout, mtimeMs: 100 }),
    }));
    useViewStore.getState().setViewMode('2d');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders StudioHeader, SpaceProgramSidebar, and 2D canvas in 2D mode', () => {
    const { container } = render(<App />);

    expect(screen.getByText('Elements')).toBeDefined();
    expect(screen.getByText('Catalog')).toBeDefined();
    expect(screen.getByText('Shell & Info')).toBeDefined();
    expect(container.querySelector('svg')).toBeDefined();
    expect(screen.queryByTestId('mock-preview-3d')).toBeNull();
  });

  it('renders IsometricPreview3D in 3D mode', () => {
    useViewStore.getState().setViewMode('3d');

    render(<App />);

    expect(screen.getByTestId('mock-preview-3d')).toBeDefined();
  });

  it('renders both 2D and 3D in split mode', () => {
    useViewStore.getState().setViewMode('split');

    const { container } = render(<App />);

    expect(container.querySelector('svg')).toBeDefined();
    expect(screen.getByTestId('mock-preview-3d')).toBeDefined();
  });
});
