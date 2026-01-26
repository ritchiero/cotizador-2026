'use client';
import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import ServiceForm from './ServiceForm';
import { formatPrice } from '@/lib/hooks/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CreateServiceModal from '@/components/modals/CreateServiceModal';
import RequirementsAIModal from "@/components/modals/RequirementsAIModal";
import { useServiceFilters } from '@/lib/hooks/useServiceFilters';
import type { Service } from '@/lib/types/service';
import type { PricingSuggestionResponse } from '@/lib/types/api';

interface ServicesTabProps {
  userId: string;
  servicios: Service[];
  onServiciosUpdate: (servicios: Service[]) => void;
}

// === CONSTANTES DE ESTILOS ===
const INPUT_CLASS = "w-full h-12 px-5 border border-[#E5E7EB] rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB]";

const TEXTAREA_CLASS = "w-full px-5 py-4 border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB] resize-none leading-relaxed";

const BUTTON_PRIMARY = "px-6 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-full text-sm font-medium hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5";

const BUTTON_SECONDARY = "px-6 py-2.5 text-sm font-medium text-[#374151] border border-[#D1D5DB] rounded-full hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-all";

const BUTTON_AI = "text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-sm font-medium";

// === COMPONENTES DE ÍCONOS ===
const ClockIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoneyIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SparkleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function ServicesTab({ userId, servicios, onServiciosUpdate }: ServicesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editedService, setEditedService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [precioError, setPrecioError] = useState(false);
  const [userMoneda, setUserMoneda] = useState<'MXN' | 'USD'>('MXN');
  const { user } = useAuth();
  const router = useRouter();
  // Estado para nuevo servicio
  const [newService, setNewService] = useState({
    nombre: '',
    descripcion: '',
    detalles: '',
    tiempo: '',
    precio: '',
    incluye: [''],
    requerimientos: '',
    userId: '',
    userEmail: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'active'
  });
  // Estado para el modal de requerimientos IA
  const [isRequirementsAIModalOpen, setIsRequirementsAIModalOpen] = useState(false);
  const [requirementsOptions, setRequirementsOptions] = useState<string[]>([]);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados para sugerencias de IA en campos del formulario
  const [tiempoSuggestions, setTiempoSuggestions] = useState<string[]>([]);
  const [loadingTiempoSuggestions, setLoadingTiempoSuggestions] = useState(false);
  const [showTiempoSuggestions, setShowTiempoSuggestions] = useState(false);

  // Estados para sugerencias de precio con IA
  const [precioSuggestions, setPrecioSuggestions] = useState<PricingSuggestionResponse | null>(null);
  const [loadingPrecioSuggestions, setLoadingPrecioSuggestions] = useState(false);
  const [showPrecioSuggestions, setShowPrecioSuggestions] = useState(false);

  // Estados para búsqueda y filtros
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    priceRange,
    setPriceRange,
    getFilteredAndSortedServices,
    clearFilters,
  } = useServiceFilters(servicios);
  const [showFilters, setShowFilters] = useState(false);

  const { complete, isLoading: isAILoading } = useCompletion({
    api: '/api/openai/chat',
    onResponse: () => { },
    onFinish: () => { },
    onError: (error) => {
      console.error('[AI Error Event]:', {
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });
      setError(`Error: ${error.message}`);
    }
  });

  // Cargar moneda preferida del usuario
  useEffect(() => {
    const loadUserMoneda = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserMoneda(userData.monedaPreferida || 'MXN');
        }
      } catch (error) {
        console.error('Error loading user moneda:', error);
      }
    };

    loadUserMoneda();
  }, [userId]);

  const handleNewServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'precio') {
      setNewService(prev => ({
        ...prev,
        [name]: formatPrice(value)
      }));
      if (value.trim()) {
        setPrecioError(false);
      }
    } else {
      setNewService(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddIncludeItem = () => {
    setNewService(prev => ({
      ...prev,
      incluye: [...prev.incluye, '']
    }));
  };

  const handleIncludeItemChange = (index: number, value: string) => {
    setNewService(prev => ({
      ...prev,
      incluye: prev.incluye.map((item, i) => i === index ? value : item)
    }));
  };

  const handleRemoveIncludeItem = (index: number) => {
    setNewService(prev => ({
      ...prev,
      incluye: prev.incluye.filter((_, i) => i !== index)
    }));
  };

  const handleCreateService = async () => {
    try {
      setIsLoading(true);

      // Validar campos requeridos excepto precio
      if (!newService.nombre || !newService.descripcion || !newService.detalles || !newService.tiempo) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      if (!newService.precio) {
        setPrecioError(true);
        setIsLoading(false);
        return;
      }

      // Filtrar items vacíos de incluye
      const itemsIncluidos = newService.incluye.filter(item => item.trim() !== '');

      if (itemsIncluidos.length === 0) {
        throw new Error('Debes incluir al menos un elemento en la lista de incluidos');
      }

      if (!user || !user.uid) {
        // Si no hay usuario o no tiene `uid`, no permitas continuar con la acción
        console.error("Usuario no autenticado o sin uid");
        return;
      }

      // Crear objeto del servicio
      const servicioData = {
        ...newService,
        incluye: itemsIncluidos,
        moneda: userMoneda, // Usar moneda preferida del usuario
        userId: user?.uid,
        userEmail: user?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      // Guardar en Firestore
      const serviciosRef = collection(db, 'servicios');
      await addDoc(serviciosRef, servicioData);

      // Limpiar el formulario
      setNewService({
        nombre: '',
        descripcion: '',
        detalles: '',
        tiempo: '',
        precio: '',
        incluye: [''],
        requerimientos: '',
        userId: '',
        userEmail: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });
      setPrecioError(false);

      // Cerrar modal
      setIsCreateModalOpen(false);

      // Mostrar mensaje de éxito
      toast.success('El servicio ha sido agregado al catálogo exitosamente');

    } catch (error: any) {
      console.error('Error al crear servicio:', error);
      toast.error(error.message || 'Hubo un error al crear el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIServiceCreate = async () => {
    if (!aiPrompt.trim()) {
      setError('Por favor, describe el servicio que deseas crear');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el servicio');
      }

      if (!user?.uid || !user?.email) {
        throw new Error('El usuario no está autenticado');
      }

      const data = await response.json();
      if (data) {
        setNewService({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          detalles: data.detalles || '',
          tiempo: data.tiempo || '',
          precio: '',
          incluye: Array.isArray(data.incluye) ? data.incluye : [],
          requerimientos: '',
          userId: user?.uid || '',
          userEmail: user?.email || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active'
        });

        setIsAIModalOpen(false);
        setIsCreateModalOpen(true);
        setAiPrompt('');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al generar el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener sugerencias de tiempo con IA
  const fetchTiempoSuggestions = async () => {
    if (!newService.nombre && !newService.descripcion) {
      toast.error('Ingresa primero el nombre o descripción del servicio');
      return;
    }

    try {
      setLoadingTiempoSuggestions(true);
      const descripcion = newService.nombre || newService.descripcion;

      const response = await fetch('/api/cotizacion/estimacion-tiempo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcionServicio: descripcion })
      });

      if (response.ok) {
        const data = await response.json();
        setTiempoSuggestions(data.options || []);
        setShowTiempoSuggestions(true);
      }
    } catch (error) {
      console.error('Error al obtener sugerencias de tiempo:', error);
      toast.error('Error al obtener sugerencias');
    } finally {
      setLoadingTiempoSuggestions(false);
    }
  };

  // Función para obtener sugerencias de precio con IA
  const fetchPrecioSuggestions = async () => {
    if (!newService.nombre || !newService.descripcion || !newService.detalles) {
      toast.error('Completa nombre, descripción y detalles para obtener sugerencias de precio');
      return;
    }

    try {
      setLoadingPrecioSuggestions(true);
      setShowPrecioSuggestions(false);

      const response = await fetch('/api/ai/suggest-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newService.nombre,
          descripcion: newService.descripcion,
          detalles: newService.detalles,
          tiempo: newService.tiempo,
          incluye: newService.incluye.filter(item => item.trim() !== ''),
          userId: user?.uid || ''
        })
      });

      if (!response.ok) {
        throw new Error('Error al obtener sugerencias');
      }

      const data = await response.json();
      setPrecioSuggestions(data);
      setShowPrecioSuggestions(true);

      // Toast informativo si usa tarifa default
      if (data.tarifaHorariaUsada === 1500 && data.modeloCobro === 'HOURLY') {
        toast('Usando tarifa promedio. Configura tu tarifa en Settings → Perfil', {
          icon: 'ℹ️',
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Error al obtener sugerencias de precio:', error);
      toast.error('No se pudo obtener sugerencias de precio');
    } finally {
      setLoadingPrecioSuggestions(false);
    }
  };

  // Agregar la función para eliminar servicio
  const handleDeleteService = async (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el modal de detalles

    try {
      const isConfirmed = window.confirm('¿Estás seguro de que deseas eliminar este servicio?');

      if (isConfirmed) {
        const serviceRef = doc(db, 'servicios', serviceId);
        await deleteDoc(serviceRef);
        toast.success('Servicio eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  // Agregar estas funciones para manejar los items en modo edición
  const handleEditIncludeItemChange = (index: number, value: string) => {
    setEditedService(prev => {
      if (prev === null) {
        return null;
      }

      return {
        ...prev,
        incluye: prev.incluye?.map((item, i) => i === index ? value : item) || ['']
      };
    });
  };

  const handleAddEditIncludeItem = () => {
    setEditedService(prev => {
      if (prev === null) {
        return null;  // Si el estado es null, no hacemos nada y retornamos null
      }

      return {
        ...prev,
        incluye: [...(prev.incluye || []), '']
      };
    });
  };

  const handleRemoveEditIncludeItem = (index: number) => {
    setEditedService(prev => {
      if (prev === null) {
        return null;  // Si el estado es null, no hacemos nada y retornamos null
      }

      return {
        ...prev,
        incluye: (prev.incluye || []).filter((_, i) => i !== index)
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Si el campo es 'precio', formateamos el valor antes de actualizar
    if (name === 'precio') {
      setEditedService(prev => {
        if (prev === null) return null; // Evitamos errores si el servicio es null

        return {
          ...prev,
          [name]: formatPrice(value), // Formateamos el precio
        };
      });
    } else {
      setEditedService(prev => {
        if (prev === null) return null; // Evitamos errores si el servicio es null

        return {
          ...prev,
          [name]: value, // Actualizamos el campo correspondiente
        };
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);

      // Validar campos requeridos
      if (!editedService?.nombre || !editedService?.descripcion || !editedService?.detalles || !editedService?.tiempo || !editedService?.precio) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      // Filtrar items vacíos de incluye
      const itemsIncluidos = editedService?.incluye.filter(item => item.trim() !== '') || [];

      if (itemsIncluidos.length === 0) {
        throw new Error('Debes incluir al menos un elemento en la lista de incluidos');
      }

      if (!user || !user.uid) {
        console.error("Usuario no autenticado o sin uid");
        return;
      }

      // Crear objeto del servicio con los datos actualizados
      const servicioData = {
        ...editedService,
        incluye: itemsIncluidos,
        userId: user?.uid,
        userEmail: user?.email,
        updatedAt: serverTimestamp(),
      };

      // Guardar en Firestore
      const serviceRef = doc(db, 'servicios', editedService.id);
      await updateDoc(serviceRef, servicioData);
      // Actualizar el servicio seleccionado para que se vean los cambios en el modal de detalles
      setSelectedService({
        ...servicioData,
        id: editedService.id,
        userEmail: servicioData.userEmail || '', // Aseguramos que userEmail nunca sea null
        updatedAt: new Date() // Usar Date en lugar de serverTimestamp() para el estado local
      });

      // Cerrar modal de edición
      setIsEditModalOpen(false);

      // Mostrar mensaje de éxito
      toast.success('Servicio actualizado exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar servicio:', error);
      toast.error(error.message || 'Hubo un error al actualizar el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (service: Service) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Evitar que se abra el modal de detalles
    setEditedService(service);
    setIsEditModalOpen(true); // Usar el nuevo estado para el modal de edición
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service); // Establece el servicio seleccionado en el estado
    setIsModalOpen(true); // Abre un modal para mostrar los detalles del servicio
  };

  const handleSolicitarServicio = (service: Service) => {
    // Codificar los datos del servicio para pasarlos en la URL de forma segura
    const serviceData = encodeURIComponent(JSON.stringify({
      descripcion: service.descripcion,
      tiempo: service.tiempo,
      precio: service.precio,
      nombre: service.nombre,
      detalles: service.detalles,
      incluye: service.incluye
    }));

    // Navegar a cotización-express con los datos
    router.push(`/cotizacion-express?service=${serviceData}`);
  };

  return (
    <div className="w-full px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header del Tab - Sin card contenedora */}
      <div className="px-8 pt-6 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Catálogo de Servicios Legales</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los servicios que ofreces a tus clientes
            </p>
          </div>
          <div className="flex justify-end">
            {/* Botón móvil */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="md:hidden flex items-center gap-1 text-base font-medium text-gray-600 hover:text-primary"
            >
              <SparklesIcon className="h-4 w-4" />
              Crear con IA
            </button>
            {/* Botones desktop con estilo del sistema maestro */}
            <div className="hidden md:grid grid-cols-3 gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </button>
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-[#3B82F6] text-[#3B82F6] text-sm font-medium hover:bg-blue-50 transition-all"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Crear con IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Servicios */}
      <div className="p-4 md:p-8">
        {servicios.length > 0 ? (
          <>
            {/* Barra de búsqueda y controles */}
            <div className="space-y-4 mb-6">
              {/* Fila superior: Búsqueda y controles principales */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Barra de búsqueda */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-5 py-3 border border-[#E5E7EB] rounded-full focus:ring-0 focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] text-sm transition-all outline-none hover:border-[#D1D5DB] bg-white placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Controles de ordenamiento y vista */}
                <div className="flex items-center gap-2">
                  {/* Ordenamiento */}
                  <div className="flex items-center gap-1">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field as 'nombre' | 'precio' | 'tiempo' | 'fecha');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="text-base border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="nombre-asc">Nombre A-Z</option>
                      <option value="nombre-desc">Nombre Z-A</option>
                      <option value="precio-asc">Precio menor</option>
                      <option value="precio-desc">Precio mayor</option>
                      <option value="fecha-desc">Más reciente</option>
                      <option value="fecha-asc">Más antiguo</option>
                    </select>
                  </div>

                  {/* Botón de filtros */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-full border transition-all ${showFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'}`}
                    title="Filtros"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </button>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-200 mx-1"></div>

                  {/* Toggle de vista */}
                  <div className="flex bg-white rounded-full border border-gray-200 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-full transition-all ${viewMode === 'grid'
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'}`}
                      title="Vista en cuadrícula"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-full transition-all ${viewMode === 'list'
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'}`}
                      title="Vista en lista"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel de filtros expandible */}
              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    {/* Filtro de precio */}
                    <div className="flex-1">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Rango de precio
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Mín"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Máx"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Botón limpiar filtros */}
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-base text-gray-600 hover:text-gray-800 underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Contador de resultados */}
              <div className="flex items-center justify-between text-base text-gray-600">
                <div>
                  {getFilteredAndSortedServices().length} de {servicios.length} {servicios.length === 1 ? 'servicio' : 'servicios'}
                  {searchTerm && (
                    <span> • Búsqueda: <strong>&quot;{searchTerm}&quot;</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Vista en cuadrícula mejorada */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getFilteredAndSortedServices().map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={() => handleServiceClick(servicio)}
                    className="group relative bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
                  >
                    {/* Botón de eliminar */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => handleDeleteService(servicio.id, e)}
                        className="p-2 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <span className="text-xl font-bold">{servicio.nombre.charAt(0)}</span>
                        </div>
                      </div>

                      {/* Título del servicio */}
                      <h3 className="text-lg font-bold text-[#0E162F] group-hover:text-blue-600 transition-colors line-clamp-2">
                        {servicio.nombre}
                      </h3>
                      {/* Descripción */}
                      <p className="text-sm text-[#3B3D45] line-clamp-2 leading-relaxed h-10">
                        {servicio.descripcion}
                      </p>

                      {/* Precio y tiempo */}
                      <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                        <span className="text-lg font-bold text-[#0E162F]">
                          {formatPrice(servicio.precio)}
                          <span className="text-xs font-medium text-gray-400 ml-1">{servicio.moneda || userMoneda}</span>
                        </span>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 w-full">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="block text-xs font-medium text-gray-600 truncate" title={servicio.tiempo}>
                            {servicio.tiempo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vista en lista compacta */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {getFilteredAndSortedServices().map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={() => handleServiceClick(servicio)}
                    className="group relative bg-white rounded-xl border border-gray-100 p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:bg-gray-50 hover:border-blue-100"
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">
                          {servicio.nombre.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#0E162F] group-hover:text-blue-600 transition-colors truncate">
                            {servicio.nombre}
                          </h3>
                          <p className="text-xs text-[#3B3D45] truncate opacity-80">
                            {servicio.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="block text-xs font-medium text-gray-600 truncate max-w-[120px] sm:max-w-[140px]" title={servicio.tiempo}>
                            {servicio.tiempo}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-[#0E162F] w-24 text-right">
                          {formatPrice(servicio.precio)}
                        </span>

                        {/* Botón de eliminar */}
                        <button
                          onClick={(e) => handleDeleteService(servicio.id, e)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Estado cuando no hay resultados de búsqueda/filtros */}
            {getFilteredAndSortedServices().length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-base text-gray-500 mb-4">
                  {searchTerm || priceRange.min || priceRange.max
                    ? 'No hay servicios que coincidan con los filtros aplicados.'
                    : 'No hay servicios para mostrar.'}
                </p>
                {(searchTerm || priceRange.min || priceRange.max) && (
                  <button
                    onClick={clearFilters}
                    className="text-base text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          // Empty state para cuando no hay servicios
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No hay servicios configurados
            </h3>
            <p className="text-base text-gray-500 mb-8 max-w-sm mx-auto">
              Comienza agregando los servicios legales que ofreces a tus clientes
            </p>
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-2 md:gap-4 w-full">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 w-full">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white text-sm font-bold hover:from-[#2563EB] hover:to-[#1D4ED8] w-full md:w-auto shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar servicio
                </button>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-dashed border-blue-200 text-blue-600 text-sm font-bold hover:bg-blue-50 hover:border-blue-400 w-full md:w-auto transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Crear con IA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Botón flotante para nuevo servicio */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        aria-label="Crear nuevo servicio"
        className="md:hidden fixed bottom-4 right-4 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg bg-primary text-white transition-transform duration-150 active:scale-95 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <PlusIcon className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only">Servicio</span>
      </button>

      {/* Modales */}
      {/* Modal de Detalles del Servicio */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-8 space-y-6 font-jakarta">
              {/* Header del Modal */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold text-[#0E162F] leading-tight">
                    {selectedService.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditClick(selectedService)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] hover:border-[#D1D5DB] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                    <ClockIcon className="text-[#3B82F6]" />
                    <span className="text-[14px] font-medium text-[#3B82F6]">{selectedService?.tiempo}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
                    <MoneyIcon className="text-green-600" />
                    <span className="text-[14px] font-medium text-green-700">{selectedService?.precio}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#374151] mb-3">Incluye</h4>
                  <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                    {selectedService?.incluye?.map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-[#F9FAFB] transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <CheckIcon className="text-green-500" />
                        </div>
                        <span className="text-[14px] text-[#111827] font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer del Modal - Estilos del Sistema Maestro */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={BUTTON_SECONDARY}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    if (selectedService) {
                      handleSolicitarServicio(selectedService);
                    }
                  }}
                  className={BUTTON_PRIMARY}
                >
                  Solicitar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear Servicio - MEJORADO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full mx-auto shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header Limpio - Sistema Maestro */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-[18px] font-bold text-[#0E162F]">
                    Crear Nuevo Servicio
                  </h3>
                  <p className="text-sm text-gray-500">
                    Agrega un servicio legal a tu catálogo
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Formulario con Scroll */}
            <div className="overflow-y-auto flex-1 p-8">
              <div className="space-y-6">
                {/* Nombre del Servicio con Contador */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#374151] mb-2 ml-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Nombre del Servicio
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nombre"
                      value={newService.nombre}
                      onChange={handleNewServiceChange}
                      maxLength={60}
                      className={`w-full h-12 px-5 pr-14 border rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB] ${newService.nombre.length >= 60
                        ? 'border-orange-400 bg-orange-50'
                        : newService.nombre.length >= 50
                          ? 'border-yellow-300'
                          : 'border-[#E5E7EB]'
                        }`}
                      placeholder="ej: Constitución de Sociedades Anónimas"
                    />
                    <span className={`absolute right-3 top-2 text-xs font-bold pointer-events-none transition-colors ${newService.nombre.length >= 60
                      ? 'text-orange-600'
                      : newService.nombre.length >= 50
                        ? 'text-yellow-600'
                        : 'text-gray-400'
                      }`}>
                      {newService.nombre.length}/60
                    </span>
                  </div>
                  {newService.nombre.length >= 60 && (
                    <p className="text-xs text-orange-600 flex items-center gap-1 font-medium">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Límite máximo alcanzado
                    </p>
                  )}
                  {newService.nombre.length < 60 && (
                    <p className="text-xs text-gray-500">Nombre claro y profesional del servicio</p>
                  )}
                </div>

                {/* Descripción Corta con Contador */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#374151] mb-2 ml-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Descripción Corta
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="descripcion"
                      value={newService.descripcion}
                      onChange={handleNewServiceChange}
                      maxLength={150}
                      className={`w-full h-12 px-5 pr-16 border rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB] ${newService.descripcion.length >= 150
                        ? 'border-orange-400 bg-orange-50'
                        : newService.descripcion.length >= 130
                          ? 'border-yellow-300'
                          : 'border-[#E5E7EB]'
                        }`}
                      placeholder="Resumen ejecutivo del servicio"
                    />
                    <span className={`absolute right-3 top-2 text-xs font-bold pointer-events-none transition-colors ${newService.descripcion.length >= 150
                      ? 'text-orange-600'
                      : newService.descripcion.length >= 130
                        ? 'text-yellow-600'
                        : 'text-gray-400'
                      }`}>
                      {newService.descripcion.length}/150
                    </span>
                  </div>
                  {newService.descripcion.length >= 150 && (
                    <p className="text-xs text-orange-600 flex items-center gap-1 font-medium">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Límite máximo alcanzado
                    </p>
                  )}
                  {newService.descripcion.length < 150 && (
                    <p className="text-xs text-gray-500">Descripción breve para mostrar en el catálogo</p>
                  )}
                </div>

                {/* Descripción Detallada con Contador */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#374151] mb-2 ml-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descripción Detallada
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <textarea
                    name="detalles"
                    value={newService.detalles}
                    onChange={handleNewServiceChange}
                    rows={6}
                    className="w-full px-5 py-4 border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB] resize-none leading-relaxed"
                    placeholder="Descripción completa del servicio, proceso y beneficios esperados..."
                  />
                  <p className="text-xs text-gray-500 ml-1">Incluye: qué es el servicio, cómo se ejecuta y beneficios específicos</p>
                </div>

                {/* Tiempo y Precio en Grid Mejorado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tiempo Estimado con IA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#374151] mb-2 ml-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tiempo Estimado
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={fetchTiempoSuggestions}
                        disabled={loadingTiempoSuggestions || (!newService.nombre && !newService.descripcion)}
                        className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-sm font-medium"
                      >
                        {loadingTiempoSuggestions ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Generando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="hidden sm:inline">Generar con IA</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      name="tiempo"
                      value={newService.tiempo}
                      onChange={handleNewServiceChange}
                      onFocus={() => setShowTiempoSuggestions(false)}
                      className="w-full h-12 px-5 border rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB] border-[#E5E7EB]"
                      placeholder="ej: 2-3 semanas"
                    />

                    {/* Sugerencias de IA */}
                    {showTiempoSuggestions && tiempoSuggestions.length > 0 && (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-2 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Sugerencias de IA
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {tiempoSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNewService(prev => ({ ...prev, tiempo: suggestion }));
                                setShowTiempoSuggestions(false);
                              }}
                              className="px-2.5 py-1 bg-white border-2 border-purple-200 rounded-md text-sm text-gray-700 hover:border-purple-400 hover:bg-purple-50 transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Precio Base con Sugerencia IA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#374151] mb-2 ml-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Precio Base
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={fetchPrecioSuggestions}
                        disabled={loadingPrecioSuggestions || !newService.nombre || !newService.descripcion || !newService.detalles}
                        className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-sm font-medium"
                      >
                        {loadingPrecioSuggestions ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Analizando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="hidden sm:inline">Sugerir Precio</span>
                            <span className="sm:hidden">IA</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      {/* Indicador de campo vacío */}
                      {!newService.precio.replace('$', '').replace(/[,\s]/g, '').trim() && (
                        <div className="absolute inset-0 rounded-xl bg-yellow-100 border-2 border-yellow-400 animate-pulse pointer-events-none"></div>
                      )}
                      <span className={`absolute left-4 top-3.5 font-semibold text-sm z-10 ${!newService.precio.replace('$', '').trim() ? 'text-yellow-600' : 'text-gray-500'}`}>$</span>
                      <input
                        type="text"
                        name="precio"
                        value={newService.precio.replace('$', '')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          handleNewServiceChange({
                            target: {
                              name: 'precio',
                              value: formatPrice(value)
                            }
                          } as React.ChangeEvent<HTMLInputElement>);
                          if (value) setPrecioError(false);
                        }}
                        className={`w-full h-12 pl-8 pr-5 border rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none relative z-10 bg-white ${precioError
                          ? 'border-red-500 bg-red-50'
                          : !newService.precio.replace('$', '').replace(/[,\s]/g, '').trim()
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                          }`}
                        placeholder="0.00"
                      />
                    </div>
                    {precioError && (
                      <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Campo obligatorio
                      </p>
                    )}

                    {/* Sugerencias de Precio con IA */}
                    {showPrecioSuggestions && precioSuggestions && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 space-y-3 shadow-sm">
                        {/* Header con badge de modelo */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-bold text-green-700">
                              {precioSuggestions.modeloCobro === 'FLAT_FEE' ? 'Tarifa Fija de Mercado' :
                                precioSuggestions.modeloCobro === 'HOURLY' ? `Basado en tu tarifa ($${precioSuggestions.tarifaHorariaUsada.toLocaleString('es-MX')}/hr)` :
                                  'Modelo Mixto'}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${precioSuggestions.complejidad === 'alto' ? 'bg-red-100 text-red-700' :
                            precioSuggestions.complejidad === 'medio' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {precioSuggestions.complejidad.toUpperCase()}
                          </span>
                        </div>

                        {/* 3 Rangos de Precio */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const precio = Math.round(precioSuggestions.rangoSugerido.minimo);
                              setNewService(prev => ({
                                ...prev,
                                precio: `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              }));
                              setShowPrecioSuggestions(false);
                              setPrecioError(false);
                            }}
                            className="bg-white border-2 border-green-300 rounded-lg p-2 hover:border-green-500 hover:shadow-md transition-all group"
                          >
                            <div className="text-xs text-gray-500 mb-1">Mínimo</div>
                            <div className="text-sm font-bold text-gray-900">
                              ${precioSuggestions.rangoSugerido.minimo.toLocaleString('es-MX')}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const precio = Math.round(precioSuggestions.rangoSugerido.promedio);
                              setNewService(prev => ({
                                ...prev,
                                precio: `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              }));
                              setShowPrecioSuggestions(false);
                              setPrecioError(false);
                            }}
                            className="bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-600 rounded-lg p-2 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <div className="text-xs text-white font-bold">Recomendado</div>
                            </div>
                            <div className="text-base font-bold text-white">
                              ${precioSuggestions.rangoSugerido.promedio.toLocaleString('es-MX')}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const precio = Math.round(precioSuggestions.rangoSugerido.maximo);
                              setNewService(prev => ({
                                ...prev,
                                precio: `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              }));
                              setShowPrecioSuggestions(false);
                              setPrecioError(false);
                            }}
                            className="bg-white border-2 border-green-300 rounded-lg p-2 hover:border-green-500 hover:shadow-md transition-all"
                          >
                            <div className="text-xs text-gray-500 mb-1">Máximo</div>
                            <div className="text-sm font-bold text-gray-900">
                              ${precioSuggestions.rangoSugerido.maximo.toLocaleString('es-MX')}
                            </div>
                          </button>
                        </div>

                        {/* Justificación */}
                        <div className="bg-white/60 rounded p-2">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {precioSuggestions.justificacion}
                          </p>
                        </div>

                        {/* Horas estimadas (solo para hourly) */}
                        {precioSuggestions.modeloCobro === 'HOURLY' && (
                          <p className="text-xs text-gray-600">
                            <strong>Horas estimadas:</strong> {precioSuggestions.horasEstimadas.minimo}-{precioSuggestions.horasEstimadas.maximo} hrs
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Incluye - Lista Mejorada */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#374151] mb-2 ml-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Incluye
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                    {newService.incluye.map((item, index) => (
                      <div key={index} className="flex gap-2 group">
                        <div className="flex items-center justify-center w-8 h-12 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg font-bold text-sm flex-shrink-0 shadow-sm">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleIncludeItemChange(index, e.target.value)}
                          className="flex-1 h-12 px-5 bg-white border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#3B82F6] text-[#111827] text-sm transition-all outline-none hover:border-[#D1D5DB] shadow-sm"
                          placeholder="ej: Elaboración del acta constitutiva"
                        />
                        {newService.incluye.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIncludeItem(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddIncludeItem}
                      className="w-full mt-2 h-12 border-2 border-dashed border-[#E5E7EB] rounded-xl text-sm text-[#3B82F6] hover:text-[#2563EB] hover:border-[#BFDBFE] hover:bg-blue-50/50 font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar otro ítem
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 ml-1 flex items-start gap-1">
                    <svg className="w-3.5 h-3.5 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lista los entregables específicos y tangibles del servicio
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Mejorado - Sistema Maestro */}
            <div className="flex justify-end gap-3 px-8 pb-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewService({
                    nombre: '',
                    descripcion: '',
                    detalles: '',
                    tiempo: '',
                    precio: '',
                    incluye: [''],
                    requerimientos: '',
                    userId: '',
                    userEmail: '',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    status: 'active'
                  });
                  setPrecioError(false);
                }}
                className={BUTTON_SECONDARY}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateService}
                disabled={isLoading}
                className={`${BUTTON_PRIMARY} disabled:opacity-50 flex items-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Crear Servicio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Servicio - Sistema Maestro */}
      {isEditModalOpen && editedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-8 space-y-6 font-jakarta">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0E162F]">
                    Editar Servicio
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditedService(null);
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulario de edición con Sistema Maestro */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2 ml-1">
                    Nombre del Servicio
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editedService?.nombre || ''}
                    onChange={handleInputChange}
                    className="w-full h-12 px-5 border border-[#E5E7EB] rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB]"
                    placeholder="ej: Constitución de Sociedades"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2 ml-1">
                    Descripción Corta
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={editedService?.descripcion || ''}
                    onChange={handleInputChange}
                    className="w-full h-12 px-5 border border-[#E5E7EB] rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB]"
                    placeholder="Breve descripción del servicio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2 ml-1">
                    Descripción Detallada
                  </label>
                  <textarea
                    name="detalles"
                    value={editedService?.detalles || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-5 py-4 border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB] resize-none"
                    placeholder="Descripción completa del servicio..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2 ml-1">
                      Tiempo Estimado
                    </label>
                    <input
                      type="text"
                      name="tiempo"
                      value={editedService?.tiempo || ''}
                      onChange={handleInputChange}
                      className="w-full h-12 px-5 border border-[#E5E7EB] rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB]"
                      placeholder="ej: 2-3 semanas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2 ml-1">
                      Precio Base
                    </label>
                    <input
                      type="text"
                      name="precio"
                      value={editedService?.precio || ''}
                      onChange={handleInputChange}
                      className="w-full h-12 px-5 border border-[#E5E7EB] rounded-full text-sm text-[#111827] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none hover:border-[#D1D5DB]"
                      placeholder="$0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-3 ml-1">
                    Incluye
                  </label>
                  <div className="space-y-3">
                    {editedService?.incluye?.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleEditIncludeItemChange(index, e.target.value)}
                          className="flex-1 h-12 px-5 bg-gray-50 border-0 rounded-xl text-sm text-[#111827] focus:ring-2 focus:ring-[#3B82F6] transition-all outline-none"
                          placeholder="ej: Acta constitutiva"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditIncludeItem(index)}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddEditIncludeItem}
                      className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium px-3 py-2 rounded-full hover:bg-blue-50 transition-all"
                    >
                      + Agregar ítem
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer con Sistema Maestro */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditedService(null);
                  }}
                  className={BUTTON_SECONDARY}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={`${BUTTON_PRIMARY} disabled:opacity-50`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Servicio con IA */}
      <CreateServiceModal
        isOpen={isAIModalOpen}
        aiPrompt={aiPrompt}
        onPromptChange={(val) => {
          setAiPrompt(val);
          setError(null);
        }}
        loading={isLoading}
        error={error}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleAIServiceCreate}
      />

      {/* Modal de Requerimientos IA */}
      <RequirementsAIModal
        isOpen={isRequirementsAIModalOpen}
        loading={requirementsLoading}
        options={requirementsOptions}
        onClose={() => setIsRequirementsAIModalOpen(false)}
        onSelect={(opts) => {
          setSelectedRequirements(opts);
          setNewService(prev => ({
            ...prev,
            requerimientos: opts.map(r => `- ${r}`).join('\n')
          }));
        }}
      />
    </div>
  );
} 