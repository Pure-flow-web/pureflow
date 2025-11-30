"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(POMODORO_DURATION);
  }, [stopTimer]);
  
  useEffect(() => {
    if (timeLeft === 0) {
      stopTimer();
      // Optional: Play a sound or show a notification
    }
  }, [timeLeft, stopTimer]);

  useEffect(() => {
    return () => stopTimer(); // Cleanup on unmount
  }, [stopTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center bg-card p-8 rounded-2xl shadow-lg w-full max-w-sm">
      <div className="text-8xl font-mono font-bold text-foreground tabular-nums">
        {formatTime(timeLeft)}
      </div>
      <div className="flex space-x-4 mt-8">
        <button
          onClick={isActive ? stopTimer : startTimer}
          className="flex items-center justify-center w-24 h-12 bg-accent text-accent-foreground rounded-lg shadow-md hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          <span className="ml-2">{isActive ? "Pause" : "Start"}</span>
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-24 h-12 bg-secondary text-secondary-foreground rounded-lg shadow-md hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="ml-2">Reset</span>
        </button>
      </div>
    </div>
  );
}
