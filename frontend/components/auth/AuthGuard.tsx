"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { fetchMe } from '@/lib/redux/slices/authSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, userEmail } = useAppSelector((state) => state.auth);
  const hasChecked = useRef(false);

  const authPaths = ['/login', '/register'];

  // Call fetchMe ONCE on mount only — never re-call it in a loop
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      // Only fetch if we don't already have a stored session
      if (!isAuthenticated) {
        dispatch(fetchMe());
      }
    }
  }, []); // Empty deps — runs exactly once

  // Redirect reactively based on auth state changes
  useEffect(() => {
    if (isLoading) return; // Wait for the check to finish

    if (!isAuthenticated && !authPaths.includes(pathname)) {
      router.push('/login');
    } else if (isAuthenticated && authPaths.includes(pathname)) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Show loader only during the initial check (loading + no cached email)
  if (isLoading && !userEmail && !authPaths.includes(pathname)) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-black uppercase tracking-widest text-[10px]">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
