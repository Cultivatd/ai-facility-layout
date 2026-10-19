import { FT } from '../components/canvas/canvasConstants';

/**
 * Converts client mouse coordinates into architectural feet (xFt, yFt) inside the main facility SVG.
 */
export function clientToFeetCoords(
  svgElement: SVGSVGElement,
  clientX: number,
  clientY: number
): { xFt: number; yFt: number } {
  const pt = svgElement.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgElement.getScreenCTM();
  if (!ctm) {
    return { xFt: 0, yFt: 0 };
  }
  if (typeof pt.matrixTransform === 'function') {
    const transformed = pt.matrixTransform(ctm.inverse());
    return {
      xFt: transformed.x / FT,
      yFt: transformed.y / FT,
    };
  }
  // Fallback for headless / simulated DOM test environments
  const inv = ctm.inverse ? ctm.inverse() : ctm;
  const x = (inv.a ?? 1) * clientX + (inv.c ?? 0) * clientY + (inv.e ?? 0);
  const y = (inv.b ?? 0) * clientX + (inv.d ?? 1) * clientY + (inv.f ?? 0);
  return {
    xFt: x / FT,
    yFt: y / FT,
  };
}
