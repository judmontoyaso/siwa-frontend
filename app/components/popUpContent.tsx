import React, { useState, useEffect, useRef } from 'react';
import { IoCloseOutline, IoFilterOutline } from "react-icons/io5";

const PopupComponent = ({filter}: any) => {
  const [isWindowVisible, setIsWindowVisible] = useState(false);
  const popupRef = useRef(null); // Ref para el contenedor del popup

  const toggleWindow = () => {
    setIsWindowVisible(!isWindowVisible);
  };

  useEffect(() => {
    // Función para manejar clics fuera del popup
    const handleClickOutside = (event: { target: any; }) => {
        if ((popupRef.current as unknown as HTMLElement) && !(popupRef.current as unknown as HTMLElement).contains(event.target)) {
            setIsWindowVisible(false); // Cierra el popup si el clic es fuera
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
    <div className="fixed z-50 w-96 right-8 flex content-end">
      <div className="flex cursor-pointer p-4 pb-0 flex-row w-full text-center items-center justify-end" onClick={toggleWindow}>
        <div className='flex flex-row'>
          <div className='w-5'>
            {!isWindowVisible ? <IoFilterOutline /> : <IoCloseOutline />}
          </div>
        </div>
      </div>

      {isWindowVisible && (
        <div ref={popupRef} className="absolute top-0 left-0 m-2 mt-8 p-4 bg-white shadow-lg rounded-lg z-10">
          {filter}
        </div>
      )}
    </div>
  );
};

export default PopupComponent;
