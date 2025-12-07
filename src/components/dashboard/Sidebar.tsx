import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  LogOut, 
  Trash2, 
  Star,
  Inbox,
  Folder,
  File as FileIcon,
  Upload,
  Hash,
  Archive,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';

type ViewType = 'all' | 'favorites' | 'archive' | 'trash' | 'files';

interface SidebarProps {
  user: any;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  folders: any[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  allLabels: string[];
  selectedLabelFilter: string | null;
  setSelectedLabelFilter: (label: string | null) => void;
  handleCreateNote: () => void;
  handleCreateFolder: () => void;
  handleDeleteFolder: (id: string, e: React.MouseEvent) => void;
  onFileUploadClick: () => void;
  className?: string;
}

export function SidebarContent({
    user,
    currentView,
    setCurrentView,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    allLabels,
    selectedLabelFilter,
    setSelectedLabelFilter,
    handleCreateNote,
    handleCreateFolder,
    handleDeleteFolder,
    onFileUploadClick
}: SidebarProps) {
    const { logout } = useAuth();

    const setView = (view: ViewType) => {
        setCurrentView(view);
        setSelectedFolderId(null);
        setSelectedLabelFilter(null);
    };

    return (
        <div className="flex flex-col h-full bg-muted/10">
            <div className="p-4 border-b flex items-center justify-between h-16">
                <div className="font-bold text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-primary-foreground text-sm font-bold">V</span>
                    </div>
                    <span className="tracking-tight">VaultNotes</span>
                </div>
            </div>
            
            <div className="p-4 space-y-2">
                <Button onClick={handleCreateNote} className="w-full justify-start gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus size={16} /> New Note
                </Button>
                <Button onClick={onFileUploadClick} variant="outline" className="w-full justify-start gap-2 bg-background">
                    <Upload size={16} /> Upload File
                </Button>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 py-2">
                    <Button 
                        variant={currentView === 'all' && !selectedLabelFilter && !selectedFolderId ? "secondary" : "ghost"} 
                        className={cn("w-full justify-start gap-3 font-medium", currentView === 'all' && !selectedLabelFilter && !selectedFolderId && "bg-secondary")}
                        onClick={() => setView('all')}
                    >
                        <Inbox size={18} className="text-muted-foreground" /> All Notes
                    </Button>
                    <Button 
                        variant={currentView === 'files' ? "secondary" : "ghost"} 
                        className={cn("w-full justify-start gap-3 font-medium", currentView === 'files' && "bg-secondary")}
                        onClick={() => setView('files')}
                    >
                        <FileIcon size={18} className="text-muted-foreground" /> File Vault
                    </Button>
                    <Button 
                        variant={currentView === 'favorites' ? "secondary" : "ghost"} 
                        className={cn("w-full justify-start gap-3 font-medium", currentView === 'favorites' && "bg-secondary")}
                        onClick={() => setView('favorites')}
                    >
                        <Star size={18} className="text-muted-foreground" /> Favorites
                    </Button>
                    <Button 
                        variant={currentView === 'archive' ? "secondary" : "ghost"} 
                        className={cn("w-full justify-start gap-3 font-medium", currentView === 'archive' && "bg-secondary")}
                        onClick={() => setView('archive')}
                    >
                        <Archive size={18} className="text-muted-foreground" /> Archive
                    </Button>
                    <Button 
                        variant={currentView === 'trash' ? "secondary" : "ghost"} 
                        className={cn("w-full justify-start gap-3 font-medium", currentView === 'trash' && "bg-secondary")}
                        onClick={() => setView('trash')}
                    >
                        <Trash2 size={18} className="text-muted-foreground" /> Recycle Bin
                    </Button>
                </div>

                <Separator className="my-4 opacity-50" />

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</h3>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-muted" onClick={handleCreateFolder}>
                            <Plus size={12} />
                        </Button>
                    </div>
                    <div className="space-y-0.5">
                        {folders.map(folder => (
                            <div key={folder.id} className="group flex items-center relative">
                                <Button
                                    variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start gap-2 font-normal h-9 px-2", selectedFolderId === folder.id && "bg-secondary")}
                                    onClick={() => { setSelectedFolderId(folder.id); setCurrentView('all'); setSelectedLabelFilter(null); }}
                                >
                                    <Folder size={14} className={cn("text-muted-foreground", selectedFolderId === folder.id && "text-primary fill-primary/20")} /> 
                                    <span className="truncate">{folder.name}</span>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </div>
                        ))}
                        {folders.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1 italic">No folders yet</p>}
                    </div>
                </div>

                {allLabels.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">Labels</h3>
                        <div className="space-y-0.5">
                            {allLabels.map(label => (
                                <Button
                                    key={label}
                                    variant={selectedLabelFilter === label ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start gap-2 font-normal h-8 px-2", selectedLabelFilter === label && "bg-secondary")}
                                    onClick={() => { setSelectedLabelFilter(label); setCurrentView('all'); setSelectedFolderId(null); }}
                                >
                                    <Hash size={13} className="text-muted-foreground" /> {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t bg-background/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm">
                        {user?.username.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.username}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20" onClick={logout}>
                    <LogOut size={14} /> Lock Vault
                </Button>
            </div>
        </div>
    );
}

export default function Sidebar(props: SidebarProps) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn("hidden md:flex w-64 border-r flex-col bg-card", props.className)}>
                <SidebarContent {...props} />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden absolute top-3 left-4 z-50">
                        <Menu size={24} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent {...props} />
                </SheetContent>
            </Sheet>
        </>
    );
}
