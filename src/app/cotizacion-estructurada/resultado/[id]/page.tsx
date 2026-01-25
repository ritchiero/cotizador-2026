'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';
import TiptapEditor from '@/components/Editor/TiptapEditor';
import { markdownToHtml } from '@/lib/utils/markdownToHtml';
import EmailModal from '@/components/EmailModal';
import {
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  PlusCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Quotation {
  id: string;
  userId: string;
  folio: string;
  clientName: string;
  quotationType: string;
  formatType: string;
  toneType: string;
  languageType: string;
  styleType?: string;
  status: string;
  content: string;
  selectedAddOns: string[];
  formDataSnapshot?: any;
  createdAt: any;
}

export default function ResultadoCotizacion() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string>('modern');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        const docRef = doc(db, 'quotations', quotationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Quotation;
          setQuotation({ ...data, id: docSnap.id });

          // Convert markdown content to HTML for the editor
          const htmlContent = markdownToHtml(data.content || '');
          setEditorContent(htmlContent);

          // Set theme from saved styleType
          if (data.styleType && themes[data.styleType]) {
            setCurrentTheme(data.styleType);
          } else {
            // Fallback mapping
            if (data.styleType === 'ny-biglaw') setCurrentTheme('biglaw');
            else if (data.styleType === 'silicon-valley') setCurrentTheme('modern');
            else if (data.styleType === 'swiss-financial') setCurrentTheme('financial');
            else if (data.styleType === 'luxury-boutique') setCurrentTheme('boutique');
            else setCurrentTheme('modern');
          }
        } else {
          toast.error('Cotización no encontrada');
          router.push('/cotizacion-estructurada');
        }
      } catch (error) {
        console.error('Error loading quotation:', error);
        toast.error('Error al cargar la cotización');
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [quotationId, router]);

  // Auto-save functionality
  const saveContentToFirestore = useCallback(async (content: string) => {
    if (!quotationId) return;

    try {
      setSaveStatus('saving');
      const quotationRef = doc(db, 'quotations', quotationId);
      await updateDoc(quotationRef, {
        content: content,
        updatedAt: serverTimestamp()
      });
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
      
      // Reset to idle after 3 seconds for error state
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [quotationId]);

  // Debounced auto-save (3 seconds)
  const debouncedSave = useRef(
    debounce((content: string) => {
      saveContentToFirestore(content);
    }, 3000)
  ).current;

  // Handle editor content changes
  const handleEditorChange = useCallback((content: string) => {
    setEditorContent(content);
    
    // Trigger debounced auto-save
    debouncedSave(content);
  }, [debouncedSave]);

  // Manual save function
  const handleManualSave = useCallback(async () => {
    if (!quotationId || isManualSaving) return;

    setIsManualSaving(true);
    
    try {
      setSaveStatus('saving');
      const quotationRef = doc(db, 'quotations', quotationId);
      await updateDoc(quotationRef, {
        content: editorContent,
        updatedAt: serverTimestamp()
      });
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
      
      // Reset to idle after 3 seconds for error state
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsManualSaving(false);
    }
  }, [quotationId, editorContent, isManualSaving]);

  // Keyboard shortcut for save (Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleManualSave]);

  const themes: Record<string, any> = {
    'silicon-valley': {
      name: 'Silicon Valley (SaaS)',
      container: 'bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100 font-sans',
      prose: 'prose-slate prose-lg',
      h1: 'text-xl font-bold text-gray-900 tracking-tight mb-6',
      h2: 'text-lg font-semibold text-gray-800 mt-8 mb-4 border-l-4 border-blue-500 pl-4',
      h3: 'text-base font-medium text-gray-700 mt-6',
      p: 'text-gray-600 leading-relaxed mb-4',
      table: 'min-w-full divide-y divide-gray-200 border-separate border-spacing-0',
      thead: 'bg-gray-50',
      th: 'px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
      td: 'px-6 py-4 whitespace-normal text-gray-600 border-b border-gray-100',
      blockquote: 'border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 italic text-blue-900 my-6 rounded-r-lg',
      hr: 'my-8 border-gray-100',
      accent: 'bg-blue-600',
      textAccent: 'text-blue-600 pl-2'
    },
    'modern': { // Fallback
      name: 'Silicon Valley (SaaS)',
      container: 'bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100 font-sans',
      prose: 'prose-slate prose-lg',
      h1: 'text-xl font-bold text-gray-900 tracking-tight mb-6',
      h2: 'text-lg font-semibold text-gray-800 mt-8 mb-4 border-l-4 border-blue-500 pl-4',
      h3: 'text-base font-medium text-gray-700 mt-6',
      p: 'text-gray-600 leading-relaxed mb-4',
      table: 'min-w-full divide-y divide-gray-200 border-separate border-spacing-0',
      thead: 'bg-gray-50',
      th: 'px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
      td: 'px-6 py-4 whitespace-normal text-gray-600 border-b border-gray-100',
      blockquote: 'border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 italic text-blue-900 my-6 rounded-r-lg',
      hr: 'my-8 border-gray-100',
      accent: 'bg-blue-600',
      textAccent: 'text-blue-600 pl-2'
    },
    'ny-biglaw': {
      name: 'NY BigLaw (Traditional)',
      container: 'bg-white p-12 sm:p-16 border-2 border-double border-gray-900 shadow-none rounded-none font-serif',
      prose: 'prose-neutral prose-lg font-serif',
      h1: 'text-xl font-serif font-bold text-black uppercase text-center mb-8 border-b-2 border-black pb-4',
      h2: 'text-base font-serif font-bold text-black mt-8 mb-2 uppercase underline decoration-2 underline-offset-4',
      h3: 'text-sm font-serif font-bold text-gray-900 mt-6 italic',
      p: 'text-black leading-relaxed mb-4 text-justify font-serif text-[1.05rem]',
      table: 'min-w-full border-collapse border border-black',
      thead: 'bg-gray-100 border-b-2 border-black',
      th: 'px-4 py-2 text-left text-sm font-bold text-black border-r border-black last:border-r-0 uppercase',
      td: 'px-4 py-2 text-black border-b border-r border-black last:border-r-0 font-serif',
      blockquote: 'border-l-2 border-black pl-6 py-2 my-6 font-serif italic text-black',
      hr: 'my-8 border-black border-t-2',
      accent: 'bg-black',
      textAccent: 'text-black'
    },
    'biglaw': { // Fallback
      name: 'NY BigLaw (Traditional)',
      container: 'bg-white p-12 sm:p-16 border-2 border-double border-gray-900 shadow-none rounded-none font-serif',
      prose: 'prose-neutral prose-lg font-serif',
      h1: 'text-xl font-serif font-bold text-black uppercase text-center mb-8 border-b-2 border-black pb-4',
      h2: 'text-base font-serif font-bold text-black mt-8 mb-2 uppercase underline decoration-2 underline-offset-4',
      h3: 'text-sm font-serif font-bold text-gray-900 mt-6 italic',
      p: 'text-black leading-relaxed mb-4 text-justify font-serif text-[1.05rem]',
      table: 'min-w-full border-collapse border border-black',
      thead: 'bg-gray-100 border-b-2 border-black',
      th: 'px-4 py-2 text-left text-sm font-bold text-black border-r border-black last:border-r-0 uppercase',
      td: 'px-4 py-2 text-black border-b border-r border-black last:border-r-0 font-serif',
      blockquote: 'border-l-2 border-black pl-6 py-2 my-6 font-serif italic text-black',
      hr: 'my-8 border-black border-t-2',
      accent: 'bg-black',
      textAccent: 'text-black'
    },
    'luxury-boutique': {
      name: 'Luxury Boutique (Elegant)',
      container: 'bg-[#FDFAFA] p-10 sm:p-14 border border-[#E5E0DA] shadow-sm rounded-sm font-serif',
      prose: 'prose-stone prose-lg',
      h1: 'text-2xl font-serif font-medium text-[#1C1917] mb-8 text-center tracking-wide italic',
      h2: 'text-base font-sans font-semibold text-[#B91C1C] mt-10 mb-4 uppercase tracking-widest text-center',
      h3: 'text-sm font-serif font-medium text-[#44403C] mt-6 border-b border-[#E7E5E4] pb-1 inline-block',
      p: 'text-[#292524] leading-loose mb-4 font-light text-[1.1rem]',
      table: 'min-w-full divide-y divide-[#E7E5E4]',
      thead: 'bg-transparent border-b-2 border-[#1C1917]',
      th: 'px-4 py-4 text-left text-xs font-bold text-[#1C1917] uppercase tracking-widest',
      td: 'px-4 py-4 text-[#44403C] font-light',
      blockquote: 'border-l-2 border-[#B91C1C] pl-6 py-4 my-8 italic text-[#7F1D1D] font-serif',
      hr: 'my-10 border-[#E7E5E4]',
      accent: 'bg-[#B91C1C]',
      textAccent: 'text-[#B91C1C]'
    },
    'boutique': { // Fallback
      name: 'Luxury Boutique (Elegant)',
      container: 'bg-[#FDFAFA] p-10 sm:p-14 border border-[#E5E0DA] shadow-sm rounded-sm font-serif',
      prose: 'prose-stone prose-lg',
      h1: 'text-2xl font-serif font-medium text-[#1C1917] mb-8 text-center tracking-wide italic',
      h2: 'text-base font-sans font-semibold text-[#B91C1C] mt-10 mb-4 uppercase tracking-widest text-center',
      h3: 'text-sm font-serif font-medium text-[#44403C] mt-6 border-b border-[#E7E5E4] pb-1 inline-block',
      p: 'text-[#292524] leading-loose mb-4 font-light text-[1.1rem]',
      table: 'min-w-full divide-y divide-[#E7E5E4]',
      thead: 'bg-transparent border-b-2 border-[#1C1917]',
      th: 'px-4 py-4 text-left text-xs font-bold text-[#1C1917] uppercase tracking-widest',
      td: 'px-4 py-4 text-[#44403C] font-light',
      blockquote: 'border-l-2 border-[#B91C1C] pl-6 py-4 my-8 italic text-[#7F1D1D] font-serif',
      hr: 'my-10 border-[#E7E5E4]',
      accent: 'bg-[#B91C1C]',
      textAccent: 'text-[#B91C1C]'
    },
    'swiss-financial': {
      name: 'Financial Grade (Swiss)',
      container: 'bg-white p-8 border border-gray-300 shadow-none font-mono text-sm max-w-5xl',
      prose: 'prose-slate prose-sm',
      h1: 'text-base font-bold text-gray-900 mb-6 uppercase border-b border-gray-300 pb-2',
      h2: 'text-sm font-bold text-gray-800 mt-6 mb-3 flex items-center before:content-["//_"] before:text-gray-400',
      h3: 'text-xs font-semibold text-gray-700 mt-4 mb-2',
      p: 'text-gray-600 mb-3 text-justify',
      table: 'w-full border border-gray-300 text-xs',
      thead: 'bg-gray-100 border-b border-gray-300',
      th: 'px-2 py-1 text-left font-bold text-gray-700 border-r border-gray-300',
      td: 'px-2 py-1 text-gray-600 border-b border-r border-gray-200 font-mono',
      blockquote: 'bg-gray-50 border border-gray-200 p-3 my-4 text-gray-600 font-mono text-xs',
      hr: 'my-6 border-gray-300 border-dashed',
      accent: 'bg-gray-800',
      textAccent: 'text-gray-800'
    },
    'financial': { // Fallback
      name: 'Financial Grade (Swiss)',
      container: 'bg-white p-8 border border-gray-300 shadow-none font-mono text-sm max-w-5xl',
      prose: 'prose-slate prose-sm',
      h1: 'text-base font-bold text-gray-900 mb-6 uppercase border-b border-gray-300 pb-2',
      h2: 'text-sm font-bold text-gray-800 mt-6 mb-3 flex items-center before:content-["//_"] before:text-gray-400',
      h3: 'text-xs font-semibold text-gray-700 mt-4 mb-2',
      p: 'text-gray-600 mb-3 text-justify',
      table: 'w-full border border-gray-300 text-xs',
      thead: 'bg-gray-100 border-b border-gray-300',
      th: 'px-2 py-1 text-left font-bold text-gray-700 border-r border-gray-300',
      td: 'px-2 py-1 text-gray-600 border-b border-r border-gray-200 font-mono',
      blockquote: 'bg-gray-50 border border-gray-200 p-3 my-4 text-gray-600 font-mono text-xs',
      hr: 'my-6 border-gray-300 border-dashed',
      accent: 'bg-gray-800',
      textAccent: 'text-gray-800'
    },
    'spanish-boutique': {
      name: 'Despacho Boutique (Personal)',
      container: 'bg-stone-50 p-10 border border-stone-200 shadow-md font-sans rounded-xl',
      prose: 'prose-stone prose-lg',
      h1: 'text-xl font-bold text-stone-900 mb-6',
      h2: 'text-base font-semibold text-stone-800 mt-6 mb-3',
      h3: 'text-sm font-medium text-stone-700',
      p: 'text-stone-700 leading-relaxed',
      table: 'min-w-full divide-y divide-stone-300',
      thead: 'bg-stone-100',
      th: 'px-4 py-2 font-bold text-stone-800',
      td: 'px-4 py-2 text-stone-700',
      blockquote: 'border-l-4 border-stone-400 pl-4 py-2 italic text-stone-600',
      hr: 'border-stone-300 my-6',
      accent: 'bg-stone-700',
      textAccent: 'text-stone-700'
    },
    'legal-ops': {
      name: 'Legal Ops (Efficient)',
      container: 'bg-white rounded-xl border-l-8 border-indigo-600 p-10 font-sans shadow-md',
      prose: 'prose-indigo prose-lg',
      h1: 'text-lg font-bold text-indigo-900 mb-6',
      h2: 'text-base font-semibold text-gray-800 mt-6 mb-3',
      h3: 'text-sm font-medium text-gray-700',
      p: 'text-gray-600 leading-relaxed',
      table: 'min-w-full border border-gray-200',
      thead: 'bg-indigo-50',
      th: 'px-4 py-2 text-left font-bold text-indigo-800',
      td: 'px-4 py-2 border-t border-gray-100',
      blockquote: 'bg-gray-50 border-l-4 border-indigo-400 p-4 italic text-gray-700',
      hr: 'border-gray-200 my-6',
      accent: 'bg-indigo-600',
      textAccent: 'text-indigo-600'
    }
  };

  const activeStyle = themes[currentTheme] || themes['modern'];

  // Save status indicator
  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Guardando...
          </span>
        );
      case 'saved':
        return (
          <span className="text-green-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Guardado ✓
          </span>
        );
      case 'error':
        return (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error al guardar
          </span>
        );
      default:
        return null;
    }
  };

  const handleDownloadPDF = () => {
    if (!quotation) return;

    // Create a new window with the styled content for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('Error: No se pudo abrir ventana para PDF. Permite ventanas emergentes.');
      return;
    }

    // Get current theme styles for PDF
    const currentThemeStyles = activeStyle;
    
    // Build the HTML content with proper styling for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cotización ${quotation.folio}</title>
        <style>
          @page {
            margin: 2cm;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          .content {
            ${currentThemeStyles.container?.includes('font-serif') ? 'font-family: Georgia, serif;' : ''}
            ${currentThemeStyles.container?.includes('font-mono') ? 'font-family: Monaco, monospace;' : ''}
          }
          h1 {
            ${currentThemeStyles.h1?.replace(/text-[^\\s]+/g, '').replace(/mb-[^\\s]+/g, '').replace(/mt-[^\\s]+/g, '')}
            font-size: 1.5em;
            font-weight: bold;
            margin: 1.5em 0 1em 0;
          }
          h2 {
            ${currentThemeStyles.h2?.replace(/text-[^\\s]+/g, '').replace(/mb-[^\\s]+/g, '').replace(/mt-[^\\s]+/g, '')}
            font-size: 1.3em;
            font-weight: 600;
            margin: 1.3em 0 0.8em 0;
          }
          h3 {
            ${currentThemeStyles.h3?.replace(/text-[^\\s]+/g, '').replace(/mb-[^\\s]+/g, '').replace(/mt-[^\\s]+/g, '')}
            font-size: 1.1em;
            font-weight: 500;
            margin: 1.1em 0 0.6em 0;
          }
          p {
            ${currentThemeStyles.p?.replace(/text-[^\\s]+/g, '').replace(/mb-[^\\s]+/g, '').replace(/mt-[^\\s]+/g, '')}
            margin: 0.8em 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            page-break-inside: avoid;
          }
          th {
            ${currentThemeStyles.th?.replace(/text-[^\\s]+/g, '').replace(/px-[^\\s]+/g, '').replace(/py-[^\\s]+/g, '')}
            padding: 8px 12px;
            text-align: left;
            border: 1px solid #ccc;
            background-color: #f5f5f5;
            font-weight: bold;
          }
          td {
            ${currentThemeStyles.td?.replace(/text-[^\\s]+/g, '').replace(/px-[^\\s]+/g, '').replace(/py-[^\\s]+/g, '')}
            padding: 8px 12px;
            border: 1px solid #ccc;
          }
          ul, ol {
            margin: 0.8em 0;
            padding-left: 2em;
          }
          li {
            margin: 0.3em 0;
          }
          strong {
            font-weight: bold;
          }
          em {
            font-style: italic;
          }
          u {
            text-decoration: underline;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .text-left {
            text-align: left;
          }
          .text-justify {
            text-align: justify;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            ${editorContent}
          </div>
        </div>
      </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };

    toast.success('Abriendo ventana de impresión PDF...');
  };

  const handleCopyContent = () => {
    if (!quotation) return;

    navigator.clipboard.writeText(quotation.content);
    toast.success('Contenido copiado al portapapeles');
  };

  const handleRegenerate = async () => {
    if (!quotation || !quotation.formDataSnapshot) {
      toast.error('No hay datos suficientes para regenerar');
      return;
    }

    const toastId = toast.loading('Regenerando cotización con IA...');
    setIsRegenerating(true);

    try {
      // Usar los datos guardados en formDataSnapshot para regenerar
      const response = await fetch('/api/cotizacion/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation.formDataSnapshot)
      });

      if (!response.ok) {
        throw new Error('Error al regenerar cotización');
      }

      const data = await response.json();

      // Actualizar el documento en Firestore con el nuevo contenido
      const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
      const quotationRef = firestoreDoc(db, 'quotations', quotationId);
      await updateDoc(quotationRef, {
        content: data.contenido,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setQuotation(prev => prev ? { ...prev, content: data.contenido } : null);

      toast.success('¡Cotización regenerada exitosamente!', { id: toastId });
    } catch (error) {
      console.error('Error regenerating:', error);
      toast.error('Error al regenerar la cotización', { id: toastId });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return null;
  }

  const formatLabels: Record<string, string> = {
    'one-pager': 'One Pager',
    'short': 'Corto',
    'large': 'Largo y Detallado',
    'custom': 'Personalizado'
  };

  const toneLabels: Record<string, string> = {
    'friendly': 'Amigable',
    'formal': 'Formal'
  };

  const languageLabels: Record<string, string> = {
    'es': 'Español',
    'en': 'Inglés',
    'other': 'Otro'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.push('/cotizacion-estructurada')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors self-start"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Volver a Cotizaciones</span>
          </button>

          {/* Style Indicator (Read Only) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-gray-600">Estilo: <span className="text-gray-900">{activeStyle.name}</span></span>
          </div>
        </div>

        {/* Header with metadata */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Cotización Generada
              </h1>
              <p className="text-sm text-gray-500">
                Creada el {quotation.createdAt?.toDate?.()?.toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'Ahora'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getSaveStatusIndicator()}
              <button
                onClick={handleManualSave}
                disabled={isManualSaving}
                className="bg-transparent border border-gray-300 rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Guardar ahora (Cmd+S)"
              >
                {isManualSaving ? (
                  <>
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
              <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                {quotation.status === 'generated' ? 'Generada' : quotation.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-500 block mb-1">Folio</span>
              <span className="text-sm font-semibold text-gray-900">{quotation.folio}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-500 block mb-1">Cliente</span>
              <span className="text-sm font-semibold text-gray-900">{quotation.clientName}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-500 block mb-1">Formato</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatLabels[quotation.formatType] || quotation.formatType}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-500 block mb-1">Tono</span>
              <span className="text-sm font-semibold text-gray-900">
                {toneLabels[quotation.toneType] || quotation.toneType}
              </span>
            </div>
          </div>

          {quotation.selectedAddOns && quotation.selectedAddOns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500 block mb-2">Add-Ons Incluidos:</span>
              <div className="flex flex-wrap gap-2">
                {quotation.selectedAddOns.map((addon: string) => (
                  <span
                    key={addon}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                  >
                    {addon.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Preview - Paper Simulation */}
        <div className="flex justify-center mb-8 print:block print:w-full print:mb-0">
          <div
            className={`
              ${activeStyle.container}
              transition-all duration-500 
              print:shadow-none print:border-none print:w-full print:p-0 print:m-0
              mx-auto
              relative
            `}
            style={{
              width: '21.59cm', // Letter width
              minHeight: '27.94cm', // At least one page
              // CSS Trick: Repeating gradient to simulate page gaps visually
              backgroundImage: `linear-gradient(to bottom, white 0%, white calc(27.94cm - 1px), #E5E7EB calc(27.94cm - 1px), #E5E7EB 27.94cm)`,
              backgroundSize: '100% 27.94cm', // Repeat exactly every Letter height
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // Ensure shadow is consistent
            }}
          >
            {/* Visual Page Break Indicators (Optional - purely visual) */}

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 print:hidden opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Vista Previa: {activeStyle.name} (Carta - Simulación Paginada)
              </span>
              <button
                onClick={handleCopyContent}
                className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar
              </button>
            </div>

            <div className="bg-white border border-gray-200/50 rounded-[16px] shadow-sm p-6">
              <TiptapEditor
                content={editorContent}
                onChange={handleEditorChange}
                className={`${activeStyle.prose} max-w-none`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 font-semibold"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Descargar Documento</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || !quotation?.formDataSnapshot}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            title={!quotation?.formDataSnapshot ? 'No hay datos para regenerar' : 'Regenerar con IA'}
          >
            {isRegenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Regenerando...</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-5 h-5" />
                <span>Regenerar</span>
              </>
            )}
          </button>

          <button
            onClick={() => router.push('/cotizacion-estructurada')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Nueva Cotización</span>
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Enviar</span>
          </button>
        </div>

        {/* Email Modal */}
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          htmlContent={editorContent}
          quotationTitle={`Cotización Legal${quotation?.folio ? ` - ${quotation.folio}` : ''}`}
          folio={quotation?.folio}
        />
      </div>
    </div>
  );
}
