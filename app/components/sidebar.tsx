"use client";
import LoginButton from "@/app/components/Login";
import MyLink from "@/app/components/myLink";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import LogoSIWA from "@/public/Siwa-blanco-01.png";
import wSiwa from "@/public/Wsiwa.png";
import { useSidebar } from "./context/sidebarContext";
import NavLink from "./activeRoute";
import { usePathname } from "next/navigation";
import { RiDashboardFill } from "react-icons/ri";
import { IoIosAnalytics } from "react-icons/io";
import { FaBacteria } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";
import { GrUserAdmin } from "react-icons/gr";
import { FaAngleDown } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6"
import { Sidebar } from "primereact/sidebar";
import { FaAnglesRight } from "react-icons/fa6";
import Spinner from "./pacmanLoader";
import { TbReportAnalytics } from "react-icons/tb";
const BearerContext = createContext('');

export default function Home({ slug, filter }: { slug: string, filter: any,  }) {

  const { user, error, isLoading } = useUser();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isMicrobiomeOpen, setIsMicrobiomeOpen] = useState(true);
  const [visible, setVisible] = useState(false);
  const router = usePathname();

  useEffect(() => { setVisible(isSidebarOpen)}, [isSidebarOpen]);


  useEffect(() => {console.log("sidebar", isSidebarOpen)}, [isSidebarOpen]);

console.log(user)
  if (isLoading) {
    return (
      <div className="flex items-center h-full justify-center">
        {/* Aquí puedes poner un componente de carga o un simple texto */}
        <div><Spinner /></div>
      </div>
    );
  }

  return (

    <>
    
<div className="card flex justify-content-center">
    <Sidebar className="bg-siwa-blue" visible={visible} onHide={() => setVisible(false)} header={ <span className="">
            <Image src={LogoSIWA}
              alt={""}
              width={150}
              height={150}
              className=""></Image>
          </span>}>
   
         
     
        <ul className="space-y-2 font-medium">
          <li>
          <Link aria-disabled={true} href={`/`} className="block px-1 ">

            <div className={`flex hover:bg-navy-500 hover:text-white  flex-row cursor-pointer my-4 p-4 ${router === "/" ? "bg-navy-500 text-white" : "bg-navy-800 text-white"}   rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`} >

              <RiDashboardFill className="text-siwa-yellow"/>
              <span className="ms-3">Projects</span>

            </div>
            </Link>
          </li>
        </ul>
        {user?.Rol === "Admin" ? (


        <ul className="space-y-2 font-medium">
          <li>
          <Link aria-disabled={true} href={`/admin`} className="block px-1 ">

            <div className={`flex hover:bg-navy-500 hover:text-white  flex-row cursor-pointer my-4 p-4 ${router === "/admin" ? "bg-navy-500 text-white" : "bg-navy-800 text-white"}   rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`}>

              <GrUserAdmin  className="text-siwa-yellow"/>
              <span className="ms-3">Admin</span>
            </div>
          </Link>
          </li>
        </ul>
        ) : ""}

        {slug && (
          <ul className="font-medium">


            <li>



              <div className={`flex  hover:bg-navy-500 hover:text-white flex-row cursor-pointer my-4 p-4  ${router !== `/` ? "bg-navy-500 text-white" : "bg-navy-800"} rounded-lg shadow-md dark:bg-gray-800 text-center items-center w-full justify-center`} onClick={() => setIsProjectOpen(!isProjectOpen)}>
                <IoIosAnalytics  className="text-siwa-yellow"/><span className="ms-3 ">Project Analysis</span> {!isProjectOpen ? <FaAngleDown className="ml-2 mt-1"/> : <FaAngleUp  className="ml-2 mt-1" />}
              </div></li>
            {isProjectOpen && (
              <li>
                <div>
                  <ul>
                    <li>


                      <Link aria-disabled={true} href={`/projects/${slug}`} className="block px-1 " prefetch={true}>
                        <div className={`flex flex-row cursor-pointer mt-4  hover:bg-navy-500 hover:text-white mb-2 p-4  ${router === `/projects/${slug}` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`}>
                          <CgFileDocument  className="text-siwa-yellow"/><span className="ms-3">Summary</span>
                        </div></Link></li>
                    <li>
                      <div className="block px-1 ">

                        <div className={`flex flex-row cursor-pointer mt-4  hover:bg-navy-500 hover:text-white mb-2 p-4  ${router === `/projects/${slug}/beta` || router === `/projects/${slug}/alpha` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`} onClick={() => setIsMicrobiomeOpen(!isMicrobiomeOpen)}>
                          <FaBacteria className="text-siwa-yellow" />  <span className="ms-3">Microbiome</span> {!isMicrobiomeOpen ? <FaAngleDown className="ml-2 mt-1"/> : <FaAngleUp  className="ml-2 mt-1" /> }
                        </div>
                      </div></li>
                    {isMicrobiomeOpen && (
                      <li>                                <div className="block pl-1 mr-10 ">

                        <ul className="divide-y ">

                          <li className={`py-2 ${router === `/projects/${slug}/alpha` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"} mt-1 mb-1 w-11/12 rounded-lg  hover:bg-navy-500 hover:text-white hover:border-navy-500`}>
                            <MyLink href={`/projects/${slug}/alpha`} className="block px-3 hover:text-gray-60"prefetch={true}>Alpha diversity</MyLink>
                          </li>
                          <li className={`py-2 ${router === `/projects/${slug}/beta` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"} mt-1 mb-1 w-11/12 rounded-lg  hover:bg-navy-500 hover:text-white hover:border-navy-500`}>
                            <Link href={`/projects/${slug}/beta`} className="block px-3 "prefetch={true}>
                            Community make-up</Link>
                          </li>
                          <li className={`py-2 ${router === `/projects/${slug}/taxonomy/composition` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"} mt-1 mb-1 w-11/12 rounded-lg  hover:bg-navy-500 hover:text-white hover:border-navy-500`}>
                            <Link href={`/projects/${slug}/taxonomy/composition`} className="block px-3 "prefetch={true}>
                            Taxonomic abundance</Link>
                          </li>
                          <li className={`py-2 ${router === `/projects/${slug}/abundancedif/datasetgeneration` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"} mt-1 mb-1 w-11/12 rounded-lg  hover:bg-navy-500 hover:text-white hover:border-navy-500`}>
                            <Link href={`/projects/${slug}/abundancedif/datasetgeneration`} className="block px-3 "prefetch={true}>
                            Differential abundance</Link>
                          </li>
                        </ul>
                      </div></li>

                    )}

                    <li>

                      <div className="block px-1 ">


                        <div className="bg-navy-900 cursor-not-allowed flex flex-col  my-4 p-4 rounded-lg rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center">
                          <span className="ms-3 text-gray-500 ">Histopathology</span>
                        </div></div></li>
                        <li>


<Link aria-disabled={true} href={`/projects/${slug}/personalizedAnalyses`} className="block px-1  "prefetch={true}>
  <div className={`flex flex-row  mt-4  mb-2 p-4  ${router === `/projects/${slug}/personalizedAnalyses` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"}  rounded-lg  rounded-r-3xl shadow-md dark:bg-gray-800 text-center items-center w-11/12 justify-center`}>
    <TbReportAnalytics  className="text-siwa-yellow"/><span className="ms-3">Personalized analyses</span>
  </div></Link></li>



                  </ul>
                </div>
              </li>

            )}
            <li className="cursor-pointer my-4 hover:bg-gray-50 text-white hover:text-gray-600 "> {filter} </li>
          </ul>
        )}





     </Sidebar>  </div>
     <div className="flex bg-siwa-blue flex-col justify-between items-center cursor-pointer" onClick={() => setVisible(true)}>
     <div className="m-2" ><span className="">
            <Image src={wSiwa}
              alt={""}
              width={50}
              height={50}
              className="m-2 mt-4"></Image>
          </span>
      </div>
      <div className="w-full flex justify-center m-5 fixed bottom-10">
      <FaAnglesRight className="text-siwa-yellow text-xl"/>
      </div>
      </div>
      </>
  );
}
