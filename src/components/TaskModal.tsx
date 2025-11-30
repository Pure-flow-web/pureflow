"use client";

import { useState, useEffect } from "react";
import { useStore, type Task } from "@/store/useStore";
import { X, LoaderCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: Task | null;
}

const priorities = ["Low", "Med", "High"];

export default function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState("Med");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
      setPriority(taskToEdit.priority);
    } else {
      setTitle("");
      setDueDate(null);
      setPriority("Med");
    }
    setError("");
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setIsLoading(true);

    const taskData = {
      id: taskToEdit ? taskToEdit.id : Date.now().toString(),
      title: title.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      completed: taskToEdit ? taskToEdit.completed : false,
    };
    
    // Simulate network delay for better UX feel
    setTimeout(() => {
      if (taskToEdit) {
        updateTask(taskData);
      } else {
        addTask(taskData);
      }
      setIsLoading(false);
      onClose();
    }, 300);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true">
      <div className="relative w-full max-w-md p-6 mx-4 bg-card rounded-lg shadow-xl">
        <button onClick={onClose} className="absolute text-muted-foreground top-4 right-4 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">{taskToEdit ? "Edit Task" : "Add New Task"}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-muted-foreground">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design the new landing page"
              className="w-full h-10 px-3 py-2 text-sm bg-transparent border rounded-md border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          </div>

          <div>
            <label htmlFor="dueDate" className="block mb-1 text-sm font-medium text-muted-foreground">Due Date</label>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              className="w-full h-10 px-3 py-2 text-sm bg-transparent border rounded-md border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-muted-foreground">Priority</label>
            <div className="flex space-x-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                    priority === p ? "bg-primary text-primary-foreground font-semibold" : "bg-muted hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium transition-colors rounded-md h-10 hover:bg-accent disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md h-10 bg-primary hover:bg-primary/90 disabled:opacity-50">
              {isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : taskToEdit ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
