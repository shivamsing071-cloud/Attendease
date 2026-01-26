'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CalendarOff, CalendarPlus, CalendarX, Palmtree, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoreMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onSettingsClick: () => void;
}

const menuItems = [
    { id: 'holidays', label: 'Holidays', icon: CalendarOff, description: 'Manage public holidays' },
    { id: 'extra-classes', label: 'Extra Classes', icon: CalendarPlus, description: 'Schedule additional classes' },
    { id: 'cancellations', label: 'Cancellations', icon: CalendarX, description: 'Track cancelled classes' },
    { id: 'semester-breaks', label: 'Semester Breaks', icon: Palmtree, description: 'Manage break periods' },
];

export function MoreMenu({ open, onOpenChange, activeTab, onTabChange, onSettingsClick }: MoreMenuProps) {
    const handleItemClick = (tabId: string) => {
        onTabChange(tabId);
        onOpenChange(false);
    };

    const handleSettingsClick = () => {
        onSettingsClick();
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-xl">
                <SheetHeader className="pb-4">
                    <SheetTitle>More Options</SheetTitle>
                    <SheetDescription>
                        Access additional features and settings
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-2 pb-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <Button
                                key={item.id}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "h-auto justify-start gap-4 px-4 py-3",
                                    isActive && "bg-primary/10"
                                )}
                                onClick={() => handleItemClick(item.id)}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                <div className="flex flex-col items-start">
                                    <span className={cn("font-medium", isActive && "text-primary")}>
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.description}
                                    </span>
                                </div>
                            </Button>
                        );
                    })}
                    <hr className="my-2" />
                    <Button
                        variant="ghost"
                        className="h-auto justify-start gap-4 px-4 py-3"
                        onClick={handleSettingsClick}
                    >
                        <Settings className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                            <span className="font-medium">Settings</span>
                            <span className="text-xs text-muted-foreground">
                                Manage app data and preferences
                            </span>
                        </div>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
