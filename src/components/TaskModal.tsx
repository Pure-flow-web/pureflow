"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useStore, Task } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { user } = useAuth();
  const { addTask, updateTask } = useStore();
  
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNote(task.note || "");
      setPriority(task.priority || "Medium");
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a task.");
      return;
    }
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    const taskData = {
      title: title.trim(),
      note: note.trim(),
      priority,
      dueDate,
      completed: task ? task.completed : false,
    };

    if (task && task.id) {
      // Update existing task
      await updateTask(user.uid, task.id, taskData);
      toast.success("Task updated!");
    } else {
      // Add new task
      await addTask(user.uid, taskData);
      toast.success("Task added!");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-card w-full max-w-md m-4 p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-muted-foreground hover:bg-secondary">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4">{task ? "Edit Task" : "New Task"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Finish project proposal"
            />
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Add more details..."
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                className="w-full"
                placeholderText="Select a date"
                isClearable
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
            >
              {task ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
