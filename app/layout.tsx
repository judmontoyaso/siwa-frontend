import './globals.css'
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
      <><head>
      <script
          dangerouslySetInnerHTML={{
            __html: `
              const style = document.createElement('style')
              style.innerHTML = '@layer tailwind-base, primereact, tailwind-utilities;'
              style.setAttribute('type', 'text/css')
              document.querySelector('head').prepend(style)
            `,
          }}
        />
</head>
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
