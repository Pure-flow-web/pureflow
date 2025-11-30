
"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';

interface DocState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDoc<T extends DocumentData>(ref: DocumentReference<T> | null): DocState<T> {
  const [state, setState] = useState<DocState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState(prevState => ({ ...prevState, isLoading: true }));

    const unsubscribe = onSnapshot(ref, 
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          setState({ data, isLoading: false, error: null });
        } else {
          setState({ data: null, isLoading: false, error: null });
        }
      }, 
      (error) => {
        console.error("useDoc error:", error);
        setState({ data: null, isLoading: false, error });
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return state;
}
