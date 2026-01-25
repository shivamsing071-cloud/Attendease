'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { ExtraClassDialog } from './ExtraClassDialog';
import { collection, doc } from 'firebase/firestore';
import { useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { format } from 'date-fns';
import type { ExtraClass } from '@/lib/types';

export default function ExtraClasses() {
    const { state } = useAppContext();
    const { extraClasses } = state;
    const { firestore } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExtraClass, setSelectedExtraClass] = useState<ExtraClass | undefined>(undefined);

    const extraClassList = Object.values(extraClasses).sort((a,b) => a.date.localeCompare(b.date));
    
    const handleDelete = (extraClassId: string) => {
        const extraClassRef = doc(collection(firestore, 'extraClasses'), extraClassId);
        deleteDocumentNonBlocking(extraClassRef);
    }
    
    const handleEdit = (extraClass: ExtraClass) => {
        setSelectedExtraClass(extraClass);
        setIsDialogOpen(true);
    }

    const handleAdd = () => {
        setSelectedExtraClass(undefined);
        setIsDialogOpen(true);
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Extra Class Manager</CardTitle>
                <CardDescription>
                Add, view, or remove extra classes.
                </CardDescription>
            </div>
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Extra Class
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {extraClassList.length > 0 ? (
            <div className="space-y-2">
                {extraClassList.map(ec => (
                    <div key={ec.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="font-semibold">{ec.subject} <span className="text-xs font-normal text-muted-foreground">({ec.type})</span></p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(ec.date), 'MMMM d, yyyy')} | {ec.startTime} - {ec.endTime}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(ec)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(ec.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center gap-2 text-center p-8 border-dashed border-2 rounded-lg">
                <h3 className="text-xl font-bold tracking-tight font-headline">No Extra Classes Added</h3>
                <p className="text-sm text-muted-foreground">
                    Click "Add Extra Class" to add one.
                </p>
            </div>
        )}
      </CardContent>
      <ExtraClassDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        extraClass={selectedExtraClass}
        />
    </Card>
  );
}
