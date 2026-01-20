import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { userInfo, despachoInfo } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Genera ÚNICAMENTE el cierre de una cotización legal.

DATOS:
Despacho: ${despachoInfo.nombre}
Slogan: ${despachoInfo.slogan || ""}
Firmante: ${userInfo.displayName}
Cargo: ${userInfo.cargo || "Representante Legal"}

INSTRUCCIONES CRÍTICAS:
1. NO incluyas el título "CIERRE:" ni similares
2. Estructura:
   - Vigencia de la cotización: 15 días naturales
   - Próximos pasos: 3 bullets numerados
   - Contacto para atención
   - Firma: Despacho + Nombre + Cargo + Slogan (si existe)

3. Máximo 100 palabras
4. Tono profesional y directo

EJEMPLO DE FORMATO:
Vigencia de la cotización: 15 días naturales a partir de la fecha indicada.

Próximos pasos:
1. Confirmación de aceptación por escrito.
2. Envío de documentación y programación de firma.
3. Pago conforme a la forma acordada para iniciar gestiones.

Contacto para atención:
${despachoInfo.nombre}
${userInfo.email ? `Email: ${userInfo.email}` : ""}
${userInfo.telefono ? `Tel: ${userInfo.telefono}` : ""}

Atentamente,

${despachoInfo.nombre}
${userInfo.displayName}
${userInfo.cargo || "Representante Legal"}

${despachoInfo.slogan || ""}

Genera el cierre con los datos proporcionados:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let contenido = completion.choices[0].message.content || "";

    // Limpieza agresiva
    contenido = contenido.replace(/CIERRE:\s*/gi, "");
    contenido = contenido.replace(/Cierre:\s*/gi, "");
    contenido = contenido.replace(/DESPEDIDA:\s*/gi, "");
    contenido = contenido.trim();

    return NextResponse.json({ contenido });
  } catch (error: any) {
    console.error("Error en CierreAgent:", error);
    return NextResponse.json(
      { error: "Error al generar cierre" },
      { status: 500 }
    );
  }
}
