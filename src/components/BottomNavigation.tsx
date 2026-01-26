'use client';

import { CalendarCheck, LayoutGrid, BarChart3, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onMoreClick: () => void;
}

const navItems = [
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: LayoutGrid },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

export function BottomNavigation({ activeTab, onTabChange, onMoreClick }: BottomNavigationProps) {
    const isMoreActive = ['holidays', 'extra-classes', 'cancellations', 'semester-breaks'].includes(activeTab);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className={cn(
                                "text-xs font-medium",
                                isActive && "text-primary"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
                <button
                    onClick={onMoreClick}
                    className={cn(
                        "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                        isMoreActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "text-primary")} />
                    <span className={cn(
                        "text-xs font-medium",
                        isMoreActive && "text-primary"
                    )}>
                        More
                    </span>
                </button>
            </div>
        </nav>
    );
}
