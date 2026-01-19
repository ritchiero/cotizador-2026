import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Mover las constantes a variables de entorno
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';


const openAIPrompt = `Eres un experto en servicios legales en México. Tu tarea es reformular preguntas sobre costos de servicios legales para obtener respuestas más completas y precisas.

La pregunta reformulada debe:
1. Especificar que es para el mercado mexicano
2. Solicitar rangos de precios específicos
3. Pedir información sobre costos adicionales (derechos, impuestos, etc.)
4. Incluir factores que pueden afectar el precio
5. Mantener un tono profesional y técnico

Ejemplo:
Usuario: "Cuanto cobran los abogados por registrar una marca"
Respuesta: "Necesito saber en el mercado mexicano, cuáles son los rangos de precios en materia de honorarios que cobra un abogado especialista en la materia de propiedad intelectual por sus servicios de registro de marca. Dame mínimos y máximos de mercado, y potenciales costos como derechos o pagos no relacionados a honorarios. Incluye también factores que pueden afectar el precio final."

Reformula la siguiente pregunta siguiendo estos criterios:`;

const perplexitySystemPrompt = `Eres un analista experto en el mercado legal mexicano con acceso a datos actualizados de 2025-2026.

INSTRUCCIONES CRÍTICAS:
1. BUSCA DATOS REALES Y VERIFICABLES de fuentes oficiales (IMPI, DOF, sitios gubernamentales)
2. Si NO encuentras información verificable, escribe "No especificado" en rangos
3. SEPARA claramente: Derechos Gubernamentales vs Honorarios Profesionales
4. CITA las fuentes exactas con URLs reales
5. USA datos de 2025-2026, NO históricos

EJEMPLOS DE DATOS REALES:
- Registro de marca IMPI: ~$3,126 MXN por clase (tarifa oficial 2025)
- Honorarios profesionales registro marca: $2,000-$8,000 MXN
- Constitución de S.A.: Notario $15,000-$25,000 MXN + asesoría $8,000-$15,000 MXN

IMPORTANTE: Si no encuentras datos verificables del servicio específico, NO INVENTES números.
Prefiere decir "No especificado" a dar información falsa.

Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido:

{
  "rangosHonorarios": {
    "minimo": "Monto en MXN o 'No especificado'",
    "promedio": "Monto en MXN o 'No especificado'",
    "maximo": "Monto en MXN o 'No especificado'"
  },
  "costosGubernamentales": [
    {
      "concepto": "Nombre exacto del derecho/trámite oficial",
      "monto": "Monto REAL con IVA si aplica",
      "fuente": {
        "nombre": "Nombre de la institución oficial (IMPI, SAT, etc)",
        "url": "URL real de la fuente",
        "fechaActualizacion": "Mes y año de la tarifa"
      }
    }
  ],
  "factores": ["Factor 1", "Factor 2", "Factor 3", "Factor 4", "Factor 5"],
  "fuentesOficiales": [
    {
      "nombre": "Nombre de fuente oficial",
      "url": "URL verificable",
      "descripcion": "Breve descripción"
    }
  ],
  "analisisDetallado": "Texto breve (max 500 chars, sin comillas dobles)"
}`;

const perplexitySystemPromptTiposCobro = `Eres un experto en servicios legales en México con acceso a información actualizada.

INSTRUCCIONES:
1. Identifica los modelos de cobro MÁS COMUNES en el mercado real mexicano para este servicio
2. Basate en prácticas REALES de despachos jurídicos en México
3. Si no hay información suficiente, limita tu respuesta a lo que SÍ sabes
4. NO inventes tipos de cobro que no existen en la práctica

EJEMPLOS REALES:
- Registro de marca: "Tarifa fija" (común), "Por clase adicional" (común)
- Litigio: "Por hora" (común), "Cuota de éxito" (ocasional)
- Constitución sociedad: "Paquete todo incluido" (común), "Por trámite" (ocasional)

Responde ÚNICAMENTE con JSON válido:

{
  "tiposCobro": [
    {
      "nombre": "Nombre del modelo de cobro",
      "descripcion": "Qué incluye (max 80 chars, sin comillas dobles)",
      "rangoPrecios": "Rango real en MXN",
      "frecuencia": "común"
    }
  ]
}

Frecuencia: "común", "ocasional" o "raro"
Máximo 4 tipos de cobro`;

// Add this helper function before the POST handler
function cleanJsonResponse(text: string): string {
  // Remove markdown code block syntax if present
  let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

  // Remove any text before the first {
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace);
  }

  // Remove any text after the last }
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace > -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBrace + 1);
  }

  return cleaned;
}

export async function POST(request: Request) {
  try {
    
    // Verificar método
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Método no permitido', details: `Se esperaba POST, se recibió ${request.method}` },
        { status: 405 }
      );
    }

    // Verificar body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al procesar el body', details: 'El body debe ser un JSON válido' },
        { status: 400 }
      );
    }
    
    
    const { query } = body;
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query inválida', details: 'La query es requerida y debe ser un string' },
        { status: 400 }
      );
    }

    // Llamada a OpenAI
    let openAIResponse;
    try {
      openAIResponse = await openai.chat.completions.create({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: openAIPrompt },
          { role: "user", content: query }
        ]
      });
    } catch (error) {
      console.error('Error en llamada a OpenAI:', error);
      return NextResponse.json(
        { error: 'Error al comunicarse con OpenAI', details: error instanceof Error ? error.message : 'Error desconocido' },
        { status: 500 }
      );
    }

    const refinedQuery = openAIResponse.choices[0].message.content;

    // Hacer las dos llamadas a Perplexity en paralelo
    let analisisGeneral, tiposCobro;
    try {
      const [analisisResponse, tiposCobroResponse] = await Promise.all([
        // Primera llamada para el análisis general
        fetch(PERPLEXITY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              { role: 'system', content: perplexitySystemPrompt },
              { role: 'user', content: refinedQuery }
            ],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        }),

        // Segunda llamada específica para tipos de cobro
        fetch(PERPLEXITY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              { role: 'system', content: perplexitySystemPromptTiposCobro },
              { role: 'user', content: `Analiza los tipos de cobro para: ${query}` }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        })
      ]);

      // Verificar si las respuestas son exitosas
      if (!analisisResponse.ok || !tiposCobroResponse.ok) {
        const analisisError = await analisisResponse.text();
        const tiposCobroError = await tiposCobroResponse.text();
        console.error('Error en respuestas de Perplexity:', { analisisError, tiposCobroError });
        return NextResponse.json(
          { 
            error: 'Error en las respuestas de Perplexity API',
            details: {
              analisisError,
              tiposCobroError
            }
          },
          { status: 500 }
        );
      }

      // Parsear las respuestas JSON
      analisisGeneral = await analisisResponse.json();
      tiposCobro = await tiposCobroResponse.json();

    } catch (error) {
      console.error('Error en las llamadas a Perplexity:', error);
      return NextResponse.json(
        { error: 'Error al comunicarse con Perplexity API', details: error instanceof Error ? error.message : 'Error desconocido' },
        { status: 500 }
      );
    }

    // Verificar si las respuestas tienen el formato esperado
    if (!analisisGeneral?.choices?.[0]?.message?.content || !tiposCobro?.choices?.[0]?.message?.content) {
      console.error('Respuestas incompletas:', { analisisGeneral, tiposCobro });
      return NextResponse.json(
        { error: 'Respuestas incompletas de Perplexity API', details: 'Falta contenido en las respuestas' },
        { status: 500 }
      );
    }


    let analisisResponse, tiposCobroResponse;
    try {
      // Clean the responses before parsing
      const rawAnalisis = analisisGeneral.choices[0].message.content;
      const rawTiposCobro = tiposCobro.choices[0].message.content;

      const cleanAnalisisText = cleanJsonResponse(rawAnalisis);
      const cleanTiposCobroText = cleanJsonResponse(rawTiposCobro);

      console.log('Attempting to parse analisis JSON...');
      try {
        analisisResponse = JSON.parse(cleanAnalisisText);
      } catch (err) {
        console.error('Error parsing analisis JSON:', err);
        console.error('Cleaned analisis text:', cleanAnalisisText.substring(0, 500));
        throw new Error(`Error al parsear análisis: ${err instanceof Error ? err.message : 'JSON inválido'}`);
      }

      console.log('Attempting to parse tipos cobro JSON...');
      try {
        tiposCobroResponse = JSON.parse(cleanTiposCobroText);
      } catch (err) {
        console.error('Error parsing tipos cobro JSON:', err);
        console.error('Cleaned tipos cobro text:', cleanTiposCobroText.substring(0, 500));
        throw new Error(`Error al parsear tipos de cobro: ${err instanceof Error ? err.message : 'JSON inválido'}`);
      }

    } catch (parseError) {
      console.error('Error parseando respuestas:', parseError);
      return NextResponse.json(
        {
          error: 'La IA generó una respuesta con formato inválido',
          details: parseError instanceof Error ? parseError.message : 'Error al parsear JSON',
          suggestion: 'Por favor intenta reformular tu consulta o inténtalo de nuevo'
        },
        { status: 500 }
      );
    }

    // Validar la estructura de la respuesta
    if (!analisisResponse.rangosHonorarios || 
        !Array.isArray(analisisResponse.costosGubernamentales) ||
        !Array.isArray(analisisResponse.factores)) {
      console.error('Estructura inválida en analisisResponse:', analisisResponse);
      return NextResponse.json(
        { error: 'Respuesta del análisis con estructura inválida', details: 'Faltan campos requeridos en la respuesta' },
        { status: 500 }
      );
    }

    if (!Array.isArray(tiposCobroResponse.tiposCobro)) {
      console.error('Estructura inválida en tiposCobroResponse:', tiposCobroResponse);
      return NextResponse.json(
        { error: 'Respuesta de tipos de cobro con estructura inválida', details: 'El campo tiposCobro debe ser un array' },
        { status: 500 }
      );
    }

    // Formatear la respuesta final con valores por defecto
    const formattedResponse = {
      refinedQuery,
      tiposCobro: tiposCobroResponse.tiposCobro || [],
      rangosHonorarios: {
        minimo: analisisResponse.rangosHonorarios.minimo || 'No especificado',
        promedio: analisisResponse.rangosHonorarios.promedio || 'No especificado',
        maximo: analisisResponse.rangosHonorarios.maximo || 'No especificado'
      },
      costosGubernamentales: analisisResponse.costosGubernamentales || [],
      factores: analisisResponse.factores || [],
      fuentesOficiales: analisisResponse.fuentesOficiales || [],
      html: analisisResponse.analisisDetallado || 'No se pudo generar el análisis detallado'
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Error procesando respuestas:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 