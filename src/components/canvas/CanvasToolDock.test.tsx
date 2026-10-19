import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasToolDock } from './CanvasToolDock';
import { useViewStore } from '../../store/viewStore';

describe('CanvasToolDock component', () => {
  beforeEach(() => {
    useViewStore.getState().setActiveTool('select');
  });

  it('renders standard CAD creation and navigation tools', () => {
    render(<CanvasToolDock />);

    expect(screen.getByTitle(/Select \/ Edit/)).toBeDefined();
    expect(screen.getByTitle(/Pan Canvas/)).toBeDefined();
    expect(screen.getByTitle(/Add Room/)).toBeDefined();
    expect(screen.getByTitle(/Add Door/)).toBeDefined();
    expect(screen.getByTitle(/Add Equipment/)).toBeDefined();
    expect(screen.getByTitle(/Add Structural/)).toBeDefined();
  });

  it('changes active tool on tool button click', () => {
    render(<CanvasToolDock />);

    const roomBtn = screen.getByTitle(/Add Room/);
    fireEvent.click(roomBtn);
    expect(useViewStore.getState().activeTool).toBe('add-room');

    const doorBtn = screen.getByTitle(/Add Door/);
    fireEvent.click(doorBtn);
    expect(useViewStore.getState().activeTool).toBe('add-door');

    const equipBtn = screen.getByTitle(/Add Equipment/);
    fireEvent.click(equipBtn);
    expect(useViewStore.getState().activeTool).toBe('add-equipment');
  });
});
