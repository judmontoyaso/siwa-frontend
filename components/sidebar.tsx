"use client";
import LoginButton from "@/components/Login";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import LogoSIWA from "@/public/LogoSIWA.png";
import { useSidebar } from "./context/sidebarContext";
import NavLink from "./activeRoute";
import { usePathname } from "next/navigation";


const BearerContext = createContext('');

export default function Home({ slug, filter }: { slug: string, filter: any }) {

  const { user, error, isLoading } = useUser();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isMicrobiomeOpen, setIsMicrobiomeOpen] = useState(true);
  const router = usePathname();
 

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
      className={`left-0 z-40 w-1/4 h-screen transition-transform ${isSidebarOpen ? 'sm:translate-x-0 block' : '-translate-x-full hidden'
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
            <div className={`flex hover:bg-navy-600 hover:text-white  flex-row cursor-pointer my-4 p-4 ${router === "/" ? "bg-navy-600 text-white" : "bg-white text-gray-500"}   rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`} onClick={() => window.location.href = "/"}>

              <svg
                className="w-5 h-5 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 21"
              >
                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
              </svg>
              <span className="ms-3">Dashboard</span>

            </div>
          </li>
        </ul>
        {slug && (
          <ul className="font-medium">


            <li>



              <div className={`flex  hover:bg-navy-600 hover:text-white flex-row cursor-pointer my-4 p-4  ${router !== `/` ? "bg-navy-600 text-white" : "bg-white"} rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`} onClick={() => setIsProjectOpen(!isProjectOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={` ${router !== `/` ? "#ffffff" : "6B7280" }`} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg><span className="ms-3 ">Project {slug}</span>
              </div></li>
            {isProjectOpen && (
              <li>
                <div>
                <ul>
                <li>



<div className={`flex flex-col cursor-pointer mt-4  hover:bg-navy-600 hover:text-white mb-2 p-4  ${router === `/projects/${slug}` ? "bg-navy-500 text-white" : "bg-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`}>
<Link aria-disabled={true} href={`/projects/${slug}`} className="block px-4 ">Summary</Link>
</div></li>
                <li>
                  <div className={`flex flex-col cursor-pointer mt-4  hover:bg-navy-600 hover:text-white mb-2 p-4  ${router === `/projects/${slug}/beta` || router === `/projects/${slug}/alpha`  ? "bg-navy-500 text-white" : "bg-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`} onClick={() => setIsMicrobiomeOpen(!isMicrobiomeOpen)}>
                    <span className="ms-3">Microbiome</span>
                  </div></li>
                {isMicrobiomeOpen && (
                  <li>                <div>
                  <ul className="divide-y divide-gray-300">
                    <li className={`py-2 ${router === `/projects/${slug}/beta` ? "bg-navy-400 text-white" : "bg-white text-gray-500"} my-1 border border-gray-400 w-11/12 rounded-lg  hover:bg-navy-600 hover:text-white`}>
                      <Link href={`/projects/${slug}/beta`} className="block px-4 ">Beta diversity</Link>
                    </li>
                    <li className={`py-2 ${router === `/projects/${slug}/alpha` ? "bg-navy-400 text-white" : "bg-white text-gray-500"} my-1 border border-gray-400 w-11/12 rounded-lg  hover:bg-navy-600 hover:text-white`}>
                    <Link href={`/projects/${slug}/alpha`} className="block px-4 hover:text-gray-60">Alpha diversity</Link>
                    </li>
                    <li className="py-2 my-1 border border-gray-300 w-11/12 rounded-lg bg-gray-200 cursor-not-allowed ">
                      <span className="block px-4">Taxonomy</span>
                    </li>
                  </ul>
                  </div></li>

)}

                <li>



                  <div className="bg-gray-200 cursor-not-allowed flex flex-col hover:text-gray-600 my-4 p-4 rounded-lg rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center">
                    <span className="ms-3 text-gray-500 hover:text-gray-600">Histopathology</span>
                  </div></li>


              </ul>
                </div>
              </li>
         
            )}
            <li className="cursor-pointer my-4 hover:bg-gray-50 text-gray-500 hover:text-gray-600 "> {filter} </li>
          </ul>
        )}


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
