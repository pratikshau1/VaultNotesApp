import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { File as FileIcon, Download, Trash2, Upload, FolderInput, Image as ImageIcon, FileText, Music, Video } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface FileVaultProps {
    files: any[];
    folders: any[];
    onDownload: (file: any) => void;
    onDelete: (id: string) => void;
    onUploadClick: () => void;
    onMoveToFolder: (fileId: string, folderId: string | null) => void;
}

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf')) return FileText;
    return FileIcon;
}

export default function FileVault({ files, folders, onDownload, onDelete, onUploadClick, onMoveToFolder }: FileVaultProps) {
    return (
        <main className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
            <div className="p-8 border-b bg-background sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">File Vault</h2>
                    <p className="text-muted-foreground mt-1">Encrypted storage for your assets.</p>
                </div>
                <Button onClick={onUploadClick} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                    <Upload size={18} className="mr-2" /> Upload Asset
                </Button>
            </div>
            
            <ScrollArea className="flex-1 p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {files.map(file => {
                        const Icon = getFileIcon(file.type);
                        return (
                            <div key={file.id} className="group border rounded-2xl p-5 bg-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[180px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm">
                                                <span className="sr-only">Open menu</span>
                                                <div className="flex gap-0.5">
                                                    <div className="w-1 h-1 bg-foreground rounded-full" />
                                                    <div className="w-1 h-1 bg-foreground rounded-full" />
                                                    <div className="w-1 h-1 bg-foreground rounded-full" />
                                                </div>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onDownload(file)}>
                                                <Download size={14} className="mr-2" /> Download
                                            </DropdownMenuItem>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <FolderInput size={14} className="mr-2" /> Move to
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => onMoveToFolder(file.id, null)}>
                                                        No Folder
                                                    </DropdownMenuItem>
                                                    {folders.map(f => (
                                                        <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(file.id, f.id)}>
                                                            {f.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 size={14} className="mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                        <Icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="w-full px-2">
                                        <p className="font-semibold truncate text-sm text-foreground" title={file.name}>{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed">
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        {format(file.createdAt, 'MMM d, yyyy')}
                                    </span>
                                    {file.folderId && (
                                        <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                                            {folders.find(f => f.id === file.folderId)?.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {files.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl bg-secondary/20">
                            <Upload className="w-16 h-16 mb-6 opacity-10" />
                            <p className="font-medium text-lg">Vault is Empty</p>
                            <p className="text-sm opacity-60 mb-6">Upload documents, images, or assets securely.</p>
                            <Button variant="outline" onClick={onUploadClick} className="rounded-full">Upload File</Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </main>
    );
}
