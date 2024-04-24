"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { useAuth } from "@/app/components/authContext";
import Spinner from "@/app/components/pacmanLoader";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Tooltip as PrimeToolTip } from 'primereact/tooltip';
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { Accordion, AccordionTab } from "primereact/accordion";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import Link from "next/link";
import { Image } from 'primereact/image';



export default function Page({ params }: { params: { slug: string } }) {
    type OtuType = {
        index: string[];
        columns: string[];
        data: number[][];
    };
    const { accessToken } = useAuth();

    const { user, error, isLoading } = useUser();
    const [isLoaded, setIsLoaded] = useState(false);
    const [plotData, setPlotData] = useState<any[]>([]);

    const [plotDataObserved, setPlotDataObserved] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const [otus, setOtus] = useState<any>();
    const [selectedValue, setSelectedValue] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [valueOptions, setValueOptions] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const newScatterColors: { [key: string]: string } = {};

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("samplelocation");
    const [selectedGroup, setSelectedGroup] = useState("samplelocation");
    const [selectedRank, setSelectedRank] = useState("genus");
    const [observedData, setObservedData] = useState({});
    const [colorByOptions, setColorByOptions] = useState<string[]>(['age', 'treatment']);
    const [colorBy, setColorBy] = useState<string>('samplelocation');
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);
    const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
    const [filterPeticion, setFilterPeticion] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([
        "cecum",
        "feces",
        "ileum",
    ]);
    const [Location, setLocation] = useState<string[]>([
        "cecum",
        "feces",
        "ileum",
    ]);
    const taxonomyOptions = [
        "phylum",
        "class",
        "order",
        "family",
        "genus",
        "species"
    ];
    const colors = [
        "#092538", // Azul oscuro principal
  "#2E4057", // Azul petróleo oscuro
  "#415a55", // Verde azulado oscuro (color adicional que querías incluir)
  "#34675C", // Verde azulado más claro

  // Amarillos y naranjas
  "#FEF282", // Amarillo claro principal
  "#F6C324", // Amarillo mostaza
  "#FFA726", // Naranja
  "#FF7043", // Naranja rojizo

  // Grises y neutrales
  "#BFBFBF", // Gris claro
  "#8C8C8C", // Gris medio
  "#616161", // Gris oscuro
  "#424242", // Gris muy oscuro

  // Rojos y púrpuras
  "#E53935", // Rojo
  "#D81B60", // Fucsia
  "#8E24AA", // Púrpura

  // Verdes y azules
  "#43A047", // Verde
  "#00ACC1", // Cian
  "#1E88E5", // Azul

  // Colores adicionales para diversidad
  "#6D4C41", // Marrón
  "#FDD835", // Amarillo dorado
  "#26A69A", // Verde azulado claro
  "#7E57C2", // Lavanda oscuro
  "#EC407A", // Rosa
    ];

    const [configFile, setconfigFile] = useState({} as any);

    const itemsBreadcrumbs = [
        { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
        { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
      { label: 'Personalized Analyses', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/personalizedAnalyses`}>{item.label}</Link> },
    
    ];
    
    const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };
    

      
        const fetchConfigFile = async (token: any) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/configfile/${params.slug}`, {
              headers: {
                Authorization: `Bearer ${token}`, // Enviar el token
              },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const configfile = await response.json(); // Asume que las opciones vienen en un campo llamado 'configfile'
            console.log(configfile);
            setconfigFile(configfile.configFile);

            const combinedOptions = Array.from(new Set([...colorByOptions, ...configfile.configFile.columns]));
            setColorByOptions(combinedOptions);
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
            // window.location.href = `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/logout`;
        }
    };


    useEffect(() => {
fetchConfigFile(accessToken);
    }, [accessToken, user?.nickname]);



    return (
        <div className="w-full h-full">
            <SidebarProvider>
            <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={itemsBreadcrumbs as MenuItem[]} home={home}/>} >
            <div className="flex flex-col w-full">

<div className="flex flex-row w-full text-center justify-center items-center">
    <h1 className="text-3xl my-5 mx-2">{"Personalized Analyses"}</h1>
    {/* {configFile?.taxonomy?.interpretation && (
        <AiOutlineInfoCircle className="text-xl cursor-pointer text-blue-300" data-tip data-for="interpreteTip" id="interpreteTip" />
    )}
    <Tooltip
    style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "20px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
    anchorSelect="#interpreteTip">
    <div className={`prose single-column w-96 z-50`}>
        {configFile?.taxonomic_composition?.interpretation ? (
          <p className="text-gray-700 text-justify text-xl m-3">
          {configFile.taxonomic_composition?.interpretation}
      </p>
        ) : (""
        )}
    </div>
</Tooltip> */}
</div>



<div className="px-6 py-8">
      

                            <div className={`prose ${configFile?.taxonomic_composition?.text ? 'single-column' : 'column-text'}`}>
    <p className="text-gray-700 text-justify text-xl">
        {configFile?.personalized_analyses?.text}
    </p>
</div>
            <div className="mt-5">
                <TabView>
                 
                    <TabPanel header={<><i className="pi pi-chart-line mr-2"></i>Correlating experimental outcomes with traits of interest.</>}>
                        <div className="flex flex-col-reverse xl:flex-row">
                            <Card title="Connecting the microbiome to outcomes." className="mt-8 xl:mt-1 w-full xl:w-2/5 xl:mr-4">
  <p className="text-gray-700 text-justify text-lg font-light">
  A critical component of a good research study is the ability to relate experimental outcomes with phenotypic changes we hope to see. Fecal scores, body condition, blood parameters, or behavior, just to name a few. SIWA places a strong emphasis on relating microbial patterns and specific species to traits of interest. Robust correlations between study features and outcomes that matter to animals and pet owners are the foundation of our platform.</p>                           
                            </Card>
                          
                            <iframe 
                                src="/api/components/genvslact" 
                                frameBorder="0" 
                                width="100%" 
                                height="500px" 
                                allowFullScreen
                                className="w-full xl:w-3/5"
                                title="Genetic Diversity Analysis">
                            </iframe>
                        </div>
                    </TabPanel>
                    <TabPanel header={<><i className="pi pi-sitemap mr-2"></i> Mapping SIWA Microbial Health Score 1 against the Bristol Stool Scale</>}>
                        <div className="flex flex-col-reverse xl:flex-row">
                              <Card className="w-full h-auto xl:w-1/3 xl:mt-1 mt-8 xl:mr-8" title="Bristol Stool Chart">
                                
                                <Image src={"/bristol-stool-chart.webp"} className="w-9/12 rounded-lg "  alt="Bristol stool chart" preview/>
                                </Card>  
                      
                            <iframe 
                                src="/api/components/plotpopo" 
                                frameBorder="0" 
                                width="100%" 
                                height="500px" 
                                allowFullScreen
                                title="Ecosystem Interaction Web"
                                className="w-full xl:w-2/3">
                            </iframe>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>

</div>
            </Layout>
            </SidebarProvider>
        </div>
    );
}


