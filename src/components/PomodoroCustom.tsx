"use client";

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Check, Edit, Trash2, FileText, FileCode, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useStore, type PomodoroSession } from '@/lib/store';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';


function PomodoroSaveModal({ 
  isOpen, 
  onClose, 
  durationMinutes,
  editingSession 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  durationMinutes: number,
  editingSession: PomodoroSession | null 
}) {
  const { addPomodoroSession, updatePomodoroSession } = useStore();
  const [taskName, setTaskName] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (editingSession) {
        setTaskName(editingSession.taskName);
        setNote(editingSession.note);
      } else {
        setTaskName('');
        setNote('');
      }
    }
  }, [isOpen, editingSession]);

  const handleSave = () => {
    if (!taskName.trim()) {
      toast.error("Please enter what you worked on.");
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      if (editingSession) {
        updatePomodoroSession({
          ...editingSession,
          taskName: taskName.trim(),
          note: note.trim(),
        });
        toast.success("Session updated!");
      } else {
        const newSession: PomodoroSession = {
          id: `pomo_${Date.now()}`,
          taskName: taskName.trim(),
          note: note.trim(),
          durationMinutes,
          date: new Date().toISOString(),
        };
        addPomodoroSession(newSession);
        toast.success("Session saved!");
      }

      setIsLoading(false);
      onClose();
    }, 300);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg p-6 mx-4 bg-light-bg dark:bg-gray-800 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute text-gray-400 top-4 right-4 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold">{editingSession ? 'Edit Session' : 'Save Session'}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Log the focus session you just completed.</p>
        
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="taskName" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">What did you work on?</label>
            <input id="taskName" type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g., Wrote chapter 3 of novel"
              className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue" />
          </div>

          <div>
            <label htmlFor="sessionNote" className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">Note (Optional)</label>
            <textarea id="sessionNote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any details to add?" rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue" />
          </div>
          
          <div className="flex justify-between items-center text-sm p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
            <span className="font-medium">Duration: <span className="font-bold">{durationMinutes} minutes</span></span>
            <span className="text-gray-500 dark:text-gray-400">{new Date(editingSession?.date || Date.now()).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-end pt-2 space-x-3">
            <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium transition-colors rounded-lg h-10 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg h-10 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingSession ? "Save Changes" : "Save to History")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function PomodoroCustom() {
  const { pomodoroHistory, deletePomodoroSession } = useStore();

  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PomodoroSession | null>(null);

  const handleTimerEnd = useCallback(() => {
    toast.success("Time's Up! Great focus session. 🎉");
    confetti({ 
      particleCount: 150, 
      spread: 80, 
      origin: { y: 0.5 },
      colors: ['#60A5FA', '#FBBF24', '#34D399', '#F87171', '#A78BFA']
    });
    setEditingSession(null); // Ensure we are creating a new session
    setIsSaveModalOpen(true);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(duration);
    setSeconds(0);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerEnd();
            resetTimer();
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, handleTimerEnd, resetTimer]);

  const handleSetDuration = () => {
    if (customDuration >= 1 && customDuration <= 120) {
      setDuration(customDuration);
      setMinutes(customDuration);
      setSeconds(0);
      setIsActive(false);
      setIsEditingDuration(false);
      toast.success(`Timer set to ${customDuration} minutes.`);
    } else {
      toast.error("Please enter a duration between 1 and 120 minutes.");
    }
  };

  const handleOpenSaveModal = () => {
    setEditingSession(null);
    setIsSaveModalOpen(true);
  };
  
  const handleEditSession = (session: PomodoroSession) => {
    setEditingSession(session);
    setIsSaveModalOpen(true);
  };

  const getFormattedDate = (dateString: string) => new Date(dateString).toISOString().split('T')[0];

  const downloadHistoryAsTxt = () => {
    if (pomodoroHistory.length === 0) { toast.error("No history to download."); return; }
    const header = `=================================\nPUREFLOW POMODORO HISTORY – ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}\n=================================`;
    const content = pomodoroHistory
      .map(s => {
        const finished = new Date(s.date).toLocaleString();
        const note = s.note ? `\n    Note: ${s.note}` : '';
        return `\n- Task: ${s.taskName} (${s.durationMinutes} mins)\n    Finished: ${finished}${note}`;
      }).join('\n');
    const blob = new Blob([`${header}\n${content}`], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `PureFlow_Pomodoro_History_${getFormattedDate(new Date().toISOString())}.txt`);
    toast.success("History downloaded as TXT.");
  };

  const downloadHistoryAsDocx = () => {
    if (pomodoroHistory.length === 0) { toast.error("No history to download."); return; }
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `PureFlow Pomodoro History – ${new Date().toLocaleDateString()}`, heading: HeadingLevel.TITLE }),
          ...pomodoroHistory.flatMap(session => [
            new Paragraph({
              children: [
                new TextRun({ text: session.taskName, bold: true }),
                new TextRun({ text: ` (${session.durationMinutes} minute session)`, color: '555555' })
              ],
              bullet: { level: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Finished: ${new Date(session.date).toLocaleString()}`, italics: true, color: '888888' })],
              indent: { left: 720 }
            }),
            ...(session.note ? [new Paragraph({ children: [new TextRun(session.note)], indent: { left: 720 } })] : []),
            new Paragraph({ text: '' }),
          ])
        ],
      }],
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `PureFlow_Pomodoro_History_${getFormattedDate(new Date().toISOString())}.docx`);
      toast.success("History downloaded as Word (.docx).");
    });
  };

  const progress = duration > 0 ? (duration * 60 - (minutes * 60 + seconds)) / (duration * 60) : 0;
  const isStopped = !isActive && minutes === duration && seconds === 0;

  return (
    <>
    <PomodoroSaveModal 
      isOpen={isSaveModalOpen} 
      onClose={() => setIsSaveModalOpen(false)} 
      durationMinutes={editingSession ? editingSession.durationMinutes : duration}
      editingSession={editingSession}
    />
    <div className="p-5 bg-white/30 dark:bg-gray-800/20 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-xl shadow-soft">
      <h2 className="text-xl font-bold tracking-tight text-center">Pomodoro</h2>
      <div className="relative my-6 flex items-center justify-center">
        <svg className="transform -rotate-90 w-48 h-48" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700/50" fill="transparent" />
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="12" fill="transparent"
            className="text-accent-blue"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={(2 * Math.PI * 90) * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute">
          <p className="text-5xl font-bold tabular-nums tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>
      
      {isEditingDuration ? (
        <div className="flex items-center justify-center gap-2 mb-4">
            <input type="number" min="1" max="120"
                value={customDuration}
                onChange={e => setCustomDuration(Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSetDuration()}
                className="w-24 h-12 px-3 text-lg font-bold text-center bg-gray-100 border-2 border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            <button onClick={handleSetDuration} className="flex items-center justify-center w-12 h-12 text-white bg-accent-blue rounded-lg hover:bg-accent-blue/90"><Check className="w-6 h-6"/></button>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button onClick={() => setIsEditingDuration(true)} className="flex items-center justify-center w-12 h-12 bg-gray-200/50 rounded-full dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600"><Settings className="w-6 h-6" /></button>
          <button onClick={() => setIsActive(!isActive)} className="flex items-center justify-center w-20 h-20 text-white bg-accent-blue rounded-full hover:bg-accent-blue/90 shadow-lg">
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button onClick={resetTimer} className="flex items-center justify-center w-12 h-12 bg-gray-200/50 rounded-full dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600"><RotateCcw className="w-6 h-6" /></button>
        </div>
      )}

      {!isActive && !isStopped && (
        <div className="flex justify-center mb-6">
            <button onClick={handleOpenSaveModal} className="inline-flex items-center justify-center h-11 gap-2.5 px-6 text-sm font-semibold text-white bg-accent-blue/80 rounded-lg hover:bg-accent-blue">
                <Save className="w-4 h-4" /> Save Session
            </button>
        </div>
      )}

      {/* Pomodoro History Section */}
      <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">History</h3>
            <div className="flex items-center gap-2">
                <button onClick={downloadHistoryAsTxt} title="Download All as TXT" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileText className="w-4 h-4" /></button>
                <button onClick={downloadHistoryAsDocx} title="Download All as Word" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileCode className="w-4 h-4" /></button>
            </div>
        </div>
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2">
          {pomodoroHistory.length === 0 ? (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-6">No completed sessions yet.</p>
          ) : (
            pomodoroHistory.map(session => (
              <div key={session.id} className="p-3 bg-white/40 dark:bg-gray-800/30 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{session.taskName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.durationMinutes} mins on {new Date(session.date).toLocaleDateString()}
                      </p>
                       {session.note && <p className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded whitespace-pre-wrap">{session.note}</p>}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                      <button onClick={() => handleEditSession(session)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-accent-blue"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deletePomodoroSession(session.id)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}
