'use client';
import { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SubjectCard } from './SubjectCard';
import type { Slot } from '@/lib/types';
import { getWeekDates, isDateInSemesterBreak } from '@/lib/utils';
import { format } from 'date-fns';

interface SubjectAnalytics {
  name: string;
  totalSlots: number;
  attendedSlots: number;
  attendancePercentage: number;
  isSafe: boolean;
  color: string;
}

export default function Dashboard() {
  const { state } = useAppContext();
  const { slots, attendance, settings, semesterBreaks } = state;

  const analytics = useMemo((): SubjectAnalytics[] => {
    const subjects: Record<string, { name: string; total: number; attended: number; color: string }> = {};

    // Aggregate all slots and attendance across all weeks
    Object.values(slots).forEach(slot => {
      if (slot.subject) {
        if (!subjects[slot.subject]) {
          subjects[slot.subject] = { name: slot.subject, total: 0, attended: 0, color: slot.color };
        }
      }
    });

    Object.entries(attendance).forEach(([weekId, weeklyAttendance]) => {
      const weekDates = getWeekDates(weekId);
      const dayIndices: { [key: string]: number } = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };

      Object.entries(weeklyAttendance).forEach(([slotId, status]) => {
        const slot = slots[slotId];
        if (slot && slot.subject && subjects[slot.subject]) {
          // Calculate date for this slot
          const dayIndex = dayIndices[slot.day];
          const slotDate = dayIndex !== undefined ? weekDates[dayIndex] : null;

          // Check if in semester break
          const inBreak = slotDate ? isDateInSemesterBreak(slotDate, Object.values(semesterBreaks)) : false;

          if (!inBreak) {
            subjects[slot.subject].total++;
            if (status === 'present') {
              subjects[slot.subject].attended++;
            }
          }
        }
      });
    });

    return Object.values(subjects).map(subject => {
      const attendancePercentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 0;
      return {
        name: subject.name,
        totalSlots: subject.total,
        attendedSlots: subject.attended,
        attendancePercentage,
        isSafe: attendancePercentage >= settings.targetPercentage,
        color: subject.color,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [slots, attendance, settings.targetPercentage, semesterBreaks]);

  if (analytics.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight font-headline">No Data Yet</h3>
          <p className="text-sm text-muted-foreground">
            Assign subjects to your timetable and track attendance to see your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
      {analytics.map(subject => (
        <SubjectCard key={subject.name} subject={subject} />
      ))}
    </div>
  );
}
