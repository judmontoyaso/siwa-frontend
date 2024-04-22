"use client"

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from "@auth0/nextjs-auth0/client";
import { Tag } from 'primereact/tag';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/router';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { Dropdown } from 'primereact/dropdown';
import ProjectSelector from './projectSelector';
import { Avatar } from 'primereact/avatar';

interface NavbarProps {
  slug: string;
  breadcrumbs: string;
}

const Navbar: React.FC<NavbarProps> = ({ slug, breadcrumbs }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const { user, error, isLoading } = useUser();
  const menu = useRef(null);
  const toast = useRef(null);
  let items = [
    {label: 'Profile', icon: 'pi pi-fw pi-user', url: '/profile'},
    {label: 'Sign Out', icon: 'pi pi-fw pi-sign-out', url: '/api/auth/logout'}
];


const [projects, setProjects] = useState([]);
  // Maneja la apertura del menú
  const onMenuShow = () => setIsOpen(true);

  const onMenuHide = () => setIsOpen(false);


  // Maneja el cierre del menú
  const [selectedProject, setSelectedProject] = useState(slug);

  // Provide type annotation for the user object

  useEffect(() => {
    console.log(user?.Project);
    setProjects((user?.roject as any))}, [user]);

  
  // Manejar cambio de selección
  const onProjectChange = (e: { value: React.SetStateAction<string> }) => {
    setSelectedProject(e.value);
    // Aquí puedes agregar la lógica para manejar el cambio de proyecto, como redirigir al usuario
  };
  
  return (
    <nav className="flex justify-around p-4 bg-white align-middle items-center pt-4">
<>

<div className='w-3/5'>{breadcrumbs}</div></>
<div className='flex flex-row'>
     <div className="flex bg-white items-center">
         <ProjectSelector slug={slug} user={user}/>
    </div>

                      
      <div className="relative">

        <button onClick={(e) => (menu.current as any)?.toggle(e)}  aria-controls="popup_menu_left" aria-haspopup className='flex flex-row items-center justify-center'>
        <Avatar image={user?.picture ?? ""} icon="pi pi-user" size="large" shape="circle" />
        
                 <div className="flex items-center text-center mr-1">
        {/* Usa el estado isOpen para determinar qué ícono de flecha mostrar */}
        {isOpen ? <FaAngleUp className="ml-1 mt-1 w-6 h-6"/> : <FaAngleDown className="ml-1 mt-1 w-6 h-6"/>}
      </div> 
        </button>
  
        <Toast ref={toast}></Toast>
        <Menu model={items} popup ref={menu} id="popup_menu" onShow={onMenuShow} onHide={onMenuHide} className='mt-2 mr-0' />                        
      </div>
</div>
       

    </nav>
  );
};

export default Navbar;
