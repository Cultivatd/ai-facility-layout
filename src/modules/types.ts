import {
  DomainModuleId,
  EquipmentCategory,
  FacilityEquipment,
  FacilityRoom,
  RoomCategory,
} from '../types/facility';

export interface RoomQuickTemplate {
  id: string;
  label: string;
  moduleId?: DomainModuleId;
  room: Omit<FacilityRoom, 'id' | 'x' | 'y'>;
}

export interface EquipmentQuickTemplate {
  id: string;
  label: string;
  moduleId?: DomainModuleId;
  equipment: Omit<FacilityEquipment, 'id' | 'x' | 'y'>;
}

export interface ModuleCategoryStyle {
  label: string;
  fillInvestor: string;
  strokeInvestor: string;
  badgeColor: string;
  fill3D: string;
  hatchPattern?: 'diagonal' | 'grid' | 'dots' | 'cross' | 'none';
}

/**
 * Cohesive, self-contained definition for a pluggable facility domain module.
 * Everything needed for the module—metadata, room & equipment templates,
 * and category styling—lives together in a single object.
 */
export interface DomainModuleDescriptor {
  /** Unique module identifier (e.g. 'cultivation', 'cold-storage', 'biotech') */
  id: DomainModuleId;
  /** Full human-readable display name */
  name: string;
  /** Short tag used on compact buttons and chips */
  shortLabel: string;
  /** Hex color code for badges and highlights */
  badgeColor: string;
  /** Architectural & operational description */
  description: string;
  /** Bullet points of features unlocked by this module */
  features: string[];
  /** Room categories introduced by this module (optional) */
  roomCategories?: RoomCategory[];
  /** Equipment categories introduced by this module (optional) */
  equipmentCategories?: EquipmentCategory[];
  /** Self-contained room quick-add templates */
  roomTemplates?: RoomQuickTemplate[];
  /** Self-contained equipment quick-add templates */
  equipmentTemplates?: EquipmentQuickTemplate[];
  /** Custom room category color and hatch styling */
  roomCategoryStyles?: Record<string, ModuleCategoryStyle>;
}

/**
 * Type-safe helper for defining a pluggable domain module with automatic inference.
 *
 * Example:
 * ```typescript
 * export const coldStorageModule = defineDomainModule({
 *   id: 'cold-storage',
 *   name: 'Industrial Cold Storage',
 *   shortLabel: 'Cold Storage',
 *   badgeColor: '#0284c7',
 *   description: 'Blast freezers, IMP wall callouts, and evaporator coils.',
 *   features: ['Blast Freezer room category', 'Ceiling evaporator units'],
 *   roomTemplates: [...],
 *   equipmentTemplates: [...],
 * });
 * ```
 */
export function defineDomainModule<T extends DomainModuleDescriptor>(module: T): T {
  return module;
}
