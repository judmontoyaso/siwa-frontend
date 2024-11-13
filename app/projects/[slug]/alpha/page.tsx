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
import { Tooltip as PTooltip } from 'primereact/tooltip';
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
import RequireAuth from "@/app/components/requireAtuh";
import { Skeleton } from "primereact/skeleton";
import { Checkbox } from 'primereact/checkbox';
import { motion } from "framer-motion";
import { FaQuestionCircle } from "react-icons/fa";
import HelpText from "@/app/components/helpTextDropdown";
import { labelReplacements, colorPalettes } from '@/config/dictionaries';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Toast as PToast} from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Page({ params }: { params: { slug: string } }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [plotData, setPlotData] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const { user } = useUser();
    const [graphHeight, setGraphHeight] = useState(600);

    const [otus, setOtus] = useState<any>();
    const [dataUnique, setDataUnique] = useState<any>();
    const [selectedLocations, setSelectedLocations] = useState<string[]>(['Cecum', 'Feces', 'Ileum']);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("samplelocation");
    const [shannonData, setShannonData] = useState([]);
    const [currentLocation, setCurrentLocation] = useState('');
    const [colorByOptions, setColorByOptions] = useState([]);
    const [colorBy, setColorBy] = useState<string>('samplelocation');
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);
    const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
    const newScatterColors: { [key: string]: string } = {};
    const [configFile, setconfigFile] = useState({} as any);
    const [initialValueOptions, setInitialValueOptions] = useState<Set<string>>(new Set()); // Copia estática de valueOptions
    const [isChartLoaded, setIsChartLoaded] = useState(false);
    const [columnOptions, setColumnOptions] = useState([]);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
    const [valueOptions, setValueOptions] = useState<any[]>([]);
    const [plotWidth, setPlotWidth] = useState(0);
    const plotContainerRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [graphType, setGraphType] = useState<any>("boxplot");
    const [filterPeticion, setFilterPeticion] = useState(false);
    const { accessToken, isLoading, error } = useAuth();
    const { isWindowVisible } = usePopup();
    const [layout, setLayout] = useState({});
    const [activeIndexes, setActiveIndexes] = useState([0, 1]);
    const [title, setTitle] = useState<ReactNode>(<div className="w-full flex items-center justify-center"><Skeleton width="50%" height="1.5rem" /></div>);
    const [tempSelectedColumn, setTempSelectedColumn] = useState<string>(selectedColumn);
    const [tempSelectedValues, setTempSelectedValues] = useState<Set<string>>(new Set([...selectedValues]));
    
    const [Location, setLocation] = useState<string[]>([

    ]);
    const [actualcolumn, setActualcolumn] = useState<string>('samplelocation');
    const [annova, setAnnova] = useState<any>();
    const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');
    const titleRef = useRef(null);
    const plotRef = useRef(null);
    const configTextRef = useRef(null);

    const router = useRouter();

    const items = [
        { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
        { label: 'Richness', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}/alpha`}>{item.label}</Link> },
    ];

    const home = { icon: 'pi pi-home', template: (item: any, option: any) => <Link href={`/`}><i className={home.icon}></i></Link> };
    const [isLoadingPDF, setIsLoadingPDF] = useState(false);
    const toast = useRef<PToast>(null);
    const [colorOrder, setColorOrder] = useState<string[]>([]);
    const generatePDF = async () => {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [210, 297], // tamaño A4 en mm
        });
    
        pdf.setFontSize(18);
        pdf.text(String(title), 20, 30);
    
        let currentYPosition = 50; // Posición Y inicial para la gráfica
    
        // Captura la gráfica
        if (plotRef.current) {
            const plotCanvas = await html2canvas(plotRef.current, { scale: 1.5 });
            const imgWidth = pdf.internal.pageSize.getWidth() - 40;
            const aspectRatio = plotCanvas.width / plotCanvas.height;
            const imgHeight = imgWidth / aspectRatio;
            const plotData = plotCanvas.toDataURL('image/png');
            
            pdf.addImage(plotData, 'JPEG', 20, currentYPosition, imgWidth, imgHeight, undefined, 'FAST');
            
            // Actualiza la posición Y para colocar el texto justo debajo de la gráfica
            currentYPosition += imgHeight + 10;
        }
    
        // Captura el texto de configuración
        if (configTextRef.current) {
            const configCanvas = await html2canvas(configTextRef.current, { scale: 1.5 });
            const imgWidth = pdf.internal.pageSize.getWidth() - 40;
            const aspectRatio = configCanvas.width / configCanvas.height;
            const imgHeight = imgWidth / aspectRatio;
            const configData = configCanvas.toDataURL('image/png');
    
            pdf.addImage(configData, 'JPEG', 20, currentYPosition, imgWidth, imgHeight, undefined, 'FAST');
        }
       
        pdf.save('selected_elements.pdf');

    
    };
    
    const downloadPDF = async () => {
        setIsLoadingPDF(true); // Muestra el indicador de carga
        await generatePDF(); 
        setIsLoadingPDF(false); // Oculta el indicador de carga una vez finalizada

            toast.current?.show({
                severity: 'success', 
                summary: 'PDF Downloaded', 
                detail: 'The PDF file has been downloaded successfully.',
                life: 3000 // Duración de la notificación en milisegundos
            });
       
    };

    useEffect(() => {
        if (theRealColorByVariable && colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]) {
            setColorOrder(colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]);
        }
    }, [theRealColorByVariable, selectedLocations]);




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
            const configfile = await response.json();
            setconfigFile(configfile.configFile);
        
            setColorByOptions(configfile.configFile.columns);
   
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
        }
    };

    const fetchData = async (token: any, columnIndex: number | undefined) => {
        console.log("fetchData")
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

            const locations = new Set(
                result.data.data.map((item: any[]) => item[1])
            );
            const uniqueLocations = Array.from(locations) as string[];

            setAvailableLocations(uniqueLocations);
            setDataUnique(result);
            setColumnOptions(result.data.columns);
            setValueOptions(result.data.data);

            setIsChartLoaded(false);
            setOtus(result);
            setAnnova(result.significance)
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };


    const fetchDataFilter = async (token: any, columnIndex: number | undefined) => {
        console.log("fetchDataFilter")
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
                    "columnValues": selectedColumn === 'samplelocation' ? selectedLocations : [...selectedValues].filter(value => value !== 'null' && value !== null),
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

            setIsChartLoaded(false);
            setOtus(result);
            setAnnova(result.significance)
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    useEffect(() => {
        if (selectedLocations.length === 1 && selectedColumn) {
            const formattedColumn = selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1);
            const key = `SampleLocation_${selectedLocations[0]}_${formattedColumn}`;
    
        } else if (selectedLocations.length > 1 && selectedColumn) {
            const formattedColumn = selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1);
            const key = `SampleLocation_All_${formattedColumn}`;
    
          
        }
    }, [selectedLocations, selectedColumn]);
    
    
    // useEffect para actualizar selectedValues si cambia theRealColorByVariable o selectedLocations
// useEffect para actualizar selectedValues si cambia theRealColorByVariable o selectedLocations
// useEffect(() => {
//     const setAndListAreEqual = (set: Set<string>, list: string[]) => {
//         if (set.size !== list.length) return false;
//         for (const item of list) {
//             if (!set.has(item)) return false;
//         }
//         return true;
//     };

//     if (theRealColorByVariable !== 'samplelocation' && setAndListAreEqual(selectedValues, selectedLocations)) {
//         const columnIndex = otus?.data?.columns.indexOf(theRealColorByVariable);
//         const newValues = new Set(
//             otus?.data?.data.map((item: { [x: string]: any }) => item[columnIndex])
//         );

//         setSelectedValues(newValues);
//     }
// }, [theRealColorByVariable, selectedLocations, otus?.data]);

// // useEffect para enviar los datos actualizados con fetchAnnova después de que selectedValues cambie
// useEffect(() => {
//     const fetchUpdatedAnnova = async () => {
//         if (selectedValues.size > 0 && accessToken) {
//             await fetchAnnova(accessToken);
//         }
//     };
//     fetchUpdatedAnnova();
// }, [selectedValues, accessToken]);

const fetchAnnova = async (token: any) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/processanova/${params.slug}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    samplelocation: selectedLocations,
                    column: theRealColorByVariable,
                    columnValues: selectedColumn === 'samplelocation' ? selectedLocations : [...selectedValues],
                    nickname: user?.nickname,
                    colannova: theRealColorByVariable
                }),
            }
        );

        const result = await response.json();
        if (otus) {
            setOtus((prevOtus: any) => ({
                ...prevOtus,
                significance: result.significance,
            }));
        }
        setIsChartLoaded(false);

        setAnnova(result.significance);
        setIsLoaded(true);
        return result;
    } catch (error) {
        console.error("Error al obtener projectIds:", error);
    }
};



    useEffect(() => {
        if (otus && theRealColorByVariable) {
            // Crear un nuevo mapa de colores al cargar los datos
            const newScatterColors: { [key: string]: string } = { ...scatterColors };  // Inicializa con los colores actuales
            const columnIndex = otus?.data?.columns.indexOf(theRealColorByVariable);

            if (columnIndex !== -1) {
                // Itera sobre los datos para asignar colores únicos a cada valor
                otus?.data?.data.forEach((item: any[]) => {
                    const value = item[columnIndex];
                    if (value && !newScatterColors[value]) {
                        newScatterColors[value] = colorOrder[Object.keys(newScatterColors).length % colorOrder.length];
                    }
                });
            }

            // Solo actualizar el estado si hay cambios en los colores
            if (Object.keys(newScatterColors).length > Object.keys(scatterColors).length) {
                setScatterColors(newScatterColors);
            }
        }
    }, [otus, theRealColorByVariable, colorOrder]);




    const fetchProjectIds = async (result: any, columnIndex: number | undefined) => {
        try {
            let colorIndex = 0;
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
                Object.keys(groupedData)?.sort((a, b) => a.localeCompare(b))?.map((location) => ({
                    ...groupedData[location],
                    type: "box",
                    name: location,
                    marker: { color: newScatterColors[colorIndex] }
                }))
            );
            setIsLoaded(true);
            setFilterPeticion(false);
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setFilterPeticion(false);
        }
    };


    const getColorForValue = (
        value: string,
        column: string,
        colorMap: { [key: string]: string },
        colorOrder: string[]
    ) => {
        if (!colorMap[value]) {
            const columnPalette = colorPalettes[column as keyof typeof colorPalettes] || colorOrder;
            colorMap[value] = columnPalette[Object.keys(colorMap).length % columnPalette.length];
        }
        return colorMap[value];
    };







    const fetchProjectIdsFiltercolor = async (colorByVariable: any) => {
        try {
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
                    const key = `${location}-${item[colorByVariable]}`;

                    if (!acc[location]) {
                        acc[location] = {
                            y: [],
                            text: [],
                            marker: { color: getColorForValue(key, colorByVariable, newScatterColors, colorOrder) }
                        };
                    }

                    acc[location].y.push(alphaShannon);
                    acc[location].text.push(`Sample ID: ${sampleId}`);

                    return acc;
                },
                {}
            );

            const shannonData: any[] = processData(filteredData.filter((data: { name: null; }) => data.name !== "null"), otus?.data?.columns.indexOf(colorByVariable) || 1);
            setShannonData(shannonData as never[]);
            setPlotData(
                Object.keys(groupedData).sort((a, b) => a.localeCompare(b))?.map((location) => ({
                    ...groupedData[location],
                    type: "box",
                    name: location,
                    marker: { color: newScatterColors[location] }
                }))
            );
            setIsLoaded(true);
            setFilterPeticion(false);
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setFilterPeticion(false);
        }
    };






    useEffect(() => { fetchProjectIdsFiltercolor(theRealColorByVariable) }, [theRealColorByVariable, otus, selectedLocations]);


    const handleGroupChange = (value: string) => {
        setTheRealColorByVariable(value);
        fetchProjectIdsFiltercolor(value);
        // setSelectedColumn(value);
    };

    const processData = (data: any[], index: number): any[] => {
        let colorIndex = 0;

        if (!Array.isArray(data)) {
            console.error('Expected an array for data, received:', data);
            return [];
        }


        data = data.filter(item => item[index] !== null); // Filtramos los elementos nulos

        const result = data.reduce((acc, item) => {
            const location = item[1];
            const value = item[index];
            const key = `${location}-${value}`;

            if (!acc[key]) {
                acc[key] = {
                    y: [], text: [], name: `${value === undefined ? location : value}`,
                    marker: { color: scatterColors[key] || colorOrder[colorIndex % colorOrder.length] } // Usar color del estado
                };
                colorIndex++;
            }

            acc[key].y.push(item[2]);
            acc[key].text.push(`Sample ID: ${item[0]}`);

            return acc;
        }, {});


        return Object.values(result);
    };



    

    const updatePlotWidth = () => {

        if (plotContainerRef.current) {
            setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);

            setLoaded(true)

        };
    };
    const observedElementId = 'plofather';
    useEffect(() => {
        // Función para actualizar el ancho de la ventana
        const updatePlotWidth = () => {
            if (plotContainerRef.current) {
                setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);

                setLoaded(true);
            }
        };

        const plofatherElement = document.getElementById('plofather');

        // Añade el event listener cuando el componente se monta
        window.addEventListener('resize', updatePlotWidth);
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

    }, [otus, isWindowVisible]);




    // Manejar cambio de locación
    useEffect(() => {
        if (otus && currentLocation) {
            const filteredData = otus?.data?.data?.filter((item: string[]) => selectedLocations.includes(item[1])) || [];
            processData(filteredData, Number(selectedColumn)); // Fix: Convert selectedColumn to a number
        } else if (otus) {
            processData(otus?.data?.data?.data, Number(selectedColumn)); // Fix: Convert selectedColumn to a number
        }
    }, [currentLocation, otus, selectedLocations]);

    useEffect(() => {
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
            setSelectedLocations(['Cecum', 'Feces', 'Ileum']);
            setSelectedColumn('samplelocation');
            setIsColorByDisabled(true);
            setLocation(['Cecum', 'Feces', 'Ileum']);
            setTheRealColorByVariable("samplelocation");
        } else {
            setSelectedLocations([event]);
            setIsColorByDisabled(false);
            setLocation([event]);
        }


    };


    useEffect(() => {
        // Realizar el fetch de los datos después de actualizar la Location
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchDataFilter(accessToken, columnIndex).then((result) => {
            fetchProjectIds(result, columnIndex);
        });
        console.log("fetchDataFilter use efect 1")
        // Actualizar la columna actual
        setActualcolumn(selectedColumn);
        setFilterPeticion(true);
    }, [selectedLocations, Location]);

    const handleLocationChangeColorby = (event: any) => {
        setTempSelectedColumn(event.target.value); // Actualizar estado temporal
    };

    const applyFilters = () => {
        setInitialValueOptions(new Set(valueOptions));
        setSelectedColumn(tempSelectedColumn);  // Aplicar columna temporal al estado real
        setSelectedValues(tempSelectedValues);  // Aplicar valores temporales al estado real
        setFilterPeticion(true);  // Activar el estado de solicitud de filtro
    };
    
    useEffect(() => {
        if (filterPeticion && selectedColumn && selectedValues.size > 0) {
            const fetchDataAndUpdate = async () => {
                const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
                const result = await fetchDataFilter(accessToken, columnIndex);
                const filteredData = result.data.data.filter((item: any[]) => selectedLocations.includes(item[1]));
                console.log("fetchDataAndUpdate")
                // Mantener colores ya asignados
                const updatedScatterColors = { ...scatterColors };
                filteredData.forEach((item: any[]) => {
                    const value = item[columnIndex];
                    if (value && !updatedScatterColors[value]) {
                        updatedScatterColors[value] = colorOrder[Object.keys(updatedScatterColors).length % colorOrder.length];
                    }
                });
    
                setScatterColors(updatedScatterColors);
                fetchProjectIds(result, columnIndex);
                setFilterPeticion(false);  // Resetear el estado de solicitud de filtro
            };
    
            fetchDataAndUpdate();  // Ejecutar la función asíncrona
        }
    }, [selectedColumn, selectedValues, filterPeticion]);  // Se ejecuta cuando cambian selectedColumn, selectedValues o filterPeticion
    

    useEffect(() => {
        if (otus && tempSelectedColumn) {
            // Filtrar los valores únicos de la columna seleccionada
            const columnIndex = otus?.data?.columns.indexOf(tempSelectedColumn);
            const uniqueValues: Set<string> = new Set(dataUnique?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
            const uniqueValuesCheck: Set<string> = new Set(otus?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));

            setValueOptions([...uniqueValues].filter(value => value !== 'null'));
            setTempSelectedValues(new Set<string>(uniqueValuesCheck));

        }
    }, [otus, tempSelectedColumn]);

    const handleValueChange = (value: string) => {
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
    

    const options = availableLocations.length > 1
        ? [{ label: 'All Locations', value: 'all' }, ...availableLocations.map(location => ({
            label: location.charAt(0).toUpperCase() + location.slice(1),
            value: location
        }))]
        : availableLocations.map(location => ({
            label: location.charAt(0).toUpperCase() + location.slice(1),
            value: location
        }));




        const valueChecks = (
            <div className="flex flex-col w-full mb-5 mt-5">
                <div className="flex w-full flex-wrap items-center justify-start overflow-x-auto">
                    {valueOptions?.filter(value => value !== null && tempSelectedColumn !== "samplelocation").map((value, index) => {
                        const stringValue = String(value);
                        return (
                            <div key={index} className="flex items-center mr-5 mb-3">
                                <Checkbox
                                    inputId={`value-${index}`}
                                    value={value}
                                    checked={tempSelectedValues.has(value)}  // Se usa el estado temporal aquí
                                    onChange={() => handleValueChange(value)}  // Se actualiza el estado temporal
                                    className="p-checkbox"
                                />
                                <label htmlFor={`value-${index}`} className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    {stringValue.charAt(0).toUpperCase() + stringValue.slice(1)}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
        
        
        

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

    useEffect(() => {
        if (availableLocations.length === 1) {
            // Si solo hay una ubicación disponible, selecciónala automáticamente
            const uniqueLocation = availableLocations[0];
            handleLocationChange(uniqueLocation);
        }
    }, [availableLocations]); // Dependencia del efecto

    const onTabChange = (e: any) => {
        setActiveIndexes(e.index);  // Actualiza el estado con los índices activos
    };





const dropdownOptionsColorby = [
    { label: 'Sample Location', value: 'samplelocation' },
    ...colorByOptions
        ?.filter(option => columnOptions?.map(col => String(col).toLowerCase()).includes(String(option).toLowerCase())) // Asegurarse de que ambas listas se tratan como cadenas
        .map(option => ({
            // Reemplazar el label si existe en el diccionario, si no, usar el valor por defecto
            label: labelReplacements[String(option).toLowerCase()] 
                ? labelReplacements[String(option).toLowerCase()] 
                : String(option).charAt(0).toUpperCase() + String(option).replace('_', ' ').slice(1),
            value: String(option).toLowerCase()
        }))
];


// useEffect(() => {
//     if (colorByOptions.length > 0) {
//         setSelectedColumn(colorByOptions[0]); // Configura `selectedColumn` con el primer valor de `columnOptions`
//     }
//     console.log(selectedColumn)
// }, [colorByOptions]);
    
const fixedAccordionTabChange = () => {
  };
  const fixedActiveIndexes = [0, 1];
    const filter = (
        <div className="flex flex-col w-full rounded-lg dark:bg-gray-800">
          <Accordion multiple activeIndex={fixedActiveIndexes} onTabChange={fixedAccordionTabChange} className="filter">
            <AccordionTab className="colorby-acordeon" header="Group by" headerStyle={{fontSize:'1.15rem'}}>
              <div className="flex flex-col items-start m-2">
                <h3 className="mb-2  font-medium text-gray-700 dark:text-white flex items-center" style={{ fontSize: '1.05rem' }}>
                  Select a sample location: 
                  <span className="ml-2">
                    <i
                      className="pi pi-info-circle text-siwa-blue"
                      data-pr-tooltip="This allows you to view all samples locations together, or to focus on only 1: some analysis options are only available when looking at individual locations."
                      data-pr-position="top"
                      id="sampleLocationTooltip"
                    />
                    <PTooltip target="#sampleLocationTooltip"   style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
                    />
                  </span>
                </h3>
                <Dropdown
                  value={selectedLocations.length > 1 ? 'all' : selectedLocations[0]}
                  options={options}
                  onChange={(e) => handleLocationChange(e.value)}
                  disabled={availableLocations.length === 1}
                  className="w-full mb-6 text-sm"
                  placeholder="Choose a location"
                />
              </div>
      
              <div className="flex flex-col items-start mt-2 m-2">
              <div className="flex flex-col items-start mt-2 m-2">
  <div className="flex items-center mb-2">
    <h3 className="font-medium text-gray-700 flex dark:text-white" style={{ fontSize: '1.1rem' }}>
      Select a variable to group:
    </h3>
    <span className="ml-2">
      <i
        className="pi pi-info-circle text-siwa-blue"
        data-pr-tooltip="This changes the way in which the samples are grouped together in the analysis: to use, please select a sample location above, then an available grouping variable."
        data-pr-position="top"
        id="groupByTooltip"
      />
<PTooltip
  target="#groupByTooltip"
  style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
/>
    </span>
  </div>
</div>

                <Dropdown
                  value={selectedLocations.length > 1 ? "samplelocation" : theRealColorByVariable}
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
      
            <AccordionTab className="filter-acordeon" header="Filter by" headerStyle={{fontSize:'1.15rem'}}>
  <div className="mt-2 ml-2 mb-4">
    <div className="flex items-center">
      <h3 className="font-medium text-gray-700 dark:text-white flex items-center" style={{fontSize:'1.1rem'}}>
        Filtering options:
        </h3>
        <span className="ml-2">
        <i
        className="pi pi-info-circle text-siwa-blue"
        data-pr-tooltip=" This changes the samples that are included in the analysis: you can focus on specific subsets of samples by selecting a variable and then the groups within that variable that you wish to include in the analysis.  You can only filter by one variable at a time. "
        data-pr-position="top"
       
          id="filteringTip"
      />
        <PTooltip target="#filteringTip" position="top"   style={{ maxWidth: "350px", width: "350px", whiteSpace: "normal" }}
/>
     </span>
    </div>

    <ul className="w-full flex flex-wrap items-center content-center justify-start mt-2">


      {/* {columnOptions?.includes("samplelocation" as never) && (
        <li className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
          <input
            type="radio"
            id="samplelocation"
            name="samplelocation"
            value="samplelocation"
            className="hidden peer"
            checked={tempSelectedColumn === 'samplelocation'}
            onChange={handleLocationChangeColorby}
          />
          <label
            htmlFor="samplelocation"
            className={`flex items-center justify-center w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${tempSelectedColumn === actualcolumn ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
          >
            <div className="block">
              <div className="w-full">Sample Location</div>
            </div>
          </label>
        </li>
      )} */}
{colorByOptions.map((option: string, index: number) => (
  option = String(option).toLowerCase(),
  <li key={index} className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
    <input
      type="radio"
      id={option}
      name={option}
      className="hidden peer"
      value={option}
      checked={tempSelectedColumn === option}
      onChange={handleLocationChangeColorby}
    />
    <label
      htmlFor={option}
      className={`flex items-center justify-center cursor-pointer hover:text-gray-600 hover:bg-gray-100 w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === tempSelectedColumn ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
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
    disabled={tempSelectedColumn === "samplelocation"}
  />
</div>

</AccordionTab>

          </Accordion>
        </div>
      );
      



    useEffect(() => {


        setLocation(availableLocations.length > 1 ? selectedLocations : [availableLocations[0]]);
    }, [params.slug, availableLocations]);

    useEffect(() => {
        if (Location[0] && Location.length > 0) {
            const newTitle = `Shannon Diversity ${Location.length === 3
                    ? "in All Locations"
                    : "in " + Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) +
                    (theRealColorByVariable !== "samplelocation"
                        ? (" by " + theRealColorByVariable.charAt(0).toUpperCase() + (theRealColorByVariable as string).replace('_', ' ').slice(1))
                        : "")
                }`;
            setTitle(newTitle);
        }
    }, [Location, theRealColorByVariable]);



    type ShannonData = {
        name: string;
    };

    type ScatterColors = {
        [key: string]: string;
    };

    // Componente de leyenda modificado para usar scatterColors para asignar colores consistentemente
    const CustomLegend = ({ shannonData, scatterColors }: { shannonData: ShannonData[]; scatterColors: ScatterColors }) => (
        <div className="flex w-full flex-wrap items-start" style={{ marginLeft: '5px' }}>
            {shannonData
                .filter(entry => entry.name !== "null")
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
    
        // Encontrar el índice para la columna especificada por 'theRealColorByVariable' y para 'alphashannon'
        const locationColumnIndex = data.columns.indexOf(theRealColorByVariable);
        const alphashannonIndex = data.columns.indexOf('alphashannon');
    
        // Asegurarse de que los índices sean válidos
        if (locationColumnIndex === -1 || alphashannonIndex === -1) {
            return 0;
        }
    
        console.log("locationColumnIndex", locationColumnIndex);
    
        // Filtrar los datos, asegurándonos de comparar los valores como cadenas
        const filteredData = data.data.filter((item: any[]) => 
            String(item[locationColumnIndex]) === String(locationValue) && 
            item[locationColumnIndex] !== "null"
        );
    
        console.log("filteredData", filteredData);
    
        // Extraer los valores de 'alphashannon' para los datos filtrados
        const values = filteredData.map((item: any[]) => item[alphashannonIndex]);
    
        console.log("values", values);
    
        // Encontrar y devolver el valor máximo de 'alphashannon'
        return Math.max(...values.filter((value: any) => typeof value === 'number'));
    };
    




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
    const yAxisRange = [0, maxYValueForLocationShannon + 1.5];


    const legend = (<div className="w-full flex flex-row overflow-x-scroll max-h-full  justify-center mt-5 items-center">
        <div className="">
            {/* <h2 className=" text-base text-gray-700 w-full font-bold mr-1">{actualcolumn === "samplelocation" ? "Sample location" : actualcolumn}</h2> */}
        </div>
        <div className=" flex flex-col w-auto">
            <CustomLegend shannonData={shannonData} scatterColors={scatterColors} />
        </div>
    </div>)
    function calculateAnnotations() {
        const significanceEntries = Object.entries(annova || {});

        const annotations = significanceEntries
            .filter(([locationValue, significance]) => locationValue !== null && significance !== null && locationValue != 'null') // Filtrar nulos
            .map(([locationValue, significance]) => {
                // Calcula la posición 'y' para la ubicación actual basándose en el valor máximo de 'alphashannon' en esa categoría
                const maxY = maxYValueForLocation(locationValue, otus?.data);

                console.log("maxY", maxY)
                console.log("locationValue", locationValue)
                return {
                    x: locationValue,
                    y: (graphType === "boxplot" ? 0.8 : 1.2) + maxY,  // Agrega un pequeño offset para que la anotación esté justo por encima del valor máximo
                    text: significance,
                    xref: 'x',
                    yref: 'y',
                    showarrow: false,
                    ax: 0,
                    ay: -40,
                    font: { size: 18 }
                };
            });

        return annotations;
    }

    useEffect(() => {
        const newAnnotations = calculateAnnotations(); // Pasamos los datos directamente a la función.
        setAnnotations(newAnnotations as never[]);
        setIsChartLoaded(true);
    }, [annova, graphType, theRealColorByVariable]);


    useEffect(() => {
        if (valueOptions.length > 0) {
            setInitialValueOptions(new Set(valueOptions)); // Solo actualizar cuando se carguen los datos o se aplique un filtro
        }
    }, [selectedValues]);
    

// Función para buscar el texto basado en la estructura anidada
const findTextInRichness = (config: { Richness: { Analysis: any; }; }, location: string, column: string) => {
    console.log("Searching in Richness:", { location, column });
    const analysis = config?.Richness?.Analysis;
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
// Función para buscar el texto basado en la estructura anidada y claves insensibles a mayúsculas/minúsculas
// Función para buscar el texto basado en la estructura anidada y claves insensibles a mayúsculas/minúsculas
// Función para buscar el texto basado en la estructura anidada y claves insensibles a mayúsculas/minúsculas
const findTextInRichnessNested = (config: { Richness: { Analysis: any; }; }, location: string, formedKey: string, column: string) => {
    const analysis = config?.Richness?.Analysis;
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
  
    // Primero intenta obtener el valor directamente en `formedKey`
    let value = getNestedProperty(locationData, [formedKey]);
    console.log("Value found for formedKey:", value);
  
    // Si no se encuentra, intenta con el `normalizedFormedKey`
    if (!value) {
      // Generar una clave alternativa con los valores ordenados
      const normalizedFormedKey = normalizeFormedKey(formedKey);
      console.log("Attempting to find normalized formedKey:", normalizedFormedKey);
  
      value = getNestedProperty(locationData, [normalizedFormedKey]);
      console.log("Value found for normalized formedKey:", value);
    }
  
    // Si `formedKey` o `normalizedFormedKey` contienen un objeto, verifica si tienen el campo `column`
    if (value && typeof value === 'object') {
      console.log(`formedKey "${formedKey}" contains an object, checking for column "${column}"`);
      value = value[column] || null; // Toma el campo `column` si existe
      console.log("Value for column in formedKey object:", value);
    }
  
    if (typeof value === 'string') {
      console.log("Text found in nested:", value);
      return value;
    }
  
    console.log("No matching text found for the given keys.");
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
  
  

  
  
  
  useEffect(() => {
    const location = selectedLocations.length > 1 ? 'All' : selectedLocations[0];
    console.log("Location and theRealColorByVariable:", { location, theRealColorByVariable });
    console.log("selected locations:", selectedLocations);
    if (location && theRealColorByVariable) {
      const formattedColumn = theRealColorByVariable.charAt(0).toUpperCase() + theRealColorByVariable.slice(1);
      console.log("Formatted column and location:", { formattedColumn, location });
  
      const allValuesSelected = Array.from(initialValueOptions).every(option => selectedValues.has(option));

      if (allValuesSelected) {
        const textForConfig = findTextInRichness(configFile, location, (theRealColorByVariable === "samplelocation" ? "Self" : formattedColumn));
        console.log("Text for all values selected:", textForConfig);
        setTextForConfigKey(textForConfig || "");
      } else if (selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1) !== 'SampleLocation' && selectedValues.size > 0) {
        // Limpia cada valor en valuesArray para eliminar caracteres especiales
        const valuesArray = Array.from(selectedValues)
          .map(value => String(value).replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')); // Elimina caracteres especiales
  
        const formedKey = `${selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1)}_${valuesArray.join('+')}`;
        const normalizedFormedKey = `${selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1)}_${valuesArray.sort().join('+')}`;
  
        console.log("Formed key and normalized formed key:", { formedKey, normalizedFormedKey });
  
        // Intentar buscar con formedKey primero y luego con normalizedFormedKey
        let textForConfig = findTextInRichnessNested(
          configFile,
          location,
          formedKey,
          theRealColorByVariable === selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1) ? "Self" : formattedColumn
        );
        if (!textForConfig) {
          textForConfig = findTextInRichnessNested(
            configFile,
            location,
            normalizedFormedKey,
            theRealColorByVariable === selectedColumn.charAt(0).toUpperCase() + selectedColumn.slice(1) ? "Self" : formattedColumn
          );
        }
  
        console.log("Text for specific filter:", textForConfig);
        setTextForConfigKey(textForConfig || "");
      } else {
        setTextForConfigKey("");
      }
    }
  }, [selectedLocations, selectedColumn, theRealColorByVariable, selectedValues, valueOptions, configFile]);
  
  // Estado para almacenar el texto correspondiente a la clave generada  
  
  // Estado para almacenar el texto correspondiente a la clave generada
  const [textForConfigKey, setTextForConfigKey] = useState("");
  

    useEffect(() => {
        // 'fetchAnnova' debe ser una función que retorne una promesa y 'calculateAnnotations' debe ser capaz de calcular las anotaciones basadas en los datos obtenidos.

        const fetchAndCalculateAnnotations = async () => {
            try {
                const annovaData = await fetchAnnova(accessToken);

            } catch (error) {
                console.error("Failed to fetch Annova data:", error);
            }
        };
        setIsChartLoaded(false);
        // Invocamos la función asincrónica dentro de useEffect.
        fetchAndCalculateAnnotations();
    }, [theRealColorByVariable, accessToken, selectedLocations]);


    const shouldShowText = annotations && annotations.length > 0;


    useEffect(() => {
        const yAxisRange = [0, maxYValueForLocationShannon + 1.5];
        const newLayout = {
            width: plotWidth || undefined,
            height: graphHeight, // Usa el estado para la altura del gráfico
            responsive: true,
            showlegend: true,
            legend: {
                itemclick: false,  // Desactiva el comportamiento de clic en la leyenda
        itemdoubleclick: false,
                orientation: "h",
                x: 0.5,
                xanchor: "center",
                y: 1.1,
                yanchor: "top",
            },
            xaxis: {
                showticklabels: false
            },
            annotations: annotations,
            yaxis: {title:{
                text: `Shannon index`,
                font: {
                  family: 'Roboto, sans-serif',
                  size: 18, // Aumenta el tamaño para mayor énfasis
                },
                standoff: 30,
              }, range: graphType === "boxplot" ? yAxisRange : [yAxisRange[0], yAxisRange[1] + 1.5]},
            margin: {
                l: 70, r: 10,
                t: 60,
                b: 50
            }
        };

        if (layout && Object.keys(layout).length > 0) {
            setLayout((prevLayout) => ({
                ...prevLayout,
                ...newLayout,
            }));        } else {
            setLayout({ width: 500, height: 500 }); // Un valor por defecto para evitar undefined
        }

    }, [otus, annotations, window.innerWidth, document?.getElementById('plofather')?.offsetWidth, graphHeight, graphType, theRealColorByVariable]); // 'annotations' añadido aquí para re-renderizar cuando cambian



    useEffect(() => {
        const updateLayoutWithScale = () => {
            const screenWidth = window.innerWidth;
    
            // Escala dinámica del tamaño del texto basado en el ancho de la pantalla
            const textScale = screenWidth < 600 
            ? 0.6                   // Para pantallas pequeñas (móviles)
            : screenWidth < 1024 
              ? 0.8                 // Para pantallas medianas (tabletas o pantallas pequeñas)
              : screenWidth < 1440 
                ? 1                 // Para pantallas de tamaño estándar (portátiles o monitores)
                : screenWidth < 1920 
                  ? 1.2             // Para pantallas grandes (monitores de mayor resolución)
                  : 1.4;            // Para pantallas muy grandes (monitores UltraWide o 4K)
              
            const yAxisRange = [0, maxYValueForLocationShannon + 1.5];
    
            // Solo actualiza el layout si hay anotaciones definidas
            const newAnnotations = annotations?.length 
                ? annotations.map(annotation => ({
                    ...annotation,
                    font: {
                        size: 12 * textScale, // Escala las anotaciones
                    },
                })) 
                : [];
    
            const newLayout = {
                width: plotWidth || undefined,
                height: graphHeight, // Usa el estado para la altura del gráfico
                responsive: true,
                showlegend: true,
                legend: {
                    itemclick: false,  // Desactiva el comportamiento de clic en la leyenda
        itemdoubleclick: false,
                    orientation: "h",
                    x: 0.5,
                    xanchor: "center",
                    y: 1.1,
                    yanchor: "top",
                    font: {
                        size: 12 * textScale, // Escala la leyenda
                    },
                },
                xaxis: {
                    showticklabels: false
                },
                yaxis: {
                    title: {
                        text: `Shannon Index`,
                        font: {
                            size: 14 * textScale, // Escala el título del eje y
                        },
                        standoff: 30,
                    },
                    tickfont: {
                        size: 14 * textScale, // Escala el texto de los ticks del eje y
                    },
                    range: graphType === "boxplot" ? yAxisRange : [yAxisRange[0], yAxisRange[1] + 1.5],
                },
                annotations: newAnnotations,
                margin: {
                    l: 70,
                    r: 10,
                    t: 60,
                    b: 50,
                },
            };
            if (layout && Object.keys(layout).length > 0) {
                setLayout((prevLayout) => ({
                    ...prevLayout,
                    ...newLayout,
                }));        } else {
                setLayout({ width: 500, height: 500 }); // Un valor por defecto para evitar undefined
            }     };
    
        // Usa un `setTimeout` para asegurarte de que el gráfico ya esté montado
        setTimeout(() => {
            updateLayoutWithScale();
        }, 0);
    
        window.addEventListener('resize', updateLayoutWithScale);
    
        // Limpia el event listener cuando el componente se desmonta
        return () => {
            window.removeEventListener('resize', updateLayoutWithScale);
        };
    }, [plotWidth, graphHeight, maxYValueForLocationShannon, graphType, annotations, window.innerWidth, otus]);
    
    const safeLayout = layout || {};  // Asegura que layout nunca sea undefined

    useEffect(() => {
        // Verificamos si el layout es undefined o null
        if (layout === undefined || layout === null) {         
            setLayout({});  // Actualizamos el layout con un objeto vacío
        }
    }, [layout]);
    
    
    useEffect(() => {
        // Verifica si el layout y los datos existen
        if (plotData && plotData.length > 0) {
            const categories = plotData.map(data => data.name); // Asumiendo que cada entrada de plotData tiene un 'name' que representa la categoría
            console.log("Categorías reales del gráfico:", categories);
        } else {
            console.log("No se encontraron categorías en los datos.");
        }
    }, [plotData]);
    
    

    const MyPlotComponent = ({ shannonData, scatterColors }: { shannonData: ShannonData[]; scatterColors: ScatterColors }) => (
       
       <div className="flex flex-row w-full items-center">
            <div className="w-full" ref={plotContainerRef}>
                {loaded && (
                    <>
                      <div className="flex flex-col w-full items-end mb-5">
            <div className="flex items-center mb-3">
                <Button
                    className="p-button-rounded p-button-outlined p-button-sm"
                    onClick={() => setGraphType(graphType === "boxplot" ? "violin" : "boxplot")}
                    data-tip
                    data-for="botoninterpreteTip"
                    id="botoninterpreteTip"
                >
                    <RiExchangeFundsLine className="text-lg mr-1" />
                    Change to {graphType === "boxplot" ? "violin" : "boxplot"} view
                </Button>
            </div>
            
                <PToast ref={toast} position="top-right" />
            <div className="flex items-center">
                <Button
    className="p-button-rounded p-button-outlined p-button-sm"
    onClick={downloadPDF}
    tooltip="Download PDF"
>
    {isLoadingPDF ? (
        <ProgressSpinner style={{ width: '20px', height: '20px' }} />
    ) : (
        <i className="pi pi-file-pdf"></i>
    )}
</Button>

            </div>
        </div>


                        <div id="plot"   ref={plotRef}>
                        {isChartLoaded ? (
                            <Plot
                                className="alpha"
                                config={config}
                                data={
                                    shannonData
                                        .filter(entry => entry.name !== "null").sort((a, b) => a.name.localeCompare(b.name))
                                        .map((item, index) => {
                                            const color = scatterColors[item.name] || colorOrder[0]; // Usar color de scatterColors o un color por defecto


                                            return {
                                                ...(item as object),
                                                type: graphType === "boxplot" ? "box" : "violin",
                                                
                                                marker: {
                                                    color: color,
                                                    size: 4,
                                                },
                                                boxpoints: graphType === "boxplot" ? "all" : undefined,
                                                points: graphType !== "boxplot" ? "all" : undefined,
                                                jitter: 0.3,
                                                pointpos: 0,
                                            };
                                        })
                                }
                                divId="plot"
                                layout={layout}
                            />
                        ):(
                            <div className="absolute inset-0 flex items-center justify-center">
                            <Spinner  />
                        </div>)}

                            {shouldShowText && (
                            <div className="flex flex-row p-3 mx-3 mb-5">
                            <div className="mr-1 font-bold">*</div>
                            <div className="text-gray text-justify" style={{ fontSize: '1rem' }}>
                              Groups with different letters are significantly different from one another, based on ANOVA and Tukey HSD post hoc test (p {'<'} 0.05).
                            </div>
                          </div>
                          
                           
                            )}
                        </div>




                    </>


                )}
            </div>

        </div>

    );
    const [isOpen, setIsOpen] = useState(false);
    return (
        <RequireAuth>
            <div className="w-full h-full">

                <Suspense fallback={<p>Loading feed...</p>}>
                    <SidebarProvider>
                        <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home} className="text-bread" />}>

                            {isLoaded ? (
                                <div className="flex flex-col w-11/12  mx-auto">

                                    <div className="flex flex-row w-full text-center justify-center items-center">
                                        <h1 className="text-3xl my-5 mx-2"> Richness</h1>
                                      
                                    </div>    <div className="px-6 py-8">
                                        <div className={`prose single-column`}>
                                        <p className="text-gray-700 text-justify" style={{ fontSize: '1.3rem' }}>
                                            Microbiome diversity can be assessed through multiple ecological indices. One of these is alpha diversity, which measures the richness, or number of species within a sample.  Our current understanding of GI microbiomes suggests that higher alpha diversity is better, with low diversity being associated with more instances of disease or dysbiosis.             </p>
                                        </div>

                                    </div>
                                    
                                    <div className="flex">
                                        <GraphicCard filter={filter} legend={""} title={title} text = {"The Shannon index is a metric used to quantify both the complexity and evenness of the community.  For this index, a higher value indicates that the community is more complex.  This value ranges depending on the subject’s species, age, and sample type."}>
                                            {shannonData.length > 0 ? (
                                                <> 
                                                <div><MyPlotComponent shannonData={shannonData as ShannonData[]} scatterColors={scatterColors} />
                                                    <div className="w-full flex flex-row ">
                                                    <div className="px-6 py-8">
    <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>


        {/* Mostrar el texto correspondiente a la columna y location */}
        {textForConfigKey && (
            <div className="col-span-2" ref={configTextRef} >
                <p className="text-gray-700 m-3 text-justify text-xl">{textForConfigKey}</p>
            </div>
        )}
    </div>
</div>
                                                    </div></div>
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
        </RequireAuth>
    );
}



