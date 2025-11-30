"use client";

import AppLayout from "@/components/AppLayout";
import NoteEditor from "@/components/NoteEditor";

export default function NotesPage() {
  return (
    <AppLayout title="Notes">
      <div className="p-4 sm:p-6 h-full">
        <NoteEditor />
      </div>
    </AppLayout>
  );
}
