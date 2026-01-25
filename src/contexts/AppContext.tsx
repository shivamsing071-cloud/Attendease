'use client';
import { createContext, useContext, useReducer, useEffect, type Dispatch } from 'react';
import type { AppState, Action } from '@/lib/types';
import { INITIAL_STATE } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
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
        if(!groupId) return state;
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
            if(slot.subject) {
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
    case 'RESET_STATE':
        return INITIAL_STATE;
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('attendease_state');
      if (storedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedState) });
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
