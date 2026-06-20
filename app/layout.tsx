import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/Toast'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'ObservaPet', template: '%s · ObservaPet' },
  description: 'Rede social para animais em situação de rua em São Luís, MA',
  applicationName: 'ObservaPet',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'ObservaPet' },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'ObservaPet',
    title: 'ObservaPet',
    description: 'Rede social para animais em situação de rua em São Luís, MA',
  },
}

export const viewport = {
  themeColor: '#2a6af0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ToastProvider>
          <ServiceWorkerRegistrar />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
