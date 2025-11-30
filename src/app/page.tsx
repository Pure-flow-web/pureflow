"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import PomodoroCustom from "@/components/PomodoroCustom";
import { LayoutGrid, ListChecks, StickyNote, Timer } from "lucide-react";

type View = "dashboard" | "tasks" | "notes";

export default function PureFlowDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeView, setActiveView] = useState<View>("dashboard");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TaskList />
            <div className="flex flex-col gap-6">
              <NotesSection />
              <PomodoroCustom />
            </div>
          </div>
        );
      case "tasks":
        return <TaskList />;
      case "notes":
        return <NotesSection />;
      default:
        return null;
    }
  };

  const NavButton = ({ view, label, icon: Icon }: { view: View; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeView === view
          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          : "text-gray-500 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen text-gray-800 bg-gray-100/50 dark:bg-gray-900/95 dark:text-gray-200">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen p-3 md:p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-r border-gray-200/80 dark:border-gray-800/80">
        <nav className="flex flex-col items-center gap-2 md:items-stretch">
          <NavButton view="dashboard" label="Dashboard" icon={LayoutGrid} />
          <NavButton view="tasks" label="Tasks" icon={ListChecks} />
          <NavButton view="notes" label="Notes" icon={StickyNote} />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <Header />
        <main className="p-4 sm:p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
