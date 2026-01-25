'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COLORS } from '@/lib/utils';
import type { Slot } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  type: z.enum(['Lecture', 'Lab']),
  color: z.string(),
});

type SlotFormValues = z.infer<typeof formSchema>;

interface SlotAssignmentDialogProps {
  slot: Slot;
  isOpen: boolean;
  onClose: () => void;
}

export function SlotAssignmentDialog({ slot, isOpen, onClose }: SlotAssignmentDialogProps) {
  const { state, dispatch } = useAppContext();

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: slot.subject || '',
      type: slot.type || 'Lecture',
      color: slot.color || COLORS[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        subject: slot.subject || '',
        type: slot.type || 'Lecture',
        color: slot.color || state.settings.subjectColors[slot.subject] || COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }, [isOpen, slot, form, state.settings.subjectColors]);

  const onSubmit = (values: SlotFormValues) => {
    const updatedSlot: Slot = {
      ...slot,
      ...values,
    };
    dispatch({ type: 'UPDATE_SLOT', payload: updatedSlot });
    
    if (!state.settings.subjectColors[values.subject] || state.settings.subjectColors[values.subject] !== values.color) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: {
        subjectColors: { ...state.settings.subjectColors, [values.subject]: values.color }
      }});
    }

    onClose();
  };
  
  const handleClearSlot = () => {
    dispatch({ type: 'CLEAR_SLOT', payload: slot.id });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{slot.subject ? 'Edit Slot' : 'Assign Slot'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Input placeholder="e.g. Computer Science" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button
                          type="button"
                          key={color}
                          className={`h-8 w-8 rounded-full border-2 ${field.value === color ? 'border-primary' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="!mt-6 sm:justify-between">
                <div>
                {slot.subject && (
                    <Button type="button" variant="destructive" onClick={handleClearSlot}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Slot
                    </Button>
                )}
                </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
