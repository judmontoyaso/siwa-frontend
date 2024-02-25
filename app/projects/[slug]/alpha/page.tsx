"use client";
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/components/skeletoncard";
import GraphicCard from "@/components/graphicCard";
import { Bounce, toast } from "react-toastify";
import { renderToStaticMarkup } from "react-dom/server";

export default function Page({ params }: { params: { slug: string } }) {
    type OtuType = {
        index: string[];
        columns: string[];
        data: number[][];
    };

    const { user, error, isLoading } = useUser();
    const [accessToken, setAccessToken] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [plotData, setPlotData] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const [plotDataObserved, setPlotDataObserved] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const [otus, setOtus] = useState<any>();
    const [scatterData, setScatterData] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("");
    const [shannonData, setShannonData] = useState({});
    const [observedData, setObservedData] = useState({});
    const [currentLocation, setCurrentLocation] = useState('');
    const [colorByOptions, setColorByOptions] = useState([]);
    const [colorBy, setColorBy] = useState<string>('none');
    const [isFilterCardVisible, setIsFilterCardVisible] = useState(false);
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);

    const fetchToken = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/auth/token");
            const { accessToken } = await response.json();
            setAccessToken(accessToken);
            console.log("Token obtenido:", accessToken);
            return accessToken; // Retorna el token obtenido para su uso posterior
        } catch (error) {
            console.error("Error al obtener token:", error);
        }
    };
    const toggleFilterCardVisibility = () => {
        setIsFilterCardVisible(!isFilterCardVisible);
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
            setColorByOptions(configfile.configFile.columns); // Actualiza el estado con las nuevas opciones
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
        }
    };

    const fetchData = async (token: any, columnIndex: number | undefined) => {

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/projects/alpha-diversity/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ "samplelocation": selectedLocations })
            }
            );
            if (response.status === 404) {
                toast.warn('The data needs to be loaded again!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                setTimeout(() => { window.location.href = "/"; }, 5000);
                throw new Error("Respuesta no válida desde el servidor");
            }
            const result = await response.json();
            const locations = new Set(
                result.data.data.map((item: any[]) => item[1])
            );
            const uniqueLocations = Array.from(locations) as string[];
            setAvailableLocations(uniqueLocations);

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
            const isAllLocationsSelected = selectedLocations.length === 3 && ["cecum", "feces", "ileum"].every(location => selectedLocations.includes(location));

            // Filtrar los datos basados en la locación seleccionada, si se ha seleccionado una
            const filteredData = result?.data?.data?.filter((item: string[]) => selectedLocations.includes(item[1])) || [];

            const groupedData = filteredData.reduce(
                (
                    acc: {
                        [x: string]: {
                            y: any;
                            text: string[];
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
                            acc[location] = { y: [], text: [] };
                        }
                        acc[location].y.push(alphaShannon);
                        acc[location].text.push(`Sample ID: ${sampleId}`);
                    }

                    return acc;
                },
                {}
            );

            const groupedDataObserved = filteredData.reduce(
                (
                    acc: {
                        [x: string]: {
                            y: any;
                            text: string[];
                        };
                    },
                    item: any[]
                ) => {
                    const location = item[1];
                    const alphaObserved = item[10];
                    const sampleId = item[0];
                    // Verifica si la locación actual debe ser incluida
                    if (selectedLocations.includes(location)) {
                        if (!acc[location]) {
                            acc[location] = { y: [], text: [] };
                        }
                        acc[location].y.push(alphaObserved);
                        acc[location].text.push(`Sample ID: ${sampleId}`);
                    }

                    return acc;
                },
                {}
            );

            const shannonData = processData(filteredData, columnIndex || 1);
            const observedData = processData(filteredData, (columnIndex || 1) + 1);
            setShannonData(shannonData);
            setObservedData(observedData);

            setPlotData(
                Object.keys(groupedData).map((location) => ({
                    ...groupedData[location],
                    type: "box",
                    name: location,
                }))
            );


            setPlotDataObserved(
                Object.keys(groupedDataObserved).map((location) => ({
                    ...groupedDataObserved[location],
                    type: "box",
                    name: location,
                }))
            );

            setIsLoaded(true);
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };



    const processData = (data: any, index: number) => {
        if (!Array.isArray(data)) {
            console.error('Expected an array for data, received:', data);
            return {};
        }

        return (data || []).reduce((acc: { [x: string]: { y: any[]; text: string[]; name: string }; }, item: any[]) => {
            const location = item[1];
            const value = item[index]; // Valor de la columna seleccionada
            const key = `${location}-${value}`; // Clave única para agrupar

            if (!acc[key]) {
                acc[key] = { y: [], text: [], name: `${value === undefined ? location : value}` };
            }
            acc[key].y.push(item[9]);
            acc[key].text.push(`Sample ID: ${item[0]}`);

            return acc;
        }, {});
    };

    useEffect(() => {

        // Llamar a fetchProjectIds y pasar selectedColumn y su índice correspondiente
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchProjectIds(otus, columnIndex)

    }, [accessToken, selectedColumn, selectedLocations, currentLocation]);

    // Manejar cambio de locación
    useEffect(() => {
        if (otus && currentLocation) {
            const filteredData = otus?.data?.data?.filter((item: string[]) => selectedLocations.includes(item[1])) || [];
            processData(filteredData, Number(selectedColumn)); // Fix: Convert selectedColumn to a number
        } else if (otus) {
            processData(otus.data.data.data, Number(selectedColumn)); // Fix: Convert selectedColumn to a number
        }
    }, [currentLocation, selectedColumn, otus]);


    // Manejar cambio de locación
    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        if (otus && currentLocation) {
            const filteredData = otus.data.data.filter((item: any[]) => item[1] === currentLocation);
            processData(filteredData, columnIndex);
        } else if (otus) {
            processData(otus.data, columnIndex)
        }
    }, [currentLocation, selectedColumn, otus]);


    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchToken().then((token) => { fetchConfigFile(token); fetchData(token, columnIndex).then((result) => { fetchProjectIds(result, columnIndex) }) });
    }, [params.slug]);


    const handleLocationChange = (event: any) => {
        if (event === 'all') {
            setSelectedLocations(['cecum', 'feces', 'ileum']);
            setSelectedColumn("samplelocation");
            setIsColorByDisabled(true); // Ocultar el select de tratamiento si se selecciona 'All'
        } else {
            setSelectedLocations([event]);
            setIsColorByDisabled(false); // Mostrar el select de tratamiento cuando se selecciona una location específica
        }
    };

    const handleLocationChangeColorby = (event: any) => {
        setSelectedColumn(event.target.value);
    };



const filter = (
    <div className={`flex flex-col w-full p-4 bg-white rounded-lg  dark:bg-gray-800 `}>
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
                                        <input type="radio" id="none" name="none" value="none" className="hidden peer" required checked={isColorByDisabled ? true : selectedColumn === 'samplelocation'}
                                            onChange={handleLocationChangeColorby}
                                            disabled={isColorByDisabled} />
                                        <label htmlFor="none" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500 cursor-pointer hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
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
  
           </div>
       );


    return (
        <div>
            <Layout slug={params.slug} filter={""} >
                {isLoaded ? (
                    <>
                        <div className="flex flex-row justify-evenly w-full items-center">



                            

                            <div className={`transition-all ease-in-out duration-300 ${isFilterCardVisible ? 'max-w-xs' : 'w-0'} overflow-hidden`}>
                                {/* Contenido de la tarjeta de filtros */}
                               
                              
                            </div>
                            


                            <div className="flex-grow">
                                <GraphicCard filter={filter}>
                                    {plotData.length > 0 ? (
                                        <Plot
                                            data={Object.values(shannonData).map(item => ({ ...(item as object), type: "box" }))}
                                            layout={{
                                                width: 800,
                                                height: 270,
                                                title: `Alpha Shannon${isColorByDisabled ? " por Ubicación" : (selectedColumn === "" || selectedColumn === "none" ? " en " + selectedLocations : (" por " + selectedColumn + " en ") + selectedLocations)}`,
                                            }}
                                        />
                                    ) : (
                                        <SkeletonCard width={"500px"} height={"270px"} />
                                    )}
                                </GraphicCard>
                            </div>



                        </div>
                    </>
                ) : (
                    <Loading type="cylon" color="#0e253a" />
                )}
            </Layout>
        </div>
    );
}
