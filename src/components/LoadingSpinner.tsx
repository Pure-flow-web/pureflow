"use client";

import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show spinner if loading takes more than 300ms
    const timer = setTimeout(() => {
      setShow(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

export function PageLoader() {
    const [show, setShow] = useState(true);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTimedOut(true);
        }, 2000); // Force show content after 2 seconds

        return () => clearTimeout(timeoutId);
    }, []);

    if (timedOut) {
        return null;
    }

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <LoadingSpinner text="Getting things ready..." />
        </div>
    )
}
