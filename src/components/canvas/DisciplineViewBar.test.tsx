import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisciplineViewBar } from './DisciplineViewBar';
import { useViewStore } from '../../store/viewStore';

describe('DisciplineViewBar component', () => {
  beforeEach(() => {
    useViewStore.getState().setDisciplineView('overview');
  });

  it('renders all 6 discipline sheet buttons', () => {
    render(<DisciplineViewBar />);

    expect(screen.getByText('Master Plan')).toBeDefined();
    expect(screen.getByText('Room Usage')).toBeDefined();
    expect(screen.getByText('Equipment')).toBeDefined();
    expect(screen.getByText('Security & L.A.A.')).toBeDefined();
    expect(screen.getByText('Evac & Safety')).toBeDefined();
    expect(screen.getByText('MEP & Utilities')).toBeDefined();
  });

  it('switches the active discipline view on button click', () => {
    render(<DisciplineViewBar />);

    const eqButton = screen.getByText('Equipment');
    fireEvent.click(eqButton);

    expect(useViewStore.getState().disciplineView).toBe('equipment');
  });

  it('switches room label modes', () => {
    render(<DisciplineViewBar />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'full' } });

    expect(useViewStore.getState().roomLabelMode).toBe('full');
  });
});
