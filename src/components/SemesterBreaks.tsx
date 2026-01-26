'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar } from 'lucide-react';
import { SemesterBreakDialog } from './SemesterBreakDialog';
import { collection, doc } from 'firebase/firestore';
import { useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function SemesterBreaks() {
    const { state } = useAppContext();
    const { semesterBreaks } = state;
    const { firestore } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const breakList = Object.values(semesterBreaks).sort((a, b) => a.startDate.localeCompare(b.startDate));

    const handleDelete = (breakId: string) => {
        const breakRef = doc(collection(firestore, 'semesterBreaks'), breakId);
        deleteDocumentNonBlocking(breakRef);
    }

    const handleAdd = () => {
        setIsDialogOpen(true);
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Midsem': return 'bg-blue-500';
            case 'Endsem': return 'bg-purple-500';
            case 'Vacation': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Semester Breaks</CardTitle>
                        <CardDescription>
                            Manage academic breaks. Classes during breaks are excluded from attendance.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAdd} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Semester Break
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {breakList.length > 0 ? (
                    <div className="space-y-2">
                        {breakList.map(b => {
                            const startDate = new Date(b.startDate);
                            const endDate = new Date(b.endDate);
                            const duration = differenceInDays(endDate, startDate) + 1;

                            return (
                                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold flex items-center gap-2">
                                                {b.name}
                                                <Badge className={getTypeColor(b.type)}>{b.type}</Badge>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')} ({duration} days)
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center p-8 border-dashed border-2 rounded-lg">
                        <h3 className="text-xl font-bold tracking-tight font-headline">No Semester Breaks</h3>
                        <p className="text-sm text-muted-foreground">
                            Click "Add Semester Break" to define academic breaks.
                        </p>
                    </div>
                )}
            </CardContent>
            <SemesterBreakDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </Card>
    );
}
