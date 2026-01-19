import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { descripcionServicio, jurisdiccion } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Analiza este servicio legal y genera 6 necesidades/motivaciones del cliente (3-4 palabras cada una).

Servicio: ${descripcionServicio}
Jurisdicción: ${jurisdiccion}

NO incluyas: precios, atención, relación cliente-abogado
SÍ incluye: motivos reales del cliente (crear negocio, evitar multa, obtener certeza legal, etc)

Responde con lista separada por saltos de línea, sin numeración.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
      messages: [{ role: "user", content: prompt }]
    });
    const text = completion.choices[0].message.content || "";
    const options = text
      .split("\n")
      .map((o) => o.replace(/^[-*\d\.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 6);

    return NextResponse.json({ options });
  } catch (error: any) {
    console.error("Error al generar necesidades:", error);
    return NextResponse.json(
      { error: "Error al generar sugerencias" },
      { status: 500 },
    );
  }
}
