import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PureFlow",
  description: "The ultimate, battle-hardened productivity web app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700 shadow-soft dark:shadow-soft-dark",
                error: "dark:!bg-red-900 dark:!text-white",
                success: "dark:!bg-green-800 dark:!text-white",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
