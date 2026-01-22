'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TermTemplate } from '@/lib/types/terms';
import { PaymentMethod } from '@/lib/types/payment'; // Ensure this type exists or create/mock it
import { doc, onSnapshot, getDoc } from 'firebase/firestore'; // Added imports
import AddOnsSelector from './components/AddOnsSelector';
import { toast } from 'react-hot-toast'; // Added toast for notifications
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/app/components/ui/sheet";
import RequirementsAIModal from "@/components/modals/RequirementsAIModal";
import PaymentAIModal from "@/components/modals/PaymentAIModal";
import InputGroup, { AIButton } from "@/app/components/InputGroup";
import {
  SparklesIcon,
  UserIcon,
  BuildingOfficeIcon,
  BoltIcon,
  ClockIcon,
  MapPinIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";


interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  tiempo: string;
}

export default function CotizacionEstructuradaForm() {
  const params = useParams();
  const router = useRouter();
  const tipo = params.tipo as string;

  // Wizard Steps: 1 = Form, 2 = Add Ons
  const [step, setStep] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [activeConfigAddOn, setActiveConfigAddOn] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  /* State for Dynamic Terms */
  const [termsTemplates, setTermsTemplates] = useState<TermTemplate[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  /* State for Bank and Billing */
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]); // Using any for now to match UI or define type
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string | null>(null);

  const [userBilling, setUserBilling] = useState<any>(null);
  const [billingRequestEnabled, setBillingRequestEnabled] = useState(false);

  // States for AI Modals
  // Needs
  const [needsModalOpen, setNeedsModalOpen] = useState(false);
  const [needsOptions, setNeedsOptions] = useState<string[]>([]);
  const [needsLoading, setNeedsLoading] = useState(false);

  // Times
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [timeLoading, setTimeLoading] = useState(false);

  // Requirements
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiOptions, setAiOptions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Payment
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<string[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Configuraciones por tipo de cotización
  const tiposConfig: Record<string, any> = {
    '1': { // Honorarios Fijos
      pricingType: 'fix',
      payment: 'Pago único por servicio específico',
      payments: 'Un solo pago al completar el servicio',
      pricing: 'Tarifa fija establecida'
    },
    '2': { // Cotización por Hora
      pricingType: 'variable',
      payment: 'Pago basado en horas trabajadas',
      payments: 'Facturación mensual según horas',
      pricing: 'Tarifa por hora multiplicada por tiempo trabajado'
    },
    '3': { // Retainer
      pricingType: 'fix',
      payment: 'Pago mensual anticipado',
      payments: 'Cuota fija mensual',
      pricing: 'Anticipo que cubre servicios futuros durante el período'
    },
    '4': { // Contingencia
      pricingType: 'variable',
      payment: 'Pago basado en resultado exitoso',
      payments: 'Porcentaje del monto recuperado',
      pricing: 'Entre 20-40% del resultado obtenido'
    },
    '5': { // Proyecto
      pricingType: 'fix',
      payment: 'Precio total acordado para el proyecto',
      payments: '50% al inicio, 50% al finalizar',
      pricing: 'Precio fijo por proyecto completo'
    },
    '6': { // Iguala/Suscripción
      pricingType: 'fix',
      payment: 'Cuota mensual o anual',
      payments: 'Pago recurrente mensual/anual',
      pricing: 'Suscripción con servicios ilimitados o con límite de horas'
    }
  };

  // States for Service Selector
  const { user } = useAuth(); // Moved up

  const [formData, setFormData] = useState({
    quotationName: '',
    client: '',
    contextDescription: '',
    clientNeed: '',
    times: '',
    location: '',
    requirements: '',
    payments: tiposConfig[tipo]?.payments || '',
    payment: tiposConfig[tipo]?.payment || '',
    pricingType: tiposConfig[tipo]?.pricingType || 'fix',
    pricing: tiposConfig[tipo]?.pricing || '',
    details: '',
    frequency: '',
    hourlyRate: '',
    estimatedHours: '',
    retainerAmount: '',
    successFee: '',
    projectTotal: '',
    upfrontPayment: '',
    // Add-On specific fields
    notes: '',
    expirationDate: '',
    contactName: '', // Initialized empty, will update effect
    contactEmail: '',
    contactPhone: '',
    includeSignature: false,
    includeAttachments: false
  });

  // Update contact info when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || user.displayName || '',
        contactEmail: prev.contactEmail || user.email || ''
      }));
    }
  }, [user]);

  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    const fetchServicios = async () => {
      if (!user?.uid || !showServiceSelector) return;

      if (servicios.length > 0) return; // Don't refetch if already loaded

      setIsLoadingServices(true);
      try {
        const q = query(
          collection(db, "servicios"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const serviciosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre || "",
          descripcion: doc.data().descripcion || "",
          precio: doc.data().precio || "",
          tiempo: doc.data().tiempo || "",
        })) as Servicio[];

        setServicios(serviciosData);
      } catch (error) {
        console.error("Error fetching servicios:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServicios();
  }, [user?.uid, showServiceSelector]);

  const handleServiceSelect = (serviceId: string) => {
    const servicio = servicios.find(s => s.id === serviceId);
    if (servicio) {
      setFormData(prev => ({
        ...prev,
        quotationName: servicio.nombre || servicio.descripcion,
        // Optional: Update other fields if desired
      }));
    }
  };

  const handleAddOnToggle = (addOnId: string) => {
    const newSelected = new Set(selectedAddOns);
    if (newSelected.has(addOnId)) {
      newSelected.delete(addOnId);
    } else {
      newSelected.add(addOnId);
    }
    setSelectedAddOns(newSelected);
  };

  const handleConfigureAddOn = (addOnId: string) => {
    setActiveConfigAddOn(addOnId);
    setIsSheetOpen(true);

    // Auto-select the add-on if not selected
    if (!selectedAddOns.has(addOnId)) {
      handleAddOnToggle(addOnId);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      // Optional: clear active config after animation
      setTimeout(() => setActiveConfigAddOn(null), 300);
    }
  };

  /* Fetch Terms Templates */
  useEffect(() => {
    const fetchTerms = async () => {
      if (!user) return;

      setLoadingTerms(true);
      try {
        const termsRef = collection(db, 'terms_templates');
        // Assuming we want to fetch terms for the current user
        // If the collection is public/shared, we might not need the 'where' clause
        // For now, let's assuming it's user specific as per "tus plantillas"
        const q = query(termsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const templates: TermTemplate[] = [];
        querySnapshot.forEach((doc) => {
          templates.push({ id: doc.id, ...doc.data() } as TermTemplate);
        });
        setTermsTemplates(templates);
      } catch (error) {
        console.error("Error fetching terms templates:", error);
      } finally {
        setLoadingTerms(false);
      }
    };

    if (user && (activeConfigAddOn === 'specific_tc' || activeConfigAddOn === 'general_tc' || activeConfigAddOn === 'privacy_policy')) {
      fetchTerms();
    }
  }, [user, activeConfigAddOn]);

  /* Fetch Payment Methods */
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) return;
      setLoadingPaymentMethods(true);
      try {
        const paymentRef = doc(db, 'paymentInfo', user.uid);
        const docSnap = await getDoc(paymentRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.methods && typeof data.methods === 'object') {
            // Ensure it's an array
            setPaymentMethods(Object.values(data.methods));
          }
        }
      } catch (error) {
        console.error("Error fetching payment methods", error);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    if (user && activeConfigAddOn === 'bank_account') {
      fetchPaymentMethods();
    }
  }, [user, activeConfigAddOn]);


  /* Fetch User Billing Data */
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) return;
      try {
        const billingRef = doc(db, 'billing', user.uid);
        const docSnap = await getDoc(billingRef);
        if (docSnap.exists()) {
          setUserBilling(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching billing data", error);
      }
    };

    if (user && activeConfigAddOn === 'invoicing_info') {
      fetchBillingData();
    }
  }, [user, activeConfigAddOn]);


  /* Sheet Content Renderer */
  const renderAddOnConfigContent = () => {
    switch (activeConfigAddOn) {
      case 'general_tc':
      case 'specific_tc':
      case 'privacy_policy':
        // Filter templates based on specific selection if needed, or show all
        const filteredTemplates = termsTemplates.filter(t => {
          if (activeConfigAddOn === 'specific_tc') return t.type === 'SPECIFIC';
          if (activeConfigAddOn === 'general_tc') return t.type === 'GENERAL';
          if (activeConfigAddOn === 'privacy_policy') return t.type === 'POLICY';
          return true;
        });

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeConfigAddOn === 'specific_tc' ? 'Términos Específicos' :
                  activeConfigAddOn === 'general_tc' ? 'Términos Generales' : 'Política de Privacidad'}
              </h3>
              <p className="text-sm text-gray-600">Selecciona la plantilla legal para esta sección.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Selecciona los Términos y Condiciones
              </label>

              {loadingTerms ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTermId(template.id)}
                      className={`
                        cursor-pointer p-4 rounded-lg border transition-all
                        ${selectedTermId === template.id
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${selectedTermId === template.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {template.name}
                        </span>
                        {selectedTermId === template.id && (
                          <div className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-2"
                      onClick={() => {/* TODO: Navigate to create term */ }}
                    >
                      <span className="text-lg">+</span> Crear nueva plantilla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex flex-col items-center text-center">
                  <p className="text-sm mb-3">
                    No tienes plantillas de TyC guardadas.
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                    onClick={() => {/* TODO: Navigate to create term logic */ }}
                  >
                    Crear primera plantilla
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'bank_account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cuenta Bancaria</h3>
              <p className="text-sm text-gray-600">Selecciona la cuenta donde deseas recibir el pago.</p>
            </div>

            {loadingPaymentMethods ? (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedBankAccount(JSON.stringify(method))}
                    className={`
                        cursor-pointer p-4 rounded-lg border transition-all
                        ${selectedBankAccount === JSON.stringify(method)
                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                      `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{method.bankName}</p>
                        <p className="text-sm text-gray-500">{method.accountNumber} - {method.accountHolder}</p>
                      </div>
                      {selectedBankAccount === JSON.stringify(method) && (
                        <div className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-2"
                    onClick={() => window.open('/settings/profile', '_blank')}
                  >
                    <span className="text-lg">+</span> Gestionar cuentas bancarias
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex flex-col items-center text-center">
                <p className="text-sm mb-3">
                  No tienes cuentas bancarias guardadas.
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                  onClick={() => window.open('/settings/profile', '_blank')}
                >
                  Agregar cuenta bancaria
                </button>
              </div>
            )}
          </div>
        );
      case 'invoicing_info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos de Facturación</h3>
              <p className="text-sm text-gray-600">Configura cómo se manejará la información fiscal.</p>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => setBillingRequestEnabled(!billingRequestEnabled)}
                className={`
                    cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between
                    ${billingRequestEnabled
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                  `}
              >
                <div>
                  <p className="font-medium text-gray-900">Solicitar datos fiscales al cliente</p>
                  <p className="text-sm text-gray-500">Incluir un formulario o sección para que el cliente ingrese sus datos de facturación.</p>
                </div>
                <div className={`
                    w-6 h-6 rounded border flex items-center justify-center transition-colors
                    ${billingRequestEnabled ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}
                  `}>
                  {billingRequestEnabled && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>

              {userBilling && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tu Información Fiscal (Emisor)</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
                    <p><span className="font-semibold">Razón Social:</span> {userBilling.razonSocial || 'No definida'}</p>
                    <p><span className="font-semibold">RFC:</span> {userBilling.rfc || 'No definido'}</p>
                  </div>
                  <button
                    className="mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-800"
                    onClick={() => window.open('/settings/profile', '_blank')}
                  >
                    Editar mis datos fiscales
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas Adicionales</h3>
              <p className="text-sm text-gray-600">Agrega notas libres, aclaraciones o comentarios finales para el cliente.</p>
            </div>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Escribe aquí tus notas..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none mx-1"
            />
          </div>
        );

      case 'expiration_date':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fecha de Expiración</h3>
              <p className="text-sm text-gray-600">Define hasta cuándo es válida esta cotización.</p>
            </div>
            <input
              type="date"
              value={formData.expirationDate || ''}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
        );

      case 'contact_details':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos de Contacto</h3>
              <p className="text-sm text-gray-600">Información de contacto que aparecerá en la cotización.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none"
                  placeholder="+52 ..."
                />
              </div>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Firma Digital</h3>
              <p className="text-sm text-gray-600">Incluye tu firma digital en el documento.</p>
            </div>
            <div
              onClick={() => handleInputChange('includeSignature', !formData.includeSignature)}
              className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between
                  ${formData.includeSignature
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                `}
            >
              <div>
                <p className="font-medium text-gray-900">Incluir espacio para firma</p>
                <p className="text-xs text-gray-500">Se generará un bloque para firma al final del PDF.</p>
              </div>
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${formData.includeSignature ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}
                  `}>
                {formData.includeSignature && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
            {/* Future: Add draw signature pad here */}
          </div>
        );

      case 'attachments':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjuntos</h3>
              <p className="text-sm text-gray-600">Sube archivos adicionales para anexar a la cotización.</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-gray-900">Haz clic para subir archivos</p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Funcionalidad de carga de archivos próximamente.</p>
          </div>
        );

      default:
        return <div className="p-4 text-center text-gray-500">Selecciona una opción para configurar</div>;
    }
  };

  // AI Generation Functions
  const generateRequirements = async () => {
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const response = await fetch("/api/cotizacion/requerimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcionServicio: `${formData.quotationName} ${formData.contextDescription}`,
          necesidadesCliente: formData.clientNeed,
          jurisdiccion: formData.location,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAiOptions(data.options || []);
      } else {
        toast.error(data.error || "Error al generar sugerencias");
      }
    } catch (error) {
      console.error("Error generando requerimientos:", error);
      toast.error("Error al generar sugerencias");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectRequirement = (selected: string[]) => {
    handleInputChange('requirements', selected.join("\n"));
    setAiModalOpen(false);
  };

  const generatePaymentOptions = async () => {
    setPaymentModalOpen(true);
    setPaymentLoading(true);
    try {
      const response = await fetch("/api/cotizacion/forma-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcionServicio: `${formData.quotationName} ${formData.contextDescription}` }),
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentOptions(data.options || []);
      } else {
        toast.error(data.error || "Error al generar sugerencias de pago");
      }
    } catch (error) {
      console.error("Error generando formas de pago:", error);
      toast.error("Error al generar sugerencias de pago");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSelectPayment = (selected: string) => {
    handleInputChange('payment', selected);
    setPaymentModalOpen(false);
  };

  const generateNeeds = async () => {
    setNeedsModalOpen(true);
    setNeedsLoading(true);
    try {
      const response = await fetch("/api/cotizacion/necesidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcionServicio: `${formData.quotationName} ${formData.contextDescription}` }),
      });
      const data = await response.json();
      if (response.ok) {
        setNeedsOptions(data.options || []);
      } else {
        toast.error(data.error || "Error al generar sugerencias de necesidades");
      }
    } catch (error) {
      console.error("Error generando necesidades:", error);
      toast.error("Error al generar sugerencias de necesidades");
    } finally {
      setNeedsLoading(false);
    }
  };

  const handleSelectNeeds = (selected: string[]) => {
    handleInputChange('clientNeed', selected.join("\n"));
    setNeedsModalOpen(false);
  };

  const generateTimeEstimation = async () => {
    setTimeModalOpen(true);
    setTimeLoading(true);
    try {
      const response = await fetch("/api/cotizacion/estimacion-tiempo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcionServicio: `${formData.quotationName} ${formData.contextDescription}` }),
      });
      const data = await response.json();
      if (response.ok) {
        setTimeOptions(data.options || []);
      } else {
        toast.error(data.error || "Error al generar sugerencias de tiempo");
      }
    } catch (error) {
      console.error("Error generando estimaciones de tiempo:", error);
      toast.error("Error al generar sugerencias de tiempo");
    } finally {
      setTimeLoading(false);
    }
  };

  const handleSelectTime = (selected: string[]) => {
    handleInputChange('times', selected.join("\n"));
    setTimeModalOpen(false);
  };

  const handleGenerateQuote = async () => {
    // 1. Basic Validation
    if (!formData.client || !formData.pricing) {
      toast.error('Por favor completa los campos obligatorios (Cliente y Precio/Monto).');
      return;
    }

    const toastId = toast.loading('Generando cotización...');

    try {
      // 2. Simulate PDF Generation Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Success Feedback
      toast.success('¡Cotización generada exitosamente!', { id: toastId });

      // 4. Redirect or Show Result (Mock implementation)
      // In a real app, this would send data to backend or generate PDF blob
      console.log('Quote Data:', { ...formData, selectedAddOns: Array.from(selectedAddOns), selectedTermId, selectedBankAccount });

      // Optionally redirect to a success page or dashboard
      // router.push('/dashboard'); 

    } catch (error) {
      console.error("Error generating quote:", error);
      toast.error('Hubo un error al generar la cotización.', { id: toastId });
    }
  };

  const handleNextStep = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tiposTitulos: Record<string, string> = {
    '1': 'Honorarios Fijos',
    '2': 'Cotización por Hora',
    '3': 'Retainer',
    '4': 'Contingencia',
    '5': 'Proyecto',
    '6': 'Iguala/Suscripción'
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pl-16">
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push('/cotizacion-estructurada')}
              className="group p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:-translate-x-1">
                <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{tiposTitulos[tipo] || 'Cotización Estructurada'}</h1>
          </div>
          <p className="text-base text-gray-500 ml-10 max-w-2xl">Completa los detalles para generar una cotización profesional y detallada.</p>
        </div>

        {/* Formulario en cuadrícula 3 columnas */}
        {step === 1 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">

              {/* Proyecto (Custom Card) */}
              <div className="col-span-1 group bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-200 transition-all duration-200 focus-within:shadow-[0_0_16px_0_rgba(66,153,225,0.15)] hover:shadow-md h-full">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                        <ClipboardDocumentCheckIcon className="w-5 h-5" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                        Proyecto
                      </label>
                    </div>

                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setShowServiceSelector(false)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${!showServiceSelector ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowServiceSelector(true)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${showServiceSelector ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Servicios
                      </button>
                    </div>
                  </div>

                  {showServiceSelector ? (
                    <div className="relative">
                      {isLoadingServices ? (
                        <div className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-500 text-sm flex items-center gap-2 font-sans">
                          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></span>
                          Cargando servicios...
                        </div>
                      ) : servicios.length > 0 ? (
                        <div className="relative">
                          <select
                            onChange={(e) => handleServiceSelect(e.target.value)}
                            className="w-full px-3 py-2 bg-transparent border-none text-sm focus:ring-0 text-gray-900 appearance-none cursor-pointer font-sans"
                            defaultValue=""
                          >
                            <option value="" disabled>Selecciona un servicio guardado</option>
                            {servicios.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre || s.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="w-full px-3 py-2 bg-gray-50/50 border border-dashed border-gray-300 rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">No tienes servicios guardados</p>
                          <button
                            type="button"
                            onClick={() => window.open('/settings/profile', '_blank')}
                            className="text-xs text-blue-600 font-semibold hover:underline"
                          >
                            Crear un servicio
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.quotationName}
                      onChange={(e) => handleInputChange('quotationName', e.target.value)}
                      placeholder="Nombre del proyecto o referencia"
                      className="w-full px-3 py-2 bg-transparent border-none text-sm min-h-[42px] focus:ring-0 placeholder-gray-400 text-gray-900 font-sans"
                    />
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div className="col-span-1">
                <InputGroup
                  label="Cliente"
                  placeholder="Nombre del cliente o empresa"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e)}
                  icon={<UserIcon className="w-5 h-5" />}
                />
              </div>

              {/* Contexto */}
              <div className="col-span-1">
                <InputGroup
                  label="Contexto"
                  placeholder="Describe brevemente el contexto legal..."
                  value={formData.contextDescription}
                  onChange={(e) => handleInputChange('contextDescription', e)}
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                />
              </div>

              {/* Necesidad */}
              <div className="col-span-1">
                <InputGroup
                  label="Necesidad"
                  placeholder="¿Cuál es el dolor o necesidad principal?"
                  value={formData.clientNeed}
                  onChange={(e) => handleInputChange('clientNeed', e)}
                  icon={<BoltIcon className="w-5 h-5" />}
                >
                  <div className="flex justify-end mt-2">
                    <AIButton onClick={generateNeeds} />
                  </div>
                </InputGroup>
              </div>

              {/* Tiempos */}
              <div className="col-span-1">
                <InputGroup
                  label="Tiempos"
                  placeholder="Estimación de tiempo de entrega..."
                  value={formData.times}
                  onChange={(e) => handleInputChange('times', e)}
                  icon={<ClockIcon className="w-5 h-5" />}
                >
                  <div className="flex justify-end mt-2">
                    <AIButton onClick={generateTimeEstimation} />
                  </div>
                </InputGroup>
              </div>

              {/* Jurisdicción */}
              <div className="col-span-1">
                <InputGroup
                  label="Jurisdicción"
                  placeholder=""
                  icon={<MapPinIcon className="w-5 h-5" />}
                >
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-none text-sm focus:ring-0 text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar jurisdicción</option>
                    <option value="México">México</option>
                    <option value="USA">USA</option>
                  </select>
                </InputGroup>
              </div>

              {/* Requerimientos */}
              <div className="col-span-1">
                <InputGroup
                  label="Requerimientos"
                  placeholder="Lista de entregables o condiciones..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e)}
                  icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
                >
                  <div className="flex justify-end mt-2">
                    <AIButton onClick={generateRequirements} />
                  </div>
                </InputGroup>
              </div>

              {/* Esquema de Pago */}
              <div className="col-span-1">
                <InputGroup
                  label="Esquema de Pago"
                  placeholder="Detalla los hitos de pago..."
                  value={formData.payments}
                  onChange={(e) => handleInputChange('payments', e)}
                  icon={<CreditCardIcon className="w-5 h-5" />}
                />
              </div>

              {/* Método de Pago */}
              <div className="col-span-1">
                <InputGroup
                  label="Método de Pago"
                  placeholder="Transferencia, tarjeta, etc..."
                  value={formData.payment}
                  onChange={(e) => handleInputChange('payment', e)}
                  icon={<CreditCardIcon className="w-5 h-5" />}
                >
                  <div className="flex justify-end mt-2">
                    <AIButton onClick={generatePaymentOptions} />
                  </div>
                </InputGroup>
              </div>

              {/* Honorarios / Pricing Section */}
              {(() => {
                switch (tipo) {
                  case '4': // Contingencia
                    return (
                      <>
                        <div className="col-span-1">
                          <InputGroup
                            label="% de Éxito"
                            placeholder="Ej. 20"
                            value={formData.successFee}
                            onChange={(e) => handleInputChange('successFee', e)}
                            icon={<div className="w-5 h-5 font-bold text-gray-500 flex items-center justify-center">%</div>}
                          />
                        </div>
                        <div className="col-span-1">
                          <InputGroup
                            label="Monto Estimado"
                            placeholder="Monto base sobre el que aplica"
                            value={formData.pricing}
                            onChange={(e) => handleInputChange('pricing', e)}
                            icon={<CurrencyDollarIcon className="w-5 h-5" />}
                          />
                        </div>
                      </>
                    );
                  case '2': // Hourly
                    return (
                      <div className="col-span-1">
                        <InputGroup
                          label="Honorarios por Hora"
                          placeholder=""
                          icon={<CurrencyDollarIcon className="w-5 h-5" />}
                        >
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tarifa</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                                <input
                                  type="number"
                                  value={formData.hourlyRate}
                                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Horas</label>
                              <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                                placeholder="Ej. 10"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                              />
                            </div>
                          </div>
                          {formData.hourlyRate && formData.estimatedHours && (
                            <div className="mt-3 bg-blue-50 p-2 rounded-lg flex justify-between items-center px-4">
                              <span className="text-sm font-medium text-blue-700">Total Estimado:</span>
                              <span className="text-sm font-bold text-blue-800">
                                ${(parseFloat(formData.hourlyRate) * parseFloat(formData.estimatedHours)).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </InputGroup>
                      </div>
                    );
                  case '6': // Subscription
                    return (
                      <div className="col-span-1">
                        <InputGroup
                          label="Suscripción"
                          placeholder=""
                          icon={<CurrencyDollarIcon className="w-5 h-5" />}
                        >
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Monto</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                                <input
                                  type="number"
                                  value={formData.pricing}
                                  onChange={(e) => handleInputChange('pricing', e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Frecuencia</label>
                              <select
                                value={formData.frequency}
                                onChange={(e) => handleInputChange('frequency', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 appearance-none cursor-pointer font-medium text-sm"
                              >
                                <option value="">Seleccionar</option>
                                <option value="Mensual">Mensual</option>
                                <option value="Bimestral">Bimestral</option>
                                <option value="Trimestral">Trimestral</option>
                                <option value="Semestral">Semestral</option>
                                <option value="Anual">Anual</option>
                              </select>
                            </div>
                          </div>
                        </InputGroup>
                      </div>
                    );
                  default: // Standard
                    return (
                      <div className="col-span-1">
                        <InputGroup
                          label="Honorarios"
                          placeholder="Monto total del servicio"
                          value={formData.pricing}
                          onChange={(e) => handleInputChange('pricing', e)}
                          icon={<CurrencyDollarIcon className="w-5 h-5" />}
                        />
                      </div>
                    );
                }
              })()}

              {/* Notas Adicionales */}
              <div className="col-span-1">
                <InputGroup
                  label="Notas Adicionales"
                  placeholder="Cualquier otro detalle relevante..."
                  value={formData.details}
                  onChange={(e) => handleInputChange('details', e)}
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                />
              </div>

            </div>

            {/* Sticky Footer for Actions */}
            <div className="sticky bottom-0 bg-white/100 backdrop-blur-md border-t border-gray-200 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mt-auto">
              <div className="max-w-6xl mx-auto flex justify-end gap-4">
                <button
                  onClick={() => router.push('/cotizacion-estructurada')}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
                >
                  <span>Siguiente paso</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* STEP 2: Add Ons */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <AddOnsSelector
              selectedAddOns={selectedAddOns}
              onToggle={handleAddOnToggle}
              onConfigure={handleConfigureAddOn}
            />

            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetContent className="sm:max-w-md w-full">
                <SheetHeader>
                  <SheetTitle>Configurar Opción</SheetTitle>
                  <SheetDescription>
                    Personaliza los detalles para esta sección.
                  </SheetDescription>
                </SheetHeader>
                {renderAddOnConfigContent()}
              </SheetContent>
            </Sheet>

            {/* Action Buttons Step 2 */}
            <div className="flex justify-between items-center mt-8 pb-12 max-w-2xl mx-auto">
              <button
                onClick={handleBackStep}
                className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Atrás</span>
              </button>

              <button
                onClick={handleGenerateQuote}
                className="px-8 py-3 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
              >
                <span>Generar Cotización</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RequirementsAIModal
        isOpen={aiModalOpen}
        loading={aiLoading}
        options={aiOptions}
        onClose={() => setAiModalOpen(false)}
        onSelect={handleSelectRequirement}
      />
      <PaymentAIModal
        isOpen={paymentModalOpen}
        loading={paymentLoading}
        options={paymentOptions}
        onClose={() => setPaymentModalOpen(false)}
        onSelect={handleSelectPayment}
      />
      <RequirementsAIModal
        isOpen={needsModalOpen}
        loading={needsLoading}
        options={needsOptions}
        onClose={() => setNeedsModalOpen(false)}
        onSelect={handleSelectNeeds}
        customTitle="Sugerencias de Necesidades del Cliente"
      />
      <RequirementsAIModal
        isOpen={timeModalOpen}
        loading={timeLoading}
        options={timeOptions}
        onClose={() => setTimeModalOpen(false)}
        onSelect={handleSelectTime}
        customTitle="Sugerencias de Tiempo Estimado"
      />
    </div>
  );
}
