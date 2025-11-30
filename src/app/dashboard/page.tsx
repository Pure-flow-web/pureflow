"use client";

import { useUserStore } from "@/store/useUserStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user } = useUserStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("You have been logged out.");
      router.push("/login");
    } catch (error: any) {
      toast.error("Logout Failed", { description: error.message });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <h1 className="text-xl font-bold">Flow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.displayName || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
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
          <p className="text-gray-500">
            Your dashboard is ready. Start being productive.
          </p>
        </div>
      </main>
    </div>
  );
}
