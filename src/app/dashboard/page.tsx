"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStore } from "@/store/useStore";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { onSnapshot } from "firebase/firestore";
import { toast } from 'sonner';
import { LogOut, Sun, Moon, Plus, CheckSquare, Trash2, Edit, LoaderCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Task } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Timestamp } from 'firebase/firestore';


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

function TaskModal({ isOpen, onClose, task }: { isOpen: boolean, onClose: () => void, task: Task | null }) {
    const { user } = useStore();
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState<Date | null>(null);
  
    useEffect(() => {
      if (task) {
        setTitle(task.title);
        setDueDate(task.dueDate ? task.dueDate.toDate() : null);
      } else {
        setTitle("");
        setDueDate(null);
      }
    }, [task, isOpen]);
  
    const handleSubmit = async () => {
      if (!user) {
        toast.error("You must be logged in.");
        return;
      }
      if (!title.trim()) {
        toast.error("Task title is required.");
        return;
      }
  
      const taskData = {
        title: title.trim(),
        dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
        completed: task?.completed ?? false,
      };
  
      try {
        if (task) {
          const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
          await updateDoc(taskRef, taskData);
          toast.success("Task updated!");
        } else {
          const tasksColRef = collection(db, `users/${user.uid}/tasks`);
          await addDoc(tasksColRef, { ...taskData, createdAt: serverTimestamp(), userId: user.uid });
          toast.success("Task added!");
        }
        onClose();
      } catch (error: any) {
        toast.error("Failed to save task", { description: error.message });
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Finish project proposal"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  className="w-full"
                  placeholderText="Select a date"
                  isClearable
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>{task ? "Save Changes" : "Add Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

export default function DashboardPage() {
  const { user } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    const q = query(collection(db, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksData: Task[] = [];
        querySnapshot.forEach((doc) => {
            tasksData.push({ id: doc.id, ...doc.data() } as Task);
        });
        setTasks(tasksData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
    if (!confirm(`Are you sure you want to delete "${taskTitle}"?`)) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, taskId);
    try {
      await deleteDoc(taskRef);
      toast.success(`Task "${taskTitle}" deleted.`);
    } catch (error: any) {
      toast.error("Failed to delete task", { description: error.message });
    }
  };
  
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const aDueDate = a.dueDate ? a.dueDate.toMillis() : Infinity;
        const bDueDate = b.dueDate ? b.dueDate.toMillis() : Infinity;
        return aDueDate - bDueDate;
      })
  }, [tasks]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <h1 className="text-xl font-bold">WorkDone</h1>
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
            <Button onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </div>
          
          {isLoading && <LoadingSpinner />}
          
          {!isLoading && tasks.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">All done!</h3>
                <p className="mt-1 text-sm text-muted-foreground">You have no pending tasks. Add one to get started.</p>
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
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-muted-foreground/50"></div>
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
                     <Button variant="ghost" size="icon" onClick={() => handleOpenModal(task)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id, task.title)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                     </Button>
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
