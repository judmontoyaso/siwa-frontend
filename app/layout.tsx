import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Roboto } from 'next/font/google';
import { AuthProvider } from './components/authContext';
import { PrimeReactProvider } from 'primereact/api';
import { PopupProvider } from './components/context/popupContext';
import PrimeReact from 'primereact/api';
import './globals.css'; // Tus estilos de Tailwind y otros estilos globales
import ErrorBoundary from './components/ErrorBoundary';
const roboto = Roboto({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Siwa',
  description: 'Siwa Platform',
};

// Configurar ripple en PrimeReact
PrimeReact.ripple = true;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Tema moderno de PrimeReact */}
        <link
          id="theme-link"
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/primereact/resources/themes/lara-light-indigo/theme.css"
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/primereact/resources/primereact.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className={`h-screen ${roboto.className}`}>
      <ErrorBoundary>
        <UserProvider>
          <PrimeReactProvider>
            <AuthProvider>
              <PopupProvider>
                {children}
              </PopupProvider>
            </AuthProvider>
          </PrimeReactProvider>
        </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
