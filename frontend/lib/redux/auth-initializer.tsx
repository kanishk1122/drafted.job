"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authService } from "@/lib/services/auth-service";
import { loginSuccess, loginFailure, logout } from "@/lib/redux/slices/authSlice";
import { RootState } from "./store";
import { Loader2 } from "lucide-react";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have the is_authenticated flag in localStorage as a hint
      const wasAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      
      if (wasAuthenticated) {
        try {
          const userData = await authService.getMe();
          dispatch(loginSuccess({
            id: userData.id,
            full_name: userData.full_name,
            email: userData.email,
          }));
        } catch (error) {
          console.error("Session verification failed:", error);
          dispatch(logout());
        }
      }
      setInitializing(false);
    };

    initializeAuth();
  }, [dispatch]);

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse pointer-events-none" />
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
           Verifying Digital Credentials...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
