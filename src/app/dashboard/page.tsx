"use client";

import { useState } from 'react';
import { useStore } from "@/store/useStore";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { LogOut, Sun, Moon, Plus, LoaderCircle, CheckSquare, Trash2, Edit } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import TaskModal from './TaskModal';
import { useCollection } from '@/hooks/useCollection';
import type { Task } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';


function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-accent"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksQuery = user ? query(collection(db, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc')) : null;
  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

  const handleLogout = async () => {
    await auth.signOut();
    toast.info("You have been logged out.");
  };

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  
  const handleToggleComplete = async (task: Task) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
    try {
      await updateDoc(taskRef, { completed: !task.completed });
      toast.success(`Task "${task.title}" updated.`);
    } catch (error: any) {
      toast.error("Failed to update task", { description: error.message });
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, taskId);
    try {
      await deleteDoc(taskRef);
      toast.success(`Task "${taskTitle}" deleted.`);
    } catch (error: any) {
      toast.error("Failed to delete task", { description: error.message });
    }
  };
  
  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.toMillis() - b.dueDate.toMillis();
      })
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <h1 className="text-xl font-bold">DoneFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Hi, {user?.displayName || "User"}
          </span>
          <ThemeToggle />
          {user?.photoURL && <Image src={user.photoURL} alt="user avatar" width={32} height={32} className="rounded-full" />}
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Tasks</h2>
            <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add Task
            </button>
          </div>
          
          {isLoading && <LoadingSpinner />}
          
          {!isLoading && tasks && tasks.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">All clear!</h3>
                <p className="mt-1 text-sm text-muted-foreground">You have no tasks. Add one to get started.</p>
            </div>
          )}
          
          {!isLoading && sortedTasks.length > 0 && (
            <ul className="space-y-3">
              {sortedTasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg bg-card border shadow-sm transition-all ${
                    task.completed ? "opacity-60" : ""
                  }`}
                >
                  <button onClick={() => handleToggleComplete(task)} className="mt-1 shrink-0">
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground"></div>
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {task.dueDate.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => handleOpenModal(task)} className="p-2 text-muted-foreground hover:text-primary rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                     <button onClick={() => handleDeleteTask(task.id, task.title)} className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />
    </div>
  );
}
