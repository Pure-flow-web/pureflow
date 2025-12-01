"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  taskName: string;
  note: string;
  durationMinutes: number;
  date: string;
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  tasks: Task[];
  notes: Note[];
  pomodoroHistory: PomodoroSession[];
  taskToEdit: Task | null;
  
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Partial<Task> & { id: string }) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setTaskToEdit: (task: Task | null) => void;

  addNote: (note: Note) => void;
  updateNote: (updatedNote: Partial<Note> & { id: string }) => void;
  deleteNote: (id: string) => void;
  toggleNote: (id: string) => void;

  addPomodoroSession: (session: PomodoroSession) => void;
  updatePomodoroSession: (updatedSession: Partial<PomodoroSession> & { id: string }) => void;
  deletePomodoroSession: (sessionId: string) => void;
}

// Custom storage implementation to safely handle localStorage in SSR environments (like Next.js)
const safeLocalStorage = {
  getItem: (name: string) => {
    // If we're on the server, return null
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(name);
    } catch {
      // In case of any error (e.g., security restrictions), return null
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    // If we're on the server, do nothing
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      // Log an error if we can't save, e.g., private browsing or storage is full
      console.warn(`PureFlow: Could not save to localStorage.`, error);
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      tasks: [],
      notes: [],
      pomodoroHistory: [],
      taskToEdit: null,
      
      // Task actions
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (updatedTask) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        ),
      })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ),
      })),
      setTaskToEdit: (task) => set({ taskToEdit: task }),

      // Note actions
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      updateNote: (updatedNote) => set((state) => ({
        notes: state.notes.map((note) =>
            note.id === updatedNote.id ? { ...note, ...updatedNote } : note
        )
      })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      toggleNote: (id) => set((state) => ({
        notes: state.notes.map((note) => 
            note.id === id ? { ...note, completed: !note.completed } : note
        )
      })),

      // Pomodoro History actions
      addPomodoroSession: (session) => set((state) => ({ pomodoroHistory: [session, ...state.pomodoroHistory] })),
      updatePomodoroSession: (updatedSession) => set((state) => ({
        pomodoroHistory: state.pomodoroHistory.map(session => 
            session.id === updatedSession.id ? {...session, ...updatedSession} : session
        )
      })),
      deletePomodoroSession: (sessionId) => set(state => ({
        pomodoroHistory: state.pomodoroHistory.filter(session => session.id !== sessionId)
      })),

    }),
    {
      name: 'pureflow-app-storage-v3', 
      storage: createJSONStorage(() => safeLocalStorage),
      // This function handles errors during rehydration, preventing crashes if stored data is corrupted
      onRehydrateError: () => {
        console.warn("PureFlow: Could not rehydrate state from localStorage. Starting fresh.");
        return (state, error) => { /* no-op */ };
      }
    }
  )
);
