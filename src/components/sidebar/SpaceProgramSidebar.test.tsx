import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpaceProgramSidebar } from './SpaceProgramSidebar';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('SpaceProgramSidebar component', () => {
  beforeEach(() => {
    useViewStore.getState().setSelectedEntity(null);
    useLayoutStore.getState().setRectangularShell(50, 80);
    useLayoutStore.getState().replaceLayout({
      ...useLayoutStore.getState().layout,
      rooms: [{
        id: 'sidebar-room-test',
        name: 'Inspection Bay Alpha',
        code: 'QC-1',
        category: 'lab',
        x: 10,
        y: 10,
        width: 15,
        height: 20,
        wallHeight: 12,
      }],
    }, false);
  });

  it('renders elements list tab and allows selecting a room', () => {
    render(<SpaceProgramSidebar />);

    expect(screen.getByText('Elements')).toBeDefined();
    expect(screen.getByText('Catalog')).toBeDefined();
    expect(screen.getByText('Shell & Info')).toBeDefined();

    const roomRow = screen.getByText('Inspection Bay Alpha');
    expect(roomRow).toBeDefined();

    fireEvent.click(roomRow);
    expect(useViewStore.getState().selectedEntity).toEqual({
      type: 'room',
      id: 'sidebar-room-test',
    });
  });

  it('switches to Catalog tab and displays quick-add templates', () => {
    render(<SpaceProgramSidebar />);

    const catalogTab = screen.getByText('Catalog');
    fireEvent.click(catalogTab);

    expect(screen.getByText(/Quick-Add Room Templates/)).toBeDefined();
  });

  it('switches to Shell & Info tab and displays building metadata', () => {
    render(<SpaceProgramSidebar />);

    const shellTab = screen.getByText('Shell & Info');
    fireEvent.click(shellTab);

    expect(screen.getByText(/Building Shell Footprint/)).toBeDefined();
    expect(screen.getByDisplayValue('50')).toBeDefined();
    expect(screen.getByDisplayValue('80')).toBeDefined();
  });
});
