import React, { useState, useEffect, useRef } from 'react';
import { IoCloseOutline, IoFilterOutline } from "react-icons/io5";
import { usePopup } from '../popupContext';

const PopupComponent = ({filter}: any) => {
  const { isWindowVisible, setIsWindowVisible } = usePopup();

  const popupRef = useRef(null); // Ref para el contenedor del popup

  const toggleWindow = () => {
    setIsWindowVisible(true);
  };

  useEffect(() => {
    // Función para manejar clics fuera del popup
    const handleClickOutside = (event: { target: any; }) => {
        if ((popupRef.current as unknown as HTMLElement) && !(popupRef.current as unknown as HTMLElement).contains(event.target)) {
            setIsWindowVisible(true); // Cierra el popup si el clic es fuera
        }
    };

    // Agregar listener cuando el popup está visible
    if (isWindowVisible) {
        document.addEventListener("mousedown", handleClickOutside);
    }

    // Limpiar listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWindowVisible]); // Este efecto se ejecuta sólo cuando `isWindowVisible` cambia

  return (
    <div className="w-full h-full flex content-end mr-5">
        <div ref={popupRef} className="my-4 xl:p-8 md:p-2 w-full h-full border border-gray-50 bg-gray-100 rounded-2xl overflow-y-scroll">
          {filter}
        </div>
    </div>
  );
};

export default PopupComponent;
