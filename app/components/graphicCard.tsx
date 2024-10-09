import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PopupComponent from './popUpContent';
import { IoCloseOutline, IoFilterOutline } from "react-icons/io5";
import { Card } from 'primereact/card';
import { usePopup } from './context/popupContext';
import { usePathname } from 'next/navigation';
import HelpText from './helpTextDropdown';

type CardProps = {
  children: ReactNode;
  title?: any;
  filter: any; // Para pasar el contenido del filtro al PopupComponent
  legend: any; // Para la leyenda del gráfico
  orientation?: 'horizontal' | 'vertical';
  slug?: string | null;
  text:any
};

const GraphicCard: React.FC<CardProps> = ({ children, title, filter, legend, orientation = "vertical", slug = "none", text }) => {
  const { isWindowVisible, setIsWindowVisible } = usePopup();
  const [isTaxo, setIsTaxo] = useState(false);
  const router = usePathname();
  const [widthAfterAnimation, setWidthAfterAnimation] = useState("100%"); // Estado para el width final

  // Función para alternar la visibilidad del filtro
  const toggleFilterVisibility = () => {
    setIsWindowVisible(!isWindowVisible);
  };

  useEffect(() => {
    router === `/projects/${slug}/taxonomy/composition` ? setIsTaxo(true) : setIsTaxo(false);
  }, [router, slug]);

  return (
    <div className={`flex pb-12 flex-row items-start mt-6 mb-6 bg-white w-full`}>
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: isWindowVisible ? 1 : 0, opacity: isWindowVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`flex pb-12 xl:w-1/4 md:w-1/4 relative h-auto filter-panel`}
        style={{ display: isWindowVisible ? 'block' : 'none' }}
      >
        <PopupComponent filter={filter} />
      </motion.div>

      <motion.div
        animate={{
          width: isWindowVisible ? "75%" : "85%",
          transition: { duration: 0.5, ease: "circOut" },
        }}
        onAnimationComplete={() => {
          setWidthAfterAnimation(isWindowVisible ? "75%" : "100%"); // Seteamos el width después de la animación
        }}
        style={{ width: widthAfterAnimation }} // Aplicamos el estado final del width
        className={`relative m-5`}
      >        
      
        <Card
          id='plofather'
          className={`h-auto relative card-graphic`}
        >
          {/* Botón de filtro */}
          <button
            onClick={toggleFilterVisibility}
            className={`absolute top-0 ${isWindowVisible ? '-left-14' : '-left-4'} text-white bg-siwa-blue opacity-80 border border-gray-300 rounded-lg px-2`}
          >
            {isWindowVisible ? <IoCloseOutline size="20" /> : <IoFilterOutline size="20" />}
          </button>

          {/* Título de la tarjeta */}
          <HelpText text={text}></HelpText>
          {title && (
            <div className="px-5 py-3 text-2xl font-semibold text-gray-800">
              {title}
            </div>
          )}

          <div className={`flex ${orientation === 'horizontal' ? 'flex-row-reverse' : 'flex-col'}`}>
            <div className={`flex flex-col items-center justify-center w-full`}>
              {children}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default GraphicCard;
