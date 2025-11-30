"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PomodoroCustom() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjgyLjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1BpbmdCAAAAAABAAAAjAAABnAAAAAAAAAABnAAAABAAAAAAAAAABOupBx4kGv9//5JkAMAAAD5DH//5JkZIAAAADBDH//5Jks4gAAADpDH//5JlL4gAAADpDH//5Jk/ogAAADBDH//5JlFogAAADxDHA==');
    }
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      toast.success("Pomodoro session finished. Time for a break!");
    }
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
            playSound();
            resetTimer();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, playSound, resetTimer]);

  const toggleTimer = () => setIsActive(!isActive);

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

  const progress = (duration * 60 - (minutes * 60 + seconds)) / (duration * 60);

  return (
    <div className="relative p-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold tracking-tight text-center">Pomodoro</h2>
      <div className="relative my-6 flex items-center justify-center">
        <svg className="transform -rotate-90 w-48 h-48">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700" fill="transparent" />
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                className="text-blue-500"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={(2 * Math.PI * 88) * (1 - progress)}
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
                className="w-24 h-12 px-3 text-lg font-bold text-center bg-gray-100 border-2 border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSetDuration} className="flex items-center justify-center w-12 h-12 text-white bg-blue-600 rounded-lg hover:bg-blue-700"><Check className="w-6 h-6"/></button>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-4">
          <button onClick={() => setIsEditing(true)} className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><Settings className="w-6 h-6" /></button>
          <button onClick={toggleTimer} className="flex items-center justify-center w-20 h-20 text-white bg-blue-600 rounded-full hover:bg-blue-700">
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button onClick={resetTimer} className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><RotateCcw className="w-6 h-6" /></button>
        </div>
      )}
    </div>
  );
}
