'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { History } from '@tiptap/extension-history'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import Toolbar from './Toolbar'

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  className?: string
}

export default function TiptapEditor({ 
  content = '', 
  onChange,
  className = '' 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable default history to use custom configuration
      } as any),
      History.configure({
        depth: 100, // History depth of at least 100 actions
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={`tiptap-editor ${className}`}>
      <Toolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[400px]"
      />
    </div>
  )
}