import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { userInfo, destinatario, despachoInfo, fecha } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Genera ÚNICAMENTE el encabezado de una cotización legal profesional.

DATOS:
Fecha: ${fecha}
Ciudad: Ciudad de México

Destinatario:
- Nombre: ${destinatario.nombre}
- Empresa: ${destinatario.empresa || ""}

Contacto del Abogado:
- Despacho: ${despachoInfo.nombre}
- Nombre: ${userInfo.displayName}
- Email: ${userInfo.email || ""}
- Teléfono: ${userInfo.telefono || ""}
- Cargo: ${userInfo.cargo || ""}

INSTRUCCIONES:
1. Formato limpio sin títulos como "ENCABEZADO:" o similares
2. Incluye: Ciudad, Fecha, Destinatario, Contacto
3. Si el email o teléfono no están disponibles, omite esas líneas (NO pongas "No proporcionado")
4. Máximo 8 líneas
5. Formato profesional pero conciso

EJEMPLO DE FORMATO ESPERADO:
Ciudad de México
19 de enero de 2026

Destinatario:
Juan Pérez
Empresa ABC

Contacto:
${despachoInfo.nombre}
${userInfo.displayName}${userInfo.cargo ? ` - ${userInfo.cargo}` : ""}
${userInfo.email ? `Email: ${userInfo.email}` : ""}
${userInfo.telefono ? `Tel: ${userInfo.telefono}` : ""}

Genera el encabezado con los datos proporcionados:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let contenido = completion.choices[0].message.content || "";

    // Limpieza de cualquier título innecesario
    contenido = contenido.replace(/ENCABEZADO:\s*/gi, "");
    contenido = contenido.trim();

    return NextResponse.json({ contenido });
  } catch (error: any) {
    console.error("Error en EncabezadoAgent:", error);
    return NextResponse.json(
      { error: "Error al generar encabezado" },
      { status: 500 }
    );
  }
}
