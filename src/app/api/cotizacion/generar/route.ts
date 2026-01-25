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
    'ny-biglaw': `ESTILO: NY BIGLAW (Engagement Letter Formal).
      - Estructura de carta formal con encabezado institucional
      - Secciones numeradas en MAYÚSCULAS: 1. SCOPE OF ENGAGEMENT, 2. PROFESSIONAL FEES, etc.
      - Lenguaje EXTREMADAMENTE FORMAL: "pursuant to", "hereinafter referred to as"
      - Tabla de fees con bordes completos para pricing
      - Párrafos narrativos densos para descripciones
      - Cierre: "Very truly yours,"
      - Incluir sección de aceptación con firma`,

    'silicon-valley': `ESTILO: SILICON VALLEY (Product-led, Founder-friendly).
      - Saludo casual: "Hi [First Name]," en lugar de "Dear..."
      - Lenguaje simple y directo, CERO legalese
      - Usa TABLAS limpias para pricing
      - Boxes destacados para features/beneficios
      - Bullets con íconos → para listas
      - Mencionar "founder-friendly", "no billable surprises"
      - Cierre: "Best," (casual)
      - Enfoque en VALOR y VELOCIDAD`,

    'uk-magic-circle': `ESTILO: BRITÁNICA (Magic Circle, Solicitors).
      - Formato de carta formal británica
      - Fecha en formato UK: "23 January 2026"
      - Referencia: "Our ref: AP/NDA/2026/0147"
      - Secciones numeradas tradicionales: 1. Background, 2. Our Understanding, 3. Scope of Work
      - Lenguaje formal británico: "We are pleased to...", "We would be grateful if..."
      - Vocabulario UK: "whilst", "shall", "herewith", "pursuant"
      - Tabla de fees con IVA/VAT explícito
      - Mencionar SRA number y regulatory compliance
      - Cierre: "Yours sincerely" (británico)
      - Box de "Confirmation of Instructions" para firma`,

    'german-engineering': `ESTILO: INGENIERÍA CONTRACTUAL (Alemán, Ultra Estructurado).
      - Título principal: "ACUERDO DE PRESTACIÓN DE SERVICIOS"
      - Información del expediente en tabla al inicio (N° Expediente, Fecha, Versión, etc.)
      - Sección 1. DEFINICIONES con tabla de términos clave
      - MUCHAS TABLAS: para servicios, cronograma, honorarios, supuestos
      - Numeración exhaustiva: 2.1, 2.2, 3.1.1, 3.1.2, etc.
      - Cronograma con fases H-0, H-1, H-2 (Hitos)
      - Tabla de honorarios con IVA desglosado línea por línea
      - Sección de SUPUESTOS Y PRERREQUISITOS con checkboxes
      - Box de FIRMAS en formato tabla (Por el Despacho | Por el Cliente)
      - Lista de ANEXOS al final
      - Lenguaje técnico y preciso, CERO ambigüedad`,

    'french-cabinet': `ESTILO: CABINET FRANCÉS (Refinado, Narrativo).
      - Header elegante centrado con líneas decorativas: ─────  ✦  ─────
      - Nombre del cabinet en mayúsculas con "— AVOCATS —"
      - Secciones con números romanos centrados: I. NUESTRA PROPUESTA, II. MODALIDADES
      - Lenguaje extremadamente refinado: "Agradecemos sinceramente la confianza..."
      - Uso de itálicas para énfasis: "Primero", "Segundo", "Tercero"
      - Párrafos largos y bien redactados (no bullets)
      - Separadores decorativos entre secciones: * * *
      - Box elegante con borde doble para el precio
      - Cierre cortés: "Quedamos a su disposición..."
      - "Le rogamos acepte... la expresión de nuestra más distinguida consideración"
      - Box de aceptación: "— Bon pour accord —"
      - Footer con información legal completa`,

    'spanish-boutique': `ESTILO: DESPACHO BOUTIQUE (Madrid, Cercano pero Profesional).
      - Header con nombre en rojo oscuro
      - Título centrado: "PROPUESTA DE SERVICIOS PROFESIONALES"
      - Secciones numeradas en romano con color: I. ANTECEDENTES, II. ALCANCE, etc.
      - Lenguaje cercano: "tenemos el agrado de...", "quedamos a su disposición..."
      - Equilibrio entre calidez y autoridad técnica
      - Tabla de metodología con fases coloreadas
      - Tabla de honorarios con IVA 21% explícito
      - Mencionar RGPD y protección de datos
      - Box de ACEPTACIÓN DEL ENCARGO con borde rojo
      - Footer con CIF, ICAM, dirección completa
      - Usar "Nos complace", "A su entera disposición"`,

    'japanese-keigo': `ESTILO: KEIGO JAPONÉS (Ultra Cortés, Estructurado).
      - Header minimalista alineado a la derecha
      - Título en caja con bordes: "PROPUESTA DE SERVICIOS"
      - TODO en tablas limpias y estructuradas
      - Tabla 1: Resumen del Servicio (Servicio, Documento, Plazo, Responsable, Honorarios)
      - Tabla 2: Alcance con numeración 2.1-2.7 (N° | Descripción | Entregable)
      - Tabla 3: Cronograma por días (Día 0, 1, 2-3, 4, 5)
      - Tabla 4: Honorarios con impuesto al consumo
      - Tabla 5: Puntos a Confirmar con checkboxes ☐
      - Tabla 6: Condiciones (Validez, Forma pago, Confidencialidad)
      - Lenguaje extremadamente respetuoso: "Agradecemos sinceramente..."
      - Box de aceptación simple con grid 2x2
      - Footer limpio centrado`,

    'swiss-financial': `ESTILO: FINANCIAL-GRADE (Bancario Suizo, Ultra Preciso).
      - Header ultra minimalista
      - Tabla de metadata en UNA FILA: DOCUMENTO | REF | FECHA | VALIDEZ
      - Servicio destacado en caja con TOTAL grande: CHF 1'450.00
      - Desglose exhaustivo numerado 1.1-1.5 con Subtotal, Gastos admin, IVA 8.1%, Tasa cantonal
      - Fila negra final: TOTAL A PAGAR
      - Tabla de condiciones de pago: IMPORTE | PLAZO | MÉTODO
      - Box de datos bancarios completo (IBAN, BIC/SWIFT, etc.)
      - Supuestos con checkboxes ☑
      - Servicios opcionales en tabla
      - Términos generales en tabla (Ley, Jurisdicción, Seguro RC)
      - Firmas en formato tabla 2 columnas
      - Footer con CHE, UID, IVA, Registro Mercantil
      - Números con separador suizo: 1'450.00
      - Lenguaje bancario preciso y frío`,

    'legal-ops': `ESTILO: LEGAL OPS (RFP Response, Procurement-friendly).
      - Header oscuro con "SERVICE ORDER FORM"
      - Metadata grid en 4 columnas: Job Number | Issue Date | Valid Until | Version
      - Boxes para SERVICE PROVIDER | CLIENT con info completa
      - Secciones numeradas: 1. SERVICE SUMMARY, 2. SCOPE DEFINITION, etc.
      - Tabla 1: Service Summary (sin bordes gruesos, limpia)
      - SCOPE: Dos columnas con boxes verde (✓ INCLUDED) y rojo (✗ NOT INCLUDED)
      - Tabla 2: DELIVERABLES con header negro (ID | DELIVERABLE | FORMAT | DELIVERY | ACCEPTANCE)
      - Tabla 3: PRICING con header negro y fila azul para TOTAL
      - SLA metrics en grid 3x2 con boxes
      - Security & Compliance table detallada
      - Assumptions table con IDs: A1-A6
      - Payment terms table completa
      - Attachments con checkboxes
      - Authorization box azul con firmas
      - Lenguaje tipo formulario, muy estructurado`,

    'luxury-boutique': `ESTILO: LUXURY BOUTIQUE (Ultra Minimalista, Exclusivo).
      - Header: Solo el nombre (ej. "Caldwell") sin títulos
      - Formato carta personal simple
      - Fecha y cliente sin formalidades
      - Re: line directa
      - TODO en primera persona: "I would be pleased to..."
      - Lenguaje premium pero directo (British spelling: "enquiry")
      - Scope en un solo párrafo fluido (no bullets, no tablas)
      - Precio mencionado casualmente: "My fee for this work is $2,400"
      - Sin secciones numeradas
      - MUCHO espacio en blanco
      - Cierre simple: "I look forward to hearing from you."
      - Firma: solo el nombre, sin título ni cargo
      - Máxima simplicidad y elegancia`
  };
  return styles[style] || styles['spanish-boutique'];
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
async function generarObligacionesYCierre(despachoInfo: any, userInfo: any, styleInstructions: string) {
  const prompt = `Genera las secciones finales (V a VIII) de una propuesta legal profesional.

${styleInstructions}

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
      // Format & Style Configuration
      formatType,
      toneType,
      languageType,
      styleType,
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
    const styleInstructions = getStyleInstructions(styleType || 'spanish-boutique');
    console.log(`🎨 Estilo seleccionado: ${styleType || 'spanish-boutique'} -> Aplicando instrucciones profundas.`);

    // Ejecutar agentes en paralelo con instrucciones de estilo
    const [resumenEjecutivo, alcanceServicios, cronograma, obligacionesYCierre] = await Promise.all([
      generarResumenEjecutivo(descripcion, safeDespachoInfo, tiempo, toneType || 'formal', styleInstructions),
      generarAlcanceServicios(serviciosData, styleInstructions),
      generarCronograma(tiempo, descripcion, styleInstructions),
      generarObligacionesYCierre(safeDespachoInfo, userInfo, styleInstructions)
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
