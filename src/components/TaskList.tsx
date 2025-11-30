"use client";

import { useState, useMemo } from 'react';
import { useStore, type Task } from '@/lib/store';
import TaskModal from '@/components/TaskModal';
import { Plus, Edit, Trash2, Check, FileText, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import confetti from 'canvas-confetti';

const priorityStyles: { [key in Task['priority']]: string } = {
  Urgent: 'border-l-red-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-yellow-500',
  Low: 'border-l-blue-500',
};

function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask, setTaskToEdit } = useStore();
  const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  const handleToggle = () => {
    toggleTask(task.id);
    if (!task.completed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#FBBF24', '#34D399', '#F87171', '#A78BFA']
      });
      toast.success("Task Completed! Great work. 🚀");
    }
  };

  return (
    <li className={`flex items-start gap-3 p-3.5 transition-all bg-white/50 dark:bg-gray-800/40 border-l-4 rounded-lg shadow-soft hover:shadow-md ${priorityStyles[task.priority]} ${task.completed ? "opacity-60" : ""}`}>
      <button onClick={handleToggle} className="flex-shrink-0 mt-0.5 group" aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}>
        <div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200 ${task.completed ? "bg-accent-blue border-accent-blue" : "border-gray-300 dark:border-gray-600 group-hover:border-accent-blue"}`}>
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </div>
      </button>
      <div className="flex-1">
        <p className={`font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>{task.title}</p>
        {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{task.description}</p>}
        {formattedDate && <p className={`text-xs mt-1.5 ${task.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}>{formattedDate}</p>}
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={() => setTaskToEdit(task)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-accent-blue" aria-label="Edit task"><Edit className="w-4 h-4" /></button>
        <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-red-500" aria-label="Delete task"><Trash2 className="w-4 h-4" /></button>
      </div>
    </li>
  );
}

export default function TaskList() {
  const { tasks, taskToEdit, setTaskToEdit } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const handleOpenModal = () => setTaskToEdit({} as Task); // Open modal for new task
  const handleCloseModal = () => setTaskToEdit(null);

  const getFormattedDate = () => new Date().toISOString().split('T')[0];

  const downloadTasksAsTxt = () => {
    if (tasks.length === 0) {
      toast.error("No tasks to download.");
      return;
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const header = `=============================\nPUREFLOW TASKS – ${formattedDate.toUpperCase()}\n=============================`;
    
    const content = tasks.map(t => {
      const status = t.completed ? 'Completed' : 'Not Started';
      const dueDate = t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : 'Due: None';
      const priority = `Priority: ${t.priority}`;
      const description = t.description ? `\n    ${t.description.replace(/\n/g, '\n    ')}` : '';
      return `\n[${status}] ${t.title}\n    ${dueDate} | ${priority}${description}`;
    }).join('\n');

    const blob = new Blob([`${header}\n${content}`], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `PureFlow_Tasks_${getFormattedDate()}.txt`);
    toast.success("Tasks downloaded as TXT.");
  };

  const downloadTasksAsDocx = () => {
    if (tasks.length === 0) { toast.error("No tasks to download."); return; }
    
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `PureFlow Tasks – ${new Date().toLocaleDateString()}`, heading: HeadingLevel.TITLE }),
          ...tasks.flatMap(task => [
            new Paragraph({
              children: [new TextRun({ text: task.title, bold: true })],
              bullet: { level: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `${task.completed ? '✓ Completed' : '☐ Not Started'} | Priority: ${task.priority} | Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}`, italics: true, color: '888888' })],
              indent: { left: 720 },
            }),
            ...(task.description ? [new Paragraph({ children: [new TextRun(task.description)], indent: { left: 720 } })] : []),
            new Paragraph({ text: '' }),
          ])
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `PureFlow_Tasks_${getFormattedDate()}.docx`);
      toast.success("Tasks downloaded as Word (.docx).");
    });
  };

  const filteredTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime());
    if (filter === 'all') return sorted;
    if (filter === 'completed') return sorted.filter(t => t.completed);
    return sorted.filter(t => !t.completed); // Default to pending
  }, [tasks, filter]);

  return (
    <>
      <div className="p-5 bg-white/30 dark:bg-gray-800/20 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-xl shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleOpenModal} className="inline-flex items-center justify-center h-9 gap-2 px-3 text-sm font-semibold text-white bg-accent-blue rounded-lg hover:bg-blue-500"><Plus className="w-4 h-4" /> Add Task</button>
            <button onClick={downloadTasksAsTxt} title="Download as TXT" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileText className="w-4 h-4" /></button>
            <button onClick={downloadTasksAsDocx} title="Download as Word" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileCode className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === 'pending' ? 'bg-accent-blue text-white' : 'bg-gray-200/50 text-gray-600 dark:text-gray-300 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Pending</button>
          <button onClick={() => setFilter('completed')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === 'completed' ? 'bg-accent-blue text-white' : 'bg-gray-200/50 text-gray-600 dark:text-gray-300 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Completed</button>
          <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-accent-blue text-white' : 'bg-gray-200/50 text-gray-600 dark:text-gray-300 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>All</button>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-lg border-gray-300/50 dark:border-gray-600/50">
            <Check className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
            <h3 className="mt-3 text-lg font-medium">All Clear!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You have no {filter} tasks.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">{filteredTasks.map(task => <TaskItem key={task.id} task={task} />)}</ul>
        )}
      </div>
      {taskToEdit && <TaskModal isOpen={!!taskToEdit} onClose={handleCloseModal} taskToEdit={taskToEdit} />}
    </>
  );
}
