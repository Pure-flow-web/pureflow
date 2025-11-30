
"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, getDocs, type Query, type DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';

interface CollectionState<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCollection<T extends DocumentData>(q: Query | null): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!q) {
      setState({ data: [], isLoading: false, error: null });
      return;
    }

    setState(prevState => ({ ...prevState, isLoading: true }));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setState({ data, isLoading: false, error: null });
      }, 
      (error) => {
        console.error("useCollection error:", error);
        setState({ data: null, isLoading: false, error });
      }
    );

    return () => unsubscribe();
  }, [q]);

  return state;
}
