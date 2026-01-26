'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('Error en resultado de cotización:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-full">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Algo salió mal
                </h2>

                <p className="text-gray-600 mb-8">
                    No pudimos cargar la cotización. Esto puede deberse a un problema de conexión o datos incompletos.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all font-medium"
                    >
                        Intentar de nuevo
                    </button>

                    <button
                        onClick={() => router.push('/cotizacion-estructurada')}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-full transition-all font-medium"
                    >
                        Volver al inicio
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-mono">
                        Error: {error.message || 'Desconocido'}
                    </p>
                </div>
            </div>
        </div>
    );
}
