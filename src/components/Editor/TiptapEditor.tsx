'use client'

import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import Toolbar from './Toolbar'
import TableContextMenu from './TableContextMenu'

interface ThemeStyles {
  h1?: string
  h2?: string
  h3?: string
  p?: string
  table?: string
  thead?: string
  th?: string
  td?: string
  blockquote?: string
  hr?: string
  container?: string
  prose?: string
}

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  className?: string
  themeStyles?: ThemeStyles
}

export default function TiptapEditor({ 
  content = '', 
  onChange,
  className = '',
  themeStyles
}: TiptapEditorProps) {
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean
    position: { x: number; y: number }
  }>({
    isVisible: false,
    position: { x: 0, y: 0 }
  })
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100, // History depth of at least 100 actions
        },
      } as any),
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

  // Convert Tailwind classes to CSS properties
  const tailwindToCSS = (classes: string = '') => {
    const classMap: Record<string, string> = {
      // Text sizes
      'text-xl': 'font-size: 1.25rem; line-height: 1.75rem;',
      'text-lg': 'font-size: 1.125rem; line-height: 1.75rem;',
      'text-base': 'font-size: 1rem; line-height: 1.5rem;',
      'text-sm': 'font-size: 0.875rem; line-height: 1.25rem;',
      'text-xs': 'font-size: 0.75rem; line-height: 1rem;',
      'text-2xl': 'font-size: 1.5rem; line-height: 2rem;',
      
      // Font weights
      'font-bold': 'font-weight: 700;',
      'font-semibold': 'font-weight: 600;',
      'font-medium': 'font-weight: 500;',
      'font-light': 'font-weight: 300;',
      'font-serif': 'font-family: ui-serif, Georgia, Cambria, serif;',
      'font-sans': 'font-family: ui-sans-serif, system-ui, sans-serif;',
      'font-mono': 'font-family: ui-monospace, SFMono-Regular, monospace;',
      
      // Text colors
      'text-gray-900': 'color: #111827;',
      'text-gray-800': 'color: #1f2937;',
      'text-gray-700': 'color: #374151;',
      'text-gray-600': 'color: #4b5563;',
      'text-gray-500': 'color: #6b7280;',
      'text-black': 'color: #000000;',
      'text-blue-600': 'color: #2563eb;',
      
      // Custom colors
      'text-[#1C1917]': 'color: #1C1917;',
      'text-[#B91C1C]': 'color: #B91C1C;',
      'text-[#44403C]': 'color: #44403C;',
      'text-[#292524]': 'color: #292524;',
      'text-[#7F1D1D]': 'color: #7F1D1D;',
      
      // Margins and padding
      'mb-6': 'margin-bottom: 1.5rem;',
      'mb-4': 'margin-bottom: 1rem;',
      'mb-8': 'margin-bottom: 2rem;',
      'mt-8': 'margin-top: 2rem;',
      'mt-6': 'margin-top: 1.5rem;',
      'mt-10': 'margin-top: 2.5rem;',
      'pl-4': 'padding-left: 1rem;',
      'pl-6': 'padding-left: 1.5rem;',
      'px-4': 'padding-left: 1rem; padding-right: 1rem;',
      'py-3': 'padding-top: 0.75rem; padding-bottom: 0.75rem;',
      'py-4': 'padding-top: 1rem; padding-bottom: 1rem;',
      
      // Text alignment and decoration
      'text-center': 'text-align: center;',
      'text-justify': 'text-align: justify;',
      'uppercase': 'text-transform: uppercase;',
      'italic': 'font-style: italic;',
      'underline': 'text-decoration: underline;',
      'tracking-tight': 'letter-spacing: -0.025em;',
      'tracking-wide': 'letter-spacing: 0.025em;',
      'tracking-widest': 'letter-spacing: 0.1em;',
      
      // Line height
      'leading-relaxed': 'line-height: 1.625;',
      'leading-loose': 'line-height: 2;',
      
      // Borders
      'border-l-4': 'border-left-width: 4px;',
      'border-b-2': 'border-bottom-width: 2px;',
      'border-b': 'border-bottom-width: 1px;',
      'border-blue-500': 'border-color: #3b82f6;',
      'border-black': 'border-color: #000000;',
      'border-gray-300': 'border-color: #d1d5db;',
      'border-[#E7E5E4]': 'border-color: #E7E5E4;',
      'border-[#B91C1C]': 'border-color: #B91C1C;',
      
      // Background colors
      'bg-gray-50': 'background-color: #f9fafb;',
      'bg-gray-100': 'background-color: #f3f4f6;',
      'bg-blue-50': 'background-color: #eff6ff;'
    }
    
    return classes.split(' ')
      .map(cls => classMap[cls] || '')
      .filter(css => css)
      .join(' ')
  }

  // Generate dynamic styles based on theme
  const themeCSS = themeStyles ? `
    .tiptap-editor .ProseMirror h1 {
      ${themeStyles.h1 ? tailwindToCSS(themeStyles.h1) : ''}
    }
    .tiptap-editor .ProseMirror h2 {
      ${themeStyles.h2 ? tailwindToCSS(themeStyles.h2) : ''}
    }
    .tiptap-editor .ProseMirror h3 {
      ${themeStyles.h3 ? tailwindToCSS(themeStyles.h3) : ''}
    }
    .tiptap-editor .ProseMirror p {
      ${themeStyles.p ? tailwindToCSS(themeStyles.p) : ''}
    }
    .tiptap-editor .ProseMirror blockquote {
      ${themeStyles.blockquote ? tailwindToCSS(themeStyles.blockquote) : ''}
    }
    .tiptap-editor .ProseMirror hr {
      ${themeStyles.hr ? tailwindToCSS(themeStyles.hr) : ''}
    }
    .tiptap-editor .ProseMirror table {
      ${themeStyles.table ? tailwindToCSS(themeStyles.table) : ''}
      border-collapse: collapse;
      width: 100%;
    }
    .tiptap-editor .ProseMirror thead {
      ${themeStyles.thead ? tailwindToCSS(themeStyles.thead) : ''}
    }
    .tiptap-editor .ProseMirror th {
      ${themeStyles.th ? tailwindToCSS(themeStyles.th) : ''}
    }
    .tiptap-editor .ProseMirror td {
      ${themeStyles.td ? tailwindToCSS(themeStyles.td) : ''}
    }
  ` : ''

  return (
    <div className={`tiptap-editor ${className}`}>
      {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
      
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