"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStore } from "@/store/useStore";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Plus, CheckSquare, Trash2, Edit, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore } from '@/firebase';
import { setDocNonBlocking, addDocNonBlocking, updateDocNonBlocking, deleteDocNonBlocking } from '@/firebase/non-blocking-updates';
import { useCollection } from '@/firebase';


interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
}

function TaskModal({ isOpen, onClose, task }: { isOpen: boolean, onClose: () => void, task: Task | null }) {
    const { user } = useStore();
    const db = useFirestore();
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (task) {
        setTitle(task.title);
      } else {
        setTitle("");
      }
    }, [task, isOpen]);
  
    const handleSubmit = async () => {
      if (!user || !db) {
        toast.error("You must be logged in.");
        return;
      }
      if (!title.trim()) {
        toast.error("Task title is required.");
        return;
      }
      
      setIsLoading(true);

      const collectionRef = collection(db, `users/${user.uid}/tasks`);

      if (task) {
        const taskRef = doc(collectionRef, task.id);
        updateDocNonBlocking(taskRef, { title: title.trim() });
        toast.success("Task updated!");
      } else {
        addDocNonBlocking(collectionRef, { 
            title: title.trim(), 
            completed: false, 
            createdAt: serverTimestamp(), 
            userId: user.uid 
        });
        toast.success("Task added!");
      }
      
      setIsLoading(false);
      onClose();
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin"/> : task ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

export default function TaskList() {
  const { user } = useStore();
  const db = useFirestore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tasksQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
  }, [user, db]);

  const { data: tasks, isLoading, error } = useCollection<Task>(tasksQuery);

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  
  const handleToggleComplete = async (task: Task) => {
    if (!user || !db) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
    updateDocNonBlocking(taskRef, { completed: !task.completed });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !db) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, taskId);
    deleteDocNonBlocking(taskRef);
    toast.success(`Task deleted.`);
  };
  
  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      })
  }, [tasks]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>
      
      {isLoading && (
         <div className="flex justify-center py-8"><LoaderCircle className="w-8 h-8 animate-spin text-primary" /></div>
      )}

      {error && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg border-destructive/50 bg-destructive/10">
            <h3 className="mt-4 text-lg font-medium text-destructive">{error.message}</h3>
        </div>
      )}
      
      {!isLoading && !error && tasks && tasks.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">All done!</h3>
            <p className="mt-1 text-sm text-muted-foreground">You have no pending tasks. Add one to get started.</p>
        </div>
      )}
      
      {!isLoading && !error && sortedTasks.length > 0 && (
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
              </div>
              <div className="flex gap-1">
                 <Button variant="ghost" size="icon" onClick={() => handleOpenModal(task)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Edit className="w-4 h-4" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                 </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />
    </>
  );
}
