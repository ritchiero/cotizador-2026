# Sistema de Diseño - Lawgic P.I.

Documentación completa del sistema de diseño oficial basado en `/estilos`.

---

## 📋 Tabla de Contenidos

1. [Colores](#colores)
2. [Cards y Cajas](#cards-y-cajas)
3. [Tipografía](#tipografía)
4. [Botones](#botones)
5. [Inputs y Formularios](#inputs-y-formularios)
6. [Badges y Pills](#badges-y-pills)
7. [Progress Bars](#progress-bars)

---

## 🎨 Colores

### Colores de Fondo

| Nombre | Hex | Uso |
|--------|-----|-----|
| Fondo General | `#F7F8FA` | Fondo principal de la aplicación |
| Sidebar / Content | `#FFFFFF` | Barras laterales y áreas de contenido |
| Cards | `#FFFFFF` | Tarjetas y componentes |
| Alert Bg | `#FFF8E6` | Fondos de alertas |

---

## 📦 Cards y Cajas

### 1. Card Contenedor Principal

**Uso:** Secciones mayores (Timelines, Portafolio)

```css
.card-container {
  background: #FFFFFF;
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  padding: 24px;
}

.card-container:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
}
```

**Tailwind:**
```html
<div class="bg-white border border-gray-200/50 rounded-[16px] shadow-sm hover:shadow-md p-6">
  <!-- Contenido -->
</div>
```

---

### 2. Tool Card

**Uso:** Navegación "Tools a tu alcance"

```css
.tool-card {
  background: white;
  width: 140px;
  min-height: 100px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59,130,246,0.1);
  transform: translateY(-2px);
}
```

**Tailwind:**
```html
<div class="bg-white w-[140px] min-h-[100px] border border-gray-200 rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5">
  <Icon class="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
  <h4 class="text-sm font-medium text-gray-700">Título</h4>
</div>
```

---

### 3. Feature Card (Timelines)

**Uso:** Tarjetas de módulo con estados Activa e Inactiva

```css
.feature-card {
  width: 140px;
  height: 120px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59,130,246,0.1);
}

.feature-card--active {
  background: #EEF2FF;
  border-color: #3B82F6;
  box-shadow: 0 0 0 1px #3B82F6;
}
```

**Tailwind:**
```html
<!-- Inactivo -->
<div class="w-[140px] h-[120px] bg-white border border-gray-200 rounded-[16px] p-4 cursor-pointer transition-all hover:border-blue-600 hover:shadow-md">
  <!-- Contenido -->
</div>

<!-- Activo -->
<div class="w-[140px] h-[120px] bg-blue-50 border border-blue-600 rounded-[16px] p-4 ring-1 ring-blue-600 shadow-md">
  <!-- Contenido -->
</div>
```

---

### 4. KPI Cards (Métricas)

**Uso:** Métricas con colores sólidos (Azul y Rojo)

```css
.metric-card {
  width: 100%;
  height: 72px;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}

.metric-card--blue {
  background: #3B82F6;
  color: white;
}

.metric-card--red {
  background: #EF4444;
  color: white;
}
```

**Tailwind:**
```html
<!-- Azul -->
<div class="w-full h-[72px] px-4 py-3 rounded-xl bg-blue-600 text-white flex justify-between items-center shadow-lg">
  <span class="text-xs font-semibold uppercase tracking-wide opacity-85">REGISTRADAS</span>
  <span class="text-[32px] font-bold leading-none">1,240</span>
</div>

<!-- Rojo -->
<div class="w-full h-[72px] px-4 py-3 rounded-xl bg-red-500 text-white flex justify-between items-center shadow-lg">
  <span class="text-xs font-semibold uppercase tracking-wide opacity-85">VENCIDAS</span>
  <span class="text-[32px] font-bold leading-none">24</span>
</div>
```

---

### 5. Alert Banner

**Uso:** Alertas importantes con borde izquierdo naranja

```css
.alert-banner {
  background: #FFF8E6;
  min-height: 64px;
  border: 1px solid #FDE68A;
  border-left: 4px solid #F59E0B;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(245,158,11,0.1);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Tailwind:**
```html
<div class="bg-[#FFF8E6] min-h-[64px] border border-yellow-200 border-l-4 border-l-amber-500 rounded-xl shadow-sm p-4 flex justify-between items-center">
  <div>
    <h4 class="text-[15px] font-semibold text-amber-900">Vencimientos Próximos</h4>
    <p class="text-[13px] text-amber-700">Tienes 776 marcas que requieren atención hoy.</p>
  </div>
  <a href="#" class="text-sm font-semibold text-blue-600 hover:underline">Ver lista</a>
</div>
```

---

### 6. List Item Card

**Uso:** Elementos de lista interactivos

```css
.list-item-card {
  background: white;
  min-height: 56px;
  border-bottom: 1px solid #F3F4F6;
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s;
}

.list-item-card:hover {
  background: #F9FAFB;
}
```

**Tailwind:**
```html
<div class="bg-white min-h-[56px] border-b border-gray-100 py-3 px-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
  <div>
    <h4 class="text-sm font-semibold text-gray-900">NIKE, INC.</h4>
    <p class="text-xs text-red-500">Declaración de uso pendiente</p>
  </div>
  <span class="text-xs text-gray-400">Hace 2 días</span>
</div>
```

---

## 📝 Tipografía

**Font:** Plus Jakarta Sans

### Variantes del Sistema

| Variante | Size | Line Height | Color | Uso |
|----------|------|-------------|-------|-----|
| **1** | 18px | 18px | `#0E162F` | Headings / Títulos |
| **2** | 16px | 18px | `#3B3D45` | Body / Principal |
| **3** | 12px | 18px | `#1E212A` | Detalles / Secondary |
| **4** | 12px | 16px | `#8F9095` | Caption / Metadata |

### Ejemplos Tailwind

```html
<!-- Variante 1: Títulos -->
<h1 class="font-jakarta text-[18px] leading-[18px] text-[#0E162F]">
  Título Principal
</h1>

<!-- Variante 2: Cuerpo -->
<p class="font-jakarta text-[16px] leading-[18px] text-[#3B3D45]">
  Texto de cuerpo estándar para lectura cómoda.
</p>

<!-- Variante 3: Detalles -->
<p class="font-jakarta text-[12px] leading-[18px] text-[#1E212A]">
  Información secundaria o detalles técnicos.
</p>

<!-- Variante 4: Metadata -->
<span class="font-jakarta text-[12px] leading-[16px] text-[#8F9095]">
  Metadatos, fechas o pies de foto.
</span>
```

---

## 🔘 Botones

**Nota:** Todos los botones usan **border-radius: 9999px** (Pill Shape)

### 1. Botón Primario

**Uso:** Acciones principales (Guardar, Buscar, Confirmar)

```css
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #93C5FD;
  cursor: not-allowed;
}
```

**Tailwind:**
```html
<button class="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed">
  Botón Primario
</button>
```

---

### 2. Botón Secundario

**Uso:** Acciones alternativas (Cancelar, Ver más)

```css
.btn-secondary {
  background: transparent;
  border: 1px solid #D1D5DB;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 9999px;
  transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
  color: #1F2937;
}
```

**Tailwind:**
```html
<button class="bg-transparent border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all">
  Botón Secundario
</button>
```

---

### 3. Ghost / Text Button

**Uso:** Enlaces sutiles dentro de componentes

```css
.btn-ghost {
  background: transparent;
  color: #3B82F6;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 9999px;
  transition: all 0.15s;
}

.btn-ghost:hover {
  background: rgba(59, 130, 246, 0.08);
  text-decoration: underline;
  color: #2563EB;
}
```

**Tailwind:**
```html
<button class="bg-transparent text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-blue-50 hover:underline transition-all">
  Ver detalles
</button>
```

---

### 4. Floating Action Button (FAB)

**Uso:** Acciones flotantes principales

```css
.btn-fab {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  transition: all 0.2s;
}

.btn-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}
```

**Tailwind:**
```html
<button class="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center">
  <PlusIcon class="w-6 h-6" />
</button>
```

---

### 5. Icon Button

**Uso:** Acciones de barra de herramientas

```css
.btn-icon {
  background: transparent;
  border: 1px solid #E5E7EB;
  color: #6B7280;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #F3F4F6;
  color: #374151;
  border-color: #D1D5DB;
}

.btn-icon.active {
  background: #EEF2FF;
  color: #3B82F6;
  border-color: #3B82F6;
}
```

**Tailwind:**
```html
<button class="w-10 h-10 bg-transparent border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 transition-all flex items-center justify-center">
  <FunnelIcon class="w-5 h-5" />
</button>

<!-- Activo -->
<button class="w-10 h-10 bg-blue-50 border border-blue-600 text-blue-600 rounded-lg flex items-center justify-center">
  <FunnelIcon class="w-5 h-5" />
</button>
```

---

### 6. Pill Warning/Danger Buttons

**Uso:** Alertas interactivas

```css
.btn-pill-warning {
  background: #FEF3C7;
  color: #D97706;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #FDE68A;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}

.btn-pill-warning:hover {
  background: #FDE68A;
  border-color: #FCD34D;
}

.btn-pill-danger {
  background: #FEE2E2;
  color: #DC2626;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #FECACA;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
```

**Tailwind:**
```html
<!-- Warning -->
<button class="bg-amber-100 text-amber-700 px-4 py-2 text-[13px] font-medium border border-amber-200 rounded-full inline-flex items-center gap-2 hover:bg-amber-200 transition-all">
  <ExclamationTriangleIcon class="w-4 h-4" />
  94 Vencimientos
</button>

<!-- Danger -->
<button class="bg-red-100 text-red-600 px-4 py-2 text-[13px] font-medium border border-red-200 rounded-full inline-flex items-center gap-2">
  <ExclamationTriangleIcon class="w-4 h-4" />
  2 Conflictos
</button>
```

---

### 7. Card Button (Botón de Selección)

**Uso:** Opciones grandes en modales/wizards

```css
.btn-card {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px 24px;
  width: 100%;
  text-align: center;
  color: #374151;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.btn-card:hover {
  border-color: #3B82F6;
  background: #F8FAFC;
  box-shadow: 0 4px 12px rgba(59,130,246,0.1);
}

.btn-card.active {
  border-color: #3B82F6;
  background: #EEF2FF;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
```

**Tailwind:**
```html
<!-- Normal -->
<button class="bg-white border-2 border-gray-200 rounded-xl p-5 w-full text-center text-gray-700 hover:border-blue-600 hover:bg-gray-50 hover:shadow-md transition-all flex flex-col items-center gap-3">
  <div class="w-12 h-12 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center">
    <DocumentTextIcon class="w-6 h-6" />
  </div>
  <span class="font-medium">Número de Expediente</span>
</button>

<!-- Activo -->
<button class="bg-blue-50 border-2 border-blue-600 rounded-xl p-5 w-full ring ring-blue-100 shadow-md flex flex-col items-center gap-3">
  <div class="w-12 h-12 bg-blue-100 rounded-xl text-blue-700 flex items-center justify-center">
    <ShieldCheckIcon class="w-6 h-6" />
  </div>
  <span class="font-medium text-blue-900">Registro de Marca</span>
</button>
```

---

### 8. Navegación Sidebar

**Uso:** Items del menú lateral

```css
.btn-nav {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  transition: all 0.15s;
}

.btn-nav:hover {
  background: #F3F4F6;
  color: #374151;
}

.btn-nav.active {
  background: #EEF2FF;
  color: #3B82F6;
  font-weight: 500;
}
```

**Tailwind:**
```html
<button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 text-sm hover:bg-gray-100 hover:text-gray-700 transition-all">
  <UserCircleIcon class="w-5 h-5" />
  <span>Perfil de Usuario</span>
</button>

<!-- Activo -->
<button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium text-sm">
  <ChartPieIcon class="w-5 h-5" />
  <span>Dashboard (Activo)</span>
</button>
```

---

### 9. Tabs

**Uso:** Navegación horizontal de vistas

```css
.btn-tab {
  padding: 16px 20px;
  font-size: 14px;
  color: #6B7280;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.btn-tab:hover {
  color: #374151;
  border-color: #E5E7EB;
}

.btn-tab.active {
  color: #3B82F6;
  font-weight: 500;
  border-color: #3B82F6;
}
```

**Tailwind:**
```html
<div class="flex border-b border-gray-100">
  <button class="px-5 py-4 text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-200 transition-all">
    Gestión de Marcas
  </button>
  <button class="px-5 py-4 text-sm text-blue-600 font-medium border-b-2 border-blue-600">
    Clientes Relacionados
  </button>
</div>
```

---

## 📝 Inputs y Formularios

**Nota:** Todos los inputs usan **border-radius: 9999px** (Pill Shape)

### 1. Input de Texto

```css
.input-text {
  width: 100%;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  font-size: 14px;
  color: #111827;
  padding: 14px 20px;
  transition: all 0.15s;
  outline: none;
}

.input-text:hover:not(:disabled) {
  border-color: #D1D5DB;
  background: #FAFAFA;
}

.input-text:focus {
  border-color: #3B82F6;
  border-width: 2px;
  padding: 13px 19px;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  background: #FFFFFF;
}

.input-text::placeholder {
  color: #9CA3AF;
}

.input-text--error {
  border-color: #EF4444;
  background: #FEF2F2;
}

.input-text:disabled {
  background: #F3F4F6;
  border-color: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}
```

**Tailwind:**
```html
<!-- Normal -->
<input 
  type="text" 
  placeholder="Ej. Coca-Cola"
  class="w-full h-12 bg-white border border-gray-200 rounded-full px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 hover:bg-gray-50 focus:border-blue-600 focus:border-2 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
/>

<!-- Con error -->
<input 
  type="text"
  value="Valor inválido"
  class="w-full h-12 bg-red-50 border border-red-500 rounded-full px-5 py-3.5 text-sm text-gray-900 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
/>

<!-- Deshabilitado -->
<input 
  type="text"
  value="No editable"
  disabled
  class="w-full h-12 bg-gray-100 border border-gray-200 rounded-full px-5 py-3.5 text-sm text-gray-400 cursor-not-allowed"
/>
```

---

### 2. Label

```css
.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  display: block;
  margin-left: 4px;
}

.input-label__optional {
  font-weight: 400;
  color: #9CA3AF;
  margin-left: 4px;
}
```

**Tailwind:**
```html
<label class="text-sm font-medium text-gray-700 mb-1.5 block ml-1">
  Denominación
</label>

<!-- Con opcional -->
<label class="text-sm font-medium text-gray-700 mb-1.5 block ml-1">
  Clase <span class="font-normal text-gray-400 ml-1">(Opcional)</span>
</label>
```

---

### 3. Search Input

```css
.search-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.search-input {
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  font-size: 14px;
  color: #111827;
  padding: 12px 20px 12px 48px;
  transition: all 0.15s;
  outline: none;
  width: 100%;
}

.search-input__icon {
  position: absolute;
  left: 16px;
  width: 18px;
  height: 18px;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.search-input:focus + .search-input__icon {
  color: #3B82F6;
}
```

**Tailwind:**
```html
<div class="relative w-full">
  <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none peer-focus:text-blue-600" />
  <input 
    type="search"
    placeholder="Buscar marcas, expedientes..."
    class="peer w-full h-11 bg-white border border-gray-200 rounded-full pl-12 pr-5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
  />
</div>
```

---

### 4. Select / Dropdown

```css
.select-trigger {
  width: 100%;
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  font-size: 14px;
  color: #374151;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.15s;
}

.select-trigger:hover {
  border-color: #D1D5DB;
}

.select-trigger--open {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  padding: 6px;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  font-size: 14px;
  color: #374151;
  min-height: 36px;
}

.select-option:hover {
  background: #F3F4F6;
}

.select-option--selected {
  background: #EEF2FF;
  color: #3B82F6;
  font-weight: 500;
}
```

**Tailwind:**
```html
<div class="relative w-full">
  <div class="w-full h-11 bg-white border border-gray-200 rounded-full px-5 py-3 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-all">
    <span class="text-sm text-gray-700">Seleccionar opción...</span>
    <ChevronDownIcon class="w-4 h-4 text-gray-500" />
  </div>
  
  <!-- Dropdown (cuando está abierto) -->
  <div class="absolute top-[calc(100%+4px)] left-0 z-50 w-full max-h-[280px] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-1.5">
    <div class="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-sm text-gray-700">
      <div class="w-2 h-2 rounded-full bg-green-500"></div>
      <span>Activas</span>
    </div>
    <div class="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer bg-blue-50 text-blue-600 font-medium text-sm">
      <div class="w-2 h-2 rounded-full bg-amber-500"></div>
      <span>En Proceso</span>
    </div>
  </div>
</div>
```

---

### 5. Textarea / Chat Input

```css
.textarea {
  width: 100%;
  min-height: 80px;
  max-height: 200px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #111827;
  padding: 16px 20px;
  padding-right: 56px;
  resize: vertical;
  transition: all 0.15s;
  outline: none;
}

.textarea:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.chat-input-wrapper {
  position: relative;
  width: 100%;
}

.chat-input__send-button {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 36px;
  height: 36px;
  background: #E5E7EB;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-input__send-button:hover {
  background: #DBEAFE;
  color: #3B82F6;
}
```

**Tailwind:**
```html
<div class="relative w-full">
  <textarea
    placeholder="Describe los detalles de la solicitud..."
    rows="3"
    class="w-full min-h-[80px] max-h-[200px] bg-white border border-gray-200 rounded-[16px] px-5 py-4 pr-14 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 resize-y focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
  ></textarea>
  
  <button class="absolute right-3 bottom-3 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
    <PaperAirplaneIcon class="w-5 h-5 -ml-0.5" />
  </button>
</div>
```

---

## 🏷️ Badges y Pills

### 1. Status Badges

**Uso:** Indicadores de estado (Activo/Inactivo)

```css
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.badge-status::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.badge-status--active {
  color: #22C55E;
}

.badge-status--active::before {
  background: #22C55E;
}

.badge-status--inactive {
  color: #6B7280;
}

.badge-status--inactive::before {
  background: #6B7280;
}
```

**Tailwind:**
```html
<!-- Activo -->
<span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-green-500">
  <span class="w-2 h-2 rounded-full bg-green-500"></span>
  Activo
</span>

<!-- Inactivo -->
<span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
  <span class="w-2 h-2 rounded-full bg-gray-500"></span>
  Inactivo
</span>
```

---

### 2. Timeline Pills

**Uso:** Urgente (Azul), Crítico (Rojo), Normal (Azul Claro)

```css
.pill-urgent {
  background: #3B82F6;
  color: white;
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.pill-critical {
  background: #EF4444;
  color: white;
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.pill-normal {
  background: #EFF6FF;
  color: #3B82F6;
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}
```

**Tailwind:**
```html
<!-- Urgente -->
<span class="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-medium">
  Plazo vence en 3 días
</span>

<!-- Crítico -->
<span class="bg-red-500 text-white rounded-full px-3 py-1 text-xs font-medium">
  Plazo vence en 7 días
</span>

<!-- Normal -->
<span class="bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
  Plazo vence en 3 semanas
</span>
```

---

## 📊 Progress Bars

### Colores Oficiales

```css
/* Azul Sólido */
.progress-blue {
  background: #3B82F6;
}

/* Gradiente Azul a Verde */
.progress-gradient-success {
  background: linear-gradient(to right, #3B82F6, #10B981);
}

/* Gradiente Rojo a Naranja */
.progress-gradient-danger {
  background: linear-gradient(to right, #EF4444, #F97316);
}

/* Rojo Sólido */
.progress-red {
  background: #EF4444;
}

/* Naranja Sólido */
.progress-orange {
  background: #F97316;
}
```

**Tailwind:**
```html
<div class="space-y-1">
  <!-- Label y porcentaje -->
  <div class="flex justify-between text-xs text-gray-500 font-medium mb-1">
    <span>Marcas Activas</span>
    <span>75%</span>
  </div>
  
  <!-- Barra -->
  <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
    <div class="h-full bg-blue-600 rounded-full" style="width: 75%"></div>
  </div>
</div>

<!-- Con gradiente -->
<div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
  <div class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style="width: 60%"></div>
</div>

<!-- Crítico -->
<div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
  <div class="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style="width: 90%"></div>
</div>
```

---

## 📐 Reglas Generales

### Border Radius

| Elemento | Valor | Uso |
|----------|-------|-----|
| Contenedores principales | `16px` | Cards, wrappers |
| Tarjetas seleccionables | `12px` | AddOns, feature cards |
| Botones | `9999px` | Pill shape |
| Inputs | `9999px` | Pill shape |
| Textarea | `16px` | Áreas de texto |

### Shadows

```css
/* Sombra suave (default) */
box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);

/* Sombra media (hover) */
box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);

/* Sombra con color (botones primarios) */
box-shadow: 0 4px 12px rgba(59,130,246,0.1);
```

### Transiciones

```css
/* Estándar */
transition: all 0.2s ease-in-out;

/* Rápida (hover sutil) */
transition: all 0.15s;

/* Lenta (animaciones complejas) */
transition: all 0.3s;
```

### Colores de Estado

| Estado | Border | Background | Ring |
|--------|--------|------------|------|
| Normal | `#E5E7EB` | `#FFFFFF` | - |
| Hover | `#3B82F6` | `#FFFFFF` | - |
| Active/Selected | `#3B82F6` | `#EEF2FF` | `1px #3B82F6` |
| Error | `#EF4444` | `#FEF2F2` | - |
| Disabled | `#E5E7EB` | `#F3F4F6` | - |

---

## ✅ Checklist de Implementación

Al crear un nuevo componente, verifica:

- [ ] Usa `rounded-[16px]` para contenedores principales
- [ ] Usa `rounded-xl` (12px) para tarjetas seleccionables
- [ ] Usa `rounded-full` para botones e inputs
- [ ] Las sombras son consistentes: `shadow-sm` por defecto, `shadow-md` en hover
- [ ] Los colores de estado siguen la tabla oficial
- [ ] Las transiciones son suaves (`0.15s` - `0.3s`)
- [ ] Los bordes hover usan `border-blue-600` o `border-blue-500`
- [ ] Los estados activos usan `bg-blue-50` + `ring-1 ring-blue-600`
- [ ] La tipografía sigue las variantes oficiales
- [ ] No hay animaciones de `transform` no documentadas

---

## 🔗 Referencias

- Página de estilos: `/estilos`
- Font: Plus Jakarta Sans
- Colores primarios: Blue 600 (`#3B82F6`), Blue 700 (`#2563EB`)
- Framework: Tailwind CSS

---

**Última actualización:** Enero 2026
**Versión:** 1.0.0
