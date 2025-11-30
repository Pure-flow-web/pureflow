"use client";

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Check } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function PomodoroCustom() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 100% silent, visual-only notification
  const handleTimerEnd = useCallback(() => {
    toast.success("Time's Up! Great focus session.");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
      setIsEditing(false);
      toast.success(`Timer set to ${customDuration} minutes.`);
    } else {
      toast.error("Please enter a duration between 1 and 120 minutes.");
    }
  };

  const progress = duration > 0 ? (duration * 60 - (minutes * 60 + seconds)) / (duration * 60) : 0;

  return (
    <div className="relative p-5 bg-white/30 dark:bg-gray-800/20 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-xl shadow-soft">
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
    </div>
  );
}
