import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }

    const openai = new OpenAI({
      apiKey
    });

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un prompt' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'Eres un abogado corporativo senior con más de 15 años de experiencia en servicios legales en México. Tu especialidad es diseñar paquetes de servicios legales claros, profesionales y competitivos para despachos jurídicos. Debes responder SOLO en formato JSON válido, sin texto adicional ni markdown.'
        },
        {
          role: 'user',
          content: `Crea un servicio legal profesional basado en: "${prompt}"

INSTRUCCIONES DETALLADAS:

1. **nombre**: Título corto, profesional y específico (máximo 6 palabras). Debe ser claro y marketeable.
   Ejemplos: "Constitución de Sociedades Anónimas", "Registro de Marca ante IMPI"

2. **descripcion**: Descripción ejecutiva en 1-2 líneas (máximo 150 caracteres). Debe captar el valor principal del servicio de forma persuasiva.

3. **detalles**: Descripción completa en 3 párrafos bien estructurados:
   - Párrafo 1: Qué es el servicio y por qué es importante para el cliente
   - Párrafo 2: Cómo se ejecuta el servicio (proceso general)
   - Párrafo 3: Beneficios específicos y resultados esperados

4. **tiempo**: Estimación realista en formato natural. Ejemplos: "2-3 semanas", "5-7 días hábiles", "1-2 meses"

5. **precio**: Precio competitivo en formato MXN sin símbolo de peso. Ejemplos: "$15,000.00", "$8,500.00", "$25,000.00"
   Considera precios de mercado para servicios legales en México.

6. **incluye**: Array de 5-7 entregables que describen el TRABAJO LEGAL y ASESORÍA que el despacho realizará para el cliente.

   QUÉ INCLUIR:
   - Cada ítem describe una ACCIÓN LEGAL o ASESORÍA JURÍDICA específica (máximo 50 caracteres)
   - Enfócate en el servicio profesional que el abogado proveerá al cliente
   - Usa verbos que reflejen el trabajo intelectual y legal: "Elaboración de...", "Análisis jurídico de...", "Asesoría sobre...", "Representación en...", "Trámite ante..."
   - Los entregables son los productos del trabajo legal (contratos, dictámenes, opiniones jurídicas, gestiones ante autoridades)
   - Específico al marco legal mexicano (instituciones como IMPI, SAT, Notarios, Registros Públicos)

   EJEMPLOS DE ENTREGABLES PROFESIONALES:
   "Elaboración de contrato de compraventa"
   "Análisis jurídico de estatutos sociales"
   "Asesoría sobre estructura corporativa óptima"
   "Representación ante el IMPI para registro"
   "Dictamen legal sobre viabilidad del proyecto"
   "Gestión notarial de acta constitutiva"

   Los clientes valoran entender QUÉ TRABAJO LEGAL recibirán, no el formato digital del documento final. Piensa como un abogado describiendo su trabajo profesional a un cliente.

RESPONDE ÚNICAMENTE CON ESTE JSON:
{
  "nombre": "string",
  "descripcion": "string",
  "detalles": "string",
  "tiempo": "string",
  "precio": "string",
  "incluye": ["string", "string", "string", "string", "string"]
}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;

    return new Response(
      content,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error en OpenAI:', error);
    
    let errorMessage = 'Error al procesar la solicitud';
    if (error.code === 'invalid_api_key') {
      errorMessage = 'Error de autenticación con OpenAI';
    } else if (error.code === 'insufficient_quota') {
      errorMessage = 'Cuota de API excedida';
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.message
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
