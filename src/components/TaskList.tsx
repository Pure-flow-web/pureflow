"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, LoaderCircle, CheckSquare, Square } from "lucide-react";
import { useStore, Task } from "@/store/useStore";
import TaskModal from "./TaskModal";
import { useAuth } from "@/hooks/useAuth";

export default function TaskList() {
  const { user } = useAuth();
  const { tasks, loading, fetchTasks, updateTask, deleteTask } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [user, fetchTasks]);

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    if (!user) return;
    updateTask(user.uid, task.id!, { completed: !task.completed });
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (!user) return;
    deleteTask(user.uid, taskId);
  };

  const priorityClasses: { [key: string]: string } = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
  };

  const sortedTasks = tasks.slice().sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0));

  return (
    <div className="relative min-h-[calc(100vh-15rem)]">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No tasks yet. Get started by adding one!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-start gap-4 p-4 rounded-lg bg-card shadow-sm transition-opacity ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <button onClick={() => handleToggleComplete(task)} className="mt-1 shrink-0">
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-accent" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? "line-through" : ""}`}>
                  {task.title}
                </p>
                {task.note && (
                  <p className="text-sm text-muted-foreground mt-1">{task.note}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {task.dueDate && (
                    <span className="text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString()}
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
              <div className="flex gap-2">
                 <button onClick={() => handleOpenModal(task)} className="p-2 text-muted-foreground hover:text-accent rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                 <button onClick={() => handleDeleteTask(task.id!)} className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-accent/90 transition-transform transform hover:scale-105"
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
