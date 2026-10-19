import { create } from 'zustand';
import {
  ActiveTool,
  DisciplineView,
  PresentationTheme,
  RoomLabelMode,
  SelectedEntity,
} from '../types/facility';

export type ViewMode = '2d' | 'split' | '3d';
export type UnderlayMode = 'linework' | 'full';

interface ViewStoreState {
  theme: PresentationTheme;
  viewMode: ViewMode;
  disciplineView: DisciplineView;
  roomLabelMode: RoomLabelMode;
  activeTool: ActiveTool;
  selectedEntity: SelectedEntity;
  lockExistingElements: boolean;
  showPdfUnderlay: boolean;
  pdfUnderlayOpacity: number;
  pdfUnderlayMode: UnderlayMode;
  showGrid: boolean;
  snapStepFt: number;
  showShellDimensions: boolean;
  showRoomDimensions: boolean;
  showClearanceZones: boolean;
  showTitleBlock: boolean;
  showExistingWallLegend: boolean;
  zoom: number;
  panX: number;
  panY: number;
  setTheme: (theme: PresentationTheme) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setDisciplineView: (view: DisciplineView) => void;
  setRoomLabelMode: (mode: RoomLabelMode) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setSelectedEntity: (entity: SelectedEntity) => void;
  setLockExistingElements: (lock: boolean) => void;
  setShowPdfUnderlay: (show: boolean) => void;
  setPdfUnderlayOpacity: (opacity: number) => void;
  setPdfUnderlayMode: (mode: UnderlayMode) => void;
  setShowGrid: (show: boolean) => void;
  setSnapStepFt: (step: number) => void;
  setShowShellDimensions: (show: boolean) => void;
  setShowRoomDimensions: (show: boolean) => void;
  setShowClearanceZones: (show: boolean) => void;
  setShowTitleBlock: (show: boolean) => void;
  setShowExistingWallLegend: (show: boolean) => void;
  setViewport: (zoom: number, panX: number, panY: number) => void;
  resetViewport: () => void;
}

export const useViewStore = create<ViewStoreState>((set) => ({
  theme: 'investor-color',
  viewMode: '2d',
  disciplineView: 'overview',
  roomLabelMode: 'auto',
  activeTool: 'select',
  selectedEntity: null,
  lockExistingElements: true,
  showPdfUnderlay: true,
  pdfUnderlayOpacity: 0.35,
  pdfUnderlayMode: 'linework',
  showGrid: true,
  snapStepFt: 0.5,
  showShellDimensions: true,
  showRoomDimensions: true,
  showClearanceZones: true,
  showTitleBlock: true,
  showExistingWallLegend: true,
  zoom: 1,
  panX: 0,
  panY: 0,

  setTheme: (theme) => set({ theme }),
  setViewMode: (viewMode) => set({ viewMode }),
  setDisciplineView: (disciplineView) => set({ disciplineView }),
  setRoomLabelMode: (roomLabelMode) => set({ roomLabelMode }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setSelectedEntity: (selectedEntity) => set({ selectedEntity }),
  setLockExistingElements: (lockExistingElements) => set({ lockExistingElements }),
  setShowPdfUnderlay: (showPdfUnderlay) => set({ showPdfUnderlay }),
  setPdfUnderlayOpacity: (pdfUnderlayOpacity) => set({ pdfUnderlayOpacity }),
  setPdfUnderlayMode: (pdfUnderlayMode) => set({ pdfUnderlayMode }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setSnapStepFt: (snapStepFt) => set({ snapStepFt }),
  setShowShellDimensions: (showShellDimensions) => set({ showShellDimensions }),
  setShowRoomDimensions: (showRoomDimensions) => set({ showRoomDimensions }),
  setShowClearanceZones: (showClearanceZones) => set({ showClearanceZones }),
  setShowTitleBlock: (showTitleBlock) => set({ showTitleBlock }),
  setShowExistingWallLegend: (showExistingWallLegend) => set({ showExistingWallLegend }),
  setViewport: (zoom, panX, panY) => set({ zoom, panX, panY }),
  resetViewport: () => set({ zoom: 1, panX: 0, panY: 0 }),
}));
