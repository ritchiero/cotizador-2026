import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { TermTemplate } from '@/lib/types/terms';
import { toast } from 'react-hot-toast';
import { TrashIcon, PencilIcon, PlusIcon, ExclamationTriangleIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; // ExclamationTriangleIcon added

export default function LegalSettingsTab() {
    const { user } = useAuth();
    const [activeSubTab, setActiveSubTab] = useState<'GENERAL' | 'SPECIFIC' | 'POLICY'>('GENERAL');
    const [templates, setTemplates] = useState<TermTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit/Create Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<TermTemplate>>({});

    // Delete Confirmation State
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    // Quick View State
    const [viewingTemplate, setViewingTemplate] = useState<TermTemplate | null>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'terms_templates'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const distinctTemplates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TermTemplate[];
            setTemplates(distinctTemplates);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredTemplates = templates.filter(t => t.type === activeSubTab);

    const handleSave = async () => {
        if (!user) return;

        // Validaciones específicas
        if (!currentTemplate.name?.trim()) {
            toast.error('El nombre de la plantilla es obligatorio');
            return;
        }
        if (!currentTemplate.content?.trim()) {
            toast.error('El contenido de la plantilla es obligatorio');
            return;
        }

        const templateType = currentTemplate.type || activeSubTab; // Use selected type or current tab default

        try {
            const templateData = {
                name: currentTemplate.name,
                content: currentTemplate.content,
                type: templateType,
                userId: user.uid,
                updatedAt: serverTimestamp()
            };

            if (currentTemplate.id) {
                await updateDoc(doc(db, 'terms_templates', currentTemplate.id), templateData);
                toast.success('Plantilla actualizada');
            } else {
                await addDoc(collection(db, 'terms_templates'), {
                    ...templateData,
                    createdAt: serverTimestamp()
                });
                toast.success('Plantilla creada');
            }
            setIsEditing(false);
            setCurrentTemplate({});
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la plantilla');
        }
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;

        try {
            await deleteDoc(doc(db, 'terms_templates', templateToDelete));
            toast.success('Plantilla eliminada');
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setTemplateToDelete(null); // Close modal
        }
    };

    // New functions for UI refinements
    const handleCreateNew = () => {
        setCurrentTemplate({ type: activeSubTab });
        setIsEditing(true);
    };

    const handleEdit = (template: TermTemplate) => {
        setCurrentTemplate(template);
        setIsEditing(true);
    };

    if (isEditing) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        {currentTemplate?.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
                    </h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">
                            Nombre de la Plantilla
                        </label>
                        <input
                            type="text"
                            value={currentTemplate?.name || ''}
                            onChange={(e) => setCurrentTemplate(prev => ({ ...prev!, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            placeholder="Ej. Cláusula de Confidencialidad"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">
                            Categoría
                        </label>
                        <div className="relative">
                            <select
                                value={currentTemplate?.type || activeSubTab}
                                onChange={(e) => setCurrentTemplate(prev => ({ ...prev!, type: e.target.value as any }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="GENERAL">Términos Generales</option>
                                <option value="SPECIFIC">Términos Específicos</option>
                                <option value="POLICY">Políticas de privacidad</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-8">
                    <label className="text-sm font-bold text-gray-700 block">
                        Contenido Legal
                    </label>
                    <textarea
                        value={currentTemplate?.content || ''}
                        onChange={(e) => setCurrentTemplate(prev => ({ ...prev!, content: e.target.value }))}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none min-h-[300px] text-base leading-relaxed font-sans resize-y"
                        placeholder="Escribe o pega el contenido legal aquí..."
                    />
                    <p className="text-xs text-gray-400 text-right">
                        Se recomienda usar un lenguaje claro y preciso.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors font-medium text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        // disabled={isSaving} // Not implemented yet
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-sm flex items-center gap-2"
                    >
                        Guardar Plantilla
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick View Modal */}
            {viewingTemplate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{viewingTemplate.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase tracking-wide">
                                        {viewingTemplate.type === 'SPECIFIC' ? 'Específico' : viewingTemplate.type === 'POLICY' ? 'Política' : 'General'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        ~{viewingTemplate.content.split(/\s+/).length} palabras
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingTemplate(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="prose prose-sm prose-blue max-w-none">
                                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base font-sans">
                                    {viewingTemplate.content}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setViewingTemplate(null)}
                                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {templateToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <ExclamationTriangleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">¿Eliminar plantilla?</h3>
                                <p className="text-gray-500 text-sm mt-1">Esta acción no se puede deshacer.</p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setTemplateToDelete(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Plantillas Legales</h2>
                    <p className="text-gray-500 mt-1">Configura tus bases legales para usarlas en tus cotizaciones.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Crear Nueva Plantilla</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    {[
                        { id: 'GENERAL', label: 'Términos Generales' },
                        { id: 'SPECIFIC', label: 'Términos Específicos' },
                        { id: 'POLICY', label: 'Políticas de privacidad' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-medium transition-colors relative
            ${activeSubTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
                        >
                            {tab.label}
                            {activeSubTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group relative flex flex-col p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white min-h-[180px]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{template.name}</h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-xs font-semibold text-gray-500 border border-gray-100">
                                                    <DocumentTextIcon className="w-3 h-3" />
                                                    {template.content.split(/\s+/).length} palabras
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Always visible on mobile, hover on desktop */}
                                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white pl-2">
                                            <button
                                                onClick={() => setViewingTemplate(template)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Vista Rápida"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => { setCurrentTemplate(template); setIsEditing(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setTemplateToDelete(template.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className="relative flex-1 cursor-pointer"
                                        onClick={() => setViewingTemplate(template)}
                                    >
                                        <p className="text-sm text-gray-600 leading-relaxed font-sans whitespace-pre-wrap line-clamp-4">
                                            {template.content}
                                        </p>
                                        {/* Subtle gradient overlay for truncation hint */}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 mb-2">No hay plantillas en esta sección</p>
                            <button
                                onClick={() => { setCurrentTemplate({ type: activeSubTab }); setIsEditing(true); }}
                                className="text-blue-600 font-medium hover:underline text-sm"
                            >
                                Crear la primera plantilla
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
