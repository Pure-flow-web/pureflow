"use client";

import { useState, useMemo } from 'react';
import { useStore, type Task } from '@/store/useStore';
import TaskModal from '@/components/TaskModal';
import { Plus, CheckSquare, Edit, Trash2 } from 'lucide-react';

const priorityStyles: { [key: string]: string } = {
  High: 'border-l-destructive',
  Med: 'border-l-yellow-500',
  Low: 'border-l-blue-500',
};

function TaskItem({ task }: { task: Task }) {
  const toggleTask = useStore((state) => state.toggleTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const setTaskToEdit = useStore((state) => state.setTaskToEdit);

  const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <li
      className={`flex items-start gap-4 p-4 transition-all bg-card border border-l-4 rounded-lg shadow-sm ${priorityStyles[task.priority]} ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-1">
        {task.completed ? (
          <CheckSquare className="w-5 h-5 text-primary" />
        ) : (
          <div className="w-5 h-5 transition-colors border-2 rounded border-muted-foreground/50 hover:border-primary"></div>
        )}
      </button>
      <div className="flex-1">
        <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
        {formattedDate && (
            <p className={`text-sm mt-1 ${task.completed ? "text-muted-foreground" : "text-muted-foreground"}`}>{formattedDate}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setTaskToEdit(task)} className="p-2 text-muted-foreground rounded-full h-9 w-9 hover:bg-accent hover:text-primary">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => deleteTask(task.id)} className="p-2 text-muted-foreground rounded-full h-9 w-9 hover:bg-accent hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

export default function TaskList() {
  const tasks = useStore((state) => state.tasks);
  const taskToEdit = useStore((state) => state.taskToEdit);
  const setTaskToEdit = useStore((state) => state.setTaskToEdit);

  const isModalOpen = taskToEdit !== null;
  const handleCloseModal = () => setTaskToEdit(null);
  const handleOpenModal = () => setTaskToEdit({} as Task); // Open with empty object for new task

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { High: 0, Med: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Your Tasks</h2>
        <button onClick={handleOpenModal} className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </button>
      </div>
      
      {sortedTasks.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed rounded-lg">
          <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">All done!</h3>
          <p className="mt-1 text-sm text-muted-foreground">You have no pending tasks. Add one to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
      />
    </>
  );
}
