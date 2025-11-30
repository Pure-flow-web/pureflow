"use client";

import create from "zustand";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
  DocumentData,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Task {
  id?: string;
  title: string;
  note?: string;
  completed: boolean;
  priority?: "Low" | "Medium" | "High";
  dueDate?: Date | null;
}

export interface Note {
  id?: string;
  content: string;
  lastEdited: Date;
}

interface StoreState {
  tasks: Task[];
  notes: Note[];
  loading: boolean;
  fetchTasks: (uid: string) => void;
  addTask: (uid: string, task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  updateTask: (uid: string, taskId: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (uid: string, taskId: string) => Promise<void>;
  fetchNotes: (uid: string) => void;
  saveNote: (uid: string, note: Partial<Note>) => Promise<Note | undefined>;
  deleteNote: (uid: string, noteId: string) => Promise<void>;
}

const parseDoc = <T>(doc: DocumentData): T => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    ...(data.dueDate && { dueDate: (data.dueDate as Timestamp).toDate() }),
    ...(data.lastEdited && { lastEdited: (data.lastEdited as Timestamp).toDate() }),
  } as T;
};

export const useStore = create<StoreState>((set, get) => ({
  tasks: [],
  notes: [],
  loading: true,

  fetchTasks: async (uid) => {
    set({ loading: true });
    const tasksCol = collection(db, "users", uid, "tasks");
    const q = query(tasksCol);
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => parseDoc<Task>(doc));
    set({ tasks, loading: false });
  },

  addTask: async (uid, task) => {
    const tasksCol = collection(db, "users", uid, "tasks");
    const docRef = await addDoc(tasksCol, task);
    set((state) => ({ tasks: [...state.tasks, { ...task, id: docRef.id, completed: false }] }));
  },

  updateTask: async (uid, taskId, task) => {
    const taskRef = doc(db, "users", uid, "tasks", taskId);
    await updateDoc(taskRef, task);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...task } : t)),
    }));
  },

  deleteTask: async (uid, taskId) => {
    const taskRef = doc(db, "users", uid, "tasks", taskId);
    await deleteDoc(taskRef);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
  },

  fetchNotes: async (uid) => {
    set({ loading: true });
    const notesCol = collection(db, "users", uid, "notes");
    const q = query(notesCol);
    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map(doc => parseDoc<Note>(doc));
    set({ notes, loading: false });
  },

  saveNote: async (uid, note) => {
    const notesCol = collection(db, "users", uid, "notes");
    if (note.id) {
      const noteRef = doc(db, "users", uid, "notes", note.id);
      const dataToUpdate = { ...note, lastEdited: serverTimestamp() };
      delete dataToUpdate.id;
      await updateDoc(noteRef, dataToUpdate);
      
      const updatedNote: Note = {
        ...note as Note,
        lastEdited: new Date()
      };
      set(state => ({
        notes: state.notes.map(n => n.id === note.id ? updatedNote : n)
      }));
      return updatedNote;
    } else {
      const docRef = await addDoc(notesCol, { ...note, lastEdited: serverTimestamp() });
      const newNote: Note = { ...note, id: docRef.id, lastEdited: new Date() } as Note;
      set(state => ({ notes: [...state.notes, newNote] }));
      return newNote;
    }
  },

  deleteNote: async (uid, noteId) => {
    const noteRef = doc(db, "users", uid, "notes", noteId);
    await deleteDoc(noteRef);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId),
    }));
  },
}));
