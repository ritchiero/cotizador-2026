'use client';
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { uploadFile, updateAuthProfile } from '@/lib/firebase/firebaseUtils';
import { validateImageFile } from '@/lib/utils/imageUtils';
import ImageCropModal from '@/components/ImageCropModal';
import Image from 'next/image';

interface ProfileTabProps {
  userId: string;
}

interface ProfileData {
  displayName: string;
  email: string;
  nombreDespacho: string;
  cargo: string;
  cedulaProfesional: string;
  telefono: string;
  location: string;
  tarifaHoraria: number;
  bio: string;
  photoURL?: string;
  rfc?: string;
  especialidad?: string;
  anoExperiencia?: string;
}

const estados = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

export default function ProfileTab({ userId }: ProfileTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    email: '',
    nombreDespacho: '',
    cargo: '',
    cedulaProfesional: '',  // Mantener para no romper la DB
    telefono: '',
    location: '',
    tarifaHoraria: 0,
    bio: '',
    photoURL: '',
    rfc: '',
    especialidad: '',
    anoExperiencia: '',
  });
  const [sitioWeb, setSitioWeb] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del usuario
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            displayName: data.displayName || '',
            email: data.email || '',
            nombreDespacho: data.nombreDespacho || '',
            cargo: data.cargo || '',
            cedulaProfesional: data.cedulaProfesional || '',
            telefono: data.telefono || '',
            location: data.location || '',
            tarifaHoraria: data.tarifaHoraria || 0,
            bio: data.bio || '',
            photoURL: data.photoURL || '',
            rfc: data.rfc || '',
            especialidad: data.especialidad || '',
            anoExperiencia: data.anoExperiencia || '',
          });
          setSitioWeb(data.sitioWeb || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'tarifaHoraria') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setTempImageSrc(imageUrl);
      setShowCropModal(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar la imagen');
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropModal(false);
    setUploadingPhoto(true);

    try {
      const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      const photoPath = `profile-photos/${userId}/${Date.now()}-profile.jpg`;
      const downloadURL = await uploadFile(croppedFile, photoPath);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });

      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { photoURL: downloadURL });
      }

      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
      toast.success('Foto actualizada correctamente');
    } catch (err) {
      toast.error('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
      if (tempImageSrc) {
        URL.revokeObjectURL(tempImageSrc);
        setTempImageSrc('');
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    if (tempImageSrc) {
      URL.revokeObjectURL(tempImageSrc);
      setTempImageSrc('');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        photoURL: '/default-avatar-icon.png',
        updatedAt: serverTimestamp()
      });

      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { photoURL: '/default-avatar-icon.png' });
      }

      setFormData(prev => ({ ...prev, photoURL: '/default-avatar-icon.png' }));
      toast.success('Foto eliminada');
    } catch (err) {
      toast.error('Error al eliminar la foto');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        nombreDespacho: formData.nombreDespacho,
        cargo: formData.cargo,
        telefono: formData.telefono,
        location: formData.location,
        tarifaHoraria: formData.tarifaHoraria,
        tarifaHorariaMoneda: 'MXN',
        bio: formData.bio,
        rfc: formData.rfc,
        especialidad: formData.especialidad,
        anoExperiencia: formData.anoExperiencia,
        sitioWeb: sitioWeb,
        updatedAt: serverTimestamp(),
      });

      if (auth.currentUser && formData.displayName !== auth.currentUser.displayName) {
        await updateAuthProfile(auth.currentUser, { displayName: formData.displayName });
      }

      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Perfil</h2>
        </div>

        <form onSubmit={handleSave} className="p-8">
          {/* Sección de Foto */}
          <div className="mb-10">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                  <Image
                    src={formData.photoURL || '/default-avatar-icon.png'}
                    alt="Perfil"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-8">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Subir Nueva Foto
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Eliminar Foto
                </button>
              </div>
            </div>
          </div>

          {/* Grid de 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Juan Pérez García"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Nombre del Despacho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Despacho/Firma
              </label>
              <input
                type="text"
                name="nombreDespacho"
                value={formData.nombreDespacho}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Pérez & Asociados S.C."
              />
            </div>

            {/* RFC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFC
              </label>
              <input
                type="text"
                name="rfc"
                value={formData.rfc}
                onChange={handleInputChange}
                maxLength={13}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="PEGJ850101ABC"
              />
            </div>

            {/* Cargo/Posición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo/Posición
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Abogado Senior, Socio, Asociado"
              />
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área de Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Derecho Corporativo, Propiedad Intelectual"
              />
            </div>

            {/* Sitio Web del Despacho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web del Despacho
              </label>
              <input
                type="url"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.tudespacho.com"
              />
            </div>

            {/* Años de Experiencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Años de Experiencia
              </label>
              <input
                type="number"
                name="anoExperiencia"
                value={formData.anoExperiencia}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
                min="0"
                max="60"
              />
            </div>

            {/* Teléfono con selector de país */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="flex gap-2">
                <select className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                  <option>🇲🇽 +52</option>
                </select>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5512345678"
                />
              </div>
            </div>

            {/* Tarifa Horaria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarifa Horaria (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  name="tarifaHoraria"
                  value={formData.tarifaHoraria || ''}
                  onChange={handleInputChange}
                  min="500"
                  max="50000"
                  step="100"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Tu tarifa se usa para calcular precios sugeridos
              </p>
            </div>

            {/* Estado/Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona un estado</option>
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            {/* Bio - Full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe tu experiencia profesional, áreas de práctica, logros destacados..."
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </span>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de crop */}
      {showCropModal && tempImageSrc && (
        <ImageCropModal
          imageSrc={tempImageSrc}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
