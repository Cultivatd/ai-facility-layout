import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StructuralInspector } from './StructuralInspector';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('StructuralInspector component', () => {
  beforeEach(() => {
    useViewStore.getState().setSelectedEntity(null);
    useLayoutStore.getState().addStructural({
      id: 'inspect-struct-test',
      name: 'Steel Column W10x49',
      type: 'steel-column',
      x: 20,
      y: 20,
      width: 1,
      height: 1,
      isExisting: true,
      notes: 'Load-bearing column grid line B-2',
    });
  });

  it('renders structural element properties and input fields', () => {
    render(<StructuralInspector structuralId="inspect-struct-test" />);

    expect(screen.getByDisplayValue('Steel Column W10x49')).toBeDefined();
    expect(screen.getByDisplayValue('Load-bearing column grid line B-2')).toBeDefined();
  });

  it('updates name and structural type on change', () => {
    render(<StructuralInspector structuralId="inspect-struct-test" />);

    const nameInput = screen.getByDisplayValue('Steel Column W10x49');
    fireEvent.change(nameInput, { target: { value: 'Reinforced Column W12' } });

    expect(
      useLayoutStore.getState().layout.structuralElements.find((s) => s.id === 'inspect-struct-test')?.name
    ).toBe('Reinforced Column W12');

    const typeSelect = screen.getByDisplayValue('Structural Steel Column');
    fireEvent.change(typeSelect, { target: { value: 'dock-leveler-pit' } });

    expect(
      useLayoutStore.getState().layout.structuralElements.find((s) => s.id === 'inspect-struct-test')?.type
    ).toBe('dock-leveler-pit');
  });

  it('updates dimensions and notes on input', () => {
    render(<StructuralInspector structuralId="inspect-struct-test" />);

    const notesArea = screen.getByDisplayValue('Load-bearing column grid line B-2');
    fireEvent.change(notesArea, { target: { value: 'Updated structural notes' } });

    expect(
      useLayoutStore.getState().layout.structuralElements.find((s) => s.id === 'inspect-struct-test')?.notes
    ).toBe('Updated structural notes');
  });

  it('deletes structural element and resets selected entity on delete button click', () => {
    useViewStore.getState().setSelectedEntity({ type: 'structural', id: 'inspect-struct-test' });

    render(<StructuralInspector structuralId="inspect-struct-test" />);

    const deleteBtn = screen.getByTitle('Delete Structural Element');
    fireEvent.click(deleteBtn);

    expect(
      useLayoutStore.getState().layout.structuralElements.find((s) => s.id === 'inspect-struct-test')
    ).toBeUndefined();
    expect(useViewStore.getState().selectedEntity).toBeNull();
  });

  it('renders null when element does not exist', () => {
    const { container } = render(<StructuralInspector structuralId="non-existent" />);
    expect(container.firstChild).toBeNull();
  });
});
