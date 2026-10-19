import { CORE_EQUIPMENT_TEMPLATES, CORE_ROOM_TEMPLATES } from './builtin/core-templates';
import { cultivationModule } from './builtin/cultivation';
import { edibleCleanroomModule } from './builtin/edible-cleanroom';
import { securityComplianceModule } from './builtin/security-compliance';
import { coldStorageModule } from './builtin/cold-storage';
import { logisticsWarehouseModule } from './builtin/logistics-warehouse';
import { biotechLabModule } from './builtin/biotech-lab';
import {
  DomainModuleDescriptor,
  EquipmentQuickTemplate,
  ModuleCategoryStyle,
  RoomQuickTemplate,
} from './types';

// Map of registered modules (starts with built-ins)
const moduleRegistry = new Map<string, DomainModuleDescriptor>();

function initBuiltins() {
  moduleRegistry.clear();
  registerDomainModule(cultivationModule);
  registerDomainModule(edibleCleanroomModule);
  registerDomainModule(securityComplianceModule);
  registerDomainModule(coldStorageModule);
  registerDomainModule(logisticsWarehouseModule);
  registerDomainModule(biotechLabModule);
}

/**
 * Registers a self-contained domain module in the studio.
 * Can be called at any time (startup or dynamically by a plugin/extension).
 */
export function registerDomainModule(mod: DomainModuleDescriptor): void {
  // Ensure all module templates are tagged with the module's id
  const roomTemplates = mod.roomTemplates?.map((t) => ({
    ...t,
    moduleId: t.moduleId ?? mod.id,
  }));
  const equipmentTemplates = mod.equipmentTemplates?.map((t) => ({
    ...t,
    moduleId: t.moduleId ?? mod.id,
  }));

  moduleRegistry.set(mod.id, {
    ...mod,
    roomTemplates,
    equipmentTemplates,
  });
}

/**
 * Unregisters a domain module by ID.
 */
export function unregisterDomainModule(id: string): void {
  moduleRegistry.delete(id);
}

/**
 * Gets a registered domain module by ID.
 */
export function getDomainModule(id: string): DomainModuleDescriptor | undefined {
  return moduleRegistry.get(id);
}

/**
 * Returns all currently registered domain modules.
 */
export function getAllDomainModules(): DomainModuleDescriptor[] {
  return Array.from(moduleRegistry.values());
}

/**
 * Returns all room templates (core templates + all registered module templates).
 */
export function getAllRoomTemplates(): RoomQuickTemplate[] {
  const templates: RoomQuickTemplate[] = [...CORE_ROOM_TEMPLATES];
  for (const mod of moduleRegistry.values()) {
    if (mod.roomTemplates) {
      templates.push(...mod.roomTemplates);
    }
  }
  return templates;
}

/**
 * Returns all equipment templates (core templates + all registered module templates).
 */
export function getAllEquipmentTemplates(): EquipmentQuickTemplate[] {
  const templates: EquipmentQuickTemplate[] = [...CORE_EQUIPMENT_TEMPLATES];
  for (const mod of moduleRegistry.values()) {
    if (mod.equipmentTemplates) {
      templates.push(...mod.equipmentTemplates);
    }
  }
  return templates;
}

/**
 * Filters room templates based on active modules in the current layout.
 */
export function getAvailableRoomTemplates(
  enabledModules: string[] = []
): RoomQuickTemplate[] {
  return getAllRoomTemplates().filter(
    (tpl) => !tpl.moduleId || enabledModules.includes(tpl.moduleId)
  );
}

/**
 * Filters equipment templates based on active modules in the current layout.
 */
export function getAvailableEquipmentTemplates(
  enabledModules: string[] = []
): EquipmentQuickTemplate[] {
  return getAllEquipmentTemplates().filter(
    (tpl) => !tpl.moduleId || enabledModules.includes(tpl.moduleId)
  );
}

/**
 * Looks up custom room category styling registered by any active or registered module.
 */
export function getModuleRoomCategoryStyle(
  category: string
): ModuleCategoryStyle | undefined {
  for (const mod of moduleRegistry.values()) {
    if (mod.roomCategoryStyles && mod.roomCategoryStyles[category]) {
      return mod.roomCategoryStyles[category];
    }
  }
  return undefined;
}

/**
 * Resets the registry back to default built-in modules (useful for tests).
 */
export function resetModuleRegistry(): void {
  initBuiltins();
}

// Initialize default built-ins on module evaluation
initBuiltins();
