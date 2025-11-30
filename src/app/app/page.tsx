"use client";

import { useStore } from "@/store/useStore";
import { toast } from 'sonner';
import { LogOut, Sun, Moon, LoaderCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TaskList from "@/components/TaskList";
import { useAuth } from "@/firebase";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-accent"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useStore();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      toast.info("You have been logged out.");
      router.push('/');
    } catch (error: any) {
        console.error("Logout Error:", error);
        toast.error("Logout failed", { description: error.message });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <h1 className="text-xl font-bold">ZeroError</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Hi, {user.displayName || "User"}
          </span>
          <ThemeToggle />
          {user.photoURL && <Image src={user.photoURL} alt="user avatar" width={32} height={32} className="rounded-full" />}
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <TaskList />
        </div>
      </main>
    </div>
  );
}
