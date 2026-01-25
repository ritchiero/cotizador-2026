import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Función para generar folio y fecha
const generarFolioYFecha = () => {
  const now = new Date();
  const fecha = new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now);

  const folio = `PS-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  return { fecha, folio };
};

// ====== SUB-AGENTE 1: ENCABEZADO PROFESIONAL ======
function generarEncabezado(userInfo: any, destinatario: any, despachoInfo: any, fecha: string, folio: string) {
  // Use Markdown horizontal rule instead of ASCII block
  const separador = "---";

  return `${despachoInfo.nombre.toUpperCase()}
${despachoInfo.slogan || ""}

${separador}

PROPUESTA DE SERVICIOS PROFESIONALES
${destinatario.empresa || "Servicios Legales"}

${separador}

Referencia:       ${folio}
Fecha:            ${fecha}
Preparado para:   ${destinatario.nombre}
Confidencial:     Este documento contiene información privilegiada

${separador}`;
}

// ====== HELPER: INSTRUCCIONES DE ESTILO ======
const getStyleInstructions = (style: string) => {
  const styles: Record<string, string> = {
    'silicon-valley': `ESTILO: SILICON VALLEY (Moderno, SaaS, Product-led).
      - Usa TABLAS para presentar precios y entregables.
      - Usa BULLET POINTS para listas.
      - Sé CONCISO y directo. Evita el "legalese" excesivo.
      - Enfócate en el VALOR y la VELOCIDAD.`,
    'ny-biglaw': `ESTILO: NY BIGLAW (Tradicional, Serio, "White Shoe").
      - NO USES TABLAS para descripciones, usa párrafos narrativos densos y justificados.
      - Lenguaje EXTREMADAMENTE FORMAL y AUTORITARIO.
      - Usa terminología legal precisa ("El Cliente", "La Firma").
      - Estructura conservadora y texto corrido.`,
    'spanish-boutique': `ESTILO: DESPACHO BOUTIQUE (Cercano, Profesional).
      - Equilibrio entre calidez y técnica.
      - Usa "Nosotros" y "Usted".
      - Estructura clara pero narrativa.`,
    'swiss-financial': `ESTILO: FINANCIAL GRADE (Técnico, Suizo).
      - Usa MUCHAS TABLAS y GRILLAS.
      - Datos numéricos precisos.
      - Lenguaje analítico, frío y objetivo.`,
    'luxury-boutique': `ESTILO: LUXURY BOUTIQUE (Exclusivo).
      - Lenguaje refinado y elegante.
      - Párrafos espaciados y estética cuidada en el texto.
      - Trato VIP ("Su excelencia", "Distinguido").`,
    'legal-ops': `ESTILO: LEGAL OPS (Eficiente).
      - Formato estructurado para fácil aprobación de Procurement.
      - KPIs y métricas claras.
      - Sin adornos innecesarios.`
  };
  return styles[style] || styles['silicon-valley'];
};

// ====== SUB-AGENTE 2: RESUMEN EJECUTIVO ======
async function generarResumenEjecutivo(descripcionServicio: string, despachoInfo: any, tiempo: string, toneType: 'friendly' | 'formal', styleInstructions: string) {
  const toneInstruction = toneType === 'friendly'
    ? "Usa lenguaje amigable, cercano y accesible."
    : "Usa lenguaje formal, técnico y profesional.";

  const prompt = `Genera un RESUMEN EJECUTIVO profesional.
${styleInstructions}

DATOS:
Despacho: ${despachoInfo.nombre}
Servicio: ${descripcionServicio}
Tiempo: ${tiempo}

INSTRUCCIONES:
1. Párrafo de introducción.
2. Descripción del valor propuesta.
3. Mencionar plazo (${tiempo}).
4. Tono: ${toneInstruction}
5. ADAPTA LA ESTRUCTURA AL ESTILO INDICADO ARRIBA (Si pide tablas, usa tablas markdown; si pide texto corrido, usa texto).

Genera el resumen:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 3: ALCANCE DE SERVICIOS ======
async function generarAlcanceServicios(servicios: any[], styleInstructions: string) {
  const serviciosTexto = servicios.map((s: any) => `${s.nombre}: ${s.descripcion}`).join("\n");

  const prompt = `Genera la sección "ALCANCE DE LOS SERVICIOS".
${styleInstructions}

SERVICIOS:
${serviciosTexto}

INSTRUCCIONES:
1. Título: "II. ALCANCE" (o el que corresponda al estilo).
2. Desarrolla las fases del servicio.
3. CRÍTICO: Sigue las instrucciones de estilo para el FORMATO (Tablas vs Texto Narrativo).
   - Si es SILICON VALLEY/FINANCIAL: ¡Usa Tablas Markdown para los entregables!
   - Si es BIGLAW/BOUTIQUE: ¡Usa párrafos narrativos elegantes!

Genera la sección completa:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 4: CRONOGRAMA ======
async function generarCronograma(tiempo: string, descripcionServicio: string, styleInstructions: string) {
  const prompt = `Genera la sección "CRONOGRAMA ESTIMADO".
${styleInstructions}

DATOS:
Tiempo total: ${tiempo}
Servicio: ${descripcionServicio}

INSTRUCCIONES:
1. Genera un plan de trabajo.
2. CRÍTICO: Si el estilo pide tabla, USA UNA TABLA MARKDOWN STANDARD, NO ASCII.
   Ejemplo Markdown:
   | Fase | Actividad | Tiempo |
   | --- | --- | --- |
   | 1 | Inicio | Día 1 |

   NO uses caracteres como "─" o "│" ni bloques de código.

Genera la sección:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 5: HONORARIOS (sin IA) ======
function generarHonorarios(precio: string, formaPago: string, moneda: string) {
  // Robust parsing: remove non-numeric chars except dot
  // If input is empty or invalid, default to 0 to avoid NaN
  const cleanPrice = precio ? precio.replace(/[^0-9.]/g, '') : '0';
  const precioNum = parseFloat(cleanPrice) || 0;

  const honorarios = precioNum / 1.16;
  const iva = precioNum - honorarios;
  const simbolo = moneda === "USD" ? "$" : "$";

  // Use toLocaleString for pretty numbers (e.g. 1,200.00)
  const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `IV. HONORARIOS PROFESIONALES

Por los servicios descritos en la presente propuesta, nuestros honorarios ascienden a:

| Concepto | Importe |
| :--- | :---: |
| Honorarios profesionales | ${simbolo}${fmt(honorarios)} ${moneda} |
| IVA (16%) | ${simbolo}${fmt(iva)} ${moneda} |
| **TOTAL** | **${simbolo}${fmt(precioNum)} ${moneda}** |

**Condiciones de pago:** ${formaPago}

> Los honorarios no incluyen derechos notariales, derechos registrales ni gastos ante autoridades, los cuales serán cubiertos directamente por el cliente o facturados por separado a precio de costo.`;
}

// ====== SUB-AGENTE 6: OBLIGACIONES Y CONFIDENCIALIDAD ======
async function generarObligacionesYCierre(despachoInfo: any, userInfo: any) {
  const prompt = `Genera las secciones finales (V a VIII) de una propuesta legal profesional.

DATOS:
Despacho: ${despachoInfo.nombre}
Email: ${userInfo.email || "contacto@" + despachoInfo.nombre.toLowerCase().replace(/\s/g, '') + ".mx"}

INSTRUCCIONES:
1. Generar 4 secciones:
   - V. OBLIGACIONES DEL CLIENTE (lista de documentos/información que debe proporcionar)
   - VI. CONFIDENCIALIDAD (párrafo sobre protección de información)
   - VII. VIGENCIA (30 días naturales)
   - VIII. ACEPTACIÓN (solicitud de confirmación por escrito)

2. Formato profesional y conciso
3. Usar letras a), b), c) para listar obligaciones
4. Párrafos formales pero claros

EJEMPLO PARCIAL:
V. OBLIGACIONES DEL CLIENTE

Para la adecuada ejecución de los servicios, el cliente deberá proporcionar:

    a) Identificación oficial vigente de cada socio fundador
    b) Comprobante de domicilio del domicilio social
    ...

VI. CONFIDENCIALIDAD

La información proporcionada será tratada con estricta confidencialidad...

Genera las 4 secciones completas:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 7: FOOTER ======
function generarFooter(despachoInfo: any, userInfo: any) {
  const separador = "---";
  const email = userInfo.email || `contacto@${despachoInfo.nombre.toLowerCase().replace(/\s/g, '')}.mx`;

  return `

${separador}

${despachoInfo.nombre.toUpperCase()}
${email}

${separador}`;
}

// ====== ORQUESTADOR PRINCIPAL ======
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clienteNombre,
      remitente,
      descripcion,
      tiempo,
      precio,
      formaPago,
      despachoInfo,
      servicioInfo,
      estructura,
      userInfo,
      formatType,
      toneType,
      languageType,
      styleType, // NEW
      customLanguage,
      customBlocks,
      addOns
    } = body;

    // Generar folio y fecha
    const { fecha, folio } = generarFolioYFecha();

    console.log("🚀 Iniciando generación con sub-agentes profesionales (OpenAI)...");

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    // Preparar datos
    const safeDespachoInfo = (despachoInfo && despachoInfo.nombre) ? despachoInfo : { nombre: "Despacho Legal", slogan: "" };
    const destinatario = { nombre: clienteNombre, empresa: remitente || "" };
    const moneda = estructura?.formato?.precios?.formato || 'MXN';
    const serviciosData = servicioInfo ? [servicioInfo] : [{
      nombre: descripcion,
      descripcion: descripcion,
      detalles: descripcion,
      incluye: ["Servicio completo"]
    }];

    // 1. Obtener Instrucciones de Estilo Profundo
    const styleInstructions = getStyleInstructions(styleType || 'silicon-valley');
    console.log(`🎨 Estilo seleccionado: ${styleType} -> Aplicando instrucciones profundas.`);

    // Ejecutar agentes en paralelo con instrucciones de estilo
    const [resumenEjecutivo, alcanceServicios, cronograma, obligacionesYCierre] = await Promise.all([
      generarResumenEjecutivo(descripcion, safeDespachoInfo, tiempo, toneType || 'formal', styleInstructions),
      generarAlcanceServicios(serviciosData, styleInstructions),
      generarCronograma(tiempo, descripcion, styleInstructions),
      generarObligacionesYCierre(safeDespachoInfo, userInfo)
    ]);

    // Generar secciones sin IA
    const encabezado = generarEncabezado(userInfo, destinatario, safeDespachoInfo, fecha, folio);
    const honorarios = generarHonorarios(precio, formaPago, moneda);
    const footer = generarFooter(safeDespachoInfo, userInfo);

    // Ensamblar documento
    console.log("🔨 Ensamblando documento final...");

    let contenidoFinal = '';

    // If custom blocks are specified, generate only enabled blocks in order
    if (formatType === 'custom' && customBlocks && customBlocks.length > 0) {
      const sortedBlocks = customBlocks
        .filter((b: any) => b.enabled)
        .sort((a: any, b: any) => a.order - b.order);

      const sections = [encabezado];

      for (const block of sortedBlocks) {
        switch (block.id) {
          case 'intro':
            sections.push(`I. RESUMEN EJECUTIVO\n\n${resumenEjecutivo}`);
            break;
          case 'services':
            sections.push(alcanceServicios);
            break;
          case 'timeline':
            sections.push(cronograma);
            break;
          case 'costs':
            sections.push(honorarios);
            break;
          case 'terms':
            sections.push(obligacionesYCierre);
            break;
        }
      }

      sections.push(footer);
      contenidoFinal = sections.join('\n\n\n');

    } else {
      // Default: generate all sections
      contenidoFinal = `${encabezado}


I. RESUMEN EJECUTIVO

${resumenEjecutivo}


${alcanceServicios}


${cronograma}


${honorarios}


${obligacionesYCierre}

${footer}`;
    }

    console.log("✅ Cotización profesional generada con éxito");

    return NextResponse.json({
      contenido: contenidoFinal,
      folio: folio
    });

  } catch (error: any) {
    console.error('❌ Error en orquestador:', error);
    return NextResponse.json(
      { error: `Error al generar la cotización: ${error.message}` },
      { status: 500 }
    );
  }
}
