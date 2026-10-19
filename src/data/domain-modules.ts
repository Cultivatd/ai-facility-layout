import {
  getAllDomainModules,
  getAllEquipmentTemplates,
  getAllRoomTemplates,
  DomainModuleDescriptor,
  EquipmentQuickTemplate,
  RoomQuickTemplate,
} from '../modules';

export * from '../modules';

function createLiveArrayProxy<T>(getItems: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_target, prop, receiver) {
      const items = getItems();
      if (prop === 'length') return items.length;
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        return items[Number(prop)];
      }
      const val = Reflect.get(items, prop, receiver);
      return typeof val === 'function' ? val.bind(items) : val;
    },
    has(_target, prop) {
      return Reflect.has(getItems(), prop);
    },
    ownKeys() {
      return Reflect.ownKeys(getItems());
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(getItems(), prop);
    },
  });
}

/**
 * Live array of all registered domain modules.
 * Automatically updates when new modules are registered via registerDomainModule().
 */
export const DOMAIN_MODULES: DomainModuleDescriptor[] =
  createLiveArrayProxy(getAllDomainModules);

/**
 * Live array of all room quick-add templates across core and registered modules.
 */
export const ROOM_QUICK_TEMPLATES: RoomQuickTemplate[] =
  createLiveArrayProxy(getAllRoomTemplates);

/**
 * Live array of all equipment quick-add templates across core and registered modules.
 */
export const EQUIPMENT_QUICK_TEMPLATES: EquipmentQuickTemplate[] =
  createLiveArrayProxy(getAllEquipmentTemplates);
