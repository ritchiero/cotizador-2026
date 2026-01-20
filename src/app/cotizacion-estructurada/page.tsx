'use client';
import { useRouter } from 'next/navigation';

export default function CotizacionEstructurada() {
  const router = useRouter();

  const tiposCotizacion = [
    {
      id: '1',
      titulo: 'Honorarios Fijos',
      descripcion: 'Pago único por un servicio específico.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4C4 2.89543 4.89543 2 6 2H14C15.1046 2 16 2.89543 16 4V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V4Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 6H12M8 10H12M8 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: '2',
      titulo: 'Cotización por Hora',
      descripcion: 'Tarifa basada en horas trabajadas.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: '3',
      titulo: 'Retainer',
      descripcion: 'Anticipo que cubre futuros servicios legales.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 6V5C7 3.89543 7.89543 3 9 3H11C12.1046 3 13 3.89543 13 5V6" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: '4',
      titulo: 'Contingencia',
      descripcion: 'Pago basado en éxito, como porcentaje del monto recuperado.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: '5',
      titulo: 'Proyecto',
      descripcion: 'Precio total acordado para un caso o proyecto completo.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 4V3M13 4V3M3 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: '6',
      titulo: 'Iguala/Suscripción',
      descripcion: 'Pago mensual/anual para servicios legales continuos.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H16M4 10H16M4 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const handleSelectTipo = (tipoId: string) => {
    localStorage.setItem('tipoCotizacionEstructurada', tipoId);
    router.push(`/cotizacion-estructurada/${tipoId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-16">
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header - Sin card contenedora según design system */}
        <div className="px-8 pt-6 pb-4">
          <h1 className="text-lg font-semibold text-gray-800">Cotización Estructurada</h1>
          <p className="text-sm text-gray-500 mt-1">Selecciona el tipo de cotización que deseas crear</p>
        </div>

        {/* Tip Card */}
        <div className="px-8 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">Configura una nueva cotización aquí.</p>
              <p className="text-sm text-blue-700 mt-1">
                Completa los campos requeridos para crear y gestionar tu cotización eficientemente. Asegúrate de que todos los detalles correctos y necesarios estén cargados.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de tipos de cotización */}
        <div className="px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiposCotizacion.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => handleSelectTipo(tipo.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all text-left group"
            >
              <div className="flex items-start">
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                  {tipo.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tipo.id}. {tipo.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{tipo.descripcion}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
