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
}

export default function ProfileTab({ userId }: ProfileTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    email: '',
    nombreDespacho: '',
    cargo: '',
    cedulaProfesional: '',
    telefono: '',
    location: '',
    tarifaHoraria: 0,
    bio: '',
    photoURL: '',
  });

  const [tarifaError, setTarifaError] = useState('');
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
          });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'tarifaHoraria') {
      const numValue = parseFloat(value) || 0;

      if (numValue > 0 && numValue < 500) {
        setTarifaError('La tarifa mínima es de $500 MXN/hr');
      } else if (numValue > 50000) {
        setTarifaError('La tarifa máxima es de $50,000 MXN/hr');
      } else {
        setTarifaError('');
      }

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tarifaError) {
      toast.error('Corrige los errores antes de guardar');
      return;
    }

    setIsSaving(true);

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        nombreDespacho: formData.nombreDespacho,
        cargo: formData.cargo,
        cedulaProfesional: formData.cedulaProfesional,
        telefono: formData.telefono,
        location: formData.location,
        tarifaHoraria: formData.tarifaHoraria,
        tarifaHorariaMoneda: 'MXN',
        bio: formData.bio,
        updatedAt: serverTimestamp(),
      });

      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const getTarifaSuggestion = () => {
    const tarifa = formData.tarifaHoraria;
    if (tarifa >= 800 && tarifa <= 1500) return { label: 'Junior', color: 'bg-blue-100 text-blue-700' };
    if (tarifa > 1500 && tarifa <= 3000) return { label: 'Senior', color: 'bg-purple-100 text-purple-700' };
    if (tarifa > 3000) return { label: 'Socio', color: 'bg-orange-100 text-orange-700' };
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  const suggestion = getTarifaSuggestion();

  return (
    <div className="w-full px-4 md:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Configuración del Perfil</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu información personal y tarifa horaria
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-8">
          {/* Sección: Foto de Perfil */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Foto de Perfil</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24">
                <Image
                  src={formData.photoURL || '/default-avatar-icon.png'}
                  alt="Perfil"
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-2 border-gray-200"
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
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
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}
              </button>
            </div>
          </div>

          {/* Sección: Información Personal */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez García"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Sección: Información Profesional */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Despacho
                </label>
                <input
                  type="text"
                  name="nombreDespacho"
                  value={formData.nombreDespacho}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pérez & Asociados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo/Posición
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Abogado Senior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula Profesional
                </label>
                <input
                  type="text"
                  name="cedulaProfesional"
                  value={formData.cedulaProfesional}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5512345678"
                  maxLength={10}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación (Ciudad, Estado)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ciudad de México, CDMX"
                />
              </div>
            </div>
          </div>

          {/* Sección: Tarifa Horaria (CRÍTICO) */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              Tarifa Horaria
              <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">Importante para IA</span>
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tu tarifa horaria se usará para calcular precios sugeridos en servicios por hora (asesorías, litigios, consultoría)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por Hora (MXN) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    name="tarifaHoraria"
                    value={formData.tarifaHoraria || ''}
                    onChange={handleInputChange}
                    min={500}
                    max={50000}
                    step={100}
                    required
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      tarifaError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1500"
                  />
                  {suggestion && (
                    <span className={`absolute right-4 top-2.5 text-xs font-medium px-2 py-0.5 rounded ${suggestion.color}`}>
                      {suggestion.label}
                    </span>
                  )}
                </div>
                {tarifaError && (
                  <p className="mt-1 text-sm text-red-600">{tarifaError}</p>
                )}
                {!tarifaError && formData.tarifaHoraria > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    ${formData.tarifaHoraria.toLocaleString('es-MX')} MXN por hora
                  </p>
                )}
              </div>

              {/* Sugerencias visuales de tarifa */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tarifaHoraria: 1200 }));
                    setTarifaError('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-600">Junior</p>
                      <p className="text-sm font-semibold text-gray-900">$800 - $1,500</p>
                    </div>
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tarifaHoraria: 2000 }));
                    setTarifaError('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-600">Senior</p>
                      <p className="text-sm font-semibold text-gray-900">$1,500 - $3,000</p>
                    </div>
                    <span className="text-2xl">👔</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tarifaHoraria: 4000 }));
                    setTarifaError('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-orange-600">Socio</p>
                      <p className="text-sm font-semibold text-gray-900">$3,000+</p>
                    </div>
                    <span className="text-2xl">⭐</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sección: Bio (Opcional) */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Descripción Profesional
              <span className="ml-2 text-xs font-normal text-gray-500">(Opcional)</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Abogado especializado en derecho corporativo con 10 años de experiencia..."
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSaving || !!tarifaError}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                isSaving || tarifaError
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
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

      {/* Modal de crop de imagen */}
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
