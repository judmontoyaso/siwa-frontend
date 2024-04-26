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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Config } from "plotly.js";



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
    const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');
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
    const [number, setNumber] = useState(12);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [configFile, setconfigFile] = useState({} as any);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
    const [dataUnique, setDataUnique] = useState<any>();
    const [dataResult, setDataResult] = useState<any>(null);
    const [actualGroup, setActualGroup] = useState<any>('samplelocation');
const [actualRank, setActualRank] = useState<any>('genus');
    const [columnOptions, setColumnOptions] = useState([]);
    const [htmlContent, setHtmlContent] = useState('');
    const containerRef = useRef<HTMLDivElement>(null); // Update the type of containerRef to HTMLDivElement
    const [activeIndex, setActiveIndex] = useState(0); 

    useEffect(() => {
        fetch('/api/components/innerHtml')
          .then(res => res.json())
          .then(data => {
            setHtmlContent(data.content); // Establece el contenido HTML en el estado
          });
      }, []);

      
      const fetchProjectIdsFiltercolor = async (colorByVariable: string) => {
 

        if (otus && otus.data) {
          const traces: SetStateAction<any[]> = [];
          const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0])));
  
          labels.forEach(label => {
              const filteredData = otus.data.data.filter((item: unknown[]) => item[0] === label);
              const xValues = filteredData.map((item: any[]) => item[1]);
              const yValues = filteredData.map((item: any[]) => item[3]);
              const color = colors[traces.length % colors.length];
  
              traces.push({
                  x: xValues,
                  y: yValues,
                  type: 'bar',
                  name: label,
                  marker: { color: color },
              });
  
              newScatterColors[label as string] = color;
          });
  
          // Ordenando los traces basados en la suma total de los valores de Y de cada uno, de mayor a menor
          traces.sort((a, b) => {
          const sumA = a.y.reduce((acc: any, curr: any) => acc + curr, 0);
          const sumB = b.y.reduce((acc: any, curr: any) => acc + curr, 0);
          return sumB - sumA; // Cambia a `sumA - sumB` si prefieres orden ascendente
      });
  
          setPlotData(traces);
          console.log("Traces:", plotData);
          setScatterColors(newScatterColors); // Asegúrate de que esto sea un estado de React
      }
        }
  





const router = useRouter();

const items = [
    { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
    { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
  { label: 'Taxonomic abundance', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/alpha`}>{item.label}</Link> },
];

const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };


useEffect(() => {
    if (otus && otus.data) {
        const traces: SetStateAction<any[]> = [];
        const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0])));

        labels.forEach((label: any, index: number) => {
            const filteredData = otus.data.data.filter((item: unknown[]) => item[0] === label);
            const scatterColors: { [key: string]: string } = {};

            const xValues = filteredData.map((item: any[]) => item[1]);
            const yValues = filteredData.map((item: any[]) => item[3]);

            // Asignar color o recuperar el color existente
            if (!scatterColors[label]) {
                scatterColors[label] = colors[index % colors.length];
            }

            traces.push({
                x: xValues,
                y: yValues,
                type: 'bar',
                name: label,
                marker: { color: scatterColors[label] },
            });
        });

        setPlotData(traces);
    }
}, [otus]);





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
            setColorByOptions(combinedOptions);
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
            // window.location.href = `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/logout`;
        }
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
setObservedData(result?.Krona)
            setValueOptions(result?.meta?.data);
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };


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
                    "selectedGroup": selectedGroup,
                    "selectedColorGroup": theRealColorByVariable,
                    "columnValues": [...selectedValues],
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
    useEffect(() => {

        if (otus && otus.data) {
            console.log("OTUS:", otus);
            const traces: SetStateAction<any[]> = [];
            const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0])));

            labels.forEach(label => {
                const filteredData = otus.data.data.filter((item: unknown[]) => item[0] === label);
                const xValues = filteredData.map((item: any[]) => item[1]);
                const yValues = filteredData.map((item: any[]) => item[3]);
                const color = colors[traces.length % colors.length];

                traces.push({
                    x: xValues,
                    y: yValues,
                    type: 'bar',
                    name: label,
                    marker: { color: color },
                });

                newScatterColors[label as string] = color;
            });

            // Ordenando los traces basados en la suma total de los valores de Y de cada uno, de mayor a menor
            traces.sort((a, b) => {
            const sumA = a.y.reduce((acc: any, curr: any) => acc + curr, 0);
            const sumB = b.y.reduce((acc: any, curr: any) => acc + curr, 0);
            return sumB - sumA; // Cambia a `sumA - sumB` si prefieres orden ascendente
        });

            setPlotData(traces);
            console.log("Traces:", plotData);
            setScatterColors(newScatterColors); // Asegúrate de que esto sea un estado de React
        }
    }, [otus]);

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

        if (selectedLocations.length === 3) {
            setSelectedGroup("samplelocation"); // Restablecer el valor de tratamiento si se selecciona 'All'
        } 
setActualGroup(selectedGroup);
setActualRank(selectedRank);
setFilterPeticion(true);

    };

    const handleLocationChange = (event: any) => {
        if (event === 'all') {
            setSelectedLocations(['cecum', 'feces', 'ileum']);
            setSelectedColumn("samplelocation");
            setSelectedGroup("samplelocation");
            setIsColorByDisabled(true);
        } else {
            setSelectedLocations([event]);
            setIsColorByDisabled(false);
        }
    };

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

    const MyPlotComponent = ({ plotData, scatterColors }: { plotData: any[]; scatterColors: any }) => (
        <div className="flex flex-row w-full items-start">
            <div className="w-full flex " ref={plotContainerRef}>
                {loaded && (
                    <Plot
                    data={plotData}
                    config={config}
                    layout={{
                        barmode: 'stack', // Modo de barras apiladas
                        bargap: 0.1,
                        plot_bgcolor: 'white',
                        yaxis: {
                            title: {
                                text: 'Relative Abundance',
                                font: { 
                                    family: 'Roboto, sans-serif',
                                    size: 18,
                                }
                            }
                        },
                        xaxis: {
                            title: {
                                text: '', // Título para el eje X si es necesario
                                font: { 
                                    family: 'Roboto, sans-serif',
                                    size: 18,
                                }
                            }
                        },
                        width: plotWidth || undefined,
                        height: 700,
                        annotations: [{
                            xref: 'paper',
                            yref: 'paper',
                            x: 1.29, 
                            xanchor: 'left',
                            y: 0.8, // En la parte superior
                            yanchor: 'top',
                            text: `${actualRank.charAt(0).toUpperCase() + actualRank.slice(1)}`, // Título de la leyenda
                            showarrow: false,
                            font: {
                                family: 'Roboto, sans-serif',
                                size: 17, // Tamaño de la fuente
                                color: 'black'
                            }
                        }],
                        showlegend: true,
                        legend: {
                            orientation: "v", // Orientación vertical
                            x: 1.3, // Posición a la derecha del gráfico
                            xanchor: "left",
                            yanchor:"top",
                            y: 0.75, // Centrado verticalmente
                        
                        },
                        margin: { l: 50, r: 50, t: 20, b: 50 } // Asegúrate de dejar suficiente margen a la derecha
                    }}
                />
                )}
            </div>

        </div>);





    useEffect(() => {
        if (otus && selectedGroup) {
            // Filtrar los valores únicos de la columna seleccionada
            const columnIndex = otus?.meta?.columns?.indexOf(selectedGroup);
            console.log("Column index:", columnIndex);
            const uniqueValues: Set<string> = new Set(dataUnique?.meta?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
            const uniqueValuesCheck: Set<string> = new Set(otus?.meta?.data.map((item: { [x: string]: any; }) => item[columnIndex]));

            setValueOptions([...uniqueValues].filter(value => value !== 'null'));

            // Inicializa 'selectedValues' con todos los valores únicos
            setSelectedValues(new Set<string>(uniqueValuesCheck));
        }
    }, [selectedGroup, otus]);

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
    const valueChecks = (
        <div className="mb-5 mt-5">
            {valueOptions?.map((value, index) => (
                <div key={index} className="flex items-center mb-2">
                    <input
                        id={`value-${index}`}
                        type="checkbox"
                        value={value}
                        checked={selectedValues.has(value)}
                        onChange={() => handleValueChange(value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor={`value-${index}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {value}
                    </label>
                </div>
            ))}
        </div>
    );

    const config: Partial<Config> = {
        displaylogo: false,
        responsive: true,
        modeBarButtonsToRemove: [
          'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'zoom3d', 
          'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraDefault3d', 'resetCameraLastSave3d', 
          'hoverClosest3d', 'zoomInGeo', 'zoomOutGeo', 'resetGeo', 'hoverClosestGeo', 'sendDataToCloud', 'hoverClosestGl2d', 'hoverClosestPie', 
          'toggleHover', 'toggleSpikelines', 'resetViewMapbox'
        ],
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
    const selectedDropdownValue = selectedLocations.length === 3 ? selectedLocation : selectedLocations[0];
    const [activeIndexes, setActiveIndexes] = useState([0,1]);

    const onTabChange = (e : any) => {
        setActiveIndexes(e.index);  // Actualiza el estado con los índices activos
    };

    const dropdownOptionsColorby = [
        { label: 'Sample Location', value: 'samplelocation' }, // Opción predeterminada
        ...colorByOptions 
          ?.filter(option => (columnOptions as string[])?.includes(option)) // Filtra y mapea según tus criterios
          .map(option => ({
              label: option.charAt(0).toUpperCase() + option.replace('_', ' ').slice(1),
              value: option
          }))
      ];

    const filter = (
        <div className={`flex flex-col w-full rounded-lg  dark:bg-gray-800 `}>
   <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">    
      <AccordionTab header="Group by" className="mb-4">
    
<div>
<Dropdown
      value={theRealColorByVariable}
      options={dropdownOptionsColorby}
      onChange={(e) => setTheRealColorByVariable(e.target.value)}
      optionLabel="label"
      className="w-full"
      />
           
        </div>

        </AccordionTab>
                <AccordionTab header="Filter by">
            <div className="flex xl:flex-col md:flex-row md:flex-wrap xl:flex-nowrap items-left mt-4 mb-4 ">
                <div className="xl:w-full md:w-1/2 md:flex md:flex-row xl:flex-col md:justify-between">
                    <div className="w-full flex flex-col">

                    <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Select a taxonomic rank for display</h3>
     <Dropdown 
            value={selectedRank} 
            options={dropdownOptions} 
            onChange={(e) => setSelectedRank(e.value)} 
            placeholder="Select a Rank"
            className="w-full"
        />
        </div>

                </div>
<Divider layout="vertical" className="md:block xl:hidden" />
                <div className="xl:w-full md:w-2/5 md:flex md:flex-col md:justify-between mt-2">
    <div className="max-w-xs mx-auto flex flex-col items-center mt-5 mb-5">
    <PrimeToolTip target=".topInputText" />                        

    <h3  className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">
        <div className="flex flex-row mt-2">
    Top <AiOutlineInfoCircle className="topInputText ml-2  text-sm mb-1 cursor-pointer text-siwa-blue p-text-secondary p-overlay-badge" data-pr-tooltip="This graph displays the most abundant taxa for each rank"
    data-pr-position="right"
    data-pr-at="right+5 top"
    data-pr-my="left center-2"/>
        </div>
        
 </h3>
    <div className="relative flex items-center max-w-[8rem]">
        <button type="button" id="decrement-button" onClick={() => setNumber(Math.max(1, number - 1))} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-l-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
            {/* SVG para el icono de decremento */}
            <FiMinus />
        </button>
        <input type="text" id="topInput" value={number} onChange={e => setNumber(e.target.value === '' ? 1 : Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))} className="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="999" required />
        <button type="button" id="increment-button" onClick={() => setNumber(Math.min(15, number + 1))} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-r-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
        <GoPlus />
        </button>
    </div>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Number of taxa to display</p>
</div>
 
  </div>
  <Divider className="md:block xl:hidden w-full"/>
  <div className="xl:w-full md:w-1/2 md:flex md:flex-col md:justify-between mb-5">
    <div className="flex flex-col items-left space-x-2 mt-4 mb-4">

                    <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Select a Sample Location (if applicable)</h3>
                    <Dropdown 
            id="location"
            value={selectedDropdownValue}
            options={dropdownLocationOptions}
            onChange={(e) => handleLocationChange(e.value)}
            disabled={availableLocations.length === 1}
            className="w-full"
        />
              


                </div>
</div>
<Divider layout="vertical" className="md:block xl:hidden" />
<div className="xl:w-full md:w-2/5 md:flex md:flex-col md:justify-between">

     
                <div className="mt-4 mb-4">

               
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white my-tooltip whitespace-pre">
        Filtering <span>options <AiOutlineInfoCircle className="text-sm mb-1 cursor-pointer text-siwa-blue inline-block" data-tip data-for="interpreteTip" id="group" /></span>
      </h3>     
                                    <Tooltip
                                        style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "8px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
                                        anchorSelect="#group">
                                        <div className={`prose single-column w-28 z-50`}>
                                            <p>Select options to include in the plot.</p>
                                         
                                        </div>
                                    </Tooltip>
                <ul className="w-full flex flex-wrap items-center content-center justify-around ">

                        <li className="w-48 m-2 mb-1 p-1">
                            <input type="radio" id="samplelocation" name="samplelocation" value="samplelocation" className="hidden peer" required checked={selectedGroup === 'samplelocation'}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                disabled={isColorByDisabled}
                              />
                            <label htmlFor="samplelocation" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${selectedGroup === actualGroup ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} cursor-pointer hover:text-gray-600 hover:bg-gray-100  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full text-center flex justify-center">Sample location</div>
                                </div>
                            </label>
                        </li>
                        {colorByOptions?.map((option, index) => {
  // Solo renderizar el elemento si 'option' está presente en 'columnOptions'
if ((columnOptions as string[])?.includes(option)) {
    return (
      <li className="w-48 m-2 mb-1 p-1" key={index}>
        <input
          type="radio"
          id={option}
          name={option}
          className="hidden peer"
          value={option}
          checked={selectedGroup === option}
          onChange={(e) => setSelectedGroup(e.target.value)}
          disabled={isColorByDisabled}
        />
        <label
          htmlFor={option}
          className={`flex items-center justify-center 
          ${isColorByDisabled
              ? 'cursor-not-allowed'
              : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'
          } w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${selectedGroup === actualGroup ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
        >
          <div className="block">
            <div className="w-full">{(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}</div>
          </div>
        </label>
      </li>
    );
  } else {
    // No retorna nada si 'option' no está en 'columnOptions'
    return null;
  }
})}

                    </ul>
                </div>

            </div>
            <div className="xl:w-full md:w-full">

            <>
            <div className="mt-2 mb-4">
{valueChecks}
            </div>
            </>
             
            </div>

            <Divider/>
</div>
               

            <div className="flex w-full items-center margin-0 justify-center my-10">
          <Button
            onClick={applyFilters}
            loading={filterPeticion}
            iconPos="right"
            icon="pi pi-check-square"
            loadingIcon="pi pi-spin pi-spinner" 
            className=" max-w-56  justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
            label="Update"
          />
        </div>
        </AccordionTab>
            </Accordion>

        </div>);


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
  
  const title = ( <div> Relative Abundance of {actualRank?.charAt(0).toUpperCase() + actualRank.slice(1)} {Location.length === 3 ? " by Location" : " in " + (Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) + (actualGroup === "samplelocation" ? "" : " by " + actualGroup.charAt(0).toUpperCase() + actualGroup.slice(1).replace('_', ' ')))}</div>  );

    return (
        <div className="w-full h-full">
            <SidebarProvider>
            <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home} />}>
                {isLoaded ? (
                    <div className="flex flex-col w-11/12 mx-auto">

                        <div className="flex flex-row w-full text-center justify-center items-center">
                            <h1 className="text-3xl my-5 mx-2">{configFile?.taxonomic_composition?.title ?? "Taxonomy diversity"}</h1>
                            {configFile?.taxonomy?.interpretation && (
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
                        </Tooltip>
                        </div>



                        <div className="px-6 py-8">
                            <div className={`prose ${configFile?.taxonomic_composition?.text ? 'single-column' : 'column-text'}`}>
    <p className="text-gray-700 text-justify text-xl">
        {configFile?.taxonomic_composition?.text}
    </p>
</div>

<div className="mt-8">
            <Accordion activeIndex={activeIndex}>
              
                <AccordionTab header={<>  Hierarchical visualization</>}>

                <div className="flex flex-row flex-wrap "><div className="w-full xl:w-1/2">          <p className="text-gray-700 text-justify text-lg mt-2 mb-2 font-light">
                        This tab showcases a Sunburst Chart representing the taxonomic composition of a biological sample. The chart offers a compelling visualization of the nested hierarchical structure of taxonomic classifications, such as domains, kingdoms, phyla, classes, orders, families, genera, and species.
                    </p>
                    <p className="text-gray-700 text-justify text-lg mt-2 mb-2 font-light">
                        Each concentric ring in the chart represents a different taxonomic level, starting from the highest level of classification in the innermost ring and moving to more specific classifications in the outer rings. This arrangement helps visualize the relative proportions of each taxonomic category within the sample, providing insights into the biological diversity and possible ecological relationships within the sample.
                    </p>
                    <p className="text-gray-700 text-justify text-lg mt-2 mb-2 font-light">
                        By hovering over any section of the chart, you can view detailed information about that taxonomic segment, including its name, the percentage of the total sample it represents, and its relationship to adjacent segments. This interactive feature allows for an in-depth exploration of the complex taxonomic landscape, making it easier to identify predominant or rare taxa within the sample.
                    </p>
                    <p className="text-gray-700 text-justify text-lg mt-2 mb-2 font-light">
                        The Sunburst Chart is particularly useful in ecological and genetic research, where understanding the distribution and diversity of organisms is crucial. Researchers and educators can utilize this visualization to discuss and analyze patterns of biodiversity, evolutionary relationships, or the impact of environmental changes on taxonomic distributions.
                    </p></div>
                    <iframe className="w-full xl:w-1/2 mt-5 mb-5"
                        src="/api/components/innerHtml" 
                        frameBorder="0" 
 
                        height="500px" 
                        allowFullScreen
                        title="Taxonomy Composition Sunburst Chart">
                    </iframe>
                    </div>  
                      
                </AccordionTab>
            </Accordion>
        </div>

                            </div>

                        <div className="flex flex-row">
                            <GraphicCard filter={filter} legend={""} title={title} orientation="horizontal" slug={params.slug}>
                                {plotData.length > 0 ? (

                                    <div className="w-full ml-4">
                                        <MyPlotComponent plotData={plotData} scatterColors={scatterColors} />
 <div className="w-full flex flex-row ">
              
                                <div className="px-6 py-8 w-full" >
                                    <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        {Object.entries(configFile?.taxonomic_composition?.graph || {}).map(([key, value]) => {
                                        if (key === "samplelocation" && actualGroup==="samplelocation"  && typeof value === 'string') {
                                        
                                            return (
                                              <div key={key} className="col-span-2">
                                                <p className="text-gray-700 m-3 text-justify text-xl">{value}</p>
                                              </div>
                                            );
                                          }
                                            return null;  // No renderizar nada si no se cumplen las condiciones
                                        })}
                                    </div>
                                    <div className="prose flex flex-row flex-wrap">
                                        {Object.entries(configFile?.taxonomic_composition?.graph || {}).map(([key, value]) => {
                                            if (key === actualGroup && key !== "samplelocation") {
                                                if (typeof value === 'string' && value !== null) {
                                                 

                                                    return (  <div key={key} className="col-span-2">
                                                    <p className="text-gray-700 m-3 text-justify text-xl">{value}</p>
                                                  </div>);
                                                } 
                                            }
                                            return null;
                                        })}
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
    );
}


