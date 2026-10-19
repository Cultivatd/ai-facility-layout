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
  const transformed = pt.matrixTransform(ctm.inverse());
  return {
    xFt: transformed.x / FT,
    yFt: transformed.y / FT,
  };
}
