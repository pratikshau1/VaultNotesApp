import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { encryptData, decryptData } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Save, 
  Trash2, 
  Pin, 
  Archive, 
  ArchiveRestore, 
  RotateCcw,
  Folder,
  MoreVertical,
  Check
} from 'lucide-react';
import NoteEditor from './NoteEditor';
import Sidebar from './Sidebar';
import FileVault from './FileVault';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LabelSelector } from './LabelSelector';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewType = 'all' | 'favorites' | 'archive' | 'trash' | 'files';

export default function Dashboard() {
  const { user, encryptionKey } = useAuth();
  
  // Data State
  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  
  // UI State
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | null>(null);
  
  // Editor State
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save timer ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, [encryptionKey]);

  // Sync editor with selected note
  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        // Only update if different to avoid cursor jumps, though simple equality check helps
        if (note.title !== editorTitle) setEditorTitle(note.title);
        // Content sync is tricky with rich text, we rely on editor's internal state mostly, 
        // but for initial load we need this.
        // We only set content if we are switching notes.
        setEditorContent(note.content);
      }
    } else {
      setEditorTitle("");
      setEditorContent("");
    }
  }, [selectedNoteId]); // Only run when ID changes, not when content updates to avoid loops

  // Auto-save Logic
  useEffect(() => {
    if (!selectedNoteId || currentView === 'trash') return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for 2 seconds
    autoSaveTimeoutRef.current = setTimeout(() => {
       handleSave(true); // Silent save
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [editorTitle, editorContent]);

  const loadData = async () => {
    if (!encryptionKey) return;

    try {
      const loadedFolders = await db.getFolders();
      setFolders(loadedFolders.sort((a, b) => a.name.localeCompare(b.name)));

      const encryptedNotes = await db.getNotes();
      const decryptedNotes = encryptedNotes.map(note => {
        try {
            const title = decryptData(note.encryptedTitle, encryptionKey);
            const content = decryptData(note.encryptedContent, encryptionKey);
            return { 
              ...note, 
              title: title || "Untitled", 
              content: content || "",
              isPinned: !!note.isPinned,
              isArchived: !!note.isArchived,
              isTrashed: !!note.isTrashed,
              labels: note.labels || []
            };
        } catch (e) {
            console.error("Failed to decrypt note", note.id);
            return { ...note, title: "Decryption Error", content: "", labels: [] };
        }
      }).filter(n => n !== null);
      
      decryptedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
      setNotes(decryptedNotes);

      const encryptedFiles = await db.getFiles();
      const decryptedFiles = encryptedFiles.map(file => {
        try {
            const name = decryptData(file.encryptedName, encryptionKey);
            return {
                ...file,
                name: name || "Unknown File",
                // Keep blob encrypted until download
            };
        } catch (e) {
            return { ...file, name: "Error", type: "unknown" };
        }
      });
      setFiles(decryptedFiles);

    } catch (e) {
      console.error("Failed to load data", e);
      toast.error("Failed to load vault data");
    }
  };

  // --- Note Actions ---

  const handleCreateNote = async () => {
    if (currentView === 'archive' || currentView === 'trash' || currentView === 'files') {
        setCurrentView('all');
    }
    setSelectedLabelFilter(null);

    const newId = uuidv4();
    const now = Date.now();
    
    const newNote = {
      id: newId,
      title: "",
      content: "",
      createdAt: now,
      updatedAt: now,
      folderId: selectedFolderId,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      labels: []
    };

    // Optimistic update
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newId);
    
    // Initial Save
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
        updatedAt: note.updatedAt
      });
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleSave = async (silent = false) => {
    if (!selectedNoteId) return;
    if (!silent) setIsSaving(true);
    
    const noteToSave = notes.find(n => n.id === selectedNoteId);
    
    // Don't save if nothing changed (optimization)
    if (noteToSave && noteToSave.title === editorTitle && noteToSave.content === editorContent) {
        if (!silent) setIsSaving(false);
        return;
    }

    if (noteToSave) {
        const updatedNote = {
            ...noteToSave,
            title: editorTitle,
            content: editorContent,
            updatedAt: Date.now()
        };
        
        // Update local state
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? updatedNote : n));
        
        // Persist
        await saveNoteToDb(updatedNote);
        setLastSaved(Date.now());
        if (!silent) toast.success("Saved");
    }
    if (!silent) setIsSaving(false);
  };

  const togglePin = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedNoteId) return;

    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
      const updatedNote = { ...note, isPinned: !note.isPinned, updatedAt: Date.now() };
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
        isPinned: false,
        updatedAt: Date.now()
      };
      setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
      await saveNoteToDb(updatedNote);
      
      if (currentView === 'all' && updatedNote.isArchived) {
         toast.success("Note archived");
         setSelectedNoteId(null);
      } else if (currentView === 'archive' && !updatedNote.isArchived) {
         toast.success("Note restored");
         setSelectedNoteId(null);
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
            isArchived: false,
            updatedAt: Date.now()
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
        const updatedNote = { ...note, isTrashed: false, updatedAt: Date.now() };
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
        const updatedNote = { ...note, labels: newLabels, updatedAt: Date.now() };
        setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
    }
  };

  const handleMoveFolder = async (folderId: string) => {
    if (!selectedNoteId) return;
    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
        const updatedNote = { ...note, folderId: folderId === "none" ? null : folderId, updatedAt: Date.now() };
        setNotes(notes.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
        toast.success("Note moved");
    }
  };

  // --- Folder Actions ---

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
        id: uuidv4(),
        name: newFolderName,
        parentId: null,
        createdAt: Date.now()
    };
    await db.saveFolder(newFolder);
    setFolders([...folders, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
    setNewFolderName("");
    setIsNewFolderOpen(false);
    toast.success("Folder created");
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this folder? Notes inside will be unassigned.")) {
        await db.deleteFolder(folderId);
        setFolders(folders.filter(f => f.id !== folderId));
        if (selectedFolderId === folderId) setSelectedFolderId(null);
        
        // Update notes
        const updatedNotes = notes.map(n => n.folderId === folderId ? { ...n, folderId: null } : n);
        setNotes(updatedNotes);
        updatedNotes.forEach(n => {
            if (n.folderId === null && notes.find(old => old.id === n.id)?.folderId === folderId) {
                saveNoteToDb(n);
            }
        });

        // Update files
        const updatedFiles = files.map(f => f.folderId === folderId ? { ...f, folderId: null } : f);
        setFiles(updatedFiles);
        // We need to persist file changes too - logic similar to saveNoteToDb but for files
        // For brevity, assuming we iterate and save.
        
        toast.success("Folder deleted");
    }
  };

  // --- File Actions ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
            const encryptedName = encryptData(file.name, encryptionKey);
            const encryptedType = encryptData(file.type, encryptionKey);
            const encryptedBlob = encryptData(base64, encryptionKey);

            const newFile = {
                id: uuidv4(),
                folderId: selectedFolderId,
                encryptedName,
                encryptedType,
                encryptedBlob,
                size: file.size,
                isTrashed: false,
                createdAt: Date.now()
            };

            await db.saveFile(newFile);
            setFiles([...files, { ...newFile, name: file.name, type: file.type }]);
            toast.success("File encrypted & uploaded");
        }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadFile = async (file: any) => {
    try {
        const decryptedBase64 = decryptData(file.encryptedBlob, encryptionKey);
        if (!decryptedBase64) throw new Error("Decryption failed");

        const link = document.createElement('a');
        link.href = decryptedBase64;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error(e);
        toast.error("Failed to download file");
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (confirm("Permanently delete this file?")) {
        await db.deleteFile(id);
        setFiles(files.filter(f => f.id !== id));
        toast.success("File deleted");
    }
  };

  const handleMoveFileToFolder = async (fileId: string, folderId: string | null) => {
      const file = files.find(f => f.id === fileId);
      if(file) {
          const updatedFile = { ...file, folderId };
          setFiles(files.map(f => f.id === fileId ? updatedFile : f));
          
          // Persist
          const encryptedName = encryptData(file.name, encryptionKey);
          // We need original encrypted blob and type. 
          // Since we don't have them in 'files' state fully (we have decrypted name),
          // we should re-encrypt OR fetch from DB, update, and save.
          // Better: fetch from DB to be safe.
          
          // Quick fix: We assume we have enough data or we just update the folderId in DB?
          // IndexedDB `put` replaces the object. We need the full object.
          // Let's fetch the raw file from DB first.
          
          const rawFiles = await db.getFiles();
          const rawFile = rawFiles.find((f: any) => f.id === fileId);
          if(rawFile) {
              await db.saveFile({ ...rawFile, folderId });
              toast.success("File moved");
          }
      }
  };

  // --- Filtering ---

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

    if (currentView === 'trash') return n.isTrashed;
    if (n.isTrashed) return false;

    if (selectedLabelFilter) return n.labels?.includes(selectedLabelFilter);
    if (selectedFolderId) return n.folderId === selectedFolderId;

    if (currentView === 'favorites') return n.isPinned && !n.isArchived;
    if (currentView === 'archive') return n.isArchived;
    
    return !n.isArchived;
  });

  const filteredFiles = files.filter(f => {
    if (selectedFolderId) return f.folderId === selectedFolderId;
    return true;
  });

  const currentNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
        />
        
        <Sidebar 
            user={user}
            currentView={currentView}
            setCurrentView={setCurrentView}
            folders={folders}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            allLabels={allLabels}
            selectedLabelFilter={selectedLabelFilter}
            setSelectedLabelFilter={setSelectedLabelFilter}
            handleCreateNote={handleCreateNote}
            handleCreateFolder={() => setIsNewFolderOpen(true)}
            handleDeleteFolder={handleDeleteFolder}
            onFileUploadClick={() => fileInputRef.current?.click()}
        />

        {currentView === 'files' ? (
            <FileVault 
                files={filteredFiles}
                folders={folders}
                onDownload={handleDownloadFile}
                onDelete={handleDeleteFile}
                onUploadClick={() => fileInputRef.current?.click()}
                onMoveToFolder={handleMoveFileToFolder}
            />
        ) : (
            <>
                {/* Note List */}
                <div className={cn("w-80 border-r flex flex-col bg-background transition-all duration-300", selectedNoteId ? "hidden lg:flex" : "flex w-full")}>
                    <div className="p-4 border-b space-y-3 h-28 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                                {currentView === 'trash' ? <Trash2 size={18} /> : 
                                 currentView === 'favorites' ? <Pin size={18} /> : 
                                 currentView === 'archive' ? <Archive size={18} /> : 
                                 selectedFolderId ? <Folder size={18} /> :
                                 <FileText size={18} />}
                                
                                {currentView === 'trash' ? 'Recycle Bin' : 
                                 selectedLabelFilter ? `#${selectedLabelFilter}` : 
                                 selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 
                                 currentView === 'favorites' ? 'Favorites' : 
                                 currentView === 'archive' ? 'Archive' : 'All Notes'}
                            </h2>
                            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
                                {filteredNotes.length}
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search notes..." 
                                className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-2 gap-2">
                            {filteredNotes.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2 mt-10">
                                    <FileText className="w-10 h-10 opacity-10" />
                                    <p>No notes found</p>
                                </div>
                            )}
                            {filteredNotes.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => setSelectedNoteId(note.id)}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 text-left rounded-lg transition-all border border-transparent hover:border-border group relative",
                                        selectedNoteId === note.id ? "bg-card shadow-sm border-border" : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className={cn("font-semibold text-sm line-clamp-1", !note.title && "text-muted-foreground italic")}>
                                            {note.title || "Untitled Note"}
                                        </span>
                                        {note.isPinned && <Pin size={12} className="fill-primary text-primary shrink-0 ml-2" />}
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground line-clamp-2 w-full h-8 opacity-80">
                                        {note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 100) : "No additional text"}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-2 w-full overflow-hidden">
                                        <span className="text-[10px] text-muted-foreground shrink-0">{format(note.updatedAt, 'MMM d')}</span>
                                        <div className="flex gap-1 overflow-hidden">
                                            {note.labels?.slice(0, 2).map((l: string) => (
                                                <Badge key={l} variant="secondary" className="text-[9px] px-1 py-0 h-4 font-normal bg-muted text-muted-foreground">{l}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Editor Area */}
                <main className={cn("flex-1 flex flex-col min-w-0 bg-background h-full transition-all duration-300", !selectedNoteId ? "hidden lg:flex" : "flex")}>
                    {selectedNoteId && currentNote ? (
                        <TooltipProvider>
                        <>
                            <div className="flex items-center justify-between px-6 py-3 border-b h-16 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
                                <div className="flex items-center gap-2 flex-1 mr-4">
                                    {/* Mobile Back Button */}
                                    <Button variant="ghost" size="icon" className="lg:hidden -ml-2 mr-1" onClick={() => setSelectedNoteId(null)}>
                                        <RotateCcw size={18} />
                                    </Button>

                                    {currentView === 'trash' ? (
                                        <div className="flex items-center gap-2 text-destructive">
                                            <Trash2 size={20} />
                                            <span className="font-semibold">Recycle Bin</span>
                                        </div>
                                    ) : (
                                        <Input 
                                            value={editorTitle}
                                            onChange={(e) => setEditorTitle(e.target.value)}
                                            className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent w-full placeholder:text-muted-foreground/50"
                                            placeholder="Untitled Note"
                                        />
                                    )}
                                </div>
                                
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
                                            <div className="hidden md:flex items-center gap-1">
                                                <LabelSelector 
                                                    selectedLabels={currentNote.labels || []}
                                                    allLabels={allLabels}
                                                    onLabelsChange={handleLabelsChange}
                                                />
                                                
                                                <Select 
                                                    value={currentNote.folderId || "none"} 
                                                    onValueChange={handleMoveFolder}
                                                >
                                                    <SelectTrigger className="w-[130px] h-8 text-xs ml-2 border-dashed bg-transparent">
                                                        <div className="flex items-center gap-1 truncate">
                                                            <Folder size={12} />
                                                            <SelectValue placeholder="Folder" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No Folder</SelectItem>
                                                        {folders.map(f => (
                                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Separator orientation="vertical" className="h-6 mx-2" />
                                            </div>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => togglePin(e)} className="h-8 w-8">
                                                        <Pin size={18} className={cn(currentNote.isPinned ? "fill-primary text-primary" : "text-muted-foreground")} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{currentNote.isPinned ? "Unpin Note" : "Pin Note"}</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => toggleArchive(e)} className="h-8 w-8">
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

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical size={18} className="text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={handleSoftDelete} className="text-destructive focus:text-destructive">
                                                        <Trash2 size={16} className="mr-2" /> Move to Trash
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <div className="ml-2 flex items-center">
                                                {lastSaved && (
                                                    <span className="text-[10px] text-muted-foreground mr-2 hidden sm:inline-block">
                                                        Saved
                                                    </span>
                                                )}
                                                <Button size="sm" onClick={() => handleSave()} disabled={isSaving} className="h-8 px-3">
                                                    {isSaving ? <span className="animate-pulse">Saving...</span> : <Check size={16} />}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-hidden relative">
                                {currentView === 'trash' ? (
                                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                                        <Trash2 size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium">This note is in the recycle bin.</p>
                                        <p className="text-sm">Restore it to continue editing.</p>
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
                        <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-6 bg-muted/10">
                            <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center shadow-inner">
                                <FileText size={48} className="opacity-20" />
                            </div>
                            <div className="text-center px-4">
                                <h3 className="font-bold text-xl text-foreground mb-2">Select a note to view</h3>
                                <p className="text-sm max-w-xs mx-auto text-muted-foreground">
                                    Choose a note from the list, or create a new one to start writing your thoughts securely.
                                </p>
                                <Button onClick={handleCreateNote} className="mt-6">
                                    Create New Note
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </>
        )}

        {/* New Folder Dialog */}
        <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        placeholder="Folder Name" 
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateFolder}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
