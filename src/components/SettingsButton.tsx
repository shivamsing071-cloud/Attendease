'use client';

import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export function SettingsButton() {
    const { dispatch } = useAppContext();
    return (
        <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'SET_SETTINGS_OPEN', payload: true })}>
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
        </Button>
    );
}
