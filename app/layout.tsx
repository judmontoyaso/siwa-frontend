import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Roboto } from 'next/font/google'
import { AuthProvider } from './components/authContext';
import { PrimeReactProvider } from "primereact/api";
import { PopupProvider } from './components/context/popupContext';
// Usa un tema moderno de PrimeReact en lugar de primereact.min.css
import './globals.css'; // Tus estilos de Tailwind y globales

// theme

const roboto = Roboto({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
})
export const metadata = {
  title: 'Siwa',
  description: 'Siwa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
<link id="theme-link" rel="stylesheet" href="/themes/lara-light-blue/theme.css"/>
</head>
              <body className={`h-screen ${roboto.className}`}>
        <UserProvider>
            <PrimeReactProvider>
          <AuthProvider>
                {children}
          </AuthProvider>
              </PrimeReactProvider>
        </UserProvider>
                </body>   
    </html>
  )
}
