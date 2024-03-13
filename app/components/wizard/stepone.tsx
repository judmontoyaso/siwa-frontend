// "use client" - Asegúrate de que este uso es necesario para tu caso específico
import { useState } from 'react';
import { useRouter } from 'next/navigation'

const StepOne = ({ onNext, slug }: { onNext: () => void; slug: string }) => {
  const [configFile, setConfigFile] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfigFile(e.target.checked);
  };

  const handleCancel = () => {
    router.push('/admin/loadproject');
  };

  const handleNext = async () => {
    console.log(configFile);
    if (configFile) {
      onNext();
    } else {
      // Considerar una implementación más suave para mostrar errores
      alert("Please load the config file before proceeding.");
    }
  };

  return (
    <div className='flex h-full items-center justify-center w-full'>
    <div className='text-center flex justify-center w-full'>
    <div className='flex flex-col bg-white p-6 rounded-lg shadow-md w-1/3 justify-center text-center items-center'>      <div className="flex items-center">
        <label htmlFor="extradata" className="text-sm font-medium text-gray-700 mr-2">
          Load config file {slug}:
        </label>
        <input type="checkbox" checked={configFile} onChange={handleFileChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
      </div>
      <div className="flex justify-evenly m-10 w-full">
        <button onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          Cancel
        </button>
        <button onClick={handleNext} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          Next
        </button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default StepOne;
