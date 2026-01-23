# Análisis: Tabs del Home vs Sistema de Diseño

**Fecha:** 2026-01-22
**Archivos analizados:** 6 tabs (4,600 líneas totales)
**Referencia:** docs/sistema-de-diseno.md

---

## 📊 Resumen Ejecutivo

| Tab | Líneas | Estado | Problemas |
|-----|--------|--------|-----------|
| ProfileTab.tsx | ~600 | ✅ OPTIMIZADO | 1 menor |
| ServicesTab.tsx | 1,814 | ✅ OPTIMIZADO | 0 |
| BillingTab.tsx | ~700 | ⚠️ MENOR | 1 |
| PaymentTab.tsx | ~750 | 🔴 CRÍTICO | 8+ |
| BrandingTab.tsx | ~800 | 🔴 CRÍTICO | 10+ |
| LegalSettingsTab.tsx | ~400 | 🔴 CRÍTICO | 7 |

**Total de problemas:** ~27 discrepancias

---

## ✅ Tabs Optimizados (2/6)

### 1. ProfileTab.tsx
- ✅ Botones con `rounded-full` y gradiente oficial
- ✅ Inputs con `rounded-full` y padding `px-5 py-3`
- ✅ Textareas con `rounded-2xl`
- ⚠️ Botón primario: `px-5 py-2.5` (debería ser `px-6 py-2.5`)

### 2. ServicesTab.tsx
- ✅ Completamente optimizado (commit 07decea)
- ✅ Constantes CSS creadas
- ✅ Componentes de íconos

---

## 🔴 PaymentTab.tsx - CRÍTICO

**Problemas:** 8+ discrepancias

### Inputs en Modal (4 ocurrencias):

**Líneas:** 597, 634, 687, 702

**Problema:**
```tsx
// Actual:
className="w-full px-3 py-2 border rounded-lg ..."

// Debería ser:
className="w-full h-12 px-5 py-3.5 border border-gray-200 rounded-full ..."
```

**Cambios necesarios:**
- ❌ `rounded-lg` → `rounded-full`
- ❌ `px-3 py-2` → `px-5 py-3.5`
- ➕ Agregar `h-12`
- ➕ Agregar `text-gray-900`

### Botones de Selección:

**Línea 573:**
```tsx
// Actual:
<button className="... rounded-xl ...">

// Debería ser:
<button className="... rounded-full ...">
```

---

## 🔴 BrandingTab.tsx - CRÍTICO

**Problemas:** 10+ discrepancias

### Modal Backdrop:

**Línea 506:**
```tsx
// Actual:
className="... rounded-lg ..."

// Debería ser:
className="... rounded-2xl ..."
```

### Botones de Selección (Logo/Firma):

**Línea 573:**
```tsx
// Actual:
<button className="... rounded-xl ...">

// Debería ser:
<button className="... rounded-full ...">
```

### Inputs en Modal (2 ocurrencias):

**Líneas:** 603, 629

**Problema:**
```tsx
// Actual:
className="w-full px-3 py-2 border rounded-lg ..."

// Debería ser:
className="w-full h-12 px-5 py-3.5 border border-gray-200 rounded-full ..."
```

### Textareas (2 ocurrencias):

**Líneas:** 642, 699

**Problema:**
```tsx
// Actual:
className="w-full px-3 py-2 border rounded-lg h-24 ..."

// Debería ser:
className="w-full px-5 py-4 border border-gray-200 rounded-[16px] h-24 ..."
```

**Cambios:**
- `rounded-lg` → `rounded-[16px]` (o `rounded-2xl`)
- `px-3 py-2` → `px-5 py-4`

---

## 🔴 LegalSettingsTab.tsx - CRÍTICO

**Problemas:** 7 discrepancias

### Input de Texto:

**Línea 135:**
```tsx
// Actual:
className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ..."

// Debería ser:
className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 ..."
```

**Cambios:**
- ➕ `h-12`
- `px-4 py-3` → `px-5 py-3.5`
- `rounded-xl` → `rounded-full`
- `focus:border-blue-500` → `focus:border-blue-600`
- `focus:ring-blue-500/10` → `focus:ring-blue-100`

### Select:

**Línea 148:**
Cambios idénticos al input de arriba.

### Textarea:

**Línea 170:**
```tsx
// Actual:
className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl ..."

// Debería ser:
className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[16px] ..."
```

**Cambios:**
- `px-4` → `px-5`
- `rounded-xl` → `rounded-[16px]` (o `rounded-2xl`)
- `focus:ring-blue-500/10` → `focus:ring-blue-100`

### Botón Delete:

**Línea 260:**
```tsx
// Actual:
className="... rounded-lg ..."

// Debería ser:
className="... rounded-full ..."
```

---

## ⚠️ BillingTab.tsx - MENOR

**Problemas:** 1 discrepancia menor

### Select Padding:

**Línea 357:**
```tsx
// Actual:
className="... px-4 py-2 ..."

// Debería ser:
className="... px-5 py-3 ..."
```

---

## 🔴 CRÍTICO: Navegación de Tabs (page.tsx)

**Líneas:** 311-334

**Problema:** Los tabs usan estilo de "pill buttons" cuando deberían ser "flat tabs" con underline

### Actual (línea 323):
```tsx
<button className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
  selectedTab === label
    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
}`}>
```

### Sistema de Diseño (línea 650):
```tsx
<div class="flex border-b border-gray-100">
  <button class="px-5 py-4 text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-200 transition-all">
    Tab Inactivo
  </button>
  <button class="px-5 py-4 text-sm text-blue-600 font-medium border-b-2 border-blue-600">
    Tab Activo
  </button>
</div>
```

**Cambio necesario:**
Convertir de pills a flat tabs con border-bottom

---

## 📊 Prioridad de Correcciones

### Prioridad 1 (CRÍTICO):
1. **PaymentTab.tsx** - Inputs del modal (4 inputs)
2. **BrandingTab.tsx** - Inputs/textareas del modal (6 elementos)
3. **LegalSettingsTab.tsx** - Todos los inputs/select/textarea (6 elementos)

### Prioridad 2 (IMPORTANTE):
1. **page.tsx** - Navegación de tabs (cambiar de pills a flat)

### Prioridad 3 (MENOR):
1. **BillingTab.tsx** - Select padding (1 elemento)
2. **ProfileTab.tsx** - Botón padding (1 elemento)

---

## 🎯 Solución Propuesta

### Opción 1: Corregir Todo (Recomendada)
- Corregir los 27 problemas en 4 tabs
- Cambiar navegación de tabs a flat style
- Alineación 100% con sistema de diseño

**Impacto:** ~27 ediciones
**Archivos:** 5 archivos modificados

### Opción 2: Solo Críticos
- Corregir PaymentTab, BrandingTab, LegalSettingsTab
- Dejar navegación y problemas menores para después

**Impacto:** ~16 ediciones
**Archivos:** 3 archivos modificados

### Opción 3: Por Fases
1. **Fase 1:** PaymentTab (mayor impacto visual)
2. **Fase 2:** BrandingTab
3. **Fase 3:** LegalSettingsTab
4. **Fase 4:** Navegación y menores

---

## 📦 Commits Estimados

**Si hacemos TODO:**

```bash
# Commit 1
style: Homologar PaymentTab al sistema de diseño
- Inputs: rounded-lg → rounded-full (4 inputs)
- Padding: px-3 py-2 → px-5 py-3.5

# Commit 2
style: Homologar BrandingTab al sistema de diseño
- Inputs: rounded-lg → rounded-full (2 inputs)
- Textareas: rounded-lg → rounded-[16px] (2 textareas)
- Modal: rounded-lg → rounded-2xl

# Commit 3
style: Homologar LegalSettingsTab al sistema de diseño
- Input/Select: rounded-xl → rounded-full
- Textarea: rounded-xl → rounded-[16px]
- Focus rings: ring-blue-500/10 → ring-blue-100

# Commit 4
style: Cambiar navegación de tabs a flat style
- De pill buttons a flat tabs con border-bottom
- Según sistema de diseño oficial (línea 625-660)
```

---

**Total estimado:** 4 commits, ~27 ediciones, 5 archivos

---

**Generado el:** 2026-01-22
**Por:** Claude Sonnet 4.5
