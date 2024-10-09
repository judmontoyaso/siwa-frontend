import { useState, useEffect } from 'react';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function HelpText( { text }: { text: string } ) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

  return (
text  && (
    <div className="relative w-full">
      {!isOpen && (
        <motion.button
          className="flex items-center gap-2 p-3 bg-transparent border border-custom-green-500 text-custom-green-500 rounded-md hover:bg-custom-green-50 focus:outline-none overflow-hidden"
          whileHover={{ scale: 1.05, width: '200px' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ width: isHovered ? '200px' : '50px' }}
          style={{ width: '50px', cursor: 'pointer', transition: 'width 0.15s ease', whiteSpace: 'nowrap' }}
        >
          <FaQuestionCircle size={24} />
          {isHovered && !isOpen && (
            <motion.span
              className="ml-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 }}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              How to Interpret
            </motion.span>
          )}
        </motion.button>
      )}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full p-4 bg-custom-green-50 border border-custom-green-200 rounded-md text-left"
        >
          <button
            className="absolute top-2 right-2 text-custom-green-600 hover:text-custom-green-800"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <FaTimes size={16} />
          </button>
          <div>
            {}
            {text}
          </div>
        </motion.div>
      )}
    </div>)
  );
}