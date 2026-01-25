'use client';
import { useMemo, useState, Fragment } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateTimeSlots } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlotAssignmentDialog } from './SlotAssignmentDialog';
import { Button } from '@/components/ui/button';
import { GripVertical, Merge, Unplug, X } from 'lucide-react';
import type { Slot as SlotType } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function Timetable() {
  const { state, dispatch } = useAppContext();
  const { slots, settings, mergeMode } = state;
  const [activeSlot, setActiveSlot] = useState<SlotType | null>(null);

  const timeSlots = useMemo(() => {
    return generateTimeSlots(settings.timeRange.start, settings.timeRange.end, 60);
  }, [settings.timeRange]);

  const handleMerge = () => {
    dispatch({ type: 'MERGE_SELECTED_SLOTS' });
  };
  
  const handleUnmerge = (groupId: string) => {
    dispatch({ type: 'UNMERGE_SLOTS', payload: groupId });
  };

  const slotsMap = useMemo(() => {
    const map = new Map<string, SlotType>();
    Object.values(slots).forEach(slot => {
      map.set(slot.id, slot);
    });
    return map;
  }, [slots]);

  const renderedMergedGroupIds = new Set<string>();

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>My Timetable</CardTitle>
        <CardDescription>
          Click a slot to add a subject. Use merge mode to combine slots for labs.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="timetable-grid min-w-[700px]">
          <div></div> {/* Empty cell for top-left corner */}
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

                if (slot.mergedGroupId) {
                  if (renderedMergedGroupIds.has(slot.mergedGroupId)) {
                    return null; // Already rendered as part of a merged block
                  }

                  const mergedGroup = Object.values(slots).filter(s => s.mergedGroupId === slot.mergedGroupId);
                  const firstSlot = mergedGroup.sort((a,b) => a.startTime.localeCompare(b.startTime))[0];

                  if (firstSlot.id === slot.id) {
                    renderedMergedGroupIds.add(slot.mergedGroupId);
                    return (
                      <div
                        key={firstSlot.id}
                        className="relative"
                        style={{ gridRow: `span ${mergedGroup.length}` }}
                      >
                         <Slot
                            slot={firstSlot}
                            isMerged={true}
                            mergeCount={mergedGroup.length}
                            onClick={() => setActiveSlot(firstSlot)}
                            onUnmerge={(e) => { e.stopPropagation(); handleUnmerge(firstSlot.mergedGroupId!); }}
                         />
                      </div>
                    );
                  }
                  return null;
                }
                
                return <Slot key={slot.id} slot={slot} onClick={() => setActiveSlot(slot)} />;
              })}
            </Fragment>
          ))}
        </div>

        {activeSlot && (
          <SlotAssignmentDialog
            slot={activeSlot}
            isOpen={!!activeSlot}
            onClose={() => setActiveSlot(null)}
          />
        )}
      </CardContent>
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
        {mergeMode.enabled && mergeMode.selectedSlots.length > 1 && (
            <Button onClick={handleMerge}>
                <Merge className="mr-2 h-4 w-4" /> Merge {mergeMode.selectedSlots.length} slots
            </Button>
        )}
        <Button
            variant={mergeMode.enabled ? 'destructive' : 'default'}
            onClick={() => dispatch({ type: 'TOGGLE_MERGE_MODE' })}
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
            aria-label={mergeMode.enabled ? 'Cancel Merge Mode' : 'Enable Merge Mode'}
        >
            {mergeMode.enabled ? <X className="h-6 w-6" /> : <Merge className="h-6 w-6" />}
        </Button>
      </div>
    </Card>
  );
}

const Slot = ({ slot, isMerged, mergeCount, onClick, onUnmerge }: { slot: SlotType, isMerged?: boolean, mergeCount?: number, onClick: () => void, onUnmerge?: (e: React.MouseEvent) => void }) => {
    const { state, dispatch } = useAppContext();
    const { mergeMode } = state;
    const isSelectedForMerge = mergeMode.enabled && mergeMode.selectedSlots.includes(slot.id);

    const handleClick = () => {
        if (mergeMode.enabled) {
            dispatch({ type: 'ADD_SLOT_TO_MERGE', payload: slot.id });
        } else {
            onClick();
        }
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "h-full w-full rounded-lg p-2 flex flex-col justify-between transition-all cursor-pointer relative",
                slot.subject ? 'text-white' : 'bg-muted/50 hover:bg-muted',
                isMerged ? 'justify-start' : 'justify-between',
                mergeMode.enabled && 'hover:bg-accent/50',
                isSelectedForMerge && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
            style={{ backgroundColor: slot.subject ? slot.color : undefined }}
        >
            {slot.subject ? (
                <>
                    <div className="flex-grow">
                        <p className="font-bold text-sm leading-tight">{slot.subject}</p>
                        <p className="text-xs opacity-80">{slot.type}</p>
                    </div>
                    {isMerged && onUnmerge && (
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-white hover:bg-white/20 hover:text-white" onClick={(e) => { e.stopPropagation(); onUnmerge(e); }}>
                        <Unplug className="h-4 w-4" />
                      </Button>
                    )}
                    {isMerged && (
                      <div className="absolute bottom-1 right-1 flex items-center text-xs opacity-80">
                         <GripVertical className="h-4 w-4 mr-1" />
                         <span>{mergeCount} slots</span>
                      </div>
                    )}
                </>
            ) : (
                <div className="text-center text-muted-foreground text-xs self-center">+ Add</div>
            )}
        </div>
    );
};
