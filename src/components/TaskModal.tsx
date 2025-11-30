"use client";

import { useState, useEffect } from "react";
import { useStore, type Task } from "@/lib/store";
import { X, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: Task | null;
}

const priorities: Task['priority'][] = ["Low", "Medium", "High", "Urgent"];

export default function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Task['priority']>("Medium");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit && taskToEdit.id) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
        setPriority(taskToEdit.priority);
      } else {
        setTitle("");
        setDescription("");
        setDueDate(null);
        setPriority("Medium");
      }
    }
  }, [taskToEdit, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }
    setIsLoading(true);

    const isEditing = taskToEdit && taskToEdit.id;

    const taskData: Omit<Task, 'id' | 'completed'> = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      createdAt: isEditing ? taskToEdit.createdAt : new Date().toISOString(),
    };

    setTimeout(() => {
      try {
        if (isEditing) {
          updateTask({ ...taskData, id: taskToEdit.id, completed: taskToEdit.completed });
          toast.success("Task updated successfully!");
        } else {
          addTask({ ...taskData, id: `task_${Date.now()}`, completed: false });
          toast.success("Task added successfully!");
        }
        setIsLoading(false);
        onClose();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    }, 300);
  };
  
  if (!isOpen) return null;

  const PriorityButton = ({ p }: { p: Task['priority'] }) => {
    const active = priority === p;
    const colors = {
      Low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      Medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      High: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      Urgent: "bg-red-500/10 text-red-600 dark:text-red-400",
    }
    const hoverColors = {
      Low: "hover:bg-blue-500/20",
      Medium: "hover:bg-yellow-500/20",
      High: "hover:bg-orange-500/20",
      Urgent: "hover:bg-red-500/20",
    }
    return (
      <button
        key={p}
        type="button"
        onClick={() => setPriority(p)}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
          active ? `${colors[p]} ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-current` : `bg-gray-100 dark:bg-gray-800/50 ${hoverColors[p]}`
        }`}
      >
        {p}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" aria-modal="true" onClick={onClose}>
      <div className="relative w-full max-w-lg p-6 mx-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute text-gray-400 top-4 right-4 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{taskToEdit && taskToEdit.id ? "Edit Task" : "Add New Task"}</h2>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="title" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Finalize project report"
              className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Description (Optional)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details..." rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="dueDate" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholderText="Select a date"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Priority</label>
              <div className="flex flex-wrap items-center gap-2">
                {priorities.map((p) => <PriorityButton key={p} p={p} /> )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} disabled={isLoading} 
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg h-10 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (taskToEdit && taskToEdit.id ? "Save Changes" : "Add Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
