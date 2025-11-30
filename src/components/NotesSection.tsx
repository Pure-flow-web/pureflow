"use client";

import { useState, useEffect } from 'react';
import { useStore, type Note } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check, Download, Save, X, Loader2, FileText, FileWord } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export default function NotesSection() {
  const { notes, addNote, updateNote, deleteNote, toggleNote } = useStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNew = () => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      content: '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addNote(newNote);
    setEditingNoteId(newNote.id);
    setCurrentContent('');
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setCurrentContent(note.content);
  };

  const handleSave = () => {
    if (editingNoteId) {
      setIsSaving(true);
      setTimeout(() => {
        updateNote({ ...notes.find(n => n.id === editingNoteId)!, content: currentContent });
        setIsSaving(false);
        setEditingNoteId(null);
        setCurrentContent('');
        toast.success("Note saved!");
      }, 300);
    }
  };

  const handleCancel = () => {
    setEditingNoteId(null);
    setCurrentContent('');
  };
  
  const getFormattedDate = () => new Date().toISOString().split('T')[0];

  const downloadNotesAsTxt = () => {
    if (notes.length === 0) {
      toast.error("No notes to download.");
      return;
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const header = `=============================\nPUREFLOW NOTES – ${formattedDate.toUpperCase()}\n=============================`;

    const content = notes.map(n => {
      const status = n.completed ? '[x]' : '[ ]';
      const created = new Date(n.createdAt).toLocaleString();
      return `\n${status} Note from ${created}\n\n${n.content}\n\n--------------------------------\n`;
    }).join('');

    const fullContent = `${header}\n${content}`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `PureFlow_Notes_${getFormattedDate()}.txt`);
    toast.success("All notes downloaded as TXT.");
  };

  const downloadNotesAsDocx = () => {
    if (notes.length === 0) {
      toast.error("No notes to download.");
      return;
    }
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const title = `PureFlow Notes – ${formattedDate}`;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          ...notes.flatMap(note => {
            const status = note.completed ? '✓ Completed' : '☐ Open';
            const created = new Date(note.createdAt).toLocaleString();
            
            return [
               new Paragraph({
                children: [
                  new TextRun({ text: `Note from ${created}`, bold: true }),
                ],
                bullet: { level: 0 },
              }),
              new Paragraph({
                children: [
                   new TextRun({ text: status, italics: true, color: '888888' }),
                ],
                 indent: { left: 720 },
              }),
              ...note.content.split('\n').map(p => new Paragraph({ 
                  children: [new TextRun(p)],
                  indent: { left: 720 },
               })),
              new Paragraph({ text: '' }), // Spacer
            ]
          })
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `PureFlow_Notes_${getFormattedDate()}.docx`);
      toast.success("Notes downloaded as Word (.docx).");
    });
  };

  return (
    <div className="p-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">Notes</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleAddNew} className="inline-flex items-center justify-center h-9 gap-2 px-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Note
          </button>
          <button onClick={downloadNotesAsTxt} title="Download as TXT" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
            <FileText className="w-4 h-4" />
          </button>
          <button onClick={downloadNotesAsDocx} title="Download as Word" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
            <FileWord className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editingNoteId && (
        <div className="mb-4">
          <textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder="Start writing..."
            rows={5}
            className="w-full p-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button onClick={handleCancel} className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"><X className="w-4 h-4"/></button>
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center justify-center h-8 gap-2 px-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {notes.length === 0 && !editingNoteId ? (
          <div className="py-8 text-center border-2 border-dashed rounded-lg border-gray-300/80 dark:border-gray-600/80">
            <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet. Add one!</p>
          </div>
        ) : (
          notes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
            <div key={note.id} className={`flex items-start gap-3 p-3 transition-all bg-white dark:bg-gray-800 rounded-lg shadow-sm ${note.completed ? "opacity-60" : ""}`}>
              <button onClick={() => toggleNote(note.id)} className="flex-shrink-0 mt-0.5 group">
                <div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200 ${note.completed ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 group-hover:border-blue-500"}`}>
                  {note.completed && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
              <div className="flex-1">
                <p className={`text-sm whitespace-pre-wrap ${note.completed ? 'line-through' : ''} ${note.content ? '' : 'text-gray-400'}`}>
                  {note.content || 'Empty note...'}
                </p>
                <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => handleEdit(note)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-700"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteNote(note.id)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
