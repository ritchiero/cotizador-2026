'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import { Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table } from 'lucide-react'
import HeadingDropdown from './HeadingDropdown'
import TableSizeSelector from './TableSizeSelector'

interface ToolbarProps {
  editor: Editor | null
  onShowTableMenu?: (event: React.MouseEvent) => void
}

export default function Toolbar({ editor, onShowTableMenu }: ToolbarProps) {
  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleMark('bold').run()
  const toggleItalic = () => editor.chain().focus().toggleMark('italic').run()
  const toggleUnderline = () => editor.chain().focus().toggleMark('underline').run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  
  const setTextAlignLeft = () => editor.chain().focus().setTextAlign('left').run()
  const setTextAlignCenter = () => editor.chain().focus().setTextAlign('center').run()
  const setTextAlignRight = () => editor.chain().focus().setTextAlign('right').run()
  const setTextAlignJustify = () => editor.chain().focus().setTextAlign('justify').run()
  
  const undo = () => editor.chain().focus().undo().run()
  const redo = () => editor.chain().focus().redo().run()
  
  const canUndo = editor.can().undo()
  const canRedo = editor.can().redo()

  // Separator component
  const Separator = () => (
    <div className="border-l border-gray-200 h-6 mx-2"></div>
  )

  // Base button class with accessibility improvements
  const getButtonClass = (isActive: boolean = false, isDisabled: boolean = false) => {
    const baseClass = "w-10 h-10 bg-transparent border border-gray-200 rounded-lg flex items-center justify-center transition-colors focus:ring-4 focus:ring-blue-100 focus:outline-none"
    
    if (isDisabled) {
      return `${baseClass} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`
    }
    
    if (isActive) {
      return `${baseClass} bg-blue-50 border-blue-600 text-blue-600 hover:bg-blue-100`
    }
    
    return `${baseClass} text-gray-700 hover:bg-gray-100`
  }

  return (
    <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2 overflow-x-auto">
      <HeadingDropdown editor={editor} />
      
      <Separator />
      
      <button
        onClick={toggleBold}
        title="Negrita (Cmd+B)"
        className={getButtonClass(editor.isActive('bold'))}
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={toggleItalic}
        title="Cursiva (Cmd+I)"
        className={getButtonClass(editor.isActive('italic'))}
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={toggleUnderline}
        title="Subrayado (Cmd+U)"
        className={getButtonClass(editor.isActive('underline'))}
      >
        <Underline className="w-4 h-4" />
      </button>

      <Separator />

      <button
        onClick={toggleBulletList}
        title="Lista con viñetas"
        className={getButtonClass(editor.isActive('bulletList'))}
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={toggleOrderedList}
        title="Lista numerada"
        className={getButtonClass(editor.isActive('orderedList'))}
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <Separator />

      <TableSizeSelector editor={editor} />

      {/* Table operations button - only visible when cursor is in a table */}
      {editor.isActive('table') && (
        <button
          onClick={onShowTableMenu}
          title="Opciones de tabla"
          className={getButtonClass()}
        >
          <Table className="w-4 h-4" />
        </button>
      )}

      <Separator />

      <button
        onClick={setTextAlignLeft}
        title="Alinear a la izquierda"
        className={getButtonClass(editor.isActive({ textAlign: 'left' }))}
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        onClick={setTextAlignCenter}
        title="Centrar texto"
        className={getButtonClass(editor.isActive({ textAlign: 'center' }))}
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        onClick={setTextAlignRight}
        title="Alinear a la derecha"
        className={getButtonClass(editor.isActive({ textAlign: 'right' }))}
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        onClick={setTextAlignJustify}
        title="Justificar texto"
        className={getButtonClass(editor.isActive({ textAlign: 'justify' }))}
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <Separator />

      <button
        onClick={undo}
        disabled={!canUndo}
        title="Deshacer (Cmd+Z)"
        className={getButtonClass(false, !canUndo)}
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rehacer (Cmd+Shift+Z)"
        className={getButtonClass(false, !canRedo)}
      >
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  )
}