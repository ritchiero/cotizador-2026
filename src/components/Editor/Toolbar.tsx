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

  return (
    <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2">
      <HeadingDropdown editor={editor} />
      
      <Separator />
      
      <button
        onClick={toggleBold}
        title="Negrita (Cmd+B)"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive('bold') 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={toggleItalic}
        title="Cursiva (Cmd+I)"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive('italic') 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={toggleUnderline}
        title="Subrayado (Cmd+U)"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive('underline') 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <Underline className="w-4 h-4" />
      </button>

      <Separator />

      <button
        onClick={toggleBulletList}
        title="Lista con viñetas"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive('bulletList') 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={toggleOrderedList}
        title="Lista numerada"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive('orderedList') 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
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
          className="w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-700"
        >
          <Table className="w-4 h-4" />
        </button>
      )}

      <Separator />

      <button
        onClick={setTextAlignLeft}
        title="Alinear a la izquierda"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive({ textAlign: 'left' }) 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        onClick={setTextAlignCenter}
        title="Centrar texto"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive({ textAlign: 'center' }) 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        onClick={setTextAlignRight}
        title="Alinear a la derecha"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive({ textAlign: 'right' }) 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        onClick={setTextAlignJustify}
        title="Justificar texto"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
          editor.isActive({ textAlign: 'justify' }) 
            ? 'bg-blue-50 border-blue-600 text-blue-600' 
            : 'text-gray-700'
        }`}
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <Separator />

      <button
        onClick={undo}
        disabled={!canUndo}
        title="Deshacer (Cmd+Z)"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg flex items-center justify-center transition-colors ${
          !canUndo
            ? 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rehacer (Cmd+Shift+Z)"
        className={`w-10 h-10 bg-transparent border border-gray-200 rounded-lg flex items-center justify-center transition-colors ${
          !canRedo
            ? 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  )
}