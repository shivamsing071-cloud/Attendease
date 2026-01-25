import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { eachDayOfInterval, format, startOfWeek, addDays, getWeek } from 'date-fns';
import type { Slot } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTimeSlots(start: string, end: string, durationMinutes: number): { startTime: string; endTime: string }[] {
  const slots = [];
  let current = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);

  while (current < endDate) {
    const startTime = current.toTimeString().substring(0, 5);
    current.setMinutes(current.getMinutes() + durationMinutes);
    const endTime = current.toTimeString().substring(0, 5);
    if (startTime !== '12:30') {
      slots.push({ startTime, endTime });
    }
  }

  return slots;
}

export const getWeekId = (date: Date): string => {
  return `${date.getFullYear()}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
};

export const getWeekDates = (weekId: string): Date[] => {
  const [year, weekNumber] = weekId.split('-W').map(Number);
  const firstDayOfYear = new Date(year, 0, 1);
  const days = (weekNumber - 1) * 7;
  const startDate = startOfWeek(addDays(firstDayOfYear, days), { weekStartsOn: 1 });
  
  return eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6),
  });
};

export const getWeekOptions = (semesterStart: string) => {
  const start = new Date(semesterStart);
  const end = new Date();
  end.setDate(end.getDate() + 14); // Add 2 future weeks
  const options = [];
  let current = startOfWeek(start, { weekStartsOn: 1 });

  while (current <= end) {
      const weekId = getWeekId(current);
      const weekDates = getWeekDates(weekId);
      const weekLabel = `${format(weekDates[0], 'MMM d')} - ${format(weekDates[6], 'MMM d, yyyy')}`;
      options.push({ value: weekId, label: weekLabel });
      current = addDays(current, 7);
  }

  return options.reverse();
};

export const formatSlotsForAI = (slots: Record<string, Slot>): string => {
  return Object.values(slots)
    .filter(slot => slot.subject)
    .map(slot => `${slot.day}, ${slot.startTime}-${slot.endTime}, ${slot.subject}, ${slot.type}`)
    .join('\n');
};

export const COLORS = [
  '#FD7E7E', '#B0E293', '#83C7FF', '#FFD882', '#A994FF', '#FF9ECE', '#7EDCE2', '#FFC3A0'
];
