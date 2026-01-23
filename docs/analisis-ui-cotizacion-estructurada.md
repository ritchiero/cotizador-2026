# Análisis UI: Cotización Estructurada vs Sistema de Diseño

**Archivo analizado:** `src/app/cotizacion-estructurada/[tipo]/page.tsx`
**Fecha:** 2026-01-22
**Comparación:** Sistema de Diseño Oficial (docs/sistema-de-diseno.md)

---

## 🔴 CRÍTICO: Problemas Mayores

### 1. Botones Principales con Border-Radius Incorrecto

**Sistema de Diseño:**
> "Todos los botones usan **border-radius: 9999px** (Pill Shape)"

**Problema encontrado:**
❌ **TODOS los botones de acción usan `rounded-xl` (12px) en vez de `rounded-full`**

#### Ubicaciones específicas:

| Línea | Botón | Actual | Debería ser |
|-------|-------|--------|-------------|
| 1927 | "Cancelar" (Step 1) | `rounded-xl` | `rounded-full` |
| 1933 | "Siguiente paso" | `rounded-xl` | `rounded-full` |
| 2003 | "Atrás" (Step 2) | `rounded-xl` | `rounded-full` |
| 2013 | "Siguiente Paso" | `rounded-xl` | `rounded-full` |
| 2160 | "Atrás" (Step 3) | `rounded-xl` | `rounded-full` |
| 2170 | "Generar Cotización" | `rounded-xl` | `rounded-full` |
| 2359 | "Atrás" (Métodos pago) | `rounded-xl` | `rounded-full` |
| 2366 | "Guardar Método" | `rounded-xl` | `rounded-full` |

**Código actual (línea 1933):**
```tsx
<Button className="px-6 py-2.5 text-sm font-semibold rounded-xl ...">
  Siguiente paso
</Button>
```

**Debería ser:**
```tsx
<Button className="px-6 py-2.5 text-sm font-semibold rounded-full ...">
  Siguiente paso
</Button>
```

---

### 2. Botones sin Gradiente (Color Sólido Incorrecto)

**Sistema de Diseño:**
> "Botón Primario usa `background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)`"

**Problema encontrado:**
❌ Botones primarios usan `bg-blue-600` sólido en vez de gradiente

#### Ubicaciones:

| Línea | Botón | Actual | Debería ser |
|-------|-------|--------|-------------|
| 780 | "Guardar Plantilla" | `bg-blue-600` | `bg-gradient-to-r from-[#3B82F6] to-[#2563EB]` |
| 831 | "Crear primera plantilla" | `bg-blue-600` | `bg-gradient-to-r from-[#3B82F6] to-[#2563EB]` |
| 922 | "Agregar cuenta bancaria" | `bg-blue-600` | `bg-gradient-to-r from-[#3B82F6] to-[#2563EB]` |
| 1210 | "Guardar Firma" (canvas) | `bg-gradient-to-r from-blue-500 to-blue-600` | `from-[#3B82F6] to-[#2563EB]` ✅ casi correcto |
| 2366 | "Guardar Método" | `bg-blue-600` | `bg-gradient-to-r from-[#3B82F6] to-[#2563EB]` |

**Código actual (línea 780):**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-full ...">
  Guardar Plantilla
</button>
```

**Debería ser:**
```tsx
<button className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-full ...">
  Guardar Plantilla
</button>
```

---

### 3. Color Indigo No Oficial

**Sistema de Diseño:**
> "Colores primarios: Blue 600 (`#3B82F6`), Blue 700 (`#2563EB`)"
> **NO menciona `indigo` en ninguna parte**

**Problema encontrado:**
❌ **15 usos del color `indigo-600`** que NO existe en el sistema

#### Ubicaciones de `indigo-`:

- Línea 743, 855: Spinners con `border-indigo-600`
- Línea 805, 900: Radio selectors con `bg-indigo-600`
- Línea 955: Checkbox con `bg-indigo-600`
- Líneas 798-907: Múltiples cards seleccionables con `border-indigo-600`

**Ejemplo (línea 805):**
```tsx
<div className="h-4 w-4 rounded-full bg-indigo-600 ...">
```

**Debería ser:**
```tsx
<div className="h-4 w-4 rounded-full bg-blue-600 ...">
```

---

## ⚠️ MEDIO: Problemas Importantes

### 4. Inputs con Border-Radius Incorrecto

**Sistema de Diseño:**
> "Inputs usan `border-radius: 9999px` (Pill Shape)"

**Problema encontrado:**
❌ Inputs de texto usan `rounded-lg` en vez de `rounded-full`

#### Ubicaciones:

| Línea | Input | Actual | Debería ser |
|-------|-------|--------|-------------|
| 763 | Nombre plantilla | `rounded-lg` | `rounded-full` |
| 1059 | Nombre completo (contacto) | `rounded-lg` | `rounded-full` |
| 1070 | Email (contacto) | `rounded-lg` | `rounded-full` |
| 1081 | Teléfono (contacto) | `rounded-lg` | `rounded-full` |
| 2314 | Titular tarjeta | `rounded-xl` | `rounded-full` |
| 2324 | Número tarjeta | `rounded-xl` | `rounded-full` |
| 2338 | Email PayPal | `rounded-xl` | `rounded-full` |
| 2350 | ID Stripe | `rounded-xl` | `rounded-full` |

**Ejemplo (línea 1059):**
```tsx
<input
  type="text"
  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg ..."
/>
```

**Debería ser:**
```tsx
<input
  type="text"
  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-full ..."
/>
```

---

### 5. Tamaño de Inputs Incorrecto

**Sistema de Diseño:**
> "Input de Texto: `height: 48px`"

**Problema encontrado:**
❌ Inputs usan `py-2` o `py-2.5` que no dan 48px de altura

#### Recomendación:
```tsx
// Actual:
className="px-3 py-2.5 ..." // ≈ 40px altura

// Correcto según sistema:
className="h-12 px-5 py-3.5 ..." // = 48px altura exacta
```

---

### 6. Textarea con Border-Radius Incorrecto

**Sistema de Diseño:**
> "Textarea usa `border-radius: 16px`"

**Problema encontrado:**
Algunas textareas usan `rounded-lg` (8px) en vez de `rounded-[16px]` o `rounded-2xl`

#### Ubicaciones:

| Línea | Uso | Actual | Debería ser |
|-------|-----|--------|-------------|
| 772 | Contenido plantilla | `rounded-lg` | `rounded-[16px]` o `rounded-2xl` |
| 993 | Notas adicionales | `rounded-b-xl` | `rounded-b-2xl` ✅ Casi correcto |

**Ejemplo (línea 772):**
```tsx
<textarea className="w-full px-3 py-2 border rounded-lg ...">
```

**Debería ser:**
```tsx
<textarea className="w-full px-5 py-4 border rounded-2xl ...">
```

---

### 7. Botón con Clase Inválida `rounded-pill`

**Ubicación:** Línea 831

```tsx
className="... rounded-pill ... rounded-full"
```

❌ `rounded-pill` NO existe en Tailwind
⚠️ Está duplicado con `rounded-full` en la misma clase

**Corrección:**
Eliminar `rounded-pill`, dejar solo `rounded-full`

---

## 🟡 MENOR: Mejoras Recomendadas

### 8. Botones Secundarios Sin Hover Oficial

**Sistema de Diseño:**
```tsx
.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}
```

**Problema encontrado:**
Botones secundarios usan `hover:bg-gray-50 hover:border-gray-300` que es similar pero no exacto

#### Ubicación:
- Línea 2003: "Atrás" (Step 2)

**Recomendación:**
```tsx
// Actual:
hover:bg-gray-50 hover:border-gray-300

// Sistema oficial:
hover:bg-[#F9FAFB] hover:border-[#9CA3AF]
```

---

### 9. Padding de Botones Inconsistente

**Sistema de Diseño:**
> "Botón Primario: `padding: 10px 24px`" → Tailwind: `px-6 py-2.5`

**Problema encontrado:**
Algunos botones usan `px-8 py-6` (línea 2013, 2170) que es excesivo

#### Recomendación:
```tsx
// Actual:
px-8 py-6 // Demasiado padding

// Sistema:
px-6 py-2.5 // Estándar oficial
```

---

### 10. Cards con Border-Radius Mixtos

**Cards seleccionables:**
- Usan `rounded-xl` (12px) ✅ **Correcto según sistema**
- Contenedores principales usan `rounded-[16px]` ✅ **Correcto**

Esto está bien, solo por consistencia visual.

---

## 📊 Resumen Cuantitativo

| Problema | Ocurrencias | Severidad |
|----------|-------------|-----------|
| Botones con `rounded-xl` en vez de `rounded-full` | 8 | 🔴 Crítico |
| Botones sin gradiente (`bg-blue-600` sólido) | 5 | 🔴 Crítico |
| Uso de color `indigo-` no oficial | 15 | 🔴 Crítico |
| Inputs con `rounded-lg/xl` en vez de `rounded-full` | 8 | ⚠️ Importante |
| Clase inválida `rounded-pill` | 1 | ⚠️ Importante |
| Textareas con `rounded-lg` en vez de `rounded-[16px]` | 2 | 🟡 Menor |
| Padding de botones inconsistente | 4 | 🟡 Menor |

**Total de discrepancias:** ~43

---

## ✅ Elementos Correctos

**Lo que SÍ está bien implementado:**

1. ✅ Cards contenedores principales usan `rounded-[16px]`
2. ✅ Cards seleccionables usan `rounded-xl` (12px)
3. ✅ Algunos botones ya usan gradiente correcto
4. ✅ Hover states con transiciones suaves
5. ✅ Shadow officiales (`shadow-sm`, `shadow-md`, `shadow-lg`)
6. ✅ Estados activos con `bg-blue-50` + `ring-1 ring-blue-600`

---

## 🔧 Solución Propuesta

### Opción 1: Crear Constantes CSS (Recomendada)

Similar a lo que hicimos en ServicesTab, crear constantes al inicio:

```typescript
// === CONSTANTES OFICIALES DEL SISTEMA ===
const BTN_PRIMARY = "px-6 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium rounded-full shadow-md hover:from-[#2563EB] hover:to-[#1D4ED8] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:bg-blue-300";

const BTN_SECONDARY = "px-6 py-2.5 bg-transparent border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-[#F9FAFB] hover:border-[#9CA3AF] hover:text-gray-900 transition-all";

const INPUT_TEXT = "w-full h-12 bg-white border border-gray-200 rounded-full px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none";

const TEXTAREA = "w-full min-h-[80px] bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-y";

const RADIO_INDICATOR = "h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center";
```

### Opción 2: Buscar y Reemplazar Manual

1. **Reemplazar `rounded-xl` → `rounded-full` en TODOS los botones**
2. **Reemplazar `bg-blue-600` → `bg-gradient-to-r from-[#3B82F6] to-[#2563EB]` en botones primarios**
3. **Reemplazar `indigo-600` → `blue-600` en TODOS los lugares**
4. **Reemplazar `rounded-lg` → `rounded-full` en inputs de texto**
5. **Eliminar `rounded-pill`**

---

## 📝 Checklist de Correcciones

### Botones:
- [ ] Línea 1927: `rounded-xl` → `rounded-full`
- [ ] Línea 1933: `rounded-xl` → `rounded-full` + agregar gradiente
- [ ] Línea 2003: `rounded-xl` → `rounded-full`
- [ ] Línea 2013: `rounded-xl` → `rounded-full` + agregar gradiente
- [ ] Línea 2160: `rounded-xl` → `rounded-full`
- [ ] Línea 2170: `rounded-xl` → `rounded-full` + agregar gradiente
- [ ] Línea 2359: `rounded-xl` → `rounded-full`
- [ ] Línea 2366: `rounded-xl` → `rounded-full` + `bg-blue-600` → gradiente
- [ ] Línea 780: `bg-blue-600` → gradiente
- [ ] Línea 831: eliminar `rounded-pill`, `bg-blue-600` → gradiente
- [ ] Línea 922: `bg-blue-600` → gradiente

### Inputs:
- [ ] Línea 763: `rounded-lg` → `rounded-full`
- [ ] Línea 1059: `rounded-lg` → `rounded-full`
- [ ] Línea 1070: `rounded-lg` → `rounded-full`
- [ ] Línea 1081: `rounded-lg` → `rounded-full`
- [ ] Línea 2314: `rounded-xl` → `rounded-full`
- [ ] Línea 2324: `rounded-xl` → `rounded-full`
- [ ] Línea 2338: `rounded-xl` → `rounded-full`
- [ ] Línea 2350: `rounded-xl` → `rounded-full`

### Textareas:
- [ ] Línea 772: `rounded-lg` → `rounded-2xl`
- [ ] Línea 993: Verificar que sea `rounded-2xl`

### Colores:
- [ ] Reemplazar TODAS las 15 ocurrencias de `indigo-` por `blue-`
  - Spinners: `border-indigo-600` → `border-blue-600`
  - Radio selectors: `bg-indigo-600` → `bg-blue-600`
  - Borders: `border-indigo-600` → `border-blue-600`
  - Rings: `ring-indigo-600` → `ring-blue-600`
  - Text: `text-indigo-600` → `text-blue-600`

---

## 🎯 Impacto Estimado

Si corregimos todos estos problemas:

- **Consistencia visual:** 100% alineada con el sistema de diseño
- **Líneas afectadas:** ~43 cambios
- **Riesgo:** Bajo (solo cambios visuales, sin lógica)
- **Tiempo de corrección:** ~15 minutos con buscar/reemplazar

---

## 💡 Recomendación Final

**Prioridad 1 (Hacer AHORA):**
1. Reemplazar todos los `indigo-` por `blue-`
2. Cambiar `rounded-xl` a `rounded-full` en botones
3. Eliminar `rounded-pill`
4. Agregar gradientes a botones primarios

**Prioridad 2 (Hacer después):**
1. Inputs de texto: `rounded-lg` → `rounded-full`
2. Textareas: `rounded-lg` → `rounded-2xl`
3. Estandarizar padding de botones

**Método sugerido:**
Crear constantes CSS primero (como en ServicesTab), luego reemplazar gradualmente.

---

**Generado el:** 2026-01-22
**Por:** Claude Sonnet 4.5
