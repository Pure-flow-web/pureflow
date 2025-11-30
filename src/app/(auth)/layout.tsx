import { useUserStore } from "@/store/useUserStore";
import { redirect } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a server component, so we can't use the hook directly.
  // The middleware will handle redirection for logged-in users.
  // This layout is primarily for structure and styling of auth pages.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {children}
    </main>
  );
}
