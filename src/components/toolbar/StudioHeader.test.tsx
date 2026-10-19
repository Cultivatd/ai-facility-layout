import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudioHeader } from './StudioHeader';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('StudioHeader component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ layout: useLayoutStore.getState().layout, mtimeMs: 100 }),
    }));
    useViewStore.getState().setViewMode('2d');
    useViewStore.getState().setTheme('investor-color');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders project title and view modes', () => {
    render(<StudioHeader />);

    // Renders suite / project name
    const title = screen.getByText('Unit 210');
    expect(title).toBeDefined();

    // Renders 2D / 3D mode buttons
    expect(screen.getByText('2D Plan')).toBeDefined();
    expect(screen.getByText('3D Isometric')).toBeDefined();
    expect(screen.getByText('Split 2D/3D')).toBeDefined();
  });

  it('switches view mode on 3D click', () => {
    render(<StudioHeader />);

    const btn3d = screen.getByText('3D Isometric');
    fireEvent.click(btn3d);

    expect(useViewStore.getState().viewMode).toBe('3d');
  });

  it('toggles preset dropdown menu', () => {
    render(<StudioHeader />);

    // Presets dropdown trigger
    const presetBtn = screen.getByTitle('Switch Facility Starter Template or Load Showcase Preset');
    fireEvent.click(presetBtn);

    expect(screen.getByText(/General Industrial & Lab/)).toBeDefined();
  });

  it('toggles theme dropdown menu and selects dark-cad', () => {
    render(<StudioHeader />);

    const themeLayersBtn = screen.getByTitle('Presentation Theme, Floorplan Underlay & Layer Visibility');
    fireEvent.click(themeLayersBtn);

    const darkCadOption = screen.getByText('Dark Engineering CAD');
    fireEvent.click(darkCadOption);

    expect(useViewStore.getState().theme).toBe('dark-cad');
  });

  it('handles undo and redo interactions', () => {
    // Add a room so history has a past state
    useLayoutStore.getState().addRoom({
      id: 'header-test-room',
      name: 'Temp Header Room',
      code: 'HDR-1',
      category: 'warehouse',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      wallHeight: 10,
    });

    render(<StudioHeader />);

    const undoBtn = screen.getByTitle(/Undo/);
    expect(undoBtn).toBeDefined();
    fireEvent.click(undoBtn);

    expect(
      useLayoutStore.getState().layout.rooms.find((r) => r.id === 'header-test-room')
    ).toBeUndefined();
  });
});
