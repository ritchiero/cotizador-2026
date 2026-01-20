import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { precio, formaPago, moneda } = await req.json();

    // Este agente NO usa AI, solo formatea datos
    const simbolo = moneda === "USD" ? "USD $" : "$";

    const contenido = `COSTOS:
  Inversión Total               : ${simbolo}${precio} ${moneda}
  Forma de Pago                 : ${formaPago}`;

    return NextResponse.json({ contenido });
  } catch (error: any) {
    console.error("Error en CostosAgent:", error);
    return NextResponse.json(
      { error: "Error al generar costos" },
      { status: 500 }
    );
  }
}
