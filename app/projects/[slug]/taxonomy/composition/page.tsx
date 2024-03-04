"use client";
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Loading from "@/app/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
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
    const [plotData, setPlotData] = useState<any[]>([]);

    const [plotDataObserved, setPlotDataObserved] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const [otus, setOtus] = useState<any>();
    const [scatterData, setScatterData] = useState([]);
    const [selectedValue, setSelectedValue] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [valueOptions, setValueOptions] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const newScatterColors: { [key: string]: string } = {};

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("samplelocation");
    const [selectedGroup, setSelectedGroup] = useState("samplelocation");
    const [selectedRank, setSelectedRank] = useState("genus");
    const [columnName, setColumnName] = useState("samplelocation");
    const [shannonData, setShannonData] = useState([]);
    const [observedData, setObservedData] = useState({});
    const [currentLocation, setCurrentLocation] = useState('');
    const [colorByOptions, setColorByOptions] = useState<string[]>(['age', 'treatment']);
    const [colorBy, setColorBy] = useState<string>('none');
    const [isFilterCardVisible, setIsFilterCardVisible] = useState(false);
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);
    const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
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
        "family",
        "genus",
        "order",
        "phylum",
        "species",
        "class",
        "kingdom",
    ];
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
    const [number, setNumber] = useState(15);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [configFile, setconfigFile] = useState({} as any);

    // Manejador para actualizar el estado cuando el valor del input cambia
    const handleChangeNumber = (e: any) => {
        setNumber(e.target.value);
    };

    useEffect(() => {
        // Función para actualizar el ancho del gráfico con un pequeño retraso
        const updatePlotWidth = () => {
          setTimeout(() => {
            if (plotContainerRef.current) {
              setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth);
              setLoaded(true)
            }
          }, 800); // Retraso de 10 ms
        };
    
        updatePlotWidth(); // Establece el ancho inicial
    
        window.addEventListener('resize', updatePlotWidth); // Añade un listener para actualizar el ancho en el redimensionamiento
    
        return () => {
          window.removeEventListener('resize', updatePlotWidth);
        };
      }, [params.slug, plotData]);

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
            console.log(configfile);
            setconfigFile(configfile.configFile);

            const combinedOptions = Array.from(new Set([...colorByOptions, ...configfile.configFile.columns]));
            setColorByOptions(combinedOptions);
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
            window.location.href = "/api/auth/logout";
        }
    };

    const fetchData = async (token: any) => {

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/projects/taxonomycomposition/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "selectedColumn": selectedColumn,
                    "selectedValue": selectedValue,
                    "selectedRank": selectedRank,
                    "selectedGroup": selectedGroup,
                    "top": number.toString()
                })
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


            console.log("Datos obtenidos:", result);
            setOtus(result);
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };
    const fetchDataFilter = async (token: any) => {

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/projects/taxonomycomposition/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "selectedColumn": selectedColumn,
                    "selectedValue": selectedLocations,
                    "selectedRank": selectedRank,
                    "selectedGroup": selectedGroup,
                    "top": number.toString()
                })
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
            const columnIndex = result.data.columns.indexOf(selectedColumn);
            if (columnIndex !== -1) {
                const uniqueValues = Array.from(new Set(result.data.data.map((row: { [x: string]: any; }) => row[columnIndex]))) as string[];
                setValueOptions(['All', ...uniqueValues]); // Incluye 'All' y luego los valores únicos
            }

            console.log("Datos obtenidos:", result);
            setOtus(result);
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const fetchDataGroup = async (token: any) => {

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/projects/taxonomycomposition/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "selectedColumn": selectedColumn,
                    "selectedValue": selectedLocations,
                    "selectedGroup": selectedGroup,
                    "selectedRank": selectedRank,
                    "top": number.toString()
                })
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

            console.log("Datos obtenidos:", result);
            setOtus(result);
            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };




    // Manejar cambio de locación

    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchToken().then((token) => { fetchConfigFile(token); fetchData(token); });
    }, [params.slug]);

    useEffect(() => {
        fetchToken().then((token) => { fetchConfigFile(token) });
    }, [plotData, params.slug]);


    useEffect(() => {
        fetchDataGroup(accessToken);
        setSelectedGroup(selectedGroup)
    }, [selectedGroup]);

    // Manejar cambio de locación

    //    useEffect(() => {
    //     const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
    //     fetchToken().then((token) => { fetchConfigFile(token); fetchData(token); });
    // }, [selectedGroup]);
    interface DataItem {
        // Asumiendo que todos los elementos tienen este formato
        0: string; // Para el label
        1: number; // Para el valor de X
        3: number; // Para el valor de Y
        // Agrega más propiedades según sea necesario
      }
    useEffect(() => {
        
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
    
            setPlotData(traces);
            setScatterColors(newScatterColors); // Asegúrate de que esto sea un estado de React
        }
    }, [otus]);
    

    // Función para aplicar los filtros seleccionados
    const applyFilters = (event: any) => {


        // Convierte ambas matrices a cadenas para una comparación simple
        const newSelectionString = selectedLocations.join(',');
        const currentSelectionString = Location.join(',');


        fetchDataFilter(accessToken);

        setLocation(selectedLocations);

        if (selectedLocations.length === 3) {
            setIsColorByDisabled(true); // Ocultar el select de tratamiento si se selecciona 'All'
            setSelectedGroup("samplelocation"); // Restablecer el valor de tratamiento si se selecciona 'All'
        } else {
            setIsColorByDisabled(false); // Mostrar el select de tratamiento cuando se selecciona una location específica
        }


    };

    const handleLocationChange = (event: any) => {
        if (event === 'all') {
            setSelectedLocations(['cecum', 'feces', 'ileum']);
            setSelectedColumn("samplelocation");
        } else {
            setSelectedLocations([event]);
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



    const MyPlotComponent = ({ plotData, scatterColors }: { plotData: any[]; scatterColors: any }) => (
        <div className="flex flex-row w-full items-start">
        <div className="w-9/12 flex " ref={plotContainerRef}>
        {loaded && (
                <Plot
                    data={plotData}
                    layout={{
                        barmode: 'stack', // Cambiado a 'stack' para apilar las barras
                        plot_bgcolor: 'white',
                        yaxis: { title: {text: 'Relative Abundance',       font: { // Añade esta sección para personalizar la fuente del eje X
                            family: 'Roboto, sans-serif',
                            size: 18,
                          }}  },
                        xaxis: { title: {text: selectedColumn,       font: { // Añade esta sección para personalizar la fuente del eje X
                            family: 'Roboto, sans-serif',
                            size: 18,
                          }} },
                        width: plotWidth || undefined, // Utiliza plotWidth o cae a 'undefined' si es 0
                        height: 600,
                        title: {text: `Relative abundance ${isColorByDisabled ? " por Ubicación" :  " en " + (Location + (colorBy === "none" ? "" :  " por " + colorBy.replace('_', ' ')))}`,     font: { // Añade esta sección para personalizar el título
                            family: 'Roboto, sans-serif',
                            size: 26,
                          }},
                        showlegend: false,
                    }}
                />)}
            </div>
            <div className="w-3/12 flex flex-col  border border-gray-100 rounded-3xl p-5 overflow-auto max-h-full">
            <h2 className="mb-3 text-xl ">{colorBy === "none" ? "Sample location" : colorBy}</h2>

                <CustomLegend plotData={plotData} scatterColors={scatterColors} />
            </div>
        </div>);




const filter = (
    <div className={`flex flex-col w-full p-4 bg-white rounded-lg  dark:bg-gray-800 `}>
    <div className={`tab-content `}>
  
             <div className="flex flex-col items-left space-x-2">
  
               <h3 className="mb-5 text-base font-medium text-gray-900 dark:text-white">Select a rank option</h3>
               <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                {taxonomyOptions.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>

                            <div className="flex flex-col items-left space-x-2">

                                <h3 className="mb-5 mt-5 text-base font-medium text-gray-900 dark:text-white">Select an option</h3>
                                <select id="location" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={selectedLocation === "all" ? selectedLocation : selectedLocations}
                                    onChange={(e) => handleLocationChange(e.target.value)}
                                >
                                    <option selected value="all">All Locations</option>
                                    {availableLocations.map((location) => (
                                        <option key={location} value={location}>
                                            {location.charAt(0).toUpperCase() + location.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <div className="container flex flex-col space-y-2">
    <label htmlFor="topInput" className="text-lg font-medium text-gray-700">Top</label>
    <input
        id="topInput"
        type="number"
        value={number}
        onChange={handleChangeNumber}
        className="input-number mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        min="0"
        max="100"
        placeholder="Enter a number"
    />
</div>

                            </div>
                            <div className="flex w-full items-center margin-0 justify-center my-8">
                                <button
                                    onClick={applyFilters}
                                    className="bg-custom-green-400 hover:bg-custom-green-500 text-white font-bold py-2 px-4 rounded-xl"
                                >
                                    Apply Filter
                                </button>
                            </div>
                      

                            <select value={selectedGroup} disabled={isColorByDisabled} onChange={(e) => setSelectedGroup(e.target.value)}>
                                <option value="samplelocation">
                                    Sample location
                                </option>
                                {colorByOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
  </div>
           </div>
         </div>);
  
  


    return (
        <div>
            <Layout slug={params.slug} filter={""}>
            {isLoaded ? (
<div className="flex flex-col w-full">

<h1 className="text-3xl my-5">Taxonomy composition</h1>
<div className="px-6 py-8">
  <div className="prose column-text">
    {configFile?.betadiversity?.text ? (
      Object.entries(configFile.betadiversity.text)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([key, value]) => (
          <p key={key} className="text-gray-700 text-justify text-xl">
            {value as ReactNode}
          </p>
        ))
    ) : (
      <p>No data available</p> 
    )}
  </div>
</div>

  <div className="flex">
    <GraphicCard filter={filter}>
      {plotData.length > 0 ? (
        <MyPlotComponent plotData={plotData} scatterColors={scatterColors} />
      ) : (
        <SkeletonCard width={"800px"} height={"470px"} />
      )}
    </GraphicCard>
  </div>
  <div className="px-6 py-8" >
  <div className="grid grid-cols-2 gap-10">
  {Object.entries(configFile?.summary?.graph || {}).map(([key, value]) => (
    key === "samplelocation" && (Location.length > 1) && (
      <div key={key}>
        <p className="text-gray-700 m-3 text-justify text-xl">{value as ReactNode}</p>
      </div>
    )
  ))}
</div>

    <div className="prose flex flex-row flex-wrap">
      {Object.entries(configFile?.summary?.graph || {}).map(([key, value]) => (
        key === selectedGroup && key !== "samplelocation" && (
          <div className="w-1/2" key={key}>
            <p className="text-gray-700 m-3 text-justify text-xl">{value as ReactNode}</p>
          </div>
        )
      ))}
    </div>
  </div>
</div>

        ) : (
          <div>Loading...</div>
        )}
            </Layout>
        </div>
    );
}
