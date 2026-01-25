'use client';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Timetable from '@/components/Timetable';
import Dashboard from '@/components/Dashboard';
import Attendance from '@/components/Attendance';
import Settings from '@/components/Settings';
import Holidays from '@/components/Holidays';
import ExtraClasses from '@/components/ExtraClasses';
import { useAppContext } from '@/contexts/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Merge, X } from 'lucide-react';

export default function Home() {
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="extra-classes">Extra Classes</TabsTrigger>
          </TabsList>
          <TabsContent value="timetable">
            <Timetable />
          </TabsContent>
          <TabsContent value="attendance">
            <Attendance />
          </TabsContent>
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          <TabsContent value="holidays">
            <Holidays />
          </TabsContent>
          <TabsContent value="extra-classes">
            <ExtraClasses />
          </TabsContent>
        </Tabs>
        <Sheet open={state.isSettingsOpen} onOpenChange={(isOpen) => dispatch({ type: 'SET_SETTINGS_OPEN', payload: isOpen })}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Application Settings</SheetTitle>
              <SheetDescription>
                Manage your application data and settings.
              </SheetDescription>
            </SheetHeader>
            <Settings />
          </SheetContent>
        </Sheet>
      </main>
      {activeTab === 'timetable' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {state.mergeMode.enabled && state.mergeMode.selectedSlots.length > 1 && (
              <Button onClick={() => dispatch({ type: 'MERGE_SELECTED_SLOTS' })}>
                  <Merge className="mr-2 h-4 w-4" /> Merge {state.mergeMode.selectedSlots.length} slots
              </Button>
          )}
          <Button
              variant={state.mergeMode.enabled ? 'destructive' : 'default'}
              onClick={() => dispatch({ type: 'TOGGLE_MERGE_MODE' })}
              className="h-14 w-14 rounded-full shadow-lg"
              size="icon"
              aria-label={state.mergeMode.enabled ? 'Cancel Merge Mode' : 'Enable Merge Mode'}
          >
              {state.mergeMode.enabled ? <X className="h-6 w-6" /> : <Merge className="h-6 w-6" />}
          </Button>
        </div>
      )}
    </div>
  );
}
