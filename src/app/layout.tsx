import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Acreditación | LIDERAZGO LAB 2026',
  description: 'Sistema Oficial de Acreditación y Check-in para Cumbre Liderazgo Lab 2026',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Acreditación Lab',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#071219',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="bg-[#071219] text-slate-100 min-h-screen flex flex-col selection:bg-lab-cyan selection:text-black antialiased">
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          toastOptions={{
            style: {
              background: '#0E2433',
              border: '1px solid #1E3D52',
              color: '#F8FAFC',
              fontSize: '0.9rem',
              borderRadius: '1rem',
            },
          }}
        />
      </body>
    </html>
  );
}
