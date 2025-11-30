"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Ensure Audio context is available
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjgyLjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1BpbmdCAAAAAABAAAAjAAABnAAAAAAAAAABnAAAABAAAAAAAAAABOupBx4kGv9//5JkAMAAAD5DH//5JkZIAAAADBDH//5Jks4gAAADpDH//5JlL4gAAADpDH//5Jk/ogAAADBDH//5JlFogAAADxDHA==');
    }
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.log("Audio play failed:", error));
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
        if (seconds === 0) {
          if (minutes === 0) {
            playSound();
            resetTimer();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, resetTimer, playSound]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  if (!isClient) {
    return null; // Avoid rendering on server
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg bg-card border shadow-sm max-w-md mx-auto">
      <h2 className="text-2xl font-semibold tracking-tight">Pomodoro Timer</h2>
      <p className="mt-2 text-muted-foreground">Focus for 25 minutes, then take a short break.</p>
      <div className="my-10">
        <p className="text-8xl font-bold tabular-nums tracking-tighter">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={resetTimer} 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full transition-colors bg-muted hover:bg-accent disabled:opacity-50"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={toggleTimer} 
          className="inline-flex items-center justify-center w-20 h-20 text-white rounded-full transition-colors bg-primary hover:bg-primary/90 disabled:opacity-50"
          aria-label={isActive ? "Pause timer" : "Start timer"}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <div className="w-16 h-16"></div>
      </div>
    </div>
  );
}
