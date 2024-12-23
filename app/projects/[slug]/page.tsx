"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Image } from 'primereact/image';
import imageload from '@/public/imagewait.jpg';

import React from 'react';
import Layout from "@/app/components/Layout";
import { useSidebar } from "@/app/components/context/sidebarContext";
import Link from "next/link";
import { Card } from "primereact/card";
import Plot from "react-plotly.js";
import { useRouter } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import RequireAuth from "@/app/components/requireAtuh";
import { FaSpinner } from "react-icons/fa6";

const Page = ({ params }: { params: { slug: string } }) => {
  const filterContent = ""; // Replace with the actual implementation of 'filterContent'
  const [accessToken, setAccessToken] = useState();
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summaryText, setSummaryText] = useState<string[]>([]);
  const [configFile, setConfigFile] = useState({} as any);

  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const router = useRouter();

  const items = [
    { label: params.slug, template: () => <Link href={`/projects/${params.slug}`}>{params.slug}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: () => <Link href={`/`}><i className="pi pi-home"></i></Link> };
  const categoriespa: string[] = ['Lactobacillus', 'Bacteroides', 'Clostridium'];

  const categories: string[] = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];

  const fetchToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/token`);
      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      console.error("Error al obtener token:", error);
    }
  };

  const fetchConfigFile = async (token:any) => {
    try {
      const response = await fetch(`/api/configfile/${params.slug}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Enviar el token
        },
      });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const configfile = await response.json();
      console.log("Config file:", configfile);
      setConfigFile(configfile.configFile);
  
      // Lógica para el título
      let title = configfile.configFile.Dashboard?.Title || configfile.configFile.Summary?.Title || "Título no disponible";
      title = title.replace(/project: /i, '').trim();
      setSummaryTitle(title.charAt(0).toUpperCase() + title.slice(1));
      console.log("Title:", title);
      // Lógica para la descripción
      let description = configfile.configFile.Dashboard?.Description || 
                        `${configfile.configFile.Summary?.Goals || ''} ${configfile.configFile.Summary?.Design || ''}`.trim();
      description = description ? description : "Descripción no disponible";
      setSummaryText(description);
      
    } catch (error) {
      console.error("Error al cargar las opciones del dropdown:", error);
    }
  };
  

  useEffect(() => { setIsSidebarOpen(true); }, [params.slug]);

  // useEffect(() => {
  //   fetchToken().then((token) => {
  //     fetchConfigFile(token);
  //   });
  // }, [params.slug]);

  const PlotPreview = ({ data, layout, style }: { data: any, layout: any, style: any }) => (
    <Plot
      data={data}
      layout={{ ...layout, autosize: true }}
      style={style}
      useResizeHandler={true}
      config={{
        staticPlot: true,
        displayModeBar: false,
      }}
    />
  );

  const fetchModules = async (projectId: string) => {
    try {
      const response = await fetch(`/api/project/getmodules/${projectId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const modules = await response.json();
      return modules;
    } catch (error) {
      console.error("Error fetching modules:", error);
      return [];
    }
  };
  
  const [availableModules, setAvailableModules] = useState<string[]>([]);

useEffect(() => {
  const fetchData = async () => {
    const token = await fetchToken();
    await fetchConfigFile(token);
    const modules = await fetchModules(params.slug);
    setAvailableModules(modules);
  };

  fetchData();
}, [params.slug]);


  const plotsData = [
    {
      module: "Richness",
      title: 'Richness', // Mantiene el título, sin leyendas
      data: [
        {
          y: [1.2, 2.3, 5.2, 6, 7.3, 9.1],
          type: 'box',
          marker: {
            color: "#035060",
          },
          boxpoints: 'all',
          pointpos: 0,
          jitter: 0.3,
        },
        {
          y: [2, 3.3, 6.2, 7.8, 8.7, 9.2, 12.5],
          type: 'box',
          marker: {
            color: "#f99b35",
          },
          boxpoints: 'all',
          pointpos: 0,
          jitter: 0.3,
        }
      ],
      layout: { margin: { t: 0, r: 0, l: 0, b: 0 }, showlegend: false }, // Sin leyenda
      link: `/projects/${params.slug}/alpha`,
    },
    {
      module: "Community_Makeup",
      title: 'Community make-up', // Mantiene el título, sin leyendas
      data: [{
        x: [1, 2, 3, 4, 5],
        y: [1, 6, 3, 6, 1],
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: "#035060",
        },
      }],
      layout: { margin: { t: 0, r: 0, l: 0, b: 0 }, showlegend: false }, // Sin leyenda
      link: `/projects/${params.slug}/beta`,
    },
    {
      module: "Taxonomic_Abundance",
      title: 'Taxonomic abundance', // Título manteniendo las barras apiladas y dos columnas
      data: [
        {
          
          x: ['Column 1', 'Column 2'],
          y: [20, 15],
          name: 'Lactobacillus',
          type: 'bar',
          marker: {
            color: "#035060",
          },
          width: 0.8,
        },
        {
          x: ['Column 1', 'Column 2'],
          y: [12, 10],
          name: 'Peptoclostridium',
          type: 'bar',
          marker: {
            color: "#f99b35",
          },
          width: 0.8,
        },
        {
          x: ['Column 1', 'Column 2'],
          y: [10, 9],
          name: 'Fusobacterium',
          type: 'bar',
          marker: {
            color: "#4e8e74",
          },
          width: 0.8,
        },
        {
          x: ['Column 1', 'Column 2'],
          y: [9, 7],
          name: 'Blautia',
          type: 'bar',
          marker: {
            color: "#075462",
          },
          width: 0.8,
        }
      ],
      layout: {
        margin: { t: 0, r: 0, l: 0, b: 0 },
        barmode: 'stack', // Apiladas
        xaxis: {
          tickangle: -45,
        },
        yaxis: {
          zeroline: false,
          gridwidth: 1,
        },
        showlegend: false , // Leyendas deshabilitadas
      },
      link: `/projects/${params.slug}/taxonomy/composition`,
    },
    {
      module: "Differential_Abundance",
      title: 'Differential abundance', // Mantiene el título
      data: [{
        x: [20, 14, 23],
        y: ['Category 1', 'Category 2', 'Category 3'],
        type: 'bar',
        marker: {
          color: ["#035060", "#f99b35", "#4e8e74"],
        },
        orientation: 'h',
      }],
      layout: { margin: { t: 0, r: 0, l: 0, b: 0 }, showlegend: false }, // Sin leyenda
      link: `/projects/${params.slug}/abundancedif/datasetgeneration`,
    },
    {
      module: "Histo",
      title: 'Histopathology', // Mantiene el título
      data: [
        {
          x: ['MicrobialOrganisms'],
          y: [14],
          name: 'MicrobialOrganisms',
          type: 'bar',
          marker: {
            color: "#035060", // Color azul oscuro
          },
          width: 1,
        },
        {
          x: ['InflammationSeverity'],
          y: [1],
          name: 'InflammationSeverity',
          type: 'bar',
          marker: {
            color: "#f99b35", // Color naranja
          },
          width: 1,
        },
        {
          x: ['inmunity'],
          y: [7],
          name: 'inmunity',
          type: 'bar',
          marker: {
            color: "#y9jb55", // Color naranja
          },
          width: 1,
        },
        {
          x: ['LymphoidImmune'],
          y: [12],
          name: 'LymphoidImmune',
          type: 'bar',
          marker: {
            color: "#f55c66", // Color naranja
          },
          width: 1,
        },
      ],
      layout: {
        margin: { t: 0, r: 0, l: 0, b: 0 },
        barmode: 'stack',
        xaxis: {
          tickangle: -45,
        },
        yaxis: {
          zeroline: false,
          gridwidth: 1,
        },
         showlegend: false }, // Sin leyenda
      
      link: `/projects/${params.slug}/histopathology`,
    },
    {
      module: "Gene_Expression",
      title: 'Gene Expression', // Cambiado de "Personalized analyses" a "Gene Expression"
      data: [
        {
          y: [2.3, 5.2, 6, 7.3, 9.1],
          type: 'violin',
          marker: {
            color: "#035060",
          },
          box: { visible: false },
          boxpoints: 'all',
          meanline: { visible: true },
        },
        {
          y: [3.3, 6.2, 7.8, 9.2, 12.5],
          type: 'violin',
          marker: {
            color: "#f99b35",
          },
          box: { visible: false },
          boxpoints: 'all',
          meanline: { visible: true },
        }
      ],
      layout: { margin: { t: 0, r: 0, l: 0, b: 0 }, showlegend: false }, // Sin leyenda
      link: `/projects/${params.slug}/genexp`,
    }
  ].filter(plot => availableModules.includes(plot.module));  ;
  
const [loadingPlot, setLoadingPlot] = useState("");
const handleClick = (e: React.MouseEvent<HTMLDivElement>, title: string) => {
  setLoadingPlot(title);
  e.currentTarget.style.transform = "scale(0.95)";
  e.currentTarget.style.opacity = "0.8";


  // setTimeout(() => {
  //   setLoadingPlot(null);
  // }, 3000); 
};


  const handleTransitionEnd = (e: React.TransitionEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = "scale(1)";
    target.style.opacity = "1";
  };

  return (
    <RequireAuth>
      <Layout slug={params.slug} filter={filterContent} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home} className="text-sm" />}>
        <div className="w-full pb-8 flex justify-center">
          <div className="bg-white w-11/12 rounded-lg overflow-hidden pb-4">
            <div className="w-full flex justify-center text-center">
            {summaryTitle ? (
  <h1 className="flex-1 px-6 mb-5 font-poppins font-semibold text-3xl text-siwa-blue leading-normal">
    {summaryTitle}
  </h1>
) : (
  <h1 className="h-3.5 bg-gray-200 rounded-full w-80 mb-4"></h1>
)}
            </div>

            <div className="flex xl:flex-wrap flex-nowrap xl:flex-row flex-col-reverse">
              {/* Content Container */}
              <div className="xl:w-1/2 w-full flex flex-col justify-between">
  {summaryText ? (
    <div className="prose lg:prose-lg max-w-none text-start w-full">
      <Card className="p-0 border-none shadow-none">
        <div className="flex items-center py-[12px] px-4 bg-custom-green-400 mb-2">
          <h2 className="text-2xl font-medium text-white mb-0">
            Know more about {params.slug}
          </h2>
        </div>
        <p className="text-gray-700  font-light mb-4 p-2" style={{fontSize:'1.3rem'}}>
          {summaryText}
        </p>
        <div className= {`${configFile?.Dashboard?.Image ?  "rounded-none" : "rounded-full"} w-full flex justify-center items-center p-4`}>
          <Image
            src={configFile?.Dashboard?.Image || imageload.src}
            alt="Summary Image"
            className={`${configFile?.Dashboard?.Image ?" w-full" : "w-1/2 rounded-full"}`}
            height="300"
            preview={!configFile?.Dashboard?.Image}
          />
        </div>
      </Card>
    </div>
  ) : (
    <div className="w-full">
      <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full max-w-[460px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full max-w-[360px]"></div>
    </div>
  )}
</div>


              {/* Plots Container */}

              <div className="flex flex-col xl:w-1/2 w-full items-center justify-between">
              <Card className="p-0 border-none shadow-none">
                <div className="mb-4 w-full">
                  <div           className="w-full flex items-start p-4 mx-4 bg-custom-green-50 border border-custom-green-200 rounded-md text-left">
                    <i className="pi pi-info-circle text-custom-green-500 text-2xl mr-3"></i>
                    <div className="text-lg text-custom-green-500  text-left" style={{fontSize:'1.3rem'}}>
                      <p className="mb-2 text-lg" style={{fontSize:'1.2rem'}} >How to start?</p>
                      <p className="text-lg"style={{fontSize:'1.2rem'}}>
                        Use the sidebar on the left to navigate between different analyses available for this project, or begin your exploration now by selecting any of the available reports below.
                      </p>
                    </div>
                  </div>
                </div>
      

                  <div className="flex w-full flex-row flex-wrap justify-evenly">
                    {plotsData.map(plot => (
                      <Link href={plot.link} key={plot.title}>
                        <div
                          className={`relative bg-white shadow-md rounded-lg p-6 m-4 flex flex-col justify-between h-72 w-64 cursor-pointer hover:shadow-blue-500/50 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg`}
                          
                          onClick={(e) => handleClick(e, plot.title)}
                          onTransitionEnd={handleTransitionEnd}
                        >
                          {loadingPlot === plot.title && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                              <FaSpinner className="animate-spin text-siwa-blue text-lg" />
                            </div>
                          )}
                 <div className="flex-grow">
  {loadingPlot === plot.title ? (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
      <FaSpinner className="animate-spin text-siwa-blue text-lg" />
    </div>
  ) : (
    <>
      <h3 className="text-center font-semibold text-siwa-blue mt-4 mb-6" style={{fontSize:'1.3rem'}}>{plot.title}</h3>
      <PlotPreview data={plot.data} layout={plot.layout} style={{ width: 200, height: 120 }} />
    </>
  )}
</div>

                        </div>
                      </Link>
                    ))}
                  </div>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
};

export default Page;
