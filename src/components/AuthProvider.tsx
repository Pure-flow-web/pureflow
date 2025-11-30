"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { PageLoader } from "./LoadingSpinner";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, [setUser, isClient]);
  
  useEffect(() => {
    if (!isClient || isLoading) return;
    
    const isAuthPage = pathname === '/';
    
    if (!user && !isAuthPage) {
        router.replace('/');
    }
    
    if(user && isAuthPage) {
        router.replace('/dashboard');
    }

  }, [user, isLoading, pathname, router, isClient])

  if (isLoading || !isClient) {
    return <PageLoader />;
  }

  const isAuthPage = pathname === '/';
  if (user && isAuthPage) {
    return <PageLoader />;
  }
  if (!user && !isAuthPage) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
