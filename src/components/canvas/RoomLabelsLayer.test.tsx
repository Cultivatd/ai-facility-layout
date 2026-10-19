import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { RoomLabelsLayer } from './RoomLabelsLayer';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('RoomLabelsLayer component', () => {
  beforeEach(() => {
    useLayoutStore.getState().replaceLayout({
      ...useLayoutStore.getState().layout,
      rooms: [{
        id: 'label-room-test',
        name: 'Advanced Metrology Lab',
        code: 'LAB-99',
        category: 'lab',
        x: 10,
        y: 10,
        width: 20,
        height: 15,
        wallHeight: 12,
      }],
    }, false);
  });

  it('renders room label plates with code and SF', () => {
    const { container } = render(
      <svg>
        <RoomLabelsLayer />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('LAB-99'))).toBe(true);
    expect(texts.some((t) => t?.includes('300 SF'))).toBe(true);
  });

  it('selects the room when clicking its label plate', () => {
    const { container } = render(
      <svg>
        <RoomLabelsLayer />
      </svg>
    );

    const labelGroup = container.querySelector('g.cursor-pointer');
    expect(labelGroup).toBeDefined();
    if (labelGroup) {
      fireEvent.click(labelGroup);
      expect(useViewStore.getState().selectedEntity).toEqual({
        type: 'room',
        id: 'label-room-test',
      });
    }
  });

  it('supports minimal label mode', () => {
    useViewStore.getState().setRoomLabelMode('minimal');

    const { container } = render(
      <svg>
        <RoomLabelsLayer />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('LAB-99 • 300 SF'))).toBe(true);
  });
});
