'use client';
import { useState, useMemo, Fragment } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateTimeSlots, getWeekId, getWeekOptions } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, CircleSlash, GripVertical } from 'lucide-react';
import type { Slot as SlotType, AttendanceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function Attendance() {
  const { state, dispatch } = useAppContext();
  const { slots, settings, attendance } = state;
  const [currentWeek, setCurrentWeek] = useState(getWeekId(new Date()));

  const timeSlots = useMemo(() => {
    return generateTimeSlots(settings.timeRange.start, settings.timeRange.end, 60);
  }, [settings.timeRange]);
  
  const weekOptions = useMemo(() => getWeekOptions(settings.semesterStart), [settings.semesterStart]);

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
      dispatch({ type: 'SET_BULK_ATTENDANCE', payload: { weekId: currentWeek, status }});
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

  const renderedMergedGroupIds = new Set<string>();

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
            <div className="mt-4 md:mt-0">
                <Select value={currentWeek} onValueChange={setCurrentWeek}>
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select a week" />
                    </SelectTrigger>
                    <SelectContent>
                        {weekOptions.map(opt => (
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

                  if (!slot.subject) return <div key={slotId} className="bg-muted/20 rounded-lg" />;

                  if (slot.mergedGroupId) {
                    if (renderedMergedGroupIds.has(slot.mergedGroupId)) {
                      return null; // Already rendered
                    }
                    const mergedGroup = Object.values(slots).filter(s => s.mergedGroupId === slot.mergedGroupId);
                    const firstSlot = mergedGroup.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

                    if (firstSlot.id === slot.id) {
                      renderedMergedGroupIds.add(slot.mergedGroupId);
                      const status = attendance[currentWeek]?.[firstSlot.id] || 'none';
                      return (
                        <div
                          key={firstSlot.id}
                          className="relative"
                          style={{ gridRow: `span ${mergedGroup.length}` }}
                        >
                          <AttendanceSlot
                            slot={firstSlot}
                            status={status}
                            onStatusChange={(newStatus) => handleSetAttendance(firstSlot.id, newStatus)}
                            isMerged={true}
                            mergeCount={mergedGroup.length}
                          />
                        </div>
                      );
                    }
                    return null;
                  }

                  const status = attendance[currentWeek]?.[slot.id] || 'none';
                  return <AttendanceSlot key={slot.id} slot={slot} status={status} onStatusChange={(newStatus) => handleSetAttendance(slot.id, newStatus)} />;
              })}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const AttendanceSlot = ({ slot, status, onStatusChange, isMerged, mergeCount }: { slot: SlotType, status: AttendanceStatus, onStatusChange: (status: AttendanceStatus) => void, isMerged?: boolean, mergeCount?: number }) => {
    return (
        <div
            className="h-full w-full rounded-lg p-2 flex flex-col justify-between text-white"
            style={{ backgroundColor: slot.color }}
        >
            <div>
                <p className="font-bold text-sm leading-tight">{slot.subject}</p>
                <p className="text-xs opacity-80">{slot.type}</p>
            </div>
            <div className="flex justify-end items-center gap-1">
                {isMerged && (
                    <div className="flex items-center text-xs opacity-80 mr-auto">
                        <GripVertical className="h-4 w-4 mr-1" />
                        <span>{mergeCount} slots</span>
                    </div>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "h-7 w-7 rounded-full",
                        status === 'present'
                            ? 'bg-green-500/90 hover:bg-green-600 text-white'
                            : 'bg-white/20 hover:bg-white/40 text-white/80'
                    )}
                    onClick={() => onStatusChange(status === 'present' ? 'none' : 'present')}
                >
                    <Check className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                      "h-7 w-7 rounded-full",
                      status === 'absent'
                          ? 'bg-red-500/90 hover:bg-red-600 text-white'
                          : 'bg-white/20 hover:bg-white/40 text-white/80'
                  )}
                  onClick={() => onStatusChange(status === 'absent' ? 'none' : 'absent')}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
