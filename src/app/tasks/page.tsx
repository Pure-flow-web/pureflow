"use client";

import AppLayout from "@/components/AppLayout";
import TaskList from "@/components/TaskList";

export default function TasksPage() {
  return (
    <AppLayout title="Tasks">
      <div className="p-4 sm:p-6">
        <TaskList />
      </div>
    </AppLayout>
  );
}
