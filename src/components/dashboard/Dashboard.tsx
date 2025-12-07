import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { encryptData, decryptData } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  FileText, 
  Search, 
  LogOut, 
  Save, 
  Trash2, 
  Pin, 
  Archive, 
  ArchiveRestore, 
  Star,
  Inbox,
  RotateCcw,
  Tag,
  Hash
} from 'lucide-react';
import NoteEditor from './NoteEditor';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LabelSelector } from './LabelSelector';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ViewType = 'all' | 'favorites' | 'archive' | 'trash';

export default function Dashboard() {
  const { user, encryptionKey, logout } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | null>(null);
  
  // Editor State
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        setEditorTitle(note.title);
        setEditorContent(note.content);
      }
    } else {
      setEditorTitle("");
      setEditorContent("");
    }
  }, [selectedNoteId, notes]);

  const loadNotes = async () => {
    try {
      const encryptedNotes = await db.getNotes();
      const decryptedNotes = encryptedNotes.map(note => {
        try {
            const title = decryptData(note.encryptedTitle, encryptionKey);
            const content = decryptData(note.encryptedContent, encryptionKey);
            return { 
              ...note, 
              title, 
              content,
              isPinned: !!note.isPinned,
              isArchived: !!note.isArchived,
              isTrashed: !!note.isTrashed,
              labels: note.labels || []
            };
        } catch (e) {
            console.error("Failed to decrypt note", note.id);
            return { ...note, title: "Decryption Error", content: "", labels: [] };
        }
      }).filter(n => n.title !== null);
      
      decryptedNotes.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return b.updatedAt - a.updatedAt;
        }
        return a.isPinned ? -1 : 1;
      });

      setNotes(decryptedNotes);
    } catch (e) {
      console.error("Failed to load notes", e);
      toast.error("Failed to load notes");
    }
  };

  const handleCreateNote = async () => {
    if (currentView === 'archive' || currentView === 'trash') setCurrentView('all');
    setSelectedLabelFilter(null);

    const newId = uuidv4();
    const now = Date.now();
    
    const newNote = {
      id: newId,
      title: "Untitled Note",
      content: "",
      createdAt: now,
      updatedAt: now,
      folderId: null,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      labels: []
    };

    setNotes([newNote, ...notes]);
    setSelectedNoteId(newId);
    
    await saveNoteToDb(newNote);
  };

  const saveNoteToDb = async (note: any) => {
    try {
      const encryptedTitle = encryptData(note.title, encryptionKey);
      const encryptedContent = encryptData(note.content, encryptionKey);

      await db.saveNote({
        id: note.id,
        encryptedTitle,
        encryptedContent,
        folderId: note.folderId,
        isPinned: note.isPinned,
        isArchived: note.isArchived,
        isTrashed: note.isTrashed,
        labels: note.labels,
        createdAt: note.createdAt,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error("Save failed", e);
      toast.error("Failed to save note");
    }
  };

  const handleSave = async () => {
    if (!selectedNoteId) return;
    setIsSaving(true);
    
    const noteToSave = notes.find(n => n.id === selectedNoteId);
    if (noteToSave) {
        const updatedNote = {
            ...noteToSave,
            title: editorTitle,
            content: editorContent,
            updatedAt: Date.now()
        };
        setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
        toast.success("Saved");
    }
    setIsSaving(false);
  };

  const togglePin = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedNoteId) return;

    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
      const updatedNote = { ...note, isPinned: !note.isPinned };
      setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
      await saveNoteToDb(updatedNote);
      toast.success(updatedNote.isPinned ? "Note pinned" : "Note unpinned");
    }
  };

  const toggleArchive = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedNoteId) return;

    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
      const updatedNote = { 
        ...note, 
        isArchived: !note.isArchived,
        isPinned: false 
      };
      setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
      await saveNoteToDb(updatedNote);
      
      if (currentView === 'all' && updatedNote.isArchived) {
         toast.success("Note archived");
         setSelectedNoteId(null);
      } else if (currentView === 'archive' && !updatedNote.isArchived) {
         toast.success("Note restored");
         setSelectedNoteId(null);
      } else {
         toast.success(updatedNote.isArchived ? "Note archived" : "Note restored");
      }
    }
  };

  const handleSoftDelete = async () => {
    if (!selectedNoteId) return;
    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
        const updatedNote = { 
            ...note, 
            isTrashed: true,
            isPinned: false,
            isArchived: false
        };
        setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
        setSelectedNoteId(null);
        toast.success("Moved to Recycle Bin");
    }
  };

  const handleRestore = async () => {
    if (!selectedNoteId) return;
    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
        const updatedNote = { ...note, isTrashed: false };
        setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
        setSelectedNoteId(null);
        toast.success("Note restored");
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedNoteId) return;
    if(confirm("Are you sure you want to delete this note permanently? This cannot be undone.")) {
        await db.deleteNote(selectedNoteId);
        setNotes(notes.filter(n => n.id !== selectedNoteId));
        setSelectedNoteId(null);
        toast.success("Note permanently deleted");
    }
  }

  const handleLabelsChange = async (newLabels: string[]) => {
    if (!selectedNoteId) return;
    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
        const updatedNote = { ...note, labels: newLabels };
        setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
    }
  };

  // Get all unique labels
  const allLabels = useMemo(() => {
    const labels = new Set<string>();
    notes.forEach(note => {
        note.labels?.forEach((l: string) => labels.add(l));
    });
    return Array.from(labels).sort();
  }, [notes]);

  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // View Filter
    if (currentView === 'trash') {
        return n.isTrashed;
    }

    if (n.isTrashed) return false; // Don't show trash in other views

    if (selectedLabelFilter) {
        return n.labels?.includes(selectedLabelFilter);
    }

    if (currentView === 'favorites') {
        return n.isPinned && !n.isArchived;
    } else if (currentView === 'archive') {
        return n.isArchived;
    } else {
        return !n.isArchived;
    }
  });

  const currentNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
            <div className="font-bold text-lg flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">V</span>
                </div>
                VaultNotes
            </div>
        </div>
        
        <div className="p-4">
            <Button onClick={handleCreateNote} className="w-full justify-start gap-2 shadow-sm">
                <Plus size={16} /> New Note
            </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 p-2">
                <Button 
                    variant={currentView === 'all' && !selectedLabelFilter ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2 font-normal"
                    onClick={() => { setCurrentView('all'); setSelectedLabelFilter(null); }}
                >
                    <Inbox size={16} /> All Notes
                </Button>
                <Button 
                    variant={currentView === 'favorites' ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2 font-normal"
                    onClick={() => { setCurrentView('favorites'); setSelectedLabelFilter(null); }}
                >
                    <Star size={16} /> Favorites
                </Button>
                <Button 
                    variant={currentView === 'archive' ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2 font-normal"
                    onClick={() => { setCurrentView('archive'); setSelectedLabelFilter(null); }}
                >
                    <Archive size={16} /> Archive
                </Button>
                <Button 
                    variant={currentView === 'trash' ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2 font-normal"
                    onClick={() => { setCurrentView('trash'); setSelectedLabelFilter(null); }}
                >
                    <Trash2 size={16} /> Recycle Bin
                </Button>
            </div>

            {allLabels.length > 0 && (
                <div className="mt-4 px-2">
                    <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">Labels</h3>
                    <div className="space-y-1">
                        {allLabels.map(label => (
                            <Button
                                key={label}
                                variant={selectedLabelFilter === label ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2 font-normal h-8"
                                onClick={() => { setSelectedLabelFilter(label); setCurrentView('all'); }}
                            >
                                <Hash size={14} /> {label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </ScrollArea>

        <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {user?.username.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">Encrypted Vault</p>
                </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={logout}>
                <LogOut size={14} /> Lock Vault
            </Button>
        </div>
      </aside>

      {/* Note List */}
      <div className="w-80 border-r flex flex-col bg-background/50">
        <div className="p-4 border-b space-y-2">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {currentView === 'trash' ? 'Recycle Bin' : selectedLabelFilter ? `#${selectedLabelFilter}` : currentView === 'favorites' ? 'Favorites' : currentView === 'archive' ? 'Archive' : 'All Notes'}
            </h2>
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search..." 
                    className="pl-8 h-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <ScrollArea className="flex-1">
            <div className="flex flex-col divide-y">
                {filteredNotes.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 opacity-20" />
                        <p>No notes found</p>
                    </div>
                )}
                {filteredNotes.map(note => (
                    <button
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={cn(
                            "flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors relative group w-full",
                            selectedNoteId === note.id ? "bg-muted" : ""
                        )}
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className={cn("font-semibold text-sm line-clamp-1", note.isPinned && "text-primary")}>
                                {note.title || "Untitled"}
                            </span>
                            {note.isPinned && <Pin size={12} className="fill-primary text-primary shrink-0 ml-2" />}
                        </div>
                        
                        <div className="text-xs text-muted-foreground line-clamp-2 w-full h-8">
                            {note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 100) : "No content"}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 w-full overflow-hidden">
                            {note.labels?.slice(0, 3).map((l: string) => (
                                <Badge key={l} variant="outline" className="text-[10px] px-1 py-0 h-4">{l}</Badge>
                            ))}
                        </div>

                        <div className="text-[10px] text-muted-foreground mt-1 flex justify-between w-full">
                            <span>{format(note.updatedAt, 'MMM d, yyyy')}</span>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
      </div>

      {/* Editor Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedNoteId && currentNote ? (
            <TooltipProvider>
            <>
                <div className="flex items-center justify-between p-4 border-b h-16">
                    {currentView === 'trash' ? (
                        <div className="flex items-center gap-2 text-destructive">
                            <Trash2 size={20} />
                            <span className="font-semibold">Note in Recycle Bin</span>
                        </div>
                    ) : (
                        <Input 
                            value={editorTitle}
                            onChange={(e) => setEditorTitle(e.target.value)}
                            className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent w-full mr-4"
                            placeholder="Note Title"
                        />
                    )}
                    
                    <div className="flex items-center gap-1">
                        {currentView === 'trash' ? (
                            <>
                                <Button variant="outline" size="sm" onClick={handleRestore} className="gap-2">
                                    <RotateCcw size={16} /> Restore
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handlePermanentDelete} className="gap-2">
                                    <Trash2 size={16} /> Delete Forever
                                </Button>
                            </>
                        ) : (
                            <>
                                <LabelSelector 
                                    selectedLabels={currentNote.labels || []}
                                    allLabels={allLabels}
                                    onLabelsChange={handleLabelsChange}
                                />
                                <Separator orientation="vertical" className="h-6 mx-2" />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={(e) => togglePin(e)}>
                                            <Pin size={18} className={cn(currentNote.isPinned ? "fill-primary text-primary" : "text-muted-foreground")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{currentNote.isPinned ? "Unpin Note" : "Pin Note"}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={(e) => toggleArchive(e)}>
                                            {currentNote.isArchived ? 
                                                <ArchiveRestore size={18} className="text-muted-foreground" /> : 
                                                <Archive size={18} className="text-muted-foreground" />
                                            }
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{currentNote.isArchived ? "Restore from Archive" : "Archive Note"}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <div className="w-px h-4 bg-border mx-1" />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleSoftDelete}>
                                            <Trash2 size={18} className="text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Move to Recycle Bin</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Button size="sm" onClick={handleSave} disabled={isSaving} className="ml-2">
                                    <Save size={16} className="mr-2" />
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                    {currentView === 'trash' ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>This note is in the recycle bin. Restore it to edit.</p>
                            <div className="mt-8 opacity-50 pointer-events-none" dangerouslySetInnerHTML={{ __html: currentNote.content }} />
                        </div>
                    ) : (
                        <NoteEditor 
                            content={editorContent} 
                            onChange={setEditorContent} 
                        />
                    )}
                </div>
            </>
            </TooltipProvider>
        ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4 bg-muted/5">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <FileText size={40} className="opacity-50" />
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg text-foreground">Select a note to view</h3>
                    <p className="text-sm max-w-xs mx-auto mt-2">
                        Choose a note from the list on the left, or create a new one to get started.
                    </p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
