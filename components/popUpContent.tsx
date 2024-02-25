// Importaciones necesarias
import React, { useState } from 'react';

const PopupComponent = ({filter}: any) => {
  // Estado para controlar la visibilidad de la ventana
  const [isWindowVisible, setIsWindowVisible] = useState(false);

  // Función para alternar la visibilidad
  const toggleWindow = () => {
    setIsWindowVisible(!isWindowVisible);
  };

  return (
    <div className=" fixed z-50 w-96 right-8 flex content-end">
      {/* Botón para desplegar la ventana */}
      <div className="flex cursor-pointer p-4 pb-0 flex-row w-full text-center items-center justify-end" onClick={toggleWindow}>

<div className='flex flex-row'>
    <div className='w-5'>
    {!isWindowVisible ? <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#737373" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 300.906 300.906" xmlSpace="preserve">
          <g>
            <g>
              <path d="M288.953,0h-277c-5.522,0-10,4.478-10,10v49.531c0,5.522,4.478,10,10,10h12.372l91.378,107.397v113.978    c0,3.688,2.03,7.076,5.281,8.816c1.479,0.792,3.101,1.184,4.718,1.184c1.94,0,3.875-0.564,5.548-1.68l49.5-33    c2.782-1.854,4.453-4.977,4.453-8.32v-80.978l91.378-107.397h12.372c5.522,0,10-4.478,10-10V10C298.953,4.478,294.476,0,288.953,0    z M167.587,166.77c-1.539,1.809-2.384,4.105-2.384,6.48v79.305l-29.5,19.666V173.25c0-2.375-0.845-4.672-2.384-6.48L50.585,69.531    h199.736L167.587,166.77z M278.953,49.531h-257V20h257V49.531z" />
            </g>
          </g>
        </svg> :  <div className='w-5'>X</div> }
    </div>


        <span className="sm-2 dark:text-white ml-2 text-gray-500 hover:text-gray-600">Filters</span>
</div>
       


      </div>

      {isWindowVisible && (
        <div className="absolute top-0 left-0 m-2 mt-8  p-4 bg-white shadow-lg rounded-lg z-10">
   {filter}
        </div>
      )}
    </div>
  );
};

export default PopupComponent;
