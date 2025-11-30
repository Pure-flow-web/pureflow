"use client";

import { useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { usePathname, useRouter } from "next/navigation";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setUser } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // This listener is the single source of truth for auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser]);
  
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

  return <>{children}</>;
}
