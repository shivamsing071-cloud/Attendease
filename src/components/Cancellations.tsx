'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { CancellationDialog } from './CancellationDialog';
import { collection, doc } from 'firebase/firestore';
import { useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { format } from 'date-fns';
import type { Cancellation } from '@/lib/types';

export default function Cancellations() {
    const { state } = useAppContext();
    const { cancellations, slots } = state;
    const { firestore } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const cancellationList = Object.values(cancellations).sort((a, b) => {
        // Sort by date, then time
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;

        const slotA = slots[a.slotId];
        const slotB = slots[b.slotId];
        if (!slotA) return -1;
        if (!slotB) return 1;

        return slotA.startTime.localeCompare(slotB.startTime);
    });

    const handleDelete = (cancellationId: string) => {
        const cancellationRef = doc(collection(firestore, 'cancellations'), cancellationId);
        deleteDocumentNonBlocking(cancellationRef);
    }

    const handleAdd = () => {
        setIsDialogOpen(true);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Class Cancellations</CardTitle>
                        <CardDescription>
                            View and manage cancelled classes.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAdd} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Cancel a Class
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {cancellationList.length > 0 ? (
                    <div className="space-y-2">
                        {cancellationList.map(c => {
                            const slot = slots[c.slotId];
                            const startTime = slot ? slot.startTime : 'Unknown time';
                            const endTime = slot ? slot.endTime : 'Unknown time';
                            const type = slot ? slot.type : 'Unknown type';

                            return (
                                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="font-semibold">{c.subject} <span className="text-xs font-normal text-muted-foreground">({type})</span></p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(c.date), 'MMMM d, yyyy')} | {startTime} - {endTime}
                                        </p>
                                        <p className="text-sm text-red-500 mt-1">Reason: {c.reason}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center p-8 border-dashed border-2 rounded-lg">
                        <h3 className="text-xl font-bold tracking-tight font-headline">No Cancellations</h3>
                        <p className="text-sm text-muted-foreground">
                            Click "Cancel a Class" to add one.
                        </p>
                    </div>
                )}
            </CardContent>
            <CancellationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </Card>
    );
}
