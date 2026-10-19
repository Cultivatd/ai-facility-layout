import { describe, it, expect } from 'vitest';
import {
  DOMAIN_MODULES,
  ROOM_QUICK_TEMPLATES,
  EQUIPMENT_QUICK_TEMPLATES,
} from './domain-modules';

describe('domain-modules', () => {
  it('defines the three core pluggable modules', () => {
    const moduleIds = DOMAIN_MODULES.map((m) => m.id);
    expect(moduleIds).toContain('cultivation');
    expect(moduleIds).toContain('edible-cleanroom');
    expect(moduleIds).toContain('security-compliance');
  });

  it('provides complete metadata and feature lists for each module', () => {
    for (const mod of DOMAIN_MODULES) {
      expect(mod.id).toBeTypeOf('string');
      expect(mod.name).toBeTypeOf('string');
      expect(mod.shortLabel).toBeTypeOf('string');
      expect(mod.badgeColor).toBeTypeOf('string');
      expect(mod.description).toBeTypeOf('string');
      expect(mod.features.length).toBeGreaterThan(0);
      expect(Array.isArray(mod.roomCategories)).toBe(true);
      expect(mod.equipmentCategories.length).toBeGreaterThan(0);
    }
  });

  it('defines valid room quick-templates with positive dimensions', () => {
    expect(ROOM_QUICK_TEMPLATES.length).toBeGreaterThan(0);
    for (const tmpl of ROOM_QUICK_TEMPLATES) {
      expect(tmpl.id).toBeTypeOf('string');
      expect(tmpl.label).toBeTypeOf('string');
      expect(tmpl.room.name).toBeTypeOf('string');
      expect(tmpl.room.code).toBeTypeOf('string');
      expect(tmpl.room.category).toBeTypeOf('string');
      expect(tmpl.room.width).toBeGreaterThan(0);
      expect(tmpl.room.height).toBeGreaterThan(0);
      expect(tmpl.room.wallHeight).toBeGreaterThan(0);
    }
  });

  it('defines valid equipment quick-templates with positive dimensions and default upright rotation', () => {
    expect(EQUIPMENT_QUICK_TEMPLATES.length).toBeGreaterThan(0);
    for (const tmpl of EQUIPMENT_QUICK_TEMPLATES) {
      expect(tmpl.id).toBeTypeOf('string');
      expect(tmpl.label).toBeTypeOf('string');
      expect(tmpl.equipment.name).toBeTypeOf('string');
      expect(tmpl.equipment.code).toBeTypeOf('string');
      expect(tmpl.equipment.category).toBeTypeOf('string');
      expect(tmpl.equipment.width).toBeGreaterThan(0);
      expect(tmpl.equipment.height).toBeGreaterThan(0);

      // Non-camera equipment should not be upside-down
      if (tmpl.equipment.category !== 'security-camera') {
        expect(tmpl.equipment.rotation ?? 0).not.toBe(180);
      }
    }
  });
});
