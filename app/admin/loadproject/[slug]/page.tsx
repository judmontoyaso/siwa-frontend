"use client";
import React, { useState } from 'react';
import StepOne from '@/app/components/wizard/stepone';
import StepTwo from '@/app/components/wizard/steptwo';
import Layout from '@/app/components/Layout';
import { useRouter } from 'next/navigation';

function Wizard({ params }: { params: { slug: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const totalSteps = 3; // Ajusta este número al total de pasos de tu wizard

  const onNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const onBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleHome = () => {
    router.push('/admin');
  };


  const renderStepIndicators = () => {
    return Array.from({ length: totalSteps }, (_, index) => (
      <span
        key={index}
        className={`inline-block h-2 w-2 rounded-full mx-1 ${
          currentStep === totalSteps && index + 1 === totalSteps
            ? 'bg-green-500' // El último círculo se muestra en verde si estás en el paso final (por defecto)
            : index + 1 <= currentStep
            ? 'bg-blue-500' // Círculos para los pasos completados o el actual se muestran en azul
            : 'bg-gray-300' // Círculos para los pasos no completados se muestran en gris
        }`}
      />
    ));
  };
  
  

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne onNext={onNext} slug={params.slug} />;
      case 2:
        return <StepTwo onNext={onNext} onBack={onBack} slug={params.slug} />;
      default:
        return (
          <div className='flex justify-center w-full'>
            <div className='flex flex-col bg-white p-6 rounded-lg shadow-md w-1/3'>
              <div><div>Project Load :)</div>
              <button onClick={handleHome} className="bg-gray-200 mt-10 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                Exit
              </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Layout slug={''} filter={undefined}>
        {renderStep()}
        <div className="flex justify-center mt-4">
          {renderStepIndicators()}
        </div>
      </Layout>
    </div>
  );
}

export default Wizard;
