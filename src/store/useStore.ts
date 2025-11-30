"use client";

import { create } from 'zustand';
import { type User } from 'firebase/auth';

interface StoreState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
}));
