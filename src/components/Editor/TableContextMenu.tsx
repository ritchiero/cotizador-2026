'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import { 
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react'

interface TableContextMenuProps {
  editor: Editor
  position: { x: number; y: number }
  isVisible: boolean
  onClose: () => void
}

export default function TableContextMenu({ 
  editor, 
  position, 
  isVisible, 
  onClose 
}: TableContextMenuProps) {
  const handleAddRowAbove = () => {
    editor.chain().focus().addRowBefore().run()
    onClose()
  }

  const handleAddRowBelow = () => {
    editor.chain().focus().addRowAfter().run()
    onClose()
  }

  const handleDeleteRow = () => {
    editor.chain().focus().deleteRow().run()
    onClose()
  }

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.table-context-menu')) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div
      className="table-context-menu fixed z-50 bg-white rounded-xl shadow-2xl p-1.5 border border-gray-200 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        onClick={handleAddRowAbove}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Plus className="h-4 w-4" />
        Agregar fila arriba
      </button>
      
      <button
        onClick={handleAddRowBelow}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Plus className="h-4 w-4" />
        Agregar fila abajo
      </button>
      
      <button
        onClick={handleDeleteRow}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <Minus className="h-4 w-4" />
        Eliminar fila
      </button>
    </div>
  )
}