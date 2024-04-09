import React, { ReactNode, useState } from 'react';
import PopupComponent from './popUpContent';
import { IoCloseOutline, IoFilterOutline } from "react-icons/io5";
import { Card } from 'primereact/card';

type CardProps = {
  children: ReactNode;
  title?: any;
  filter: any; // Para pasar el contenido del filtro al PopupComponent
  legend: any; // Para la leyenda del gráfico
};

const GraphicCard: React.FC<CardProps> = ({ children, title, filter, legend }) => {
  const [isFilterVisible, setIsFilterVisible] = useState(true); // Estado para controlar la visibilidad del PopupComponent

  // Función para alternar la visibilidad del filtro
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="flex flex-row items-start mt-6 bg-white w-full">
      {isFilterVisible && (
        <div className='flex w-1/4 relative h-full'>
          <PopupComponent filter={filter} />
        </div>
      )}

<Card className={`h-full ${ isFilterVisible ? 'w-3/4 relative' : 'w-full relative m-5' } `}>
        {/* Posiciona el botón de manera que sobresalga del contenedor de filtros como una pestaña */}
        <button onClick={toggleFilterVisibility} className={`absolute top-0 ${isFilterVisible ? '-left-14' : '-left-4'} text-white bg-siwa-blue opacity-80 border border-gray-300 rounded-lg p-2`}>
          {isFilterVisible ? <IoCloseOutline size="20" /> : <IoFilterOutline size="20" />}
        </button>
        {title && (
          <div className="px-5 py-3 text-lg font-semibold text-gray-800">
            {title}
          </div>
        )}
        <div className='flex justify-center w-full'>
          {legend}
        </div>
        <div className="flex flex-col items-center justify-center">
          {children}
        </div>
      </Card>


    </div>
  );
};

export default GraphicCard;
