import './globals.css'
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Roboto } from 'next/font/google'
import { AuthProvider } from './components/authContext';
import { PrimeReactProvider } from "primereact/api";
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
      <>
        <UserProvider>
            <PrimeReactProvider>
          <AuthProvider>

              <body className={`h-screen ${roboto.className}`}>{children}</body>   
          </AuthProvider>
              </PrimeReactProvider>

        </UserProvider>
      </>

    </html>
  )
}
