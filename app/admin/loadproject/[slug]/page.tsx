"use client";
import React, { useEffect, useState } from 'react';
import StepOne from '@/app/components/wizard/stepone';
import StepTwo from '@/app/components/wizard/steptwo';
import Layout from '@/app/components/Layout';
import { useRouter } from 'next/navigation';
import confetti from "canvas-confetti";

function Wizard({ params }: { params: { slug: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [isExploding, setIsExploding] = useState(false); 
  const [isLoaded, setIsLoaded] = useState(false);
  const totalSteps = 3; // Ajusta este número al total de pasos de tu wizard
  let exploding = false;
  const onNext = () => {
    setCurrentStep(currentStep + 1);
    currentStep === 2 ? setIsExploding(true) : setIsExploding(false);
  };

  const onBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleHome = () => {
    router.push('/admin');
  };

  const defaults = {
    particleCount: 500,
    spread: 80,
    angle: 50,
  };




  useEffect(() => {
    setIsExploding( currentStep === 3 ? true : false)
    if (   currentStep === 3 ){
      setIsExploding(true);
      if (isExploding) {
        const fire = (particleRatio: number, opts: any) => {
          confetti(
            Object.assign({}, defaults, opts, {
              particleCount: Math.floor(defaults.particleCount * particleRatio),
            })
          );
        };
        console.log(isExploding);
        // Ejemplo de cómo podrías estructurarlo:
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });        // Añade más llamadas a 'fire' según sea necesario.
      }
    }
    else{console.log(isExploding)}
  }, [currentStep]); 

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
