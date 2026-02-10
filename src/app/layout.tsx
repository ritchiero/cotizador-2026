import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

const inter = Inter({ subsets: ['latin'] })

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Legal AI Quote — Cotizaciones legales con IA en 3 minutos',
  description: 'Genera cotizaciones legales profesionales en minutos con inteligencia artificial. Reduce el tiempo de cotización de 30 minutos a solo 3 minutos. Para abogados y despachos legales.',
  keywords: ['cotizaciones legales', 'IA legal', 'abogados', 'despacho legal', 'automatización legal'],
  authors: [{ name: 'Legal AI Quote' }],
  openGraph: {
    title: 'Legal AI Quote — Cotizaciones legales con IA en 3 minutos',
    description: 'Genera cotizaciones legales profesionales en minutos con inteligencia artificial. Reduce el tiempo de cotización de 30 minutos a solo 3 minutos.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Legal AI Quote',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20iaquote-tqPMRrgbnkZhPAhI98N3aTCq6j1SqR.png',
        width: 1200,
        height: 630,
        alt: 'Legal AI Quote - Cotizaciones legales con IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal AI Quote — Cotizaciones legales con IA en 3 minutos',
    description: 'Genera cotizaciones legales profesionales en minutos con inteligencia artificial.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20iaquote-tqPMRrgbnkZhPAhI98N3aTCq6j1SqR.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="font-jakarta bg-background text-text-main">
        <AuthProvider>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
