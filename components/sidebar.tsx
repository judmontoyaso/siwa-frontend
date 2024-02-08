"use client";
import LoginButton from "@/components/Login";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import LogoSIWA from "@/public/LogoSIWA.png";
import { useSidebar } from "./context/sidebarContext";


const BearerContext = createContext('');

export default function Home() {

  const { user, error, isLoading } = useUser();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  
<button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
  {isSidebarOpen ? 'Ocultar' : 'Mostrar'}
</button>


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* Aquí puedes poner un componente de carga o un simple texto */}
        <div>Cargando...</div>
      </div>
    );
  }

  return (

        <><div
        id="default-sidebar"
        className={`left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'sm:translate-x-0 block' : '-translate-x-full hidden'
        } relative`}
        aria-label="Sidebar"
      >

            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
              <div className="flex flex-col items-center mt-5 mb-10">
                <div className="">
                  <Image src={LogoSIWA}
                    alt={""}
                    width={150}
                    height={150}
                    className=""></Image>
                </div>
              </div>
              <ul className="space-y-2 font-medium">
                <li>
                  <a href="/"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <svg
                      className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 21"
                    >
                      <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                      <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                    </svg>
                    <span className="ms-3">Dashboard</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
      
        
        <div
          className={`fixed bottom-5 left-5 z-50 `}
        >
            <Image
              src={LogoSIWA}
              alt="Logo SIWA"
              width={50} // Tamaño más pequeño para el logo flotante
              height={50}
              className="cursor-pointer"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div></>       
  );
}
