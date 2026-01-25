export type SlotType = 'Lecture' | 'Lab';

export interface Slot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  type: SlotType;
  color: string;
  mergedGroupId: string | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'none';
export type WeeklyAttendance = Record<string, AttendanceStatus>;
export type AllAttendance = Record<string, WeeklyAttendance>;

export interface AppSettings {
  targetPercentage: number;
  timeRange: { start: string; end: string };
  days: string[];
  semesterStart: string;
  subjectColors: Record<string, string>;
}

export interface MergeMode {
  enabled: boolean;
  selectedSlots: string[];
}

export interface AppState {
  slots: Record<string, Slot>;
  attendance: AllAttendance;
  settings: AppSettings;
  mergeMode: MergeMode;
  isSettingsOpen: boolean;
}

export type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'UPDATE_SLOT'; payload: Slot }
  | { type: 'TOGGLE_MERGE_MODE' }
  | { type: 'ADD_SLOT_TO_MERGE'; payload: string }
  | { type: 'MERGE_SELECTED_SLOTS' }
  | { type: 'UNMERGE_SLOTS'; payload: string }
  | { type: 'CLEAR_SLOT'; payload: string }
  | { type: 'SET_ATTENDANCE'; payload: { weekId: string; slotId: string; status: AttendanceStatus } }
  | { type: 'SET_BULK_ATTENDANCE'; payload: { weekId: string; status: AttendanceStatus } }
  | { type: 'CLEAR_WEEK_ATTENDANCE'; payload: { weekId: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'RESET_STATE' };
