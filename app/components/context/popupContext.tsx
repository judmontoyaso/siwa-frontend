"use client";

import React, { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';



interface PopupContextType {
    isWindowVisible: boolean;
  setIsWindowVisible: Dispatch<SetStateAction<boolean>>;
}

const PopupContext = createContext<PopupContextType>({
    isWindowVisible: true,
    setIsWindowVisible: () => {}, 
});

export const usePopup = () => useContext(PopupContext);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWindowVisible, setIsWindowVisible] = useState<boolean>(true);

  return (
    <PopupContext.Provider value={{ isWindowVisible, setIsWindowVisible }}>
      {children}
    </PopupContext.Provider>
  );
};

