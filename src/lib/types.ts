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

export type HolidayType = 'National' | 'University' | 'Personal';

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: HolidayType;
}

export interface ExtraClass {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  subject: string;
  type: SlotType;
  attended: boolean;
}

export interface Cancellation {
  id: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  subject: string;
  reason: string;
  createdAt: number; // Timestamp
}

export type SemesterBreakType = 'Midsem' | 'Endsem' | 'Vacation';

export interface SemesterBreak {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  name: string;
  type: SemesterBreakType;
}

export interface AppState {
  slots: Record<string, Slot>;
  attendance: AllAttendance;
  settings: AppSettings;
  mergeMode: MergeMode;
  isSettingsOpen: boolean;
  holidays: Record<string, Holiday>;
  extraClasses: Record<string, ExtraClass>;
  cancellations: Record<string, Cancellation>;
  semesterBreaks: Record<string, SemesterBreak>;
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
  | { type: 'RESET_STATE' }
  | { type: 'SET_HOLIDAYS'; payload: Holiday[] }
  | { type: 'SET_EXTRA_CLASSES'; payload: ExtraClass[] }
  | { type: 'SET_CANCELLATIONS'; payload: Cancellation[] }
  | { type: 'ADD_CANCELLATION'; payload: Cancellation }
  | { type: 'DELETE_CANCELLATION'; payload: string }
  | { type: 'SET_SEMESTER_BREAKS'; payload: SemesterBreak[] };