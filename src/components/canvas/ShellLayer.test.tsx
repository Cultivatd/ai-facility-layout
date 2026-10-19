import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ShellLayer } from './ShellLayer';

describe('ShellLayer component', () => {
  it('renders SVG shell perimeter polygon and clipped grid patterns', () => {
    const { container } = render(
      <svg>
        <ShellLayer />
      </svg>
    );

    const polygon = container.querySelector('polygon');
    expect(polygon).toBeDefined();

    const defs = container.querySelector('defs');
    expect(defs).toBeDefined();

    const patterns = container.querySelectorAll('pattern');
    expect(patterns.length).toBeGreaterThan(0);
  });
});
