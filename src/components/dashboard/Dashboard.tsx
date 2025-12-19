import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { encryptData, decryptData } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Trash2,
  Pin,
  Archive,
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
import { motion, AnimatePresence } from 'framer-motion';

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
        if (note.title !== editorTitle) setEditorTitle(note.title);
        setEditorContent(note.content);
      }
    } else {
      setEditorTitle("");
      setEditorContent("");
    }
  }, [selectedNoteId]); 

  // Auto-save Logic
  useEffect(() => {
    if (!selectedNoteId || currentView === 'trash') return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

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

  // --- Note Actions (Same as before) ---
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
        
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? updatedNote : n));
        await saveNoteToDb(updatedNote);
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
        
        const updatedNotes = notes.map(n => n.folderId === folderId ? { ...n, folderId: null } : n);
        setNotes(updatedNotes);
        updatedNotes.forEach(n => {
            if (n.folderId === null && notes.find(old => old.id === n.id)?.folderId === folderId) {
                saveNoteToDb(n);
            }
        });
        
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
      const updatedFile = { ...files.find(f => f.id === fileId), folderId };
      setFiles(files.map(f => f.id === fileId ? updatedFile : f));
      
      const rawFiles = await db.getFiles();
      const rawFile = rawFiles.find((f: any) => f.id === fileId);
      if(rawFile) {
          await db.saveFile({ ...rawFile, folderId });
          toast.success("File moved");
      } else {
          toast.error("Error moving file");
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
    <div className="flex h-screen bg-background overflow-hidden font-sans">
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
                {/* Note List - Redesigned as a "Project List" */}
                <div className={cn(
                    "w-[350px] border-r flex flex-col bg-background/50 backdrop-blur-sm transition-all duration-300", 
                    selectedNoteId ? "hidden lg:flex" : "flex w-full"
                )}>
                    {/* Header */}
                    <div className="p-6 pb-2 border-b border-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2">
                                {currentView === 'trash' ? "Recycle Bin" : 
                                 selectedLabelFilter ? `#${selectedLabelFilter}` : 
                                 selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 
                                 currentView === 'favorites' ? "Favorites" : 
                                 currentView === 'archive' ? "Archive" : "All Notes"}
                            </h2>
                            <Badge variant="outline" className="rounded-full px-2.5 font-normal text-muted-foreground">
                                {filteredNotes.length}
                            </Badge>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search..." 
                                className="pl-9 h-10 bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all rounded-lg" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-3 gap-2">
                            <AnimatePresence>
                            {filteredNotes.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-3 mt-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                        <FileText className="w-5 h-5 opacity-20" />
                                    </div>
                                    <p>No entries found</p>
                                </motion.div>
                            )}
                            {filteredNotes.map(note => (
                                <motion.button
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedNoteId(note.id)}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-4 text-left rounded-xl transition-all duration-200 border group relative",
                                        selectedNoteId === note.id 
                                            ? "bg-card shadow-md border-border/50 ring-1 ring-black/5 dark:ring-white/5" 
                                            : "border-transparent hover:bg-card/60 hover:shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full mb-1">
                                        <span className={cn(
                                            "font-semibold text-base line-clamp-1 tracking-tight", 
                                            !note.title && "text-muted-foreground italic",
                                            selectedNoteId === note.id ? "text-primary" : "text-foreground"
                                        )}>
                                            {note.title || "Untitled Note"}
                                        </span>
                                        {note.isPinned && <Pin size={12} className="fill-primary text-primary shrink-0 ml-2" />}
                                    </div>
                                    
                                    <div className="text-sm text-muted-foreground line-clamp-2 w-full h-10 leading-relaxed opacity-80 mb-2">
                                        {note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 120) : "No additional text"}
                                    </div>
                                    
                                    <div className="flex items-center justify-between w-full mt-1">
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                            <span>{format(note.updatedAt, 'MMM d')}</span>
                                            {note.folderId && (
                                                <>
                                                    <span>•</span>
                                                    <span className="max-w-[80px] truncate">
                                                        {folders.find(f => f.id === note.folderId)?.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {note.labels?.slice(0, 2).map((l: string) => (
                                                <div key={l} className="w-2 h-2 rounded-full bg-primary/20" title={l} />
                                            ))}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </div>

                {/* Editor Area - Clean & Expansive */}
                <main className={cn(
                    "flex-1 flex flex-col min-w-0 bg-background h-full transition-all duration-300 relative", 
                    !selectedNoteId ? "hidden lg:flex" : "flex"
                )}>
                    {selectedNoteId && currentNote ? (
                        <TooltipProvider>
                        <>
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-8 py-4 h-20 bg-background/95 backdrop-blur z-20 sticky top-0">
                                <div className="flex items-center gap-4 flex-1 mr-4">
                                    <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setSelectedNoteId(null)}>
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
                                            className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent w-full placeholder:text-muted-foreground/30 tracking-tight text-primary"
                                            placeholder="Untitled"
                                        />
                                    )}
                                </div>
                                
                                {/* Actions Toolbar */}
                                <div className="flex items-center gap-2 bg-card/50 p-1 rounded-full border shadow-sm">
                                    {currentView === 'trash' ? (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={handleRestore} className="rounded-full">Restore</Button>
                                            <Button variant="destructive" size="sm" onClick={handlePermanentDelete} className="rounded-full">Delete</Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="hidden md:flex items-center gap-1 px-2">
                                                <LabelSelector 
                                                    selectedLabels={currentNote.labels || []}
                                                    allLabels={allLabels}
                                                    onLabelsChange={handleLabelsChange}
                                                />
                                                
                                                <Select 
                                                    value={currentNote.folderId || "none"} 
                                                    onValueChange={handleMoveFolder}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 text-xs ml-1 border-none bg-transparent hover:bg-secondary rounded-full">
                                                        <div className="flex items-center gap-1 truncate text-muted-foreground">
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
                                            </div>

                                            <Separator orientation="vertical" className="h-4" />

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => togglePin(e)} className="h-8 w-8 rounded-full">
                                                        <Pin size={16} className={cn(currentNote.isPinned ? "fill-primary text-primary" : "text-muted-foreground")} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Pin Note</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => toggleArchive(e)} className="h-8 w-8 rounded-full">
                                                        <Archive size={16} className={cn(currentNote.isArchived ? "text-primary" : "text-muted-foreground")} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Archive</TooltipContent>
                                            </Tooltip>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <MoreVertical size={16} className="text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={handleSoftDelete} className="text-destructive focus:text-destructive">
                                                        <Trash2 size={16} className="mr-2" /> Move to Trash
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button 
                                                size="icon" 
                                                variant="default"
                                                onClick={() => handleSave()} 
                                                disabled={isSaving} 
                                                className="h-8 w-8 rounded-full ml-1"
                                            >
                                                {isSaving ? <span className="w-2 h-2 bg-background rounded-full animate-pulse" /> : <Check size={14} />}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-hidden relative max-w-4xl mx-auto w-full">
                                {currentView === 'trash' ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                        <Trash2 size={64} className="mb-4" />
                                        <p>Note is in Recycle Bin</p>
                                    </div>
                                ) : (
                                    <NoteEditor 
                                        key={selectedNoteId} 
                                        content={editorContent} 
                                        onChange={setEditorContent} 
                                    />
                                )}
                            </div>
                        </>
                        </TooltipProvider>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-background">
                            <div className="text-center p-8 max-w-md">
                                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <FileText size={32} className="text-muted-foreground/50" />
                                </div>
                                <h3 className="font-bold text-2xl text-primary mb-2 tracking-tight">Select a Note</h3>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    Select an entry from the sidebar to view details, or create a new note to capture your ideas.
                                </p>
                                <Button onClick={handleCreateNote} size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                                    Create New Entry
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
                    <DialogTitle>New Folder</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        placeholder="Folder Name" 
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        className="bg-secondary/50"
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateFolder}>Create Folder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
