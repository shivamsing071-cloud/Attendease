'use client';
import { useState, useMemo, Fragment, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateTimeSlots, getWeekId, getWeekOptions, getWeekDates, isDateInSemesterBreak } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, CircleSlash, GripVertical, AlertCircle, Coffee } from 'lucide-react';
import type { Slot as SlotType, AttendanceStatus, Cancellation, SemesterBreak } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Attendance() {
  const { state, dispatch } = useAppContext();
  const { slots, settings, attendance, cancellations, semesterBreaks } = state;
  const [currentWeek, setCurrentWeek] = useState(getWeekId(new Date()));

  const timeSlots = useMemo(() => {
    return generateTimeSlots(settings.timeRange.start, settings.timeRange.end, 60);
  }, [settings.timeRange]);

  const weekOptionsByMonth = useMemo(() => getWeekOptions(settings.semesterStart), [settings.semesterStart]);
  const monthOptions = useMemo(() => weekOptionsByMonth.map(group => group.month), [weekOptionsByMonth]);

  const selectedMonth = useMemo(() => {
    const group = weekOptionsByMonth.find(g => g.weeks.some(w => w.value === currentWeek));
    return group?.month;
  }, [currentWeek, weekOptionsByMonth]);

  const weeksForSelectedMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return weekOptionsByMonth.find(group => group.month === selectedMonth)?.weeks || [];
  }, [selectedMonth, weekOptionsByMonth]);

  useEffect(() => {
    if (weekOptionsByMonth.length > 0 && !selectedMonth) {
      // Current week is not in the options, default to the first available week
      setCurrentWeek(weekOptionsByMonth[0]?.weeks[0]?.value || '');
    }
  }, [weekOptionsByMonth, selectedMonth]);

  const handleMonthChange = (month: string) => {
    const newWeeks = weekOptionsByMonth.find(group => group.month === month)?.weeks;
    if (newWeeks && newWeeks.length > 0) {
      setCurrentWeek(newWeeks[0].value);
    }
  };

  const handleSetAttendance = (slotId: string, status: AttendanceStatus) => {
    const slot = state.slots[slotId];
    if (slot && slot.mergedGroupId) {
      const groupSlots = Object.values(state.slots).filter(s => s.mergedGroupId === slot.mergedGroupId);
      groupSlots.forEach(s => {
        dispatch({ type: 'SET_ATTENDANCE', payload: { weekId: currentWeek, slotId: s.id, status } });
      });
    } else {
      dispatch({ type: 'SET_ATTENDANCE', payload: { weekId: currentWeek, slotId, status } });
    }
  };

  const handleBulkAction = (status: AttendanceStatus) => {
    dispatch({ type: 'SET_BULK_ATTENDANCE', payload: { weekId: currentWeek, status } });
  }

  const handleClearWeek = () => {
    dispatch({ type: 'CLEAR_WEEK_ATTENDANCE', payload: { weekId: currentWeek } });
  }

  const slotsMap = useMemo(() => {
    const map = new Map<string, SlotType>();
    Object.values(slots).forEach(slot => {
      map.set(slot.id, slot);
    });
    return map;
  }, [slots]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>
              Toggle attendance for each slot for the selected week.
            </CardDescription>
          </div>
          <div className="mt-4 flex flex-col gap-2 md:mt-0 md:flex-row">
            <Select value={selectedMonth || ''} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select a month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentWeek} onValueChange={setCurrentWeek} disabled={!selectedMonth}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Select a week" />
              </SelectTrigger>
              <SelectContent>
                {weeksForSelectedMonth.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-4 flex-wrap">
          <Button onClick={() => handleBulkAction('present')} size="sm" variant="outline"><Check className="mr-2 h-4 w-4 text-green-500" />Mark All Present</Button>
          <Button onClick={() => handleBulkAction('absent')} size="sm" variant="outline"><X className="mr-2 h-4 w-4 text-red-500" />Mark All Absent</Button>
          <Button onClick={handleClearWeek} size="sm" variant="destructive"><CircleSlash className="mr-2 h-4 w-4" />Clear Week</Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="timetable-grid min-w-[700px]">
          <div></div>
          {settings.days.map(day => (
            <div key={day} className="flex items-center justify-center font-headline font-semibold">
              {day.substring(0, 3)}
            </div>
          ))}

          {timeSlots.map(({ startTime }) => (
            <Fragment key={startTime}>
              <div className="flex items-center justify-center text-xs text-muted-foreground pr-2 text-right">
                {startTime}
              </div>
              {settings.days.map(day => {
                const slotId = `${day.toLowerCase()}-${startTime.replace(':', '')}`;
                const slot = slotsMap.get(slotId);

                if (!slot) return <div key={slotId} />;

                // Calculate date for this slot
                const weekDates = getWeekDates(currentWeek);
                const dayIndices: { [key: string]: number } = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
                const dayIndex = dayIndices[day];
                const slotDate = dayIndex !== undefined ? weekDates[dayIndex] : null;
                const dateStr = slotDate ? format(slotDate, 'yyyy-MM-dd') : null;

                // Check if cancelled
                const cancellation = dateStr ? Object.values(cancellations).find(c => c.slotId === slot.id && c.date === dateStr) : null;
                const isCancelled = !!cancellation;

                // Check if in semester break
                const semesterBreak = slotDate ? isDateInSemesterBreak(slotDate, Object.values(semesterBreaks)) : null;
                const isInBreak = !!semesterBreak;

                if (slot.mergedGroupId) {
                  const mergedGroup = Object.values(slots).filter(s => s.mergedGroupId === slot.mergedGroupId);
                  const firstSlotInGroup = mergedGroup.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
                  if (slot.id !== firstSlotInGroup.id) {
                    return <div key={slotId} className="hidden" />;
                  }
                }

                if (slot.subject === '' && !slot.mergedGroupId) {
                  return <div key={slotId} className="bg-muted/20 rounded-lg" />;
                }

                const status = attendance[currentWeek]?.[slot.id] || 'none';
                const isMerged = !!slot.mergedGroupId;
                let mergeCount: number | undefined;
                let slotToRender = slot;

                if (isMerged) {
                  const mergedGroup = Object.values(slots).filter(s => s.mergedGroupId === slot.mergedGroupId);
                  mergeCount = mergedGroup.length;
                  slotToRender = mergedGroup.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
                }

                if (isMerged && slot.id !== slotToRender.id) {
                  return null;
                }

                return (
                  <div
                    key={slot.id}
                    className="relative h-full"
                    style={{ gridRow: isMerged ? `span ${mergeCount}` : 'span 1' }}
                  >
                    <AttendanceSlot
                      slot={slotToRender}
                      status={attendance[currentWeek]?.[slotToRender.id] || 'none'}
                      onStatusChange={(newStatus) => handleSetAttendance(slotToRender.id, newStatus)}
                      isMerged={isMerged}
                      mergeCount={mergeCount}
                      isCancelled={isCancelled}
                      cancellationReason={cancellation ? cancellation.reason : undefined}
                      isInBreak={isInBreak}
                      breakName={semesterBreak ? semesterBreak.name : undefined}
                    />
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const AttendanceSlot = ({ slot, status, onStatusChange, isMerged, mergeCount, isCancelled, cancellationReason, isInBreak, breakName }: { slot: SlotType, status: AttendanceStatus, onStatusChange: (status: AttendanceStatus) => void, isMerged?: boolean, mergeCount?: number, isCancelled?: boolean, cancellationReason?: string, isInBreak?: boolean, breakName?: string }) => {
  const isDisabled = isCancelled || isInBreak;
  return (
    <TooltipProvider>
      <div
        className={cn(
          "h-full w-full rounded-lg p-2 flex flex-col text-white relative",
          isDisabled && "opacity-70 grayscale"
        )}
        style={{ backgroundColor: !isDisabled ? slot.color : isInBreak ? '#4b5563' : '#6b7280' }}
      >
        <div className="flex-grow">
          <p className="font-bold text-sm leading-tight flex items-center gap-1">
            {slot.subject}
            {isCancelled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-red-100" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancelled: {cancellationReason}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isInBreak && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Coffee className="h-4 w-4 text-yellow-100" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Academic Break: {breakName}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </p>
          <p className="text-xs opacity-80">{slot.type}</p>
          {isCancelled && <p className="text-xs font-bold text-red-100 mt-1">CANCELLED</p>}
          {isInBreak && !isCancelled && <p className="text-xs font-bold text-yellow-100 mt-1">ACADEMIC BREAK</p>}
        </div>

        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            disabled={isDisabled}
            className={cn(
              "h-7 w-7 rounded-full",
              status === 'present'
                ? 'bg-green-500/90 hover:bg-green-600 text-white'
                : 'bg-white/30 hover:bg-white/50 text-white',
              isDisabled && 'opacity-0 cursor-not-allowed hidden'
            )}
            onClick={() => onStatusChange(status === 'present' ? 'none' : 'present')}
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={isDisabled}
            className={cn(
              "h-7 w-7 rounded-full",
              status === 'absent'
                ? 'bg-red-500/90 hover:bg-red-600 text-white'
                : 'bg-white/30 hover:bg-white/50 text-white',
              isDisabled && 'opacity-0 cursor-not-allowed hidden'
            )}
            onClick={() => onStatusChange(status === 'absent' ? 'none' : 'absent')}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isMerged && (
          <div className="absolute bottom-2 left-2 flex items-center text-xs opacity-80">
            <GripVertical className="h-4 w-4 mr-1" />
            <span>{mergeCount} slots</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
