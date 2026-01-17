'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/hooks/utils';

interface ProfileTabProps {
  userId: string;
}

export default function ProfileTab({ userId }: ProfileTabProps) {
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si el usuario ya tiene perfil configurado
  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const profileExists = data.displayName || data.nombreDespacho || data.tarifaHoraria;
          setHasProfile(!!profileExists);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [userId]);

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

        {/* Estado Vacío */}
        {!hasProfile ? (
          <div className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay información de perfil configurada
              </h3>
              <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                Completa tu perfil profesional para personalizar las cotizaciones y obtener sugerencias de precio basadas en tu tarifa horaria
              </p>
              <button
                onClick={() => setHasProfile(true)}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Completar Perfil
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">Funcionalidad de edición de perfil próximamente...</p>
            <p className="text-sm text-gray-400 mt-2">Por ahora, ve al tab &quot;Servicios&quot; para crear servicios</p>
          </div>
        )}
      </div>
    </div>
  );
}
