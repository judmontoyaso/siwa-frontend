"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definimos el tipo para el contexto
interface PopupContextType {
  isWindowVisible: boolean;
  setIsWindowVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

// Creamos el contexto con un valor predeterminado (undefined) para manejar la desestructuración segura
const PopupContext = createContext<PopupContextType | undefined>(undefined);

// Hook para consumir el contexto
export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext);

  if (!context) {
    console.error("usePopup was called outside of PopupProvider");
    throw new Error("usePopup must be used within a PopupProvider");
  }

  return context;
};


// Componente proveedor del contexto
interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [isWindowVisible, setIsWindowVisible] = useState(false);

  return (
    <PopupContext.Provider value={{ isWindowVisible, setIsWindowVisible }}>
      {children}
    </PopupContext.Provider>
  );
};
