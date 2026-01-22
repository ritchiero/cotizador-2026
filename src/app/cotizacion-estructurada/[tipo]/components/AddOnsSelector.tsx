import React from 'react';

export type AddOnChoice =
    | 'terms_conditions'
    | 'notes'
    | 'attachments'
    | 'signature'
    | 'expiration_date'
    | 'contact_details'
    | 'specific_tc'
    | 'general_tc'
    | 'privacy_policy'
    | 'bank_account'
    | 'invoicing_info';

interface AddOnsSelectorProps {
    selectedAddOns: Set<string>;
    onToggle: (addOn: string) => void;
    onConfigure: (addOnId: string) => void;
}

const ADD_ONS_LIST: { id: string; label: string }[] = [
    { id: 'notes', label: 'Agregar Notas' },
    { id: 'attachments', label: 'Agregar Adjuntos' },
    { id: 'signature', label: 'Agregar Firma' },
    { id: 'expiration_date', label: 'Agregar Fecha de Expiración' },
    { id: 'contact_details', label: 'Agregar Datos de Contacto' },
    { id: 'specific_tc', label: 'Agregar T&C Específicos' },
    { id: 'general_tc', label: 'Agregar T&C Generales' },
    { id: 'privacy_policy', label: 'Agregar Política de Privacidad' },
    { id: 'bank_account', label: 'Agregar Cuenta Bancaria' },
    { id: 'invoicing_info', label: 'Solicitar Información de Facturación' },
];

export default function AddOnsSelector({ selectedAddOns, onToggle, onConfigure }: AddOnsSelectorProps) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Opciones Adicionales</h2>
            <div className="space-y-4">
                {ADD_ONS_LIST.map((item) => {
                    const isSelected = selectedAddOns.has(item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => onToggle(item.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${isSelected
                                ? 'border-blue-500 bg-blue-50/50'
                                : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-300 group-hover:border-blue-400'
                                        }`}
                                >
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>
                                    {item.label}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfigure(item.id);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                title="Configurar"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
