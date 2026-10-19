export type BuiltinRoomCategory =
  | 'production'
  | 'office'
  | 'warehouse'
  | 'cleanroom'
  | 'shipping'
  | 'lab'
  | 'restroom'
  | 'utility'
  | 'breakroom'
  | 'corridor'
  | 'cultivation';

/**
 * Extensible room category: supports all built-in types with IDE autocompletion,
 * while allowing custom pluggable modules to introduce new categories without type errors.
 */
export type RoomCategory = BuiltinRoomCategory | (string & {});

export type CeilingType =
  | 'open-deck'
  | 'acoustic-drop'
  | 'clean-panel'
  | 'gypsum'
  | 'imp-insulated';

export type FloorFinish =
  | 'sealed-concrete'
  | 'epoxy-coat'
  | 'coved-epoxy'
  | 'esd-epoxy'
  | 'vct-tile'
  | 'carpet-tile';

export type CardinalSide = 'north' | 'south' | 'east' | 'west';

export type BuiltinDomainModuleId =
  | 'cultivation'
  | 'edible-cleanroom'
  | 'security-compliance';

/**
 * Extensible domain module ID: provides autocompletion for built-ins,
 * while accepting any custom community or enterprise pluggable module ID.
 */
export type DomainModuleId = BuiltinDomainModuleId | (string & {});

export interface FacilityRoom {
  id: string;
  name: string;
  code: string;
  category: RoomCategory;
  /** Architectural or environmental zone subtitle (e.g. 'Closed-Loop Environmental Zone') */
  subtitle?: string;
  /** X position in feet from the main West interior reference line (East is +X) */
  x: number;
  /** Y position in feet from the North interior reference wall (South is +Y) */
  y: number;
  /** Width (East-West) in feet */
  width: number;
  /** Length/Depth (North-South) in feet */
  height: number;
  /** Wall height in feet for 3D extrusion and contractor schedules */
  wallHeight: number;
  /** True if part of the base building shell (Existing to Remain); false if New Build-Out */
  isExisting?: boolean;
  /** Regulatory Compliance: True if designated as a Limited Access Area */
  isLimitedAccess?: boolean;
  /** Wall & Floor material callout shown on plan (e.g. 'Walls: FRP • Floor: Coved-Edge Epoxy') */
  materialCallout?: string;
  /** Room pressure differential tag for MEP view (e.g. '+0.05" WC POS. PRESSURE HEPA') */
  pressureDifferential?: string;
  /** Sides that use modular/non-load-bearing walls for future expansion */
  expandableSides?: CardinalSide[];
  /** Optional custom accent color hex */
  color?: string;
  ceilingType?: CeilingType;
  floorFinish?: FloorFinish;
  notes?: string;
  showDimensions?: boolean;
  /** Preferred anchor for compact room header tag to avoid interior equipment */
  labelAnchor?: 'top' | 'bottom' | 'center';
  /** Optional custom X/Y label anchor override in feet for irregular L-shaped corridors */
  labelXFt?: number;
  labelYFt?: number;
}

export type DoorType =
  | 'single-swing'
  | 'double-swing'
  | 'overhead-dock'
  | 'sliding'
  | 'cased-opening';

export type WallOrientation = 'horizontal' | 'vertical';
export type DoorSwing = 'north-east' | 'north-west' | 'south-east' | 'south-west';

export interface FacilityDoor {
  id: string;
  label: string;
  type: DoorType;
  /** Center X position of the door opening in feet */
  x: number;
  /** Center Y position of the door opening in feet */
  y: number;
  /** Clear opening width in feet (e.g. 3.0 = 3'-0", 6.0 = 6'-0", 8.0 = 8'-0") */
  width: number;
  orientation: WallOrientation;
  swing: DoorSwing;
  isExisting?: boolean;
  hasBadgeReader?: boolean;
  isExteriorEgress?: boolean;
  notes?: string;
}

export type BuiltinEquipmentCategory =
  | 'rolling-bench'
  | 'machinery'
  | 'racking'
  | 'secure-vault'
  | 'workstation'
  | 'material-handling'
  | 'electrical-mep'
  | 'plumbing'
  | 'access-control'
  | 'security-camera'
  | 'hvac-scrubber'
  | 'safety-equipment'
  | 'custom';

/**
 * Extensible equipment category: supports all built-in types with IDE autocompletion,
 * while allowing custom pluggable modules to introduce new categories without type errors.
 */
export type EquipmentCategory = BuiltinEquipmentCategory | (string & {});

export interface FacilityEquipment {
  id: string;
  name: string;
  code: string;
  category: EquipmentCategory;
  /** Top-left X in feet */
  x: number;
  /** Top-left Y in feet */
  y: number;
  /** Width in feet */
  width: number;
  /** Depth in feet */
  height: number;
  /** 3D height in feet */
  elevationHeight: number;
  /** Rotation / camera aim angle in degrees (0=East, 90=South, 180=West, 270=North) */
  rotation: number;
  /** Optional safety/operator clearance zone in feet */
  clearanceFt?: number;
  /** Power, air, or contractor utility spec string */
  specs?: string;
  isExisting?: boolean;
  color?: string;
}

export type StructuralElementType =
  | 'steel-column'
  | 'wall-pilaster'
  | 'dock-leveler-pit'
  | 'floor-pad'
  | 'utility-chase'
  | 'unit-heater'
  | 'window-glazing'
  | 'partition-wall';

export interface FacilityStructuralElement {
  id: string;
  name: string;
  type: StructuralElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  isExisting?: boolean;
  notes?: string;
}

export interface DimensionAnnotation {
  id: string;
  label?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  offsetFt: number;
  orientation: 'horizontal' | 'vertical';
  isShellDimension?: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface PdfCalibration {
  /** Optional URL/path for full scan underlay */
  fullImageUrl?: string;
  /** Optional URL/path for dark-linework transparent underlay */
  lineworkDarkUrl?: string;
  /** Optional URL/path for light-linework transparent underlay */
  lineworkLightUrl?: string;
  /** Pixel X in underlay image corresponding to (x=0 ft) */
  originPxX: number;
  /** Pixel Y in underlay image corresponding to (y=0 ft) */
  originPxY: number;
  /** Native PDF pixels per architectural foot */
  pixelsPerFoot: number;
  imageWidthPx: number;
  imageHeightPx: number;
}

export interface FacilityMetadata {
  projectName: string;
  suiteName: string;
  buildingName: string;
  address: string;
  rentableSqFt: number;
  usableSqFt: number;
  clearHeightFt: number;
  architect: string;
  landlord: string;
  basePlanDate: string;
  revisionName: string;
  revisionDate: string;
  preparedBy: string;
}

export interface FacilityLayoutData {
  version: string;
  /** Optional pluggable industry modules enabled for this layout */
  enabledModules?: DomainModuleId[];
  metadata: FacilityMetadata;
  pdfCalibration?: PdfCalibration;
  /** Ordered clockwise vertices of the building interior perimeter in feet */
  shellPerimeter: Point2D[];
  rooms: FacilityRoom[];
  doors: FacilityDoor[];
  equipment: FacilityEquipment[];
  structuralElements: FacilityStructuralElement[];
  dimensions: DimensionAnnotation[];
}

export type PresentationTheme =
  | 'investor-color'
  | 'contractor-blueprint'
  | 'dark-cad';

export type DisciplineView =
  | 'overview'
  | 'room-usage'
  | 'equipment'
  | 'security'
  | 'evac-safety'
  | 'contractor-mep';

export type RoomLabelMode = 'auto' | 'header' | 'full' | 'minimal';

export type ActiveTool =
  | 'select'
  | 'pan'
  | 'add-room'
  | 'add-door'
  | 'add-equipment'
  | 'add-structural'
  | 'measure';

export type SelectedEntity =
  | { type: 'room'; id: string }
  | { type: 'door'; id: string }
  | { type: 'equipment'; id: string }
  | { type: 'structural'; id: string }
  | null;

export interface BackupSnapshotMeta {
  id: string;
  filename: string;
  createdAt: string;
  reason: string;
  roomCount: number;
  doorCount: number;
  equipmentCount: number;
}
