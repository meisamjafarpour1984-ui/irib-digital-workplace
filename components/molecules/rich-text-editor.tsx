'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import type { UseEditorOptions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  CodeSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Underline as UnderlineIcon,
  Maximize2,
  Minimize2,
  FileText,
  Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg text-sm transition-all duration-200',
        'hover:scale-105 active:scale-95',
        active
          ? 'bg-brand text-brand-foreground shadow-md shadow-brand/20'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-2 h-6 w-px bg-border" />
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder,
  editable = true,
  className,
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const t = useTranslations('richTextEditor')

  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({ placeholder: placeholder ?? t('placeholder') }),
    Image.configure({
      inline: true,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg my-4',
      },
    }),
    Underline,
  ] as unknown as UseEditorOptions['extensions']

  const editor = useEditor({
    extensions,
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)

      // Update word and character count
      const text = editor.getText()
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length)
      setCharCount(text.length)
    },
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt(t('prompt.linkUrl'))
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt(t('prompt.imageUrl'))
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().run()
    editor.chain().focus().setParagraph().run()
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-input bg-background shadow-sm transition-all duration-300',
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col rounded-3xl shadow-2xl' : '',
        className
      )}
    >
      {editable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-3 backdrop-blur-sm">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title={t('toolbar.bold')}
            >
              <Bold className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title={t('toolbar.italic')}
            >
              <Italic className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title={t('toolbar.underline')}
            >
              <UnderlineIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title={t('toolbar.strike')}
            >
              <Strikethrough className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title={t('toolbar.code')}
            >
              <Code className="size-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title={t('toolbar.heading1')}
            >
              <Heading1 className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title={t('toolbar.heading2')}
            >
              <Heading2 className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title={t('toolbar.heading3')}
            >
              <Heading3 className="size-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title={t('toolbar.bulletList')}
            >
              <List className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title={t('toolbar.orderedList')}
            >
              <ListOrdered className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title={t('toolbar.blockquote')}
            >
              <Quote className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title={t('toolbar.codeBlock')}
            >
              <CodeSquare className="size-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Insert */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={addLink}
              active={editor.isActive('link')}
              title={t('toolbar.link')}
            >
              <LinkIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title={t('toolbar.image')}>
              <ImageIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title={t('toolbar.horizontalRule')}
            >
              <Minus className="size-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* History */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title={t('toolbar.undo')}
            >
              <Undo className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title={t('toolbar.redo')}
            >
              <Redo className="size-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={clearFormatting} title={t('toolbar.clearFormatting')}>
              <Type className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleFullscreen}
              title={isFullscreen ? t('toolbar.exitFullscreen') : t('toolbar.fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </ToolbarButton>
          </div>

          {/* Stats */}
          <div className="mr-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="size-3" />
              {wordCount} {t('words')}
            </span>
            <span>
              {charCount} {t('characters')}
            </span>
          </div>
        </div>
      )}

      <div
        className={cn('relative flex-1 overflow-auto', isFullscreen ? 'flex-1' : 'min-h-[400px]')}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-6 prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-a:text-brand prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-img:rounded-lg prose-img:shadow-lg prose-blockquote:border-r-4 prose-blockquote:border-brand prose-blockquote:bg-muted/30 prose-blockquote:pr-4 prose-hr:border-border"
        />
      </div>
    </div>
  )
}
