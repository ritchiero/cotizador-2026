import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { descripcionServicio, nombreDestinatario, despachoInfo } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Genera ÚNICAMENTE un párrafo introductorio para una cotización legal.

DATOS:
Cliente: ${nombreDestinatario}
Despacho: ${despachoInfo.nombre}
Servicio: ${descripcionServicio}

INSTRUCCIONES CRÍTICAS:
1. NO incluyas el título "INTRODUCCIÓN:" ni similares
2. Un solo párrafo de 2-3 oraciones
3. Saludo formal + contexto del servicio + transición a detalles
4. Máximo 50 palabras
5. Tono profesional pero directo

EJEMPLO DE FORMATO:
Estimado ${nombreDestinatario}, reciba un cordial saludo. Por medio de la presente, ${despachoInfo.nombre} propone ${descripcionServicio} con alcance integral y seguridad jurídica. A continuación se detalla el servicio completo.

Genera el párrafo introductorio:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    let contenido = completion.choices[0].message.content || "";

    // Limpieza agresiva
    contenido = contenido.replace(/INTRODUCCIÓN:\s*/gi, "");
    contenido = contenido.replace(/Introducción:\s*/gi, "");
    contenido = contenido.replace(/SALUDO:\s*/gi, "");
    contenido = contenido.trim();

    return NextResponse.json({ contenido });
  } catch (error: any) {
    console.error("Error en IntroduccionAgent:", error);
    return NextResponse.json(
      { error: "Error al generar introducción" },
      { status: 500 }
    );
  }
}
