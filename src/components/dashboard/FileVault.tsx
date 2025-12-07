import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { File as FileIcon, Download, Trash2, Upload, FolderInput } from 'lucide-react';
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

export default function FileVault({ files, folders, onDownload, onDelete, onUploadClick, onMoveToFolder }: FileVaultProps) {
    return (
        <main className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
            <div className="p-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                            <FileIcon className="text-primary" /> File Vault
                        </h2>
                        <p className="text-muted-foreground mt-1">Encrypted storage. Decrypts on download.</p>
                    </div>
                    <Button onClick={onUploadClick} className="shadow-lg shadow-primary/20">
                        <Upload size={16} className="mr-2" /> Upload File
                    </Button>
                </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {files.map(file => (
                        <div key={file.id} className="group border rounded-xl p-4 bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[140px] relative">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                                        <FileIcon size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate text-sm" title={file.name}>{file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                                            <span className="sr-only">Open menu</span>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
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
                            
                            <div className="flex items-end justify-between mt-auto pt-4">
                                <div className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                    {format(file.createdAt, 'MMM d, yyyy')}
                                </div>
                                {file.folderId && (
                                    <div className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded-full truncate max-w-[100px]">
                                        {folders.find(f => f.id === file.folderId)?.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {files.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                            <Upload className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">No files in this view</p>
                            <Button variant="link" onClick={onUploadClick}>Upload a file</Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </main>
    );
}
