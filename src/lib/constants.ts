import { AppState, Slot } from './types';
import { generateTimeSlots } from './utils';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const DEFAULT_START_TIME = '08:30';
export const DEFAULT_END_TIME = '17:30';
export const SLOT_DURATION = 60;

export const INITIAL_SLOTS: Record<string, Slot> = {};
const timeSlots = generateTimeSlots(DEFAULT_START_TIME, DEFAULT_END_TIME, SLOT_DURATION);

DAYS.forEach(day => {
  timeSlots.forEach(({ startTime, endTime }) => {
    const id = `${day.toLowerCase()}-${startTime.replace(':', '')}`;
    INITIAL_SLOTS[id] = {
      id,
      day,
      startTime,
      endTime,
      subject: '',
      type: 'Lecture',
      color: '',
      mergedGroupId: null,
    };
  });
});

export const INITIAL_STATE: AppState = {
  slots: INITIAL_SLOTS,
  attendance: {},
  settings: {
    targetPercentage: 75,
    timeRange: { start: DEFAULT_START_TIME, end: DEFAULT_END_TIME },
    days: DAYS,
    semesterStart: new Date().toISOString().split('T')[0],
    subjectColors: {},
  },
  mergeMode: {
    enabled: false,
    selectedSlots: [],
  },
  isSettingsOpen: false,
  holidays: {},
  extraClasses: {},
  cancellations: {},
  semesterBreaks: {},
};
