"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacidadPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Información que Recopilamos</h2>
          <p className="text-gray-600 mb-4">
            Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico,
            y la información relacionada con tus cotizaciones y servicios legales.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Uso de la Información</h2>
          <p className="text-gray-600 mb-4">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Proporcionar y mantener nuestro servicio</li>
            <li>Mejorar y personalizar tu experiencia</li>
            <li>Comunicarnos contigo sobre actualizaciones y ofertas</li>
            <li>Detectar y prevenir actividades fraudulentas</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. Protección de Datos</h2>
          <p className="text-gray-600 mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal
            contra acceso no autorizado, alteración, divulgación o destrucción.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Compartir Información</h2>
          <p className="text-gray-600 mb-4">
            No vendemos ni compartimos tu información personal con terceros, excepto cuando sea necesario
            para proporcionar el servicio o cuando lo requiera la ley.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Tus Derechos</h2>
          <p className="text-gray-600 mb-4">
            Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos derechos,
            contáctanos en: privacidad@legalaitools.com
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Cookies</h2>
          <p className="text-gray-600 mb-4">
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma.
            Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">7. Contacto</h2>
          <p className="text-gray-600 mb-4">
            Para cualquier pregunta sobre esta política de privacidad, contáctanos en: privacidad@legalaitools.com
          </p>
        </div>
      </div>
    </div>
  )
}
