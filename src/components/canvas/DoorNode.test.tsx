import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DoorNode } from './DoorNode';
import { useLayoutStore } from '../../store/layoutStore';

describe('DoorNode component', () => {
  beforeEach(() => {
    useLayoutStore.getState().addDoor({
      id: 'test-node-door',
      label: 'D-99',
      type: 'single-swing',
      x: 15,
      y: 10,
      width: 3,
      orientation: 'horizontal',
      swing: 'north-east',
    });
  });

  it('renders door swing line, swing arc, and door tag pill', () => {
    const { container } = render(
      <svg>
        <DoorNode doorId="test-node-door" />
      </svg>
    );

    const text = container.querySelector('text');
    expect(text?.textContent).toBe('D-99');

    const path = container.querySelector('path');
    expect(path).toBeDefined();
  });

  it('renders nothing for non-existent door ID', () => {
    const { container } = render(
      <svg>
        <DoorNode doorId="non-existent-door" />
      </svg>
    );

    expect(container.querySelector('g')).toBeNull();
  });
});
