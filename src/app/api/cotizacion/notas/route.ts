import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const { descripcionServicio, context } = await req.json();

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `Actúa como un abogado experto. Redacta 5 opciones de "Notas Adicionales" para una cotización de servicios legales.
    
    Contexto del Servicio: ${descripcionServicio}
    Detalles Extra: ${context || 'N/A'}

    Las notas deben ser profesionales, claras y útiles para el cliente. Pueden incluir aclaraciones sobre tiempos, entregables, validez de la propuesta, exclusiones, etc.
    Cada nota debe ser un párrafo breve (1-2 oraciones).

    Responde ÚNICAMENTE con la lista de opciones separadas por una línea en blanco.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-5-nano-2025-08-07",
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content || "";
        // Split by newlines and filter empty
        const options = text
            .split("\n")
            .map((o) => o.replace(/^[-*\d\.\s]+/, "").trim())
            .filter((o) => o.length > 10) // Filter out too short lines
            .slice(0, 5);

        return NextResponse.json({ options });
    } catch (error: any) {
        console.error("Error al generar notas:", error);
        return NextResponse.json(
            { error: "Error al generar sugerencias" },
            { status: 500 },
        );
    }
}
