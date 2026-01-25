'use client';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Timetable from '@/components/Timetable';
import Dashboard from '@/components/Dashboard';
import Attendance from '@/components/Attendance';
import Settings from '@/components/Settings';
import { useAppContext } from '@/contexts/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function Home() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
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
    </div>
  );
}
