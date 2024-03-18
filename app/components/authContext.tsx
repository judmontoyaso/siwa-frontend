"use client"

import { createContext, useContext, useState, useEffect } from 'react';


export function useAuth() {
    return useContext(AuthContext);
}
const AuthContext = createContext({ accessToken: '' });

import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {

    const fetchToken = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/token`);
            const { accessToken } = await response.json();
            setAccessToken(accessToken);
            console.log("Token obtenido:", accessToken);
            return accessToken; // Retorna el token obtenido para su uso posterior
        } catch (error) {
            console.error("Error al obtener token:", error);
        }
    };

    fetchToken();
  }, []);

return (
    <AuthContext.Provider value={{accessToken}}>
        {children}
    </AuthContext.Provider>
);
}
