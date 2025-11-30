import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AppProvider from "@/components/AppProvider";

export const metadata: Metadata = {
  title: "PureFlow",
  description: "Focus on what matters. The ultimate productivity app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-light-bg text-gray-900">
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
