'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function Settings() {
  const { state, dispatch } = useAppContext();
  const { firestore } = useFirebase();
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);

  const handleReset = () => {
    if (!firestore) return;

    // Delete all holidays from Firestore
    const holidaysCollection = collection(firestore, 'holidays');
    Object.keys(state.holidays).forEach(holidayId => {
        const holidayRef = doc(holidaysCollection, holidayId);
        deleteDocumentNonBlocking(holidayRef);
    });

    // Delete all extra classes from Firestore
    const extraClassesCollection = collection(firestore, 'extraClasses');
    Object.keys(state.extraClasses).forEach(extraClassId => {
        const extraClassRef = doc(extraClassesCollection, extraClassId);
        deleteDocumentNonBlocking(extraClassRef);
    });
    
    // Reset local state
    dispatch({ type: 'RESET_STATE' });
    setIsResetAlertOpen(false);
  };

  return (
    <div className="space-y-4 pt-6">
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>This action is not reversible. Please be certain.</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete all your timetable slots, attendance records, holidays, extra classes, and settings from this device and from the cloud. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Yes, clear all data</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
  );
}
