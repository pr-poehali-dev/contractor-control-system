import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  variables?: string[];
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = 'Начните писать документ...',
  variables = [],
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[600px] p-8 text-base leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const insertVariable = (variable: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="border-b bg-gradient-to-r from-slate-50 to-white px-4 py-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 border-r pr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('bold') && 'bg-blue-100 text-blue-700'
            )}
            title="Жирный (Ctrl+B)"
          >
            <Icon name="Bold" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('italic') && 'bg-blue-100 text-blue-700'
            )}
            title="Курсив (Ctrl+I)"
          >
            <Icon name="Italic" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('strike') && 'bg-blue-100 text-blue-700'
            )}
            title="Зачеркнутый"
          >
            <Icon name="Strikethrough" size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r pr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('heading', { level: 1 }) && 'bg-blue-100 text-blue-700'
            )}
            title="Заголовок 1"
          >
            <Icon name="Heading1" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('heading', { level: 2 }) && 'bg-blue-100 text-blue-700'
            )}
            title="Заголовок 2"
          >
            <Icon name="Heading2" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('paragraph') && 'bg-blue-100 text-blue-700'
            )}
            title="Обычный текст"
          >
            <Icon name="Type" size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r pr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('bulletList') && 'bg-blue-100 text-blue-700'
            )}
            title="Маркированный список"
          >
            <Icon name="List" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'h-9 w-9 p-0',
              editor.isActive('orderedList') && 'bg-blue-100 text-blue-700'
            )}
            title="Нумерованный список"
          >
            <Icon name="ListOrdered" size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-9 w-9 p-0"
            title="Отменить (Ctrl+Z)"
          >
            <Icon name="Undo" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-9 w-9 p-0"
            title="Вернуть (Ctrl+Shift+Z)"
          >
            <Icon name="Redo" size={18} />
          </Button>
        </div>
        
        {variables.length > 0 && (
          <>
            <div className="w-px h-6 bg-slate-300 mx-2" />
            <div className="flex gap-1.5 flex-wrap">
              {variables.map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable)}
                  className="h-9 text-xs font-mono bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-700"
                  title={`Вставить переменную {{${variable}}}`}
                >
                  <Icon name="Braces" size={14} className="mr-1.5" />
                  {variable}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}