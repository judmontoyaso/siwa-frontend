import React from 'react';
import Link from 'next/link';

const CardButton = ({ href, Icon, onClick, title }: { href: string; Icon: any; onClick: any; title: string }) => {
  // Si hay una función onClick, se usa, si no, se renderiza un enlace
  if (onClick) {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-evenly p-6 max-w-md mx-5 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out m-4 cursor-pointer dark:bg-gray-800 dark:border-gray-700 w-96 h-36"
      >
        <h5 className="text-2xl font-bold tracking-tight text-gray-700 dark:text-white">{title}</h5>
        <Icon className="text-3xl text-gray-700" />
      </div>
    );
  }

  return (
    <Link href={href}>
      <div className="flex items-center justify-evenly p-6 max-w-md mx-5 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out m-4 cursor-pointer dark:bg-gray-800 dark:border-gray-700 w-96 h-36">
        <h5 className="text-2xl font-bold tracking-tight text-gray-700 dark:text-white">{title}</h5>
        <Icon className="text-3xl text-gray-700" />
      </div>
    </Link>
  );
};

export default CardButton;
