"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthWrapper from "@/components/AuthWrapper";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

// This metadata will not be respected because the file is a client component.
// In a real app, you would move this to a higher-level server component.
// export const metadata: Metadata = {
//   title: "ZeroError",
//   description: "A rock-solid, crash-proof productivity app.",
// };

// A simple Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ErrorFallback = () => (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong.</h1>
            <p className="mt-2 text-muted-foreground">Please refresh the page and try again.</p>
        </div>
    </div>
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
           <ErrorBoundary fallback={<ErrorFallback />}>
             <AuthWrapper>{children}</AuthWrapper>
           </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
