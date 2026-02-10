"use client"

import BackgroundPattern from "@/components/landing/backgroundPattern"
import QuoteAnimation from "@/components/landing/quoteAnimation"
import QuoteFormAnimation from "@/components/landing/quoteFormAnimation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, BarChart3, Settings2, Menu, X } from "lucide-react"
import Link from "next/link"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import CaseDetailsAnimation from "@/components/landing/CaseDetailsAnimation"
import SignInModal from "@/components/SignInModal"
import { useState } from "react"

export default function LandingPage() {
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollToSection('hero')} className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20iaquote-tqPMRrgbnkZhPAhI98N3aTCq6j1SqR.png"
                alt="Legal AI Quote Logo"
                className="h-8"
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Características
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cómo Funciona
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Precios
              </button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                onClick={() => setShowSignInDialog(true)}
              >
                Iniciar Sesión
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-sm text-gray-300 hover:text-white transition-colors text-left"
                >
                  Características
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-sm text-gray-300 hover:text-white transition-colors text-left"
                >
                  Cómo Funciona
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-sm text-gray-300 hover:text-white transition-colors text-left"
                >
                  Precios
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white w-fit"
                  onClick={() => {
                    setShowSignInDialog(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 pt-16">
        <HeroSection />
        <FeaturesSection />

        <section id="how-it-works" aria-label="Cómo funciona" className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
          <div className="container px-4 md:px-6 mx-auto space-y-12">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">¿Cómo Funciona?</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600">Solo completa 9 campos y obtén tu cotización al instante</p>
            </div>
            <QuoteFormAnimation />
          </div>
        </section>

        <section id="pricing" aria-label="Precios" className="w-full py-16 md:py-32 bg-gradient-to-b from-white to-gray-50 scroll-mt-20">
          <div className="container px-4 md:px-6 mx-auto overflow-x-hidden">
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-blue-600">
                ¿En serio quieres seguir haciendo tus cotizaciones sin IA?
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mt-4">
                Una sola licencia incluye todo lo que necesitas para transformar tu despacho
              </p>

              {/* Product Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8">
                <div className="px-3 sm:px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 font-medium text-sm sm:text-base">Legal AI Tools</p>
                </div>
                <span className="text-blue-600">+</span>
                <div className="px-3 sm:px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 font-medium text-sm sm:text-base">Educación Legal</p>
                </div>
                <span className="text-blue-600">+</span>
                <div className="px-3 sm:px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 font-medium text-sm sm:text-base">Legal Track</p>
                </div>
              </div>

              {/* Price */}
              <div className="text-center space-y-4">
                <p className="text-4xl font-bold text-blue-600">
                  $450<span className="text-xl font-normal text-gray-600"> pesos/mes</span>
                </p>
                <p className="text-lg text-gray-800 font-medium">Una sola licencia incluye:</p>
              </div>

              {/* Product Cards */}
              <div className="space-y-6 w-full">
                {/* Cursos Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white p-6 rounded-xl border border-blue-100 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-1/2">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-04%20at%204.49.11%E2%80%AFPM-ylKXyJBLEYOeBRsDcsEoSSqqphKLTm.png"
                          alt="Plataforma de cursos Lawgic"
                          className="w-full h-auto rounded-lg shadow-md"
                        />
                      </div>
                      <div className="w-full md:w-1/2 text-left space-y-3">
                        <div className="mb-4">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20lawgic-UE4bOsHYCewlb7PYUlKjy6IJD9jdbg.png"
                            alt="Lawgic Logo"
                            className="h-10"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Más de 200 cursos de derecho mexicano</h3>
                        <p className="text-gray-600">
                          Accede a contenido especializado y actualizado constantemente para mantenerte al día con las
                          últimas actualizaciones legales.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Track Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white p-6 rounded-xl border border-blue-100 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-1/2">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-04%20at%209.51.10%E2%80%AFAM-u6DEsaY2rFZ4t43BHpw2YQBVnjwoEz.png"
                          alt="Legal Track Dashboard"
                          className="w-full h-auto rounded-lg shadow-md"
                        />
                      </div>
                      <div className="w-full md:w-1/2 text-left space-y-3">
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Legaltrack-9bWIBm28SZ7IQ0DVzAj1pXzWjCKfOs.png"
                              alt="Legal Track Logo"
                              className="h-10"
                            />
                            <span className="text-gray-600">Legal Track</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Herramienta de IA legal</h3>
                        <p className="text-gray-600">
                          Gestiona tu despacho de manera inteligente con nuestra IA especializada en procesos legales y
                          seguimiento de casos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal AI Quote Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-200" />
                  <div className="relative bg-white p-6 rounded-xl border border-blue-100 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-1/2">
                        <CaseDetailsAnimation />
                      </div>
                      <div className="w-full md:w-1/2 text-left space-y-4">
                        <div className="mb-4">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20iaquote-tqPMRrgbnkZhPAhI98N3aTCq6j1SqR.png"
                            alt="AI Quote Logo"
                            className="h-12"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Legal AI Quote</h3>
                  <p className="text-gray-600">
                          Sistema de cotización automatizado que reduce el tiempo de generación de propuestas de 30 minutos
                          a solo 3 minutos.
                  </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
                <div className="w-full max-w-md">
                <div className="relative group">
                  <div className="absolute -inset-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 rounded-xl 
                    opacity-70 blur-[2px] 
                    group-hover:opacity-100 group-hover:blur-[3px]
                    transition-all duration-500 animate-border-flow"
                  ></div>
                  <Button 
                    className="relative w-full h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300
                      hover:scale-[1.02] hover:shadow-lg text-lg font-semibold"
                      onClick={() => setShowSignInDialog(true)}
                  >
                    Empieza Ahora
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {showSignInDialog && (
            <SignInModal onClose={() => setShowSignInDialog(false)} />
          )}
        </section>
      </main>

      <footer className="w-full py-8 bg-white border-t border-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Legal AI Quote. Todos los derechos reservados.</p>
            <nav className="flex gap-6" aria-label="Enlaces legales">
              <Link className="text-sm text-gray-500 hover:text-blue-600 transition-colors" href="/terminos">
                Términos de Servicio
              </Link>
              <Link className="text-sm text-gray-500 hover:text-blue-600 transition-colors" href="/privacidad">
                Privacidad
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

