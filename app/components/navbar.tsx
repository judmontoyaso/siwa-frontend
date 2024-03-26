"use client"

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from "@auth0/nextjs-auth0/client";
import { Tag } from 'primereact/tag';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/router';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

interface NavbarProps {
  slug: string;
}

const Navbar: React.FC<NavbarProps> = ({ slug }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const { user, error, isLoading } = useUser();
  const menu = useRef(null);
  const toast = useRef(null);
  let items = [
    {label: 'Profile', icon: 'pi pi-fw pi-user', url: '/profile'},
    {label: 'Sing Out', icon: 'pi pi-fw pi-sign-out', url: '/api/auth/logout'}
];

  // Maneja la apertura del menú
  const onMenuShow = () => setIsOpen(true);

  // Maneja el cierre del menú
  const onMenuHide = () => setIsOpen(false);



  return (
    <nav className="flex justify-end p-4 bg-white align-middle items-center">

          <div className="flex bg-white">
            {slug !== '' &&   <div>
              <Tag className="mr-20 ml-20" icon="pi pi-cloud">
                <span className='font-light'>Project: </span>{slug}
              </Tag> </div>}
          
           
          </div>
     
                      
      <div className="relative">

        <button onClick={(e) => (menu.current as any)?.toggle(e)}  aria-controls="popup_menu_left" aria-haspopup className='flex flex-row items-center justify-center'>
          <img
            src={user?.picture ?? ""}
            alt={""}
            width={50}
            height={50}
            className="bg-gray-200 w-10 h-10 rounded-full"
          ></img>
                 <div className="flex items-center text-center mr-1">
        {/* Usa el estado isOpen para determinar qué ícono de flecha mostrar */}
        {isOpen ? <FaAngleUp className="ml-1 mt-1 w-6 h-6"/> : <FaAngleDown className="ml-1 mt-1 w-6 h-6"/>}
      </div> 
        </button>
  
        <Toast ref={toast}></Toast>
        <Menu model={items} popup ref={menu} id="popup_menu" onShow={onMenuShow} onHide={onMenuHide} className='mt-2 mr-0' />                        
      </div>

    </nav>
  );
};

export default Navbar;
