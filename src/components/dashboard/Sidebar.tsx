import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Menu,
  ChevronRight,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

    const NavItem = ({ 
        icon: Icon, 
        label, 
        active, 
        onClick, 
        count 
    }: { 
        icon: any, 
        label: string, 
        active: boolean, 
        onClick: () => void,
        count?: number 
    }) => (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={cn("transition-colors", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{label}</span>
            </div>
            {count !== undefined && (
                <span className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-md font-serif font-bold text-lg">
                        V
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none tracking-tight">VaultNotes</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Premium Workspace</p>
                    </div>
                </div>
                
                <Button onClick={handleCreateNote} className="w-full justify-center gap-2 shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground h-10 rounded-md">
                    <Plus size={16} /> New Entry
                </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="space-y-1 mb-8">
                    <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Library</p>
                    <NavItem 
                        icon={Inbox} 
                        label="All Notes" 
                        active={currentView === 'all' && !selectedLabelFilter && !selectedFolderId} 
                        onClick={() => setView('all')} 
                    />
                    <NavItem 
                        icon={Star} 
                        label="Favorites" 
                        active={currentView === 'favorites'} 
                        onClick={() => setView('favorites')} 
                    />
                    <NavItem 
                        icon={FileIcon} 
                        label="File Vault" 
                        active={currentView === 'files'} 
                        onClick={() => setView('files')} 
                    />
                </div>

                <div className="space-y-1 mb-8">
                    <div className="flex items-center justify-between px-3 mb-2 group">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projects</p>
                        <button onClick={handleCreateFolder} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                            <Plus size={12} />
                        </button>
                    </div>
                    {folders.map(folder => (
                        <div key={folder.id} className="group relative">
                            <NavItem 
                                icon={Folder} 
                                label={folder.name} 
                                active={selectedFolderId === folder.id} 
                                onClick={() => { setSelectedFolderId(folder.id); setCurrentView('all'); setSelectedLabelFilter(null); }} 
                            />
                             <button 
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                                onClick={(e) => handleDeleteFolder(folder.id, e)}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {folders.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground/50 italic">No folders created</div>
                    )}
                </div>

                {allLabels.length > 0 && (
                    <div className="space-y-1 mb-8">
                        <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1 px-3">
                            {allLabels.map(label => (
                                <button
                                    key={label}
                                    onClick={() => { setSelectedLabelFilter(label); setCurrentView('all'); setSelectedFolderId(null); }}
                                    className={cn(
                                        "text-xs px-2 py-1 rounded-full border transition-colors",
                                        selectedLabelFilter === label 
                                            ? "bg-primary text-primary-foreground border-primary" 
                                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                    )}
                                >
                                    #{label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="space-y-1">
                     <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">System</p>
                     <NavItem 
                        icon={Archive} 
                        label="Archive" 
                        active={currentView === 'archive'} 
                        onClick={() => setView('archive')} 
                    />
                    <NavItem 
                        icon={Trash2} 
                        label="Recycle Bin" 
                        active={currentView === 'trash'} 
                        onClick={() => setView('trash')} 
                    />
                </div>
            </ScrollArea>

            {/* User Profile Footer */}
            <div className="p-4 border-t bg-background/50">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {user?.username.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">{user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={logout}>
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar(props: SidebarProps) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn("hidden md:flex w-[280px] border-r flex-col bg-card h-screen sticky top-0", props.className)}>
                <SidebarContent {...props} />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50 bg-background/80 backdrop-blur border shadow-sm">
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <SidebarContent {...props} />
                </SheetContent>
            </Sheet>
        </>
    );
}
