"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string | null;
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
  
  // Task actions
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setTaskToEdit: (task: Task | null) => void;

  // Note actions
  addNote: (note: Note) => void;
  updateNote: (updatedNote: Note) => void;
  deleteNote: (id: string) => void;
  toggleNote: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      notes: [],
      taskToEdit: null,
      
      // Task implementations
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),
      setTaskToEdit: (task) => set({ taskToEdit: task }),

      // Note implementations
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (updatedNote) => set((state) => ({
        notes: state.notes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      })),
      toggleNote: (id) => set((state) => ({
        notes: state.notes.map((note) => 
            note.id === id ? { ...note, completed: !note.completed } : note
        )
      })),
    }),
    {
      name: 'pureflow-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
