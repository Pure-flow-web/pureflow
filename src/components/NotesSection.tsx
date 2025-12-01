"use client";

import { useState } from 'react';
import { useStore, type Note } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check, Save, X, Loader2, FileText, FileCode } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export default function NotesSection() {
  const { notes, addNote, updateNote, deleteNote, toggleNote } = useStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNew = () => {
    const newNote: Note = { id: `note_${Date.now()}`, content: '', completed: false, createdAt: new Date().toISOString() };
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
        updateNote({ id: editingNoteId, content: currentContent });
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
    if (notes.length === 0) { toast.error("No notes to download."); return; }
    const header = `=============================\nPUREFLOW NOTES – ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}\n=============================`;
    const content = notes.map(n => `\n[${n.completed ? 'x' : ' '}] Note from ${new Date(n.createdAt).toLocaleString()}\n\n${n.content}\n\n--------------------------------\n`).join('');
    const blob = new Blob([`${header}\n${content}`], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `PureFlow_Notes_${getFormattedDate()}.txt`);
    toast.success("All notes downloaded as TXT.");
  };

  const downloadNotesAsDocx = () => {
    if (notes.length === 0) { toast.error("No notes to download."); return; }
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `PureFlow Notes – ${new Date().toLocaleDateString()}`, heading: HeadingLevel.TITLE }),
          ...notes.flatMap(note => [
            new Paragraph({ text: `Note from ${new Date(note.createdAt).toLocaleString()}`, bullet: { level: 0 }, style: "wellSpaced" }),
            new Paragraph({ children: [new TextRun({ text: note.completed ? '✓ Completed' : '☐ Open', italics: true, color: '888888' })], indent: { left: 720 } }),
            ...note.content.split('\n').map(p => new Paragraph({ children: [new TextRun(p)], indent: { left: 720 } })),
            new Paragraph({ text: '' }),
          ])
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `PureFlow_Notes_${getFormattedDate()}.docx`);
      toast.success("Notes downloaded as Word (.docx).");
    });
  };

  return (
    <div className="p-5 bg-white/30 dark:bg-gray-800/20 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-xl shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Notes</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleAddNew} className="inline-flex items-center justify-center h-9 gap-2 px-3 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"><Plus className="w-4 h-4" /> New</button>
          <button onClick={downloadNotesAsTxt} title="Download as TXT" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileText className="w-4 h-4" /></button>
          <button onClick={downloadNotesAsDocx} title="Download as Word" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileCode className="w-4 h-4" /></button>
        </div>
      </div>

      {editingNoteId && (
        <div className="mb-4">
          <textarea value={currentContent} onChange={(e) => setCurrentContent(e.target.value)} placeholder="Start writing..." rows={5}
            className="w-full p-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button onClick={handleCancel} className="h-8 px-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"><X className="w-4 h-4"/></button>
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center h-8 gap-2 px-3 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}</button>
          </div>
        </div>
      )}

      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
        {notes.length === 0 && !editingNoteId ? (
          <div className="py-8 text-center border-2 border-dashed rounded-lg border-gray-300/50 dark:border-gray-600/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet. Add one!</p>
          </div>
        ) : (
          notes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
            <div key={note.id} className={`flex items-start gap-3 p-3 transition-all bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-soft ${note.completed ? "opacity-60" : ""}`}>
              <button onClick={() => toggleNote(note.id)} className="flex-shrink-0 mt-0.5 group"><div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200 ${note.completed ? "bg-purple-600 border-purple-600" : "border-gray-300 dark:border-gray-600 group-hover:border-purple-500"}`}>{note.completed && <Check className="w-4 h-4 text-white" />}</div></button>
              <div className="flex-1"><p className={`text-sm whitespace-pre-wrap ${note.completed ? 'line-through' : ''} ${!note.content && 'text-gray-400'}`}>{note.content || 'Empty note...'}</p><span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</span></div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => handleEdit(note)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-purple-500"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteNote(note.id)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
