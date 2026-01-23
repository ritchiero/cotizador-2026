import React from 'react';
import {
    DocumentTextIcon,
    PaperClipIcon,
    PencilSquareIcon,
    CalendarIcon,
    UserIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    ReceiptPercentIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';

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

const ADD_ONS_LIST: { id: string; label: string; icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'notes', label: 'Agregar Notas', icon: PencilSquareIcon },
    { id: 'attachments', label: 'Agregar Adjuntos', icon: PaperClipIcon },
    { id: 'signature', label: 'Agregar Firma', icon: PencilSquareIcon },
    { id: 'expiration_date', label: 'Agregar Fecha de Expiración', icon: CalendarIcon },
    { id: 'contact_details', label: 'Agregar Datos de Contacto', icon: UserIcon },
    { id: 'specific_tc', label: 'Agregar T&C Específicos', icon: DocumentTextIcon },
    { id: 'general_tc', label: 'Agregar T&C Generales', icon: ShieldCheckIcon },
    { id: 'privacy_policy', label: 'Agregar Política de Privacidad', icon: ShieldCheckIcon },
    { id: 'bank_account', label: 'Agregar Cuenta Bancaria', icon: BanknotesIcon },
    { id: 'invoicing_info', label: 'Solicitar Información de Facturación', icon: ReceiptPercentIcon },
];

export default function AddOnsSelector({ selectedAddOns, onToggle, onConfigure }: AddOnsSelectorProps) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Opciones Adicionales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ADD_ONS_LIST.map((item) => {
                    const isSelected = selectedAddOns.has(item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => onToggle(item.id)}
                            className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all duration-300 group hover:-translate-y-1 ${isSelected
                                ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${isSelected
                                        ? 'bg-blue-600 border-blue-600 shadow-md scale-110'
                                        : 'bg-white border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onConfigure(item.id);
                                    }}
                                    className={`p-1.5 rounded-full transition-all ${isSelected
                                        ? 'text-blue-600 hover:bg-blue-100'
                                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100'
                                        }`}
                                    title="Configurar"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
