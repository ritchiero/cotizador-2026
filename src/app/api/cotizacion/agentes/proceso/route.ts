import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { tiempo, despachoInfo, descripcionServicio } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Genera ÚNICAMENTE la sección PROCESO de una cotización legal.

DATOS:
Tiempo estimado: ${tiempo}
Servicio: ${descripcionServicio}
Despacho: ${despachoInfo.nombre}

INSTRUCCIONES CRÍTICAS:
1. Título: "PROCESO:" (con dos puntos)
2. Estructura obligatoria:
   • Tiempo estimado: [${tiempo}]
   • Responsabilidades: [Despacho vs Cliente]
   • Comunicación y seguimiento: [Cómo se mantendrá informado]
   • Garantías y compromisos: [Qué se garantiza]

3. Usar bullets (•) para cada subsección
4. Máximo 150 palabras
5. Conciso y claro

EJEMPLO DE FORMATO:
PROCESO:
• Tiempo estimado
  • El servicio se realiza en un plazo aproximado de ${tiempo}, sujeto a tiempos de autoridades.

• Responsabilidades
  • ${despachoInfo.nombre}: elaboración de documentos, gestión, seguimiento.
  • Cliente: proporcionar información, firmar documentos, realizar pagos.

• Comunicación y seguimiento
  • Abogado responsable mantendrá comunicación periódica por email y llamadas.

• Garantías y compromisos
  • ${despachoInfo.nombre} se compromete a realizar las gestiones con diligencia y confidencialidad.

Genera la sección PROCESO:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let contenido = completion.choices[0].message.content || "";
    contenido = contenido.trim();

    return NextResponse.json({ contenido });
  } catch (error: any) {
    console.error("Error en ProcesoAgent:", error);
    return NextResponse.json(
      { error: "Error al generar proceso" },
      { status: 500 }
    );
  }
}
