import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TitleBlockOverlay } from './TitleBlockOverlay';
import { useViewStore } from '../../store/viewStore';

describe('TitleBlockOverlay component', () => {
  beforeEach(() => {
    useViewStore.getState().setShowTitleBlock(true);
  });

  it('renders architectural sheet title and graphic scale bar', () => {
    const { container } = render(
      <svg>
        <TitleBlockOverlay />
      </svg>
    );

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

    expect(texts.some((t) => t?.includes('SHEET'))).toBe(true);
    expect(texts.some((t) => t?.includes('NORTH'))).toBe(true);
    expect(texts.some((t) => t?.includes('15 FT'))).toBe(true);
  });

  it('renders nothing when showTitleBlock is toggled off', () => {
    useViewStore.getState().setShowTitleBlock(false);

    const { container } = render(
      <svg>
        <TitleBlockOverlay />
      </svg>
    );

    expect(container.querySelector('g')).toBeNull();
  });
});
