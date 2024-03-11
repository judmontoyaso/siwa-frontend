// "use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importamos useRouter de Next.js

type StepTwoProps = {
  onNext: () => void;
  onBack: () => void;
  slug: string;
};

function StepTwo({ onNext, onBack, slug }: StepTwoProps) {
  const [extradata, setExtradata] = useState('');
  const router = useRouter(); // Inicializamos useRouter

  const checkExtradata = () => {
    onNext();
  };

  const handleCancel = () => {
    router.push('/admin/loadproject'); // Aquí defines la ruta a la que quieres que el usuario sea redirigido al cancelar
  };

  return (
    <div className='flex h-full items-center justify-center w-full'>
    <div className='text-center flex justify-center w-full'>
<div className='flex flex-col bg-white p-6 rounded-lg shadow-md w-1/3'>
    <label htmlFor="extradata" className="block text-sm font-medium text-gray-700">Extradata Path</label>
    <input
      type="text"
      name="extradata"
      id="extradata"
      value={extradata}
      onChange={(e) => setExtradata(e.target.value)}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
    <div className="flex justify-between mt-10">
      <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
        Atrás
      </button>
      <button onClick={handleCancel} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
        Cancelar
      </button>
      <button onClick={checkExtradata} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
        Siguiente
      </button>
    </div>
  </div>
    </div>
    </div>
  
  );
}

export default StepTwo;
