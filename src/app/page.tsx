"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, ListChecks, FileText, Timer, Menu, X } from "lucide-react";
import TaskList from "@/components/TaskList";
import Pomodoro from "@/components/Pomodoro";
import { useStore } from "@/store/useStore";

function NotesView() {
  const notes = useStore((state) => state.notes);
  const setNotes = useStore((state) => state.setNotes);
  const [content, setContent] = useState(notes);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (content !== notes) {
        setNotes(content);
      }
    }, 2000); // Auto-save every 2 seconds

    return () => {
      clearTimeout(handler);
    };
  }, [content, notes, setNotes]);

  return (
    <div className="h-full">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your notes here... they will be saved automatically."
        className="w-full h-full p-4 text-base bg-transparent border-0 rounded-lg resize-none focus:ring-0"
      />
    </div>
  );
}

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const activeView = useStore((state) => state.activeView);
  const setActiveView = useStore((state) => state.setActiveView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => {
        setActiveView(view as 'tasks' | 'notes' | 'pomodoro');
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeView === view
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
  
  const renderContent = () => {
    switch (activeView) {
      case "tasks":
        return <TaskList />;
      case "notes":
        return <NotesView />;
      case "pomodoro":
        return <Pomodoro />;
      default:
        return <TaskList />;
    }
  };

  if (!isMounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed z-30 p-2 text-gray-500 bg-white rounded-full shadow-lg bottom-4 right-4 lg:hidden dark:bg-gray-800"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 flex-shrink-0 w-64 p-4 space-y-2 transition-transform duration-300 transform bg-card border-r lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <h1 className="px-4 text-2xl font-bold">InstantFlow</h1>
        <nav className="flex flex-col pt-4 space-y-1">
          <NavItem view="tasks" icon={ListChecks} label="Tasks" />
          <NavItem view="notes" icon={FileText} label="Notes" />
          <NavItem view="pomodoro" icon={Timer} label="Pomodoro" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-end flex-shrink-0 h-16 px-6 border-b">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-accent"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
