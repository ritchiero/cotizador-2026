"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Aceptación de los Términos</h2>
          <p className="text-gray-600 mb-4">
            Al acceder y utilizar Legal AI Quote, aceptas estar sujeto a estos términos de servicio.
            Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Descripción del Servicio</h2>
          <p className="text-gray-600 mb-4">
            Legal AI Quote es una plataforma que permite a profesionales legales generar cotizaciones
            de manera automatizada utilizando inteligencia artificial.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. Uso del Servicio</h2>
          <p className="text-gray-600 mb-4">
            Te comprometes a utilizar el servicio únicamente para fines legales y de acuerdo con estos términos.
            No debes utilizar el servicio de manera que pueda dañar, deshabilitar o sobrecargar nuestros servidores.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Propiedad Intelectual</h2>
          <p className="text-gray-600 mb-4">
            El contenido generado por la plataforma es propiedad del usuario que lo genera.
            Sin embargo, Legal AI Quote retiene todos los derechos sobre la tecnología y el software subyacente.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Limitación de Responsabilidad</h2>
          <p className="text-gray-600 mb-4">
            Legal AI Quote no será responsable por daños indirectos, incidentales, especiales o consecuentes
            que resulten del uso o la imposibilidad de usar el servicio.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Contacto</h2>
          <p className="text-gray-600 mb-4">
            Para cualquier pregunta sobre estos términos, contáctanos en: soporte@legalaitools.com
          </p>
        </div>
      </div>
    </div>
  )
}
