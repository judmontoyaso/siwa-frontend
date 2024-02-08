import React, { ReactNode } from 'react';


type cardProps = {
  children: ReactNode;
};

const GraphicCard: React.FC<cardProps> = ({ children }) => {
  return (
    <div className="relative flex flex-col mt-6 text-gray-700 bg-white shadow-md bg-clip-border rounded-xl">
    <div className="rounded-xl m-2">
        {children}
    </div>
    </div>
  );
};

export default GraphicCard;