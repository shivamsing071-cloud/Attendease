import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts/AppContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthManager } from '@/components/AuthManager';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'AttendEase',
  description: 'Personal Weekly Attendance Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AttendEase" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className={cn("font-body antialiased", "min-h-screen bg-background")}>
        <FirebaseClientProvider>
          <AuthManager>
            <AppProvider>
              {children}
            </AppProvider>
          </AuthManager>
        </FirebaseClientProvider>
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
