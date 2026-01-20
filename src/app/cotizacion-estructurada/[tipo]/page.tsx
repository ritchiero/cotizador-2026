'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CotizacionEstructuradaForm() {
  const params = useParams();
  const router = useRouter();
  const tipo = params.tipo as string;

  // Configuraciones por tipo de cotización
  const tiposConfig: Record<string, any> = {
    '1': { // Honorarios Fijos
      pricingType: 'fix',
      payment: 'Pago único por servicio específico',
      payments: 'Un solo pago al completar el servicio',
      pricing: 'Tarifa fija establecida'
    },
    '2': { // Cotización por Hora
      pricingType: 'variable',
      payment: 'Pago basado en horas trabajadas',
      payments: 'Facturación mensual según horas',
      pricing: 'Tarifa por hora multiplicada por tiempo trabajado'
    },
    '3': { // Retainer
      pricingType: 'fix',
      payment: 'Pago mensual anticipado',
      payments: 'Cuota fija mensual',
      pricing: 'Anticipo que cubre servicios futuros durante el período'
    },
    '4': { // Contingencia
      pricingType: 'variable',
      payment: 'Pago basado en resultado exitoso',
      payments: 'Porcentaje del monto recuperado',
      pricing: 'Entre 20-40% del resultado obtenido'
    },
    '5': { // Proyecto
      pricingType: 'fix',
      payment: 'Precio total acordado para el proyecto',
      payments: '50% al inicio, 50% al finalizar',
      pricing: 'Precio fijo por proyecto completo'
    },
    '6': { // Iguala/Suscripción
      pricingType: 'fix',
      payment: 'Cuota mensual o anual',
      payments: 'Pago recurrente mensual/anual',
      pricing: 'Suscripción con servicios ilimitados o con límite de horas'
    }
  };

  const [formData, setFormData] = useState({
    quotationName: '',
    client: '',
    contextDescription: '',
    clientNeed: '',
    times: '',
    location: '',
    requirements: '',
    payments: tiposConfig[tipo]?.payments || '',
    payment: tiposConfig[tipo]?.payment || '',
    pricingType: tiposConfig[tipo]?.pricingType || 'fix',
    pricing: tiposConfig[tipo]?.pricing || '',
    details: ''
  });

  const tiposTitulos: Record<string, string> = {
    '1': 'Honorarios Fijos',
    '2': 'Cotización por Hora',
    '3': 'Retainer',
    '4': 'Contingencia',
    '5': 'Proyecto',
    '6': 'Iguala/Suscripción'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-16">
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.push('/cotizacion-estructurada')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{tiposTitulos[tipo] || 'Cotización Estructurada'}</h1>
          </div>
          <p className="text-sm text-gray-500">Completa los detalles para generar una cotización personalizada</p>
        </div>

        {/* Formulario en cuadrícula 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Nombre de la Cotización */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Nombre de la Cotización
                </label>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={formData.quotationName}
              onChange={(e) => handleInputChange('quotationName', e.target.value)}
              placeholder="Agrega el nombre de la cotización"
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Cliente */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Cliente
                </label>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Agregar cliente
              </button>
            </div>
            <select
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className="w-full px-0 py-2 text-sm text-gray-500 border-none focus:outline-none focus:ring-0 appearance-none cursor-pointer"
            >
              <option value="">Seleccionar cliente</option>
            </select>
          </div>

          {/* Contexto / Descripción Breve */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Contexto / Descripción Breve
                </label>
              </div>
            </div>
            <textarea
              value={formData.contextDescription}
              onChange={(e) => handleInputChange('contextDescription', e.target.value)}
              placeholder="Agrega la descripción"
              rows={4}
              maxLength={200}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.contextDescription.length}/200
            </div>
          </div>

          {/* Client Need */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Necesidad del Cliente
                </label>
              </div>
            </div>
            <textarea
              value={formData.clientNeed}
              onChange={(e) => handleInputChange('clientNeed', e.target.value)}
              placeholder="Agrega las necesidades del cliente"
              rows={4}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Times */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Tiempos
                </label>
              </div>
            </div>
            <textarea
              value={formData.times}
              onChange={(e) => handleInputChange('times', e.target.value)}
              placeholder="¿Cuánto tiempo toma realizarlo?"
              rows={4}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Ubicación
                </label>
              </div>
            </div>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-0 py-2 text-sm text-gray-500 border-none focus:outline-none focus:ring-0 appearance-none cursor-pointer"
            >
              <option value="">Agregar país</option>
              <option value="México">México</option>
              <option value="USA">USA</option>
            </select>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Requerimientos
                </label>
              </div>
            </div>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Agrega los requerimientos"
              rows={4}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Payments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Pagos
                </label>
              </div>
            </div>
            <textarea
              value={formData.payments}
              onChange={(e) => handleInputChange('payments', e.target.value)}
              placeholder="Indica si es pago único o en cuotas"
              rows={4}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Payment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Forma de Pago
                </label>
              </div>
            </div>
            <textarea
              value={formData.payment}
              onChange={(e) => handleInputChange('payment', e.target.value)}
              placeholder="Indica si es pago único o en cuotas"
              rows={4}
              maxLength={200}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.payment.length}/200
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Precio
                </label>
              </div>
            </div>

            {/* Radio buttons Fix/Variable */}
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pricingType === 'fix'}
                  onChange={() => handleInputChange('pricingType', 'fix')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Fijo</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pricingType === 'variable'}
                  onChange={() => handleInputChange('pricingType', 'variable')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Variable</span>
              </label>
            </div>

            <textarea
              value={formData.pricing}
              onChange={(e) => handleInputChange('pricing', e.target.value)}
              placeholder="Describe el desglose"
              rows={3}
              maxLength={200}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.pricing.length}/200
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Detalles
                </label>
              </div>
            </div>
            <textarea
              value={formData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              placeholder="Agrega detalles"
              rows={4}
              maxLength={600}
              className="w-full px-0 py-2 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.details.length}/600
            </div>
          </div>

        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => router.push('/cotizacion-estructurada')}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generar Cotización
          </button>
        </div>
      </div>
    </div>
  );
}
