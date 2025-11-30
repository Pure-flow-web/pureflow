"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading, setUser } = useStore();
  const { user: firebaseUser, isLoading: isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // This listener is the single source of truth for auth state
    setUser(firebaseUser);
  }, [firebaseUser, setUser]);

  const isLoading = isAuthLoading || isUserLoading;

  useEffect(() => {
    if (isLoading) return; // Wait until auth state is confirmed

    const isAppRoute = pathname.startsWith('/app');
    const isAuthRoute = pathname === '/';

    if (!user && isAppRoute) {
        // If not logged in and trying to access a protected page, redirect to login
        router.replace('/');
    }
    
    if(user && isAuthRoute) {
        // If logged in and on the login page, redirect to dashboard
        router.replace('/app');
    }

  }, [user, isLoading, pathname, router]);

  // While loading auth state, show a generic loader
  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    );
  }

  // Prevent flicker on protected routes
  if (!user && pathname.startsWith('/app')) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    );
  }

  // Prevent flicker on auth route
  if (user && pathname === '/') {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    );
  }

  return <>{children}</>;
}
