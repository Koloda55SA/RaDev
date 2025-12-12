'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlock from '@tiptap/extension-code-block'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2
} from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Начните писать...',
  editable = true 
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Используем кастомный CodeBlock
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-secondary p-4 rounded-md font-mono text-sm',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
      toast.success('Ссылка добавлена')
    }
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageDialog(false)
      toast.success('Изображение добавлено')
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-secondary/50">
          {/* Text Formatting */}
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Жирный"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Курсив"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Зачеркнутый"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Код"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Заголовок 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Заголовок 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Заголовок 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Маркированный список"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Нумерованный список"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Цитата"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Блок кода"
          >
            <Code2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Media */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLinkDialog(true)}
            title="Добавить ссылку"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowImageDialog(true)}
            title="Добавить изображение"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Отменить"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Повторить"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[300px] max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="border-t border-border p-4 bg-secondary/50">
          <div className="space-y-2">
            <Label>URL ссылки</Label>
            <div className="flex gap-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addLink()
                  }
                }}
              />
              <Button onClick={addLink}>Добавить</Button>
              <Button variant="outline" onClick={() => {
                setShowLinkDialog(false)
                setLinkUrl('')
              }}>Отмена</Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="border-t border-border p-4 bg-secondary/50">
          <div className="space-y-2">
            <Label>URL изображения</Label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addImage()
                  }
                }}
              />
              <Button onClick={addImage}>Добавить</Button>
              <Button variant="outline" onClick={() => {
                setShowImageDialog(false)
                setImageUrl('')
              }}>Отмена</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







