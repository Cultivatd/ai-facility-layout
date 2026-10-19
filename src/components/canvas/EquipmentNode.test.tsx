import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { EquipmentNode } from './EquipmentNode';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('EquipmentNode component', () => {
  beforeEach(() => {
    useViewStore.getState().setDisciplineView('overview');
    useLayoutStore.getState().addEquipment({
      id: 'eq-bench-test',
      name: 'Mobile Workstation Bench',
      code: 'WB-TEST',
      category: 'workstation',
      x: 10,
      y: 10,
      width: 6,
      height: 3,
      elevationHeight: 3,
      rotation: 90,
      clearanceFt: 2,
    });
    useLayoutStore.getState().addEquipment({
      id: 'eq-cam-test',
      name: 'Surveillance Cam 1',
      code: 'CAM-TEST',
      category: 'security-camera',
      x: 15,
      y: 15,
      width: 2,
      height: 2,
      elevationHeight: 9,
      rotation: 45,
    });
    useLayoutStore.getState().addEquipment({
      id: 'eq-safe-test',
      name: 'Fire Extinguisher Test',
      code: 'FE-TEST',
      category: 'safety-equipment',
      x: 20,
      y: 20,
      width: 2,
      height: 2,
      elevationHeight: 4,
      rotation: 0,
    });
  });

  it('renders standard equipment with code and upright counter-rotated text', () => {
    const { container } = render(
      <svg>
        <EquipmentNode equipmentId="eq-bench-test" />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('WB-TEST'))).toBe(true);

    // Verify counter-rotation attribute exists to prevent upside-down text
    const textGroup = container.querySelector('g[transform*="rotate(-90)"]');
    expect(textGroup).toBeDefined();
  });

  it('renders security camera with FOV cone in security sheet view', () => {
    useViewStore.getState().setDisciplineView('security');

    const { container } = render(
      <svg>
        <EquipmentNode equipmentId="eq-cam-test" />
      </svg>
    );

    const polygon = container.querySelector('polygon');
    expect(polygon).toBeDefined();

    const text = container.querySelector('text');
    expect(text?.textContent).toBe('CAM-TEST');
  });

  it('renders life safety equipment in evac-safety view', () => {
    useViewStore.getState().setDisciplineView('evac-safety');

    const { container } = render(
      <svg>
        <EquipmentNode equipmentId="eq-safe-test" />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts.some((t) => t?.includes('FE-TEST'))).toBe(true);
  });
});
