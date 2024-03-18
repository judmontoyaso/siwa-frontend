import React, { ReactNode } from 'react';
import PopupComponent from './popUpContent';

type CardProps = {
  children: ReactNode;
  title?: string;
  filter : any // Opcional: para agregar un título al gráfico si es necesario
};

const GraphicCard: React.FC<CardProps> = ({ children, title, filter }) => {
  return (
    <div className=" flex flex-row items-start mt-6 bg-white border border-gray-100  overflow-x-scroll hover:shadow-lg transition-shadow duration-100 ease-in-out w-full">
      {title && (
        <div className="px-5 py-3 text-lg font-semibold text-gray-800 bg-gradient-to-r from-blue-100 to-cyan-100">
          {title}
        </div>
      )}
      <div className="flex flex-col items-center justify-center p-5 w-4/5">
        {children}
      </div>
      <div className='flex w-1/5'>
      <PopupComponent filter={filter}></PopupComponent>
      </div>
    </div>
  );
};

export default GraphicCard;
