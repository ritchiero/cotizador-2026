'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Algo salió mal
                </h2>
                <p className="text-gray-600 mb-8">
                    Ha ocurrido un error inesperado en la aplicación.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all font-medium"
                    >
                        Intentar de nuevo
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-full transition-all font-medium"
                    >
                        Ir al Inicio
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg text-left text-xs font-mono overflow-auto max-w-full">
                        <p className="font-bold mb-2">Detalles del error (Solo desarrollo):</p>
                        {error.message}
                        {error.stack && <pre className="mt-2 text-[10px]">{error.stack}</pre>}
                    </div>
                )}
            </div>
        </div>
    );
}
