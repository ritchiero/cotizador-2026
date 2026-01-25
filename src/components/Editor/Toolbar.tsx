'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import { Bold, Italic, Underline } from 'lucide-react'
import HeadingDropdown from './HeadingDropdown'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleMark('bold').run()
  const toggleItalic = () => editor.chain().focus().toggleMark('italic').run()
  const toggleUnderline = () => editor.chain().focus().toggleMark('underline').run()

  return (
    <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2">
      <HeadingDropdown editor={editor} />
      
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
    </div>
  )
}