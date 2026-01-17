import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FLAT_FEE_RANGES, findBestFlatFeeRange, detectPricingModelByKeywords } from '@/lib/constants/marketPricing';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

if (!OPENAI_API_KEY || !PERPLEXITY_API_KEY) {
  throw new Error('API keys not configured');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface PricingSuggestionRequest {
  nombre: string;
  descripcion: string;
  detalles: string;
  tiempo?: string;
  incluye: string[];
  userId: string;
}

interface PricingSuggestionResponse {
  modeloCobro: 'FLAT_FEE' | 'HOURLY' | 'MIXTO';
  rangoSugerido: {
    minimo: number;
    promedio: number;
    maximo: number;
  };
  complejidad: 'bajo' | 'medio' | 'alto';
  horasEstimadas: {
    minimo: number;
    maximo: number;
  };
  tarifaHorariaUsada: number;
  justificacion: string;
  factoresAnalizados: string[];
  confianza: number;
}

interface ComplejidadAnalisis {
  complejidad: 'bajo' | 'medio' | 'alto';
  horasEstimadas: {
    minimo: number;
    maximo: number;
  };
  factoresAnalizados: string[];
  justificacion: string;
  confianza: number;
}

interface PreciosMercado {
  rangoPrecio: {
    minimo: number;
    promedio: number;
    maximo: number;
  };
  desglose?: {
    cuotasOficiales?: string;
    honorarios?: string;
  };
  fuentes?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PricingSuggestionRequest = await request.json();

    // Validaciones
    if (!body.nombre || !body.descripcion || !body.detalles || !body.userId) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, descripcion, detalles, userId' },
        { status: 400 }
      );
    }

    // PASO 1: Detectar modelo de cobro con IA
    const modeloDetectado = await detectPricingModel(body.nombre, body.descripcion);

    // PASO 2: Analizar complejidad y estimar horas
    const analisisComplejidad = await analyzeComplexity(body);

    // PASO 3: Obtener tarifa horaria del usuario
    const tarifaHoraria = await getUserHourlyRate(body.userId);

    // PASO 3.5: Si es flat fee, consultar precios reales con Perplexity
    let preciosMercado = null;
    if (modeloDetectado === 'FLAT_FEE') {
      preciosMercado = await getMarketPricingFromPerplexity(body.nombre, body.descripcion);
    }

    // PASO 4: Calcular rango de precio según el modelo
    const pricingSuggestion = calculatePricingRange(
      modeloDetectado,
      analisisComplejidad,
      tarifaHoraria,
      body,
      preciosMercado
    );

    return NextResponse.json(pricingSuggestion);

  } catch (error: any) {
    console.error('Error en suggest-pricing:', error);
    return NextResponse.json(
      { error: 'Error al generar sugerencia de precio', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// FUNCIÓN 1: Detectar modelo de cobro con IA
// ============================================
async function detectPricingModel(nombre: string, descripcion: string): Promise<'FLAT_FEE' | 'HOURLY' | 'MIXTO'> {
  // Primero intentar con keywords (más rápido)
  const keywordDetection = detectPricingModelByKeywords(nombre, descripcion);

  if (keywordDetection !== 'UNCLEAR') {
    return keywordDetection;
  }

  // Si no es claro, usar IA para clasificar
  const prompt = `Clasifica este servicio legal mexicano según su modelo de cobro típico:

SERVICIO:
Nombre: ${nombre}
Descripción: ${descripcion}

MODELOS DE COBRO:

1. FLAT_FEE (Tarifa Fija):
   - Servicios con precio de mercado estándar
   - Ejemplos: registro de marca, constitución de sociedad, elaboración de contrato simple, poder notarial, trámites administrativos
   - El precio no varía significativamente entre clientes
   - Alcance bien definido y predecible

2. HOURLY (Por Hora):
   - Servicios que varían según tiempo y complejidad del caso
   - Ejemplos: litigios, asesoría continua, negociaciones, due diligence, defensa judicial
   - El precio depende del tiempo invertido
   - Alcance variable o indefinido

3. MIXTO:
   - Combinación de ambos (ej: retainer inicial + tarifa por hora)
   - Casos complejos con componente fijo y variable

Responde ÚNICAMENTE con un JSON válido:
{
  "modelo": "FLAT_FEE" | "HOURLY" | "MIXTO",
  "razon": "Breve explicación de 1 línea"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en modelos de pricing de servicios legales en México. Clasifica servicios según su modelo de cobro típico. Responde solo con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return 'FLAT_FEE'; // Default fallback
    }

    const result = JSON.parse(content);
    return result.modelo || 'FLAT_FEE';

  } catch (error) {
    console.error('Error detectando modelo de cobro:', error);
    return 'FLAT_FEE'; // Fallback
  }
}

// ============================================
// FUNCIÓN 2: Analizar complejidad del servicio
// ============================================
async function analyzeComplexity(service: PricingSuggestionRequest): Promise<ComplejidadAnalisis> {
  const prompt = `Analiza la complejidad de este servicio legal mexicano:

SERVICIO:
- Nombre: ${service.nombre}
- Descripción: ${service.descripcion}
- Detalles: ${service.detalles}
- Tiempo estimado: ${service.tiempo || 'No especificado'}
- Incluye: ${service.incluye.filter(i => i.trim()).join(', ')}

CRITERIOS DE ANÁLISIS:

1. **Complejidad Legal**: Evalúa la dificultad técnica del trabajo legal
   - BAJO: Documentos estándar, trámites simples, procedimientos rutinarios
   - MEDIO: Análisis moderado, contratos semi-personalizados, negociaciones básicas
   - ALTO: Análisis profundo, litigios, contratos complejos, múltiples partes involucradas

2. **Horas Profesionales**: Estima cuántas horas de trabajo legal requiere
   - Considera: investigación, redacción, revisiones, reuniones con cliente, trámites
   - Da un rango realista (mínimo-máximo)
   - Sé conservador pero realista

3. **Factores Identificados**: Lista los aspectos que afectan complejidad/precio
   - Ejemplos: "Múltiples entregables", "Requiere investigación extensa", "Trámite ante autoridad", etc.

4. **Confianza**: Qué tan seguro estás del análisis (0-100)
   - 100 = Servicio muy claro y estándar
   - 50 = Requiere más información
   - 0 = Muy ambiguo

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO:
{
  "complejidad": "bajo" | "medio" | "alto",
  "horasEstimadas": {
    "minimo": número,
    "maximo": número
  },
  "factoresAnalizados": ["factor1", "factor2", ...],
  "justificacion": "Explicación breve de 2-3 líneas",
  "confianza": número (0-100)
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'Eres un abogado senior especializado en valuación de servicios legales en México. Analiza servicios y determina su complejidad y esfuerzo requerido con precisión. Responde únicamente con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió análisis de complejidad');
    }

    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedContent);

  } catch (error) {
    console.error('Error analizando complejidad:', error);
    // Fallback conservador
    return {
      complejidad: 'medio',
      horasEstimadas: { minimo: 5, maximo: 15 },
      factoresAnalizados: ['Análisis no disponible'],
      justificacion: 'No se pudo analizar la complejidad. Usando valores promedio.',
      confianza: 30
    };
  }
}

// ============================================
// FUNCIÓN 3: Obtener tarifa horaria del usuario
// ============================================
async function getUserHourlyRate(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const tarifa = data.tarifaHoraria || 0;

      if (tarifa > 0) {
        return tarifa;
      }
    }

    // Default si no tiene configurada
    return 1500; // Tarifa promedio de mercado en México

  } catch (error) {
    console.error('Error obteniendo tarifa del usuario:', error);
    return 1500; // Fallback
  }
}

// ============================================
// FUNCIÓN 3.5: Consultar precios reales con Perplexity
// ============================================
async function getMarketPricingFromPerplexity(nombre: string, descripcion: string): Promise<PreciosMercado | null> {
  const prompt = `Necesito conocer el COSTO REAL y ACTUAL (2026) en el mercado legal mexicano para este servicio:

SERVICIO: ${nombre}
DESCRIPCIÓN: ${descripcion}

IMPORTANTE - Busca información ESPECÍFICA de:
1. Cuotas/derechos OFICIALES ante autoridades (IMPI, SAT, Registros Públicos, etc.) con IVA incluido
2. Honorarios TÍPICOS de abogados/despachos en México (no los más caros, sino el rango común)
3. Costo TOTAL que pagaría un cliente (oficial + profesional)

CONTEXTO:
- Para "registro de marca": La cuota IMPI es ~$3,126 MXN con IVA por clase, y honorarios profesionales típicos son $2,000-4,000 MXN adicionales
- Para "constitución de sociedad": Gastos notariales ~$12,000-18,000 + honorarios de asesoría $5,000-10,000
- Busca datos de 2025-2026, no históricos

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO (sin markdown):
{
  "rangoPrecio": {
    "minimo": número_sin_comas,
    "promedio": número_sin_comas,
    "maximo": número_sin_comas
  },
  "desglose": {
    "cuotasOficiales": "Descripción exacta de cuotas/derechos con monto",
    "honorarios": "Rango típico de honorarios profesionales"
  },
  "fuentes": ["Fuente oficial 1", "Fuente verificable 2"]
}`;


  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    // Limpiar markdown y parsear JSON
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanContent);

  } catch (error) {
    console.error('Error consultando Perplexity:', error);
    return null; // Fallback: usar precios hardcodeados
  }
}

// ============================================
// FUNCIÓN 4: Calcular rango de precio
// ============================================
function calculatePricingRange(
  modeloCobro: 'FLAT_FEE' | 'HOURLY' | 'MIXTO',
  complejidad: ComplejidadAnalisis,
  tarifaHoraria: number,
  service: PricingSuggestionRequest,
  preciosMercado: PreciosMercado | null = null
): PricingSuggestionResponse {

  let rangoSugerido = { minimo: 0, promedio: 0, maximo: 0 };
  let justificacionExtra = '';

  if (modeloCobro === 'FLAT_FEE') {
    // Priorizar datos de Perplexity si están disponibles
    if (preciosMercado?.rangoPrecio) {
      rangoSugerido = {
        minimo: preciosMercado.rangoPrecio.minimo,
        promedio: preciosMercado.rangoPrecio.promedio,
        maximo: preciosMercado.rangoPrecio.maximo
      };

      const desglose = preciosMercado.desglose || {};
      justificacionExtra = `Precio de mercado actual en México (2026). ${desglose.cuotasOficiales ? 'Incluye: ' + desglose.cuotasOficiales + '. ' : ''}${desglose.honorarios ? 'Honorarios típicos: ' + desglose.honorarios + '. ' : ''}${complejidad.justificacion}`;
    } else {
      // Fallback: usar rangos predefinidos
      const rangoMercado = findBestFlatFeeRange(service.nombre, service.descripcion);

      rangoSugerido = {
        minimo: rangoMercado.min,
        promedio: rangoMercado.promedio,
        maximo: rangoMercado.max
      };

      justificacionExtra = `Precio de mercado estimado (datos de referencia). ${complejidad.justificacion} Para precios más precisos, consulta fuentes oficiales actualizadas.`;
    }

  } else if (modeloCobro === 'HOURLY') {
    // Calcular con tarifa horaria del usuario
    const horas = complejidad.horasEstimadas;

    rangoSugerido = {
      minimo: Math.round((horas.minimo * tarifaHoraria) / 1000) * 1000,
      maximo: Math.round((horas.maximo * tarifaHoraria) / 1000) * 1000,
      promedio: 0 // Se calculará después
    };

    rangoSugerido.promedio = Math.round((rangoSugerido.minimo + rangoSugerido.maximo) / 2000) * 1000;

    const esTarifaDefault = tarifaHoraria === 1500;
    justificacionExtra = esTarifaDefault
      ? `Calculado con tarifa promedio de mercado ($1,500/hr). ${complejidad.justificacion} Configura tu tarifa personal en Settings → Perfil para cálculos más precisos.`
      : `Calculado con tu tarifa horaria personal (${tarifaHoraria.toLocaleString('es-MX')} MXN/hr). ${complejidad.justificacion}`;

  } else {
    // MIXTO: Combinar ambos enfoques
    const rangoMercado = findBestFlatFeeRange(service.nombre, service.descripcion);
    const horas = complejidad.horasEstimadas;
    const horasPromedio = (horas.minimo + horas.maximo) / 2;
    const precioHorario = Math.round(horasPromedio * tarifaHoraria / 1000) * 1000;

    rangoSugerido = {
      minimo: Math.min(rangoMercado.min, precioHorario * 0.8),
      maximo: Math.max(rangoMercado.max, precioHorario * 1.2),
      promedio: Math.round((rangoMercado.promedio + precioHorario) / 2000) * 1000
    };

    justificacionExtra = `Este servicio puede cobrarse con modelo mixto. ${complejidad.justificacion}`;
  }

  return {
    modeloCobro,
    rangoSugerido,
    complejidad: complejidad.complejidad,
    horasEstimadas: complejidad.horasEstimadas,
    tarifaHorariaUsada: tarifaHoraria,
    justificacion: justificacionExtra,
    factoresAnalizados: complejidad.factoresAnalizados || [],
    confianza: complejidad.confianza || 70
  };
}
