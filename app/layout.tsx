import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Roboto } from 'next/font/google'
import { AuthProvider } from './components/authContext';


const roboto = Roboto({
  weight: '400',
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
      <AuthProvider>
              <UserProvider>
      <body className={roboto.className}>{children}</body></UserProvider>
      </AuthProvider>
      </>

    </html>
  )
}
