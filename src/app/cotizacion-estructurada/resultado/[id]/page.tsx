'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  PlusCircleIcon,
  EnvelopeIcon
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
  status: string;
  content: string;
  selectedAddOns: string[];
  createdAt: any;
}

export default function ResultadoCotizacion() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string>('modern');

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        const docRef = doc(db, 'quotations', quotationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Quotation;
          setQuotation({ id: docSnap.id, ...data });

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

  const themes: Record<string, any> = {
    'silicon-valley': {
      name: 'Silicon Valley (SaaS)',
      container: 'bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100 font-sans',
      prose: 'prose-slate prose-lg',
      h1: 'text-3xl font-bold text-gray-900 tracking-tight mb-6',
      h2: 'text-2xl font-semibold text-gray-800 mt-8 mb-4 border-l-4 border-blue-500 pl-4',
      h3: 'text-xl font-medium text-gray-700 mt-6',
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
      h1: 'text-3xl font-bold text-gray-900 tracking-tight mb-6',
      h2: 'text-2xl font-semibold text-gray-800 mt-8 mb-4 border-l-4 border-blue-500 pl-4',
      h3: 'text-xl font-medium text-gray-700 mt-6',
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
      h1: 'text-3xl font-serif font-bold text-black uppercase text-center mb-8 border-b-2 border-black pb-4',
      h2: 'text-xl font-serif font-bold text-black mt-8 mb-2 uppercase underline decoration-2 underline-offset-4',
      h3: 'text-lg font-serif font-bold text-gray-900 mt-6 italic',
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
      h1: 'text-3xl font-serif font-bold text-black uppercase text-center mb-8 border-b-2 border-black pb-4',
      h2: 'text-xl font-serif font-bold text-black mt-8 mb-2 uppercase underline decoration-2 underline-offset-4',
      h3: 'text-lg font-serif font-bold text-gray-900 mt-6 italic',
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
      h1: 'text-4xl font-serif font-medium text-[#1C1917] mb-8 text-center tracking-wide italic',
      h2: 'text-xl font-sans font-semibold text-[#B91C1C] mt-10 mb-4 uppercase tracking-widest text-center',
      h3: 'text-lg font-serif font-medium text-[#44403C] mt-6 border-b border-[#E7E5E4] pb-1 inline-block',
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
      h1: 'text-4xl font-serif font-medium text-[#1C1917] mb-8 text-center tracking-wide italic',
      h2: 'text-xl font-sans font-semibold text-[#B91C1C] mt-10 mb-4 uppercase tracking-widest text-center',
      h3: 'text-lg font-serif font-medium text-[#44403C] mt-6 border-b border-[#E7E5E4] pb-1 inline-block',
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
      h1: 'text-xl font-bold text-gray-900 mb-6 uppercase border-b border-gray-300 pb-2',
      h2: 'text-lg font-bold text-gray-800 mt-6 mb-3 flex items-center before:content-["//_"] before:text-gray-400',
      h3: 'text-base font-semibold text-gray-700 mt-4 mb-2',
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
      h1: 'text-xl font-bold text-gray-900 mb-6 uppercase border-b border-gray-300 pb-2',
      h2: 'text-lg font-bold text-gray-800 mt-6 mb-3 flex items-center before:content-["//_"] before:text-gray-400',
      h3: 'text-base font-semibold text-gray-700 mt-4 mb-2',
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
      h1: 'text-3xl font-bold text-stone-900 mb-6',
      h2: 'text-xl font-semibold text-stone-800 mt-6 mb-3',
      h3: 'text-lg font-medium text-stone-700',
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
      h1: 'text-2xl font-bold text-indigo-900 mb-6',
      h2: 'text-xl font-semibold text-gray-800 mt-6 mb-3',
      h3: 'text-lg font-medium text-gray-700',
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

  const handleDownloadPDF = () => {
    if (!quotation) return;

    // Convert content to blob and download
    const blob = new Blob([quotation.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cotizacion_${quotation.folio}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Cotización descargada');
  };

  const handleCopyContent = () => {
    if (!quotation) return;

    navigator.clipboard.writeText(quotation.content);
    toast.success('Contenido copiado al portapapeles');
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
            <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              {quotation.status === 'generated' ? 'Generada' : quotation.status}
            </span>
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

            <div className={`${activeStyle.prose} max-w-none print:prose-p:text-black`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: (props: any) => <h1 className={activeStyle.h1} {...props} />,
                  h2: (props: any) => <h2 className={`${activeStyle.h2} break-after-avoid`} {...props} />,
                  h3: (props: any) => <h3 className={`${activeStyle.h3} break-after-avoid`} {...props} />,
                  p: (props: any) => <p className={activeStyle.p} {...props} />,
                  ul: (props: any) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2" {...props} />,
                  ol: (props: any) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2" {...props} />,
                  li: (props: any) => <li className="pl-1" {...props} />,
                  strong: (props: any) => <strong className="font-bold text-current" {...props} />,
                  blockquote: (props: any) => <blockquote className={`${activeStyle.blockquote} break-inside-avoid`} {...props} />,
                  table: (props: any) => (
                    <div className="overflow-x-auto my-8 print:overflow-visible">
                      <table className={`${activeStyle.table} w-full`} {...props} />
                    </div>
                  ),
                  thead: (props: any) => <thead className={activeStyle.thead} {...props} />,
                  tbody: (props: any) => <tbody className="bg-transparent" {...props} />,
                  tr: (props: any) => <tr className="hover:bg-black/5 transition-colors break-inside-avoid" {...props} />,
                  th: (props: any) => <th className={activeStyle.th} {...props} />,
                  td: (props: any) => <td className={activeStyle.td} {...props} />,
                  hr: (props: any) => <hr className={`${activeStyle.hr} print:hidden`} {...props} />,
                }}
              >
                {quotation.content}
              </ReactMarkdown>
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
            onClick={() => router.push('/cotizacion-estructurada')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Nueva Cotización</span>
          </button>

          <button
            onClick={() => toast('Función de envío por email próximamente')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
