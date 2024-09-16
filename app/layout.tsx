import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Roboto } from 'next/font/google'
import { AuthProvider } from './components/authContext';
import { PrimeReactProvider } from "primereact/api";
import { PopupProvider } from './components/context/popupContext';
import './globals.css'
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
      <><head>

<link id="theme-link" rel="stylesheet" href="/themes/lara-light-blue/theme.css"/>
        

</head>
   
        <UserProvider>
            <PrimeReactProvider>
          <AuthProvider>

              <body className={`h-screen ${roboto.className}`}>

                {children}
                
                </body>   
          </AuthProvider>
              </PrimeReactProvider>

        </UserProvider>

      </>

    </html>
  )
}
