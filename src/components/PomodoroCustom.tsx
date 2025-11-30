"use client";

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Check, Edit, Trash2, FileText, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useStore, type PomodoroSession } from '@/lib/store';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export default function PomodoroCustom() {
  const { pomodoroHistory, addPomodoroSession, updatePomodoroNote, deletePomodoroSession } = useStore();

  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // When timer ends, add to history and show notification
  const handleTimerEnd = useCallback(() => {
    toast.success("Time's Up! Great focus session.");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const newSession: PomodoroSession = {
      id: `pomo_${Date.now()}`,
      finishedAt: new Date().toISOString(),
      duration: duration,
      note: '',
    };
    addPomodoroSession(newSession);
  }, [duration, addPomodoroSession]);

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
      setIsEditing(false);
      toast.success(`Timer set to ${customDuration} minutes.`);
    } else {
      toast.error("Please enter a duration between 1 and 120 minutes.");
    }
  };

  const handleEditNote = (session: PomodoroSession) => {
    const newNote = prompt("Enter a note for this session:", session.note);
    if (newNote !== null) {
      updatePomodoroNote(session.id, newNote);
      toast.success("Note updated.");
    }
  };

  const getFormattedDate = () => new Date().toISOString().split('T')[0];

  const downloadHistoryAsTxt = () => {
    if (pomodoroHistory.length === 0) { toast.error("No history to download."); return; }
    const header = `=================================\nPUREFLOW POMODORO HISTORY – ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}\n=================================`;
    const content = pomodoroHistory
      .map(s => {
        const finished = new Date(s.finishedAt).toLocaleString();
        const note = s.note ? `\n  Note: ${s.note}` : '';
        return `\n- ${s.duration} minute session finished on ${finished}${note}`;
      }).join('\n');
    const blob = new Blob([`${header}\n${content}`], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `PureFlow_Pomodoro_History_${getFormattedDate()}.txt`);
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
                new TextRun({ text: `${session.duration} minute session`, bold: true }),
                new TextRun({ text: ` (Finished: ${new Date(session.finishedAt).toLocaleString()})`, italics: true, color: '888888' })
              ],
              bullet: { level: 0 },
            }),
            ...(session.note ? [new Paragraph({ children: [new TextRun(session.note)], indent: { left: 720 } })] : []),
            new Paragraph({ text: '' }),
          ])
        ],
      }],
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `PureFlow_Pomodoro_History_${getFormattedDate()}.docx`);
      toast.success("History downloaded as Word (.docx).");
    });
  };

  const progress = duration > 0 ? (duration * 60 - (minutes * 60 + seconds)) / (duration * 60) : 0;

  return (
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
      
      {isEditing ? (
        <div className="flex items-center justify-center gap-2">
            <input type="number" min="1" max="120"
                value={customDuration}
                onChange={e => setCustomDuration(Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSetDuration()}
                className="w-24 h-12 px-3 text-lg font-bold text-center bg-gray-100 border-2 border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            <button onClick={handleSetDuration} className="flex items-center justify-center w-12 h-12 text-white bg-accent-blue rounded-lg hover:bg-accent-blue/90"><Check className="w-6 h-6"/></button>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-4">
          <button onClick={() => setIsEditing(true)} className="flex items-center justify-center w-12 h-12 bg-gray-200/50 rounded-full dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600"><Settings className="w-6 h-6" /></button>
          <button onClick={() => setIsActive(!isActive)} className="flex items-center justify-center w-20 h-20 text-white bg-accent-blue rounded-full hover:bg-accent-blue/90 shadow-lg">
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button onClick={resetTimer} className="flex items-center justify-center w-12 h-12 bg-gray-200/50 rounded-full dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600"><RotateCcw className="w-6 h-6" /></button>
        </div>
      )}

      {/* Pomodoro History Section */}
      <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">History</h3>
            <div className="flex items-center gap-2">
                <button onClick={downloadHistoryAsTxt} title="Download as TXT" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileText className="w-4 h-4" /></button>
                <button onClick={downloadHistoryAsDocx} title="Download as Word" className="inline-flex items-center justify-center h-9 w-9 text-gray-500 bg-gray-200/50 rounded-lg dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"><FileCode className="w-4 h-4" /></button>
            </div>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {pomodoroHistory.length === 0 ? (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No completed sessions yet.</p>
          ) : (
            pomodoroHistory.map(session => (
              <div key={session.id} className="flex items-center justify-between p-2.5 bg-white/40 dark:bg-gray-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{session.duration} minute session</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.note || `Finished: ${new Date(session.finishedAt).toLocaleTimeString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditNote(session)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-accent-blue"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deletePomodoroSession(session.id)} className="p-2 text-gray-400 rounded-full h-8 w-8 hover:bg-gray-500/10 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
