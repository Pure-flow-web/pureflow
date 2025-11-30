"use client";

import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { toast } from "sonner";
import { LogOut, LoaderCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("You have been logged out.");
      router.push("/login");
    } catch (error: any) {
      toast.error("Logout Failed", { description: error.message });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This can happen briefly while redirecting
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <h1 className="text-xl font-bold">Flow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.displayName || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">
            Welcome, {user?.displayName || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Your dashboard is ready. Start being productive.
          </p>
        </div>
      </main>
    </div>
  );
}
