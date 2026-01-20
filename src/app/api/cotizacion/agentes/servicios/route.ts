import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { servicios } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Construir descripción de servicios desde los datos guardados
    const serviciosTexto = servicios.map((s: any) => `
• ${s.nombre}
  Descripción: ${s.descripcion}
  Detalles: ${s.detalles}
  Incluye: ${s.incluye.join(", ")}
`).join("\n");

    const prompt = `Genera ÚNICAMENTE la sección SERVICIOS de una cotización legal.

SERVICIOS GUARDADOS:
${serviciosTexto}

INSTRUCCIONES CRÍTICAS:
1. Título: "SERVICIOS:" (con dos puntos)
2. Estructura:
   - Descripción general (1 párrafo corto)
   - Servicios incluidos y alcance detallado (usa los datos guardados, NO inventes)
   - Beneficios y resultados esperados (máximo 5 bullets)

3. USA EL CONTENIDO GUARDADO, no regeneres descripciones
4. Formato claro con bullets (•)
5. Máximo 200 palabras
6. NO incluyas precios aquí

EJEMPLO DE FORMATO:
SERVICIOS:
1. Descripción general
   • [párrafo breve del servicio]

2. Servicios incluidos y alcance detallado
   • ${servicios[0]?.nombre || "Servicio"}
     - ${servicios[0]?.descripcion || ""}
     - Incluye: ${servicios[0]?.incluye?.join(", ") || ""}

3. Beneficios y resultados esperados
   • Beneficio 1
   • Beneficio 2

Genera la sección SERVICIOS:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let contenido = completion.choices[0].message.content || "";
    contenido = contenido.trim();

    return NextResponse.json({ contenido });
  } catch (error: any) {
    console.error("Error en ServiciosAgent:", error);
    return NextResponse.json(
      { error: "Error al generar servicios" },
      { status: 500 }
    );
  }
}
