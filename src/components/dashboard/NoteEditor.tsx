import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export default function NoteEditor({ content, onChange, readOnly = false }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Image,
    ],
    content: content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background flex flex-col">
        {!readOnly && (
            <div className="sticky top-0 z-10 flex items-center gap-1 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-wrap">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={cn("p-2 rounded hover:bg-muted text-sm font-bold w-8 h-8 flex items-center justify-center", editor.isActive('bold') ? 'bg-muted text-primary' : '')}
                >
                    B
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={cn("p-2 rounded hover:bg-muted text-sm italic w-8 h-8 flex items-center justify-center", editor.isActive('italic') ? 'bg-muted text-primary' : '')}
                >
                    I
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={cn("p-2 rounded hover:bg-muted text-sm line-through w-8 h-8 flex items-center justify-center", editor.isActive('strike') ? 'bg-muted text-primary' : '')}
                >
                    S
                </button>
                <div className="w-px h-6 bg-border mx-2" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn("p-2 rounded hover:bg-muted text-sm font-bold", editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : '')}
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn("p-2 rounded hover:bg-muted text-sm font-bold", editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : '')}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("p-2 rounded hover:bg-muted text-sm", editor.isActive('bulletList') ? 'bg-muted text-primary' : '')}
                >
                    List
                </button>
                <div className="w-px h-6 bg-border mx-2" />
                <button
                    onClick={addImage}
                    className="p-2 rounded hover:bg-muted text-sm flex items-center gap-1"
                >
                    <ImageIcon size={16} />
                </button>
            </div>
        )}
      <EditorContent editor={editor} className="flex-1 p-4" />
    </div>
  );
}
