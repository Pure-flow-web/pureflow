"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import type { Task } from "@/lib/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
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
        // Update existing task
        const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
        await updateDoc(taskRef, taskData);
        toast.success("Task updated!");
      } else {
        // Create new task
        const tasksColRef = collection(db, `users/${user.uid}/tasks`);
        await addDoc(tasksColRef, { ...taskData, createdAt: serverTimestamp() });
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
                className="w-full h-10 px-3 py-2 text-sm bg-transparent border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
