"use client"
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

interface AuthContextType {
  accessToken: string;
  isLoading: boolean;
  error: string;
}

// Crea el contexto con un valor inicial apropiado que cumpla con la interfaz
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        console.log("Token obtenido:", data.accessToken);
      } catch (error) {
        console.error("Error al obtener token:", error);
        setError('Failed to load access token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  const contextValue = useMemo(() => ({
    accessToken,
    isLoading,
    error
  }), [accessToken, isLoading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
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
