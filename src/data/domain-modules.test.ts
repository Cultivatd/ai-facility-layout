import { describe, it, expect, beforeEach } from 'vitest';
import {
  DOMAIN_MODULES,
  ROOM_QUICK_TEMPLATES,
  EQUIPMENT_QUICK_TEMPLATES,
  defineDomainModule,
  registerDomainModule,
  unregisterDomainModule,
  getDomainModule,
  getAllDomainModules,
  getAvailableRoomTemplates,
  getAvailableEquipmentTemplates,
  resetModuleRegistry,
} from './domain-modules';
import { getRoomCategoryStyle, ROOM_CATEGORY_STYLES } from '../utils/dimensions';

describe('domain-modules & pluggable module registry', () => {
  beforeEach(() => {
    resetModuleRegistry();
  });

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
      expect(Array.isArray(mod.roomCategories ?? [])).toBe(true);
      expect((mod.equipmentCategories ?? []).length).toBeGreaterThan(0);
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

  it('supports self-contained dynamic module registration with automatic types', () => {
    const customModule = defineDomainModule({
      id: 'cold-storage',
      name: 'Industrial Cold Storage & Blast Freezing',
      shortLabel: 'Cold Storage',
      badgeColor: '#0284c7',
      description: 'Freezers, IMP insulated panels, and refrigeration coils.',
      features: ['Blast Freezer room category', 'Evaporator Fan units'],
      roomTemplates: [
        {
          id: 'tpl-room-freezer',
          label: 'Blast Freezer -20°F (30×20)',
          room: {
            name: 'Blast Freezer -20°F',
            code: 'FRZ-1',
            category: 'cold-storage',
            width: 30,
            height: 20,
            wallHeight: 16,
          },
        },
      ],
      equipmentTemplates: [
        {
          id: 'tpl-eq-evaporator',
          label: 'Ceiling Evaporator Coil (8×4)',
          equipment: {
            name: 'Evaporator Fan Unit',
            code: 'EVAP-1',
            category: 'machinery',
            width: 8,
            height: 4,
            elevationHeight: 3,
            rotation: 0,
          },
        },
      ],
      roomCategoryStyles: {
        'cold-storage': {
          label: 'Cold Storage / Freezer',
          fillInvestor: 'rgba(2, 132, 199, 0.20)',
          strokeInvestor: '#0284c7',
          badgeColor: '#0284c7',
          fill3D: '#0284c7',
          hatchPattern: 'grid',
        },
      },
    });

    registerDomainModule(customModule);

    // Module should now be discoverable in registry and live DOMAIN_MODULES array
    expect(getDomainModule('cold-storage')).toBeDefined();
    expect(getAllDomainModules().some((m) => m.id === 'cold-storage')).toBe(true);
    expect(DOMAIN_MODULES.some((m) => m.id === 'cold-storage')).toBe(true);

    // Templates should be dynamically reflected
    expect(ROOM_QUICK_TEMPLATES.some((t) => t.id === 'tpl-room-freezer')).toBe(true);
    expect(EQUIPMENT_QUICK_TEMPLATES.some((t) => t.id === 'tpl-eq-evaporator')).toBe(true);

    // Module template filtering
    const activeTemplates = getAvailableRoomTemplates(['cold-storage']);
    expect(activeTemplates.some((t) => t.id === 'tpl-room-freezer')).toBe(true);
    const inactiveTemplates = getAvailableRoomTemplates([]);
    expect(inactiveTemplates.some((t) => t.id === 'tpl-room-freezer')).toBe(false);

    // Custom room category styling should resolve automatically
    const style = getRoomCategoryStyle('cold-storage');
    expect(style.label).toBe('Cold Storage / Freezer');
    expect(style.badgeColor).toBe('#0284c7');
    expect(ROOM_CATEGORY_STYLES['cold-storage'].badgeColor).toBe('#0284c7');

    // Clean up
    unregisterDomainModule('cold-storage');
    expect(getDomainModule('cold-storage')).toBeUndefined();
  });

  it('provides a graceful fallback style for completely unknown custom categories', () => {
    const style = getRoomCategoryStyle('superconducting-magnet-bay');
    expect(style).toBeDefined();
    expect(style.label).toBe('Superconducting magnet bay');
    expect(style.fill3D).toBe('#64748b');
  });
});
