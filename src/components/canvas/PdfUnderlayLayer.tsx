import React from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { computeShellBounds, FT } from './canvasConstants';

export const PdfUnderlayLayer: React.FC = () => {
  const pdfCalibration = useLayoutStore((s) => s.layout.pdfCalibration);
  const shellPerimeter = useLayoutStore((s) => s.layout.shellPerimeter);
  const showPdfUnderlay = useViewStore((s) => s.showPdfUnderlay);
  const pdfUnderlayOpacity = useViewStore((s) => s.pdfUnderlayOpacity);
  const pdfUnderlayMode = useViewStore((s) => s.pdfUnderlayMode);
  const theme = useViewStore((s) => s.theme);

  if (!showPdfUnderlay || !pdfCalibration || !pdfCalibration.pixelsPerFoot) {
    return null;
  }

  const {
    originPxX,
    originPxY,
    pixelsPerFoot,
    imageWidthPx,
    imageHeightPx,
    fullImageUrl,
    lineworkDarkUrl,
    lineworkLightUrl,
  } = pdfCalibration;

  const href =
    pdfUnderlayMode === 'full'
      ? fullImageUrl
      : theme === 'dark-cad'
      ? lineworkLightUrl
      : lineworkDarkUrl;

  if (!href) return null;

  const xSvg = (-originPxX / pixelsPerFoot) * FT;
  const ySvg = (-originPxY / pixelsPerFoot) * FT;
  const widthSvg = (imageWidthPx / pixelsPerFoot) * FT;
  const heightSvg = (imageHeightPx / pixelsPerFoot) * FT;

  const shellBounds = computeShellBounds(shellPerimeter);

  return (
    <g className="pointer-events-none select-none" opacity={pdfUnderlayOpacity}>
      <defs>
        <clipPath id="facility-floorplan-clip">
          <rect
            x={(shellBounds.minXFt - 3) * FT}
            y={(shellBounds.minYFt - 4.2) * FT}
            width={(shellBounds.widthFt + 6) * FT}
            height={(shellBounds.heightFt + 7.5) * FT}
          />
        </clipPath>
      </defs>
      <image
        href={href}
        x={xSvg}
        y={ySvg}
        width={widthSvg}
        height={heightSvg}
        preserveAspectRatio="none"
        clipPath="url(#facility-floorplan-clip)"
      />
    </g>
  );
};
