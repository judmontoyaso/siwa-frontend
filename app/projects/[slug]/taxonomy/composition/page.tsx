"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, use, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'react-tooltip'
import { Tooltip as PTooltip } from 'primereact/tooltip';
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Config } from "plotly.js";
import RequireAuth from "@/app/components/requireAtuh";
import { Skeleton } from "primereact/skeleton";
import { labelReplacements, order } from "@/config/dictionaries";
import { Checkbox } from "primereact/checkbox";
import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { ProgressSpinner } from "primereact/progressspinner";
import { FaFilePdf } from "react-icons/fa";
import { Toast as PToast } from 'primereact/toast';



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
    const toast = useRef<PToast>(null);
    const [plotDataObserved, setPlotDataObserved] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const [otus, setOtus] = useState<any>();
    const [selectedValue, setSelectedValue] = useState<string[]>(['Cecum', 'Feces', 'Ileum']);
    const [valueOptions, setValueOptions] = useState<string[]>(['Cecum', 'Feces', 'Ileum']);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const newScatterColors: { [key: string]: string } = {};
    const [title, setTitle] = useState<ReactNode>(<div className="w-full flex items-center justify-center"><Skeleton width="50%" height="1.5rem" /></div>);
    const [columnsOrder, setColumnsOrder] = useState<{ [key: string]: { [key: string]: number } }>({});
    const [isLoadingPDF, setIsLoadingPDF] = useState(false);

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("samplelocation");
    const [ selectedGroup, setSelectedGroup] = useState("samplelocation");
    const [tempSelectedGroup, setTempSelectedGroup] = useState("samplelocation");
    const [selectedRank, setSelectedRank] = useState("genus");
    const [observedData, setObservedData] = useState<any>([]);
    const [colorByOptions, setColorByOptions] = useState<string[]>([]);
    const [colorBy, setColorBy] = useState<string>('samplelocation');
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);
    const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
    const [filterPeticion, setFilterPeticion] = useState(false);
    const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');
    const [selectedLocations, setSelectedLocations] = useState<string[]>([
        "Cecum",
        "Feces",
        "Ileum",
    ]);
    const [Location, setLocation] = useState<string[]>([

    ]);


    const configTextRef = useRef(null);
    const taxonomyOptions = [
        "phylum",
        "class",
        "order",
        "family",
        "genus",
        "species"
    ];
    const colors = [
      "#D9B19C", "#334742", "#E6D5AF", "#883D58", "#705C91",
      "#A3AAA1", "#C8C6B3", "#217172", "#295B46", "#8FADD5",
      "#D89B67", "#5F8168", "#00263A", "#40679E", "#898989"
  ]
    const [number, setNumber] = useState(12);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [configFile, setconfigFile] = useState({} as any);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set(['Cecum', 'Feces', 'Ileum']));
    const [tempSelectedValues, setTempSelectedValues] = useState<Set<string>>(new Set());
    const [dataUnique, setDataUnique] = useState<any>();
    const [dataResult, setDataResult] = useState<any>(null);
    const [actualGroup, setActualGroup] = useState<any>('samplelocation');
const [actualRank, setActualRank] = useState<any>('genus');
    const [columnOptions, setColumnOptions] = useState<any>([]);
    const [htmlContent, setHtmlContent] = useState('');
    const containerRef = useRef<HTMLDivElement>(null); // Update the type of containerRef to HTMLDivElement
    const [activeIndex, setActiveIndex] = useState(0); 
    const [textForConfigKey, setTextForConfigKey] = useState("");
    const plotRef = useRef(null);
    const [titlePDF, setTitlePDF] = useState("");
    const downloadCombinedSVG = async () => {
      const plotContainer = plotRef.current as unknown as HTMLElement; // Tu contenedor principal

      if (!plotContainer) {
          console.error("Contenedor del gráfico no encontrado");
          return;
      }
  
      // Encuentra todos los SVGs dentro del contenedor
      const svgElements = plotContainer ? Array.from(plotContainer.querySelectorAll('svg')) : [];
      if (!svgElements.length) {
          console.error("No se encontraron SVGs en el contenedor");
          return;
      }
  
      // Crear un SVG maestro
      const combinedSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      combinedSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      combinedSVG.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  
      // Ajustar el ancho y alto dinámicamente
      let totalHeight = 0;
      const maxWidth = Math.max(...svgElements.map(svg => parseInt(svg.getAttribute("width") || '0', 10)));
      svgElements.forEach(svg => {
          totalHeight += parseInt(svg.getAttribute("height") || '0', 10);
      });
      combinedSVG.setAttribute("width", String(maxWidth));
      combinedSVG.setAttribute("height", "800");
  
      // Combina los SVGs en orden inverso
      let yOffset = 0; // Desplazamiento para evitar solapamiento
      svgElements.reverse().forEach((svg) => {
          const clonedSVG = svg.cloneNode(true);
  
          // Mover el SVG en el eje Y
          const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
          wrapper.setAttribute("transform", `translate(0, ${yOffset})`);
          yOffset =  15// Incrementa el desplazamiento
  
          // Asegura que <defs> se copie al SVG maestro
          const defs = (clonedSVG as Element).querySelector('defs');
          if (defs) {
              const masterDefs = combinedSVG.querySelector('defs') || document.createElementNS("http://www.w3.org/2000/svg", "defs");
              masterDefs.innerHTML += defs.innerHTML;
              combinedSVG.appendChild(masterDefs);
          }
  
          wrapper.appendChild(clonedSVG);
          combinedSVG.appendChild(wrapper);
      });
      const svgWidth = parseInt(combinedSVG.getAttribute("width") || "0", 10);
      const svgHeight = 800
      const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [(svgWidth + 50), svgHeight], // Ajustar el formato al tamaño del SVG
      });
      
 
      // Ajustar el tamaño inicial
      const pageWidth = pdf.internal.pageSize.getWidth();
       // Convertir SVG a PDF
       await svg2pdf(combinedSVG, pdf, {
          x: 20,
          y: yOffset,
          width: svgWidth     ,
          height: svgHeight 
      });

      // Incrementar el desplazamiento
      yOffset += svgHeight  + 20;

 

       // Descargar el PDF
       pdf.save(String(titlePDF) + ".pdf");
       // Serializar el SVG combinado y descargarlo
       const svgData = new XMLSerializer().serializeToString(combinedSVG);
       const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
       const link = document.createElement("a");
       link.href = URL.createObjectURL(blob);
       link.download = "combined_plot.svg";
       link.click();
  }


    useEffect(() => {
        fetch('/api/components/innerHtml')
          .then(res => res.json())
          .then(data => {
            setHtmlContent(data.content); // Establece el contenido HTML en el estado
          });
      }, []);

      
      // const fetchProjectIdsFiltercolor = async (colorByVariable: string) => {
 

      //   if (otus && otus.data) {
      //     let traces: any[] = [];
      //     const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0])));
  
      //     labels.forEach(label => {
      //         const filteredData = otus.data.data.filter((item: unknown[]) => item[0] === label);
      //         const xValues = filteredData.map((item: any[]) => item[1]);
      //         const yValues = filteredData.map((item: any[]) => item[3]);
      //         const color = colors[traces.length % colors.length];
  
      //         traces.push({
      //             x: xValues,
      //             y: yValues,
      //             type: 'bar',
      //             name: label,
      //             marker: { color: color,  width: 1  },
      //         });
  
      //         newScatterColors[label as string] = color;
      //     });
  
      //     // Ordenando los traces basados en la suma total de los valores de Y de cada uno, de mayor a menor
      //     traces.sort((a, b) => {
      //     const sumA = a.y.reduce((acc: any, curr: any) => acc + curr, 0);
      //     const sumB = b.y.reduce((acc: any, curr: any) => acc + curr, 0);
      //     return sumB - sumA; // Cambia a `sumA - sumB` si prefieres orden ascendente
      // });

      //     // traces = sortByCustomOrder(Object.values(traces || {}), theRealColorByVariable, columnsOrder);


      //     setPlotData(traces);
      //     console.log("Traces:", plotData);
      //     setScatterColors(newScatterColors); // Asegúrate de que esto sea un estado de React
      // }
      //   }
  





const router = useRouter();

const items = [

  { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
  { label: 'Taxonomic abundance', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/alpha`}>{item.label}</Link> },
];

const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };


// useEffect(() => {
//     if (otus && otus.data) {
//         let traces:any[] = [];
//         const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0])));

//         labels.forEach((label: any, index: number) => {
//             const filteredData = otus.data.data.filter((item: unknown[]) => item[0] === label);
//             const scatterColors: { [key: string]: string } = {};

//             const xValues = filteredData.map((item: any[]) => item[1]);
//             const yValues = filteredData.map((item: any[]) => item[3]);

//             // Asignar color o recuperar el color existente
//             if (!scatterColors[label]) {
//                 scatterColors[label] = colors[index % colors.length];
//             }

//             traces.push({
//                 x: xValues,
//                 y: yValues,
//                 type: 'bar',
//                 name: label,
//                 marker: { color: scatterColors[label],  width: 1  },
//             });
//         });
//         // traces = sortByCustomOrder(Object.values(traces || {}), theRealColorByVariable, columnsOrder);

//         console.log(traces)
//         setPlotData(traces);
//     }
// }, [otus]);





const updatePlotWidth = () => {

    if (plotContainerRef.current) {
        setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);
        console.log(plotWidth)
        console.log(plotContainerRef.current)
        setLoaded(true)

    };
};
const observedElementId = 'plofather';
useEffect(() => {
    // Función para actualizar el ancho de la ventana
    const updatePlotWidth = () => {
      if (plotContainerRef.current) {
        setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);
        console.log(plotWidth);
        console.log(plotContainerRef.current);
        setLoaded(true);
      }
    };
  
    const plofatherElement = document.getElementById('plofather');
    console.log('Ancho inicial de plofather:', plofatherElement?.offsetWidth);
  
    // Añade el event listener cuando el componente se monta
    window.addEventListener('resize', updatePlotWidth);
    console.log('plotWidth:', plotWidth);
    updatePlotWidth();
  
    // Limpieza del event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('resize', updatePlotWidth);
    };
  }, [window.innerWidth, document?.getElementById('plofather')?.offsetWidth]);


  useEffect(() => {
    const interval = setInterval(() => {
      const element = document.getElementById(observedElementId);
      if (element) {
        // Función para actualizar el ancho del elemento observado
        const updatePlotWidth = () => {
          const newWidth = element.offsetWidth - 75;
          setPlotWidth(newWidth);
          console.log('Actualizado plotWidth:', newWidth);
          setLoaded(true);
        };

        // Configura el ResizeObserver una vez que el elemento está disponible
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            updatePlotWidth();
          }
        });

        resizeObserver.observe(element);

        // Limpieza del intervalo y del observer
        clearInterval(interval);
        return () => {
          resizeObserver.disconnect();
        };
      }
    }, 100); // Intervalo de verificación cada 100 ms

    return () => clearInterval(interval); // Limpieza en caso de que el componente se desmonte antes de encontrar el elemento
  }, [observedElementId]); 

useEffect(() => {
    updatePlotWidth(); // Establece el ancho inicial
    console.log('plotWidth:', plotWidth);
}, [otus]);



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
            console.log(combinedOptions);
            setColorByOptions(combinedOptions);

        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
            // window.location.href = `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/logout`;
        }
    };


    const mergeOrders = (
      defaultOrder: { [key: string]: { [key: string]: number } },
      resultOrder: { [key: string]: { [key: string]: number } } | undefined
  ) => {
      const mergedOrder: { [key: string]: { [key: string]: number } } = {};
  
      // Combina las claves de defaultOrder y resultOrder
      const allKeys = new Set([
          ...Object.keys(defaultOrder),
          ...(resultOrder ? Object.keys(resultOrder) : []),
      ]);
  
      // Itera por todas las claves
      allKeys.forEach((key) => {
          if (resultOrder?.[key]) {
              // Si resultOrder tiene una clave, usa el valor completo de resultOrder para esa clave
              mergedOrder[key] = resultOrder[key];
          } else {
              // Si no, usa el valor de defaultOrder
              mergedOrder[key] = defaultOrder[key];
          }
      });
  
      return mergedOrder;
  };
   
    const fetchData = async (token: any) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/taxo/composition/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "selectedColumn": selectedColumn,
                    "selectedLocation": selectedValue,
                    "selectedRank": selectedRank,
                    "selectedGroup": selectedGroup,
                    "top": number.toString(),
                    "columnValues": selectedValue,
                    "nickname": user?.nickname,
                    "selectedColorGroup": theRealColorByVariable,

                })
            }
            );
            if (response.status === 404) {
                // toast.warn('The data needs to be loaded again!', {
                //     position: "top-center",
                //     autoClose: 5000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: "light",
                //     transition: Bounce,
                // });
                // setTimeout(() => { window.location.href = "/"; }, 5000);
                throw new Error("Respuesta no válida desde el servidor");
            }
            const result = await response.json();
            const locations = new Set(
                result?.data?.data?.map((item: any[]) => item[1])
            );
            const uniqueLocations = Array.from(locations) as string[];
            setAvailableLocations(uniqueLocations);


            console.log("Datos obtenidos:", result);
            setOtus(result);
            setDataResult(result);
            setColumnOptions(result?.meta?.columns);
            setDataUnique(result);
       
  //           const sunburstData = result?.Krona?.data?.map((item: any[]) => {
  //             const [id, parent, label, value] = item;  // Desestructuramos los valores de cada fila de datos
      
  //             return {
  //               id,
  //               parent,
  //               label,
  //               value
  //             };
  //           });
  //           const rootNode = {
  //             id: "root",
  //             parent: "",
  //             label: "root",
  //             value: 0,  // El valor de la raíz puede ser 0 o cualquier valor que prefieras
  //           };
        
  //           // Actualizar los datos para que todos los elementos de nivel superior tengan el parent "root"
  //           const updatedData = sunburstData?.map(item => {
  //             if (item.parent === "") {
  //               return { ...item, parent: "root" };  // Cambiar el parent vacío a "root"
  //             }

  //               // Verifica que cada parent exista en los ids
  // if (!observedData.some(d => d.id === item.parent) && item.parent !== "root") {
  //   console.warn(`Falta el parent: ${item.parent} para el id: ${item.id}`);
  // }

  //             return item;
  //           });
        
  //           // Agregar el nodo raíz a la lista de datos
  //           const finalData = [rootNode, ...updatedData];
            const mergedColumnsOrder = mergeOrders(order, result?.order);
            setColumnsOrder(mergedColumnsOrder);
            console.log("Columnas ordenadas:", mergedColumnsOrder);
            // setObservedData(result?.Krona)
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const fetchDataSunburst = async (token: any) => {

      try {
          const response = await fetch(
              `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/taxo/sunburst/${params.slug}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                  "selectedColumn": selectedColumn,
                  "selectedLocation": selectedValue,
                  "selectedRank": selectedRank,
                  "selectedGroup": selectedGroup,
                  "top": number.toString(),
                  "columnValues": selectedValue,
                  "nickname": user?.nickname,
                  "selectedColorGroup": theRealColorByVariable,

              })
          }
          );
          if (response.status === 404) {
              // toast.warn('The data needs to be loaded again!', {
              //     position: "top-center",
              //     autoClose: 5000,
              //     hideProgressBar: false,
              //     closeOnClick: true,
              //     pauseOnHover: true,
              //     draggable: true,
              //     progress: undefined,
              //     theme: "light",
              //     transition: Bounce,
              // });
              // setTimeout(() => { window.location.href = "/"; }, 5000);
              throw new Error("Respuesta no válida desde el servidor");
          }
          const result = await response.json();
          
          setObservedData(result?.Krona)
      } catch (error) {
          console.error("Error al obtener projectIds:", error);
      }
  };


  useEffect(() => {fetchDataSunburst(accessToken)}, [accessToken])


    // const sortByCustomOrder = (
    //   data: any[],
    //   column: string,
    //   orderDict: { [key: string]: { [key: string]: number } }
    // ) => {
    //   let order: { [key: string]: number } = {};
    //   if (columnsOrder && Object.keys(columnsOrder).length > 0) {
    //     for (let key in columnsOrder) {
    //       if (key.toLowerCase() === column.toLowerCase()) {
    //         order = orderDict[key];
    //         break; // Found the matching column, no need to continue
    //       }
    //     }
    //   }
    
    // console.log("Orden personalizado:", order);
    //   // Check if order is empty
    //   if (Object.keys(order).length === 0) {
    //     // No custom order, define default sorting
    //     // Extract unique values from data
    //     const uniqueValues = Array.from(
    //       new Set(
    //         data.map((item: { [x: string]: any; name: any }) => String(item.name || item[column]))
    //       )
    //     );

    //     console.log("Valores únicos:", uniqueValues);
    
    //     // Determine if values are numeric
    //     const areValuesNumeric = uniqueValues.every(value => !isNaN(Number(value)));
        
    //     // Sort uniqueValues accordingly
    //     if (areValuesNumeric) {
    //       uniqueValues.sort((a, b) => Number(a) - Number(b));
    //     } else {
    //       uniqueValues.sort(); // Lexicographical sort
    //     }
    
    //     console.log("uniqueValues:", uniqueValues);
    //     // Create default order mapping
    //     uniqueValues.forEach((value, index) => {
    //       order[value] = index;
    //     });
    //   }

    //   console.log("data antes:", data);
    //   return data.sort(
    //     (a: { [x: string]: any; name: any }, b: { [x: string]: any; name: any }) => {
    //       console.log("Comparando:", a, b);
    //       const valueA = String(a.name || a[column] || a);
    //       const valueB = String(b.name || b[column] || b);
    //       const orderA = order[valueA];
    //       const orderB = order[valueB];
    //       console.log("Comparando:", valueA, valueB, orderA, orderB);
    //       return (orderA !== undefined ? orderA : Infinity) - (orderB !== undefined ? orderB : Infinity);
    //     }
    //   );
    // };
    
    

    const fetchDataFilter = async (token: any) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/taxo/composition/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "selectedColumn": selectedColumn,
                    "selectedLocation": selectedLocations,
                    "selectedRank": selectedRank,
                    "selectedGroup": tempSelectedGroup,
                    "selectedColorGroup": theRealColorByVariable,
                    "columnValues": [...tempSelectedValues],
                    "top": number.toString(),
                    "nickname": user?.nickname,
                })
            }
            );
            if (response.status === 404) {
                // toast.warn('The data needs to be loaded again!', {
                //     position: "top-center",
                //     autoClose: 5000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: "light",
                //     transition: Bounce,
                // });
                // setTimeout(() => { window.location.href = "/"; }, 5000);
                throw new Error("Respuesta no válida desde el servidor");
            }
            const result = await response.json();

            console.log("Datos obtenidos:", result);
            setOtus(result);
            setIsLoaded(true);
            setFilterPeticion(false);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setFilterPeticion(false);
        }
    };


    const fetchDataGroups = async (token: any) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/taxo/groups/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "selectedColumn": selectedColumn,
                    "selectedLocation": selectedValue,
                    "selectedRank": selectedRank,
                    "selectedGroup": theRealColorByVariable,
                    "selectedColorGroup": theRealColorByVariable,

                    "top": number.toString(),
                    "columnValues": selectedValue,
                    "nickname": user?.nickname,

                })
            }
            );
            if (response.status === 404) {
                // toast.warn('The data needs to be loaded again!', {
                //     position: "top-center",
                //     autoClose: 5000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: "light",
                //     transition: Bounce,
                // });
                // setTimeout(() => { window.location.href = "/"; }, 5000);
                throw new Error("Respuesta no válida desde el servidor");
            }
            const result = await response.json();


            console.log("Datos obtenidos:", result);
            setOtus((prevOtus: any) => ({
                ...prevOtus,
                data: result.data
            }));            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const applyFiltersLogic = () => {
        fetchDataFilter(accessToken);
    
        setLocation(selectedLocations);
    
  
    
       
        setActualRank(selectedRank);
        setFilterPeticion(true);
    };
    
    useEffect(() => {
        // Llamar a applyFiltersLogic cuando cambie cualquier variable relevante
        if (accessToken && user) {
            applyFiltersLogic();
        }
    }, [selectedRank, selectedLocations, theRealColorByVariable, number]);  // Escuchar cambios en las variables clave
    

    useEffect(() => {fetchDataGroups(accessToken)}, [theRealColorByVariable])

    // Manejar cambio de locación

    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
fetchConfigFile(accessToken); fetchData(accessToken);
    }, [accessToken, user?.nickname]);

  
    interface DataItem {
        // Asumiendo que todos los elementos tienen este formato
        0: string; // Para el label
        1: number; // Para el valor de X
        3: number; // Para el valor de Y
     
    }


    const colorMapRef = useRef<{ [key: string]: string }>({}); // Persistencia con useRef
   
   
    let colorIndex = useRef(0); // Para recorrer colores

    useEffect(() => {
        if (otus && otus.data) {
            const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0])));
            let traces: any[] = [];

            // Asignar colores a labels si no existen en colorMapRef
            labels.forEach((label:any) => {
                if (!colorMapRef.current[label]) {
                    colorMapRef.current[label] = colors[colorIndex.current % colors.length];
                    colorIndex.current++;
                }
            });

            const normalizedVariable = theRealColorByVariable?.toLowerCase();
            console.log("Normalized Variable:", normalizedVariable);
    
            // Obtener el orden correspondiente
            const variableOrder = Object.entries(columnsOrder || {}).reduce<Record<string, any>>(
                (acc, [key, value]) => {
                    acc[key.toLowerCase()] = value;
                    return acc;
                },
                {}
            )[normalizedVariable] || {};

            console.log("Updated Color Map:", colorMapRef.current);
            console.log("filteredData:", otus.data.data);
            // Generar datos para la gráfica
            labels.forEach((label:any) => {
                const filteredData = otus.data.data.filter((item: any[]) => item[0] === label);
                const combinedValues = filteredData.map((item: any[]) => ({
                  x: item[1],
                  y: item[3],
              }));
  
              // Ordenar el array combinado por el orden especificado en variableOrder
              combinedValues.sort((a: { x: string | number; }, b: { x: string | number; }) => {
                  const orderA = variableOrder[a.x] ?? Infinity;
                  const orderB = variableOrder[b.x] ?? Infinity;
                  return orderA - orderB;
              });
  
              // Separar los valores ordenados en xValues y yValues
              const xValues = combinedValues.map((item: { x: any; }) => item.x);
              const yValues = combinedValues.map((item: { y: any; }) => item.y);
  
              console.log("XValues ordenados:", xValues);
              console.log("YValues reordenados:", yValues);
  
              
              traces.push({
                  x: xValues,
                  y: yValues,
                  type: "bar",
                  name: label,
                  marker: { color: colorMapRef.current[label], width: 1 }
                });
  
          });
            // Ordenar los traces
            traces.sort((a, b) => {
                const sumA = a.y.reduce((acc: any, curr: any) => acc + curr, 0);
                const sumB = b.y.reduce((acc: any, curr: any) => acc + curr, 0);
                return sumA - sumB;
            });

            setPlotData(traces);
        }
    }, [otus]); // Dependencias del useEffect
  
  

    // useEffect(() => {
    //     setPlotData( plotData.map(trace => ({
    //         ...trace, // Conserva las propiedades existentes de la traza
    //         width: 0.5, // Ajusta este valor para cambiar la anchura de las barras
    //     })));    }, [otus,scatterColors]);



    // Función para aplicar los filtros seleccionados
    const applyFilters = (event: any) => {


        // Convierte ambas matrices a cadenas para una comparación simple
        const newSelectionString = selectedLocations.join(',');
        const currentSelectionString = Location.join(',');


        fetchDataFilter(accessToken);

        setLocation(selectedLocations);

   
setActualGroup(selectedGroup);
setActualRank(selectedRank);
setSelectedGroup(tempSelectedGroup);
setSelectedValues(tempSelectedValues);
setFilterPeticion(true);

    };
    const handleLocationChange = (event: any) => {
        if (event === 'all') {
            setSelectedLocations(['Cecum', 'Feces', 'Ileum']); // Selecciona "All Locations"
            setTheRealColorByVariable("samplelocation"); // Asegura que "samplelocation" también sea la opción del dropdown
            setIsColorByDisabled(true); // Deshabilitar el dropdown de "Select a variable to group"
        } else {
            setSelectedLocations([event]); // Seleccionar la ubicación individual
            setIsColorByDisabled(false); // Habilitar el dropdown de "Select a variable to group"
        }
    };
    
    useEffect(() => {
        if (selectedLocations.length === 3) {  // Si se selecciona 'All Locations'
            setTheRealColorByVariable("samplelocation"); // Asegurarse de que la variable de agrupación también sea "samplelocation"
            setIsColorByDisabled(true); // Deshabilitar "Select a variable to group"
        } else {
            setIsColorByDisabled(false); // Habilitar "Select a variable to group" si se selecciona una sola ubicación
        }
    }, [selectedLocations]);
    

    type Plotdata = {
        name: string;
        // Add other properties as needed
    };

    type ScatterColors = {
        [key: string]: string;
        // Add other properties as needed
    };

    const CustomLegend = ({ plotData, scatterColors }: { plotData: Plotdata[]; scatterColors: ScatterColors }) => (
        <div style={{ marginLeft: '20px' }}>
            {plotData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '15px', height: '15px', backgroundColor: scatterColors[entry.name], marginRight: '10px' }}></div>
                    <div>{entry.name}</div>
                </div>
            ))}
        </div>
    );

    const legend = (<div className="w-full flex flex-col overflow-x-scroll max-h-full  justify-center mt-5 items-center">
    <div className="mb-2">
        <h2 className=" text-base text-gray-700 w-full font-bold mr-1">{actualRank.charAt(0).toUpperCase() + actualRank.slice(1)}</h2>
    </div>
    <div className=" flex flex-col w-auto mt-2">
    <CustomLegend plotData={plotData} scatterColors={scatterColors} />
    </div>
</div>)


// Función para buscar texto en Community_Makeup
const findTextInCommunityMakeup = (
  config: { Taxonomic_Abundance: { Analysis: any } },
  location: string,
  column: string
) => {
  console.log("Searching in Community_Makeup:", { location, column });
  const analysis = config?.Taxonomic_Abundance?.Analysis;
  if (!analysis) return null;

  const locationKey = `SampleLocation_${location}`;
  const locationData = analysis[locationKey];
  console.log("Location data:", locationData);

  if (locationData && typeof locationData[column] === "string") {
    console.log("Text found:", locationData[column]);
    return locationData[column];
  }

  return null;
};

    // Función para normalizar `formedKey` ordenando los valores después del prefijo
    const normalizeFormedKey = (formedKey: string) => {
      const [prefix, values] = formedKey.split('_');
      const sortedValues = values.split('+').sort().join('+');
      return `${prefix}_${sortedValues}`;
  };

    // Función para obtener propiedades anidadas de forma insensible a mayúsculas/minúsculas
    const getNestedProperty = (obj: any, keys: any[]) => {
      let currentObj = obj;
      console.log("Starting getNestedProperty with keys:", keys);

      for (const key of keys) {
          if (currentObj && typeof currentObj === 'object') {
              console.log("Current object for key:", key, currentObj);
              const foundKey = Object.keys(currentObj).find(k => k.toLowerCase() === key.toLowerCase());
              if (foundKey) {
                  console.log(`Key "${foundKey}" found for "${key}", proceeding to next level.`);
                  currentObj = currentObj[foundKey];
              } else {
                  console.log(`Key "${key}" not found in current level.`);
                  return null;
              }
          } else {
              console.log("Current object is not valid for further key lookup:", currentObj);
              return null;
          }
      }

      console.log("Final value found in getNestedProperty:", currentObj);
      return currentObj;
  };
// Función para buscar texto con claves insensibles a mayúsculas/minúsculas
const findTextInCommunityMakeupNested = (
  config: { Taxonomic_Abundance: { Analysis: any } },
  location: string,
  formedKey: string,
  column: string
) => {
  const analysis = config?.Taxonomic_Abundance?.Analysis;
  if (!analysis) {
    console.log("Analysis not found in config.");
    return null;
  }

  const locationKey = `SampleLocation_${location}`;
  console.log("Searching in locationKey:", locationKey);

  const locationData = getNestedProperty(analysis, [locationKey]);
  if (!locationData) {
    console.log(`Location data for key "${locationKey}" not found.`);
    return null;
  }

  console.log("Location data found:", locationData);
  console.log("Attempting to find formedKey:", formedKey);

  // Busca el valor directamente
  let value = getNestedProperty(locationData, [formedKey]);
  console.log("Value found for formedKey:", value);

  // Busca usando una clave normalizada si no se encuentra
  if (!value) {
    const normalizedFormedKey = normalizeFormedKey(formedKey);
    console.log("Attempting to find normalized formedKey:", normalizedFormedKey);

    value = getNestedProperty(locationData, [normalizedFormedKey]);
    console.log("Value found for normalized formedKey:", value);
  }

  // Si el valor encontrado es un objeto, busca en la columna
  if (value && typeof value === "object") {
    console.log(`formedKey "${formedKey}" contains an object, checking for column "${column}"`);
    value = value[column] || null;
    console.log("Value for column in formedKey object:", value);
  }

  if (typeof value === "string") {
    console.log("Text found in nested:", value);
    return value;
  }

  console.log("No matching text found for the given keys.");
  return null;
};



useEffect(() => {
  const location = selectedLocations.length > 1 ? 'All' : selectedLocations[0];
  console.log("Location and theRealColorByVariable:", { location, theRealColorByVariable });
  console.log("selected locations:", selectedLocations);
  if (location && theRealColorByVariable) {
      const formattedColumn = theRealColorByVariable.charAt(0).toUpperCase() + theRealColorByVariable.slice(1);
      console.log("Formatted column and location:", { formattedColumn, location });

      const allValuesSelected = Array.from(valueOptions).every(option => selectedValues.has(option));

      if (allValuesSelected) {
          const textForConfig = findTextInCommunityMakeup(configFile, location, (theRealColorByVariable === "samplelocation" ? "Self" : formattedColumn));
          console.log("Text for all values selected:", textForConfig);
          setTextForConfigKey(textForConfig || "");
      } else if (selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1) !== 'SampleLocation' && selectedValues.size > 0) {
          // Limpia cada valor en valuesArray para eliminar caracteres especiales
          const valuesArray = Array.from(selectedValues)
              .map(value => String(value).replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')); // Elimina caracteres especiales

          const formedKey = `${selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1)}_${valuesArray.join('+')}`;
          const normalizedFormedKey = `${selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1)}_${valuesArray.sort().join('+')}`;

          console.log("Formed key and normalized formed key:", { formedKey, normalizedFormedKey });

          // Intentar buscar con formedKey primero y luego con normalizedFormedKey
          let textForConfig = findTextInCommunityMakeupNested(
              configFile,
              location,
              formedKey,
              theRealColorByVariable === selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1) ? "Self" : formattedColumn
          );
          if (!textForConfig) {
              textForConfig = findTextInCommunityMakeupNested(
                  configFile,
                  location,
                  normalizedFormedKey,
                  theRealColorByVariable === selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1) ? "Self" : formattedColumn
              );
          }

          console.log("Text for specific filter:", textForConfig);
          setTextForConfigKey(textForConfig || "");
      } else {
          setTextForConfigKey("");
      }
  }
}, [selectedLocations, selectedGroup, theRealColorByVariable, selectedValues, valueOptions, configFile]);


// Configuración del layout
const layout = {
  margin: { t: 0, l: 0, r: 0, b: 0 },  // Eliminar márgenes
  // sunburstcolorway: ['#FF6347', '#FFD700', '#ADFF2F', '#00FA9A', '#1E90FF'],  // Colores de las ramas
  hovermode: 'closest', // Modo de hover para mejor interacción
};

// const sunburstData = {
//   type: 'sunburst',
//   ids: observedData?.map(item => item.id),
//   parents: observedData?.map(item => item.parent),
//   labels: observedData?.map(item => item.label),
//   values: observedData?.map(item => item.value),
//   branchvalues: 'total',  // Opcional, 'total' o 'max' dependiendo de lo que prefieras
//   textinfo: 'label+value',  // Muestra el nombre y la abundancia
//   hovertemplate: '%{label}: %{value}',  // Muestra la abundancia al pasar el ratón
// };

// console.log("Sunburst data:", sunburstData);
const screenWidth = window.innerWidth;
const textScale = screenWidth < 600
? 0.6                   // Para pantallas pequeñas (móviles)
: screenWidth < 1024
    ? 0.8                 // Para pantallas medianas (tabletas o pantallas pequeñas)
    : screenWidth < 1440
        ? 1                 // Para pantallas de tamaño estándar (portátiles o monitores)
        : screenWidth < 1920
            ? 1.2             // Para pantallas grandes (monitores de mayor resolución)
            : 1.4;            // Para pantallas muy grandes (monitores UltraWide o 4K)


    const MyPlotComponent = ({ plotData, scatterColors }: { plotData: any[]; scatterColors: any }) => (
        <div className="flex flex-row w-full items-center">
            <div className="w-full" ref={plotContainerRef}>
                {loaded && (<>    <div className="flex flex-row w-full justify-end items-end mb-2">
                            {/* <div className="flex items-center">
                                <Button
                                    className="p-button-rounded p-button-outlined p-button-sm"
                                    onClick={() => setGraphType(graphType === "boxplot" ? "violin" : "boxplot")}
                                    tooltip={`Change to ${graphType === "boxplot" ? "violin" : "boxplot"} view`}
                                >
                                    <RiExchangeFundsLine className="text-lg" />

                                </Button>
                            </div> */}

                            <PToast ref={toast} position="top-right" />
                            <div className="flex items-center mx-2">
                                <Button
                                    className="p-button-rounded p-button-outlined p-button-sm"
                                    onClick={downloadCombinedSVG}
                                    tooltip="Download PDF"
                                >
                                    {isLoadingPDF ? (
                                        <ProgressSpinner style={{ width: '19px', height: '19px' }} />
                                    ) : (
                                        <FaFilePdf className="text-lg" />
                                    )}
                                </Button>

                            </div>
                        </div> 
                        <div id="plot" ref={plotRef}>
                        <Plot
                    data={plotData.map((data, index) => ({
        ...data,
    
    }))}
                    config={config}
                    layout={{
                        barmode: 'stack', // Modo de barras apiladas
                        bargap: 0.1,
                        plot_bgcolor: 'white',
                        yaxis: {
                            title: {
                                text: 'Relative Abundance (%)',
                                font: { 
                                    family: 'Roboto, sans-serif',
                                    size: 14 * textScale,
                                    
                                },
                                
                            },
                            

                        },
                        xaxis: {
                            title: {
                                text: '', // Título para el eje X si es necesario
                                font: { 
                                    family: 'Roboto, sans-serif',
                                    size: 14 * textScale,
                                },
                              },
                              automargin: true,
                              autotick: false,

                            
                        },
                        width: plotWidth || undefined,
                        height: 800,

                        annotations: [{
                            xref: 'paper',
                            yref: 'paper',
                            x: 1.107, 
                            xanchor: 'left',
                            y: 0.8, // En la parte superior
                            yanchor: 'top',
                            text: `${actualRank.charAt(0).toUpperCase() + actualRank.slice(1)}`, // Título de la leyenda
                            showarrow: false,
                            font: {
                                family: 'Roboto, sans-serif',
                                size: 14 * textScale,
                                color: 'black'
                            }
                        }],
                        showlegend: true,
                        legend: {
                          itemclick: false,  // Desactiva el comportamiento de clic en la leyenda
                          itemdoubleclick: false,
                            orientation: "v", // Orientación vertical
                            x: 1.1, // Posición a la derecha del gráfico
                            xanchor: "left",
                            yanchor:"top",
                            y: 0.75, // Centrado verticalmente
                            font: {
                              size: 12 * textScale, // Escala la leyenda
                          },
                        },
                        font: {
                          family: 'Roboto, sans-serif',
                          size: 12 * textScale, // Ajusta el tamaño del texto general
                          color: 'black',
                      },
                     
                        dragmode: false ,
                        margin: { l: 50, r: 50, t: 50, b: 50 }
                    }}
                />
                </div>
                </>
                 
                
                )}
            </div>

        </div>);





    useEffect(() => {
        if (otus && tempSelectedGroup) {
            // Filtrar los valores únicos de la columna seleccionada
            const columnIndex = otus?.meta?.columns?.indexOf(tempSelectedGroup);
            console.log("Column index:", columnIndex);
            const uniqueValues: Set<string> = new Set(dataUnique?.meta?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
            const uniqueValuesCheck: Set<string> = new Set(otus?.meta?.data.map((item: { [x: string]: any; }) => item[columnIndex]));

            setValueOptions([...uniqueValues].filter(value => value !== 'null'));
            setTempSelectedValues(new Set<string>(uniqueValuesCheck));

            // Inicializa 'selectedValues' con todos los valores únicos
            // setSelectedValues(new Set<string>(uniqueValuesCheck));
        }
    }, [tempSelectedGroup, otus]);

    // Estado para manejar los valores seleccionados en los checks
    const handleValueChange = (value: string) => {
        setSelectedValues(prevSelectedValues => {
            const newSelectedValues = new Set(prevSelectedValues);
            // Si intentamos deseleccionar el último valor seleccionado, no hacemos nada
            if (newSelectedValues.size === 1 && newSelectedValues.has(value)) {
                return prevSelectedValues;
            }

            // Si el valor está presente, lo eliminamos, de lo contrario, lo añadimos
            if (newSelectedValues.has(value)) {
                newSelectedValues.delete(value);
            } else {
                newSelectedValues.add(value);
            }
            return newSelectedValues;
        });
    };

    const handleValueChangeTemp = (value: string) => {
      setTempSelectedValues(prevTempSelectedValues => {
        const newTempSelectedValues = new Set(prevTempSelectedValues);
    
        // Si intentamos deseleccionar el último valor seleccionado, no hacemos nada
        if (newTempSelectedValues.size === 1 && newTempSelectedValues.has(value)) {
            return prevTempSelectedValues;
        }
    
        // Si el valor está presente, lo eliminamos
        if (newTempSelectedValues.has(value)) {
            newTempSelectedValues.delete(value);
        } else if (value !== null && value !== 'null') { // Verifica que el valor no sea null antes de añadirlo
            // Si el valor no está presente y no es null, lo añadimos
            newTempSelectedValues.add(value);
        }
    
        return newTempSelectedValues;
    });
    };

    console.log("Selected values:", selectedValues);
    useEffect(() => {console.log("Selected values:", selectedValues)}, [selectedValues]);

//     useEffect(() => {
//         const transformDataForSunburst = (columns, values) => {
//             const paths = [];
//             const valuesOutput = [];
//             const ids = [];
        
//             values?.forEach(row => {
//               // Ignora las columnas 'OTU', 'abundance', y 'prevalence' para construir el path
//               const path = columns.slice(0, -3).map((columnName, index) => {
//                 return row[index] || 'Unknown'; // Usa 'Unknown' para valores undefined o null
//               }).join('/');
        
//               // Asume que 'OTU' es el identificador único, y 'abundance' es el valor numérico
//               const otuIndex = columns.indexOf('OTU');
//               const abundanceIndex = columns.indexOf('abundance');
//               const otu = row[otuIndex] || 'Unknown OTU';
//               const abundance = row[abundanceIndex] || 0;
        
//               ids.push(otu); // Añade 'OTU' como id
//               paths.push(path); // Añade el path construido
//               valuesOutput.push(abundance); // Añade 'abundance' como el valor
//             });
//         console.log({ ids, paths, values: valuesOutput });
//             return { ids, paths, values: valuesOutput };
//           };
        
      

      
//           const { ids, paths, values } = transformDataForSunburst(observedData?.columns, observedData?.data);

//            // Actualiza el estado con los nuevos datos
//   setSunburstData({ ids, paths, values });

//           console.log(observedData)
//         // Aquí puedes actualizar el estado con los paths y values transformados, o hacer algo más con ellos
//       }, [observedData]); // Asegúrate de que las dependencias de useEffect sean correctas
      
    // Componente de checks para los valores de la columna seleccionada
    
    // const valueChecks = (
    //     <div className="flex flex-col w-full overflow-x-scroll mt-5">
    //         <div className="flex w-full flex-row flex-wrap items-center justify-center">
    //             {valueOptions?.map((value, index) => {
    //                 const stringValue = String(value);
    
    //                 return (
    //                     <div key={index} className="flex items-center mb-2 mr-2 ml-2">
    //                         <input
    //                             id={`value-${index}`}
    //                             type="checkbox"
    //                             value={value}
    //                             checked={selectedValues.has(value)}
    //                             onChange={() => handleValueChange(value)}
    //                             className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    //                         />
    //                         <label
    //                             htmlFor={`value-${index}`}
    //                             className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
    //                             {stringValue.charAt(0).toUpperCase() + stringValue.slice(1)}
    //                         </label>
    //                     </div>
    //                 );
    //             })}
    //         </div>
    //     </div>
    // );
    


const valueChecks = (
  <div className="flex flex-col w-full mb-5 mt-5">
    <div className="flex w-full flex-row flex-wrap items-start justify-start">
      {valueOptions?.filter(value => value !== null && tempSelectedGroup !== "samplelocation").sort((a, b) => String(a).localeCompare(String(b))) // Ordenar alfabéticamente
  .map((value, index) => {
        const stringValue = String(value);
        return (
          <div key={index} className="flex items-center mb-2 mr-2 ml-2">
            <Checkbox
              inputId={`value-${index}`}
              value={value}
              checked={tempSelectedValues.has(value)}
              onChange={() => handleValueChangeTemp(value)}
              className="text-blue-600"
            />
            <label htmlFor={`value-${index}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {stringValue.charAt(0).toUpperCase() + stringValue.slice(1)}
            </label>
          </div>
        );
      })}
    </div>
  </div>
  
  );
    

  const handleGroupChangeColorby = (event: any) => {
    setTempSelectedGroup(String(event.target.value).toLocaleLowerCase());
    // fetchProjectIdsFiltercolor(dataResult, event.target.value);
  console.log("Selected group:", event.target.value);


};

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    staticPlot: false,
    displayModeBar: true,
    modeBarButtonsToRemove: [
        'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'zoom3d',
        'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraDefault3d', 'resetCameraLastSave3d',
        'hoverClosest3d', 'zoomInGeo', 'zoomOutGeo', 'resetGeo', 'hoverClosestGeo', 'sendDataToCloud', 'hoverClosestGl2d', 'hoverClosestPie',
        'toggleHover', 'toggleSpikelines', 'resetViewMapbox', 'toImage', 'zoomIn2d', 'zoomOut2d', 'resetViews', 'resetScale2d'
    ],
    scrollZoom: false,

    modeBarButtonsToAdd: [],
};

    const dropdownOptions = taxonomyOptions.map((option, index) => ({
        label: option.charAt(0).toUpperCase() + option.slice(1),
        value: option
    }));

    const allLocationsOption = { label: 'All Locations', value: 'all' };

    // Convertir availableLocations a un formato que Dropdown pueda entender
    const locationOptions = availableLocations.map(location => ({
        label: location.charAt(0).toUpperCase() + location.slice(1),
        value: location
    }));

    // Asegúrate de incluir la opción "All Locations" al principio
    const dropdownLocationOptions = [allLocationsOption, ...locationOptions];

    // Determinar el valor seleccionado para el Dropdown
    const selectedDropdownValue = selectedLocations.length === 3 ? "all" : selectedLocations[0];
    const [activeIndexes, setActiveIndexes] = useState([0,1]);

    const onTabChange = (e : any) => {
        setActiveIndexes(e.index);  // Actualiza el estado con los índices activos
    };

    // const dropdownOptionsColorby = [
    //     { label: 'Sample Location', value: 'samplelocation' }, // Opción predeterminada
    //     ...colorByOptions 
    //       ?.filter(option => (columnOptions as string[])?.includes(option)) // Filtra y mapea según tus criterios
    //       .map(option => ({
    //           label: option.charAt(0).toUpperCase() + option.replace('_', ' ').slice(1),
    //           value: option
    //       }))
    //   ];


      const dropdownOptionsColorby = (() => {
    
  
        if (!columnOptions || !colorByOptions) {
            console.warn("columnOptions o colorByOptions están indefinidos.");
            return [{ label: 'Sample Location', value: 'samplelocation' }]; // Agregar el predeterminado si las listas no están definidas
        }
    
        const filteredOptions = colorByOptions
            .filter(option =>
                columnOptions.map((col: any) => String(col).toLowerCase())
                    .includes(String(option).toLowerCase())
            ) // Asegúrate de que ambas listas se tratan como cadenas
            .map(option => {
                if (!option) {
                    console.warn("Se encontró un valor undefined o null en colorByOptions.");
                    return null; // Filtrar después valores nulos
                }
    
                const label = labelReplacements[String(option).toLowerCase()]
                    ? labelReplacements[String(option).toLowerCase()]
                    : String(option).charAt(0).toUpperCase() + String(option).replace('_', ' ').slice(1);
    
                return {
                    label,
                    value: String(option).toLowerCase()
                };
            })
            .filter(option => option !== null); // Filtrar cualquier entrada nula que haya pasado
             console.log("filteredOptions", filteredOptions);
             console.log("colorByOptions", colorByOptions);
             console.log("columnOptions", columnOptions);
        // Agregar la opción predeterminada al inicio de la lista
        return [{ label: 'Sample Location', value: 'samplelocation' }, ...filteredOptions];
    })();
    
    const fixedActiveIndexes = [0, 1];

    const fixedAccordionTabChange = () => {
    };
      const filter = (
        <div className="flex flex-col w-full rounded-lg dark:bg-gray-800">
            <Accordion multiple activeIndex={fixedActiveIndexes} onTabChange={fixedAccordionTabChange} className="filter">
            
            {/* Group by Acordeón */}
            <AccordionTab className="colorby-acordeon" header="Group by"  headerStyle={{ fontSize: '1.15rem' }}>
              <div className="flex flex-col items-start m-2">
              <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center"  style={{ fontSize: '1.05rem' }}>
                  Select a sample location:
                  <span className="ml-2">
                    <i
                      className="pi pi-info-circle text-siwa-blue"
                      data-pr-position="top"
                      id="sampleLocationTooltip"
                    />
                  
                    <PTooltip target="#sampleLocationTooltip"  style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
                                ><span>View all sample locations together, or focus on a single one. <b>Note: </b>some analyses are only available for individual locations.</span></PTooltip>
                  </span>
                </h3>
                <Dropdown
                  id="location"
                  value={selectedDropdownValue}
                  options={dropdownLocationOptions}
                  onChange={(e) => handleLocationChange(e.value)}
                  disabled={availableLocations.length === 1}
                  className="w-full mb-6 text-sm"
                  placeholder="Choose a location"
                />
              </div>
      
              {/* Selección de variable */}
              <div className="flex flex-col items-start mt-2 m-2">

              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-700 flex dark:text-white" style={{ fontSize: '1.05rem' }}>
                                    Select a variable to group:
                                </h3>
                                <span className="ml-2">
                                    <i
                                        className="pi pi-info-circle text-siwa-blue"
                                        data-pr-tooltip="Adjusts how samples are grouped and colored in the analysis. To use, select a sample location above, then choose a grouping variable."
                                        data-pr-position="top"
                                        id="groupByTooltip"
                                    />
                                    <PTooltip
                                        target="#groupByTooltip"
                                        style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
                                    />
                                </span>
                            </div>
                <Dropdown
                  value={theRealColorByVariable}
                  options={dropdownOptionsColorby}
                  onChange={(e) => setTheRealColorByVariable(e.target.value)}
                  optionLabel="label"
                  className="w-full mb-6 text-sm filtercolorby"
                  disabled={isColorByDisabled}
                  placeholder="Select a color category"
                />
              </div>
      
              {/* Selección del rank taxonómico */}
              <div className="items-start flex flex-col m-2">
              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-700 flex dark:text-white" style={{ fontSize: '1.05rem' }}>
                                Select a taxonomic rank:
                                </h3>
                                <span className="ml-2">
                                    <i
                                        className="pi pi-info-circle text-siwa-blue"
                                        data-pr-tooltip="Select a taxonomic rank for grouping bacteria. Phylum: most general, Species: most specific."
                                        data-pr-position="top"
                                        id="rankTooltip"
                                    />
                                    <PTooltip
                                        target="#rankTooltip"
                                        style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
                                    />
                                </span>
                            </div>
               
                <Dropdown
                  value={selectedRank}
                  options={dropdownOptions}
                  onChange={(e) => setSelectedRank(e.value)}
                  placeholder="Select a Rank"
                  className="w-full mb-4 text-sm"
                />
              </div>
      
              {/* Selección de Top */}
              <div className="max-w-xs flex m-2 flex-col items-start mt-5 mb-5">
                <PrimeToolTip target=".topInputText" />
                <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-700 flex dark:text-white" style={{ fontSize: '1.05rem' }}>
                                Number of taxa to display:
                                </h3>
                                <span className="ml-2">
                                    <i
                                        className="pi pi-info-circle text-siwa-blue"
                                        data-pr-tooltip="Select the number of taxa, ranked by relative abundance, that you wish to include in the figure."
                                        data-pr-position="top"
                                        id="topTooltip"
                                    />
                                    <PTooltip
                                        target="#topTooltip"
                                        style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
                                    />
                                </span>
                            </div>
              
                <div className="relative justify-center w-full flex flex-col items-center">
                <div className=" flex items-center max-w-[8rem]">

<button
  type="button"
  onClick={() => setNumber(Math.max(1, number - 1))}
  className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-l-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
>
  <FiMinus />
</button>
<input
  type="text"
  value={number}
  onChange={(e) => setNumber(e.target.value === '' ? 1 : Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
  className="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  required
/>
<button
  type="button"
  onClick={() => setNumber(Math.min(15, number + 1))}
  className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-r-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
>
  <GoPlus />
</button>
</div>
{/* <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Number of taxa to display</p> */}

                </div>
               
              </div>
            </AccordionTab>
      
            {/* Filter by Acordeón */}
            <AccordionTab className="filter-acordeon" header="Filter by"  headerStyle={{ fontSize: '1.15rem' }}>
              <div className="mt-4 ml-2 mb-4">
              <div className="flex items-center">
                  <h3 className="text-base font-medium text-gray-700 dark:text-white flex items-center" style={{ fontSize: '1.1rem' }}>
                    Filtering options:
                    <AiOutlineInfoCircle
                      className="ml-2 text-siwa-blue xl:text-lg text-lg mb-1 cursor-pointer"
                      id="filteringTip"
                    />
                    <PTooltip target="#filteringTip" position="top" style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
                                ><span>Select specific subsets of samples for analysis. Choose a variable, then pick the groups within that variable to include. <b>Note: </b>only one variable can be filtered at a time.</span></PTooltip>
                  </h3>
                </div>
                <ul className="w-full flex flex-wrap items-center content-center justify-start mt-2">
      
      {colorByOptions?.map((option:any, index) => (
        option = String(option).toLowerCase(),
        <li key={index} className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
          <input
            type="radio"
            id={option}
            name={option}
            className="hidden peer"
            value={option}
            checked={tempSelectedGroup === option}
            onChange={handleGroupChangeColorby}
          />
          <label
            htmlFor={option}
            className={`flex items-center justify-center cursor-pointer hover:text-gray-600 hover:bg-gray-100
              w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${selectedGroup === actualGroup ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
          >
            <div className="block">
            <div className="w-full text-base">
                                    {labelReplacements[String(option).toLowerCase()]
                                        ? labelReplacements[String(option).toLowerCase()]
                                        : String(option).charAt(0).toUpperCase() + String(option).replace('_', ' ').slice(1)}
                                </div>
            </div>
          </label>
        </li>
      ))}
    </ul>
      
          
              </div>
              <div className="mt-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-inner flex flex-col items-start">
                  {valueChecks}
                </div>
              </div>
              <div className="flex w-full items-center justify-center my-4">
                <Button
                  onClick={applyFilters}
                  loading={filterPeticion}
                  iconPos="right"
                  icon="pi pi-check-square"
                  loadingIcon="pi pi-spin pi-spinner"
                  className="max-w-56 justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
                  label="Apply Filters"
                />
              </div>

            </AccordionTab>
          </Accordion>
      
         
        </div>
      );
      


useEffect(() => {
    if (availableLocations.length === 1) {
      // Si solo hay una ubicación disponible, selecciónala automáticamente
      const uniqueLocation = availableLocations[0];
      console.log("Ubicación única:", uniqueLocation);
      handleLocationChange(uniqueLocation); // Asume que esta función actualiza tanto `selectedLocations` como `currentLocation`
    }
  }, [availableLocations]); // Dependencia del efecto

  useEffect(() => {
    
    
    setLocation(availableLocations.length > 1 ? selectedLocations : [availableLocations[0]]);
}, [params.slug, plotData]);
  



  useEffect(() => {
    if (Location[0] && Location.length > 0) {
      const formattedColorByVariable = labelReplacements[String(theRealColorByVariable).toLowerCase()]
                ? labelReplacements[String(theRealColorByVariable).toLowerCase()]
                : String(theRealColorByVariable).charAt(0).toUpperCase() + String(theRealColorByVariable).replace('_', ' ').slice(1);
        const newTitle = <div> Relative Abundance of {actualRank?.charAt(0).toUpperCase() + actualRank.slice(1)} {Location.length === 3 ? " in all Locations" : " in the " + (Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) + (theRealColorByVariable === "samplelocation" ? "" : " by " + formattedColorByVariable))}</div> ;
        setTitle(newTitle);
        const titlePDF = "Relative abundance of " +
  (actualRank?.charAt(0).toUpperCase() + actualRank.slice(1)) +
  (Location.length === 3
    ? " in All Locations"
    : " in the " +
      Location[0]?.charAt(0).toUpperCase() +
      Location[0]?.slice(1) +
      (theRealColorByVariable === "samplelocation" ? "" : " by " + formattedColorByVariable)
  );

setTitlePDF(String(titlePDF));

    }
  }, [Location, actualGroup,theRealColorByVariable, actualRank]);
  
    return (
        <RequireAuth>
        <div className="w-full h-full">
            <SidebarProvider>
            <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-bread"/>}>
                {isLoaded ? (
                    <div className="flex flex-col w-11/12 mx-auto">

                        <div className="flex flex-row w-full text-center justify-center items-center">
                        <h1 className="text-3xl my-5 mx-2">Taxonomic diversity</h1>
                        </div>
                        <div className="px-6 py-8">
                            <div className={`prose column-text}`}>
                            <p className="text-gray-700 text-justify" style={{ fontSize: '1.3rem' }}>
                            The taxonomic diversity of the microbiome can be assessed at different levels, from the kingdom to the species level.  Most studies in the microbiome focus on the genus level; this gives us clear indications of changes in membership and function (versus higher-level groupings like Family or Phylum), but avoids some of the noise and uncertainty of trying to identify so many bacteria at the species level.   Many bacteria are not currently identifiable at the species level using this methodology.
    </p>
</div>

<div className="mt-8">
            <Accordion activeIndex={activeIndex}>


                <AccordionTab className=""   headerStyle={{ fontSize: '1.2rem' }}header={<>     <PrimeToolTip target=".hierarchical" />                        

<h3  className="text-lg font-semibold text-gray-700 ">
    <div className="flex flex-row mt-2 ">
    <PTooltip target="#sunburst-tooltip"  style={{ maxWidth: "450px", width: "450px", whiteSpace: "normal" }}
                                >

The Sunburst Chart is particularly useful in ecological and genetic research, where understanding the distribution and diversity of organisms is crucial. We can use this method to discover and analyze patterns of biodiversity or the impact of study variables on taxonomic distributions.
                                </PTooltip>
  <span className="text-xl">  Hierarchical visualization </span> <AiOutlineInfoCircle   id="sunburst-tooltip" className="hierarchical ml-2  text-sm mb-1 cursor-pointer text-siwa-blue p-text-secondary p-overlay-badge" 
/>
    </div>
    
</h3>  </>}>

                <div className="flex flex-row flex-wrap ">
                    <div className="w-full lg:w-2/5">          <p className="text-gray-700 text-justify mt-2 mb-2 font-light"style={{ fontSize: '1.25rem' }}>
                    This sunburst chart representing the taxonomic composition of this dataset allows us to visualize the nested hierarchical structure of taxonomic classifications, and how changes at each taxonomic level relate to one another. By clicking on any section of the chart, you can view detailed information about that taxonomic segment, including its name, the percentage of the total dataset it represents, and its relationship to adjacent segments.                    </p>
               
                   
                    </div>
                    <div className="w-full lg:w-3/5 mt-5 mb-5 justify-center">
                    {observedData && (           <Plot
  data={[observedData]}  // Pasa los datos al gráfico
  layout={{
    margin: { t: 0, l: 0, r: 0, b: 0 },  // Eliminar márgenes
    hovermode: 'closest', // Modo de hover para mejor interacción
    sunburstcolorway: [
      '#03343A', '#4E8E74', '#F99B35', '#E5C217',
      '#075B44', '#F9B870', '#F7E76D',
      '#017FB1', '#5CB08E', '#FCD8B6', '#FCF5CD', '#ABF4D4',
      '#8CDBF4', '#F7927F', '#BC8808'
  ],
    
      width: plotWidth*0.8 || undefined,
      height: plotWidth*0.6 || undefined,
    extendSunburstColorway: true,  // Propiedad corregida
  }as any}// Configura el layout del gráfico
  config= {config}
/>)}
         

                    {/* <iframe 
                        src="/api/components/innerHtml" 
                        frameBorder="0" 

 width={500}
 height={400}
                    
                        allowFullScreen
                        title="Taxonomy Composition Sunburst Chart">
                    </iframe> */}
                        </div>

                
                    </div>  
                      
                </AccordionTab>
            </Accordion>
        </div>

                            </div>

                        <div className="flex flex-row">
                            <GraphicCard filter={filter} legend={""} title={title} orientation="horizontal" slug={params.slug}  text={"As with other assessments, you can group, subset, and filter the samples in a variety of ways.  You can also choose how many taxonomic groups to include in the figure, ranked based on relative abundance in the study.  At each taxonomic level, you will see the percentage of total bacteria that belong to each group.  Most figures will include an “Others” category.  This is the remainder of all sequences that are not above the threshold set for inclusion in the figure."}>
                                {plotData.length > 0 ? (

                                    <div className="w-full ml-4">
                                        <MyPlotComponent plotData={plotData} scatterColors={scatterColors} />
 <div className="w-full flex flex-row ">
              
                                <div className="px-6 py-8 w-full" >
                              
                                <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>


{/* Mostrar el texto correspondiente a la columna y location */}
{textForConfigKey && (
    <div className="col-span-2" ref={configTextRef} >
        <p className="text-gray-700 m-3 text-justify font-light" style={{ fontSize: '1.3rem' }}>{textForConfigKey}</p>
    </div>
)}
</div>
                                </div>
                            </div>
                                    </div>
                                ) : (
                                    <SkeletonCard width={"800px"} height={"470px"} />
                                )}
                            </GraphicCard>
                        </div>
                       
                    </div>
                ) : (
                    <div className="w-full h-full"><Spinner/></div>
                    )}
            </Layout>
            </SidebarProvider>
        </div>
        </RequireAuth>
    );
}


