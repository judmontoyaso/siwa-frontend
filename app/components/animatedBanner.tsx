import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

const AnimatedBanner = ({ message }: { message: string }) => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Retrasar el inicio de la animación después del montaje del componente
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 500); // Retraso de 1 segundo

    return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
  }, []);

  const props = useSpring({
    from: { transform: 'scale(0) rotate(0deg)', opacity: 0 },
    transform: startAnimation ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(0deg)',
    opacity: startAnimation ? 1 : 0,
    config: { tension: 250, friction: 12 },
  });

  return (
    <animated.div style={props} className="banner">
      {message}
      <style jsx>{`
        .banner {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #4CAF50; // Elegante color verde
          color: black;
          padding: 1rem 2rem;
          font-size: 1.5rem;
          border-radius: 10px;
          box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.3);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.18);
          z-index: 900; // Asegúrate de que esto esté encima de tu confeti
        }
      `}</style>    </animated.div>
  );
};

export default AnimatedBanner;
