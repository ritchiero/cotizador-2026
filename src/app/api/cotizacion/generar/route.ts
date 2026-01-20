import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const separador = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

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

// ====== SUB-AGENTE 2: RESUMEN EJECUTIVO ======
async function generarResumenEjecutivo(descripcionServicio: string, despachoInfo: any, tiempo: string) {
  const prompt = `Genera un RESUMEN EJECUTIVO profesional para una propuesta de servicios legales.

DATOS:
Despacho: ${despachoInfo.nombre}
Servicio: ${descripcionServicio}
Tiempo: ${tiempo}

INSTRUCCIONES:
1. Un párrafo formal de 3-4 oraciones
2. Mencionar que ${despachoInfo.nombre} se complace en presentar la propuesta
3. Describir brevemente el servicio
4. Mencionar el plazo estimado (${tiempo})
5. Tono: profesional, conciso, ejecutivo
6. NO uses títulos como "RESUMEN EJECUTIVO:", solo el contenido

EJEMPLO:
${despachoInfo.nombre} se complace en presentar esta propuesta para [servicio]. Nuestro servicio contempla el acompañamiento integral desde [inicio] hasta [fin], garantizando [resultado] en un plazo de ${tiempo}.

Genera el resumen ejecutivo:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano-2025-08-07",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 3: ALCANCE DE SERVICIOS ======
async function generarAlcanceServicios(servicios: any[]) {
  const serviciosTexto = servicios.map((s: any) => {
    let incluyeTexto = "";
    if (Array.isArray(s.incluye)) {
      incluyeTexto = s.incluye.map((item: any) => {
        if (typeof item === 'object' && item.descripcion) {
          return item.descripcion;
        }
        return item;
      }).join(", ");
    } else {
      incluyeTexto = s.incluye;
    }

    return `${s.nombre}:
Descripción: ${s.descripcion}
Detalles: ${s.detalles}
Incluye: ${incluyeTexto}`;
  }).join("\n\n");

  const prompt = `Genera la sección "II. ALCANCE DE LOS SERVICIOS" de una propuesta legal profesional.

SERVICIOS A INCLUIR:
${serviciosTexto}

INSTRUCCIONES:
1. Título: "II. ALCANCE DE LOS SERVICIOS"
2. Dividir en subsecciones A, B, C, D, etc. (una por cada fase del servicio)
3. Cada subsección con título descriptivo de la fase
4. Párrafos de 2-3 oraciones explicando qué se hará
5. Usar lenguaje formal y técnico pero claro
6. NO usar bullets, usar párrafos corridos
7. Formato profesional de propuesta legal

EJEMPLO DE FORMATO:
II. ALCANCE DE LOS SERVICIOS

A. Fase de Estructuración

Realizaremos una sesión de trabajo para definir la arquitectura corporativa...

B. Elaboración de Documentos

Redactaremos los estatutos sociales con cláusulas específicas...

Genera la sección completa:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano-2025-08-07",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 4: CRONOGRAMA ======
async function generarCronograma(tiempo: string, descripcionServicio: string) {
  const prompt = `Genera la sección "III. CRONOGRAMA ESTIMADO" para una propuesta legal.

DATOS:
Tiempo total: ${tiempo}
Servicio: ${descripcionServicio}

INSTRUCCIONES:
1. Título: "III. CRONOGRAMA ESTIMADO"
2. Crear una tabla con formato ASCII:
    Actividad                                         Plazo
    ─────────────────────────────────────────────────────────────────
    [actividad 1]                                     Días X-Y
    [actividad 2]                                     Días X-Y
    ─────────────────────────────────────────────────────────────────

3. Incluir 4-6 actividades principales del servicio
4. Distribuir los días proporcionalmente según el tiempo total
5. Al final agregar: "Los plazos anteriores son estimados y están sujetos a la disponibilidad de las autoridades competentes y a la entrega oportuna de la documentación requerida."

Genera la sección completa con la tabla:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano-2025-08-07",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 5: HONORARIOS (sin IA) ======
function generarHonorarios(precio: string, formaPago: string, moneda: string) {
  const precioNum = parseFloat(precio.replace(/[^0-9.]/g, ''));
  const honorarios = precioNum / 1.16;
  const iva = precioNum - honorarios;
  const simbolo = moneda === "USD" ? "$" : "$";

  return `IV. HONORARIOS PROFESIONALES

Por los servicios descritos en la presente propuesta, nuestros honorarios ascienden a:

    Concepto                                          Importe
    ─────────────────────────────────────────────────────────────────
    Honorarios profesionales                          ${simbolo}${honorarios.toFixed(2)} ${moneda}
    IVA (16%)                                         ${simbolo}${iva.toFixed(2)} ${moneda}
    ─────────────────────────────────────────────────────────────────
    TOTAL                                             ${simbolo}${precioNum.toFixed(2)} ${moneda}

Condiciones de pago: ${formaPago}

Los honorarios no incluyen derechos notariales, derechos registrales ni gastos ante autoridades, los cuales serán cubiertos directamente por el cliente o facturados por separado a precio de costo.`;
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
    model: "gpt-5-nano-2025-08-07",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content?.trim() || "";
}

// ====== SUB-AGENTE 7: FOOTER ======
function generarFooter(despachoInfo: any, userInfo: any) {
  const separador = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
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
      userInfo
    } = body;

    // Generar folio y fecha
    const { fecha, folio } = generarFolioYFecha();

    console.log("🚀 Iniciando generación con sub-agentes profesionales...");

    // Preparar datos
    const destinatario = {
      nombre: clienteNombre,
      empresa: remitente || ""
    };

    const moneda = estructura?.formato?.precios?.formato || 'MXN';

    const serviciosData = servicioInfo ? [servicioInfo] : [{
      nombre: descripcion,
      descripcion: descripcion,
      detalles: descripcion,
      incluye: ["Servicio completo"]
    }];

    // Ejecutar agentes en paralelo
    console.log("📝 Ejecutando agentes...");

    const [resumenEjecutivo, alcanceServicios, cronograma, obligacionesYCierre] = await Promise.all([
      generarResumenEjecutivo(descripcion, despachoInfo, tiempo),
      generarAlcanceServicios(serviciosData),
      generarCronograma(tiempo, descripcion),
      generarObligacionesYCierre(despachoInfo, userInfo)
    ]);

    // Generar secciones sin IA
    const encabezado = generarEncabezado(userInfo, destinatario, despachoInfo, fecha, folio);
    const honorarios = generarHonorarios(precio, formaPago, moneda);
    const footer = generarFooter(despachoInfo, userInfo);

    // Ensamblar documento
    console.log("🔨 Ensamblando documento final...");
    const contenidoFinal = `${encabezado}


I. RESUMEN EJECUTIVO

${resumenEjecutivo}


${alcanceServicios}


${cronograma}


${honorarios}


${obligacionesYCierre}

${footer}`;

    console.log("✅ Cotización profesional generada con éxito");

    return NextResponse.json({
      contenido: contenidoFinal
    });

  } catch (error: any) {
    console.error('❌ Error en orquestador:', error);
    return NextResponse.json(
      { error: 'Error al generar la cotización' },
      { status: 500 }
    );
  }
}
