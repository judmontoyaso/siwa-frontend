import React, { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  title?: string; // Opcional: para agregar un título al gráfico si es necesario
};

const GraphicCard: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div className="relative flex flex-col mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
      {title && (
        <div className="px-5 py-3 text-lg font-semibold text-gray-800 bg-gradient-to-r from-blue-100 to-cyan-100">
          {title}
        </div>
      )}
      <div className="flex flex-col items-center justify-center p-5">
        {children}
      </div>
    </div>
  );
};

export default GraphicCard;
