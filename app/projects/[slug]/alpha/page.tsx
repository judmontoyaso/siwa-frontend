"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, Suspense, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Spinner from "@/app/components/pacmanLoader";
import Loading from "@/app/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { renderToStaticMarkup } from "react-dom/server";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { AuthProvider, useAuth } from "@/app/components/authContext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FiActivity, FiBarChart } from "react-icons/fi";
import { RiExchangeFundsLine } from "react-icons/ri";
import { Divider } from "primereact/divider";
import { PopupProvider, usePopup } from "@/app/components/context/popupContext";
import { Card } from "primereact/card";
import Plotly, { Config } from "plotly.js";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useRouter } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import Link from "next/link";
import { MenuItem } from "primereact/menuitem";
import { root } from "postcss";


export default function Page({ params }: { params: { slug: string } }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [plotData, setPlotData] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const { user } = useUser();
    const [otus, setOtus] = useState<any>();
    const [dataUnique, setDataUnique] = useState<any>();
    const [selectedLocations, setSelectedLocations] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("samplelocation");
    const [shannonData, setShannonData] = useState([]);
    const [currentLocation, setCurrentLocation] = useState('');
    const [colorByOptions, setColorByOptions] = useState([]);
    const [colorBy, setColorBy] = useState<string>('samplelocation');
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);
    const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
    const newScatterColors: { [key: string]: string } = {}; // Define el tipo explícitamente
    const [configFile, setconfigFile] = useState({} as any);
    // const [selectedColumnRemove, setSelectedColumnRemove] = useState('');
    const [columnOptions, setColumnOptions] = useState([]);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
    const [valueOptions, setValueOptions] = useState<any[]>([]);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [graphType, setGraphType] = useState<any>("boxplot");  // 'boxplot' o 'violin'
    const [filterPeticion, setFilterPeticion] = useState(false);
    const { accessToken, isLoading, error } = useAuth();
    const { isWindowVisible } = usePopup();
    const [layout, setLayout] = useState({});
    const [activeIndexes, setActiveIndexes] = useState([0,1]);

    const [Location, setLocation] = useState<string[]>([
        "cecum",
        "feces",
        "ileum",
    ]);
    const [actualcolumn, setActualcolumn] = useState<string>('samplelocation');
    const [annova, setAnnova] = useState<any>();
    const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');


    const router = useRouter();

    const items = [
        { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
        { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
      { label: 'Richness', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/alpha`}>{item.label}</Link> },
    ];
  
    const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };
  


    const colors = [
        "#092538", // Azul oscuro principal
        "#34675C", // Verde azulado más claro
        "#2E4057", // Azul petróleo oscuro

        // Amarillos y naranjas
        "#FEF282", // Amarillo claro principal
        "#F6C324", // Amarillo mostaza
        "#415a55", // Verde azulado oscuro (color adicional que querías incluir)
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

    const [colorOrder, setColorOrder] = useState<string[]>([]);

    const colorPalettes = {
        samplelocation: ["#074b44", "#017fb1", "#f99b35"],
        treatment: ["#035060", "#f99b35", "#4e8e74"],
        timepoint: ["#8cdbf4", "#f7927f", "#f7e76d"],

    };

    useEffect(() => {
        if (theRealColorByVariable && colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]) {
            setColorOrder(colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]);
        }
    }, [theRealColorByVariable]);


    // Función para aleatorizar la paleta de colores
    const shuffleColors = () => {
        let shuffled = colors
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        setColorOrder(shuffled);
    };

    //   useEffect(() => {
    //     shuffleColors();  // Aleatoriza los colores al montar y cada vez que cambian los datos
    //   }, [otus]);

    const fetchConfigFile = async (token: any) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/configfile/${params.slug}`, {
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
            setconfigFile(configfile.configFile);
            setColorByOptions(configfile.configFile.columns); // Actualiza el estado con las nuevas opciones
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
        }
    };

    const fetchData = async (token: any, columnIndex: number | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/alpha/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "samplelocation": selectedLocations,
                    "column": selectedColumn,
                    "columnValues": selectedColumn === 'samplelocation' ? selectedLocations : [...selectedValues],
                    "nickname": user?.nickname,
                    "colannova": theRealColorByVariable
                }),

            }
            );
            // if (response.status === 500 && accessToken !== undefined) {
            //     toast.warn('The data needs to be loaded again!', {
            //         position: "top-center",
            //         autoClose: 4000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         theme: "light",
            //         transition: Bounce,
            //     });
            //     setTimeout(() => { window.location.href = "/"; }, 5000);
            //     throw new Error("Respuesta no válida desde el servidor");
            // }
            const result = await response.json();
            console.log('result:', result);
            console.log(otus)
            const locations = new Set(
                result.data.data.map((item: any[]) => item[1])
            );
            const uniqueLocations = Array.from(locations) as string[];

            setAvailableLocations(uniqueLocations);
            console.log('locations:', uniqueLocations);
            setDataUnique(result);
            setColumnOptions(result.data.columns);
            setValueOptions(result.data.data);


            setOtus(result);
            setAnnova(result.significance)
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };


    const fetchDataFilter = async (token: any, columnIndex: number | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/alpha/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "samplelocation": selectedLocations,
                    "column": selectedColumn,
                    "columnValues": selectedColumn === 'samplelocation' ? selectedLocations : [...selectedValues],
                    "nickname": user?.nickname,
                    "colannova": theRealColorByVariable
                }),

            }
            );
            // if (response.status === 500 && accessToken !== undefined) {
            //     toast.warn('The data needs to be loaded again!', {
            //         position: "top-center",
            //         autoClose: 4000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         theme: "light",
            //         transition: Bounce,
            //     });
            //     setTimeout(() => { window.location.href = "/"; }, 5000);
            //     throw new Error("Respuesta no válida desde el servidor");
            // }
            const result = await response.json();
            console.log('result:', result);
            console.log(otus)

            setOtus(result);
            setAnnova(result.significance)
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };



    const fetchAnnova = async (token: any) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/processanova/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "samplelocation": selectedLocations,
                    "column": theRealColorByVariable,
                    "columnValues": selectedColumn === 'samplelocation' ? selectedLocations : [...selectedValues],
                    "nickname": user?.nickname,
                }),

            }
            );
            // if (response.status === 500 && accessToken !== undefined) {
            //     toast.warn('The data needs to be loaded again!', {
            //         position: "top-center",
            //         autoClose: 4000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         theme: "light",
            //         transition: Bounce,
            //     });
            //     setTimeout(() => { window.location.href = "/"; }, 5000);
            //     throw new Error("Respuesta no válida desde el servidor");
            // }
            const result = await response.json();
            console.log('result:', result);
            if (!otus && otus !== undefined) {
                setOtus((prevOtus: any) => ({
                    ...prevOtus,
                    significance: result.significance
                }));
            }

            setAnnova(result.significance)
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };


    const fetchProjectIds = async (result: any, columnIndex: number | undefined) => {

        // Usa el token pasado como argumento
        try {
            let colorIndex = 0;
            // Filtrar los datos basados en la locación seleccionada, si se ha seleccionado una
            const filteredData = result?.data?.data?.filter((item: string[]) => selectedLocations.includes(item[1])) || [];
            const groupedData = filteredData.reduce(
                (
                    acc: {
                        [x: string]: {
                            y: any;
                            text: string[];
                            marker: { color: string };

                        };
                    },
                    item: any[]
                ) => {


                    const location = item[1];
                    const alphaShannon = item[2];


                    const sampleId = item[0];
                    // Verifica si la locación actual debe ser incluida
                    if (selectedLocations.includes(location)) {

                        if (!acc[location]) {
                            acc[location] = {
                                y: [], text: [], marker: { color: colorOrder[colorIndex % colorOrder.length] }
                            };

                        }
                        acc[location].y.push(alphaShannon);
                        acc[location].text.push(`Sample ID: ${sampleId}`);
                    }

                    return acc;
                },
                {}
            );
            const shannonData: any[] = processData(filteredData.filter((data: { name: null; }) => data.name !== "null"), columnIndex || 1);
            setShannonData(shannonData as never[]);
            setPlotData(
                Object.keys(groupedData).map((location) => ({
                    ...groupedData[location],
                    type: "box",
                    name: location,
                    marker: { color: newScatterColors[colorIndex] }
                }))
            );
            console.log('shannonData:', shannonData);
            setIsLoaded(true);
            setFilterPeticion(false);
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setFilterPeticion(false);
        }
    };


    const getColorForValue = (value: string, colorMap: { [key: string]: string }) => {
        if (!colorMap[value]) {
            colorMap[value] = colorOrder[Object.keys(colorMap).length % colorOrder.length];
        }
        return colorMap[value];
    };



    const fetchProjectIdsFiltercolor = async (colorByVariable: string) => {
        // Usa el token pasado como argumento
        try {
            let colorIndex = 0;
            // Filtrar los datos basados en la locación seleccionada, si se ha seleccionado una
            const filteredData = otus?.data.data.filter((item: string[]) => selectedLocations.includes(item[1])) || [];
            const groupedData = filteredData.reduce(
                (
                    acc: {
                        [x: string]: {
                            y: any;
                            text: string[];
                            marker: { color: string };

                        };
                    },
                    item: any[]
                ) => {


                    const location = item[1];
                    const alphaShannon = item[2];


                    const sampleId = item[0];
                    // Verifica si la locación actual debe ser incluida
                    if (selectedLocations.includes(location)) {

                        if (!acc[location]) {
                            acc[location] = {
                                y: [], text: [], marker: { color: colorOrder[colorIndex % colorOrder.length] }
                            };

                        }
                        acc[location].y.push(alphaShannon);
                        acc[location].text.push(`Sample ID: ${sampleId}`);
                    }

                    return acc;
                },
                {}
            );
            const shannonData: any[] = processData(filteredData.filter((data: { name: null; }) => data.name !== "null"), otus?.data?.columns.indexOf(colorByVariable) || 1);
            setShannonData(shannonData as never[]);
            setPlotData(
                Object.keys(groupedData).map((location) => ({
                    ...groupedData[location],
                    type: "box",
                    name: location,
                    marker: { color: newScatterColors[colorIndex] }
                }))
            );
            console.log('shannonData:', shannonData);
            setIsLoaded(true);
            setFilterPeticion(false);
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setFilterPeticion(false);
        }
    };




    useEffect(() => { fetchProjectIdsFiltercolor(theRealColorByVariable) }, [theRealColorByVariable, otus]);


    const handleGroupChange = (value: string) => {
        setTheRealColorByVariable(value);
        fetchProjectIdsFiltercolor(value);
    };

    const processData = (data: any[], index: number): any[] => {
        let colorIndex = 0;
        if (!Array.isArray(data)) {
            console.error('Expected an array for data, received:', data);
            return [];
        }
        data = data.filter(item => item[index] !== null)
        const result = data.reduce((acc, item) => {
            const location = item[1];
            const value = item[index];
            if (value !== null) {
                const key = `${location}-${value}`;

                if (!acc[key]) {
                    acc[key] = {
                        y: [], text: [], name: `${value === undefined ? location : value}`, marker: { color: colorOrder[colorIndex % colorOrder.length] }
                    };
                    newScatterColors[value] = colorOrder[colorIndex % colorOrder.length]; // Actualiza la copia con el nuevo color
                    colorIndex++;

                }

                acc[key].y.push(item[2]); // Asumiendo que el valor de interés está en el índice 9
                acc[key].text.push(`Sample ID: ${item[0]}`);
            } setScatterColors(newScatterColors);
            return acc;
        }, {});

        // Convertir el objeto resultante en un arreglo de sus valores
        return Object.values(result);
    };

    const updatePlotWidth = () => {

        if (plotContainerRef.current) {
            setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);
            console.log(plotWidth)
            console.log(plotContainerRef.current)
            setLoaded(true)

        };
    };
    const observedElementId = 'plofather';
    useEffect(() => { console.log("isWindowVisible", isWindowVisible) }, [isWindowVisible]);
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
      }, [window.innerWidth, isWindowVisible, document?.getElementById('plofather')?.offsetWidth]);


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
        console.log(isWindowVisible)
    }, [otus, isWindowVisible]);


    // useEffect(() => {
    //     updatePlotWidth(); // Establece el ancho inicial

    // }, []);

    // Manejar cambio de locación
    useEffect(() => {
        if (otus && currentLocation) {
            const filteredData = otus?.data?.data?.filter((item: string[]) => selectedLocations.includes(item[1])) || [];
            processData(filteredData, Number(selectedColumn)); // Fix: Convert selectedColumn to a number
        } else if (otus) {
            processData(otus?.data?.data?.data, Number(selectedColumn)); // Fix: Convert selectedColumn to a number
        }
    }, [currentLocation, otus]);

    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchConfigFile(accessToken);
    }, [accessToken]);

    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchData(accessToken, columnIndex).then((result) => { fetchProjectIds(result, columnIndex) })
    }, [accessToken, user?.nickname]);

    useEffect(() => {
        if (selectedLocations.length === 3) {
            setIsColorByDisabled(true); // Ocultar el select de tratamiento si se selecciona 'All'
        } else {
            setIsColorByDisabled(false); // Mostrar el select de tratamiento cuando se selecciona una location específica
        }
    }, [Location]);

    const handleLocationChange = (event: any) => {
        if (event === 'all') {
            setSelectedLocations(['cecum', 'feces', 'ileum']);
            setSelectedColumn('samplelocation'); // Actualiza selectedColumn a 'none' para reflejar la selección por defecto
            setIsColorByDisabled(true); // Ocultar el select de tratamiento si se selecciona 'All'

        } else {
            setSelectedLocations([event]);
            setIsColorByDisabled(false); // Mostrar el select de tratamiento cuando se selecciona una location específica
        }
    };

    const handleLocationChangeColorby = (event: any) => {
        setSelectedColumn(event.target.value);

    };

    // Función para aplicar los filtros seleccionados
    const applyFilters = (event: any) => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchDataFilter(accessToken, columnIndex).then((result) => { fetchProjectIds(result, columnIndex) })
        setLocation(selectedLocations);
        console.log('filter', typeof (selectedValues), selectedValues)
        setActualcolumn(selectedColumn);
        setFilterPeticion(true);

    };

    useEffect(() => {
        if (otus && selectedColumn) {
            // Filtrar los valores únicos de la columna seleccionada
            const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
            const uniqueValues: Set<string> = new Set(dataUnique?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
            const uniqueValuesCheck: Set<string> = new Set(otus?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));

            setValueOptions([...uniqueValues].filter(value => value !== 'null'));

            // Inicializa 'selectedValues' con todos los valores únicos
            setSelectedValues(new Set<string>(uniqueValuesCheck));
        }
    }, [selectedColumn, otus]);

    const handleValueChange = (value: string) => {
        setSelectedValues(prevSelectedValues => {
            const newSelectedValues = new Set(prevSelectedValues);

            // Si intentamos deseleccionar el último valor seleccionado, no hacemos nada
            if (newSelectedValues.size === 1 && newSelectedValues.has(value)) {
                return prevSelectedValues;
            }

            // Si el valor está presente, lo eliminamos
            if (newSelectedValues.has(value)) {
                newSelectedValues.delete(value);
            } else if (value !== null && value !== 'null') { // Verifica que el valor no sea null antes de añadirlo
                // Si el valor no está presente y no es null, lo añadimos
                newSelectedValues.add(value);
            }

            return newSelectedValues;
        });
    };

    const options = availableLocations.length > 1
        ? [{ label: 'All Locations', value: 'all' }, ...availableLocations.map(location => ({
            label: location.charAt(0).toUpperCase() + location.slice(1),
            value: location
        }))]
        : availableLocations.map(location => ({
            label: location.charAt(0).toUpperCase() + location.slice(1),
            value: location
        }));


    // Componente de checks para los valores de la columna seleccionada
    const valueChecks = (
        <div className="flex flex-col w-full overflow-x-scroll mb-5 mt-5">
            <div className="flex w-full flex-row flex-wrap  overflow-x-scroll items-center justify-center">

                {valueOptions?.filter(value => value !== null).map((value, index) => (
                    <div key={index} className="flex mr-2 ml-2 items-start overflow-x-scroll mb-2">
                        <input
                            id={`value-${index}`}
                            type="checkbox"
                            value={value}
                            checked={selectedValues.has(value)}
                            onChange={() => handleValueChange(value)}
                            className="w-4 h-4 mb-0 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor={`value-${index}`} className="ml-2 mb-2 text-lg font-medium text-gray-900 dark:text-gray-300 overflow-x-scroll">
                            {value}
                        </label>
                    </div>
                ))}
            </div>
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

    useEffect(() => {
        if (availableLocations.length === 1) {
            // Si solo hay una ubicación disponible, selecciónala automáticamente
            const uniqueLocation = availableLocations[0];
            handleLocationChange(uniqueLocation); // Asume que esta función actualiza tanto `selectedLocations` como `currentLocation`
        }
    }, [availableLocations]); // Dependencia del efecto

    const onTabChange = (e : any) => {
        setActiveIndexes(e.index);  // Actualiza el estado con los índices activos
    };

    const dropdownOptionsColorby = [
        { label: 'Sample Location', value: 'samplelocation' },
        {label:'Treatment', value:'treatment'}, // Opción predeterminada
        ...colorByOptions
          ?.filter(option => columnOptions?.includes(option)) // Filtra y mapea según tus criterios
          .map(option => ({
              label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
              value: option
          }))
      ];

    const filter = (
        <div className={`flex flex-col w-full  rounded-lg  dark:bg-gray-800 `}>
   <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">    
      <AccordionTab className="colorby-acordeon" header="Color by">
    

                <div>

                <Dropdown
      value={theRealColorByVariable}
      options={dropdownOptionsColorby}
      onChange={(e) => handleGroupChange(e.target.value)}
      optionLabel="label"
      className="w-full text-sm filtercolorby"
      id="colorby"
      />
          
                </div>
             </AccordionTab>
                <AccordionTab className="filter-acordeon" header="Filter by">
           
                <div className={`tab-content `}>
                    <div className="flex flex-col items-left mt-2 mb-4">
                        <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Select a Sample Location</h3>
                        <Dropdown
                            value={selectedLocations.length > 1 ? 'all' : selectedLocations[0]}
                            options={options}
                            onChange={(e) => handleLocationChange(e.value)}
                            disabled={availableLocations.length === 1}

                        />

                    </div>


                </div>

                <div className=" mt-8 mb-4">

      <h3 className="text-lg font-semibold text-gray-700  my-tooltip "data-tip data-for="interpreteTip" id="group" >
        Filtering <span>options <AiOutlineInfoCircle className="xl:text-lg  text-lg mb-1 cursor-pointer text-siwa-blue inline-block" data-tip data-for="interpreteTip" id="group" /></span>
      </h3>     
                                    <Tooltip
                                        style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "8px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
                                        anchorSelect="#group">
                                        <div className={`prose single-column w-28 z-50`}>
                                            <p>Select options to include in the plot.</p>
                                         
                                        </div>
                                    </Tooltip>
      
      
                     <ul className="w-full flex flex-wrap items-center content-center justify-around mt-2 ">
                        <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2  p-1">
                            <input type="radio" id="samplelocation" name="samplelocation" value="samplelocation" className="hidden peer" required checked={isColorByDisabled ? true : selectedColumn === 'samplelocation'}
                                onChange={handleLocationChangeColorby}
                                disabled={isColorByDisabled} />
                            <label htmlFor="samplelocation" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${selectedColumn === actualcolumn ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} cursor-pointer hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full text-center flex justify-center">Sample location</div>
                                </div>

                            </label>
                        </li>
                        <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2  p-1">
                            <input type="radio" id="treatment" name="treatment" value="treatment" className="hidden peer" checked={isColorByDisabled ? false : selectedColumn === 'treatment'}
                                onChange={handleLocationChangeColorby}
                                disabled={isColorByDisabled} />
                            <label htmlFor="treatment" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${selectedColumn === actualcolumn ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"}  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full">Treatment</div>
                                </div>

                            </label>
                        </li>
                        {
                            columnOptions?.includes("age" as never) && (
                                <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2  p-1">
                                    <input type="radio" id="age" name="age" value="age" className="hidden peer" checked={isColorByDisabled ? false : selectedColumn === 'age'}
                                        onChange={handleLocationChangeColorby} />
                                    <label htmlFor="age" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${selectedColumn === actualcolumn ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"}  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                        <div className="block">
                                            <div className="w-full">Age</div>
                                        </div>
                                    </label>
                                </li>
                            )
                        }

                        {colorByOptions.map((option, index) => (
                            <li key={index} className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2  p-1">
                                <input
                                    type="radio"
                                    id={option}
                                    name={option}
                                    className="hidden peer"
                                    value={option}
                                    checked={isColorByDisabled ? false : selectedColumn === option}
                                    onChange={handleLocationChangeColorby}
                                    disabled={isColorByDisabled}
                                />
                                <label
                                    htmlFor={option}
                                    className={`flex items-center justify-center ${isColorByDisabled
                                        ? 'cursor-not-allowed'
                                        : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'
                                        } w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColumn ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"}   dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                                >
                                    <div className="block">
                                        <div className="w-full">{(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}</div>
                                    </div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>


                <>

                    <div className=" mt-4">

                        {valueChecks}
                    </div>
                </>


                <Divider className="mt-0"/>
                <div className="flex w-full items-center margin-0 justify-center my-4">
                    <Button
                        onClick={applyFilters}
                        loading={filterPeticion}
                        iconPos="right"
                        icon="pi pi-check-square"
                        loadingIcon="pi pi-spin pi-spinner"
                        className=" max-w-56 justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
                        label="Update"
                    />
                </div>

      

          
          
            </AccordionTab>
            </Accordion>
        </div>
    );



    useEffect(() => {


        setLocation(availableLocations.length > 1 ? selectedLocations : [availableLocations[0]]);
    }, [params.slug, shannonData]);

    const title = (
        <div>
            Shannon Diversity {Location?.length === 3 ? " in All Locations" : " in " + Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) + (actualcolumn !== "samplelocation" ? (" by " + actualcolumn.charAt(0).toUpperCase() + (actualcolumn as string).replace('_', ' ').slice(1)) : "")}
        </div>

    )
    type ShannonData = {
        name: string;
        // Add other properties as needed
    };

    type ScatterColors = {
        [key: string]: string;
        // Add other properties as needed
    };

    // Componente de leyenda modificado para usar scatterColors para asignar colores consistentemente
    const CustomLegend = ({ shannonData, scatterColors }: { shannonData: ShannonData[]; scatterColors: ScatterColors }) => (
        <div className="flex w-full flex-wrap items-start" style={{ marginLeft: '5px' }}>
            {shannonData
                .filter(entry => entry.name !== "null") // Filtra las entradas donde name no es null
                .map((entry, index) => ({
                    ...entry,
                    color: scatterColors[entry.name],
                }))
                .map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                        <div className="rounded-full" style={{ width: '10px', height: '10px', backgroundColor: scatterColors[entry.name], marginRight: '10px' }}></div>
                        <div className="text-sm text-gray-500">{entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}</div>
                    </div>
                ))}
        </div>
    );

    const [annotations, setAnnotations] = useState<any[]>([]);

    const maxYValueForLocation = (locationValue: string, data: any) => {
        // Asegurarse de que 'data' y 'data.columns' existan
        if (!data || !data.columns) {
            return 0;
        }

        // Encontrar el índice para la columna especificada por 'selectedColumn' y para 'alphashannon'
        const locationColumnIndex = data.columns.indexOf(selectedColumn);
        const alphashannonIndex = data.columns.indexOf('alphashannon');

        // Asegurarse de que los índices sean válidos
        if (locationColumnIndex === -1 || alphashannonIndex === -1) {
            return 0;
        }

        // Filtrar los datos para los que el valor de la columna 'selectedColumn' coincida con 'locationValue'
        const filteredData = data.data.filter((item: any[]) => item[locationColumnIndex] === locationValue && item[locationColumnIndex] !== "null");

        // Extraer los valores de 'alphashannon' para los datos filtrados
        const values = filteredData.map((item: any[]) => item[alphashannonIndex]);

        // Encontrar y devolver el valor máximo de 'alphashannon'
        return Math.max(...values.filter((value: any) => typeof value === 'number'));
    };


    //     useEffect(() => {

    //         const significanceEntries = Object.entries(otus?.significance || {});

    //         const annotations = significanceEntries.map(([locationValue, significance]) => {
    //             // Calcula la posición 'x' para la ubicación actual basándose en 'selectedLocations'
    //             const xPosition = selectedLocations.indexOf(locationValue);

    //             return {
    //                 x: locationValue, // Usar 'xPosition' para reflejar la posición calculada
    //                 y: maxYValueForLocation(locationValue, otus?.data) + (graphType === "boxplot" ? 0.5 : 4),
    //                 text: significance, // Convertir 'significance' a cadena
    //                 xref: 'x',
    //                 yref: 'y',
    //                 showarrow: false,
    //                 ax: 0,
    //                 ay: -40,
    //                 font: { size: 18 }
    //             };
    //         });
    // console.log(annotations)
    //         setAnnotations(annotations as never[]);
    //     }, [graphType, otus?.significance, theRealColorByVariable]);

    const calculateMaxAlphaShannon = () => {
        if (!otus?.data) return 0;

        const alphashannonIndex = otus?.data?.columns.indexOf('alphashannon');
        if (alphashannonIndex === -1) {
            console.error('Column "alphashannon" not found in the data columns.');
            return 0;
        }

        const alphashannonValues = otus?.data?.data?.map((entry: { [x: string]: any; }) => entry[alphashannonIndex]);
        const filteredValues = alphashannonValues.filter((value: number) => typeof value === 'number' && !isNaN(value));

        if (filteredValues.length === 0) {
            console.error('No valid values found for column "alphashannon".');
            return 0;
        }

        const maxAlphaShannon = Math.max(...filteredValues);
        Math.round(maxAlphaShannon)
        return maxAlphaShannon;
    };

    // Calcula el máximo de 'alphashannon'
    const maxYValueForLocationShannon = calculateMaxAlphaShannon();
    // Calcula el rango del eje y sumando uno al máximo de 'alphashannon'
    const yAxisRange = [0, maxYValueForLocationShannon + 5];

    console.log('Max alpha shannon:', yAxisRange);

    const legend = (<div className="w-full flex flex-row overflow-x-scroll max-h-full  justify-center mt-5 items-center">
        <div className="">
            {/* <h2 className=" text-base text-gray-700 w-full font-bold mr-1">{actualcolumn === "samplelocation" ? "Sample location" : actualcolumn}</h2> */}
        </div>
        <div className=" flex flex-col w-auto">
            <CustomLegend shannonData={shannonData} scatterColors={scatterColors} />
        </div>
    </div>)

    function calculateAnnotations() {
        console.log(otus)
        const significanceEntries = Object.entries(annova || {});
        console.log(significanceEntries)
        const annotations = significanceEntries.map(([locationValue, significance]) => {
            const xPosition = selectedLocations.indexOf(locationValue);
            return {
                x: locationValue,
                y: 11.2 + (graphType === "boxplot" ? 0.5 : 4),
                text: significance,
                xref: 'x',
                yref: 'y',
                showarrow: false,
                ax: 0,
                ay: -40,
                font: { size: 18 }
            };
        });

        // Aplicar el filtro de valores únicos
        return annotations
    }

    useEffect(() => { console.log("annotations", annotations) }, [annotations]);


    useEffect(() => {
        // Asegúrate de que 'fetchAnnova' y 'calculateAnnotations' estén definidas correctamente.
        // 'fetchAnnova' debe ser una función que retorne una promesa y 'calculateAnnotations' debe ser capaz de calcular las anotaciones basadas en los datos obtenidos.

        const fetchAndCalculateAnnotations = async () => {
            try {
                // Obtenemos los datos desde fetchAnnova, que se espera que retorne una promesa con los datos necesarios para calcular anotaciones.
                const annovaData = await fetchAnnova(accessToken);
                console.log(annovaData)




            } catch (error) {
                console.error("Failed to fetch Annova data:", error);
            }
        };

        // Invocamos la función asincrónica dentro de useEffect.
        fetchAndCalculateAnnotations();
    }, [theRealColorByVariable, accessToken]);

    useEffect(() => {
        const newAnnotations = calculateAnnotations(); // Pasamos los datos directamente a la función.
        console.log(newAnnotations)
        setAnnotations(newAnnotations as never[]);
    }, [annova]);






    // Dependencias incluyen las variables que puedan afectar la petición de datos.
    // Solo reacciona a cambios en 'theRealColorByVariable'

    // useEffect(() => {
    //     const newLayout = {
    //         width: plotWidth || undefined,
    //         height: 600,
    //         showlegend: true,
    //         legend: {
    //             orientation: "h",
    //             x: 0.5,
    //             xanchor: "center",
    //             y: 1.1,
    //             yanchor: "top",   
    //         },
    //         xaxis: {
    //             showticklabels: false
    //         },
    //         // annotations: annotations, // Usar 'annotations' del estado
    //         yaxis: graphType === "boxplot" ? { range: yAxisRange } : { range: [yAxisRange[0], yAxisRange[1] + 5] },
    //         margin: {
    //             l: 20, r: 10,
    //             t: 60,
    //             b: 50
    //         }
    //     };
    //     setLayout(newLayout);
    // }, [isWindowVisible, graphType, plotWidth, shannonData, annotations]); // 'annotations' añadido aquí para re-renderizar cuando cambian

    const shouldShowText = annotations && annotations.length > 0;


    useEffect(() => {

        // if (annotations.length > 0) {
        //     annotations.push({
        //         text: '* Each letter indicates whether there are statistically significant differences between each group.',
        //         xref: 'paper',
        //         yref: 'paper',
        //         x: 0,
        //         xanchor: 'left',
        //         y: -0.1, // Ajusta esta posición según necesites
        //         yanchor: 'top',
        //         showarrow: false,
        //         font: {
        //             size: 10
        //         }
        //     });
        // }
        // Calcula el máximo de 'alphashannon'
        const maxYValueForLocationShannon = calculateMaxAlphaShannon();
        // Calcula el rango del eje y sumando uno al máximo de 'alphashannon'
        const yAxisRange = [0, 15];
        console.log('Max alpha shannon:', yAxisRange);
        const newLayout = {
            width: plotWidth || undefined,

            resposive: true,
            showlegend: true,
            legend: {
                orientation: "h",
                x: 0.5,
                xanchor: "center",
                y: 1.1,
                yanchor: "top",
            },
            xaxis: {
                showticklabels: false
            },
            annotations: annotations, // Usar 'annotations' del estado
            autosize: true,
            yaxis: graphType === "boxplot" ? { range: yAxisRange } : { range: [yAxisRange[0], yAxisRange[1] + 5] },
            margin: {
                l: 20, r: 10,
                t: 60,
                b: 10
            }
        };
        setLayout(newLayout);

    }, [otus, annotations, window.innerWidth, document?.getElementById('plofather')?.offsetWidth]); // 'annotations' añadido aquí para re-renderizar cuando cambian

    const MyPlotComponent = ({ shannonData, scatterColors }: { shannonData: ShannonData[]; scatterColors: ScatterColors }) => (
        <div className="flex flex-row w-full items-center">

            <div className="w-full" ref={plotContainerRef}>
                {loaded && (
                    <>
                        <div className="flex w-full justify-end mb-5">
                            <div className="flex items-center">

                                <Button
                                    className=" p-button-rounded p-button-outlined p-button-sm"
                                    onClick={() => setGraphType(graphType === "boxplot" ? "violin" : "boxplot")}
                                    data-tip data-for="botoninterpreteTip" id="botoninterpreteTip"
                                ><RiExchangeFundsLine className="text-lg mr-1" /> Change to {graphType === "boxplot" ? "violin" : "boxplot"} view
                                </Button>
                            </div>
                        </div>


                        <div id="plot">
                            <Plot
                                className="alpha"
                                config={config}
                                data={
                                    Object.values(shannonData.filter(entry => entry.name !== "null"))
                                        .map((item, index) => ({
                                            ...(item as object),
                                            type: graphType === "boxplot" ? "box" : "violin",
                                            marker: {
                                                color: colorOrder[index % colorOrder.length],
                                                size: 4, // Ajusta el tamaño del marcador según sea necesario para mejorar la legibilidad
                                            },
                                            boxpoints: graphType === "boxplot" ? "all" : undefined,
                                            points: graphType !== "boxplot" ? "all" : undefined,
                                            jitter: 0.3,  // Controla cuánto se dispersan los puntos en la dirección horizontal; ajusta según necesidad
                                            pointpos: 0,  // Coloca los puntos directamente en el centro de las cajas
                                        }), (
                                            console.log(scatterColors),
                                            console.log(colorOrder)))
                                }
                                divId="plot"

                                layout={
                                    layout}
                            />
                              {shouldShowText && (
                                <div className="flex flex-row  p-3 mx-3 mb-5">
                                <div className="mr-1 font-bold">* </div>
        <div className="text-gray text-sm flex text-justify">
          Each letter indicates whether there are statistically significant differences between each group.
        </div>
        </div>
      )}
                        </div>




                    </>


                )}
            </div>

        </div>

    );

    return (
        <div className="w-full h-full">

            <Suspense fallback={<p>Loading feed...</p>}>
                <SidebarProvider>
                    <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-sm"/>}>
                    
                        {isLoaded ? (
                            <div className="flex flex-col w-11/12  mx-auto">

                                <div className="flex flex-row w-full text-center justify-center items-center">
                                    <h1 className="text-3xl my-5 mx-2"> Richness</h1>
                                    <AiOutlineInfoCircle className="text-xl cursor-pointer text-blue-300" data-tip data-for="interpreteTip" id="interpreteTip" />
                                    <Tooltip
                                        style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "20px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
                                        anchorSelect="#interpreteTip">
                                        <div className={`prose single-column w-96 z-50`}>
                                            {configFile?.alphadiversity?.interpretation ? (
                                                <p className="text-gray-700 text-justify text-xl m-3">
                                                    {configFile.alphadiversity.interpretation}
                                                </p>
                                            ) : (""
                                            )}
                                        </div>
                                    </Tooltip>
                                </div>    <div className="px-6 py-8">
                                    <div className={`prose ${configFile?.alphadiversity?.text ? 'single-column' : 'column-text'}`}>
                                        <p className="text-gray-700 text-justify text-xl">
                                            {configFile?.alphadiversity?.text}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex">
                                    <GraphicCard filter={filter} legend={""} title={title}>
                                        {shannonData.length > 0 ? (
                                            <> <MyPlotComponent shannonData={shannonData as ShannonData[]} scatterColors={scatterColors} />
                                                      <div className="w-full flex flex-row ">
                           
                                    <div className="px-6 py-8" >
                                        <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                            {Object.entries(configFile?.alphadiversity?.graph || {}).map(([key, value]) => {
                                                if (key === "samplelocation" && actualcolumn === "samplelocation" && typeof value === 'string') {

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
                                            {Object.entries(configFile?.alphadiversity?.graph || {}).map(([key, value]) => {
                                                if (key === actualcolumn && key !== "samplelocation") {
                                                    if (typeof value === 'string' && value !== null) {


                                                        return (<div key={key} className="col-span-2">
                                                            <p className="text-gray-700 m-3 text-justify text-xl">{value}</p>
                                                        </div>);
                                                    }
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                            </>
                                           
                                            
                                        ) : (
                                            <SkeletonCard width={"500px"} height={"270px"} />
                                        )}
                                    </GraphicCard>
                                </div>
                      

                            </div>

                        ) : (
                            <div className="w-full h-full"><Spinner /></div>
                        )}
                        <ToastContainer />
                    </Layout>
                </SidebarProvider>
            </Suspense>

        </div>
    );
}



