'use client'

import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Grid3X3 } from 'lucide-react'

interface TableSizeSelectorProps {
  editor: Editor | null
}

export default function TableSizeSelector({ editor }: TableSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  if (!editor) {
    return null
  }

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setIsOpen(false)
    setHoveredCell(null)
  }

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col })
  }

  const handleClickOutside = () => {
    setIsOpen(false)
    setHoveredCell(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Insertar tabla"
        className="w-10 h-10 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-700 focus:ring-4 focus:ring-blue-100 focus:outline-none"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={handleClickOutside}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl p-3 border border-gray-200 z-20">
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 36 }, (_, index) => {
                const row = Math.floor(index / 6) + 1
                const col = (index % 6) + 1
                const isHighlighted = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col
                
                return (
                  <div
                    key={index}
                    className={`w-5 h-5 border border-gray-300 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => handleCellHover(row, col)}
                    onClick={() => insertTable(row, col)}
                  />
                )
              })}
            </div>
            
            {/* Size indicator */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              {hoveredCell ? `${hoveredCell.row} x ${hoveredCell.col}` : 'Selecciona el tamaño'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}