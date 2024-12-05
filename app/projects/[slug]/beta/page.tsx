"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, use, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Loading from "@/app/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { useRouter } from "next/navigation";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'react-tooltip'
import { Tooltip as PTooltip } from "primereact/tooltip";
import 'react-tooltip/dist/react-tooltip.css'
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { useAuth } from "@/app/components/authContext";
import Spinner from "@/app/components/pacmanLoader";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { BiScatterChart } from "react-icons/bi";
import Link from "next/link";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Dropdown } from "primereact/dropdown";
import { Config } from "plotly.js";
import { Skeleton } from "primereact/skeleton";
import { Checkbox } from 'primereact/checkbox';
import { labelReplacements, colorPalettes, order } from "@/config/dictionaries";
import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { ProgressSpinner } from "primereact/progressspinner";
import { FaFilePdf } from "react-icons/fa";
import { usePopup } from "@/app/components/context/popupContext";
import { motion } from "framer-motion";


export default function Page({ params }: { params: { slug: string } }) {
  type OtuType = {
    index: string[];
    columns: string[];
    data: any
  };
  const { accessToken } = useAuth();
  const { user, error, isLoading } = useUser(); 
   const [isLoaded, setIsLoaded] = useState(false);
  const [plotData, setPlotData] = useState<
    { type: string; y: any; name: string }[]
  >([]);
  const [otus, setOtus] = useState<OtuType | null>(null);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "Cecum",
    "Feces",
    "Ileum",
  ]);
  const [Location, setLocation] = useState<string[]>([
 
  ]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isColorByDisabled, setIsColorByDisabled] = useState(true);
  const [colorBy, setColorBy] = useState<string>('samplelocation');
  const [selectedColorBy, setSelectedColorBy] = useState<string>('samplelocation');
  const [colorByOptions, setColorByOptions] = useState([]);
  const [tittleVariable, SetTittleVariable] = useState<string>('location');
  const [isTabFilterOpen, setIsTabFilterOpen] = useState(false);
  const [dataResult, setDataResult] = useState<any>(null);
  const [betaText, setBetaText] = useState({} as any);
  const [configFile, setconfigFile] = useState({} as any);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [dataUnique, setDataUnique] = useState<any>();
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');
  const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
  let colorIndex = 0;
  const newScatterColors: { [key: string]: string } = {};
  const [filterPeticion, setFilterPeticion] = useState(false);
  const [tempSelectedColorBy, setTempSelectedColorBy] = useState<string>(theRealColorByVariable);
  const [textForConfigKey, setTextForConfigKey] = useState("");
  const [tempSelectedValues, setTempSelectedValues] = useState<Set<string>>(new Set());
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [columnsOrder, setColumnsOrder] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [persistentColors, setPersistentColors] = useState<{ [column: string]: { [value: string]: string } }>({});
  const [layout, setLayout] = useState<any>({});
  const [title, setTitle] = useState<ReactNode>(<div className="w-full flex items-center justify-center"><Skeleton width="50%" height="1.5rem" /></div>);
  const plotRef = useRef(null);
  const router = useRouter();
  const { isWindowVisible } = usePopup();
  const items = [
      { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
    { label: 'Community make-up', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/beta`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };

  const [colorOrder, setColorOrder] = useState<string[]>([]);

  const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
  const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
  const [loaded, setLoaded] = useState(false);
  const [valueOptions, setValueOptions] = useState<any[]>([]);


  const downloadCombinedSVG = async () => {
    const plotContainer = plotRef.current as any;
  
    if (!plotContainer) {
      console.error("Contenedor del gráfico no encontrado");
      return;
    }
  
    // Encuentra todos los SVGs dentro del contenedor
    const svgElements = Array.from(plotContainer.querySelectorAll('svg'));
    console.log(`Se encontraron ${svgElements.length} SVGs en el contenedor`);
  
    if (svgElements.length === 0) {
      console.error("No se encontraron SVGs en el contenedor");
      return;
    }
  
    // Crear un SVG maestro
    const combinedSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    combinedSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    combinedSVG.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  
    let totalHeight = 0;
    const maxWidth = Math.max(...svgElements.map((svg: any) => parseInt(svg.getAttribute("width") || '0', 10)));
  
    // Calcular la altura total sumando las alturas de todos los SVGs
    svgElements.forEach((svg: any) => {
      totalHeight += parseInt(svg.getAttribute("height") || '0', 10);
    });
  
    combinedSVG.setAttribute("width", String(maxWidth));
    combinedSVG.setAttribute("height", String(totalHeight));
  
    console.log(`Tamaño combinado del SVG: ${maxWidth} x ${totalHeight}`);
  
    let yOffset = 0;
  
    // Procesar cada SVG
    svgElements.forEach((svg: any, index: number) => {
      console.log(`Procesando SVG ${index + 1}...`);
  
      // Clonamos el SVG original para preservarlo
      const clonedSVG = svg.cloneNode(true);
  
      // Ajustamos todos los elementos de texto para que estén bien posicionados
      const textElements = clonedSVG.querySelectorAll('text, tspan, path, textPath, [fill], [stroke]');
      console.log(`Se encontraron ${textElements.length} elementos de texto en el SVG ${index + 1}`);
  
      textElements.forEach((text: any) => {
        if (text.textContent) {
          console.log("Texto encontrado en el SVG:", text.textContent);
          // Reemplazar guiones largos y otros caracteres especiales por un guion normal
          text.textContent = text.textContent.replace(/[\u2013\u2014]/g, '-');
          text.textContent = text.textContent.replace(/−/g, '-');
          text.setAttribute("font-family", "Arial, sans-serif"); // Forzar una fuente estándar
          text.setAttribute('fill', '#000');  // Asegurarse de que el texto sea visible
          text.setAttribute('font-size', '16'); // Ajustar tamaño de fuente si es necesario
          text.setAttribute('visibility', 'visible'); // Asegurarse de que el texto esté visible
          text.setAttribute('opacity', '1'); // Asegurarse de que el texto no sea transparente
          console.log("Texto corregido:", text.textContent);
        }
      });
  
      // Aseguramos que las transformaciones de los títulos se mantengan
      const xtitle = clonedSVG.querySelector('.g-xtitle');
      if (xtitle) {
        xtitle.setAttribute('transform', 'translate(0, -6.806)');
      }
  
      // const ytitle = clonedSVG.querySelector('.g-ytitle');
      // if (ytitle) {
      //   ytitle.setAttribute('transform', 'rotate(-90, -6.713, 294.5)');
      // }
  
      // Ajustamos la posición Y de todo el SVG combinado para asegurarnos de que se alinee correctamente
      clonedSVG.setAttribute('y', String(yOffset));
  
      // Añadimos el SVG clonado al SVG maestro
      combinedSVG.appendChild(clonedSVG);
  
      // Aumentamos el offset Y para el siguiente SVG
      // yOffset += parseInt(svg.getAttribute("height") || '0', 10);
    });
  
    const svgWidth = parseInt(combinedSVG.getAttribute("width") || "0", 10);
        const svgHeight = 730
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: [svgWidth, svgHeight], // Ajustar el formato al tamaño del SVG
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
         pdf.save("community-make-up-plot.pdf");
         // Serializar el SVG combinado y descargarlo
         const svgData = new XMLSerializer().serializeToString(combinedSVG);
         const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
         const link = document.createElement("a");
         link.href = URL.createObjectURL(blob);
         link.download = "combined_plot.svg";
         link.click();
  };
  
  
  
let screenWidth = window.innerWidth;
const fontSize = plotWidth ? Math.max(plotWidth * 0.02, 12) : 13;
const titleFontSize = fontSize + 8;
const axisTitleFontSize = fontSize + 4;
const legendFontSize = fontSize;

    const updatePlotWidth = () => {
      
      
      
      if (plotContainerRef.current) {
        setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);
    
        
      };
    };
    const observedElementId = 'plofather';


      useEffect(() => {
        // Esto asegura que el cambio de tamaño se ejecute solo al final de la animación
          updatePlotWidth();
          setLoaded(true);
    
       
      }, [dataResult]); // Solo ejecuta cuando la visibilidad cambie
    
      useEffect(() => {
        const plofatherElement = document.getElementById('plofather');
    
        // Realiza la actualización inicial al montar el componente
        updatePlotWidth();
    
        // Limpia el event listener de resize
        const handleResize = () => {
          updatePlotWidth();
        };
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, [isWindowVisible, window.innerWidth, document?.getElementById('plofather')?.offsetWidth, isWindowVisible]);

      const getColorForValue = (
        value: string,
        column: string,
        colorMap: { [key: string]: string },
        colorOrder: string[]
    ) => {
    
      console.log(`Obteniendo color para valor: ${value}, columna: ${column}`);
    
      const colorsForVariable = persistentColors[column];
      console.log("persistentColors", persistentColors);
      console.log("colorsForVariable", colorsForVariable);
      console.log("value",value)
     
    if (colorsForVariable && colorsForVariable[value]) {
        return colorsForVariable[value];
        }
    
      
    };

      useEffect(() => {
        if (theRealColorByVariable && colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]) {
            const   palette = colorPalettes[theRealColorByVariable as keyof typeof colorPalettes];
            if (Array.isArray(palette)) {
                setColorOrder(palette);
            } else if (palette && 'colors' in palette) {
                setColorOrder(palette.colors);
            }
        }


    }, [theRealColorByVariable, selectedLocations, dataUnique]);



   
      // Usar requestAnimationFrame para mejorar el rendimiento de la animación
      const updateLayoutWithScale = () => {
        const screenWidth = window.innerWidth;
    
        // Escala dinámica del tamaño del texto basado en el ancho de la pantalla
        const textScale = screenWidth < 600
          ? 0.6
          : screenWidth < 1024
            ? 0.8
            : screenWidth < 1440
              ? 1
              : screenWidth < 1920
                ? 1.2
                : 1.4;
    
        const newLayout = {
          width: plotWidth || undefined,
          height: 600,
          font: { family: 'Roboto, sans-serif' },
          title: {
            font: { 
              family: 'Roboto, sans-serif',
              size: 26,
            }
          },
          responsive: true,
          showlegend: true,
          legend: {
            itemclick: false,
            itemdoubleclick: false,
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: 1.1,
            yanchor: "top",
            font: {
              size: 14 * textScale,
            }
          },
          xaxis: {
            title: {
              text: `PCoA 1 (${dataResult?.proportions_explained?.PC1}%)`,
              font: { 
                family: 'Roboto, sans-serif',
                size: 14 * textScale,
              },
              standoff: 30,
            },
            tickfont: {
              size: 14 * textScale,
            }
          },
          yaxis: {
            title: {
              text: `PCoA 2 (${dataResult?.proportions_explained?.PC2}%)`,
              font: {
                family: 'Roboto, sans-serif',
                size: 14 * textScale,
              },
              standoff: 30,
            },
            annotations: {
              font: {
                size: 12 * textScale,
              }
            },
            tickfont: {
              size: 14 * textScale,
            },
          },
          dragmode: false,
          margin: { l: 70, r: 10, t: 0, b: 60 }
        };
    
        if (layout && Object.keys(layout).length > 0) {
          setLayout((prevLayout: any) => ({
            ...prevLayout,
            ...newLayout,
          }));
        } else {
          setLayout({ width: 500, height: 500 }); // Valor por defecto
        }
      };
    
      // Este useEffect gestiona el redimensionamiento con animación
      useEffect(() => {
        const handleResize = () => {
          // Usamos requestAnimationFrame para mejorar el rendimiento
          requestAnimationFrame(() => {
            updateLayoutWithScale();
          });
        };
    
        // Inicializa el ancho y el layout cuando el componente se monta
        updateLayoutWithScale();
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, [plotWidth, dataResult]); // Dependiendo de plotWidth y dataResult
    
      useEffect(() => {
        const timeoutId = setTimeout(() => {
          // Aquí manejamos la animación del cambio de tamaño
          setLoaded(true);
        }, 500); // Asegura que el cambio se ejecute después de la animación
    
        return () => {
          clearTimeout(timeoutId);
        };
      }, [isWindowVisible]); // Ejecuta el timeout solo cuando cambia la visibilidad
    
    

    
    useEffect(() => {
      if (dataUnique) {
        const columns = dataUnique?.data?.columns;
        const data = dataUnique?.data?.data;
        const newPersistentColors: { [column: string]: { [value: string]: string } } = {};
    
        columns?.forEach((column: string) => {
          const uniqueValues = Array.from(new Set(data?.map((item: { [x: string]: any; }) => item[columns?.indexOf(column)]))).sort((a: any, b: any) => {
            const strA = String(a).toLowerCase();
            const strB = String(b).toLowerCase();
            return strA.localeCompare(strB);
          });
          const colorPalette = colorPalettes[column as keyof typeof colorPalettes];
         
          const colorsForColumn: { [value: string]: string } = {};
    
          if (colorPalette) {
            if (Array.isArray(colorPalette)) {
              // If the palette is an array, assign colors in order
              let colorIndex = 0;
              uniqueValues?.forEach((value:any) => {
                if (value !== null && value !== 'null') {
                  colorsForColumn[value] = colorPalette[colorIndex % colorPalette.length];
                  colorIndex++;
                }
              });
            } else if (typeof colorPalette === 'object') {
              // If the palette is an object, assign colors based on mappings
              let colorIndex = 0;
              const additionalColors = colorPalette.colors || []; // For unmapped values
              uniqueValues?.sort((a: any, b: any) => {
                const strA = String(a); // Asegura que a sea una cadena
                const strB = String(b); // Asegura que b sea una cadena
              
                return strA.localeCompare(strB, undefined, { sensitivity: 'base' });
              }).forEach((rawValue) => {
                  // Convertimos el valor a string de manera segura
                  const value = String(rawValue);
                
                  if (value !== "null" && value !== "undefined") {
                    // Verifica si el colorPalette es un objeto y si la clave existe

                    if (
                      typeof colorPalette === "object" &&
                      !Array.isArray(colorPalette) &&
                      value in colorPalette
                    ) {
                      const resolvedColor = colorPalette[value as keyof typeof colorPalette];
                      // Verifica que el color no sea un array antes de asignarlo
                      if (typeof resolvedColor === "string") {
                        colorsForColumn[value] = resolvedColor;
                        console.log(`Color asignado para ${value}: ${resolvedColor}`);
                      } else if (Array.isArray(resolvedColor) && resolvedColor.length > 0) {
                        colorsForColumn[value] = resolvedColor[0]; // Asignar el primer color del array si es necesario
                        console.log(`Color asignado para ${value}: ${resolvedColor[0]}`);
                      } else {
                        colorsForColumn[value] = "#000000"; // Color por defecto
                      }
                    } else if (
                      Array.isArray(additionalColors) &&
                      additionalColors.length > 0
                    ) {
                      colorsForColumn[value] =
                        additionalColors[colorIndex % additionalColors.length];
                        console.log(`Color asignado para ${value}: ${additionalColors[colorIndex % additionalColors.length]}`);
                      colorIndex++;
                    } else {
                      colorsForColumn[value] = "#000000"; // Color por defecto
                    }
                  }
                });
                
                
            }
          } else {
            // No color palette found for the column
            uniqueValues?.forEach((value:any) => {
              if (value !== null && value !== 'null') {
                colorsForColumn[value] = '#000000'; // Default color
              }
            });
          }
    
          newPersistentColors[column] = colorsForColumn;
        });

        setPersistentColors(newPersistentColors);
      }
    }, [dataUnique]);
    
  

    
    
    
    useEffect(() => {
        updatePlotWidth(); // Establece el ancho inicial

    }, [dataResult]);


  const fetchConfigFile = async (token: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/configfile/${params.slug}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Enviar el token
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const configfile = await response.json(); // Asume que las opciones vienen en un campo llamado 'configfile'
  
      setconfigFile(configfile?.configFile);
      setBetaText(configfile?.configFile?.betadiversity);
      setColorByOptions(configfile?.configFile?.columns); // Actualiza el estado con las nuevas opciones
    } catch (error) {
      console.error("Error al cargar las opciones del dropdown:", error);
    }
  };

  

  const handleLocationChange = (event: any) => {
  
  
    if (event === 'all') {
      setSelectedLocations(["Cecum", "Feces", "Ileum"]);
      setIsColorByDisabled(true);
      setTheRealColorByVariable("samplelocation");
    } else {
      setSelectedLocations([event]);
      setIsColorByDisabled(false);
    }
  };

  
  
  useEffect(() => {
    if (selectedLocations.length > 0) {
      applyFilters();
    }
  }, [selectedLocations]);

  const handleLocationChangeColorby = (event: any) => {
      setTempSelectedColorBy(event.target.value);
      // fetchProjectIdsFiltercolor(dataResult, event.target.value);
    


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

    // Definir una función genérica para realizar el fetch
    const fetchData = async (token: any) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/beta/${params.slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "samplelocation": selectedLocations,
            "column": colorBy,
            "columnValues" : selectedLocations
        }),        }
        );
        if (!response.ok) {
          // toast.warn('The data needs to be loaded again!', {
          //   position: "top-center",
          //   autoClose: 5000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: "light",
          //   transition: Bounce,
          // });
          // setTimeout(() => { window.location.href = "/"; }, 5000);
          // throw new Error("Respuesta no válida desde el servidor");
        }
  
        const result = await response.json();
        setDataResult(result);
        setColumnOptions(result?.data?.columns);
        setDataUnique(result);
        
        setValueOptions(result?.data?.data);
        const mergedColumnsOrder = mergeOrders(order, result?.order);
        setColumnsOrder(mergedColumnsOrder);
        return result; // Devolver los datos obtenidos
  
      } catch (error) {
  
        throw error; // Propagar el error para manejarlo más adelante
      }
    };

  // Definir una función genérica para realizar el fetch con filtro
  const fetchBetaDiversityData = async (token: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/beta/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "samplelocation": selectedLocations,
          "column": String(colorBy).toLocaleLowerCase(),
          "columnValues" : colorBy === 'samplelocation' ? selectedLocations : [...selectedValues],

      }),      }
      );
      if (!response.ok) {
        // toast.warn('The data needs to be loaded again!', {
        //   position: "top-center",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "light",
        //   transition: Bounce,
        // });
        // setTimeout(() => { window.location.href = "/"; }, 5000);
        // throw new Error("Respuesta no válida desde el servidor");
      }

      const result = await response.json();
      setDataResult(result);
      return result; // Devolver los datos obtenidos

    } catch (error) {

      throw error; // Propagar el error para manejarlo más adelante
    }
  };

  const applyFilters = async () => {
    try {

      isColorByDisabled || colorBy === "samplelocation"
        ? SetTittleVariable('location')
        : SetTittleVariable(colorBy.replace('_', ' '));
      setLocation(selectedLocations);
      setSelectedColorBy(tempSelectedColorBy);
      setInitialValueOptions(new Set(valueOptions));
      setColorBy(tempSelectedColorBy);  // Aplicar columna temporal al estado real
      setSelectedValues(tempSelectedValues);  // Aplicar valores temporales al estado real
      setFilterPeticion(true);  // Activar el estado de solicitud de filtro
    } catch (error) {
      console.error("Error applying filters:", error);
      setFilterPeticion(false);
    }
  };

  




  // useEffect(() => {fetchProjectIdsFiltercolor(dataResult, theRealColorByVariable)}, [theRealColorByVariable,  dataResult]);

  useEffect(() => {
    if (otus && tempSelectedColorBy) {
        // Filtrar los valores únicos de la columna seleccionada
        const columnIndex = columnOptions?.indexOf(String(tempSelectedColorBy).toLowerCase());
        const uniqueValues: Set<string> = new Set(dataUnique?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
        const uniqueValuesCheck: Set<string> = new Set(otus?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
        console.log(uniqueValuesCheck)
        console.log(uniqueValues)

        setValueOptions([...uniqueValues].filter(value => value !== 'null'));

        // Inicializa 'selectedValues' con todos los valores únicos
        setTempSelectedValues(new Set<string>(uniqueValuesCheck));
    }
}, [tempSelectedColorBy, otus]);

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

  
const handleGroupChange = (value: string) => {
fetchProjectIdsFiltercolor(dataResult, value);
  
  setTheRealColorByVariable(value);
};

const handleTempColorByChange = (value: string) => {
  setTempSelectedColorBy(value);
};


const valueChecks = (
<div className="flex flex-col w-full mb-5 mt-5">
  <div className="flex w-full flex-row flex-wrap items-start justify-start">
    {valueOptions?.filter(value => value !== null && tempSelectedColorBy !== "samplelocation").sort((a, b) => String(a).localeCompare(String(b))) // Ordenar alfabéticamente
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

// useEffect(() => {setTheRealColorByVariable(selectedColorBy)}, [selectedColorBy]);


const sortByCustomOrder = (
  data: any[],
  column: string,
  orderDict: { [key: string]: { [key: string]: number } }
) => {
  let order: { [key: string]: number } = {};
  if (columnsOrder && Object.keys(columnsOrder).length > 0) {
    for (let key in columnsOrder) {
      if (key.toLowerCase() === column.toLowerCase()) {
        order = orderDict[key];
        break; // Found the matching column, no need to continue
      }
    }
  }


  // Check if order is empty
  if (Object.keys(order).length === 0) {
    // No custom order, define default sorting
    // Extract unique values from data
    const uniqueValues = Array.from(
      new Set(
        data.map((item: { [x: string]: any; name: any }) => String(item.name || item[column]))
      )
    );

    // Determine if values are numeric
    const areValuesNumeric = uniqueValues.every(value => !isNaN(Number(value)));

    // Sort uniqueValues accordingly
    if (areValuesNumeric) {
      uniqueValues.sort((a, b) => Number(a) - Number(b));
    } else {
      uniqueValues.sort(); // Lexicographical sort
    }

    // Create default order mapping
    uniqueValues.forEach((value, index) => {
      order[value] = index;
    });
  }

  return data.sort(
    (a: { [x: string]: any; name: any }, b: { [x: string]: any; name: any }) => {
      const valueA = String(a.name || a[column]);
      const valueB = String(b.name || b[column]);
      const orderA = order[valueA];
      const orderB = order[valueB];
      return (orderA !== undefined ? orderA : Infinity) - (orderB !== undefined ? orderB : Infinity);
    }
  );
};


  const fetchProjectIds = async (result: any) => {

    const locations = new Set(
      result?.data?.data?.map((item: any[]) => item[3])
    );
    const uniqueLocations = Array.from(locations) as string[];
    setAvailableLocations(uniqueLocations);
    setOtus(result?.data); // Actualiza el estado con los datos obtenidos
    // Filtrado y mapeo de datos para los gráficos...
    const filteredData = result?.data?.data?.filter((item: any[]) =>
      selectedLocations.includes(item[3])
    );

    const groupedData = filteredData?.reduce(
      (
        acc: {
          [x: string]: {
            y: any;
            text: string[];
          };
        },
        item: any[]
      ) => {
        const location = item[3];
        const sampleId = item[2];

        // Verifica si la locación actual debe ser incluida
        if (selectedLocations.includes(location)) {
          if (!acc[location]) {
            acc[location] = { y: [], text: [] };
          }
          acc[location].text.push(`Sample ID: ${sampleId}`);
        }

        

        return acc;
      },
      {}
    );

    let scatterPlotData = filteredData?.reduce(
      (
        acc: {
          [x: string]: {
            y: any;
            x: any;
            text: string[];
            mode: any;
            type: any;
            name: any;
            marker: { size: number, color: string };
            
          };
        },
        item: [any, any, any, any]
      ) => {
        const [PC1, PC2, sampleId, sampleLocation] = item;
        const colorValue = theRealColorByVariable !== 'samplelocation' ? item[result?.data.columns.indexOf(theRealColorByVariable)] : sampleLocation;
     
        // Inicializa el objeto para esta locación si aún no existe
        
        if (!acc[sampleLocation]) {
          acc[sampleLocation] = {
              x: [],
              y: [],
              mode: "markers",
              type: "scatter",
              name: sampleLocation,
              text: [],
              marker: { size: 11, color: getColorForValue(
                colorValue,
                theRealColorByVariable,
                scatterColors,
                colorOrder
            ) || "#000000", }
          };
          const key = sampleLocation;
          // newScatterColors[key] = colorOrder[colorIndex % colorOrder.length];
          // colorIndex++;
      }
      

        // Agrega los datos al objeto de esta locación
        acc[sampleLocation].x.push(PC1);
        acc[sampleLocation].y.push(PC2);
        acc[sampleLocation].text.push(`Sample ID: ${sampleId}`);

        return acc;
      },
      {} // Asegura que el valor inicial del acumulador es un objeto
    );
    // setScatterColors(newScatterColors);

      const mergedColumnsOrder = mergeOrders(order, result?.order);
      scatterPlotData = sortByCustomOrder(Object.values(scatterPlotData || {}), theRealColorByVariable, mergedColumnsOrder);

      

    setScatterData(Object.values(scatterPlotData || {}));
    const plotData = Object.keys(groupedData || {})
      .filter((location: string) => selectedLocation.includes(location))
      .map((location: string) => ({
        type: "box",
        y: groupedData[location].y,
        text: groupedData[location].text,
        hoverinfo: "y+text",
        name: location,
      }));

    setPlotData(
      Object.keys(groupedData || {})?.map((location) => ({
        ...groupedData[location],
        type: "box",
        name: location,
      }))
    );

    setIsLoaded(true);

  }

  const fetchProjectIdsFiltercolor = async (result: any, color: any) => {
    try {
        let scatterPlotData = result?.data.data.reduce((acc: { [x: string]: any }, item: any) => {
            const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
            const colorValue = color !== 'samplelocation' ? item[result?.data.columns.indexOf(color)] : sampleLocation;

            let key = colorValue; // Ahora se usa colorValue como clave
            let name = `${colorValue}`; // Nombre para la leyenda

            // Si el color ya está asignado, no lo reasignes
            if (!scatterColors[key]) {
                scatterColors[key] = colorOrder[colorIndex % colorOrder.length];
                colorIndex++;
            }

            if (!acc[key]) {
                acc[key] = {
                    x: [],
                    y: [],
                    mode: "markers",
                    type: "scatter",
                    name: name,
                    text: [],
                    marker: { size: 11, color: getColorForValue(
                      colorValue, // Valor de colorByVariable
                      color, // Variable actual
                      scatterColors, // Mapa de colores existente
                      colorOrder // Orden de colores
                  ) || '#000000' // Default color if undefined} // Usa el color asignado
                }}
            }

            acc[key].x.push(PC1);
            acc[key].y.push(PC2);
            acc[key].text.push(`Sample ID: ${sampleId}, ${color === "samplelocation" ? "location" : color}: ${colorValue}`);
            return acc;
        }, {});

        if (columnsOrder && columnsOrder !== undefined && Object.keys(columnsOrder).length > 0) {
          scatterPlotData = sortByCustomOrder(Object.values(scatterPlotData), color, columnsOrder);
  
          }

        setScatterData(Object.values(scatterPlotData));
        setIsLoaded(true);
    } catch (error) {
        console.error("Error al obtener projectIds:", error);
    }
};

const fetchProjectIdsFilter = async (result: any) => {
  try {
      let scatterPlotData = result?.data.data.reduce((acc: { [x: string]: any }, item: any) => {
          const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
          const colorValue = theRealColorByVariable !== 'samplelocation' ? item[result?.data.columns.indexOf(theRealColorByVariable)] : sampleLocation;

          let key = colorValue; 
          let name = `${colorValue}`;

        
          if (!scatterColors[key]) {
              scatterColors[key] = colorOrder[colorIndex % colorOrder.length];
              colorIndex++;
          }

          if (!acc[key]) {
              acc[key] = {
                  x: [],
                  y: [],
                  mode: "markers",
                  type: "scatter",
                  name: name,
                  text: [],
                  marker: { size: 11, color:  getColorForValue(
                    colorValue, // Valor de colorByVariable
                    theRealColorByVariable, // Variable actual
                    scatterColors, // Mapa de colores existente
                    colorOrder // Orden de colores
                ) || '#000000' // Default color if undefined} // Usa el color asignado } // Usa el color asignado
              }};
          }

          acc[key].x.push(PC1);
          acc[key].y.push(PC2);
          acc[key].text.push(`Sample ID: ${sampleId}, ${theRealColorByVariable === "samplelocation" ? "location" : theRealColorByVariable}: ${colorValue}`);
          return acc;
      }, {});

      if (columnsOrder && columnsOrder !== undefined && Object.keys(columnsOrder).length > 0) {
        scatterPlotData = sortByCustomOrder(Object.values(scatterPlotData), theRealColorByVariable, columnsOrder);
   
        }

      setScatterData(Object.values(scatterPlotData));
      setIsLoaded(true);
      setFilterPeticion(false);
  } catch (error) {
      console.error("Error al obtener projectIds:", error);
      setFilterPeticion(false);
  }
};


// Función para buscar texto en Community_Makeup
const findTextInCommunityMakeup = (
  config: { Community_Makeup: { Analysis: any } },
  location: string,
  column: string
) => {
  console.log("Searching in Community_Makeup:", { location, column });
  const analysis = config?.Community_Makeup?.Analysis;
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
  config: { Community_Makeup: { Analysis: any } },
  location: string,
  formedKey: string,
  column: string
) => {
  const analysis = config?.Community_Makeup?.Analysis;
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
  const scatter = sortByCustomOrder(Object.values(scatterData), theRealColorByVariable, columnsOrder);
  setScatterData(scatter as any[]);
}, [columnsOrder]);


useEffect(() => {
  const location = selectedLocations.length > 1 ? 'All' : selectedLocations[0];
  console.log("Location and theRealColorByVariable:", { location, theRealColorByVariable });
  console.log("selected locations:", selectedLocations);
  if (location && theRealColorByVariable) {
      const formattedColumn = theRealColorByVariable.charAt(0).toUpperCase() + theRealColorByVariable.slice(1);
      console.log("Formatted column and location:", { formattedColumn, location });

      const allValuesSelected = Array.from(initialValueOptions).every(option => selectedValues.has(option));

      if (allValuesSelected) {
          const textForConfig = findTextInCommunityMakeup(configFile, location, (theRealColorByVariable === "samplelocation" ? "Self" : formattedColumn));
          console.log("Text for all values selected:", textForConfig);
          setTextForConfigKey(textForConfig || "");
      } else if (colorBy.charAt(0).toUpperCase() + colorBy.slice(1) !== 'SampleLocation' && selectedValues.size > 0) {
          // Limpia cada valor en valuesArray para eliminar caracteres especiales
          const valuesArray = Array.from(selectedValues)
              .map(value => String(value).replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')); // Elimina caracteres especiales

          const formedKey = `${colorBy.charAt(0).toUpperCase() + colorBy.slice(1)}_${valuesArray.join('+')}`;
          const normalizedFormedKey = `${colorBy.charAt(0).toUpperCase() + colorBy.slice(1)}_${valuesArray.sort().join('+')}`;

          console.log("Formed key and normalized formed key:", { formedKey, normalizedFormedKey });

          // Intentar buscar con formedKey primero y luego con normalizedFormedKey
          let textForConfig = findTextInCommunityMakeupNested(
              configFile,
              location,
              formedKey,
              theRealColorByVariable === colorBy.charAt(0).toUpperCase() + colorBy.slice(1) ? "Self" : formattedColumn
          );
          if (!textForConfig) {
              textForConfig = findTextInCommunityMakeupNested(
                  configFile,
                  location,
                  normalizedFormedKey,
                  theRealColorByVariable === colorBy.charAt(0).toUpperCase() + colorBy.slice(1) ? "Self" : formattedColumn
              );
          }

          console.log("Text for specific filter:", textForConfig);
          setTextForConfigKey(textForConfig || "");
      } else {
          setTextForConfigKey("");
      }
  }
}, [selectedLocations, colorBy, theRealColorByVariable, selectedValues, valueOptions, configFile]);


// useEffect(() => {
//   const location = selectedLocations.length > 1 ? "All" : selectedLocations[0];
//   console.log("Location and theRealColorByVariable:", { location, theRealColorByVariable });
//   console.log("Selected locations:", selectedLocations);
  
//   if (location && theRealColorByVariable) {
//     const formattedColumn = String(tempSelectedColorBy).charAt(0).toUpperCase() + String(tempSelectedColorBy).slice(1);
//     console.log("Formatted column and location:", { formattedColumn, location });

//     const allValuesSelected = Array.from(initialValueOptions)?.every(option => selectedValues.has(option));

//     if (allValuesSelected) {
//       const textForConfig = findTextInCommunityMakeup(
//         configFile,
//         location,
//         tempSelectedColorBy === "samplelocation" ? "Self" : formattedColumn
//       );
//       console.log("Text for all values selected:", textForConfig);
//       setTextForConfigKey(textForConfig || "");
//     } else if (
//       String(tempSelectedColorBy).charAt(0).toUpperCase() + String(tempSelectedColorBy).slice(1) !== "SampleLocation" &&
//       selectedValues.size > 0
//     ) {
//       const tempValuesArray = Array.from(tempSelectedValues)
//         .map(value => String(value).replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, ""));

//       const formedKey = `${String(tempSelectedColorBy).charAt(0).toUpperCase() + String(tempSelectedColorBy).slice(1)}_${tempValuesArray.join("+")}`;
//       const normalizedFormedKey = `${String(tempSelectedColorBy).charAt(0).toUpperCase() + String(tempSelectedColorBy).slice(1)}_${tempValuesArray.sort().join("+")}`;

//       console.log("Formed key and normalized formed key:", { formedKey, normalizedFormedKey });

//       let textForConfig = findTextInCommunityMakeupNested(
//         configFile,
//         location,
//         formedKey,
//         theRealColorByVariable === String(tempSelectedColorBy).charAt(0).toUpperCase() + String(tempSelectedColorBy).slice(1) ? "Self" : formattedColumn
//       );

//       if (!textForConfig) {
//         textForConfig = findTextInCommunityMakeupNested(
//           configFile,
//           location,
//           normalizedFormedKey,
//           theRealColorByVariable === String(tempSelectedColorBy).charAt(0).toUpperCase() + String(tempSelectedColorBy).slice(1) ? "Self" : formattedColumn
//         );
//       }

//       console.log("Text for specific filter:", textForConfig);
//       setTextForConfigKey(textForConfig || "");
//     } else {
//       setTextForConfigKey("");
//     }
//   }
// }, [selectedLocations, tempSelectedColorBy, theRealColorByVariable, tempSelectedValues, configFile]);


  useEffect(() => {
    if (availableLocations.length === 1) {
      // Si solo hay una ubicación disponible, selecciónala automáticamente
      const uniqueLocation = availableLocations[0];
      handleLocationChange(uniqueLocation); // Asume que esta función actualiza tanto `selectedLocations` como `currentLocation`
    }
  }, [availableLocations]); // Dependencia del efecto
  


  useEffect(() => {

      fetchConfigFile(accessToken);
      fetchData(accessToken).then((result) => {  fetchProjectIds(result) })
    
  }
    , [params.slug, accessToken]);

    useEffect(() => {
      fetchProjectIds(dataResult);}, [persistentColors]);


    useEffect(() => {
      if (filterPeticion && colorBy && selectedValues.size > 0) {
          const fetchDataAndUpdate = async () => {
            const result = await fetchBetaDiversityData(accessToken);
            fetchProjectIdsFilter(result);
              const columnIndex = otus?.data?.columns?.indexOf(colorBy);
              const filteredData = dataResult?.data?.data.filter((item: any[]) => selectedLocations.includes(item[1]));
      
              // Mantener colores ya asignados
              
              const updatedScatterColors = { ...scatterColors };
              filteredData.forEach((item: any[]) => {
                  const value = item[columnIndex];
                  if (value && !updatedScatterColors[value]) {
                      updatedScatterColors[value] = colorOrder[Object.keys(updatedScatterColors).length % colorOrder.length];
                  }
              });
              console.log("Updated scatter colors:", updatedScatterColors);

              setScatterColors(updatedScatterColors);
           
          };

          fetchDataAndUpdate();  // Ejecutar la función asíncrona
      }
  }, [colorBy, selectedValues, filterPeticion, dataUnique]);  // Se ejecuta cuando cambian selectedColumn, selectedValues o filterPeticion

    const [activeIndexes, setActiveIndexes] = useState([0,1]);

    const onTabChange = (e : any) => {
        setActiveIndexes(e.index);  // Actualiza el estado con los índices activos
    };

    const dropdownOptionsColorby = (() => {
    
  
      if (!columnOptions || !colorByOptions) {
          console.warn("columnOptions o colorByOptions están indefinidos.");
          return [{ label: 'Sample Location', value: 'samplelocation' }]; // Agregar el predeterminado si las listas no están definidas
      }
  
      const filteredOptions = colorByOptions
          .filter(option =>
              columnOptions.map(col => String(col).toLowerCase())
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
  
      // Agregar la opción predeterminada al inicio de la lista
      return [{ label: 'Sample Location', value: 'samplelocation' }, ...filteredOptions];
  })();
  
  
  const [initialValueOptions, setInitialValueOptions] = useState<Set<string>>(new Set()); // Copia estática de valueOptions
  
  useEffect(() => {
    if (valueOptions?.length > 0) {
        setInitialValueOptions(new Set(valueOptions)); // Solo actualizar cuando se carguen los datos o se aplique un filtro
    }
}, [selectedValues]);



    const dropdownOptions = [
    {label:'All Locations', value:'all'}, // Opción predeterminada
    ...availableLocations
      .map(option => ({
          label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
          value: option
      }))
    ]
      
      const filter = (
        <div className="flex flex-col w-full rounded-lg dark:bg-gray-800">
          <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">
            
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
                  value={selectedLocations.length > 1 ? "all" : selectedLocations[0]}
                  options={dropdownOptions}
                  onChange={(e) => handleLocationChange(e.value)}
                  disabled={availableLocations.length === 1}
                  className="w-full mb-6 text-sm"
                  placeholder="Choose a location"
                />
              </div>
      
              <div className="flex flex-col items-start mt-2 m-2">
                <div className="flex items-center mb-2">
                  <h3 className="text-base font-medium text-gray-700 dark:text-white" style={{ fontSize: '1.05rem' }}>
                    Select a variable to color:
                  </h3>
                  <span className="ml-2">
                    <i
                      className="pi pi-info-circle text-siwa-blue"
                      data-pr-tooltip="Adjusts how samples are grouped and colored in the analysis. To use, select a sample location above, then choose a grouping variable."
                      data-pr-position="top"
                      id="groupByTooltip"
                    />
                    <PTooltip target="#groupByTooltip" />
                  </span>
                </div>
                <Dropdown
                  value={theRealColorByVariable}
                  options={dropdownOptionsColorby}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  optionLabel="label"
                  className="w-full text-sm filtercolorby"
                  id="colorby"
                  disabled={selectedLocations.length > 1}
                  placeholder="Select a color category"
                />
              </div>
            </AccordionTab>
      
            <AccordionTab className="filter-acordeon" header="Filter by"  headerStyle={{ fontSize: '1.15rem' }}>
              <div className="mt-2 ml-2 mb-4">
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
                        checked={tempSelectedColorBy === option}
                        onChange={handleLocationChangeColorby}
                      />
                      <label
                        htmlFor={option}
                        className={`flex items-center justify-center cursor-pointer hover:text-gray-600 hover:bg-gray-100
                          w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
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
                  // loading={filterPeticion}
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
      




  type ScatterData = {
    name: string;
    // Add other properties as needed
  };

  type ScatterColors = {
    [key: string]: string;
    // Add other properties as needed
  };

  const CustomLegend = ({ scatterData, scatterColors }: { scatterData: ScatterData[]; scatterColors: ScatterColors }) => (
    <div className="flex w-full flex-grow items-start" style={{ marginLeft: '5px' }}>
      {scatterData.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft:'10px' }}>
          <div className="rounded-full" style={{ width: '15px', height: '15px', backgroundColor: scatterColors[entry.name], marginRight: '10px' }}></div>
          <div className="text-sm text-gray-500">{entry.name}</div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {

    
    setLocation(availableLocations.length > 1 ? selectedLocations : [availableLocations[0]]);
}, [params.slug, scatterData]);


useEffect(() => {
  if (Location[0] && Location.length > 0) {
    const formattedColorByVariable = labelReplacements[String(theRealColorByVariable).toLowerCase()]
                ? labelReplacements[String(theRealColorByVariable).toLowerCase()]
                : String(theRealColorByVariable).charAt(0).toUpperCase() + String(theRealColorByVariable).replace('_', ' ').slice(1);
      const newTitle = `Compositional differences (Bray-Curtis) ${Location.length === 3  ? " in All Locations" : " in the " + Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) + (theRealColorByVariable === "samplelocation" ? "" : " by " + formattedColorByVariable)}`;
      setTitle(newTitle);
  }
}, [Location, theRealColorByVariable]);

  const MyPlotComponent = ({ scatterData, scatterColors }: { scatterData: any[]; scatterColors: any }) => (
    <div className="flex flex-row w-full items-center">
      <div className="w-full " ref={plotContainerRef}>
      {loaded && (
        <>
           <div className="flex flex-row w-full justify-end items-end mb-2">
                            {/* <div className="flex items-center">
                                <Button
                                    className="p-button-rounded p-button-outlined p-button-sm"
                                    onClick={() => setGraphType(graphType === "boxplot" ? "violin" : "boxplot")}
                                    tooltip={`Change to ${graphType === "boxplot" ? "violin" : "boxplot"} view`}
                                >
                                    <RiExchangeFundsLine className="text-lg" />

                                </Button>
                            </div> */}

                            {/* <PToast ref={toast} position="top-right" /> */}
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
        data={scatterData}
        config={config}
        divId="plot"
        layout={layout}
      
        
      />
                <div className="flex flex-row p-3 mx-3 mb-5">
                                    <div className="mr-1 font-bold">*</div>
                                    <div className="text-gray text-justify" style={{ fontSize: '1rem' }}>
                                    Beta diversity is recalculated each time a filter is applied.                                    </div>
                                </div>

                            </div>
        </>
      
      )}
      </div>

    </div>

  );
  const legend = (
    <div className="w-full flex flex-row overflow-x-scroll max-h-full items-start justify-center mt-5">
        <CustomLegend scatterData={scatterData} scatterColors={scatterColors} />
    </div>
);


  return (
    <div className="w-full h-full">
      <SidebarProvider>
      <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-bread"/>}>
        {isLoaded ? (
<div className="flex flex-col w-11/12 mx-auto">
<div className="flex flex-row w-full text-center justify-center items-center">
<h1 className="text-3xl my-5 mx-2">Community make-up</h1>
        
        </div>
      <div className="px-6 py-8">

      <div className={`prose single-column`}>
      <p className="text-gray-700 text-justify" style={{ fontSize: '1.3rem' }}>
      To explore how microbiome composition varies across groups, we analyze an ecological diversity measure called <span className="text-gray-700 font-semibold">Beta Diversity</span>. <span className="text-gray-700 font-semibold">Beta Diversity</span> is a way to measure and compare how different two groups are from each other in terms of their species or other characteristics.    In this dashboard, we use <span className="text-gray-700 font-semibold">Bray-Curtis dissimilarities </span>to quantify these differences and visualize them through <span className="text-gray-700 font-semibold">Principal Coordinates Analysis (PCoA)</span>. PCoA is machine learning tool that helps us simplify this complex data, identifying a few key features of microbiome composition that explain the most differences between samples.
</p>

</div>


    </div>
 
  <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: loaded ? 1 : 0 }} 
          transition={{ duration: 0.5 }}
          className="flex"
        >
    <GraphicCard legend={""} text={"PCoA simplifies high-dimensional data into a smaller number of new dimensions that highlight the most important patterns. Each axis in the PCoA plot represents a combination of microbiome features (the sequences in the samples) that explain a significant portion of the variation between samples. The percentage displayed on each axis indicates how much of the total variation is captured by that combination. <br/>Each dot in the plot corresponds to a sample. If one axis is strongly impacted by levels of Bacteroides and Prevotella, samples that have similar amounts of these bacteria might cluster close together."} filter={filter} title={title}>
      {scatterData.length > 0 ? (
        <div className="w-full flex flex-col">

          <MyPlotComponent scatterData={scatterData} scatterColors={scatterColors} />
          <div className="w-full flex flex-row ">
                           
                           <div className="px-6 py-8 w-full" >
                              
                               <div className="prose flex flex-row flex-wrap">
                               {textForConfigKey && (
                                                                        <div className="col-span-2" >
                                                                            <p className="text-gray-700 m-3 text-justify font-light" style={{ fontSize: '1.3rem' }}>{textForConfigKey}</p>
                                                                        </div>
                                                                    )}
                               </div>
                           </div>
                       </div>
        </div>
      ) : (
        <SkeletonCard width={"500px"} height={"270px"} />
      )}
    </GraphicCard>
  </motion.div>


</div>

        ) : (
          <div className="w-full h-full"><Spinner/></div>
          )}
        <ToastContainer />
      </Layout>
      </SidebarProvider>
    </div>
  );
}


