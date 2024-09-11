"use client";
import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';  // Importar el nuevo useRouter y usePathname de next/navigation
import { Toast } from 'primereact/toast';  // Importar el componente Toast de PrimeReact
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Puedes usar cualquier tema de PrimeReact

interface AuthContextType {
  accessToken: string;
  isLoading: boolean;
  error: string;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);  // Verificar si estamos en el cliente
  const router = useRouter(); // Para redirigir al usuario
  const pathname = usePathname(); // Obtener la ruta actual
  const toast = useRef<Toast>(null); // Crear una referencia para el Toast

  useEffect(() => {
    setIsClient(true); // Establece que estamos en el cliente

    const fetchToken = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_AUTH0_BASE_URL) {
          throw new Error('API base URL is not defined');
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/token`);
        if (!response.ok) {
          throw new Error('Failed to fetch access token');
        }
        const data = await response.json();
        setAccessToken(data.accessToken);
      } catch (error) {
        console.error("Error al obtener token:", error);
        setError('Failed to load access token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  const isAuthenticated = !!accessToken;

  useEffect(() => {
    // Solo redirigir si el usuario no está autenticado, no está en la página de login, y estamos en el cliente
    if (isClient && !isLoading && !isAuthenticated && pathname !== '/login') {
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Sesión expirada',
          detail: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          life: 5000  // Duración del mensaje en milisegundos
        });
      }
      setTimeout(() => {
        router.push('/login'); // Redirige al login después de mostrar el Toast
      }, 5000); // Esperar 5 segundos antes de redirigir
    }
  }, [isClient, isLoading, isAuthenticated, pathname, router]);

  const contextValue = useMemo(() => ({
    accessToken,
    isLoading,
    error,
    isAuthenticated,
  }), [accessToken, isLoading, error, isAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>
      <Toast ref={toast} />  {/* Toast Component */}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
