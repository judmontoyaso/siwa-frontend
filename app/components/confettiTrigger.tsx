import React, { useState } from 'react';
import Confetti from 'react-confetti';
import AnimatedBanner from './animatedBanner';
import { useUser } from "@auth0/nextjs-auth0/client";

export default function ConfettiTrigger({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const { user, error, isLoading } = useUser();
  const today = new Date();
  const isAprilSecond2024 = today.getDate() === 2 && today.getMonth() === 3 && today.getFullYear() === 2024;
  
  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 5000); // Ajusta este tiempo si es necesario
  };

  return (
    <div>

{isActive && (user?.nickname === "daniela.varela.tabares" || user?.nickname === "juandavidsolorzano73") && isAprilSecond2024 && (
    <>
        <div className="overlay"></div>
        <Confetti />
        <div className="banner">
            <AnimatedBanner message="¡Feliz Cumpleaños!" /> 
        </div>
    </>
)}


      <button className="" onClick={handleClick}>
        {children}
      </button>

      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0); // Fondo oscuro semitransparente
          z-index: 10; // Asegúrate de que esto esté debajo de tu pancarta y confeti
        }
        .banner {
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FFFFFF 0%, #A5CC82 100%); /* Gradiente de blanco a verde */
            color: #333333; /* Cambiando el color del texto a un gris oscuro para mejor contraste con el fondo claro */
            padding: 1.5rem 3rem; /* Espaciado generoso */
            font-size: 2rem; /* Tamaño de fuente grande */
            font-family: 'Poppins', sans-serif; /* Tipografía moderna */
            letter-spacing: 0.05em; /* Espaciado entre letras */
            border-radius: 20px; /* Bordes redondeados */
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* Sombra suave */
            text-align: center;
            border: none; /* Sin bordes */
            z-index: 900; /* Asegurando que esté sobre otros elementos */
            transition: transform 0.3s ease; /* Transición suave para el efecto hover */
          }
          
          .banner:hover {
            transform: translateX(-50%) scale(1.05); /* Efecto de hover sutil */
          }
          
      `}</style>
    </div>
  );
}
