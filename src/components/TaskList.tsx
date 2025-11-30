"use client";

import { useState, useMemo } from 'react';
import { useStore, type Task } from '@/lib/store';
import TaskModal from '@/components/TaskModal';
import { Plus, Edit, Trash2, Check, Download, FileText, FileWord } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const priorityStyles: { [key in Task['priority']]: string } = {
  Urgent: 'border-l-red-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-yellow-500',
  Low: 'border-l-blue-500',
};

function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask, setTaskToEdit } = useStore();

  const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <li className={`flex items-start gap-3 p-3.5 transition-all bg-white dark:bg-gray-800 border-l-4 rounded-lg shadow-sm hover:shadow-md ${priorityStyles[task.priority]} ${task.completed ? "opacity-60" : ""}`}>
      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-0.5 group">
        <div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200 ${task.completed ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 group-hover:border-blue-500"}`}>
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </div>
      </button>
      <div className="flex-1">
        <p className={`font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
          {task.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{task.description}</p>
        {formattedDate && (
          <p className={`text-xs mt-1.5 ${task.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}>{formattedDate}</p>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={() => setTaskToEdit(task)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-700">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

export default function TaskList() {
  const { tasks, taskToEdit, setTaskToEdit } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const isModalOpen = taskToEdit !== null;
  const handleCloseModal = () => setTaskToEdit(null);
  const handleOpenModal = () => setTaskToEdit({} as Task);

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
      const dueDate = t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Due: None';
      const priority = `Priority: ${t.priority}`;
      const description = t.description ? `\n    ${t.description}` : '';
      return `\n[${status}] ${t.title}\n    ${dueDate} | ${priority}${description}`;
    }).join('\n');

    const fullContent = `${header}\n${content}`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `PureFlow_Tasks_${getFormattedDate()}.txt`);
    toast.success("Tasks downloaded as TXT.");
  };

  const downloadTasksAsDocx = () => {
    if (tasks.length === 0) {
      toast.error("No tasks to download.");
      return;
    }
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const title = `PureFlow Tasks – ${formattedDate}`;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          ...tasks.flatMap(task => {
            const status = task.completed ? '✓ Completed' : '☐ Not Started';
            const dueDate = task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'Due: None';

            return [
              new Paragraph({
                children: [
                  new TextRun({ text: task.title, bold: true }),
                ],
                bullet: { level: 0 },
              }),
              new Paragraph({
                children: [
                   new TextRun({ text: `${status} | Priority: ${task.priority} | ${dueDate}`, italics: true, color: '888888' }),
                ],
                 indent: { left: 720 },
              }),
              ...(task.description ? [new Paragraph({
                 children: [ new TextRun(task.description) ],
                 indent: { left: 720 },
              })] : []),
              new Paragraph({ text: '' }), // Spacer
            ]
          })
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `PureFlow_Tasks_${getFormattedDate()}.docx`);
      toast.success("Tasks downloaded as Word (.docx).");
    });
  };

  const filteredTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter === 'all') return sorted;
    if (filter === 'pending') return sorted.filter(t => !t.completed);
    if (filter === 'completed') return sorted.filter(t => t.completed);
    return [];
  }, [tasks, filter]);

  const FilterButton = ({ f, label }: { f: typeof filter, label: string }) => (
    <button onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
      {label}
    </button>
  );

  return (
    <>
      <div className="p-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleOpenModal} className="inline-flex items-center justify-center h-9 gap-2 px-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Task
            </button>
            <button onClick={downloadTasksAsTxt} title="Download as TXT" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
              <FileText className="w-4 h-4" />
            </button>
            <button onClick={downloadTasksAsDocx} title="Download as Word" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
              <FileWord className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <FilterButton f="pending" label="Pending" />
          <FilterButton f="completed" label="Completed" />
          <FilterButton f="all" label="All" />
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-lg border-gray-300/80 dark:border-gray-600/80">
            <Check className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
            <h3 className="mt-3 text-lg font-medium">All Clear!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You have no {filter} tasks.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>

      <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} taskToEdit={taskToEdit} />
    </>
  );
}
