import { describe, it, expect, vi } from 'vitest';
import { clientToFeetCoords } from './svgMouse';
import { FT } from '../components/canvas/canvasConstants';

describe('clientToFeetCoords', () => {
  it('converts client coordinates to architectural feet via SVG transform matrix', () => {
    const mockPoint = {
      x: 0,
      y: 0,
      matrixTransform: vi.fn().mockImplementation((matrix: DOMMatrix) => {
        return { x: 200, y: 350 };
      }),
    };

    const mockMatrix = {
      inverse: vi.fn().mockReturnValue({}),
    } as unknown as DOMMatrix;

    const mockSvg = {
      createSVGPoint: vi.fn().mockReturnValue(mockPoint),
      getScreenCTM: vi.fn().mockReturnValue(mockMatrix),
    } as unknown as SVGSVGElement;

    const coords = clientToFeetCoords(mockSvg, 100, 150);

    expect(coords.xFt).toBe(200 / FT); // 20 ft
    expect(coords.yFt).toBe(350 / FT); // 35 ft
    expect(mockSvg.createSVGPoint).toHaveBeenCalled();
    expect(mockSvg.getScreenCTM).toHaveBeenCalled();
  });

  it('falls back to (0, 0) if getScreenCTM returns null', () => {
    const mockPoint = { x: 0, y: 0 };
    const mockSvg = {
      createSVGPoint: vi.fn().mockReturnValue(mockPoint),
      getScreenCTM: vi.fn().mockReturnValue(null),
    } as unknown as SVGSVGElement;

    const coords = clientToFeetCoords(mockSvg, 100, 150);
    expect(coords).toEqual({ xFt: 0, yFt: 0 });
  });
});
