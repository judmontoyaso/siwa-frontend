"use client";
import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";



import React from 'react';
import Layout from "@/app/components/Layout";

const Page = ({ params }: { params: { slug: string } }) => {
  const filterContent = ""; // Replace with the actual implementation of 'filterContent'
  const [accessToken, setAccessToken] = useState();
  const [summaryTittle, setSummaryTittle] = useState("");
  const [summaryText, setSummaryText] = useState({} as any);
  const [configFile, setConfigFile] = useState({} as any);


  const fetchToken = async () => {
    try {
      const response = await fetch(`${process.env.AUTH0_BASE_URL}/api/auth/token`);
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
      const response = await fetch(`http://127.0.0.1:8000/projects/config/${params.slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
        <h1 className="text-3xl m-5 font-bold text-gray-800 mb-6">{configFile?.summary?.title}</h1>
    <div className="flex flex-wrap md:flex-nowrap">

      {/* Contenedor de texto */}
      <div className="px-6 py-8 md:w-1/2">
        <div className="prose lg:prose-lg max-w-none space-y-4">
          {Object.entries(configFile?.summary?.text || {}).map(([key, value]) => (
            <p key={key} className="text-gray-700">{value as ReactNode}</p>
          ))}
        </div>
      </div>

      {/* Contenedor de imagen */}
      <div className="md:w-1/2 flex justify-center items-center md:justify-end p-4">
        <Image src={configFile?.summary?.image} alt="Summary Image" width={500} height={300} objectFit="cover" />
      </div>

    </div>
  </div>
</div>

    </Layout>
  );
};

export default Page;