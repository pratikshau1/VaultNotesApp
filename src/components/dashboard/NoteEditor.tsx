import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

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

  // Update editor content if the prop changes externally (e.g. switching notes)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
        {/* Simple Toolbar */}
        {!readOnly && (
            <div className="sticky top-0 z-10 flex items-center gap-1 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={cn("p-2 rounded hover:bg-muted", editor.isActive('bold') ? 'bg-muted text-primary' : '')}
                >
                    B
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={cn("p-2 rounded hover:bg-muted", editor.isActive('italic') ? 'bg-muted text-primary' : '')}
                >
                    I
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={cn("p-2 rounded hover:bg-muted", editor.isActive('strike') ? 'bg-muted text-primary' : '')}
                >
                    S
                </button>
                <div className="w-px h-6 bg-border mx-2" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn("p-2 rounded hover:bg-muted", editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : '')}
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn("p-2 rounded hover:bg-muted", editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : '')}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("p-2 rounded hover:bg-muted", editor.isActive('bulletList') ? 'bg-muted text-primary' : '')}
                >
                    • List
                </button>
            </div>
        )}
      <EditorContent editor={editor} className="p-4" />
    </div>
  );
}
