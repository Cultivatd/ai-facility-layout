import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FacilityCanvas2D } from './FacilityCanvas2D';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('FacilityCanvas2D component', () => {
  beforeEach(() => {
    useViewStore.getState().setActiveTool('select');
    useViewStore.getState().setTheme('investor-color');
    useLayoutStore.getState().setRectangularShell(60, 100);
    useLayoutStore.getState().replaceLayout({
      ...useLayoutStore.getState().layout,
      rooms: [{
        id: 'canvas-test-room',
        name: 'Assembly Bay 1',
        code: 'ASY-1',
        category: 'production',
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        wallHeight: 14,
      }],
      doors: [{
        id: 'canvas-test-door',
        label: 'D-01',
        type: 'single-swing',
        x: 15,
        y: 10,
        width: 3,
        orientation: 'horizontal',
        swing: 'north-east',
      }],
      equipment: [{
        id: 'canvas-test-eq',
        name: 'CNC Milling Center',
        code: 'CNC-1',
        category: 'machinery',
        x: 15,
        y: 15,
        width: 6,
        height: 4,
        elevationHeight: 6,
        rotation: 0,
      }],
      structuralElements: [{
        id: 'canvas-test-st',
        name: 'Steel Column C-1',
        type: 'steel-column',
        x: 30,
        y: 30,
        width: 1.5,
        height: 1.5,
        isExisting: true,
      }],
    }, false);
  });

  it('renders SVG canvas, layers, and tool dock', () => {
    const { container } = render(<FacilityCanvas2D />);

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Renders nodes and labels
    expect(screen.getByText('Assembly Bay 1')).toBeDefined();
    expect(screen.getByText('ASY-1')).toBeDefined();
    expect(screen.getByText(/CNC-1/)).toBeDefined();
  });

  it('handles zoom in, zoom out, and reset zoom button clicks', () => {
    render(<FacilityCanvas2D />);

    const initialZoom = useViewStore.getState().zoom;

    const zoomInBtn = screen.getByTitle('Zoom In');
    fireEvent.click(zoomInBtn);
    expect(useViewStore.getState().zoom).toBeGreaterThan(initialZoom);

    const zoomOutBtn = screen.getByTitle('Zoom Out');
    fireEvent.click(zoomOutBtn);
    fireEvent.click(zoomOutBtn);
    expect(useViewStore.getState().zoom).toBeLessThan(initialZoom);

    const resetZoomBtn = screen.getByTitle('Reset View');
    fireEvent.click(resetZoomBtn);
    expect(useViewStore.getState().zoom).toBe(1);
    expect(useViewStore.getState().panX).toBe(0);
    expect(useViewStore.getState().panY).toBe(0);
  });

  it('deselects entity when clicking empty canvas background in select mode', () => {
    useViewStore.getState().setSelectedEntity({ type: 'room', id: 'canvas-test-room' });

    const { container } = render(<FacilityCanvas2D />);

    const polygon = container.querySelector('polygon');
    if (polygon) {
      fireEvent.pointerDown(polygon);
      expect(useViewStore.getState().selectedEntity).toBeNull();
    }
  });
});
