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

  // Set the class on the <html> element
  useEffect(() => {
    if (isMounted) {
      document.documentElement.className = theme;
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme, isMounted]);

  // Render a placeholder on the server and during initial hydration
  if (!isMounted) {
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
