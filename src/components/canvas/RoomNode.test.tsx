import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { RoomNode } from './RoomNode';
import { useLayoutStore } from '../../store/layoutStore';

describe('RoomNode component', () => {
  beforeEach(() => {
    useLayoutStore.getState().addRoom({
      id: 'test-node-room',
      name: 'Clean Room Test',
      code: 'CLN-TEST',
      category: 'cleanroom',
      x: 10,
      y: 10,
      width: 20,
      height: 15,
      wallHeight: 12,
      expandableSides: ['west', 'south'],
    });
  });

  it('renders room rectangle and expandable modular wall indicators', () => {
    const { container } = render(
      <svg>
        <RoomNode roomId="test-node-room" />
      </svg>
    );

    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('MODULAR EXPANDABLE WALL'))).toBe(true);
    expect(texts.some((t) => t?.includes('MODULAR / NON-LOAD-BEARING'))).toBe(true);
  });

  it('renders nothing for non-existent room ID', () => {
    const { container } = render(
      <svg>
        <RoomNode roomId="non-existent-room-id" />
      </svg>
    );

    expect(container.querySelector('g')).toBeNull();
  });
});
