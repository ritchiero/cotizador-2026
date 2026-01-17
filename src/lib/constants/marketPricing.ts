// Rangos de precios de mercado para servicios legales con Flat Fee en México (2026)
// Basado en estándares del mercado legal mexicano

export interface PriceRange {
  min: number;
  promedio: number;
  max: number;
}

export const FLAT_FEE_RANGES: Record<string, PriceRange> = {
  // ============================================
  // PROPIEDAD INTELECTUAL
  // ============================================
  // Registro de marca: $3,126 (IMPI con IVA) + $2,000-4,000 honorarios = $5,000-7,000 total
  'registro_marca': { min: 5000, promedio: 6000, max: 8000 },
  'renovacion_marca': { min: 4000, promedio: 5500, max: 7000 },
  'busqueda_anterioridades': { min: 1500, promedio: 2500, max: 4000 },
  'oposicion_marca': { min: 8000, promedio: 12000, max: 18000 },

  // ============================================
  // CORPORATIVO Y MERCANTIL
  // ============================================
  // Constitución: Notaría (~$15k) + honorarios ($5k-10k) = $20k-25k total
  'constitucion_sociedad': { min: 15000, promedio: 20000, max: 30000 },
  'constitucion_sa': { min: 15000, promedio: 20000, max: 30000 },
  'constitucion_srl': { min: 12000, promedio: 18000, max: 25000 },
  'modificacion_estatutos': { min: 5000, promedio: 8000, max: 12000 },
  'disolucion_sociedad': { min: 10000, promedio: 15000, max: 25000 },
  'fusion_sociedades': { min: 20000, promedio: 35000, max: 60000 },
  'escision_sociedades': { min: 20000, promedio: 35000, max: 60000 },
  'aumento_capital': { min: 6000, promedio: 10000, max: 15000 },
  'reduccion_capital': { min: 6000, promedio: 10000, max: 15000 },

  // ============================================
  // CONTRATOS
  // ============================================
  'contrato_compraventa': { min: 3000, promedio: 5000, max: 8000 },
  'contrato_arrendamiento': { min: 2500, promedio: 4000, max: 6000 },
  'contrato_prestacion_servicios': { min: 3000, promedio: 5000, max: 8000 },
  'contrato_confidencialidad': { min: 2000, promedio: 3500, max: 5000 },
  'contrato_trabajo': { min: 1500, promedio: 3000, max: 5000 },
  'contrato_franquicia': { min: 12000, promedio: 20000, max: 35000 },
  'contrato_distribucion': { min: 8000, promedio: 15000, max: 25000 },
  'revision_contrato_simple': { min: 1500, promedio: 3000, max: 5000 },
  'revision_contrato_complejo': { min: 5000, promedio: 10000, max: 18000 },

  // ============================================
  // NOTARIAL
  // ============================================
  'poder_notarial': { min: 1500, promedio: 2500, max: 4000 },
  'testamento': { min: 2000, promedio: 3500, max: 6000 },
  'escritura_compraventa': { min: 5000, promedio: 8000, max: 12000 },

  // ============================================
  // LABORAL
  // ============================================
  'finiquito': { min: 1500, promedio: 2500, max: 4000 },
  'carta_terminacion': { min: 1000, promedio: 2000, max: 3500 },
  'reglamento_interior': { min: 5000, promedio: 8000, max: 15000 },

  // ============================================
  // FISCAL Y COMPLIANCE
  // ============================================
  'aviso_privacidad': { min: 2500, promedio: 4000, max: 6000 },
  'terminos_condiciones': { min: 3000, promedio: 5000, max: 8000 },
  'politicas_privacidad': { min: 2500, promedio: 4000, max: 6000 },

  // ============================================
  // DEFAULT (Servicios no categorizados)
  // ============================================
  'default': { min: 3000, promedio: 6000, max: 12000 }
};

// Palabras clave para detectar servicios con FLAT FEE
export const FLAT_FEE_KEYWORDS = [
  // Trámites administrativos
  'registro', 'inscripción', 'trámite', 'gestión',

  // Actos corporativos
  'constitución', 'modificación', 'disolución', 'fusión', 'escisión',
  'aumento de capital', 'reducción de capital',

  // Documentos estándar
  'elaboración de contrato', 'contrato de', 'carta de',
  'poder notarial', 'testamento', 'finiquito',

  // Búsquedas y revisiones simples
  'búsqueda de anterioridades', 'revisión de contrato simple',
  'búsqueda', 'renovación',

  // Políticas y documentos corporativos
  'aviso de privacidad', 'términos y condiciones', 'políticas de',
  'reglamento interior'
];

// Palabras clave para detectar servicios con TARIFA HORARIA
export const HOURLY_KEYWORDS = [
  // Litigios y procesos judiciales
  'litigio', 'demanda', 'juicio', 'proceso judicial',
  'defensa penal', 'defensa laboral', 'amparo',
  'recurso', 'apelación',

  // Representación judicial
  'representación judicial', 'representación ante',
  'comparecencia',

  // Asesorías y consultorías
  'asesoría', 'asesoría legal', 'consultoría',
  'consultoría legal', 'asesoría corporativa',
  'asesoría continua',

  // Negociaciones
  'negociación', 'mediación', 'conciliación',
  'arbitraje',

  // Análisis complejos
  'due diligence', 'análisis de riesgo',
  'investigación legal', 'auditoría legal',

  // Servicios continuos
  'outsourcing legal', 'servicios continuos',
  'retainer'
];

// Función helper para normalizar nombre de servicio a clave
export function normalizeServiceKey(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Función para buscar el rango más apropiado
export function findBestFlatFeeRange(nombre: string, descripcion: string): PriceRange {
  const textoCompleto = `${nombre} ${descripcion}`.toLowerCase();

  // Buscar coincidencias exactas primero
  for (const [key, range] of Object.entries(FLAT_FEE_RANGES)) {
    if (key === 'default') continue;

    const keyWords = key.split('_');
    const allWordsMatch = keyWords.every(word => textoCompleto.includes(word));

    if (allWordsMatch) {
      return range;
    }
  }

  // Buscar coincidencias parciales
  for (const [key, range] of Object.entries(FLAT_FEE_RANGES)) {
    if (key === 'default') continue;

    if (textoCompleto.includes(key.replace(/_/g, ' '))) {
      return range;
    }
  }

  // Retornar default si no encuentra coincidencia
  return FLAT_FEE_RANGES.default;
}

// Función para detectar si es flat fee o hourly basado en keywords
export function detectPricingModelByKeywords(nombre: string, descripcion: string): 'FLAT_FEE' | 'HOURLY' | 'UNCLEAR' {
  const textoCompleto = `${nombre} ${descripcion}`.toLowerCase();

  const flatFeeMatches = FLAT_FEE_KEYWORDS.filter(keyword =>
    textoCompleto.includes(keyword.toLowerCase())
  ).length;

  const hourlyMatches = HOURLY_KEYWORDS.filter(keyword =>
    textoCompleto.includes(keyword.toLowerCase())
  ).length;

  if (flatFeeMatches > hourlyMatches && flatFeeMatches >= 1) {
    return 'FLAT_FEE';
  }

  if (hourlyMatches > flatFeeMatches && hourlyMatches >= 1) {
    return 'HOURLY';
  }

  return 'UNCLEAR';
}
