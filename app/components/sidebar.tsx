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

export default function Home({ slug, filter }: { slug: string, filter: any, }) {

  const { user, error, isLoading } = useUser();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isMicrobiomeOpen, setIsMicrobiomeOpen] = useState(true);
  const [visible, setVisible] = useState(true);
  const router = usePathname();

  useEffect(() => { setVisible(isSidebarOpen) }, [isSidebarOpen]);



  if (isLoading) {
    return (
      <div className="flex items-center h-full justify-center">
        <div><Spinner /></div>
      </div>
    );
  }

  return (

    <>

      <div className="card flex justify-content-center">
      <div className="bg-siwa-blue fixed left-0 top-0 h-full w-80 p-6 shadow-lg z-10"> {/* Sidebar estático */}
  <div className="flex flex-col items-center mb-6">
    <Image src={LogoSIWA} alt="SIWA Logo" width={120} height={120} />
  </div>

  <ul className="space-y-4 font-medium">
    {/* Projects */}
    <li>
      <Link aria-disabled={true} href={`/`} className="block">
        <div
          className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
            router === "/" ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
          }`}
        >
          <RiDashboardFill className="text-siwa-yellow text-xl" />
          <span className="ml-3 text-base">Projects</span>
        </div>
      </Link>
    </li>

    {/* Admin (visible solo si el rol es Admin) */}
    {user?.Rol === "Admin" && (
      <li>
        <Link aria-disabled={true} href={`/admin`} className="block">
          <div
            className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
              router === "/admin" ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
            }`}
          >
            <GrUserAdmin className="text-siwa-yellow text-xl" />
            <span className="ml-3 text-base">Admin</span>
          </div>
        </Link>
      </li>
    )}

    {/* Project Analysis - Condicional */}
    {slug && (
      <ul className="font-medium space-y-2">
        <li>
          <div
            className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
              router !== `/` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
            }`}
            onClick={() => setIsProjectOpen(!isProjectOpen)}
          >
            <IoIosAnalytics className="text-siwa-yellow text-xl" />
            <span className="ml-3 text-base">Project Analysis</span>
            {isProjectOpen ? <FaAngleUp className="ml-auto text-base" /> : <FaAngleDown className="ml-auto text-base" />}
          </div>
        </li>

        {/* Submenu Project Analysis */}
        {isProjectOpen && (
          <li className="ml-4">
            <ul className="space-y-2">
              <li>
                <Link href={`/projects/${slug}`} className="block">
                  <div
                    className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
                      router === `/projects/${slug}` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
                    }`}
                  >
                    <CgFileDocument className="text-siwa-yellow text-lg" />
                    <span className="ml-3 text-base">Summary</span>
                  </div>
                </Link>
              </li>

              <li>
                <div
                  className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
                    router === `/projects/${slug}/beta` || router === `/projects/${slug}/alpha` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
                  }`}
                  onClick={() => setIsMicrobiomeOpen(!isMicrobiomeOpen)}
                >
                  <FaBacteria className="text-siwa-yellow text-lg" />
                  <span className="ml-3 text-base">Microbiome</span>
                  {isMicrobiomeOpen ? <FaAngleUp className="ml-auto text-base" /> : <FaAngleDown className="ml-auto text-base" />}
                </div>
              </li>

              {/* Submenu Microbiome */}
              {isMicrobiomeOpen && (
                <ul className="ml-6 space-y-2">
                  <li>
                    <Link href={`/projects/${slug}/alpha`} className="block">
                      <div
                        className={`py-2 px-4 rounded-lg text-base cursor-pointer ${
                          router === `/projects/${slug}/alpha` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"
                        }`}
                      >
                        Richness
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/projects/${slug}/beta`} className="block">
                      <div
                        className={`py-2 px-4 rounded-lg text-base cursor-pointer ${
                          router === `/projects/${slug}/beta` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"
                        }`}
                      >
                        Community Make-Up
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/projects/${slug}/taxonomy/composition`} className="block">
                      <div
                        className={`py-2 px-4 rounded-lg text-base cursor-pointer ${
                          router === `/projects/${slug}/taxonomy/composition` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"
                        }`}
                      >
                        Taxonomic Abundance
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/projects/${slug}/abundancedif/datasetgeneration`} className="block">
                      <div
                        className={`py-2 px-4 rounded-lg text-base cursor-pointer ${
                          router === `/projects/${slug}/abundancedif/datasetgeneration` ? "bg-navy-400 border-navy-400 text-white" : "bg-navy-800 border-navy-800 text-white"
                        }`}
                      >
                        Differential Abundance
                      </div>
                    </Link>
                  </li>
                </ul>
              )}

              {/* Other items */}
              <li>
                <Link href={`/projects/${slug}/histopathology`} className="block">
                  <div
                    className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
                      router === `/projects/${slug}/histopathology` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
                    }`}
                  >
                    <TbReportAnalytics className="text-siwa-yellow text-lg" />
                    <span className="ml-3 text-base">Histopathology</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href={`/projects/${slug}/genexp`} className="block">
                  <div
                    className={`flex hover:bg-navy-500 transition-all duration-150 rounded-lg flex-row cursor-pointer items-center p-3 ${
                      router === `/projects/${slug}/genexp` ? "bg-navy-500 text-white" : "bg-navy-800 text-white"
                    }`}
                  >
                    <TbReportAnalytics className="text-siwa-yellow text-lg" />
                    <span className="ml-3 text-base">Gene Expression</span>
                  </div>
                </Link>
              </li>
            </ul>
          </li>
        )}
      </ul>
    )}
  </ul>

  {/* Additional filter content */}
  {filter && (
    <li className="mt-6 cursor-pointer hover:bg-navy-500 transition-all duration-150 rounded-lg text-white p-3">
      {filter}
    </li>
  )}
</div>

         </div>
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
          <FaAnglesRight className="text-siwa-yellow text-xl" />
        </div>
      </div>
    </>
  );
}
