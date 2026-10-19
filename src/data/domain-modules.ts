import {
  DomainModuleId,
  EquipmentCategory,
  FacilityEquipment,
  FacilityRoom,
  RoomCategory,
} from '../types/facility';

export interface DomainModuleDescriptor {
  id: DomainModuleId;
  name: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
  features: string[];
  roomCategories: RoomCategory[];
  equipmentCategories: EquipmentCategory[];
}

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

export const DOMAIN_MODULES: DomainModuleDescriptor[] = [
  {
    id: 'cultivation',
    name: 'Controlled-Environment Cultivation & Nursery',
    shortLabel: 'Cultivation',
    badgeColor: '#10b981',
    description:
      'Adds closed-loop cultivation rooms, 4×8 rolling ebb-and-flow benches, multi-tier LED propagation racks, and split-system HVAC carbon scrubbers.',
    features: [
      'Cultivation / Closed-Loop Environmental room category',
      '4×8 Rolling Ebb-and-Flow Bench & Vertical LED Cloning Rack symbols',
      'Split-System AC + Activated Carbon Scrubber MEP fixtures',
      'Negative-pressure (-0.03" WC) odor-control room badges',
    ],
    roomCategories: ['cultivation'],
    equipmentCategories: ['rolling-bench', 'hvac-scrubber'],
  },
  {
    id: 'edible-cleanroom',
    name: 'Edible / Food-Grade & GMP Cleanroom',
    shortLabel: 'Edible Cleanroom',
    badgeColor: '#06b6d4',
    description:
      'Adds washable FRP/IMP positive-pressure cleanrooms, 3-compartment sanitation sinks, grease interceptors, and modular expandable walls.',
    features: [
      'Food-grade / GMP Cleanroom templates with FRP & Coved Epoxy callouts',
      'Positive-pressure (+0.05" WC HEPA) environmental tags',
      'Commercial 3-Compartment Sink, Handwash Sink & Grease Interceptor',
      'Modular non-load-bearing expandable wall callouts',
    ],
    roomCategories: ['cleanroom'],
    equipmentCategories: ['plumbing'],
  },
  {
    id: 'security-compliance',
    name: 'Regulated Security, L.A.A. & Vault Compliance',
    shortLabel: 'Security & Vault',
    badgeColor: '#ef4444',
    description:
      'Unlocks Sheet SEC-101, Limited Access Area (L.A.A.) perimeters, 24/7 security cameras with FOV sightline cones, badge readers, and regulated vaults.',
    features: [
      'Dedicated Sheet SEC-101 Security & Access Control view',
      'Limited Access Area (L.A.A.) room designation & red perimeter boundaries',
      '24/7 Security Cameras with rotatable FOV sightline cones',
      'RFID Badge Readers / Strike Locks & Secure Vault Cages',
    ],
    roomCategories: [],
    equipmentCategories: ['security-camera', 'access-control', 'secure-vault'],
  },
];

export const ROOM_QUICK_TEMPLATES: RoomQuickTemplate[] = [
  // Core General-Purpose Room Templates
  {
    id: 'tpl-room-production',
    label: 'Production / Assembly Bay (20×24)',
    room: {
      name: 'Production & Assembly Bay',
      code: 'PROD-1',
      category: 'production',
      subtitle: 'Light Manufacturing & Process Workcell',
      width: 20,
      height: 24,
      wallHeight: 12,
      isExisting: false,
      materialCallout: 'Walls: Painted Gypsum • Floor: Industrial Epoxy',
      ceilingType: 'open-deck',
      floorFinish: 'epoxy-coat',
      showDimensions: true,
    },
  },
  {
    id: 'tpl-room-warehouse',
    label: 'Warehouse / Pallet Storage (24×30)',
    room: {
      name: 'Warehouse & Material Storage',
      code: 'WH-1',
      category: 'warehouse',
      subtitle: 'High-Bay Pallet Racking & Staging',
      width: 24,
      height: 30,
      wallHeight: 18,
      isExisting: false,
      materialCallout: 'Walls: Open Bay / Demising • Floor: Sealed Concrete',
      ceilingType: 'open-deck',
      floorFinish: 'sealed-concrete',
      showDimensions: true,
    },
  },
  {
    id: 'tpl-room-office',
    label: 'Office / Admin Suite (14×16)',
    room: {
      name: 'Operations Office',
      code: 'OFF-1',
      category: 'office',
      subtitle: 'Engineering & Administrative Workspace',
      width: 14,
      height: 16,
      wallHeight: 10,
      isExisting: false,
      materialCallout: 'Walls: Gypsum • Floor: Commercial Carpet Tile',
      ceilingType: 'acoustic-drop',
      floorFinish: 'carpet-tile',
      showDimensions: true,
    },
  },
  {
    id: 'tpl-room-lab',
    label: 'R&D / QC Testing Lab (14×18)',
    room: {
      name: 'Quality Control & R&D Lab',
      code: 'LAB-1',
      category: 'lab',
      subtitle: 'Analytical Testing & Metrology',
      width: 14,
      height: 18,
      wallHeight: 10,
      isExisting: false,
      materialCallout: 'Walls: Washable Gypsum • Floor: ESD Conductive Epoxy',
      ceilingType: 'acoustic-drop',
      floorFinish: 'esd-epoxy',
      showDimensions: true,
    },
  },
  // Module: Edible / GMP Cleanroom Templates
  {
    id: 'tpl-room-edible-cleanroom',
    label: 'Edible / GMP Cleanroom (12.5×16)',
    moduleId: 'edible-cleanroom',
    room: {
      name: 'Edible Processing Clean Room',
      code: 'CLN-1',
      category: 'cleanroom',
      subtitle: 'ISO-8 / Food-Grade Positive-Pressure Zone',
      width: 12.5,
      height: 16,
      wallHeight: 10,
      isExisting: false,
      isLimitedAccess: true,
      labelAnchor: 'top',
      materialCallout: 'Walls: Washable FRP • Floor: Coved-Edge Antimicrobial Epoxy',
      pressureDifferential: '+0.05" WC POS. PRESSURE HEPA',
      expandableSides: ['south'],
      ceilingType: 'clean-panel',
      floorFinish: 'coved-epoxy',
      showDimensions: true,
    },
  },
  // Module: Cultivation Templates
  {
    id: 'tpl-room-cultivation-veg',
    label: 'Vegetative / Canopy Room (22×28)',
    moduleId: 'cultivation',
    room: {
      name: 'Vegetative Cultivation Room',
      code: 'VEG-1',
      category: 'cultivation',
      subtitle: 'Closed-Loop Environmental Canopy Zone',
      width: 22,
      height: 28,
      wallHeight: 12,
      isExisting: false,
      isLimitedAccess: true,
      labelAnchor: 'top',
      materialCallout: 'Walls: Insulated IMP • Floor: Coved Epoxy w/ Trench Drain',
      pressureDifferential: '-0.03" WC NEG. PRESSURE • SEALED LOOP',
      ceilingType: 'imp-insulated',
      floorFinish: 'coved-epoxy',
      showDimensions: true,
    },
  },
  {
    id: 'tpl-room-cultivation-prop',
    label: 'Mother & Propagation Room (22×22)',
    moduleId: 'cultivation',
    room: {
      name: 'Mother & Propagation Nursery',
      code: 'PROP-1',
      category: 'cultivation',
      subtitle: 'Mother Stock & Vertical LED Cloning Zone',
      width: 22,
      height: 22,
      wallHeight: 12,
      isExisting: false,
      isLimitedAccess: true,
      labelAnchor: 'top',
      materialCallout: 'Walls: Washable FRP • Floor: Coved-Edge Epoxy',
      pressureDifferential: '-0.03" WC NEG. PRESSURE • SEALED LOOP',
      ceilingType: 'imp-insulated',
      floorFinish: 'coved-epoxy',
      showDimensions: true,
    },
  },
  // Module: Security & Compliance Templates
  {
    id: 'tpl-room-secure-vault',
    label: 'Secure Product Vault (11×13)',
    moduleId: 'security-compliance',
    room: {
      name: 'Secure Inventory & Quarantine Vault',
      code: 'VAULT-1',
      category: 'warehouse',
      subtitle: 'Restricted Access Cage & Safe Storage',
      width: 11,
      height: 13,
      wallHeight: 10,
      isExisting: false,
      isLimitedAccess: true,
      labelAnchor: 'top',
      materialCallout: '9-Gauge Security Mesh Deck-to-Slab • Coved Epoxy',
      ceilingType: 'clean-panel',
      floorFinish: 'coved-epoxy',
      color: '#d97706',
      showDimensions: true,
    },
  },
];

export const EQUIPMENT_QUICK_TEMPLATES: EquipmentQuickTemplate[] = [
  // Core General-Purpose Equipment
  {
    id: 'tpl-eq-machinery',
    label: 'CNC / Process Machine (8×5)',
    equipment: {
      name: 'Automated Process Machine',
      code: 'MCH-1',
      category: 'machinery',
      width: 8,
      height: 5,
      elevationHeight: 6,
      rotation: 0,
      clearanceFt: 3,
      specs: '480V 3Ph • 60A • 90 PSI CDA',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-racking',
    label: 'Selective Pallet Rack Bay (8×4)',
    equipment: {
      name: 'Heavy-Duty Pallet Rack (3-Tier)',
      code: 'RCK-1',
      category: 'racking',
      width: 8,
      height: 4,
      elevationHeight: 12,
      rotation: 0,
      clearanceFt: 0,
      specs: '42"×96" Beams • 15,000 lb Cap.',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-workstation',
    label: 'Stainless Assembly Table (6×2.5)',
    equipment: {
      name: 'Stainless Work / Prep Table',
      code: 'WRK-1',
      category: 'workstation',
      width: 6,
      height: 2.5,
      elevationHeight: 3,
      rotation: 0,
      clearanceFt: 2.5,
      specs: '16-Ga 304 Stainless • 120V Quad',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-safety-fe',
    label: 'Fire Extinguisher / Safety Station',
    equipment: {
      name: '10 lb ABC Fire Extinguisher',
      code: 'FE-1',
      category: 'safety-equipment',
      width: 1.5,
      height: 1.5,
      elevationHeight: 4,
      rotation: 0,
      clearanceFt: 0,
      specs: 'Surface Recessed Cabinet • 75 ft Travel',
      isExisting: false,
    },
  },
  // Module: Cultivation
  {
    id: 'tpl-eq-rolling-bench',
    label: '4×8 Rolling Ebb-and-Flow Bench',
    moduleId: 'cultivation',
    equipment: {
      name: '4×8 Rolling Canopy Bench',
      code: 'VB-1',
      category: 'rolling-bench',
      width: 4,
      height: 8,
      elevationHeight: 3.2,
      rotation: 0,
      clearanceFt: 0,
      specs: 'ABS Flood Tray • Anti-Tip Rollers',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-clone-rack',
    label: '3-Tier LED Propagation Rack (2×8)',
    moduleId: 'cultivation',
    equipment: {
      name: '3-Tier Vertical LED Clone Rack',
      code: 'VCR-1',
      category: 'racking',
      width: 2,
      height: 8,
      elevationHeight: 7.5,
      rotation: 0,
      clearanceFt: 0,
      specs: '120V • 18W Bar LEDs • 180 Clones/Tier',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-hvac-scrubber',
    label: 'Split-System AC + Carbon Scrubber',
    moduleId: 'cultivation',
    equipment: {
      name: '5-Ton Split AC & Carbon Scrubber',
      code: 'HVAC-1',
      category: 'hvac-scrubber',
      width: 5,
      height: 2.2,
      elevationHeight: 6,
      rotation: 0,
      clearanceFt: 0,
      specs: '208/230V 3Ph • Activated Carbon Filter',
      isExisting: false,
    },
  },
  // Module: Edible Cleanroom
  {
    id: 'tpl-eq-3comp-sink',
    label: 'NSF 3-Compartment Sink (7.5×2.5)',
    moduleId: 'edible-cleanroom',
    equipment: {
      name: 'NSF 3-Compartment Sanitation Sink',
      code: 'SNK-3C',
      category: 'plumbing',
      width: 2.5,
      height: 7.5,
      elevationHeight: 3.2,
      rotation: 0,
      clearanceFt: 2.5,
      specs: 'Indirect Floor Sink • 25 GPM Grease Interceptor',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-handwash',
    label: 'Touchless Handwash Sink (2×2)',
    moduleId: 'edible-cleanroom',
    equipment: {
      name: 'Dedicated Handwash Station',
      code: 'SNK-HW',
      category: 'plumbing',
      width: 2,
      height: 2,
      elevationHeight: 3,
      rotation: 0,
      clearanceFt: 2,
      specs: 'Hot/Cold Mixing Valve • Splash Guards',
      isExisting: false,
    },
  },
  // Module: Security & Compliance
  {
    id: 'tpl-eq-camera',
    label: '24/7 Dome Security Camera (FOV)',
    moduleId: 'security-compliance',
    equipment: {
      name: '4K PoE IR Dome Security Camera',
      code: 'CAM-1',
      category: 'security-camera',
      width: 1.5,
      height: 1.5,
      elevationHeight: 9.5,
      rotation: 45,
      clearanceFt: 0,
      specs: 'PoE+ 802.3at • 90-Day NVR Retention',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-badge-reader',
    label: 'RFID Badge Reader / Strike Lock',
    moduleId: 'security-compliance',
    equipment: {
      name: 'RFID Card Reader & Electric Strike',
      code: 'ACR-1',
      category: 'access-control',
      width: 1.2,
      height: 1.2,
      elevationHeight: 4,
      rotation: 0,
      clearanceFt: 0,
      specs: '24VDC Fail-Secure • Audit Trail Logging',
      isExisting: false,
    },
  },
  {
    id: 'tpl-eq-vault-cage',
    label: 'Secure Vault Safe / Cage (3.5×2.5)',
    moduleId: 'security-compliance',
    equipment: {
      name: 'TL-15 Narcotic / Inventory Safe',
      code: 'VLT-1',
      category: 'secure-vault',
      width: 3.5,
      height: 2.5,
      elevationHeight: 6,
      rotation: 0,
      clearanceFt: 2.5,
      specs: 'Slab-Anchored • Biometric Dual-Control Lock',
      isExisting: false,
    },
  },
];
