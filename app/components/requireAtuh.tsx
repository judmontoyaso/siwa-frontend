"use client"
import { useEffect } from 'react';
import { useAuth } from './authContext';
import { useRouter } from 'next/navigation'
import { PacmanLoader } from 'react-spinners';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !accessToken && error) {
      // Si no hay token y hay un error, redirecciona a la página de inicio de sesión
      console.log('Redireccionando debido a la falta de acceso token...');
      router.push('/'); 
    }
  }, [accessToken, isLoading, error, router]);

  if (isLoading) {
    // Mostrar algo mientras carga el token, puede ser un spinner, un mensaje, etc.
    return <div><PacmanLoader/></div>;
  }

  return (
    <>
      {children}
    </>
  );
}

export default RequireAuth;
