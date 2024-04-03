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
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import TagsInput from "@/app/components/tags";
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { useAuth } from "@/app/components/authContext";


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
    const [colorBy, setColorBy] = useState<string>('samplelocation');
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
        "class"
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
    const [number, setNumber] = useState(12);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [configFile, setconfigFile] = useState({} as any);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
    const [dataUnique, setDataUnique] = useState<any>();
    const [dataResult, setDataResult] = useState<any>(null);
    const [actualGroup, setActualGroup] = useState<any>('samplelocation');

    const [columnOptions, setColumnOptions] = useState([]);

    // Manejador para actualizar el estado cuando el valor del input cambia
    const handleChangeNumber = (e: any) => {
        setNumber(e.target.value);
    };

    useEffect(() => {
        // Función para actualizar el ancho del gráfico con un pequeño retraso
        const updatePlotWidth = () => {
            setTimeout(() => {
                if (plotContainerRef.current) {
                    setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 100);
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
                    "columnValues": selectedValue

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
                    "columnValues": [...selectedValues],
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
                // setTimeout(() => { window.location.href = "/"; }, 5000);
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

    const fetchDataGroup = async (token: any) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/taxonomycomposition/${params.slug}`, {
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
                    "columnValues": colorBy === 'samplelocation' ? selectedLocations : [...selectedValues],
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
fetchConfigFile(accessToken); fetchData(accessToken);
    }, [params.slug, accessToken]);

  
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



    const MyPlotComponent = ({ plotData, scatterColors }: { plotData: any[]; scatterColors: any }) => (
        <div className="flex flex-row w-full items-start">
            <div className="w-9/12 flex " ref={plotContainerRef}>
                {loaded && (
                    <Plot
                        data={plotData}
                        layout={{
                            barmode: 'stack', // Cambiado a 'stack' para apilar las barras
                            bargap: 0.1,
                            plot_bgcolor: 'white',
                            yaxis: {
                                title: {
                                    text: 'Relative Abundance', font: { 
                                        family: 'Roboto, sans-serif',
                                        size: 18,
                                    }
                                }
                            },
                            xaxis: {
                                title: {
                                    text: selectedColumn, font: { 
                                        family: 'Roboto, sans-serif',
                                        size: 18,
                                    }
                                }
                            },
                            width: plotWidth || undefined, // Utiliza plotWidth o cae a 'undefined' si es 0
                            height: 600,
                            title: {
                                text: `Relative abundance ${isColorByDisabled ? " por Ubicación" : " en " + (Location + (colorBy === "samplelocation" ? "" : " por " + colorBy.replace('_', ' ')))}`, font: { // Añade esta sección para personalizar el título
                                    family: 'Roboto, sans-serif',
                                    size: 26,
                                }
                            },
                            showlegend: false,
                        }}
                    />)}
            </div>
            <div className="w-3/12 flex flex-col  border border-gray-100 rounded-3xl p-5 overflow-auto max-h-full">
                <h2 className="mb-3 text-xl ">{colorBy === "samplelocation" ? "Sample location" : colorBy}</h2>

                <CustomLegend plotData={plotData} scatterColors={scatterColors} />
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




    // Componente de checks para los valores de la columna seleccionada
    const valueChecks = (
        <div className="mb-5 mt-5">
            <h3 className="mb-5 text-base font-medium text-gray-900 dark:text-white">Select the values to keep</h3>
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

    const filter = (
        <div className={`flex flex-col w-full p-4 bg-white rounded-lg  dark:bg-gray-800 `}>

            <div className="flex flex-col items-left space-x-2">
<div>
     <h3 className="mb-5 text-base font-medium text-gray-900 dark:text-white">Select a rank option</h3>
                <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    {taxonomyOptions.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
</div>
<div className="max-w-xs mx-auto flex flex-col items-center mt-5">
    <label htmlFor="topInput" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Top</label>
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
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Select a number for the top taxa.</p>
</div>
 

                <div className="flex flex-col items-left space-x-2 mt-5">

                    <h3 className="mb-5 mt-2 text-base font-medium text-gray-900 dark:text-white">Select a sample location</h3>
                    <select id="location" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedLocation === "all" ? selectedLocation : selectedLocations}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        disabled={availableLocations.length === 1}
                    >
                        <option selected value="all">All Locations</option>
                        {availableLocations.map((location) => (
                            <option key={location} value={location}>
                                {location.charAt(0).toUpperCase() + location.slice(1)}
                            </option>
                        ))}
                    </select>
              


                </div>

                <div className="mt-5">
                <h3 className="mb-5 mt-2 text-base font-medium text-gray-900 dark:text-white">Select a group option</h3>

                    <ul className="grid w-full gap-6 md:grid-cols-2">

                        <li>
                            <input type="radio" id="samplelocation" name="samplelocation" value="samplelocation" className="hidden peer" required checked={selectedGroup === 'samplelocation'}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                disabled={isColorByDisabled}
                              />
                            <label htmlFor="samplelocation" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  cursor-pointer hover:text-gray-600 hover:bg-gray-100  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                                <div className="block">
                                    <div className="w-full text-center flex justify-center">Sample location</div>
                                </div>
                            </label>
                        </li>
                        {colorByOptions.map((option, index) => {
  // Solo renderizar el elemento si 'option' está presente en 'columnOptions'
if ((columnOptions as string[]).includes(option)) {
    return (
      <li key={index}>
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
          } w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
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
            <div>

            {selectedGroup!== "samplelocation" ? valueChecks : ""}
            </div>

            <div className="flex w-full items-center margin-0 justify-center my-8">
                <button
                    onClick={applyFilters}
                    className="bg-custom-green-400 hover:bg-custom-green-500 text-white font-bold py-2 px-4 rounded-xl"
                >
                    Apply
                </button>
            </div>

        </div>);


useEffect(() => {
    if (availableLocations.length === 1) {
      // Si solo hay una ubicación disponible, selecciónala automáticamente
      const uniqueLocation = availableLocations[0];
      handleLocationChange(uniqueLocation); // Asume que esta función actualiza tanto `selectedLocations` como `currentLocation`
    }
  }, [availableLocations]); // Dependencia del efecto
  

    return (
        <div>
            <SidebarProvider>
            <Layout slug={params.slug} filter={""}>
                {isLoaded ? (
                    <div className="flex flex-col w-full">

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

                            </div>

                        <div className="flex">
                            <GraphicCard filter={filter} legend={undefined}>
                                {plotData.length > 0 ? (
                                    <MyPlotComponent plotData={plotData} scatterColors={scatterColors} />
                                ) : (
                                    <SkeletonCard width={"800px"} height={"470px"} />
                                )}
                            </GraphicCard>
                        </div>
                        <div className="w-full flex flex-row ">
                                <div className="w-1/5"></div>
                                <div className="px-6 py-8 w-4/5" >
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
                    <div>Loading...</div>
                )}
            </Layout>
            </SidebarProvider>
        </div>
    );
}
