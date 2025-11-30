"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useStore, Note } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, LoaderCircle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function NoteEditor() {
  const { user } = useAuth();
  const {
    notes,
    loading: notesLoading,
    fetchNotes,
    saveNote,
    deleteNote,
  } = useStore();
  
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const debouncedContent = useDebounce(content, 2000); // 2-second debounce

  useEffect(() => {
    if (user) {
      fetchNotes(user.uid);
    }
  }, [user, fetchNotes]);

  useEffect(() => {
    if (debouncedContent && activeNote && user) {
      const noteToSave: Note = {
        ...activeNote,
        content: debouncedContent,
        lastEdited: new Date(),
      };
      saveNote(user.uid, noteToSave).then(() => {
        // Optimistically update active note
        setActiveNote(noteToSave);
      });
    }
  }, [debouncedContent, activeNote, user, saveNote]);

  const handleNewNote = async () => {
    if (!user) return;
    const newNote: Partial<Note> = {
      content: "",
      lastEdited: new Date(),
    };
    const savedNote = await saveNote(user.uid, newNote);
    if (savedNote) {
      selectNote(savedNote);
    }
  };

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setContent(note.content);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!user) return;
    deleteNote(user.uid, noteId);
    if (activeNote?.id === noteId) {
      setActiveNote(null);
      setContent("");
    }
  };

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
              <LoaderCircle className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-2">
              {notes.length > 0 ? (
                notes
                  .slice()
                  .sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime())
                  .map((note) => (
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
                          {new Date(note.lastEdited).toLocaleString()}
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
