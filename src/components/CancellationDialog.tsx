'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useAppContext } from '@/contexts/AppContext';

const formSchema = z.object({
    date: z.date({ required_error: 'A date is required.' }),
    slotId: z.string().min(1, { message: 'Please select a class to cancel.' }),
    reason: z.string().min(3, { message: 'Reason must be at least 3 characters.' }),
});

type CancellationFormValues = z.infer<typeof formSchema>;

interface CancellationDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CancellationDialog({ isOpen, onClose }: CancellationDialogProps) {
    const { firestore } = useFirebase();
    const { state } = useAppContext();
    const { slots, settings } = state;

    const form = useForm<CancellationFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: '',
        },
    });

    const selectedDate = form.watch('date');

    const availableSlots = useMemo(() => {
        if (!selectedDate) return [];
        const dayName = format(selectedDate, 'EEEE');
        // Attendease uses full day names in settings (Monday, Tuesday...)
        // But slot IDs are like "monday-0900"

        // Check if the day is in the settings
        if (!settings.days.includes(dayName)) return [];

        const dayPrefix = dayName.toLowerCase();
        return Object.values(slots)
            .filter(slot => slot.id.startsWith(dayPrefix) && slot.subject) // Only show slots with subjects
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [selectedDate, slots, settings]);

    const onSubmit = (values: CancellationFormValues) => {
        const selectedSlot = slots[values.slotId];
        if (!selectedSlot) return;

        const cancellationData = {
            date: format(values.date, 'yyyy-MM-dd'),
            slotId: values.slotId,
            subject: selectedSlot.subject,
            reason: values.reason,
            createdAt: Date.now(),
        };

        const cancellationsCollection = collection(firestore, 'cancellations');
        addDocumentNonBlocking(cancellationsCollection, cancellationData);

        form.reset();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Class</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    form.setValue('slotId', ''); // Reset slot selection when date changes
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slotId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Class</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate || availableSlots.length === 0}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={!selectedDate ? "Select a date first" : availableSlots.length === 0 ? "No classes on this day" : "Select a class"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableSlots.map(slot => (
                                                <SelectItem key={slot.id} value={slot.id}>
                                                    {slot.subject} ({slot.type}) - {slot.startTime}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Professor unavailable" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="!mt-6">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Confirm Cancellation</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
