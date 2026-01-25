'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { HolidayDialog } from './HolidayDialog';
import { collection, doc } from 'firebase/firestore';
import { useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { format } from 'date-fns';

export default function Holidays() {
    const { state } = useAppContext();
    const { holidays } = state;
    const { firestore } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const holidayList = Object.values(holidays).sort((a,b) => a.date.localeCompare(b.date));
    
    const handleDelete = (holidayId: string) => {
        const holidayRef = doc(collection(firestore, 'holidays'), holidayId);
        deleteDocumentNonBlocking(holidayRef);
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Holiday Manager</CardTitle>
                <CardDescription>
                Add, view, or remove holidays.
                </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Holiday
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {holidayList.length > 0 ? (
            <div className="space-y-2">
                {holidayList.map(holiday => (
                    <div key={holiday.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="font-semibold">{holiday.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(holiday.date), 'MMMM d, yyyy')} - <span className="font-medium">{holiday.type}</span>
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(holiday.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center gap-2 text-center p-8 border-dashed border-2 rounded-lg">
                <h3 className="text-xl font-bold tracking-tight font-headline">No Holidays Added</h3>
                <p className="text-sm text-muted-foreground">
                    Click "Add Holiday" to add your first holiday.
                </p>
            </div>
        )}
      </CardContent>
      <HolidayDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </Card>
  );
}
