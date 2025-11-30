"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { LogIn, LoaderCircle } from "lucide-react";

function AuthPage() {
  const auth = useAuth();
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">PureFlow</h1>
        <p className="text-muted-foreground mt-2">Your minimal productivity companion.</p>
      </div>
      <button
        onClick={handleSignIn}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 bg-card border shadow-sm hover:bg-secondary"
      >
        <LogIn className="w-5 h-5" />
        Sign in with Google
      </button>
    </div>
  );
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/tasks");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="w-12 h-12 animate-spin text-accent" />
        <p className="ml-4">Redirecting...</p>
    </div>
  );
}
