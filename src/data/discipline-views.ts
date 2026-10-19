import { DisciplineView, DomainModuleId, RoomLabelMode } from '../types/facility';

export interface DisciplineMeta {
  id: DisciplineView;
  sheetCode: string;
  shortLabel: string;
  sheetTitle: string;
  subtitle: string;
  shortcut: string;
  accentClass: string;
  requiredModule?: DomainModuleId;
}

export const DISCIPLINE_VIEWS: DisciplineMeta[] = [
  {
    id: 'overview',
    sheetCode: 'A-100',
    shortLabel: 'Master Plan',
    sheetTitle: 'SHEET A-100 • MASTER ARCHITECTURAL & EQUIPMENT PLAN',
    subtitle: 'Composite layout with rooms, doors, process equipment & non-overlapping header tags',
    shortcut: '1',
    accentClass: 'bg-blue-600 text-white border-blue-500',
  },
  {
    id: 'room-usage',
    sheetCode: 'A-101',
    shortLabel: 'Room Usage',
    sheetTitle: 'SHEET A-101 • ROOM USAGE, ZONING & FINISH SCHEDULE',
    subtitle: 'Full room callouts, square footage, wall/floor finishes & expansion zones',
    shortcut: '2',
    accentClass: 'bg-emerald-600 text-white border-emerald-500',
  },
  {
    id: 'equipment',
    sheetCode: 'Q-101',
    shortLabel: 'Equipment',
    sheetTitle: 'SHEET Q-101 • PROCESS EQUIPMENT & FIXTURE SCHEDULE',
    subtitle: 'Machinery, racking, benches, workstations & operator safety clearances',
    shortcut: '3',
    accentClass: 'bg-indigo-600 text-white border-indigo-500',
  },
  {
    id: 'security',
    sheetCode: 'SEC-101',
    shortLabel: 'Security & L.A.A.',
    sheetTitle: 'SHEET SEC-101 • SECURITY, SURVEILLANCE & ACCESS CONTROL',
    subtitle: 'Limited Access Areas, 24/7 camera FOV sightlines, RFID strike locks & Secure Vaults',
    shortcut: '4',
    accentClass: 'bg-red-600 text-white border-red-500',
    requiredModule: 'security-compliance',
  },
  {
    id: 'evac-safety',
    sheetCode: 'LS-101',
    shortLabel: 'Evac & Safety',
    sheetTitle: 'SHEET LS-101 • LIFE SAFETY, EGRESS PATHS & EMERGENCY PLAN',
    subtitle: 'Primary/secondary exit travel paths, EXIT signs, fire extinguishers, eyewash & AED',
    shortcut: '5',
    accentClass: 'bg-amber-600 text-white border-amber-500',
  },
  {
    id: 'contractor-mep',
    sheetCode: 'M-101',
    shortLabel: 'MEP & Utilities',
    sheetTitle: 'SHEET M-101 • CONTRACTOR MEP, PLUMBING & ENVIRONMENTAL PLAN',
    subtitle: 'Wet-wall sanitary tie-ins, sinks, electrical panels, HVAC units & room pressure tags',
    shortcut: '6',
    accentClass: 'bg-cyan-600 text-white border-cyan-500',
  },
];

export const LABEL_MODE_OPTIONS: { id: RoomLabelMode; label: string; tip: string }[] = [
  { id: 'auto', label: 'Auto Labels', tip: 'Automatically match label style to active sheet view' },
  { id: 'header', label: 'Edge Headers', tip: 'Compact room tags docked on room borders (never blocks equipment)' },
  { id: 'full', label: 'Full Plates', tip: 'Full multi-line room schedule plates' },
  { id: 'minimal', label: 'Codes Only', tip: 'Minimal room code pills' },
];
