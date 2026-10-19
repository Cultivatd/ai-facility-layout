import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomInspector } from './RoomInspector';
import { useLayoutStore } from '../../store/layoutStore';

describe('RoomInspector component', () => {
  beforeEach(() => {
    useLayoutStore.getState().addRoom({
      id: 'inspect-room-test',
      name: 'Packaging Suite A',
      code: 'PKG-101',
      category: 'production',
      x: 10,
      y: 10,
      width: 20,
      height: 15,
      wallHeight: 12,
    });
  });

  it('renders room properties and calculated SF', () => {
    render(<RoomInspector roomId="inspect-room-test" />);

    expect(screen.getByDisplayValue('Packaging Suite A')).toBeDefined();
    expect(screen.getByDisplayValue('PKG-101')).toBeDefined();
    expect(screen.getByText('300 SF')).toBeDefined();
  });

  it('updates room name on input change', () => {
    render(<RoomInspector roomId="inspect-room-test" />);

    const nameInput = screen.getByDisplayValue('Packaging Suite A');
    fireEvent.change(nameInput, { target: { value: 'Automated Packaging Suite' } });

    expect(
      useLayoutStore.getState().layout.rooms.find((r) => r.id === 'inspect-room-test')?.name
    ).toBe('Automated Packaging Suite');
  });

  it('deletes room when clicking delete button', () => {
    render(<RoomInspector roomId="inspect-room-test" />);

    const deleteBtn = screen.getByTitle('Delete Room');
    fireEvent.click(deleteBtn);

    expect(
      useLayoutStore.getState().layout.rooms.find((r) => r.id === 'inspect-room-test')
    ).toBeUndefined();
  });

  it('renders nothing for non-existent room', () => {
    const { container } = render(<RoomInspector roomId="non-existent" />);
    expect(container.firstChild).toBeNull();
  });
});
