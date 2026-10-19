import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DisciplineOverlayLayer } from './DisciplineOverlayLayer';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('DisciplineOverlayLayer component', () => {
  beforeEach(() => {
    useLayoutStore.getState().setRectangularShell(60, 100);
    useLayoutStore.getState().replaceLayout({
      ...useLayoutStore.getState().layout,
      doors: [{
        id: 'egress-door-test',
        label: 'D-EXIT',
        type: 'single-swing',
        x: 30,
        y: 0,
        width: 3,
        orientation: 'horizontal',
        swing: 'north-east',
        isExteriorEgress: true,
      }],
      rooms: [{
        id: 'mep-room-test',
        name: 'Clean Room MEP',
        code: 'CLN-MEP',
        category: 'cleanroom',
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        wallHeight: 12,
        pressureDifferential: '+0.05" WC POS. PRESSURE HEPA',
      }],
    }, false);
  });

  it('renders egress travel lines and EXIT signs in evac-safety view', () => {
    useViewStore.getState().setDisciplineView('evac-safety');

    const { container } = render(
      <svg>
        <DisciplineOverlayLayer />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('EXIT'))).toBe(true);

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('renders room pressure differential tags in contractor-mep view', () => {
    useViewStore.getState().setDisciplineView('contractor-mep');

    const { container } = render(
      <svg>
        <DisciplineOverlayLayer />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('+0.05" WC POS. PRESSURE HEPA'))).toBe(true);
  });

  it('renders null in overview master plan view', () => {
    useViewStore.getState().setDisciplineView('overview');

    const { container } = render(
      <svg>
        <DisciplineOverlayLayer />
      </svg>
    );

    expect(container.querySelector('g')).toBeNull();
  });
});
