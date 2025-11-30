"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: 'Low' | 'Med' | 'High';
  completed: boolean;
}

interface AppState {
  tasks: Task[];
  notes: string;
  activeView: 'tasks' | 'notes' | 'pomodoro';
  taskToEdit: Task | null;
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setNotes: (notes: string) => void;
  setActiveView: (view: 'tasks' | 'notes' | 'pomodoro') => void;
  setTaskToEdit: (task: Task | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      notes: '',
      activeView: 'tasks',
      taskToEdit: null,
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
      setNotes: (notes) => set({ notes }),
      setActiveView: (view) => set({ activeView: view }),
      setTaskToEdit: (task) => set({ taskToEdit: task }),
    }),
    {
      name: 'instantflow-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
