import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoorInspector } from './DoorInspector';
import { useLayoutStore } from '../../store/layoutStore';

describe('DoorInspector component', () => {
  beforeEach(() => {
    useLayoutStore.getState().addDoor({
      id: 'inspect-door-test',
      label: 'D-301',
      type: 'single-swing',
      x: 15,
      y: 0,
      width: 3,
      orientation: 'horizontal',
      swing: 'north-east',
    });
  });

  it('renders door tag, width, and orientation toggle', () => {
    render(<DoorInspector doorId="inspect-door-test" />);

    expect(screen.getByDisplayValue('D-301')).toBeDefined();
    expect(screen.getByDisplayValue('3')).toBeDefined();
  });

  it('toggles wall orientation on rotate button click', () => {
    render(<DoorInspector doorId="inspect-door-test" />);

    const rotBtn = screen.getByTitle('Rotate Wall Orientation 90°');
    fireEvent.click(rotBtn);

    expect(
      useLayoutStore.getState().layout.doors.find((d) => d.id === 'inspect-door-test')?.orientation
    ).toBe('vertical');
  });

  it('deletes door on delete button click', () => {
    render(<DoorInspector doorId="inspect-door-test" />);

    const deleteBtn = screen.getByTitle('Delete Door');
    fireEvent.click(deleteBtn);

    expect(
      useLayoutStore.getState().layout.doors.find((d) => d.id === 'inspect-door-test')
    ).toBeUndefined();
  });

  it('renders nothing for non-existent door', () => {
    const { container } = render(<DoorInspector doorId="non-existent" />);
    expect(container.firstChild).toBeNull();
  });
});
