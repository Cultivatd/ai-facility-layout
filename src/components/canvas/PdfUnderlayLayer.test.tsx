import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { PdfUnderlayLayer } from './PdfUnderlayLayer';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';

describe('PdfUnderlayLayer component', () => {
  beforeEach(() => {
    useViewStore.getState().setShowPdfUnderlay(true);
    useViewStore.getState().setPdfUnderlayMode('full');
    useViewStore.getState().setPdfUnderlayOpacity(0.75);
    useLayoutStore.getState().replaceLayout({
      ...useLayoutStore.getState().layout,
      pdfCalibration: {
        fullImageUrl: '/test-underlay.png',
        lineworkDarkUrl: '/test-linework.png',
        lineworkLightUrl: '/test-underlay.png',
        originPxX: 100,
        originPxY: 50,
        pixelsPerFoot: 10,
        imageWidthPx: 1000,
        imageHeightPx: 1500,
      },
    }, false);
  });

  it('renders SVG image element with calibrated coordinates and opacity', () => {
    const { container } = render(
      <svg>
        <PdfUnderlayLayer />
      </svg>
    );

    const image = container.querySelector('image');
    expect(image).toBeDefined();
    expect(image?.getAttribute('href')).toBe('/test-underlay.png');

    const g = container.querySelector('g');
    expect(g?.getAttribute('opacity')).toBe('0.75');
  });

  it('renders nothing when showPdfUnderlay is toggled false', () => {
    useViewStore.getState().setShowPdfUnderlay(false);

    const { container } = render(
      <svg>
        <PdfUnderlayLayer />
      </svg>
    );

    expect(container.querySelector('image')).toBeNull();
  });
});
