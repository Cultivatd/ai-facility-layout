import { describe, it, expect } from 'vitest';
import { DISCIPLINE_VIEWS } from './discipline-views';

describe('discipline-views', () => {
  it('defines all 6 architectural discipline views', () => {
    expect(DISCIPLINE_VIEWS.length).toBe(6);
    const viewIds = DISCIPLINE_VIEWS.map((v) => v.id);
    expect(viewIds).toEqual([
      'overview',
      'room-usage',
      'equipment',
      'security',
      'evac-safety',
      'contractor-mep',
    ]);
  });

  it('assigns unique sheet codes and hotkey shortcuts 1-6', () => {
    const codes = new Set<string>();
    const shortcuts = new Set<string>();

    for (const view of DISCIPLINE_VIEWS) {
      expect(codes.has(view.sheetCode)).toBe(false);
      expect(shortcuts.has(view.shortcut)).toBe(false);
      codes.add(view.sheetCode);
      shortcuts.add(view.shortcut);

      expect(view.sheetTitle).toContain(view.sheetCode);
      expect(view.shortLabel).toBeTypeOf('string');
      expect(view.subtitle).toBeTypeOf('string');
      expect(view.accentClass).toBeTypeOf('string');
    }

    expect(Array.from(shortcuts).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('marks security view as requiring the security-compliance module', () => {
    const securityView = DISCIPLINE_VIEWS.find((v) => v.id === 'security');
    expect(securityView?.requiredModule).toBe('security-compliance');
  });
});
