import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportActions } from './ExportActions';

describe('ExportActions component', () => {
  it('renders Export Plans button and toggles export menu', () => {
    render(<ExportActions />);

    const exportBtn = screen.getByText('Export');
    expect(exportBtn).toBeDefined();

    // Open dropdown
    fireEvent.click(exportBtn);

    expect(screen.getByText(/Vector SVG Drawing/)).toBeDefined();
    expect(screen.getByText(/High-Res PNG Render/)).toBeDefined();
    expect(screen.getByText(/Print \/ Save Vector PDF/)).toBeDefined();
    expect(screen.getByText(/Download JSON Snapshot/)).toBeDefined();
  });
});
