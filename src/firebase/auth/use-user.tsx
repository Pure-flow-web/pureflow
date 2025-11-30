"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useAuth } from "../provider";

interface UserState {
  user: User | null;
  isLoading: boolean;
}

export function useUser(): UserState {
  const auth = useAuth();
  const [userState, setUserState] = useState<UserState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, isLoading: false });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserState({ user, isLoading: false });
    });

    return () => unsubscribe();
  }, [auth]);

  return userState;
}
