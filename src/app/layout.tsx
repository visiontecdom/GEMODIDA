import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/providers/theme-provider';
import PWAHead from '@/components/PWAHead';
import ServiceWorker from '@/components/ServiceWorker';
import InstallPWA from '@/components/InstallPWA';
import { DiagnosticLogger } from '@/components/DiagnosticLogger';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GEMODIDA',
  description: 'Herramienta avanzada para el monitoreo y análisis de palabras clave',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <PWAHead />
      </head>
      <body className="min-h-screen font-sans antialiased" style={{ backgroundColor: 'hsl(197, 42%, 95%)', color: 'hsl(204, 80%, 16%)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">
                  {children}
                </main>
                <InstallPWA />
                <ServiceWorker />
                <DiagnosticLogger />
              </div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
