import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PureFlow",
  description: "Focus on what matters. Your all-in-one productivity dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700",
                error: "dark:!bg-red-900 dark:!text-white",
                success: "dark:!bg-green-900 dark:!text-white",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
