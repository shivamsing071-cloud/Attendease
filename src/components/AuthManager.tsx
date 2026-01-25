'use client';

import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function AuthManager({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-lg p-8 space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-4">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
