import React, { ReactNode, useEffect, useState } from 'react';
import PopupComponent from './popUpContent';
import { IoCloseOutline, IoFilterOutline } from "react-icons/io5";
import { Card } from 'primereact/card';
import { usePopup } from '../popupContext';
import { usePathname } from 'next/navigation';

type CardProps = {
  children: ReactNode;
  title?: any;
  filter: any; // Para pasar el contenido del filtro al PopupComponent
  legend: any; // Para la leyenda del gráfico
  orientation?: 'horizontal' | 'vertical';
  slug?: string | null;};

const GraphicCard: React.FC<CardProps> = ({ children, title, filter, legend, orientation = "vertical" , slug = "none"}) => {
  const { isWindowVisible, setIsWindowVisible } = usePopup();
const [isTaxo, setIsTaxo] = useState(false);
const router = usePathname();
  // Función para alternar la visibilidad del filtro
  const toggleFilterVisibility = () => {
    setIsWindowVisible(!isWindowVisible);
  };

  useEffect(() => {router === `/projects/${slug}/taxonomy/composition` ? setIsTaxo(true) : setIsTaxo(false)})

  // useEffect(() => {console.log("isWindowVisible", isWindowVisible)}, [isWindowVisible]);

  return (
    <div className={`flex ${isTaxo ? "xl:flex-row md:flex-col" : "flex-row"}  items-start mt-6 bg-white w-full`}>
      {isWindowVisible && (
        <div className={`flex ${isTaxo? "xl:w-1/4 md:w-full taxograph" : "w-1/4"  } relative heightGraph`}>
          <PopupComponent filter={filter} />
        </div>
      )}

<Card className={`h-full ${ isWindowVisible ? isTaxo? "xl:w-3/4 md:w-full" : "w-3/4" : "w-full"} relative' : 'w-full relative m-5' } `}>
        {/* Posiciona el botón de manera que sobresalga del contenedor de filtros como una pestaña */}
        <button onClick={toggleFilterVisibility} className={`absolute top-0 ${isWindowVisible ? isTaxo?'md:-left-4 xl:-left-14' : '-left-14': '-left-4'} text-white bg-siwa-blue opacity-80 border border-gray-300 rounded-lg p-2`}>
          {isWindowVisible ? <IoCloseOutline size="20" /> : <IoFilterOutline size="20" />}
        </button>
        {title && (
          <div className="px-5 py-3 text-lg font-semibold text-gray-800">
            {title}
          </div>
        )}
        <div className={`flex ${orientation === 'horizontal' ? 'flex-row-reverse' : 'flex-col'}`}>
           <div className={`flex justify-center  ${orientation === 'horizontal' ? 'w-2/5' : 'w-full'}`}>
          {legend}
        </div>
        <div className={`flex flex-col items-center justify-center  ${orientation === 'horizontal' ? 'w-3/5' : 'w-full'}`}>
          {children}
        </div>
        </div>
       
      </Card>


    </div>
  );
};

export default GraphicCard;
