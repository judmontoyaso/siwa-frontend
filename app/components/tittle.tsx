"use client";
import React, { useState, useEffect } from 'react';

const TitleEffect = () => {
  const [words, setWords] = useState(['Understanding', 'Decoding', 'Revealing', 'Decrypting']);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Cambia cada segundo

    return () => clearInterval(interval);
  }, [words.length]);

  return <span>{words[index]} </span>;
};

export default TitleEffect;
