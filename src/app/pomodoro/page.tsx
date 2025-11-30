"use client";

import AppLayout from "@/components/AppLayout";
import PomodoroTimer from "@/components/PomodoroTimer";

export default function PomodoroPage() {
  return (
    <AppLayout title="Pomodoro">
      <div className="flex items-center justify-center h-full p-4">
        <PomodoroTimer />
      </div>
    </AppLayout>
  );
}
