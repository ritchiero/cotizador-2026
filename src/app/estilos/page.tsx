'use client';

import React, { useState } from 'react';
import {
    CreditCardIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    PlusIcon,
    XMarkIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    ChartPieIcon,
    ClockIcon,
    CheckCircleIcon,
    ScaleIcon,
    BellAlertIcon,
    ArrowTrendingUpIcon,
    PaperAirplaneIcon,
    TrashIcon,
    CalendarIcon,
    PlayCircleIcon
} from '@heroicons/react/24/outline';
import ProgressTracker from '@/components/ProgressTracker';

export default function EstilosPage() {
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // Progress Tracker Demo State
    const [isTrackerDemoOpen, setIsTrackerDemoOpen] = useState(false);
    const [demoStep, setDemoStep] = useState(0);

    const runTrackerDemo = () => {
        setIsTrackerDemoOpen(true);
        setDemoStep(0);
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step > 4) { // Allow it to "finish"
                clearInterval(interval);
                setTimeout(() => setIsTrackerDemoOpen(false), 1000);
            } else {
                setDemoStep(step);
            }
        }, 1500);
    };

    const demoSteps = [
        { title: 'Iniciando búsqueda', description: 'Preparando motores de búsqueda' },
        { title: 'Buscando en Marcanet y MARcia', description: 'Consultando bases de datos oficiales' },
        { title: 'Combinando resultados', description: 'Procesando coincidencias fonéticas' },
        { title: 'Generando documento PDF', description: 'Formateando reporte final' }
    ];

    return (
        <div className="min-h-screen bg-[#F5F6F8] p-8 font-jakarta text-gray-900 pb-32">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900">📋 Reporte de Estilos - Lawgic P.I. (Completo & Oficial)</h1>
                    <p className="text-gray-500 max-w-2xl">
                        Documentación visual viva e integral. Incluye Tipografía Oficial, Inputs Redondeados, Botones Pill-Shape y las nuevas Feature Cards (Timelines).
                    </p>
                    <div className="h-1 w-full bg-gray-200 rounded-full"></div>
                </div>

                {/* 
                  ========================================
                  1. COLORES DE FONDO
                  ========================================
                */}
                <section className="space-y-6">
                    <SectionHeader number="1" title="Colores de Fondo" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ColorCard name="Fondo General" hex="#F7F8FA" bgClass="bg-[#F7F8FA]" border />
                        <ColorCard name="Sidebar / Content" hex="#FFFFFF" bgClass="bg-white" border />
                        <ColorCard name="Cards" hex="#FFFFFF" bgClass="bg-white" border />
                        <ColorCard name="Alert Bg" hex="#FFF8E6" bgClass="bg-[#FFF8E6]" border />
                    </div>
                </section>

                {/* 
                  ========================================
                  2. CARDS / CAJAS (UPDATED WITH FEATURE CARDS)
                  ========================================
                */}
                <section className="space-y-8">
                    <SectionHeader number="2" title="Catálogo de Cards / Cajas" />

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 1. Card Contenedor Principal */}
                        <StyleBlock title="1. Contenedor Principal" description="Para secciones mayores (Timelines, Portafolio)">
                            <div className="w-full card-container">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Estado del Portafolio</h3>
                                <p className="text-gray-500 text-sm">Contenido principal de la sección...</p>
                            </div>
                        </StyleBlock>

                        {/* 2. Tool Card */}
                        <StyleBlock title="2. Tool Card" description="Navegación 'Tools a tu alcance'">
                            <div className="flex gap-4">
                                <div className="tool-card group">
                                    <ScaleIcon className="tool-card__icon" />
                                    <h4 className="tool-card__title">Analizar<br />Contrato</h4>
                                </div>
                                <div className="tool-card group">
                                    <BellAlertIcon className="tool-card__icon" />
                                    <h4 className="tool-card__title">Alertas<br />Vigentes</h4>
                                </div>
                            </div>
                        </StyleBlock>
                    </div>

                    {/* NEW: Feature Cards (Timelines) */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <StyleBlock title="3. Feature Card (Timelines)" description="Tarjetas de módulo (Activa e Inactiva)">
                            <div className="flex gap-6">
                                {/* Inactive State */}
                                <div className="feature-card group">
                                    <div className="feature-card__icon-wrapper">
                                        <CalendarIcon className="w-6 h-6 text-[#2563EB]" />
                                    </div>
                                    <h4 className="feature-card__title">Timelines</h4>
                                </div>

                                {/* Active State */}
                                <div className="feature-card feature-card--active">
                                    <div className="feature-card__icon-wrapper">
                                        <CalendarIcon className="w-6 h-6 text-[#2563EB]" />
                                    </div>
                                    <h4 className="feature-card__title">Timelines</h4>
                                </div>
                            </div>
                        </StyleBlock>

                        {/* 3. KPI Cards (FIXED COLORS) */}
                        <StyleBlock title="4. Métricas / KPI Cards (Fixed)" description="Azul sólido y Rojo sólido">
                            <div className="flex flex-col gap-4 w-full">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="metric-card metric-card--blue">
                                        <span className="metric-card__label">REGISTRADAS</span>
                                        <span className="metric-card__value">1,240</span>
                                    </div>
                                    <div className="metric-card metric-card--blue">
                                        <span className="metric-card__label">MONITOREADAS</span>
                                        <span className="metric-card__value">892</span>
                                    </div>
                                </div>
                            </div>
                        </StyleBlock>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 5. Alert Banner (FIXED BORDER) */}
                        <StyleBlock title="5. Alert Banner (Fixed)" description="Borde izquierdo naranja #F59E0B">
                            <div className="alert-banner">
                                <div className="alert-banner__content">
                                    <h4 className="alert-banner__title">Vencimientos Próximos</h4>
                                    <p className="alert-banner__subtitle">Tienes 776 marcas que requieren atención hoy.</p>
                                </div>
                                <a href="#" className="alert-banner__action">Ver lista</a>
                            </div>
                        </StyleBlock>

                        {/* 6. List Item Card */}
                        <StyleBlock title="6. List Item Card" description="Elementos de lista interactivos">
                            <div className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden">
                                <div className="list-item-card px-4">
                                    <div className="list-item-card__content">
                                        <h4 className="list-item-card__title">NIKE, INC.</h4>
                                        <p className="list-item-card__subtitle text-[#EF4444]">Declaración de uso pendiente</p>
                                    </div>
                                    <span className="list-item-card__metadata">Hace 2 días</span>
                                </div>
                            </div>
                        </StyleBlock>
                    </div>
                </section>

                {/* 
                  ========================================
                  3. TIPOGRAFÍA (SYSTEM MASTER VARIANTS)
                  ========================================
                */}
                <section className="space-y-6">
                    <SectionHeader number="3" title="Tipografía Oficial (Sistema Maestro)" />
                    <div className="bg-white p-8 rounded-xl border border-gray-200">
                        <div className="grid gap-8">

                            {/* VARIANT 1: 18px #0E162F */}
                            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-100 pb-6">
                                <div className="w-full md:w-1/3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">Variante 1</span>
                                        <span className="text-xs text-gray-400">Headings / Títulos</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs font-mono text-gray-500">
                                        <div>Size: <span className="text-gray-900">18px</span></div>
                                        <div>Line: <span className="text-gray-900">18px</span></div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            Color: <span className="w-3 h-3 rounded-full bg-[#0E162F] border border-gray-200"></span>
                                            <span className="text-gray-900">#0E162F</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-2/3">
                                    <p className="font-jakarta text-[18px] leading-[18px] text-[#0E162F] font-regular">
                                        Plus Jakarta Sans Regular - Título de Ejemplo
                                    </p>
                                </div>
                            </div>

                            {/* VARIANT 2: 16px #3B3D45 */}
                            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-100 pb-6">
                                <div className="w-full md:w-1/3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">Variante 2</span>
                                        <span className="text-xs text-gray-400">Body / Principal</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs font-mono text-gray-500">
                                        <div>Size: <span className="text-gray-900">16px</span></div>
                                        <div>Line: <span className="text-gray-900">18px</span></div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            Color: <span className="w-3 h-3 rounded-full bg-[#3B3D45] border border-gray-200"></span>
                                            <span className="text-gray-900">#3B3D45</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-2/3">
                                    <p className="font-jakarta text-[16px] leading-[18px] text-[#3B3D45] font-regular">
                                        El diseño es inteligencia hecha visible. Texto de cuerpo estándar para lectura cómoda.
                                    </p>
                                </div>
                            </div>

                            {/* VARIANT 3: 12px #1E212A */}
                            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-100 pb-6">
                                <div className="w-full md:w-1/3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">Variante 3</span>
                                        <span className="text-xs text-gray-400">Detalles / Secondary</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs font-mono text-gray-500">
                                        <div>Size: <span className="text-gray-900">12px</span></div>
                                        <div>Line: <span className="text-gray-900">18px</span></div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            Color: <span className="w-3 h-3 rounded-full bg-[#1E212A] border border-gray-200"></span>
                                            <span className="text-gray-900">#1E212A</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-2/3">
                                    <p className="font-jakarta text-[12px] leading-[18px] text-[#1E212A] font-regular">
                                        Información secundaria o detalles técnicos importantes.
                                    </p>
                                </div>
                            </div>

                            {/* VARIANT 4: 12px #8F9095 */}
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full md:w-1/3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">Variante 4</span>
                                        <span className="text-xs text-gray-400">Caption / Metadata</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs font-mono text-gray-500">
                                        <div>Size: <span className="text-gray-900">12px</span></div>
                                        <div>Line: <span className="text-gray-900">16px</span></div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            Color: <span className="w-3 h-3 rounded-full bg-[#8F9095] border border-gray-200"></span>
                                            <span className="text-gray-900">#8F9095</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-2/3">
                                    <p className="font-jakarta text-[12px] leading-[16px] text-[#8F9095] font-regular">
                                        Metadatos, fechas o pies de foto. Texto auxiliar.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 
                  ========================================
                  4. BOTONES (PILL SHAPE FIXED)
                  ========================================
                */}
                <section className="space-y-8">
                    <SectionHeader number="4" title="Catálogo Detallado de Botones (Pill Shape)" />

                    {/* 1. Botón Primario */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <StyleBlock title="1. Botón Primario" description="Acciones principales (Guardar, Buscar, Confirmar)">
                            <div className="flex flex-wrap gap-4 items-center">
                                <button className="btn-primary">
                                    Botón Primario
                                </button>
                                <button className="btn-primary active">
                                    Active State
                                </button>
                                <button className="btn-primary" disabled>
                                    Disabled
                                </button>
                            </div>
                        </StyleBlock>

                        {/* 2. Botón Secundario */}
                        <StyleBlock title="2. Botón Secundario" description="Acciones alternativas (Cancelar, Ver más)">
                            <div className="flex flex-wrap gap-4 items-center">
                                <button className="btn-secondary">
                                    Botón Secundario
                                </button>
                                <button className="btn-secondary active">
                                    Active State
                                </button>
                                <button className="btn-secondary" disabled>
                                    Disabled
                                </button>
                            </div>
                        </StyleBlock>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* 3. Ghost / Text */}
                        <StyleBlock title="3. Ghost / Text Link" description="Enlaces sutiles dentro de componentes">
                            <div className="flex gap-4 items-center">
                                <button className="btn-ghost">
                                    Ver detalles
                                </button>
                                <button className="btn-ghost text-blue-700 underline bg-blue-50/50">
                                    Hover State
                                </button>
                            </div>
                        </StyleBlock>

                        {/* 4. FAB */}
                        <StyleBlock title="4. Floating Action Button" description="Acciones flotantes principales">
                            <div className="flex gap-6 items-center">
                                <button className="btn-fab group">
                                    <PlusIcon className="w-6 h-6" strokeWidth={3} />
                                </button>
                            </div>
                        </StyleBlock>

                        {/* 5. Icon Button */}
                        <StyleBlock title="5. Icon Button" description="Acciones de barra de herramientas">
                            <div className="flex gap-4 items-center">
                                <button className="btn-icon">
                                    <FunnelIcon className="w-5 h-5" />
                                </button>
                                <button className="btn-icon active">
                                    <FunnelIcon className="w-5 h-5" />
                                </button>
                                <button className="btn-icon-circle">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </StyleBlock>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 6. Pagination */}
                        <StyleBlock title="6. Paginación" description="Navegación de listas">
                            <div className="flex items-center gap-2">
                                <button className="btn-pagination" disabled>
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-1">
                                    <button className="w-8 h-8 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-100">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-bold text-white bg-blue-600">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-100">3</button>
                                </div>
                                <button className="btn-pagination">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </StyleBlock>

                        {/* 7. Pill / Badges Buttons */}
                        <StyleBlock title="7. Botón Pill / Warning" description="Alertas interactivas">
                            <div className="flex flex-wrap gap-3">
                                <button className="btn-pill-warning">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    94 Vencimientos
                                </button>
                                <button className="btn-pill-danger">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    2 Conflictos
                                </button>
                            </div>
                        </StyleBlock>
                    </div>

                    {/* 8. Card Button (Selection) */}
                    <StyleBlock title="8. Botón de Selección (Card Button)" description="Opciones grandes en modales/wizards">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <button className="btn-card group">
                                <div className="btn-card-icon group-hover:scale-110 transition-transform">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <span className="font-medium">Número de Expediente</span>
                            </button>

                            <button className="btn-card active">
                                <div className="btn-card-icon">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                <span className="font-medium">Registro de Marca</span>
                            </button>
                        </div>
                    </StyleBlock>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 9. Sidebar Nav Item */}
                        <StyleBlock title="9. Navegación Sidebar" description="Items del menú lateral">
                            <div className="w-64 bg-white p-4 rounded-xl border border-gray-200">
                                <button className="btn-nav mb-2">
                                    <UserCircleIcon className="w-5 h-5" />
                                    <span>Perfil de Usuario</span>
                                </button>
                                <button className="btn-nav active">
                                    <ChartPieIcon className="w-5 h-5" />
                                    <span>Dashboard (Activo)</span>
                                </button>
                            </div>
                        </StyleBlock>

                        {/* 10. Tab Button */}
                        <StyleBlock title="10. Tabs" description="Navegación horizontal de vistas">
                            <div className="bg-white px-6 rounded-xl border border-gray-200 flex border-b border-gray-100">
                                <button className="btn-tab active">
                                    Gestión de Marcas
                                </button>
                                <button className="btn-tab">
                                    Clientes Relacionados
                                </button>
                            </div>
                        </StyleBlock>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 11. Arrow Link */}
                        <StyleBlock title="11. Arrow Link" description="Enlaces de navegación contextual">
                            <div className="flex gap-4">
                                <button className="btn-arrow group">
                                    Marcas procesadas
                                    <span className="group-hover:translate-x-1 transition-transform">›</span>
                                </button>
                            </div>
                        </StyleBlock>
                    </div>
                </section>

                {/* 
                  ========================================
                  5. INPUTS / FORMULARIOS (PILL SHAPE FIXED)
                  ========================================
                */}
                <section className="space-y-8">
                    <SectionHeader number="5" title="Catálogo Detallado de Inputs (Pill Shape)" />

                    {/* 1. Input de Texto Estándar */}
                    <StyleBlock title="Input de Texto" description="Estados: Default, Focus, Error, Disabled">
                        <div className="grid md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-1">
                                <label className="input-label">Denominación</label>
                                <input type="text" placeholder="Ej. Coca-Cola" className="input-text" />
                            </div>
                            <div className="space-y-1">
                                <label className="input-label">Clase <span className="input-label__optional">(Opcional)</span></label>
                                <input type="text" placeholder="Ej. 32" className="input-text" />
                            </div>
                            <div className="space-y-1">
                                <label className="input-label text-red-600">Campo con Error</label>
                                <input type="text" value="Valor inválido" className="input-text input-text--error" />
                            </div>
                            <div className="space-y-1">
                                <label className="input-label text-gray-400">Deshabilitado</label>
                                <input type="text" value="No editable" disabled className="input-text" />
                            </div>
                        </div>
                    </StyleBlock>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 3. Search Input */}
                        <StyleBlock title="3. Search Input" description="Búsqueda con icono integrado">
                            <div className="space-y-4 w-full">
                                <div className="search-input-wrapper w-full">
                                    <MagnifyingGlassIcon className="search-input__icon" />
                                    <input type="text" placeholder="Buscar marcas, expedientes..." className="search-input w-full" />
                                </div>
                            </div>
                        </StyleBlock>

                        {/* 4. Select / Dropdown */}
                        <StyleBlock title="4. Select / Dropdown" description="Selección simple y múltiple">
                            <div className="w-full relative">
                                <label className="input-label">Filtrar por Estado</label>
                                <div
                                    className={`select-trigger ${isSelectOpen ? 'select-trigger--open' : ''}`}
                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                >
                                    <span>Seleccionar opción...</span>
                                    <ChevronDownIcon className="select-trigger__chevron" />
                                </div>

                                {isSelectOpen && (
                                    <div className="select-dropdown">
                                        <div className="select-option">
                                            <div className="select-option__checkbox select-option__checkbox--checked"></div>
                                            <div className="select-option__dot select-option__dot--green"></div>
                                            <span>Activas</span>
                                        </div>
                                        <div className="select-option select-option--selected">
                                            <div className="select-option__checkbox"></div>
                                            <div className="select-option__dot select-option__dot--yellow"></div>
                                            <span>En Proceso</span>
                                        </div>
                                        <div className="select-option">
                                            <div className="select-option__checkbox"></div>
                                            <div className="select-option__dot select-option__dot--red"></div>
                                            <span>Vencidas</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </StyleBlock>
                    </div>

                    {/* 5. Textarea / Chat Input */}
                    <StyleBlock title="5. Textarea / Chat Input" description="Entrada de texto largo con acción">
                        <div className="w-full">
                            <label className="input-label">Descripción del caso</label>
                            <div className="chat-input-wrapper">
                                <textarea
                                    className="textarea"
                                    placeholder="Describe los detalles de la solicitud o haz una pregunta al asistente..."
                                ></textarea>
                                <button className="chat-input__send-button hover:bg-blue-100 hover:text-blue-600 text-gray-500 transition-colors">
                                    <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </StyleBlock>
                </section>

                {/* 
                  ========================================
                  6. BADGES / PILLS (FIXED)
                  ========================================
                */}
                <section className="space-y-8">
                    <SectionHeader number="6" title="Badges & Pills (Corregido)" />

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* FIX: Status Badges (Active/Inactive) */}
                        <StyleBlock title="Status Badges (Fixed)" description="Indicadores de estado (Verde/Gris)">
                            <div className="flex flex-wrap gap-4">
                                <div className="badge-status badge-status--active">Activo</div>
                                <div className="badge-status badge-status--inactive">Inactivo</div>
                            </div>
                        </StyleBlock>

                        {/* FIX: Timeline Pills */}
                        <StyleBlock title="Timeline Pills (Fixed)" description="Urgente (Azul), Crítico (Rojo), Normal (Azul Claro)">
                            <div className="flex flex-wrap gap-3">
                                <div className="pill-urgent">Plazo vence en 3 días</div>
                                <div className="pill-critical">Plazo vence en 7 días</div>
                                <div className="pill-normal">Plazo vence en 3 semanas</div>
                                <div className="pill-normal">Plazo vence en 4 semanas</div>
                            </div>
                        </StyleBlock>
                    </div>

                    {/* Previous Badges Section */}
                    <StyleBlock title="Risk Badges (Legacy)" description="Badges de riesgo previos">
                        <div className="flex flex-wrap gap-4">
                            <Badge text="Activo" color="bg-emerald-50 text-emerald-600" dot="bg-emerald-500" />
                            <Badge text="Pendiente" color="bg-blue-50 text-blue-600" dot="bg-blue-500" />
                        </div>
                    </StyleBlock>
                </section>

                {/* 
                  ========================================
                  11. PROGRESS BARS (FIXED COLORS)
                  ========================================
                */}
                <section className="space-y-8">
                    <SectionHeader number="11" title="Progress Bars (Fixed Colors)" />
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-8 max-w-3xl">

                        <ProgressBar
                            label="Marcas Activas"
                            percent="75%"
                            barClass="bg-[#3B82F6]"
                        />

                        <ProgressBar
                            label="Marcas Monitoreadas"
                            percent="60%"
                            barClass="bg-gradient-to-r from-blue-500 to-emerald-500"
                        />

                        <ProgressBar
                            label="Marcas Vencidas"
                            percent="90%"
                            barClass="bg-gradient-to-r from-red-500 to-orange-500"
                        />

                        <ProgressBar
                            label="Pendientes de Aprobación"
                            percent="45%"
                            barClass="bg-[#EF4444]"
                        />

                        <ProgressBar
                            label="Próximas a Vencer"
                            percent="30%"
                            barClass="bg-[#F97316]"
                        />

                    </div>
                </section>

                {/* 
                  ========================================
                  12. PROGRESS TRACKER (DEMO)
                  ========================================
                */}
                <section className="space-y-8">
                    <SectionHeader number="12" title="Progress Tracker (Vertical Stepper)" />
                    <StyleBlock title="Visualizador de Progreso" description="Componente para procesos de carga largos">
                        <div className="flex flex-col items-center gap-4 py-8">
                            <button
                                onClick={runTrackerDemo}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold"
                            >
                                <PlayCircleIcon className="w-5 h-5" />
                                <span>Ejecutar Demo de Progreso</span>
                            </button>
                            <p className="text-sm text-gray-500">Haz clic para abrir el modal de progreso simulado.</p>
                        </div>
                    </StyleBlock>

                    <ProgressTracker
                        steps={demoSteps}
                        currentStep={demoStep}
                        isVisible={isTrackerDemoOpen}
                    />
                </section>

                {/* CSS Injection to ensure specific styles work */}
                <style jsx global>{`
                    /* ================= BOXES / CARDS ================= */
                    .card-container {
                        background: #FFFFFF; border: 1px solid rgba(229, 231, 235, 0.5); border-radius: 16px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03); padding: 24px; position: relative; overflow: hidden;
                    }
                    .card-container:hover {
                        box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
                    }
                    .tool-card {
                        background: white; width: 140px; min-height: 100px; border: 1px solid #E5E7EB; border-radius: 12px;
                        padding: 16px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: all 0.2s;
                    }
                    .tool-card:hover { 
                        border-color: #3B82F6; box-shadow: 0 4px 12px rgba(59,130,246,0.1); transform: translateY(-2px);
                    }
                    .tool-card:active { transform: translateY(0); }
                    .tool-card__icon { width: 24px; height: 24px; color: #6B7280; transition: color 0.2s; }
                    .tool-card:hover .tool-card__icon { color: #3B82F6; }
                    .tool-card__title { font-size: 14px; font-weight: 500; color: #374151; margin: 0; }

                    /* NEW: Feature Cards (Timelines) */
                    .feature-card {
                        width: 140px; height: 120px; background: white; border: 1px solid #E5E7EB; 
                        border-radius: 16px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;
                        cursor: pointer; transition: all 0.2s;
                    }
                    .feature-card:hover { border-color: #3B82F6; box-shadow: 0 4px 12px rgba(59,130,246,0.1); }
                    .feature-card--active { background: #EEF2FF; border-color: #3B82F6; box-shadow: 0 0 0 1px #3B82F6; }
                    .feature-card__title { font-size: 14px; font-weight: 500; color: #374151; }
                    .feature-card--active .feature-card__title { color: #1E293B; font-weight: 600; }

                    /* FIX: KPI CARDS (SOLID COLORS) */
                    .metric-card {
                        width: 100%; height: 72px; padding: 12px 16px; border-radius: 12px;
                        display: flex; justify-content: space-between; align-items: center;
                        box-shadow: 0 4px 14px rgba(0,0,0,0.1);
                    }
                    .metric-card--blue { background: #3B82F6; color: white; }
                    .metric-card--red { background: #EF4444; color: white; }
                    .metric-card__label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85); letter-spacing: 0.5px; }
                    .metric-card__value { font-size: 32px; font-weight: 700; color: white; line-height: 1; }

                    /* FIX: ALERT BANNER */
                    .alert-banner {
                        background: #FFF8E6; min-height: 64px; border: 1px solid #FDE68A;
                        border-left: 4px solid #F59E0B; /* FIXED: Orange border */
                        border-radius: 12px; box-shadow: 0 2px 8px rgba(245,158,11,0.1);
                        padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
                    }
                    .alert-banner__title { font-size: 15px; font-weight: 600; color: #92400E; }
                    .alert-banner__subtitle { font-size: 13px; font-weight: 400; color: #B45309; }
                    .alert-banner__action { font-size: 14px; font-weight: 600; color: #3B82F6; text-decoration: none; cursor: pointer; }
                    .alert-banner__action:hover { text-decoration: underline; color: #2563EB; }

                    /* 5. List Item Card */
                    .list-item-card {
                        background: white; min-height: 56px; border-bottom: 1px solid #F3F4F6; padding: 12px 0;
                        display: flex; justify-content: space-between; align-items: center; gap: 16px; transition: background 0.15s;
                    }
                    .list-item-card:hover { background: #F9FAFB; }
                    .list-item-card:last-child { border-bottom: none; }
                    .list-item-card__title { font-size: 14px; font-weight: 600; color: #111827; }
                    .list-item-card__subtitle { font-size: 12px; font-weight: 400; }
                    .list-item-card__metadata { font-size: 12px; font-weight: 400; color: #9CA3AF; }

                    /* 6. Conflict Card & Badges */
                    .conflict-card {
                        background: white; min-height: 80px; border-left: 4px solid #3B82F6; padding: 12px 16px;
                        display: flex; flex-direction: column; gap: 8px; transition: all 0.15s; cursor: pointer;
                    }
                    .conflict-card:hover { background: #F9FAFB; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                    .conflict-card__header { display: flex; justify-content: space-between; align-items: center; }
                    .conflict-card__class-badge { font-size: 11px; font-weight: 500; color: #6B7280; }
                    .conflict-card__title { font-size: 14px; font-weight: 600; color: #1F2937; }
                     .badge-critical {
                        background: #FEE2E2; color: #EF4444; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase;
                    }

                     /* ================= BOTONES (FIXED PILL SHAPE) ================= */

                    /* 1. Primary */
                    .btn-primary {
                        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                        color: white; font-size: 14px; font-weight: 500; padding: 10px 24px;
                        border-radius: 9999px; /* FIXED: Pill Shape */
                        box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
                        transition: all 0.2s ease-in-out;
                    }
                    .btn-primary:hover {
                        background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); transform: translateY(-1px);
                    }
                    .btn-primary.active, .btn-primary:active {
                        background: #1D4ED8; transform: translateY(0); box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
                    }
                    .btn-primary:disabled {
                        background: #93C5FD; cursor: not-allowed; box-shadow: none; transform: none;
                    }

                    /* 2. Secondary */
                    .btn-secondary {
                        background: transparent; border: 1px solid #D1D5DB; color: #374151;
                        font-size: 14px; font-weight: 500; padding: 10px 20px; 
                        border-radius: 9999px; /* FIXED: Pill Shape */
                        transition: all 0.2s ease-in-out;
                    }
                    .btn-secondary:hover {
                        background: #F9FAFB; border-color: #9CA3AF; color: #1F2937;
                    }
                    .btn-secondary:active, .btn-secondary.active {
                        background: #F3F4F6; border-color: #6B7280;
                    }
                    .btn-secondary:disabled {
                        background: #F9FAFB; color: #9CA3AF; border-color: #E5E7EB; cursor: not-allowed;
                    }

                    /* 3. Ghost */
                    .btn-ghost {
                         background: transparent; color: #3B82F6; font-size: 14px; font-weight: 500;
                         padding: 6px 12px; border-radius: 9999px; /* FIXED: Round for consistency */
                         transition: all 0.15s;
                    }
                    .btn-ghost:hover {
                        background: rgba(59, 130, 246, 0.08); text-decoration: underline; color: #2563EB;
                    }

                    /* 4. FAB */
                    .btn-fab {
                        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                        color: white; width: 48px; height: 48px; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); transition: all 0.2s;
                    }
                    .btn-fab:hover {
                         background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
                         box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5); transform: scale(1.05);
                    }

                    /* 5. Icon Buttons */
                    .btn-icon {
                         background: transparent; border: 1px solid #E5E7EB; color: #6B7280;
                         width: 40px; height: 40px; border-radius: 10px; display: flex;
                         align-items: center; justify-content: center; transition: all 0.15s;
                    }
                    .btn-icon:hover { background: #F3F4F6; color: #374151; border-color: #D1D5DB; }
                    .btn-icon.active { background: #EEF2FF; color: #3B82F6; border-color: #3B82F6; }
                     .btn-icon-circle {
                        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                        border-radius: 50%; color: #9CA3AF; background: transparent; border: none; transition: all 0.15s;
                    }
                    .btn-icon-circle:hover { background: #F3F4F6; color: #374151; }

                    /* 6. Pagination */
                    .btn-pagination {
                        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                        border-radius: 6px; color: #9CA3AF; transition: all 0.15s;
                    }
                    .btn-pagination:hover:not(:disabled) { background: #F3F4F6; color: #374151; }
                    .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }

                    /* 7. Pills */
                    .btn-pill-warning {
                        background: #FEF3C7; color: #D97706; padding: 8px 16px; font-size: 13px; font-weight: 500;
                        border: 1px solid #FDE68A; border-radius: 9999px; display: inline-flex; items-center; gap: 8px;
                        transition: all 0.15s;
                    }
                    .btn-pill-warning:hover { background: #FDE68A; border-color: #FCD34D; }
                    
                    .btn-pill-danger {
                        background: #FEE2E2; color: #DC2626; padding: 8px 16px; font-size: 13px; font-weight: 500;
                         border: 1px solid #FECACA; border-radius: 9999px; display: inline-flex; gap: 8px; items-center;
                    }

                    /* FIX: PILL BUTTONS (FIXED FONTS/COLORS) */
                    .pill-urgent {
                        background: #3B82F6; color: white; border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 500;
                    }
                    .pill-critical {
                        background: #EF4444; color: white; border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 500;
                    }
                    .pill-normal {
                        background: #EFF6FF; color: #3B82F6; border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 500;
                    }

                     /* FIX: STATUS BADGES */
                    .badge-status {
                        display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;
                    }
                    .badge-status::before {
                        content: ''; display: block; width: 8px; height: 8px; border-radius: 50%;
                    }
                    .badge-status--active { color: #22C55E; }
                    .badge-status--active::before { background: #22C55E; }
                    
                    .badge-status--inactive { color: #6B7280; }
                    .badge-status--inactive::before { background: #6B7280; }


                    /* 8. Card Button */
                    .btn-card {
                        background: white; border: 2px solid #E5E7EB; border-radius: 12px; padding: 20px 24px;
                        width: 100%; text-align: center; color: #374151; transition: all 0.2s;
                        display: flex; flex-direction: column; align-items: center; gap: 12px;
                    }
                    .btn-card:hover { border-color: #3B82F6; background: #F8FAFC; box-shadow: 0 4px 12px rgba(59,130,246,0.1); }
                    .btn-card.active { border-color: #3B82F6; background: #EEF2FF; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                    .btn-card-icon {
                        width: 48px; height: 48px; background: #EEF2FF; border-radius: 12px;
                        color: #3B82F6; display: flex; align-items: center; justify-content: center;
                    }

                    /* 9. Nav Item */
                    .btn-nav {
                        width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px;
                        border-radius: 8px; color: #6B7280; font-size: 14px; transition: all 0.15s;
                    }
                    .btn-nav:hover { background: #F3F4F6; color: #374151; }
                    .btn-nav.active { background: #EEF2FF; color: #3B82F6; font-weight: 500; }

                    /* 10. Tab */
                    .btn-tab {
                        padding: 16px 20px; font-size: 14px; color: #6B7280; border-bottom: 2px solid transparent; transition: all 0.15s;
                    }
                    .btn-tab:hover { color: #374151; border-color: #E5E7EB; }
                    .btn-tab.active { color: #3B82F6; font-weight: 500; border-color: #3B82F6; }

                    /* 11. Arrow Link */
                    .btn-arrow {
                        color: #3B82F6; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;
                        padding: 8px 12px; 
                        border-radius: 9999px; /* FIXED: Pill Shape */
                        transition: all 0.15s;
                    }
                    .btn-arrow:hover { background: rgba(59, 130, 246, 0.08); }


                    /* ================= INPUTS (PILL SHAPE FIXED) ================= */
                    
                    /* 1. Text Input */
                    .input-text {
                        width: 100%; height: 48px; background: #FFFFFF; border: 1px solid #E5E7EB; 
                        border-radius: 9999px; /* FIXED: Pill Shape */
                        font-size: 14px; color: #111827; padding: 14px 20px; transition: all 0.15s; outline: none;
                    }
                    .input-text:hover:not(:disabled) { border-color: #D1D5DB; background: #FAFAFA; }
                    .input-text:focus { border-color: #3B82F6; border-width: 2px; padding: 13px 19px; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); background: #FFFFFF; }
                    .input-text::placeholder { color: #9CA3AF; }
                    .input-text--error { border-color: #EF4444; background: #FEF2F2; }
                    .input-text--error:focus { border-color: #EF4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
                    .input-text:disabled { background: #F3F4F6; border-color: #E5E7EB; color: #9CA3AF; cursor: not-allowed; }

                    /* 2. Label */
                    .input-label { font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; display: block; margin-left: 4px; }
                    .input-label__optional { font-weight: 400; color: #9CA3AF; margin-left: 4px; }

                    /* 3. Search Input */
                    .search-input-wrapper { position: relative; display: inline-flex; align-items: center; width: 100%; }
                    .search-input { 
                        height: 44px; background: #FFFFFF; border: 1px solid #E5E7EB; 
                        border-radius: 9999px; /* FIXED: Pill Shape */
                        font-size: 14px; color: #111827; padding: 12px 20px 12px 48px; transition: all 0.15s; outline: none; width: 100%;
                    }
                    .search-input__icon { position: absolute; left: 16px; width: 18px; height: 18px; color: #9CA3AF; pointer-events: none; }
                    .search-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                    .search-input:focus + .search-input__icon, .search-input-wrapper:focus-within .search-input__icon { color: #3B82F6; }

                    /* 4. Select */
                    .select-trigger {
                        width: 100%; height: 44px; background: #FFFFFF; border: 1px solid #E5E7EB; 
                        border-radius: 9999px; /* FIXED: Pill Shape */
                        font-size: 14px; color: #374151; padding: 12px 20px 12px 20px; display: flex; align-items: center; justify-content: space-between;
                        cursor: pointer; transition: all 0.15s; position: relative;
                    }
                    .select-trigger:hover { border-color: #D1D5DB; }
                    .select-trigger--open { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                    .select-trigger__chevron { width: 16px; height: 16px; color: #6B7280; transition: transform 0.2s; }
                    .select-trigger--open .select-trigger__chevron { transform: rotate(180deg); }
                    
                    .select-dropdown {
                        position: absolute; top: calc(100% + 4px); left: 0; z-index: 50; width: 100%; max-height: 280px; overflow-y: auto;
                        background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); padding: 6px;
                    }
                    .select-option {
                        display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.1s;
                        font-size: 14px; color: #374151; min-height: 36px;
                    }
                    .select-option:hover { background: #F3F4F6; }
                    .select-option--selected { background: #EEF2FF; color: #3B82F6; font-weight: 500; }
                    
                    .select-option__checkbox { width: 16px; height: 16px; border: 1px solid #D1D5DB; border-radius: 4px; background: white; display: flex; align-items: center; justify-content: center; }
                    .select-option__checkbox--checked { background: #3B82F6; border-color: #3B82F6; }
                    .select-option__checkbox--checked::after { content: "✓"; color: white; font-size: 11px; font-weight: 600; }
                    
                    .select-option__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                    .select-option__dot--green { background: #10B981; }
                    .select-option__dot--yellow { background: #F59E0B; }
                    .select-option__dot--red { background: #EF4444; }

                    /* 5. Textarea */
                    .textarea {
                        width: 100%; min-height: 80px; max-height: 200px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px;
                        font-size: 14px; line-height: 22px; color: #111827; padding: 16px 20px; padding-right: 56px; resize: vertical; transition: all 0.15s; outline: none;
                    }
                    .textarea:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                    .chat-input-wrapper { position: relative; width: 100%; }
                    .chat-input__send-button {
                        position: absolute; right: 12px; bottom: 12px; width: 36px; height: 36px; background: #E5E7EB; border: none; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
                    }
                `}</style>
            </div >
        </div >
    );
}

function ProgressBar({ label, percent, barClass }: { label: string, percent: string, barClass: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                <span>{label}</span>
                <span>{percent}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${barClass} rounded-full`} style={{ width: percent }}></div>
            </div>
        </div>
    );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
    return (
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-6">
            <span className="flex items-center justify-center w-auto px-3 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm whitespace-nowrap">
                {number}
            </span>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
    );
}

function StyleBlock({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100 flex items-center justify-center min-h-[100px]">
                {children}
            </div>
        </div>
    );
}

function ColorCard({ name, hex, bgClass, border }: { name: string, hex: string, bgClass: string, border?: boolean }) {
    return (
        <div className="space-y-2">
            <div className={`h-24 w-full rounded-xl shadow-sm ${bgClass} ${border ? 'border border-gray-200' : ''}`}></div>
            <div>
                <p className="font-medium text-gray-800 text-sm">{name}</p>
                <p className="text-xs text-mono text-gray-400">{hex}</p>
            </div>
        </div>
    );
}

function Badge({ text, color, dot }: { text: string, color: string, dot: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
            {text}
        </span>
    );
}
