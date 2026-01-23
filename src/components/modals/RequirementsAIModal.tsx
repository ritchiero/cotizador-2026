"use client";

import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useState } from "react";

interface RequirementsAIModalProps {
  isOpen: boolean;
  loading: boolean;
  options: string[];
  onClose: () => void;
  onSelect: (options: string[]) => void;
  customTitle?: string;
}

export default function RequirementsAIModal({
  isOpen,
  loading,
  options,
  onClose,
  onSelect,
  customTitle,
}: RequirementsAIModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (opt: string) => {
    setSelected((prev) =>
      prev.includes(opt)
        ? prev.filter((o) => o !== opt)
        : [...prev, opt]
    );
  };

  const handleConfirm = () => {
    onSelect(selected);
    setSelected([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl p-0 gap-0 bg-white shadow-2xl max-w-[95%] sm:max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header content */}
        <div className="p-6 border-b border-gray-100 bg-[#F9FAFB] flex flex-col gap-1">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            {customTitle || 'Sugerencias con IA'}
          </DialogTitle>
          <p className="text-sm text-gray-500 ml-10">
            Selecciona las opciones que mejor se adapten a tu caso para agregarlas automáticamente.
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 animate-pulse">
                  <div className="w-5 h-5 rounded bg-gray-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((opt, idx) => {
                const isSelected = selected.includes(opt);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleOption(opt)}
                    className={`
                        relative group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${isSelected
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50/30'
                      }
                    `}
                  >
                    <div className={`mt-0.5 shrink-0 transition-all duration-300 ${isSelected ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOption(opt)}
                        id={`req-opt-${idx}`}
                        className={`
                            data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300
                            w-5 h-5 rounded transition-colors
                        `}
                      />
                    </div>
                    <label
                      htmlFor={`req-opt-${idx}`}
                      className={`text-sm leading-relaxed cursor-pointer select-none transition-colors ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                    >
                      {opt}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center z-10">
          <span className="text-xs text-gray-500 font-medium px-2">
            {selected.length} seleccionados
          </span>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-gray-200/50 text-gray-600 font-medium transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className={`
                px-6 font-semibold shadow-lg shadow-blue-500/20 transition-all
                ${selected.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-blue-600/30 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
            >
              Agregar seleccionados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
