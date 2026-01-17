'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/hooks/utils';

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
  bio: string;
  tarifaHoraria: number;
  tarifaHorariaMoneda: 'MXN' | 'USD';
}

export default function ProfileTab({ userId }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    nombreDespacho: '',
    cargo: '',
    cedulaProfesional: '',
    telefono: '',
    location: '',
    bio: '',
    tarifaHoraria: 0,
    tarifaHorariaMoneda: 'MXN'
  });

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            displayName: data.displayName || '',
            email: data.email || '',
            nombreDespacho: data.nombreDespacho || '',
            cargo: data.cargo || '',
            cedulaProfesional: data.cedulaProfesional || '',
            telefono: data.telefono || '',
            location: data.location || '',
            bio: data.bio || '',
            tarifaHoraria: data.tarifaHoraria || 0,
            tarifaHorariaMoneda: data.tarifaHorariaMoneda || 'MXN'
          });
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        toast.error('Error al cargar datos del perfil');
      }
    };

    loadProfile();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (profileData.tarifaHoraria < 0) {
      toast.error('La tarifa horaria no puede ser negativa');
      return;
    }

    if (profileData.tarifaHoraria > 50000) {
      toast.error('La tarifa horaria parece muy alta. Verifica el monto.');
      return;
    }

    try {
      setIsLoading(true);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        nombreDespacho: profileData.nombreDespacho,
        cargo: profileData.cargo,
        cedulaProfesional: profileData.cedulaProfesional,
        telefono: profileData.telefono,
        location: profileData.location,
        bio: profileData.bio,
        tarifaHoraria: profileData.tarifaHoraria,
        tarifaHorariaMoneda: profileData.tarifaHorariaMoneda,
        updatedAt: serverTimestamp()
      });

      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const getTarifaSuggestion = (nivel: 'junior' | 'senior' | 'socio') => {
    const tarifas = {
      junior: { min: 800, max: 1500 },
      senior: { min: 1500, max: 3000 },
      socio: { min: 3000, max: 6000 }
    };
    return tarifas[nivel];
  };

  return (
    <div className="w-full px-4 md:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuración del Perfil</h2>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tu información personal y tarifa horaria
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ej: Lic. Juan Pérez García"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Profesional
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ej: juan.perez@bufete.com"
                  />
                </div>

                {/* Nombre del Despacho */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Despacho/Empresa
                  </label>
                  <input
                    type="text"
                    value={profileData.nombreDespacho}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nombreDespacho: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ej: Pérez & Asociados"
                  />
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cargo/Puesto
                  </label>
                  <input
                    type="text"
                    value={profileData.cargo}
                    onChange={(e) => setProfileData(prev => ({ ...prev, cargo: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ej: Socio Director, Asociado Senior"
                  />
                </div>

                {/* Cédula Profesional */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cédula Profesional
                  </label>
                  <input
                    type="text"
                    value={profileData.cedulaProfesional}
                    onChange={(e) => setProfileData(prev => ({ ...prev, cedulaProfesional: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ej: 1234567"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono Profesional
                  </label>
                  <input
                    type="tel"
                    value={profileData.telefono}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telefono: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="ej: +52 55 1234 5678"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ciudad/Estado
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="ej: Ciudad de México, México"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Biografía Profesional
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                placeholder="Breve descripción de tu experiencia y especialización legal..."
              />
              <p className="mt-1 text-xs text-gray-500">{profileData.bio.length}/500 caracteres</p>
            </div>

            {/* Tarifa Horaria - NUEVO */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tarifa Horaria
                  </label>
                  <p className="text-xs text-gray-600">
                    Esta tarifa se usará para calcular precios sugeridos en servicios por hora
                  </p>
                </div>
              </div>

              {/* Input de Tarifa */}
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    value={profileData.tarifaHoraria || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      tarifaHoraria: parseFloat(e.target.value) || 0
                    }))}
                    disabled={!isEditing}
                    min="0"
                    max="50000"
                    step="50"
                    className="w-full pl-8 pr-20 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm font-semibold disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-sm">MXN/hora</span>
                </div>
                {profileData.tarifaHoraria > 0 && (
                  <p className="mt-2 text-sm text-blue-700 font-medium">
                    ≈ {formatPrice((profileData.tarifaHoraria * 160).toString())} MXN/mes (160 hrs)
                  </p>
                )}
              </div>

              {/* Sugerencias por Nivel */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Referencia de mercado:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => isEditing && setProfileData(prev => ({ ...prev, tarifaHoraria: 1200 }))}
                    disabled={!isEditing}
                    className="bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-xs text-gray-500">Junior</div>
                    <div className="text-sm font-bold text-gray-800">$800-1,500</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditing && setProfileData(prev => ({ ...prev, tarifaHoraria: 2000 }))}
                    disabled={!isEditing}
                    className="bg-white border-2 border-blue-400 rounded-lg p-2 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-xs text-blue-600 font-semibold">Senior</div>
                    <div className="text-sm font-bold text-gray-800">$1,500-3,000</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditing && setProfileData(prev => ({ ...prev, tarifaHoraria: 4000 }))}
                    disabled={!isEditing}
                    className="bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-xs text-gray-500">Socio</div>
                    <div className="text-sm font-bold text-gray-800">$3,000+</div>
                  </button>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>¿Cómo se usa?</strong> Cuando crees un servicio y uses "Sugerir Precio con IA",
                    el sistema detectará automáticamente si es un servicio de tarifa fija (ej: registro de marca)
                    o por hora (ej: asesoría). Para servicios por hora, usará tu tarifa personalizada.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Recargar datos originales
                    const loadProfile = async () => {
                      const userRef = doc(db, 'users', userId);
                      const userDoc = await getDoc(userRef);
                      if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfileData({
                          displayName: data.displayName || '',
                          email: data.email || '',
                          nombreDespacho: data.nombreDespacho || '',
                          cargo: data.cargo || '',
                          cedulaProfesional: data.cedulaProfesional || '',
                          telefono: data.telefono || '',
                          location: data.location || '',
                          bio: data.bio || '',
                          tarifaHoraria: data.tarifaHoraria || 0,
                          tarifaHorariaMoneda: data.tarifaHorariaMoneda || 'MXN'
                        });
                      }
                    };
                    loadProfile();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Vista de solo lectura cuando no está editando */}
          {!isEditing && profileData.tarifaHoraria > 0 && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Tarifa configurada correctamente
              </div>
              <p className="text-sm text-gray-700">
                El sistema usará <strong className="text-green-700">{formatPrice(profileData.tarifaHoraria.toString())} MXN/hora</strong> para calcular precios en servicios por hora.
              </p>
            </div>
          )}

          {!isEditing && profileData.tarifaHoraria === 0 && (
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Tarifa horaria no configurada</p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    Configura tu tarifa horaria para obtener sugerencias de precio personalizadas.
                    Si no la configuras, el sistema usará una tarifa promedio de mercado ($1,500 MXN/hora).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
