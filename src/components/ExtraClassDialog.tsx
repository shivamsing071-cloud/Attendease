'use client';
import { useEffect, useMemo } from 'react';
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
import { useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { ExtraClass } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { Switch } from './ui/switch';

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  date: z.date({ required_error: 'A date is required.' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  type: z.enum(['Lecture', 'Lab']),
  attended: z.boolean(),
});

type ExtraClassFormValues = z.infer<typeof formSchema>;

interface ExtraClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  extraClass?: ExtraClass;
}

export function ExtraClassDialog({ isOpen, onClose, extraClass }: ExtraClassDialogProps) {
  const { firestore } = useFirebase();
  const { state } = useAppContext();

  const subjects = useMemo(() => {
    const subjectSet = new Set(Object.values(state.slots).map(s => s.subject).filter(Boolean));
    return Array.from(subjectSet);
  }, [state.slots]);

  const form = useForm<ExtraClassFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      type: 'Lecture',
      attended: true,
    },
  });
  
  useEffect(() => {
    if(isOpen) {
        form.reset(extraClass ? {
            ...extraClass,
            date: new Date(extraClass.date)
        } : {
            subject: '',
            type: 'Lecture',
            attended: true,
        });
    }
  }, [isOpen, extraClass, form])

  const onSubmit = (values: ExtraClassFormValues) => {
    const classData = {
        ...values,
        date: format(values.date, 'yyyy-MM-dd')
    }
    
    if (extraClass) {
        const extraClassRef = doc(firestore, 'extraClasses', extraClass.id);
        updateDocumentNonBlocking(extraClassRef, classData);
    } else {
        const extraClassesCollection = collection(firestore, 'extraClasses');
        addDocumentNonBlocking(extraClassesCollection, classData);
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{extraClass ? 'Edit' : 'Add'} Extra Class</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                        <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="attended"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Attended</FormLabel>
                        <FormMessage />
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
            <DialogFooter className="!mt-6">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Class</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
