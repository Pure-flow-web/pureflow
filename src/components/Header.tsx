"use client";

import { Sun, Moon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, toggleTheme } = useStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-3">
        <Zap className="text-accent-blue w-7 h-7" />
        <h1 className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
          PureFlow
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {isMounted && (
           <button
            onClick={toggleTheme}
            className="p-2 transition-all duration-200 rounded-full hover:bg-gray-500/10 text-gray-500 dark:text-gray-400"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
      </div>
    </header>
  );
}
