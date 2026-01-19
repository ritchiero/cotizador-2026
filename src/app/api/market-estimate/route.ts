import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY || !PERPLEXITY_API_KEY) {
  throw new Error('API keys not configured');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query inválida' },
        { status: 400 }
      );
    }

    // PASO 1: Refinar query con OpenAI
    const refinedQueryResponse = await openai.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
      messages: [{
        role: "system",
        content: "Reformula la pregunta sobre servicios legales para ser más específica y técnica. Menciona que es para el mercado mexicano y que buscas rangos de precios reales."
      }, {
        role: "user",
        content: query
      }]
    });

    const refinedQuery = refinedQueryResponse.choices[0].message.content || query;

    // PASO 2: Perplexity busca información REAL (devuelve texto con citas)
    const perplexityPrompt = `Busca información REAL y VERIFICABLE sobre precios de este servicio legal en México:

${refinedQuery}

INSTRUCCIONES:

1. **Identifica QUÉ tipo de servicio es**:
   - Propiedad Intelectual (marcas, patentes) → Busca IMPI
   - Trámites fiscales (RFC, impuestos) → Busca SAT
   - Notariales (poderes, escrituras) → Busca tarifas de notarios
   - Corporativo (sociedades, contratos) → Busca Registros Públicos
   - Litigios/asesoría general → NO hay tarifas gubernamentales, solo honorarios

2. **Busca SOLO tarifas oficiales RELEVANTES al servicio**:
   - Si es marca/patente → Busca "Ley Federal de Derechos IMPI 2025 [servicio específico]"
   - Si es notarial → Busca "arancel notarial [estado] 2025"
   - Si NO hay trámite oficial → Omite sección de costos gubernamentales

3. **Busca honorarios profesionales**:
   - Sitios de despachos jurídicos con precios publicados
   - Marketplaces: 99abogados.com, Legalzone.mx
   - Foros donde abogados publican sus tarifas
   - CITA el nombre del despacho y cuánto cobra

4. **Formato de Respuesta**:
   - SOLO menciona instituciones gubernamentales SI el servicio requiere trámite ante ellas
   - Para cada precio: nombre del despacho/institución + monto + URL
   - Si no hay costos gubernamentales aplicables, NO los inventes

EJEMPLO PARA "REGISTRO DE MARCA":
✅ "Tarifa oficial IMPI: $2,695 + IVA por clase (Ley Federal de Derechos 2025). Honorarios: Despacho García cobra $6,000, en 99abogados.com el rango es $4,000-$8,000."

EJEMPLO PARA "ASESORÍA LABORAL":
✅ "No aplican costos gubernamentales. Honorarios profesionales: $1,500-$3,000/hora según experiencia. Despacho López cobra $2,000/hr."

❌ NO hagas esto: Mencionar IMPI para todo aunque no sea relevante`;

    const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: perplexityPrompt }],
        max_tokens: 4000
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error('Error en Perplexity API');
    }

    const perplexityData = await perplexityResponse.json();
    const perplexityText = perplexityData.choices?.[0]?.message?.content || '';

    // PASO 3: GPT extrae y estructura la información del texto de Perplexity
    const structuringPrompt = `Analiza el siguiente texto sobre precios de servicios legales en México y extrae la información en formato JSON estructurado.

TEXTO A ANALIZAR:
${perplexityText}

INSTRUCCIONES CRÍTICAS:

1. **Rangos de Honorarios**:
   - Extrae SOLO honorarios profesionales (lo que cobran abogados/despachos)
   - NO incluyas derechos gubernamentales aquí
   - Si el texto dice "$0" o "gratuito", IGNÓRALO para honorarios profesionales
   - Mínimo razonable para servicios legales: mínimo $1,000 MXN
   - Si no hay datos: usa rangos aproximados ($3,000 - $15,000 para servicios estándar)

2. **Costos Gubernamentales**:
   - Solo derechos/trámites oficiales (IMPI, SAT, Notarios, Registros)
   - Separado completamente de honorarios

3. **Validación de Montos**:
   - Si un monto parece irrazonable (ej: $0, $50,000,000), ajústalo a rangos sensatos
   - Servicios simples: $1,000-$8,000 MXN
   - Servicios especializados: $5,000-$25,000 MXN
   - Litigios/casos complejos: $15,000-$50,000+ MXN

4. **Fuentes**: Extrae URLs mencionadas en el texto

Responde ÚNICAMENTE con JSON válido (sin markdown):
{
  "rangosHonorarios": {
    "minimo": "$X,XXX MXN",
    "promedio": "$X,XXX MXN",
    "maximo": "$X,XXX MXN"
  },
  "costosGubernamentales": [
    {
      "concepto": "Nombre del derecho oficial",
      "monto": "$X,XXX MXN",
      "fuente": {
        "nombre": "Institución",
        "url": "URL real",
        "fechaActualizacion": "2026"
      }
    }
  ],
  "tiposCobro": [
    {
      "nombre": "Modelo de cobro",
      "descripcion": "Qué incluye",
      "rangoPrecios": "$X,XXX-$Y,YYY MXN",
      "frecuencia": "común"
    }
  ],
  "factores": ["Factor 1", "Factor 2", "Factor 3"],
  "fuentesOficiales": [
    {
      "nombre": "Nombre fuente",
      "url": "URL",
      "descripcion": "Qué info tiene"
    }
  ],
  "analisisDetallado": "Resumen breve"
}`;

    const structuredResponse = await openai.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
      messages: [{
        role: "system",
        content: "Eres un experto en extraer y estructurar información de textos sobre servicios legales. Genera JSON válido sin comillas dobles dentro de strings."
      }, {
        role: "user",
        content: structuringPrompt
      }],
      response_format: { type: 'json_object' }
    });

    const structuredContent = structuredResponse.choices[0]?.message?.content;
    if (!structuredContent) {
      throw new Error('No se pudo estructurar la información');
    }

    const result = JSON.parse(structuredContent);

    return NextResponse.json({
      refinedQuery,
      ...result
    });

  } catch (error) {
    console.error('Error en market-estimate:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estimación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
