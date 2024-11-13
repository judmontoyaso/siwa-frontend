// app/not-found.tsx
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Genera posiciones aleatorias para los microorganismos
const getRandomPosition = () => ({
  top: `${Math.random() * 80 + 10}%`,
  left: `${Math.random() * 90}%`,
  scale: Math.random() * 0.5 + 0.5,
});

const Microorganism = ({ color }: { color: string }) => {
  const [position, setPosition] = useState(getRandomPosition());

  // // Actualiza la posición en intervalos regulares para lograr un efecto de rebote continuo
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setPosition(getRandomPosition());
  //   }, 1500); // Cambio de posición cada 1.5 segundos
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <motion.div
      className="absolute w-6 h-6 rounded-full"
      style={{
        backgroundColor: color,
        top: position.top,
        left: position.left,
        transform: `scale(${position.scale})`,
      }}
      animate={{
        x: Math.random() * 40 - 20, // Movimiento más amplio en X
        y: Math.random() * 40 - 20, // Movimiento más amplio en Y
        rotate: Math.random() * 720, // Rotación más intensa
      }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      }}
    />
  );
};

export default function NotFound() {
  const colors = ["#74c69d", "#06d6a0", "#ffd166", "#f4a261", "#ef476f"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {colors.map((color, index) => (
        <Microorganism key={index} color={color} />
      ))}
      
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ fontSize: '3rem', fontWeight: 'bold', color: '#333', marginBottom: '20px', zIndex: 10 }}
      >
        404 - Page Not Found
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px', zIndex: 10 }}
      >
        Sorry, the page you are looking for does not exist.
      </motion.p>
      
      <Link href="/">
        <motion.span
          whileHover={{ scale: 1.1, color: '#0056b3' }}
          style={{ marginTop: '20px', fontSize: '1.1rem', color: '#0070f3', textDecoration: 'underline', cursor: 'pointer', zIndex: 10 }}
        >
          Go back to Home
        </motion.span>
      </Link>
    </div>
  );
}
