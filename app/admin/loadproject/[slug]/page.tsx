"use client";
import React, { useEffect, useRef, useState } from 'react';
import StepOne from '@/app/components/wizard/stepone';
import StepTwo from '@/app/components/wizard/steptwo';
import Layout from '@/app/components/Layout';
import { useRouter } from 'next/navigation';
import confetti from "canvas-confetti";
import { SidebarProvider } from "@/app/components/context/sidebarContext";

function Wizard({ params }: { params: { slug: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [isExploding, setIsExploding] = useState(false); 
  const [isLoaded, setIsLoaded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
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
    router.push('/admin/loadproject');
  };

  const defaults = {
    particleCount: 500,
    spread: 80,
    angle: 90,
      origin: { y: 0.7 }
  };

  useEffect(() => {
    setIsExploding(currentStep === 3);
    if (currentStep === 3 && isExploding) {
      const fire = (particleRatio: number, opts: any) => {
        let confettiOpts = Object.assign({}, defaults, opts, {
          particleCount: Math.floor(defaults.particleCount * particleRatio),
        });

        if (messageRef.current) { // Verifica si el ref.current es no nulo
          const rect = messageRef.current.getBoundingClientRect();
          // Calcula el origen basado en la posición del elemento
          const origin = {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          };

          // Actualiza las opciones de confetti con el origen calculado
          confettiOpts.origin = origin;
        }

        confetti(confettiOpts);
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });       }
  }, [currentStep, isExploding]);
  
     // Añade más llamadas a 'fire' según sea necesario.
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
          <div className='flex items-center justify-center w-full'>
               <div className='text-center flex justify-center w-full'>
            <div className='flex flex-col bg-white p-6 rounded-lg shadow-md w-1/3'>
              <div>      <div ref={messageRef} className="message-container">Project Load :)</div>
              <button onClick={handleHome} className="bg-gray-200 mt-10 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                Exit
              </button>
              </div>
            </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <SidebarProvider>
      <Layout slug={''} filter={undefined}  breadcrumbs={""}>
      <div className='flex items-center justify-center w-full h-full'>
               <div className='text-center flex  flex-col justify-center w-full'>
        {renderStep()}
        <div className="flex justify-center mt-7">
          {renderStepIndicators()}
        </div>
        </div>
        </div>
      </Layout>
      </SidebarProvider>
    </div>
  );
}

export default Wizard;
