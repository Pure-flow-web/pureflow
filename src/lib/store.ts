"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
}

interface AppState {
  tasks: Task[];
  notes: Note[];
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
}

// Custom middleware to gracefully handle storage errors (e.g., user disables localStorage)
const safeLocalStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn(`PureFlow: Could not save to localStorage.`, error);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      notes: [],
      taskToEdit: null,
      
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

      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
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
    }),
    {
      name: 'pureflow-app-storage-v1', // Unique name for localStorage item
      storage: createJSONStorage(() => safeLocalStorage),
      onRehydrateError: () => {
        // This function is called if the stored state can't be parsed.
        // It gracefully fails without crashing the app.
        console.warn("PureFlow: Could not rehydrate state from localStorage. Starting fresh.");
        return (state, error) => { /* no-op */ };
      }
    }
  )
);
