'use client'

import React, { useState } from 'react'
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
import TableContextMenu from './TableContextMenu'

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
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean
    position: { x: number; y: number }
  }>({
    isVisible: false,
    position: { x: 0, y: 0 }
  })
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

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if the user right-clicked on a table
    const { selection } = editor.state
    const { $from } = selection
    
    // Check if cursor is inside a table
    const isInTable = editor.isActive('table')
    
    if (isInTable) {
      setContextMenu({
        isVisible: true,
        position: { x: e.pageX, y: e.pageY }
      })
    }
  }

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false }))
  }

  const handleShowTableMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    
    // Position context menu relative to the toolbar button
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setContextMenu({
      isVisible: true,
      position: { 
        x: rect.left,
        y: rect.bottom + 5 // 5px below the button
      }
    })
  }

  if (!editor) {
    return null
  }

  return (
    <div className={`tiptap-editor ${className}`}>
      <Toolbar 
        editor={editor} 
        onShowTableMenu={handleShowTableMenu}
      />
      <div onContextMenu={handleRightClick}>
        <EditorContent 
          editor={editor} 
          className="p-4 min-h-[400px]"
        />
      </div>
      
      <TableContextMenu
        editor={editor}
        position={contextMenu.position}
        isVisible={contextMenu.isVisible}
        onClose={handleCloseContextMenu}
      />
    </div>
  )
}