"use client";
import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Image } from 'primereact/image';
import imageload from '@/public/imagewait.png';


import React from 'react';
import Layout from "@/app/components/Layout";
import { useSidebar } from "@/app/components/context/sidebarContext";

const Page = ({ params }: { params: { slug: string } }) => {
  const filterContent = ""; // Replace with the actual implementation of 'filterContent'
  const [accessToken, setAccessToken] = useState();
  const [summaryTittle, setSummaryTittle] = useState("");
  const [summaryText, setSummaryText] = useState({} as any);
  const [configFile, setConfigFile] = useState({} as any);

  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const fetchToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/token`);
      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      console.log("Token obtenido:", accessToken);
      return accessToken; // Retorna el token obtenido para su uso posterior
    } catch (error) {
      console.error("Error al obtener token:", error);
    }
  };
  const fetchConfigFile = async (token: any) => {
    try {
      const response = await fetch(`/api/configfile/${params.slug}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Enviar el token
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const configfile = await response.json(); // Asume que las opciones vienen en un campo llamado 'configfile'
      setConfigFile(configfile.configFile);
      setSummaryText(configfile.configFile.summary);
      console.log(configfile);
      setSummaryTittle(configfile.configFile.summary.title); // Actualiza el estado con las nuevas opciones
    } catch (error) {
      console.error("Error al cargar las opciones del dropdown:", error);
    }
  };

  useEffect(() => {setIsSidebarOpen(true)}, [params.slug]);

  useEffect(() => {
    fetchToken().then((token) => {
      fetchConfigFile(token);
    });
  }
    , [params.slug]);


  return (
    <Layout slug={params.slug} filter={filterContent}>
<div className="w-10/12 mx-auto px-4 py-8">
  <div className="bg-white shadow-lg rounded-lg overflow-hidden pb-10">
<div className="w-full flex justify-center text-center">

{configFile?.summary?.image ? (   <h1 className="text-3xl m-5 font-bold text-gray-800 mb-6">{configFile?.summary?.title}</h1> ) : (         <h1 className="h-3.5 bg-gray-200 rounded-full dark:bg-gray-700 w-80 mb-4"></h1>
        )}
</div>

    <div className="flex flex-wrap md:flex-nowrap">

      {/* Contenedor de texto */}
      <div className="px-6 py-8 md:w-1/2">
      {configFile?.summary?.image ? (
        <div className="prose lg:prose-lg max-w-none space-y-4 text-start">
          {Object.entries(configFile?.summary?.text || {}).map(([key, value]) => (
            <p key={key} className="text-gray-700">{value as ReactNode}</p>
          ))}
        </div> ) : (

        <div className="w-full">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
    </div>)
}
      </div>

      {/* Contenedor de imagen */}
      <div className="md:w-1/2 flex justify-center items-center md:justify-end p-4">
        
        {configFile?.summary?.image ? (
          <Image src={configFile?.summary?.image} alt="Summary Image" width="500" height="300"  preview />
          
        ) : (
          <Image src={imageload.src} alt="Logo SIWA" width="650" className="animate-pulse" style={{ opacity: 0.2, filter: 'brightness(90%)' }} />
        )}

      </div>

    </div>
  </div>
</div>

    </Layout>
  );
};

export default Page;