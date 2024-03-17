import React, { ReactNode } from 'react';
import PopupComponent from './popUpContent';

type CardProps = {
  children: ReactNode;
  title?: string;
  filter : any // Opcional: para agregar un título al gráfico si es necesario
};

const GraphicCard: React.FC<CardProps> = ({ children, title, filter }) => {
  return (
    <div className=" flex flex-row items-start mt-6 mx-10 bg-white border border-gray-100  overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out w-full">
      {title && (
        <div className="px-5 py-3 text-lg font-semibold text-gray-800 bg-gradient-to-r from-blue-100 to-cyan-100">
          {title}
        </div>
      )}
      <div className="flex flex-col items-center justify-center p-5 w-full">
        {children}
      </div>
      <PopupComponent filter={filter}></PopupComponent>
    </div>
  );
};

export default GraphicCard;
