"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { LoaderCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.replace("/tasks");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}