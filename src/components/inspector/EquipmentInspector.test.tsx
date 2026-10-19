import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EquipmentInspector } from './EquipmentInspector';
import { useLayoutStore } from '../../store/layoutStore';

describe('EquipmentInspector component', () => {
  beforeEach(() => {
    useLayoutStore.getState().addEquipment({
      id: 'inspect-eq-test',
      name: 'Laser Cutting Workstation',
      code: 'LC-1',
      category: 'machinery',
      x: 10,
      y: 10,
      width: 8,
      height: 6,
      elevationHeight: 5,
      rotation: 0,
      clearanceFt: 2.5,
    });
  });

  it('renders equipment properties, dimensions, and rotation preset buttons', () => {
    render(<EquipmentInspector equipmentId="inspect-eq-test" />);

    expect(screen.getByDisplayValue('Laser Cutting Workstation')).toBeDefined();
    expect(screen.getByDisplayValue('LC-1')).toBeDefined();
    expect(screen.getByText('0°')).toBeDefined();
    expect(screen.getByText('+45°')).toBeDefined();
  });

  it('updates rotation angle on angle button click', () => {
    render(<EquipmentInspector equipmentId="inspect-eq-test" />);

    const rot45Btn = screen.getByText('+45°');
    fireEvent.click(rot45Btn);

    expect(
      useLayoutStore.getState().layout.equipment.find((e) => e.id === 'inspect-eq-test')?.rotation
    ).toBe(45);
  });

  it('deletes equipment on delete button click', () => {
    render(<EquipmentInspector equipmentId="inspect-eq-test" />);

    const deleteBtn = screen.getByTitle('Delete Equipment');
    fireEvent.click(deleteBtn);

    expect(
      useLayoutStore.getState().layout.equipment.find((e) => e.id === 'inspect-eq-test')
    ).toBeUndefined();
  });

  it('renders nothing for non-existent equipment', () => {
    const { container } = render(<EquipmentInspector equipmentId="non-existent" />);
    expect(container.firstChild).toBeNull();
  });
});
