"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Image } from 'primereact/image';
import imageload from '@/public/imagewait.png';


import React from 'react';
import Layout from "@/app/components/Layout";
import { useSidebar } from "@/app/components/context/sidebarContext";
import Link from "next/link";
import { Card } from "primereact/card";
import Plot from "react-plotly.js";
import { Message } from "primereact/message";
import { useRouter } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { UrlObject } from "url";
import RequireAuth from "@/app/components/requireAtuh";

const Page = ({ params }: { params: { slug: string } }) => {
  const filterContent = ""; // Replace with the actual implementation of 'filterContent'
  const [accessToken, setAccessToken] = useState();
  const [summaryTittle, setSummaryTittle] = useState("");
  const [summaryText, setSummaryText] = useState({} as any);
  const [configFile, setConfigFile] = useState({} as any);

  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const router = useRouter();

  const items = [
    { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
    { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };
  const categoriespa: string[] = ['Lactobacillus', 'Bacteroides', 'Clostridium'];

  const categories: string[] = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];

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


    const PlotPreview = ({ data, layout, style }: { data: any, layout: any, style: any }) => {
      return (
          <Plot
              data={data}
              layout={{ ...layout, autosize: true }}
              style={style}
              useResizeHandler={true}
            config={{
                staticPlot: true, // Desactiva todas las interacciones
                displayModeBar: false // Oculta la barra de herramientas
            }}
          />
      );
    };

    const plotsData = [
      {
          title: 'Richness',
          data: [
            {
              y: [1.2, 2.3,  5.2, 6, 7.3, 9.1],
              type: 'box',
              marker: {
                color: "#035060" // Asigna el primer color al boxplot
              },
              boxpoints: 'all', // Muestra todos los puntos de datos
        pointpos: 0, // Posición de los puntos respecto a la caja
        jitter: 0.3 // Controla la dispersión de los puntos
            },
            {
              y: [2, 3.3, 6.2, 7.8, 8.7, 9.2, 12.5],
              type: 'box',
              marker: {
                color: "#f99b35" // Asigna un segundo color al boxplot
              },
              boxpoints: 'all', // Muestra todos los puntos de datos
        pointpos: 0, // Posición de los puntos respecto a la caja
        jitter: 0.3 // Controla la dispersión de los puntos
            }
          ],
          layout: { margin: { t: 0, r: 0, l: 0, b: 0}, showlegend: false},
          link: `/projects/${params.slug}/alpha`
      },
      {
          title: 'Community make-up',
          data: [{
              x: [1, 2, 3, 4, 5],
              y: [1, 6, 3, 6, 1],
              mode: 'markers',
              type: 'scatter',
              marker: {
                color: "#035060" // Asigna el primer color al boxplot
            }
          }],
          layout: { margin: { t: 0, r: 0, l: 0, b: 0}},
          link: `/projects/${params.slug}/beta`
      },
      {
          title: 'Taxonomic abundance',
          data: [
            {
                x: ['Total'], // Cambia esto para apilar en un solo grupo
                y: [20],
                name: 'Lactobacillus',
                type: 'bar',
                marker: {
                  color: "#035060" // Asigna el primer color al boxplot
              },   width: 1 
            },
            {
                x: ['Total'], // Cambia esto para apilar en un solo grupo
                y: [12],
                name: 'Peptoclostridium',
                type: 'bar',
                marker: {
                  color: "#f99b35" // Segundo color
              },   width: 1 
            },
            {
              x: ['Total'], // Cambia esto para apilar en un solo grupo
              y: [10],
              name: 'Fusobacterium',
              type: 'bar',
              marker: {
                color: "#4e8e74" // Tercer color
            },   width: 1 
          },
          {
            x: ['Total'], // Cambia esto para apilar en un solo grupo
            y: [9],
            name: 'Blautia',
            type: 'bar',
            marker: {
              color: "#075462" // Reutiliza el primer color
          },   width: 1 
        }
        ],
        layout: {
          margin: { t: 0, r: 0, l: 0, b: 0},
            barmode: 'stack',
            xaxis: {
              tickangle: -45
          },
          yaxis: {
              zeroline: false,
              gridwidth: 1
          },
          legend: {
            x: 1.2, // Moves legend to the right outside of the plotting area
            xanchor: 'left', // Anchors the legend to the right side
            y: 1, // Positions the top of the legend at the top of the plotting area
            font: {
              size: 10 // Smaller font size for the legend
            }
          }},
          link: `/projects/${params.slug}/taxonomy/composition`
      },
      {
          title: 'Differential abundance',
          data: [{
              x: [20, 14, 23],
              y: ['Category 1', 'Category 2', 'Category 3'],
              type: 'bar',
              marker: {
                color: ["#035060", "#f99b35", "#4e8e74"] // Usa todos los colores para las diferentes categorías
            },
              orientation: 'h'
          }],
          layout: {  margin: { t: 0, r: 0, l: 0, b: 10}  },
          link: `/projects/${params.slug}/abundancedif/datasetgeneration`
      },

      {
        title: 'Histopathology',
        data: [
          {
            x: ['Total'], // Apila en un solo grupo
            y: [14],
            name: 'Lactobacillus',
            type: 'bar',
            marker: {
              color: "#035060" // Asigna el primer color al boxplot
            },
            width: 1 
          },
          {
            x: ['Total'], // Apila en un solo grupo
            y: [1],
            name: 'Peptoclostridium',
            type: 'bar',
            marker: {
              color: "#f99b35" // Segundo color
            },
            width: 1 
          },
     
          {
            x: ['Total'], // Apila en un solo grupo
            y: [3],
            name: 'Blautia',
            type: 'bar',
            marker: {
              color: "#075462" // Reutiliza el primer color
            },
            width: 1 
          },
          {
            x: ['Total'], // Apila en un solo grupo
            y: [5],
            name: 'Other',
            type: 'bar',
            marker: {
              color: "#ff6347" // Color adicional para la categoría "Other"
            },
            width: 1 
          }
        ],
        layout: {
          margin: { t: 0, r: 0, l: 0, b: 10 },
          barmode: 'stack',
          xaxis: {
            tickangle: -45
          },
          yaxis: {
            zeroline: false,
            gridwidth: 1
          },
          legend: {
            x: 1.2, // Moves legend to the right outside of the plotting area
            xanchor: 'left', // Anchors the legend to the right side
            y: 1, // Positions the top of the legend at the top of the plotting area
            font: {
              size: 10 // Smaller font size for the legend
            }
          }
        },
        link: `/projects/${params.slug}/histopathology`
      },
      {
        title: 'Personalized analyses',
        data: [
          {
            labels: categoriespa,
            values: [20, 15, 30],
            type: 'pie',
            marker: {
              colors: ["#035060", "#f99b35", "#4e8e74"] // Usa todos los colores para las diferentes categorías
            },
            textinfo: 'none' // Oculta los porcentajes y etiquetas dentro del gráfico
          }
        ],
        layout: {
          margin: { t: 0, r: 0, l: 0, b: 0 },
          showlegend: false // Oculta la leyenda de las categorías
        },
        link: `/projects/${params.slug}/personalizedAnalyses`
      }
      
  ];


  const responsiveOptions = [
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '600px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '480px',
        numVisible: 1,
        numScroll: 1
    }
];

const plotTemplate = (plot: { link: string | UrlObject; title: any | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | PromiseLikeOfReactNode | React.Key | null | undefined; data: any; layout: any; }) => {
    return (
        <Link href={plot.link} key={plot.title}>
            <div className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 p-4 pt-0 flex flex-col justify-between border w-64 h-72 m-4 card-preview">
                <div className="flex-grow">
                    <PlotPreview data={plot.data} layout={plot.layout} style={{ width: 200, height: 130 }} />
                </div>
                <div className="text-center font-medium">{plot.title}</div>
            </div>
        </Link>
    );
};
  

    const bg_discount_gradient = 'bg-gradient-to-tr from-navy-100 to-navy-400'
    const text_gradient = ' bg-gradient-to-br from-navy-300 via-navy-500 to-siwa-blue text-transparent bg-clip-text'
  return (
    <RequireAuth>
    <Layout slug={params.slug} filter={filterContent}  breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-sm"/>}>
<div className="w-full py-8 flex justify-center summary">
  <div className="bg-white w-11/12  rounded-lg overflow-hidden pb-4">
<div className="w-full flex justify-center text-center title summary">

{configFile?.summary?.image ? (    <h1 className="flex-1 px-6 mb-5 font-poppins font-semibold ss:text-[72px] text-[35px] text-white ss:leading-[100.8px] leading-[50px]">
          
            <span className={`${text_gradient}`}>{configFile?.summary?.title}</span>{" "}
          </h1> ) : (         <h1 className="h-3.5 bg-gray-200 rounded-full w-80 mb-4"></h1>
        )}
</div>

    <div className="flex xl:flex-wrap flex-nowrap xl:flex-row flex-col-reverse">

      {/* Contenedor de texto */}


      {/* Contenedor de imagen */}


    </div>
    <div className="flex flex-row-reverse w-full px-4 py-2">
           
                <div className="flex flex-col xl:w-1/2 w-1/3 items-center content-start mx-auto">
                <div className="mb-4 w-full justify-start">
                <Message severity="info" className="w-full justify-center text-xl message-summary" text="How to start? Use the sidebar on the left to navigate between different analyses available for this project, or begin your exploration now by selecting any of the available reports below." />
            </div>
            <div className="flex w-full flex-row flex-wrap  justify-evenly access-projects">
               {plotsData.map(plot => (
                        <Link href={plot.link} key={plot.title}>
                            <div className="">
                                <Card title={plot.title} className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 p-4 pt-0 flex flex-col justify-between border w-52 h-60 m-4 card-preview">
                                    <div className="flex-grow">
                                        <PlotPreview data={plot.data} layout={plot.layout} style={{ width: 150, height: 90 }} />
                                    </div>
                                </Card>
                            </div>
                        </Link>
                    ))}
            </div>
                   
                </div>


                <div className="px-6 xl:w-1/2 w-2/3 ">

     
{configFile?.summary?.image ? (
  <div className="prose lg:prose-lg max-w-none text-start w-full">
  <Card className="p-0"> 
<div className={`flex flex-row items-center py-[6px] px-4 ${bg_discount_gradient} mb-8`}>
<h2 className="w-full justify-start text-2xl font-semibold text-white text-start mb-2 mt-2">Know more about the {params.slug} project</h2>

  </div>  {Object.entries(configFile?.summary?.text || {}).map(([key, value]) => (
      <p key={key} className="text-gray-700 text-xl font-light mb-4 p-2">{value as ReactNode}</p>
    ))}
    <div className="w-full  flex justify-center items-center xl:justify-end p-4">
        
        {configFile?.summary?.image ? (
          <Image src={configFile?.summary?.image} alt="Summary Image" className="w-full" height="300"  preview />
          
        ) : (
          <Image src={imageload.src} alt="Logo SIWA" width="650" className="animate-pulse" style={{ opacity: 0.2, filter: 'brightness(90%)' }} />
        )}

      </div>
    </Card>


  </div>

  
    
    ) : (

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
          
        </div>
   
       



  </div>
</div>

    </Layout>
    </RequireAuth>
  );
};

export default Page;