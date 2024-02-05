'use client';
import LoginButton from "@/components/boton";
import { useEffect, useState } from "react";
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Home() {
  const [accessToken, setAccessToken] = useState(); 
  const { user, error, isLoading } = useUser();
  const [tokenObtenido, setTokenObtenido] = useState(false);
  
    useEffect(() => {
      const fetchToken = async () => {
        if (!user) {
          // Si no hay usuario autenticado, no hacer nada
          console.log('Usuario no autenticado');
          return;
        }
        try {
          const response = await fetch('http://localhost:3000/api/auth/token', {
          });
          const { accessToken } = await response.json();
          setAccessToken(accessToken);
          return accessToken;
        } catch (error) {
          console.error('Error al obtener token:', error);
        }
      };
      fetchToken();
    }, [user]);

  return (
   <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {user ? <div> <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div></div> : <LoginButton></LoginButton>}
    </main>
  );
}
