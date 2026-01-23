'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db, storage } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, doc, onSnapshot, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TermTemplate } from '@/lib/types/terms';
import { PaymentMethod } from '@/lib/types/payment';
import Image from 'next/image';
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
  DocumentTextIcon,
  PencilSquareIcon,
  PaperClipIcon,
  CalendarIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  DocumentIcon,
  BookOpenIcon,
  FaceSmileIcon,
  BriefcaseIcon,
  ChatBubbleLeftEllipsisIcon,
  GlobeAltIcon,
  LanguageIcon
} from "@heroicons/react/24/outline";
import { Calendar } from "@/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";


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

  // Notes AI
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesOptions, setNotesOptions] = useState<string[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

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
  const [brandingData, setBrandingData] = useState<any>(null); // Store branding info
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('upload');

  // States for Payment Method Creation
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] = useState<string>('');
  const [paymentFormData, setPaymentFormData] = useState({
    bank: '',
    clabe: '',
    beneficiary: '',
    cardNumber: '',
    cardHolder: '',
    paypalEmail: '',
    stripeAccount: ''
  });
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);


  // States for inline template creation
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState({ name: '', content: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
    contactEmail: '',
    contactPhone: '',
    includeSignature: false,
    includeAttachments: false,
    attachments: [] as File[] // Store actual files
  });

  // Format & Tone State
  const [formatType, setFormatType] = useState<'one-pager' | 'short' | 'large'>('one-pager'); // A, B, C
  const [toneType, setToneType] = useState<'friendly' | 'formal'>('friendly'); // A, B
  const [languageType, setLanguageType] = useState<'es' | 'en' | 'es-en'>('es'); // A, B, C

  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Stepper Configuration
  const processSteps = [
    { id: 0, title: 'Tipo de Cobro', status: 'completed' },
    { id: 1, title: 'Detalles del Proyecto', status: step === 1 ? 'current' : 'completed' },
    { id: 2, title: 'Opciones Adicionales', status: step === 2 ? 'current' : (step > 2 ? 'completed' : 'pending') },
    { id: 3, title: 'Formato y Tono', status: step === 3 ? 'current' : 'pending' }
  ];

  // Update contact info when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || user.displayName || '',
        contactEmail: prev.contactEmail || user.email || ''
      }));

      // Fetch Branding Info
      const brandingRef = doc(db, 'brandingInfo', user.uid);
      const unsubscribeBranding = onSnapshot(brandingRef, (docSnap) => {
        if (docSnap.exists()) {
          setBrandingData(docSnap.data());
        }
      });

      // Fetch User Profile for language preference
      const loadUserLanguage = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const idioma = userData.idiomaPreferido || 'es';
            setLanguageType(idioma);
          }
        } catch (error) {
          console.error('Error loading user language:', error);
        }
      };

      loadUserLanguage();

      return () => unsubscribeBranding();
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

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    try {
      const storageRef = ref(storage, `logos/${user.uid}/signature_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Save to Branding Info
      const brandingRef = doc(db, 'brandingInfo', user.uid);
      await setDoc(brandingRef, { signatureURL: url }, { merge: true });
      toast.success("Firma actualizada exitosamente");
    } catch (error) {
      console.error("Error uploading signature", error);
      toast.error("Error al subir la firma");
    }
  };

  // Signature Drawing Functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.closePath();
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawnSignature = async () => {
    if (!user || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      // Check if empty
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        toast.error("Por favor dibuja tu firma antes de guardar");
        return;
      }

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const storageRef = ref(storage, `logos/${user.uid}/signature_drawn_${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      // Save to Branding Info
      const brandingRef = doc(db, 'brandingInfo', user.uid);
      await setDoc(brandingRef, { signatureURL: url }, { merge: true });
      toast.success("Firma guardada exitosamente");
      setSignatureMode('upload'); // Switch back to view it
    } catch (error) {
      console.error("Error saving signature", error);
      toast.error("Error al guardar la firma");
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateData.name.trim() || !newTemplateData.content.trim()) {
      toast.error('Nombre y contenido son obligatorios');
      return;
    }
    if (!user?.uid) {
      toast.error('Ocurrió un error (Usuario no identificado)');
      return;
    }

    setSavingTemplate(true);
    try {
      // Determine type based on activeConfigAddOn
      let type = 'GENERAL';
      if (activeConfigAddOn === 'specific_tc') type = 'SPECIFIC';
      else if (activeConfigAddOn === 'privacy_policy') type = 'POLICY';

      await addDoc(collection(db, 'terms_templates'), {
        name: newTemplateData.name,
        content: newTemplateData.content,
        type,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Plantilla creada exitosamente');
      setIsCreatingTemplate(false);
      setNewTemplateData({ name: '', content: '' });
    } catch (error) {
      console.error("Error creating template", error);
      toast.error('Error al crear la plantilla');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validations based on type
    if (selectedPaymentMethodType === 'bank_transfer' || selectedPaymentMethodType === 'bank_account') {
      if (!paymentFormData.beneficiary || !paymentFormData.bank) {
        toast.error('Beneficiario y Banco son obligatorios');
        return;
      }
    }
    if (selectedPaymentMethodType === 'card') {
      if (!paymentFormData.cardNumber || !paymentFormData.cardHolder) {
        toast.error('Número de tarjeta y titular son obligatorios');
        return;
      }
    }
    if (selectedPaymentMethodType === 'paypal' && !paymentFormData.paypalEmail) {
      toast.error('Correo de PayPal obligatorio');
      return;
    }
    if (selectedPaymentMethodType === 'stripe' && !paymentFormData.stripeAccount) {
      toast.error('Cuenta de Stripe obligatoria');
      return;
    }

    try {
      setSavingPaymentMethod(true);
      const id = crypto.randomUUID();

      const newMethod = {
        id,
        type: selectedPaymentMethodType,
        details: { ...paymentFormData },
        isActive: true,
        isDefault: paymentMethods.length === 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const paymentRef = doc(db, 'paymentInfo', user.uid);
      await setDoc(paymentRef, {
        methods: {
          [id]: newMethod
        }
      }, { merge: true });

      setPaymentMethods(prev => [...prev, newMethod]);
      setSelectedBankAccount(JSON.stringify(newMethod));

      // Reset
      setShowPaymentModal(false);
      setSelectedPaymentMethodType('');
      setPaymentFormData({
        bank: '',
        clabe: '',
        beneficiary: '',
        cardNumber: '',
        cardHolder: '',
        paypalEmail: '',
        stripeAccount: ''
      });

      toast.success('Método de pago agregado exitosamente');
    } catch (error) {
      console.error('Error al guardar método:', error);
      toast.error('Error al guardar el método de pago');
    } finally {
      setSavingPaymentMethod(false);
    }
  };

  const availablePaymentMethodTypes = [
    { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
    { id: 'bank_account', name: 'Cuenta de Banco', icon: '💳' },
    { id: 'card', name: 'Depósito en Tarjeta', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '📱' },
    { id: 'stripe', name: 'Stripe', icon: '💰' }
  ];

  const handleAddOnToggle = (addOnId: string) => {
    const isSelected = selectedAddOns.has(addOnId);

    if (isSelected) {
      // Unselect
      const newSelected = new Set(selectedAddOns);
      newSelected.delete(addOnId);
      setSelectedAddOns(newSelected);

      // If we are currently configuring this one, close the sheet
      if (activeConfigAddOn === addOnId) {
        setIsSheetOpen(false);
      }
    } else {
      // Select AND Open Configuration
      const newSelected = new Set(selectedAddOns);
      newSelected.add(addOnId);
      setSelectedAddOns(newSelected);

      setActiveConfigAddOn(addOnId);
      setIsSheetOpen(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    // Convert FileList to Array
    const files = Array.from(e.target.files);
    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Validate size
    const validFiles = files.filter(file => {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`El archivo "${file.name}" excede el límite de ${MAX_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...validFiles]
      }));
      toast.success(`${validFiles.length} archivo(s) agregado(s).`);
    }

    // Reset input value so same file can be selected again if needed
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const handleConfigureAddOn = (addOnId: string) => {
    setActiveConfigAddOn(addOnId);
    setIsSheetOpen(true);

    // Auto-select the add-on if not selected (without toggling)
    if (!selectedAddOns.has(addOnId)) {
      setSelectedAddOns(prev => {
        const next = new Set(prev);
        next.add(addOnId);
        return next;
      });
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
      case 'privacy_policy': {
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : isCreatingTemplate ? (
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Nueva Plantilla</h4>
                    <button
                      onClick={() => setIsCreatingTemplate(false)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={newTemplateData.name}
                        onChange={(e) => setNewTemplateData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-12 px-5 py-3.5 border border-gray-200 rounded-full focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 outline-none text-sm text-gray-900 transition-all"
                        placeholder="Ej. Cláusula Estándar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Contenido</label>
                      <textarea
                        value={newTemplateData.content}
                        onChange={(e) => setNewTemplateData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 outline-none text-sm text-gray-900 resize-y transition-all h-32"
                        placeholder="Escribe el contenido legal aquí..."
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveTemplate}
                        disabled={savingTemplate}
                        className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-full text-sm font-medium hover:from-[#2563EB] hover:to-[#1D4ED8] hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
                      >
                        {savingTemplate ? 'Guardando...' : 'Guardar Plantilla'}
                      </button>
                    </div>
                  </div>
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
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${selectedTermId === template.id ? 'text-blue-900' : 'text-gray-900'}`}>
                          {template.name}
                        </span>
                        {selectedTermId === template.id && (
                          <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2"
                      onClick={() => {
                        setIsCreatingTemplate(true);
                        setNewTemplateData({ name: '', content: '' });
                      }}
                    >
                      <span className="text-lg">+</span> Crear nueva plantilla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex flex-col items-center text-center">
                  <p className="text-sm mb-3">
                    No tienes plantillas guardadas para esta sección.
                  </p>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium rounded-full hover:from-[#2563EB] hover:to-[#1D4ED8] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
                    onClick={() => {
                      setIsCreatingTemplate(true);
                      setNewTemplateData({ name: '', content: '' });
                    }}
                  >
                    Crear primera plantilla
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'bank_account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Métodos de Pago</h3>
              <p className="text-sm text-gray-600">Selecciona el método de pago para recibir pagos de tus clientes.</p>
            </div>

            {loadingPaymentMethods ? (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                          `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 text-lg">
                          {
                            method.type === 'bank_transfer' || method.type === 'bank_account' ? '🏛️' :
                              method.type === 'card' ? '💳' :
                                method.type === 'paypal' ? '📱' : '💰'
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {
                              method.details?.beneficiary ||
                              method.details?.cardHolder ||
                              method.details?.bank ||
                              method.details?.name ||
                              'Método de Pago'
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {
                              method.type === 'card' ? `•••• ${String(method.details?.cardNumber || '').slice(-4)}` :
                                method.type === 'paypal' ? method.details?.paypalEmail :
                                  method.details?.bank ? `${method.details.bank} ••••${String(method.details.accountNumber || method.details.clabe || '').slice(-4)}` :
                                    method.details?.clabe || 'Detalles'
                            }
                          </p>
                        </div>
                      </div>
                      {selectedBankAccount === JSON.stringify(method) && (
                        <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <span className="text-lg">+</span> Agregar método de pago
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex flex-col items-center text-center">
                <p className="text-sm mb-3">
                  No tienes métodos de pago guardados.
                </p>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium rounded-full hover:from-[#2563EB] hover:to-[#1D4ED8] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Agregar método de pago
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
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                  `}
              >
                <div>
                  <p className="font-medium text-gray-900">Solicitar datos fiscales al cliente</p>
                  <p className="text-sm text-gray-500">Incluir un formulario o sección para que el cliente ingrese sus datos de facturación.</p>
                </div>
                <div className={`
                    w-6 h-6 rounded border flex items-center justify-center transition-colors
                    ${billingRequestEnabled ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
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
                    className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800"
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
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-t-xl">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contenido de la nota</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Opcional</span>
              </div>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Escribe aquí cualquier aclaración importante, condiciones especiales o mensajes personalizados para tu cliente..."
                rows={8}
                className="w-full px-5 py-4 bg-white rounded-b-2xl border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 resize-none text-base leading-relaxed"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={generateNotesSuggestions}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                Mejorar con AI
              </button>
            </div>
          </div>
        );

      case 'expiration_date':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fecha de Expiración</h3>
              <p className="text-sm text-gray-600">Define hasta cuándo es válida esta cotización.</p>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal h-12 rounded-xl border-gray-200 ${!formData.expirationDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expirationDate ? (
                    format(new Date(formData.expirationDate + 'T12:00:00'), "dd/MM/yyyy")
                  ) : (
                    <span>dd/mm/aaaa</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expirationDate ? new Date(formData.expirationDate + 'T12:00:00') : undefined}
                  onSelect={(date) => {
                    handleInputChange('expirationDate', date ? format(date, 'yyyy-MM-dd') : '');
                  }}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div >
        );

      case 'contact_details':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 p-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.contactName || ''}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email Profesional</label>
                    <input
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                      placeholder="juan@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.contactPhone || ''}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Estos datos aparecerán en el pie de página de tu cotización.
              </p>
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

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={formData.includeSignature}
                  onChange={(e) => handleInputChange('includeSignature', e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Incluir espacio para firma</span>
                  <p className="text-xs text-gray-500 mt-0.5">Se generará un bloque para firma al final del PDF.</p>
                </div>
              </label>

              {/* Signature Preview/Config */}
              {formData.includeSignature && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSignatureMode('upload')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${signatureMode === 'upload'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Subir Imagen
                    </button>
                    <button
                      onClick={() => setSignatureMode('draw')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${signatureMode === 'draw'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Dibujar Firma
                    </button>
                  </div>

                  {/* Upload Mode */}
                  {signatureMode === 'upload' && (
                    <div className="space-y-3">
                      {brandingData?.signatureURL ? (
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                          <div className="relative w-48 h-24 mb-3 border border-gray-200 bg-white rounded-md overflow-hidden">
                            <Image
                              src={brandingData.signatureURL}
                              alt="Firma"
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <button
                            onClick={() => document.getElementById('sig-upload')?.click()}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            Cambiar firma
                          </button>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                          <p className="text-sm text-orange-800 font-medium mb-3">No tienes una firma configurada</p>
                          <button
                            onClick={() => document.getElementById('sig-upload')?.click()}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                          >
                            Subir Imagen de Firma
                          </button>
                          <p className="text-[10px] text-gray-500 mt-2">Recomendado: Imagen PNG con fondo transparente</p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="sig-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureUpload}
                      />
                    </div>
                  )}

                  {/* Draw Mode */}
                  {signatureMode === 'draw' && (
                    <div className="space-y-4">
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white relative">
                        <canvas
                          ref={canvasRef}
                          width={500}
                          height={200}
                          className="w-full h-40 touch-none cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <div className="flex justify-between gap-3">
                        <button
                          onClick={clearSignature}
                          className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all"
                        >
                          Limpiar
                        </button>
                        <button
                          onClick={saveDrawnSignature}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all"
                        >
                          Guardar Firma
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Dibuja tu firma en el recuadro. Puedes usar el mouse o tu dedo en dispositivos táctiles.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'attachments':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjuntos</h3>
              <p className="text-sm text-gray-600">Sube archivos adicionales para anexar a la cotización.</p>
            </div>

            <div
              onClick={() => document.getElementById('file-upload')?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <PaperClipIcon className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">Haz clic para subir archivos</p>
              <p className="text-xs text-gray-500 mt-1">PDF, Documentos, Imágenes (Max 50MB por archivo)</p>
            </div>

            {/* File List */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Archivos seleccionados ({formData.attachments.length})</h4>
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
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

  const generateNotesSuggestions = async () => {
    setNotesModalOpen(true);
    setNotesLoading(true);
    try {
      const response = await fetch("/api/cotizacion/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcionServicio: `${formData.quotationName} ${formData.contextDescription}`,
          context: formData.details
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotesOptions(data.options || []);
      } else {
        toast.error(data.error || "Error al generar sugerencias de notas");
      }
    } catch (error) {
      console.error("Error generando notas:", error);
      toast.error("Error al generar sugerencias de notas");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSelectNotes = (selected: string[]) => {
    handleInputChange('notes', selected.join("\n\n")); // Join with double newline for paragraphs
    setNotesModalOpen(false);
  };

  const handleGenerateQuote = async () => {
    // 1. Basic Validation
    if (!formData.client || !formData.pricing) {
      toast.error('Por favor completa los campos obligatorios (Cliente y Precio/Monto).');
      return;
    }

    // 1.5 Add-On Validations
    if (selectedAddOns.has('notes') && !formData.notes?.trim()) {
      toast.error('Agregaste "Notas" pero no escribiste contenido.', { duration: 4000 });
      handleConfigureAddOn('notes');
      return;
    }

    if (selectedAddOns.has('expiration_date') && !formData.expirationDate) {
      toast.error('Agregaste "Fecha de Expiración" pero no seleccionaste una fecha.', { duration: 4000 });
      handleConfigureAddOn('expiration_date');
      return;
    }

    if (selectedAddOns.has('bank_account') && !selectedBankAccount) {
      toast.error('Agregaste "Cuenta Bancaria" pero no seleccionaste ninguna.', { duration: 4000 });
      handleConfigureAddOn('bank_account');
      return;
    }

    // Check terms (checking generic selectedTermId - considering current limitation)
    if ((selectedAddOns.has('specific_tc') || selectedAddOns.has('general_tc') || selectedAddOns.has('privacy_policy')) && !selectedTermId) {
      toast.error('Seleccionaste una opción legal pero no elegiste una plantilla.', { duration: 4000 });
      if (selectedAddOns.has('specific_tc')) handleConfigureAddOn('specific_tc');
      else if (selectedAddOns.has('general_tc')) handleConfigureAddOn('general_tc');
      else handleConfigureAddOn('privacy_policy');
      return;
    }

    if (selectedAddOns.has('contact_details') && (!formData.contactName || !formData.contactEmail)) {
      toast.error('Agregaste "Datos de Contacto" pero faltan campos requeridos.', { duration: 4000 });
      handleConfigureAddOn('contact_details');
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
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

        {/* Visual Stepper - Premium Design */}
        <div className="mb-12">
          <div className="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-gray-100">
            <ol className="relative z-10 flex justify-between text-sm font-medium text-gray-500">
              {processSteps.map((stepItem, stepIdx) => {
                const isCompleted = stepItem.status === 'completed';
                const isCurrent = stepItem.status === 'current';

                return (
                  <li key={stepItem.id} className="flex items-center gap-2 bg-gray-50/50 p-2">
                    <span className={`h-8 w-8 rounded-full border-2 text-center text-[10px]/6 font-bold flex items-center justify-center transition-all duration-200
                                    ${isCompleted ? 'border-blue-600 bg-blue-600 text-white' :
                        isCurrent ? 'border-blue-600 bg-white text-blue-600 shadow-md shadow-blue-500/20' :
                          'border-gray-200 bg-white text-gray-500'}
                                `}>
                      {isCompleted ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepItem.id + 1
                      )}
                    </span>
                    <span className={`hidden sm:block ${isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                      {stepItem.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

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
        {/* Formulario en cuadrícula 3 columnas */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">

              {/* Proyecto (Custom Card) */}
              <div className="col-span-1 group bg-white rounded-[16px] border border-gray-200 shadow-sm hover:border-blue-200 transition-all duration-200 focus-within:shadow-[0_0_16px_0_rgba(66,153,225,0.15)] hover:shadow-md h-full">
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
                >
                  <div className="h-[38px]" />
                </InputGroup>
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
                <Button
                  variant="outline"
                  onClick={() => router.push('/cotizacion-estructurada')}
                  className="px-6 py-2.5 text-sm font-semibold rounded-full transition-all shadow-sm active:scale-95"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-sm font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
                >
                  <span>Siguiente paso</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          /* STEP 2: Add Ons */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <AddOnsSelector
              selectedAddOns={selectedAddOns}
              onToggle={handleAddOnToggle}
              onConfigure={handleConfigureAddOn}
            />

            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetContent className="sm:max-w-md w-full p-0 gap-0 overflow-hidden bg-[#F9FAFB]">
                {/* Premium Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${activeConfigAddOn && ['notes', 'signature'].includes(activeConfigAddOn) ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-900'}`}>
                    {activeConfigAddOn === 'notes' && <PencilSquareIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'attachments' && <PaperClipIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'expiration_date' && <CalendarIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'contact_details' && <UserIcon className="w-6 h-6" />}
                    {(activeConfigAddOn === 'specific_tc' || activeConfigAddOn === 'general_tc') && <DocumentTextIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'privacy_policy' && <ShieldCheckIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'bank_account' && <BanknotesIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'invoicing_info' && <ReceiptPercentIcon className="w-6 h-6" />}
                    {activeConfigAddOn === 'signature' && <PencilSquareIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold text-gray-900">
                      {activeConfigAddOn === 'notes' && 'Notas Adicionales'}
                      {activeConfigAddOn === 'attachments' && 'Adjuntos'}
                      {activeConfigAddOn === 'expiration_date' && 'Fecha de Expiración'}
                      {activeConfigAddOn === 'contact_details' && 'Datos de Contacto'}
                      {activeConfigAddOn === 'specific_tc' && 'Términos Específicos'}
                      {activeConfigAddOn === 'general_tc' && 'Términos Generales'}
                      {activeConfigAddOn === 'privacy_policy' && 'Política de Privacidad'}
                      {activeConfigAddOn === 'bank_account' && 'Cuenta Bancaria'}
                      {activeConfigAddOn === 'invoicing_info' && 'Facturación'}
                      {activeConfigAddOn === 'signature' && 'Firma Digital'}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-gray-500 mt-1">
                      {activeConfigAddOn === 'notes' && 'Agrega detalles puntuales o aclaraciones para el cliente.'}
                      {activeConfigAddOn === 'attachments' && 'Sube documentos complementarios.'}
                      {activeConfigAddOn === 'expiration_date' && 'Define la vigencia de esta propuesta.'}
                      {activeConfigAddOn === 'contact_details' && 'Edita la información de contacto visible.'}
                      {activeConfigAddOn === 'bank_account' && 'Selecciona dónde recibir el pago.'}
                      {['specific_tc', 'general_tc', 'privacy_policy'].includes(activeConfigAddOn || '') && 'Selecciona la plantilla legal adecuada.'}
                    </SheetDescription>
                  </div>
                </div>

                <div className="p-6 h-full overflow-y-auto">
                  {renderAddOnConfigContent()}
                </div>
              </SheetContent>
            </Sheet>

            {/* Action Buttons Step 2 */}
            <div className="flex justify-between items-center mt-8 pb-12 max-w-2xl mx-auto">
              <button
                onClick={handleBackStep}
                className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-[#F9FAFB] hover:border-[#9CA3AF] hover:text-gray-900 transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Atrás</span>
              </button>

              <Button
                onClick={handleNextStep}
                className="px-6 py-2.5 text-sm font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
              >
                <span>Siguiente Paso</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          /* STEP 3: Format & Tone - Versión Compacta */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">

              {/* Formato de Entrega - Grid Compacto 4 columnas */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Formato de Entrega</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setFormatType('one-pager')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${formatType === 'one-pager' ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <DocumentIcon className={`w-6 h-6 ${formatType === 'one-pager' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium text-center ${formatType === 'one-pager' ? 'text-blue-900' : 'text-gray-700'}`}>
                      One Pager
                    </span>
                  </button>

                  <button
                    onClick={() => setFormatType('short')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${formatType === 'short' ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <DocumentTextIcon className={`w-6 h-6 ${formatType === 'short' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium text-center ${formatType === 'short' ? 'text-blue-900' : 'text-gray-700'}`}>
                      Corto<br/>
                      <span className="text-xs opacity-75">(~500 palabras)</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setFormatType('large')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${formatType === 'large' ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <BookOpenIcon className={`w-6 h-6 ${formatType === 'large' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium text-center ${formatType === 'large' ? 'text-blue-900' : 'text-gray-700'}`}>
                      Detallado<br/>
                      <span className="text-xs opacity-75">(+1000 palabras)</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setFormatType('custom')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${formatType === 'custom' ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <PencilSquareIcon className={`w-6 h-6 ${formatType === 'custom' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium text-center ${formatType === 'custom' ? 'text-blue-900' : 'text-gray-700'}`}>
                      Customizado
                    </span>
                  </button>
                </div>
              </div>

              {/* Tono - Segment Control */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tono de Comunicación</h2>
                <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
                  <button
                    onClick={() => setToneType('friendly')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                      toneType === 'friendly'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FaceSmileIcon className="w-4 h-4" />
                    <span>Amigable</span>
                  </button>
                  <button
                    onClick={() => setToneType('formal')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                      toneType === 'formal'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>Formal</span>
                  </button>
                </div>
              </div>

              {/* Idioma - Pills Compactos (3 opciones) */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Idioma del Documento</h2>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setLanguageType('es')}
                    className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      languageType === 'es'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Español</span>
                  </button>

                  <button
                    onClick={() => setLanguageType('en')}
                    className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      languageType === 'en'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <GlobeAltIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Inglés</span>
                  </button>

                  <button
                    onClick={() => setLanguageType('other')}
                    className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      languageType === 'other'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <LanguageIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Otro</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons Step 3 */}
            <div className="flex justify-between items-center mt-8 pb-12">
              <Button
                variant="outline"
                onClick={handleBackStep}
                className="px-6 py-2.5 text-sm font-bold rounded-full transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Atrás</span>
              </Button>

              <Button
                onClick={handleGenerateQuote}
                className="px-6 py-2.5 text-sm font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
              >
                <span>Generar Cotización</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            </div>
          </div>
        )
        }
      </div >

      {/* Modals */}
      < RequirementsAIModal
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
      <RequirementsAIModal
        isOpen={notesModalOpen}
        loading={notesLoading}
        options={notesOptions}
        onClose={() => setNotesModalOpen(false)}
        onSelect={handleSelectNotes}
        customTitle="Sugerencias de Notas Adicionales"
      />

      {/* Modal de Selección y Creación de Método de Pago */}
      {
        showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {!selectedPaymentMethodType ? 'Selecciona un Método de Pago' : 'Nuevo Método de Pago'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {!selectedPaymentMethodType ? 'Elige la opción que deseas configurar' : 'Ingresa los detalles correspondientes'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethodType('');
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8 bg-gray-50/50">
                {!selectedPaymentMethodType ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {availablePaymentMethodTypes.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedPaymentMethodType(option.id)}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 group aspect-square"
                      >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 filter drop-shadow-sm">
                          {option.icon}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 text-center leading-tight">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-right-4 duration-200">
                    <div className="space-y-6">
                      {(selectedPaymentMethodType === 'bank_transfer' || selectedPaymentMethodType === 'bank_account') && (
                        <>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Beneficiario <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={paymentFormData.beneficiary}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, beneficiary: e.target.value })}
                              className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                              placeholder="Nombre completo o Razón Social"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Banco <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={paymentFormData.bank}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, bank: e.target.value })}
                              className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                              placeholder="Ej. BBVA, Santander"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">CLABE / Número de Cuenta</label>
                            <input
                              type="text"
                              value={paymentFormData.clabe}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, clabe: e.target.value })}
                              className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                              placeholder="18 dígitos (opcional)"
                              maxLength={18}
                            />
                          </div>
                        </>
                      )}
                      {selectedPaymentMethodType === 'card' && (
                        <>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Titular de la Tarjeta <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={paymentFormData.cardHolder}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, cardHolder: e.target.value })}
                              className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                              placeholder="Nombre como aparece en la tarjeta"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Número de Tarjeta <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={paymentFormData.cardNumber}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, cardNumber: e.target.value })}
                              className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                              placeholder="16 dígitos"
                              maxLength={16}
                            />
                          </div>
                        </>
                      )}
                      {selectedPaymentMethodType === 'paypal' && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Correo de PayPal <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            value={paymentFormData.paypalEmail}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, paypalEmail: e.target.value })}
                            className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      )}
                      {selectedPaymentMethodType === 'stripe' && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">ID de Cuenta Stripe <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={paymentFormData.stripeAccount}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, stripeAccount: e.target.value })}
                            className="w-full h-12 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all outline-none text-sm font-medium text-gray-900"
                            placeholder="acct_..."
                          />
                        </div>
                      )}

                      <div className="flex gap-4 pt-4 mt-4">
                        <button
                          onClick={() => setSelectedPaymentMethodType('')}
                          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-700 hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-all text-sm font-bold active:scale-95"
                        >
                          Atrás
                        </button>
                        <button
                          onClick={handleSavePaymentMethod}
                          disabled={savingPaymentMethod}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-full hover:from-[#2563EB] hover:to-[#1D4ED8] transition-all text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                          {savingPaymentMethod ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Guardando...
                            </>
                          ) : 'Guardar Método'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
