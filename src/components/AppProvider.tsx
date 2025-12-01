"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set the class on the <html> element for Tailwind's dark mode
  useEffect(() => {
    if (isMounted) {
      document.documentElement.className = theme;
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme, isMounted]);

  // To prevent a flash of unstyled content (FOUC), we hide children until the client has mounted and the theme is determined.
  if (!isMounted) {
    // Returning null or a loader is also an option, but this hides the content while preserving structure.
    return (
        <div style={{ visibility: 'hidden' }}>{children}</div>
    );
  }

  // Once mounted, render the children within the themed context
  return <>
    {children}
    <Toaster position="bottom-right" />
  </>;
}
