"use client";

import type { Metadata } from "next";
import { useEffect, useState } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";

// Since we cannot import Metadata in a client component,
// we create a separate constant for it.
export const metadata: Metadata = {
  title: "PureFlow",
  description: "Focus on what matters. The ultimate productivity app.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = useStore((state) => state.theme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by setting the class only on the client
  useEffect(() => {
    if (isMounted) {
      document.documentElement.className = theme;
    }
  }, [theme, isMounted]);

  if (!isMounted) {
    // Render a static layout on the server to avoid flash of unstyled content
    return (
      <html lang="en">
        <body className="font-sans bg-light-bg text-gray-900">
          <div style={{ visibility: 'hidden' }}>{children}</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={theme} style={{ colorScheme: theme }}>
      <body className="font-sans bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
