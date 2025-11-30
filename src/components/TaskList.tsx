"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit, LoaderCircle, CheckSquare, Square } from "lucide-react";
import { collection, doc, Timestamp } from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import TaskModal from "./TaskModal";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from "sonner";


export interface Task {
  id: string;
  userId: string;
  title: string;
  note?: string;
  completed: boolean;
  priority?: "Low" | "Medium" | "High";
  dueDate?: Date | Timestamp | null;
}

export default function TaskList() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const tasksQuery = useMemoFirebase(
    () => user && collection(firestore, "users", user.uid, "tasks"),
    [user, firestore]
  );
  const { data: tasks, isLoading: loading } = useCollection<Task>(tasksQuery);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    if (!user) return;
    const taskRef = doc(firestore, "users", user.uid, "tasks", task.id);
    updateDocumentNonBlocking(taskRef, { completed: !task.completed });
    toast.success(`Task "${task.title}" marked as ${!task.completed ? 'complete' : 'incomplete'}.`);
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (!user) return;
    const taskRef = doc(firestore, "users", user.uid, "tasks", taskId);
    deleteDocumentNonBlocking(taskRef);
    toast.success("Task deleted.");
  };

  const priorityClasses: { [key: string]: string } = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
  };

  const sortedTasks = tasks
  ? [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const dueDateA = a.dueDate ? (a.dueDate instanceof Timestamp ? a.dueDate.toMillis() : new Date(a.dueDate as any).getTime()) : Number.MAX_SAFE_INTEGER;
      const dueDateB = b.dueDate ? (b.dueDate instanceof Timestamp ? b.dueDate.toMillis() : new Date(b.dueDate as any).getTime()) : Number.MAX_SAFE_INTEGER;
      if(dueDateA !== dueDateB) return dueDateA - dueDateB;
      
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      const priorityA = a.priority ? priorityOrder[a.priority] : 4;
      const priorityB = b.priority ? priorityOrder[b.priority] : 4;

      return priorityA - priorityB;
    })
  : [];


  return (
    <div className="relative min-h-[calc(100vh-15rem)]">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
            <CheckSquare className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">All clear!</h3>
            <p>You have no tasks. Add one to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-start gap-4 p-4 rounded-lg bg-card shadow-sm transition-all ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <button onClick={() => handleToggleComplete(task)} className="mt-1 shrink-0">
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-green-500" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                {task.note && (
                  <p className="text-sm text-muted-foreground mt-1">{task.note}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {task.dueDate && (
                    <span className="text-muted-foreground">
                      {(task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate as any)).toLocaleDateString()}
                    </span>
                  )}
                  {task.priority && (
                     <div className="flex items-center gap-1.5">
                       <span className={`w-2 h-2 rounded-full ${priorityClasses[task.priority]}`}></span>
                       <span>{task.priority}</span>
                     </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => handleOpenModal(task)} className="p-2 text-muted-foreground hover:text-primary rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                 <button onClick={() => handleDeleteTask(task.id!)} className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform transform hover:scale-105"
        aria-label="Add Task"
      >
        <Plus className="w-7 h-7" />
      </button>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}