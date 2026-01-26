'use client';
import { createContext, useContext, useReducer, useEffect, type Dispatch } from 'react';
import type { AppState, Action, Holiday, ExtraClass, Cancellation, SemesterBreak } from '@/lib/types';
import { INITIAL_STATE } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload, cancellations: action.payload.cancellations || {}, semesterBreaks: action.payload.semesterBreaks || {} };
    case 'UPDATE_SLOT':
      return { ...state, slots: { ...state.slots, [action.payload.id]: action.payload } };
    case 'CLEAR_SLOT': {
      const slotToClear = state.slots[action.payload];
      if (!slotToClear) return state;
      const newSlot = { ...slotToClear, subject: '', type: 'Lecture' as const, color: '', mergedGroupId: null };
      return { ...state, slots: { ...state.slots, [action.payload]: newSlot } };
    }
    case 'TOGGLE_MERGE_MODE':
      return { ...state, mergeMode: { enabled: !state.mergeMode.enabled, selectedSlots: [] } };
    case 'ADD_SLOT_TO_MERGE': {
      if (!state.mergeMode.enabled) return state;
      const selectedSlots = state.mergeMode.selectedSlots.includes(action.payload)
        ? state.mergeMode.selectedSlots.filter(id => id !== action.payload)
        : [...state.mergeMode.selectedSlots, action.payload];
      return { ...state, mergeMode: { ...state.mergeMode, selectedSlots } };
    }
    case 'MERGE_SELECTED_SLOTS': {
      if (state.mergeMode.selectedSlots.length < 2) return state;
      const groupId = uuidv4();
      const updatedSlots = { ...state.slots };
      state.mergeMode.selectedSlots.forEach(id => {
        updatedSlots[id] = { ...updatedSlots[id], mergedGroupId: groupId };
      });
      return { ...state, slots: updatedSlots, mergeMode: { enabled: false, selectedSlots: [] } };
    }
    case 'UNMERGE_SLOTS': {
      const groupId = action.payload;
      if (!groupId) return state;
      const updatedSlots = { ...state.slots };
      Object.values(updatedSlots).forEach(slot => {
        if (slot.mergedGroupId === groupId) {
          updatedSlots[slot.id] = { ...slot, mergedGroupId: null };
        }
      });
      return { ...state, slots: updatedSlots };
    }
    case 'SET_ATTENDANCE': {
      const { weekId, slotId, status } = action.payload;
      const weeklyAttendance = state.attendance[weekId] || {};
      const newWeeklyAttendance = { ...weeklyAttendance, [slotId]: status };
      return { ...state, attendance: { ...state.attendance, [weekId]: newWeeklyAttendance } };
    }
    case 'SET_BULK_ATTENDANCE': {
      const { weekId, status } = action.payload;
      const weeklyAttendance = state.attendance[weekId] || {};
      Object.values(state.slots).forEach(slot => {
        if (slot.subject) {
          weeklyAttendance[slot.id] = status;
        }
      });
      return { ...state, attendance: { ...state.attendance, [weekId]: weeklyAttendance } };
    }
    case 'CLEAR_WEEK_ATTENDANCE': {
      const { weekId } = action.payload;
      const newAttendance = { ...state.attendance };
      if (newAttendance[weekId]) {
        delete newAttendance[weekId];
      }
      return { ...state, attendance: newAttendance };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_SETTINGS_OPEN':
      return { ...state, isSettingsOpen: action.payload };
    case 'RESET_STATE':
      const resetState = { ...INITIAL_STATE, isSettingsOpen: false };
      localStorage.setItem('attendease_state', JSON.stringify(resetState));
      return resetState;
    case 'SET_HOLIDAYS': {
      const holidaysRecord = action.payload.reduce((acc, holiday) => {
        acc[holiday.id] = holiday;
        return acc;
      }, {} as Record<string, Holiday>);
      return { ...state, holidays: holidaysRecord };
    }
    case 'SET_EXTRA_CLASSES': {
      const extraClassesRecord = action.payload.reduce((acc, extraClass) => {
        acc[extraClass.id] = extraClass;
        return acc;
      }, {} as Record<string, ExtraClass>);
      return { ...state, extraClasses: extraClassesRecord };
    }
    case 'SET_CANCELLATIONS': {
      const cancellationsRecord = action.payload.reduce((acc, cancellation) => {
        acc[cancellation.id] = cancellation;
        return acc;
      }, {} as Record<string, Cancellation>);
      return { ...state, cancellations: cancellationsRecord };
    }
    case 'ADD_CANCELLATION': {
      return { ...state, cancellations: { ...state.cancellations, [action.payload.id]: action.payload } };
    }
    case 'DELETE_CANCELLATION': {
      const newCancellations = { ...state.cancellations };
      delete newCancellations[action.payload];
      return { ...state, cancellations: newCancellations };
    }
    case 'SET_SEMESTER_BREAKS': {
      const semesterBreaksRecord = action.payload.reduce((acc, semesterBreak) => {
        acc[semesterBreak.id] = semesterBreak;
        return acc;
      }, {} as Record<string, SemesterBreak>);
      return { ...state, semesterBreaks: semesterBreaksRecord };
    }
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const { firestore, user } = useFirebase();

  // fetch holidays
  const holidaysCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'holidays');
  }, [firestore, user]);
  const { data: holidaysData } = useCollection<Holiday>(holidaysCollection);

  // fetch extra classes
  const extraClassesCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'extraClasses');
  }, [firestore, user]);
  const { data: extraClassesData } = useCollection<ExtraClass>(extraClassesCollection);

  // fetch cancellations
  const cancellationsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'cancellations');
  }, [firestore, user]);
  const { data: cancellationsData } = useCollection<Cancellation>(cancellationsCollection);

  // fetch semester breaks
  const semesterBreaksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'semesterBreaks');
  }, [firestore, user]);
  const { data: semesterBreaksData } = useCollection<SemesterBreak>(semesterBreaksCollection);

  useEffect(() => {
    if (holidaysData) {
      dispatch({ type: 'SET_HOLIDAYS', payload: holidaysData });
    }
  }, [holidaysData]);

  useEffect(() => {
    if (extraClassesData) {
      dispatch({ type: 'SET_EXTRA_CLASSES', payload: extraClassesData });
    }
  }, [extraClassesData]);

  useEffect(() => {
    if (cancellationsData) {
      dispatch({ type: 'SET_CANCELLATIONS', payload: cancellationsData });
    }
  }, [cancellationsData]);

  useEffect(() => {
    if (semesterBreaksData) {
      dispatch({ type: 'SET_SEMESTER_BREAKS', payload: semesterBreaksData });
    }
  }, [semesterBreaksData]);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('attendease_state');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        parsedState.isSettingsOpen = false; // Ensure settings is closed on load
        if (!parsedState.cancellations) parsedState.cancellations = {}; // Ensure cancellations exists
        if (!parsedState.semesterBreaks) parsedState.semesterBreaks = {}; // Ensure semesterBreaks exists
        dispatch({ type: 'SET_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('attendease_state', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
