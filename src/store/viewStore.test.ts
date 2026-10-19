import { describe, it, expect, beforeEach } from 'vitest';
import { useViewStore } from './viewStore';

describe('viewStore', () => {
  beforeEach(() => {
    useViewStore.getState().setDisciplineView('overview');
    useViewStore.getState().setTheme('investor-color');
    useViewStore.getState().setActiveTool('select');
  });

  it('switches discipline views across all 6 engineering sheets', () => {
    const views = [
      'overview',
      'room-usage',
      'equipment',
      'security',
      'evac-safety',
      'contractor-mep',
    ] as const;

    for (const v of views) {
      useViewStore.getState().setDisciplineView(v);
      expect(useViewStore.getState().disciplineView).toBe(v);
    }
  });

  it('switches presentation themes', () => {
    useViewStore.getState().setTheme('dark-cad');
    expect(useViewStore.getState().theme).toBe('dark-cad');

    useViewStore.getState().setTheme('contractor-blueprint');
    expect(useViewStore.getState().theme).toBe('contractor-blueprint');
  });

  it('switches active tools and snap grids', () => {
    useViewStore.getState().setActiveTool('add-room');
    expect(useViewStore.getState().activeTool).toBe('add-room');

    useViewStore.getState().setSnapStepFt(0.5);
    expect(useViewStore.getState().snapStepFt).toBe(0.5);
  });

  it('toggles layer visibility flags', () => {
    useViewStore.getState().setShowClearanceZones(true);
    expect(useViewStore.getState().showClearanceZones).toBe(true);

    useViewStore.getState().setShowPdfUnderlay(true);
    expect(useViewStore.getState().showPdfUnderlay).toBe(true);

    useViewStore.getState().setLockExistingElements(true);
    expect(useViewStore.getState().lockExistingElements).toBe(true);
  });
});
