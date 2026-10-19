import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Printer,
  FileJson,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { useViewStore } from '../../store/viewStore';
import { computeSheetBounds } from '../canvas/canvasConstants';
import { THEME_PALETTES } from '../../utils/dimensions';

function slugifyName(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'facility-layout'
  );
}

async function inlineSvgImages(svgClone: SVGSVGElement): Promise<void> {
  const images = Array.from(svgClone.querySelectorAll('image'));
  for (const imgEl of images) {
    const href = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href');
    if (!href || href.startsWith('data:')) continue;
    try {
      const response = await fetch(href);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
      });
      imgEl.setAttribute('href', dataUrl);
    } catch {
      // Ignore image inline failure
    }
  }
}

export const ExportActions: React.FC = () => {
  const layout = useLayoutStore((s) => s.layout);
  const theme = useViewStore((s) => s.theme);
  const showExistingWallLegend = useViewStore((s) => s.showExistingWallLegend);
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const sheetBounds = computeSheetBounds(
    layout.shellPerimeter,
    showExistingWallLegend
  );
  const filePrefix = slugifyName(
    layout.metadata.suiteName || layout.metadata.projectName
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const prepareClonedSvg = async (): Promise<SVGSVGElement | null> => {
    const origSvg = document.getElementById(
      'facility-layout-svg'
    ) as SVGSVGElement | null;
    if (!origSvg) return null;

    const clone = origSvg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute(
      'viewBox',
      `${sheetBounds.minX} ${sheetBounds.minY} ${sheetBounds.width} ${sheetBounds.height}`
    );
    clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    clone.setAttribute('width', String(sheetBounds.width * 3));
    clone.setAttribute('height', String(sheetBounds.height * 3));
    clone.removeAttribute('class');
    clone.style.backgroundColor = THEME_PALETTES[theme].sheetBg;
    await inlineSvgImages(clone);
    return clone;
  };

  const handleExportSvg = async () => {
    setOpen(false);
    const clone = await prepareClonedSvg();
    if (!clone) return;
    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filePrefix}-layout-${theme}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPng = async () => {
    setOpen(false);
    setExporting(true);
    try {
      const clone = await prepareClonedSvg();
      if (!clone) return;
      const svgString = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      const scale = 3.5;
      const outW = Math.round(sheetBounds.width * scale);
      const outH = Math.round(sheetBounds.height * scale);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = THEME_PALETTES[theme].sheetBg;
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(img, 0, 0, outW, outH);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${filePrefix}-layout-${theme}-highres.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    setOpen(false);
    const jsonStr = JSON.stringify(layout, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filePrefix}-facility-layout.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = async () => {
    setOpen(false);
    setExporting(true);
    try {
      const clone = await prepareClonedSvg();
      if (!clone) {
        window.print();
        return;
      }
      clone.setAttribute('width', '100%');
      clone.setAttribute('height', '100%');
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.maxWidth = '100%';
      clone.style.maxHeight = '100%';
      clone.style.display = 'block';

      const svgMarkup = new XMLSerializer().serializeToString(clone);
      const sheetBg = THEME_PALETTES[theme].sheetBg;

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc || !iframe.contentWindow) {
        document.body.removeChild(iframe);
        window.print();
        return;
      }

      const isLandscape = sheetBounds.width >= sheetBounds.height;
      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${layout.metadata.projectName} — ${layout.metadata.suiteName}</title>
    <style>
      @page {
        size: ${isLandscape ? 'landscape' : 'portrait'};
        margin: 0.25in;
      }
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: ${sheetBg};
        overflow: hidden;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      svg {
        width: 100%;
        height: 98vh;
        max-width: 100vw;
        max-height: 98vh;
      }
    </style>
  </head>
  <body>
    ${svgMarkup}
  </body>
</html>`);
      doc.close();

      await new Promise((r) => setTimeout(r, 250));
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{exporting ? 'Rendering...' : 'Export'}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs z-50 space-y-0.5">
          <button
            onClick={handleExportPng}
            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-start gap-2.5 transition"
          >
            <ImageIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white">High-Res PNG Render</div>
              <div className="text-[11px] text-slate-400">
                300 DPI presentation sheet ({theme})
              </div>
            </div>
          </button>

          <button
            onClick={handlePrintPdf}
            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-start gap-2.5 transition"
          >
            <Printer className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white">Print / Save Vector PDF</div>
              <div className="text-[11px] text-slate-400">
                Full-bleed architectural sheet with title block
              </div>
            </div>
          </button>

          <button
            onClick={handleExportSvg}
            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-start gap-2.5 transition"
          >
            <Download className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white">Vector SVG Drawing</div>
              <div className="text-[11px] text-slate-400">
                Scalable vector file for CAD / Illustrator
              </div>
            </div>
          </button>

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={handleExportJson}
            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-start gap-2.5 transition"
          >
            <FileJson className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white">Download JSON Snapshot</div>
              <div className="text-[11px] text-slate-400">
                Portable copy of facility-layout.json
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
