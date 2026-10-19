import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ShellDimensionsLayer } from './ShellDimensionsLayer';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('ShellDimensionsLayer component', () => {
  beforeEach(() => {
    useViewStore.getState().setShowShellDimensions(true);
    useLayoutStore.getState().replaceLayout({
      ...useLayoutStore.getState().layout,
      dimensions: [
        {
          id: 'dim-test-north',
          label: `60'-0"`,
          orientation: 'horizontal',
          x1: 0,
          y1: -4,
          x2: 60,
          y2: -4,
          offsetFt: 4,
        },
      ],
    }, false);
  });

  it('renders dimension lines, witness ticks, and architectural callout', () => {
    const { container } = render(
      <svg>
        <ShellDimensionsLayer />
      </svg>
    );

    const text = container.querySelector('text');
    expect(text?.textContent).toBe(`60'-0"`);

    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('hides dimensions when showShellDimensions is toggled false', () => {
    useViewStore.getState().setShowShellDimensions(false);

    const { container } = render(
      <svg>
        <ShellDimensionsLayer />
      </svg>
    );

    expect(container.querySelector('g')).toBeNull();
  });
});
