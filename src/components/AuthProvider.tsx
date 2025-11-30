"use client";

import { useEffect } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { PageLoader } from "./LoadingSpinner";

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    if (typeof document !== 'undefined') {
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
}

function eraseCookie(name: string) {
    if (typeof document !== 'undefined') {
        document.cookie = name+'=; Max-Age=-99999999; path=/;';
    }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setCookie('firebaseAuthToken', token, 1);
        setUser(firebaseUser);
      } else {
        eraseCookie('firebaseAuthToken');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);
  
  useEffect(() => {
    if (isLoading) return;
    
    const isAuthPage = pathname === '/';
    
    if (!user && !isAuthPage) {
        router.replace('/');
    }
    
    if(user && isAuthPage) {
        router.replace('/dashboard');
    }

  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
