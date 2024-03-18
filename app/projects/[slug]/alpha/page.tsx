"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
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

export default function Page({ params }: { params: { slug: string } }) {
    const { user, error, isLoading } = useUser();
    const [isLoaded, setIsLoaded] = useState(false);
    const [plotData, setPlotData] = useState<
        { type: string; y: any; name: string }[]
    >([]);
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
    const [selectedColumnRemove, setSelectedColumnRemove] = useState('');
    const [columnOptions, setColumnOptions] = useState([]);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
    const [valueOptions, setValueOptions] = useState<any[]>([]);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [Location, setLocation] = useState<string[]>([
        "cecum",
        "feces",
        "ileum",
    ]);
    let colorIndex = 0;

    const colors = [
        '#1f77b4', // azul metálico
        '#ff7f0e', // naranja de seguridad
        '#2ca02c', // verde cocodrilo
        '#d62728', // rojo ladrillo
        '#9467bd', // morado opaco
        '#8c564b', // marrón cuero
        '#e377c2', // rosa rasberry
        '#7f7f7f', // gris medio
        '#bcbd22', // verde siena
        '#17becf', // cian claro
        '#393b79', // azul medianoche
        '#637939', // verde oliva
        '#8c6d31', // marrón bambú
        '#843c39', // rojo oscuro
        '#7b4173', // morado orquídea
        '#bd9e39', // dorado tierra
        '#e7cb94', // amarillo vainilla
        '#e7ba52', // amarillo dorado
        '#cedb9c', // verde manzana
        '#e7969c', // rosa salmón
        '#a55194', // morado berenjena
        '#b5cf6b', // lima brillante
        '#9c9ede', // lavanda suave
        '#cedb9c', // verde pastel
        '#f7b6d2', // rosa pastel
        '#ad494a', // rojo carmín
        '#8ca252', // verde musgo
        '#000000', // negro
        '#5254a3', // azul índigo
        '#ff9896', // rosa claro
        '#98df8a', // verde menta
        '#ffbb78', // naranja melocotón
        '#aec7e8', // azul cielo
        '#c5b0d5', // lila
        '#c49c94', // marrón arena
        '#f7b6d2', // rosa claro
        '#c7c7c7', // gris claro
        '#dbdb8d', // amarillo pastel
        '#9edae5'  // turquesa claro
    ];
    

    const { accessToken } = useAuth();
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


            if (!otus) {
                const locations = new Set(
                    result.data.data.map((item: any[]) => item[1])
                );
                const uniqueLocations = Array.from(locations) as string[];

                setAvailableLocations(uniqueLocations);
                setDataUnique(result);
                setColumnOptions(result.data.columns);
                setValueOptions(result.data.data);
            }

            setOtus(result);

            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const fetchProjectIds = async (result: any, columnIndex: number | undefined) => {

        // Usa el token pasado como argumento
        try {
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
                    const alphaShannon = item[9];
                    const sampleId = item[0];
                    // Verifica si la locación actual debe ser incluida
                    if (selectedLocations.includes(location)) {
                        if (!acc[location]) {
                            acc[location] = {
                                y: [], text: [], marker: { color: colors[colorIndex % colors.length] }
                            };
                            console.log(location)
                            newScatterColors[location] = colors[colorIndex % colors.length]; // Actualiza la copia con el nuevo color
                            colorIndex++;
                        }
                        acc[location].y.push(alphaShannon);
                        acc[location].text.push(`Sample ID: ${sampleId}`);
                    }

                    return acc;
                },
                {}
            );
            setScatterColors(newScatterColors);
            const shannonData: any[] = processData(filteredData.filter((data: { name: null; }) => data.name !== "null"), columnIndex || 1);
            setShannonData(shannonData as never[]);
            setPlotData(
                Object.keys(groupedData).map((location) => ({
                    ...groupedData[location],
                    type: "box",
                    name: location,
                }))
            );
            setIsLoaded(true);
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const processData = (data: any[], index: number): any[] => {

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
                        y: [], text: [], name: `${value === undefined ? location : value}`, marker: { color: colors[colorIndex % colors.length] }
                    };
                    newScatterColors[value] = colors[colorIndex % colors.length]; // Actualiza la copia con el nuevo color
                    colorIndex++;
                }

                acc[key].y.push(item[9]); // Asumiendo que el valor de interés está en el índice 9
                acc[key].text.push(`Sample ID: ${item[0]}`);
            }
            return acc;
        }, {});
        setScatterColors(newScatterColors);

        // Convertir el objeto resultante en un arreglo de sus valores
        return Object.values(result);
    };

    const updatePlotWidth = () => {

        if (plotContainerRef.current) {
            setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth);
            console.log(plotWidth)
            console.log(plotContainerRef.current)
            setLoaded(true)

        };};

        useEffect(() => {
            updatePlotWidth(); // Establece el ancho inicial
        }, [otus]);

        window.addEventListener('resize', updatePlotWidth); // Añade un listener para actualizar el ancho en el redimensionamiento
        
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
        }, [accessToken]);

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
            console.log(newScatterColors)
            console.log(scatterColors)
        };

        // Función para aplicar los filtros seleccionados
        const applyFilters = (event: any) => {
            const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
            fetchData(accessToken, columnIndex).then((result) => { fetchProjectIds(result, columnIndex) })
            setLocation(selectedLocations);
            console.log('filter', typeof (selectedValues), selectedValues)



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
        }, [selectedColumn]);

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

        // Componente de checks para los valores de la columna seleccionada
        const valueChecks = (
            <div className="flex flex-col w-full overflow-x-scroll mb-5 mt-5">
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Select values to show</h3>
                <div className="flex w-full flex-col overflow-x-scroll items-start">

                    {valueOptions.map((value, index) => (
                        <div key={index} className="flex w-full items-start overflow-x-scroll mb-2 ">
                            <input
                                id={`value-${index}`}
                                type="checkbox"
                                value={value}
                                checked={selectedValues.has(value)}
                                onChange={() => handleValueChange(value)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor={`value-${index}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 overflow-x-scroll">
                                {value}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );

        const filter = (
            <div className={`flex flex-col w-full bg-white rounded-lg  dark:bg-gray-800 `}>
                <div className={`tab-content `}>
                    <div className="flex flex-col items-left space-x-2">
                        <h3 className="mb-5 text-base font-medium text-gray-900 dark:text-white">Select an option</h3>
                        <select id="location" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={currentLocation === "all" ? currentLocation : selectedLocations}
                            onChange={(e) => handleLocationChange(e.target.value)}>
                            <option selected value="all">All Locations</option>
                            {availableLocations.map((location) => (
                                <option key={location} value={location}>
                                    {location.charAt(0).toUpperCase() + location.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>


                </div>

                <div className="mt-10">

                    <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Color by</h3>
                    <ul className="grid gap-6 md:grid-cols-2">
                        <li>
                            <input type="radio" id="samplelocation" name="samplelocation" value="samplelocation" className="hidden peer" required checked={isColorByDisabled ? true : selectedColumn === 'samplelocation'}
                                onChange={handleLocationChangeColorby}
                                disabled={isColorByDisabled} />
                            <label htmlFor="samplelocation" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500 cursor-pointer hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full text-center flex justify-center">Default</div>
                                </div>

                            </label>
                        </li>
                        <li>
                            <input type="radio" id="treatment" name="treatment" value="treatment" className="hidden peer" checked={isColorByDisabled ? false : selectedColumn === 'treatment'}
                                onChange={handleLocationChangeColorby}
                                disabled={isColorByDisabled} />
                            <label htmlFor="treatment" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full">Treatment</div>
                                </div>

                            </label>
                        </li>
                        <li>
                            <input type="radio" id="age" name="age" value="age" className="hidden peer" checked={isColorByDisabled ? false : selectedColumn === 'age'}
                                onChange={handleLocationChangeColorby} />
                            <label htmlFor="age" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full">Age</div>
                                </div>

                            </label>
                        </li>
                        {colorByOptions.map((option, index) => (
                            <li key={index}>
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
                                        } w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                                >
                                    <div className="block">
                                        <div className="w-full">{(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}</div>
                                    </div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>


                {selectedColumn === "samplelocation" ? "" :
                    (valueChecks)}
                <div className="flex w-full items-center margin-0 justify-center my-8">
                    <button
                        onClick={applyFilters}
                        className="bg-custom-green-400 hover:bg-custom-green-500 text-white font-bold py-2 px-10 rounded-xl"
                    >
                        Apply
                    </button>
                </div>
            </div>
        );

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
            <div style={{ marginLeft: '0px' }}>
                {shannonData
                    .filter(entry => entry.name !== "null") // Filtra las entradas donde name no es null
                    .map((entry, index) => ({
                        ...entry,
                        color: scatterColors[entry.name],
                    }))
                    .map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <div className="rounded-full" style={{ width: '10px', height: '10px', backgroundColor: scatterColors[entry.name], marginRight: '10px' }}></div>
                            <div className="text-sm text-gray-500">{entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}</div>
                        </div>
                    ))}
            </div>
        );

        const [annotations, setAnnotations] = useState([]);

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


        useEffect(() => {

            const significanceEntries = Object.entries(otus?.significance || {});

            const annotations = significanceEntries.map(([locationValue, significance]) => {
                // Calcula la posición 'x' para la ubicación actual basándose en 'selectedLocations'
                const xPosition = selectedLocations.indexOf(locationValue);

                return {
                    x: locationValue, // Usar 'xPosition' para reflejar la posición calculada
                    y: maxYValueForLocation(locationValue, otus?.data) + 0.5,
                    text: significance, // Convertir 'significance' a cadena
                    xref: 'x',
                    yref: 'y',
                    showarrow: true,
                    arrowhead: 7,
                    ax: 0,
                    ay: -40,
                };
            });

            setAnnotations(annotations as never[]);
        }, [otus]);

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
        const yAxisRange = [0, maxYValueForLocationShannon + 2];

        console.log('Max alpha shannon:', yAxisRange);

        const MyPlotComponent = ({ shannonData, scatterColors }: { shannonData: ShannonData[]; scatterColors: ScatterColors }) => (

            <div className="flex flex-row w-full items-center">
                <div className="w-10/12 " ref={plotContainerRef}>
                    {loaded && (

                        <Plot
                            data={Object.values(shannonData.filter(entry => entry.name !== "null")).map(item => ({ ...(item as object), type: "box", marker: { color: scatterColors[item.name] } }))}
                            layout={{
                                width: plotWidth || undefined, // Utiliza plotWidth o cae a 'undefined' si es 0
                                height: 600,
                                title: `Alpha Shannon${isColorByDisabled ? " por Ubicación" : (selectedColumnRemove === "" || selectedColumnRemove === "samplelocation" ? " en " + selectedLocations : (" por " + selectedColumn + " en ") + selectedLocations)}`,
                                showlegend: false,
                                annotations: annotations,
                                yaxis: { range: yAxisRange }
                            }}
                        />
                    )}
                </div>
                <div className="w-2/12 flex flex-col overflow-x-scroll max-h-full items-start">
                    <h2 className="mb-3 text-base text-gray-700 ">{colorBy === "samplelocation" ? "Sample location" : colorBy}</h2>
                    <CustomLegend shannonData={shannonData} scatterColors={scatterColors} />
                </div>
            </div>

        );

        return (
            <div>
                <SidebarProvider>
                    <Layout slug={params.slug} filter={""} >

                        {isLoaded ? (
                            <div className="flex flex-col w-full">

                                <div className="flex flex-row w-full text-center justify-center items-center">
                                    <h1 className="text-3xl my-5 mx-2">Alpha diversity</h1>
                                    <AiOutlineInfoCircle className="text-xl cursor-pointer text-blue-300" data-tip data-for="interpreteTip" id="interpreteTip" />
                                    <Tooltip
                                        style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "20px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
                                        anchorSelect="#interpreteTip">
                                        <div className={`prose single-column w-96 z-50`}>
                                            {configFile?.alphadiversity?.interpretation ? (
                                                Object.entries(configFile?.alphadiversity?.interpretation)
                                                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                                    .map(([key, value]) => (
                                                        <p key={key} className="text-gray-700 text-justify text-xl m-3">
                                                            {value as ReactNode}
                                                        </p>
                                                    ))
                                            ) : (""
                                            )}
                                        </div>
                                    </Tooltip>
                                </div>    <div className="px-6 py-8">
                                    <div className={`prose ${Object.keys(configFile?.alphadiversity?.text || {}).length === 1 ? 'single-column' : 'column-text'}`}>
                                        {Object.entries(configFile?.alphadiversity?.text || {}).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([key, value]) => (
                                            <p key={key} className="text-gray-700 text-justify text-xl">
                                                {value as React.ReactNode}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex">
                                    <GraphicCard filter={filter}>
                                        {shannonData.length > 0 ? (
                                            <MyPlotComponent shannonData={shannonData as ShannonData[]} scatterColors={scatterColors} />
                                        ) : (
                                            <SkeletonCard width={"500px"} height={"270px"} />
                                        )}
                                    </GraphicCard>
                                </div>
                                <div className="px-6 py-8" >
                                    <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        {Object.entries(configFile?.alphadiversity?.graph || {}).map(([key, value]) => {
                                            if (key === "samplelocation" && selectedLocations.length > 1 && typeof value === 'object' && value !== null) {
                                                const entries = Object.entries(value);
                                                const isSingleEntry = entries.length === 1;  // Verificar si solo hay una entrada

                                                return entries.map(([subKey, subValue]) => (
                                                    <div key={subKey} className={isSingleEntry ? "col-span-2" : ""}>
                                                        <p className="text-gray-700 m-3 text-justify text-xl">{subValue}</p>
                                                    </div>
                                                ));
                                            } else if (typeof value === 'string') {
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
                                            if (key === selectedColumn && key !== "samplelocation") {
                                                if (typeof value === 'object' && value !== null) {
                                                    const entries = Object.entries(value);
                                                    const isSingleEntry = entries.length === 1; // Verificar si hay una sola entrada

                                                    return entries.map(([subKey, subValue]) => (
                                                        <div key={subKey} className={isSingleEntry ? "w-full" : "w-1/2"}>
                                                            <p className="text-gray-700 m-3 text-justify text-xl">{subValue}</p>
                                                        </div>
                                                    ));
                                                } else if (typeof value === 'string') {
                                                    // Las cadenas siempre ocupan la mitad de la columna, pero puedes cambiar esto si lo deseas
                                                    return (
                                                        <div className="w-full" key={key}>
                                                            <p className="text-gray-700 m-3 text-justify text-xl">{value}</p>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            </div>

                        ) : (
                            <div>Loading...</div>
                        )}
                        <ToastContainer />
                    </Layout>
                </SidebarProvider>
            </div>
        );
    }
