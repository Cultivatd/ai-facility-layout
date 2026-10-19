import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { StructuralNode } from './StructuralNode';
import { useLayoutStore } from '../../store/layoutStore';

describe('StructuralNode component', () => {
  beforeEach(() => {
    useLayoutStore.getState().addStructural({
      id: 'struct-col-test',
      name: 'Steel Column C1',
      type: 'steel-column',
      x: 15,
      y: 15,
      width: 1.5,
      height: 1.5,
    });
    useLayoutStore.getState().addStructural({
      id: 'struct-dock-test',
      name: 'Hydraulic Dock Leveler Pit',
      type: 'dock-leveler-pit',
      x: 20,
      y: 20,
      width: 7,
      height: 8,
    });
  });

  it('renders steel column with circle and COL annotation', () => {
    const { container } = render(
      <svg>
        <StructuralNode structuralId="struct-col-test" />
      </svg>
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);

    const text = container.querySelector('text');
    expect(text?.textContent).toBe('COL');
  });

  it('renders dock leveler pit with cross lines and DOCK PIT tag', () => {
    const { container } = render(
      <svg>
        <StructuralNode structuralId="struct-dock-test" />
      </svg>
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeDefined();

    const text = container.querySelector('text');
    expect(text?.textContent).toBe('DOCK PIT');
  });

  it('renders nothing for non-existent structural element', () => {
    const { container } = render(
      <svg>
        <StructuralNode structuralId="non-existent" />
      </svg>
    );

    expect(container.querySelector('g')).toBeNull();
  });
});
