"use client";

import { useState, useEffect, useRef } from "react";
import { useStore, type Task } from "@/lib/store";
import { X, Loader2 } from "lucide-react";
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
  const { addTask, updateTask } = useStore();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Task['priority']>("Medium");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit && taskToEdit.id) { // Editing existing task
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
        setPriority(taskToEdit.priority);
      } else { // Creating new task
        setTitle("");
        setDescription("");
        setDueDate(null);
        setPriority("Medium");
      }
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [taskToEdit, isOpen]);
  
  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }
    setIsLoading(true);

    const isEditing = taskToEdit && taskToEdit.id;

    const taskData: Omit<Task, 'id' | 'completed' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
    };

    // Simulate network delay for better UX
    setTimeout(() => {
      try {
        if (isEditing) {
          updateTask({ ...taskToEdit, ...taskData });
          toast.success("Task updated successfully!");
        } else {
          addTask({ ...taskData, id: `task_${Date.now()}`, completed: false, createdAt: new Date().toISOString() });
          toast.success("Task added successfully!");
        }
        setIsLoading(false);
        handleClose();
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    }, 300);
  };
  
  return (
    <dialog ref={dialogRef} onCancel={handleClose} className="bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm p-0 m-0 w-full max-w-lg rounded-xl">
      <div className="w-full p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl">
        <button onClick={handleClose} className="absolute text-gray-400 top-4 right-4 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{taskToEdit && taskToEdit.id ? "Edit Task" : "Add New Task"}</h2>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="title" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Finalize project report"
              className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue" />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Description (Optional)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details..." rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue" />
          </div>
            
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                placeholderText="Select a date"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Priority</label>
              <div className="flex flex-wrap items-center gap-2">
                {priorities.map((p) => (
                  <button key={p} type="button" onClick={() => setPriority(p)} className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${priority === p ? 'ring-2 ring-offset-2 ring-accent-blue dark:ring-offset-gray-800 bg-accent-blue/20' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={handleClose} disabled={isLoading} 
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg h-10 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg h-10 bg-accent-blue hover:bg-blue-500 disabled:opacity-50 disabled:bg-blue-400">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (taskToEdit && taskToEdit.id ? "Save Changes" : "Add Task")}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
