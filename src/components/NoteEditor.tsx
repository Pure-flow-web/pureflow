"use client";

import React, { useState, useEffect, useCallback } from "react";
import { collection, doc, serverTimestamp, Timestamp, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { Plus, Trash2, LoaderCircle, FileText } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export interface Note {
  id: string;
  userId: string;
  content: string;
  lastEdited: Date | Timestamp;
}

export default function NoteEditor() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notesQuery = useMemoFirebase(
    () => user && collection(firestore, "users", user.uid, "notes"),
    [user, firestore]
  );
  const { data: notes, isLoading: notesLoading } = useCollection<Note>(notesQuery);

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (debouncedContent && activeNote && user) {
      const noteRef = doc(firestore, "users", user.uid, "notes", activeNote.id);
      setDocumentNonBlocking(noteRef, {
        content: debouncedContent,
        lastEdited: serverTimestamp(),
      }, { merge: true });
    }
  }, [debouncedContent, activeNote, user, firestore]);

  const handleNewNote = async () => {
    if (!user) return;
    const notesCol = collection(firestore, "users", user.uid, "notes");
    
    addDocumentNonBlocking(notesCol, {
      userId: user.uid,
      content: "",
      lastEdited: serverTimestamp(),
    });
    toast.success("New note created!");
  };
  
  useEffect(() => {
    if (notes && !activeNote) {
        const sortedNotes = notes.slice().sort((a, b) => (b.lastEdited as Timestamp).toMillis() - (a.lastEdited as Timestamp).toMillis());
        if (sortedNotes.length > 0) {
            selectNote(sortedNotes[0]);
        }
    }
  }, [notes, activeNote]);

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setContent(note.content);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!user) return;
    const noteRef = doc(firestore, "users", user.uid, "notes", noteId);
    deleteDocumentNonBlocking(noteRef);
    if (activeNote?.id === noteId) {
      setActiveNote(null);
      setContent("");
    }
    toast.success("Note deleted.");
  };

  const sortedNotes = notes
    ? [...notes].sort((a, b) => {
        const dateA = a.lastEdited instanceof Timestamp ? a.lastEdited.toDate() : new Date(a.lastEdited as any);
        const dateB = b.lastEdited instanceof Timestamp ? b.lastEdited.toDate() : new Date(b.lastEdited as any);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      <div className="lg:w-1/3 lg:border-r lg:pr-6 border-border flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Notes</h2>
          <button
            onClick={handleNewNote}
            className="p-2 rounded-md hover:bg-secondary"
            aria-label="New Note"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notesLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {sortedNotes.length > 0 ? (
                sortedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`p-3 rounded-md cursor-pointer group transition-colors ${
                        activeNote?.id === note.id
                          ? "bg-primary/20"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <p className="font-medium truncate text-foreground">
                        {note.content.split("\n")[0] || "New Note"}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {note.lastEdited instanceof Timestamp
                            ? note.lastEdited.toDate().toLocaleString()
                            : new Date(note.lastEdited as any).toLocaleString()}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id!);
                          }}
                          className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive"
                          aria-label="Delete Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                 <p className="text-sm text-muted-foreground text-center pt-8">No notes yet. Create one!</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="lg:w-2/3 h-full flex flex-col">
        {activeNote ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            className="w-full h-full p-4 bg-transparent focus:outline-none resize-none text-base leading-relaxed"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <FileText className="w-16 h-16 mb-4" />
            <p>Select a note to start editing, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}