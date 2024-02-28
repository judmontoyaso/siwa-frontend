"use client";
import LoginButton from "@/app/components/Login";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import LogoSIWA from "@/public/LogoSIWA.png";
import { useSidebar } from "./context/sidebarContext";
import NavLink from "./activeRoute";
import { usePathname } from "next/navigation";
import { RiDashboardFill } from "react-icons/ri";
import { IoIosAnalytics } from "react-icons/io";
import { FaBacteria } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";
import { GrUserAdmin } from "react-icons/gr";

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


console.log(user)
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

              <RiDashboardFill />
              <span className="ms-3">Dashboard</span>

            </div>
          </li>
        </ul>
        {user?.nickname === "juandavidsolorzano73" ? (


        <ul className="space-y-2 font-medium">
          <li>
          <Link aria-disabled={true} href={`/admin`} className="block px-1 ">

            <div className={`flex hover:bg-navy-600 hover:text-white  flex-row cursor-pointer my-4 p-4 ${router === "/Admin" ? "bg-navy-600 text-white" : "bg-white text-gray-500"}   rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`}>

              <GrUserAdmin />
              <span className="ms-3">Admin</span>
            </div>
          </Link>
          </li>
        </ul>
        ) : ""}

        {slug && (
          <ul className="font-medium">


            <li>



              <div className={`flex  hover:bg-navy-600 hover:text-white flex-row cursor-pointer my-4 p-4  ${router !== `/` ? "bg-navy-600 text-white" : "bg-white"} rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`} onClick={() => setIsProjectOpen(!isProjectOpen)}>
                <IoIosAnalytics /><span className="ms-3 ">Project {slug}</span>
              </div></li>
            {isProjectOpen && (
              <li>
                <div>
                  <ul>
                    <li>


                      <Link aria-disabled={true} href={`/projects/${slug}`} className="block px-1 ">
                        <div className={`flex flex-row cursor-pointer mt-4  hover:bg-navy-600 hover:text-white mb-2 p-4  ${router === `/projects/${slug}` ? "bg-navy-500 text-white" : "bg-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`}>
                          <CgFileDocument /><span className="ms-3">Summary</span>
                        </div></Link></li>
                    <li>
                      <div className="block px-1 ">

                        <div className={`flex flex-row cursor-pointer mt-4  hover:bg-navy-600 hover:text-white mb-2 p-4  ${router === `/projects/${slug}/beta` || router === `/projects/${slug}/alpha` ? "bg-navy-500 text-white" : "bg-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`} onClick={() => setIsMicrobiomeOpen(!isMicrobiomeOpen)}>
                          <FaBacteria />  <span className="ms-3">Microbiome</span>
                        </div>
                      </div></li>
                    {isMicrobiomeOpen && (
                      <li>                                <div className="block px-3 ">

                        <ul className="divide-y divide-gray-300">

                          <li className={`py-2 ${router === `/projects/${slug}/alpha` ? "bg-navy-400 text-white" : "bg-white text-gray-500"} my-1 border border-gray-400 w-11/12 rounded-lg  hover:bg-navy-600 hover:text-white`}>
                            <Link href={`/projects/${slug}/alpha`} className="block px-3 hover:text-gray-60">Alpha diversity</Link>
                          </li>
                          <li className={`py-2 ${router === `/projects/${slug}/beta` ? "bg-navy-400 text-white" : "bg-white text-gray-500"} my-1 border border-gray-400 w-11/12 rounded-lg  hover:bg-navy-600 hover:text-white`}>
                            <Link href={`/projects/${slug}/beta`} className="block px-3 ">
                              Beta diversity</Link>
                          </li>
                          <li className={`py-2 ${router === `/projects/${slug}/taxonomy` ? "bg-navy-400 text-white" : "bg-white text-gray-500"} my-1 border border-gray-400 w-11/12 rounded-lg  hover:bg-navy-600 hover:text-white`}>
                            <Link href={`/projects/${slug}/taxonomy/composition`} className="block px-3 ">
                              Taxonomy Composition</Link>
                          </li>
                        </ul>
                      </div></li>

                    )}

                    <li>

                      <div className="block px-1 ">


                        <div className="bg-gray-200 cursor-not-allowed flex flex-col hover:text-gray-600 my-4 p-4 rounded-lg rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center">
                          <span className="ms-3 text-gray-500 hover:text-gray-600">Histopathology</span>
                        </div></div></li>


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
