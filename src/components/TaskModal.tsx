"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, doc, Timestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Task } from "./TaskList";
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNote(task.note || "");
      setPriority(task.priority || "Medium");
      setDueDate(task.dueDate ? (task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate as any)) : null);
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
      userId: user.uid,
      title: title.trim(),
      note: note.trim(),
      priority,
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      completed: task ? task.completed : false,
    };

    if (task && task.id) {
      const taskRef = doc(firestore, "users", user.uid, "tasks", task.id);
      setDocumentNonBlocking(taskRef, taskData, { merge: true });
      toast.success("Task updated!");
    } else {
      const tasksCol = collection(firestore, "users", user.uid, "tasks");
      addDocumentNonBlocking(tasksCol, taskData);
      toast.success("Task added!");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                onChange={(date: Date | null) => setDueDate(date)}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {task ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}