import { BookCheck } from 'lucide-react';
import { SettingsButton } from './SettingsButton';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <BookCheck className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold text-foreground">AttendEase</h1>
        </a>
      </nav>
      <div>
        <SettingsButton />
      </div>
    </header>
  );
}
