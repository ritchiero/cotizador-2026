'use client'

import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { ChevronDown } from 'lucide-react'

interface HeadingDropdownProps {
  editor: Editor | null
}

export default function HeadingDropdown({ editor }: HeadingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!editor) {
    return null
  }

  const getCurrentLevel = () => {
    if (editor.isActive('heading', { level: 1 })) return { label: 'Título 1', value: 1 }
    if (editor.isActive('heading', { level: 2 })) return { label: 'Título 2', value: 2 }
    if (editor.isActive('heading', { level: 3 })) return { label: 'Título 3', value: 3 }
    return { label: 'Párrafo', value: 0 }
  }

  const setLevel = (level: number) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()
    }
    setIsOpen(false)
  }

  const currentLevel = getCurrentLevel()

  const options = [
    { label: 'Párrafo', value: 0 },
    { label: 'Título 1', value: 1 },
    { label: 'Título 2', value: 2 },
    { label: 'Título 3', value: 3 },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-transparent border border-gray-200 rounded-full hover:border-gray-300 flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors focus:ring-4 focus:ring-blue-100 focus:outline-none"
        title="Cambiar nivel de encabezado"
      >
        <span>{currentLevel.label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 left-0 z-20 bg-white shadow-2xl rounded-xl p-1.5 min-w-[120px]">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => setLevel(option.value)}
                className={`w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 transition-colors ${
                  currentLevel.value === option.value
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}