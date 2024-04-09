
"use client";
import { ReactNode, SetStateAction, use, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Loading from "@/app/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { renderToStaticMarkup } from "react-dom/server";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'primereact/tooltip';
import 'react-tooltip/dist/react-tooltip.css'
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { AuthProvider, useAuth } from "@/app/components/authContext";
import LefsePlot from "@/app/components/lefsePlot";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

import { ConfirmDialog } from 'primereact/confirmdialog'; // For <ConfirmDialog /> component
import { confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import { Button } from 'primereact/button'; // For <Button /> component
import { Toast } from 'primereact/toast'; // For <Toast /> component
import { Card } from 'primereact/card';
import { Steps } from "primereact/steps";
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { ProgressSpinner } from "primereact/progressspinner";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React from "react";
import Link from "next/link";
import { group } from "console";
import Spinner from "@/app/components/pacmanLoader";

export default function Page({ params }: { params: { slug: string } }) {
    const { user, error, isLoading } = useUser();
    const [isLoaded, setIsLoaded] = useState(false);
    const [plotData, setPlotData] = useState<
        { type: string; y: any; name: string }[]
    >([]);
    const [showInstructions, setShowInstructions] = useState(true);
    const [otus, setOtus] = useState<any>();
    const [dataUnique, setDataUnique] = useState<any>();
    const [selectedLocations, setSelectedLocations] = useState<string[]>(['cecum', 'feces', 'ileum']);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState("samplelocation");
    const [shannonData, setShannonData] = useState([]);
    const [currentLocation, setCurrentLocation] = useState('');
    const [colorByOptions, setColorByOptions] = useState<string[]>(['age', 'treatment', 'samplelocation']);
    const [colorBy, setColorBy] = useState<string>('treatment');
    const [isColorByDisabled, setIsColorByDisabled] = useState(true);
    const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
    const newScatterColors: { [key: string]: string } = {}; // Define el tipo explícitamente
    const [configFile, setconfigFile] = useState({} as any);
    const [selectedColumnRemove, setSelectedColumnRemove] = useState('');
    const [columnOptions, setColumnOptions] = useState([]);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set(['cecum', 'feces', 'ileum']));
    const [valueOptions, setValueOptions] = useState<any[]>([]);
    const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
    const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
    const [loaded, setLoaded] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [isGeneratingDataset, setIsGeneratingDataset] = useState(false);
    const [records, setRecords] = useState(0);
    const [isDatasetReady, setIsDatasetReady] = useState(false);
    const [columnsWithFewerThanTwoUniqueValues, setColumnsWithFewerThanTwoUniqueValues] = useState([]);
    const [Location, setLocation] = useState<string[]>([
        "cecum",
        "feces",
        "ileum",
    ]);
    const [selectedRank, setSelectedRank] = useState("Genus");
    let colorIndex = 0;
    const initialLocations = ["cecum", "feces", "ileum"]; // Ejemplo de ubicaciones disponibles
    const [allSelected, setAllSelected] = useState(true);
    const [confirmedLocations, setConfirmedLocations] = useState([]);
    const [loadcsv, setLoadcsv] = useState(false);
    const [selectedColorBy, setSelectedColorBy] = useState("samplelocation");
    const [activeIndex, setActiveIndex] = useState(0);
    const [abundanceData, setAbundanceData] = useState<any>();
    const [showLefsePlot, setShowLefsePlot] = useState(false);
const [message, setMessage] = useState<ReactNode | null>(null);
const [tempfile, setTempFile] = useState<any>();
const [dataExist, setDataExist] = useState(false);
const taxonomyOptions = [
    "Phylum",
    "Class",
    "Order",
    "Family",
    "Genus",
    "Species"
];


    const colors = [
        "#FFA726", // Naranja

        "#8C8C8C", // Gris medio
        "#FF7043", // Naranja rojizo
        "#616161", // Gris oscuro
        "#092538", // Azul oscuro principal
      "#2E4057", // Azul petróleo oscuro
      "#415a55", // Verde azulado oscuro (color adicional que querías incluir)
    
    
      // Amarillos y naranjas
      "#FEF282", // Amarillo claro principal
      "#F6C324", // Amarillo mostaza
     
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
    const tooltipTargetId = 'info-icon';
    const [actualcolumn, setActualcolumn] = useState("treatment")
    const customTemplate = (item: any, options: { index: number; }) => (
        <React.Fragment>
            <Link href={"/abundancedif/dataexploration"}>  <Button 
                    className="p-button-rounded p-button-success bg-gray-100" 
                    icon="pi pi-arrow-right" 

                    style={{width: '2rem', height: '2rem'}} 
                />
            </Link>
              
            </React.Fragment>
    );
        
    const items = [
        {
            label: 'Select Filters'
        },
        {
            label: 'Filtered Results',
        },
        {
            // El tercer item es más grande y actúa como un botón con un icono
            label: 'Go to analysis',
            template: customTemplate
        }
    ];

    const { accessToken } = useAuth();

    const toast = useRef<any>(null);

      // Función que simula el proceso de generación del dataset y activa el botón "Ver gráfico"
      const simulateDatasetGeneration = () => {
        // Simula la generación del dataset
        setIsDatasetReady(true);
    };

    const accept = () => {
        if (toast.current) {
            toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
        }
    };

    const reject = () => {
        if (toast.current) {
            toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    };

    const handleViewGraph = () => {
     setActiveIndex(2)
        console.log(abundanceData)
    };

  
    useEffect(() => {if(message!== null){ setLoadcsv(true)}}, [message])





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
            const combinedOptions = Array.from(new Set([...colorByOptions, ...configfile.configFile.columns])) as any[];
            
            setColorByOptions(combinedOptions as never[]);
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
        }
    };



    const fetchDataAbundance = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/loadlefse/${params.slug}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                body: JSON.stringify({
                    "group": colorBy,
                    "taxa_rank": selectedRank,
                }),

            }
            );

            const result = await response.json();
            setAbundanceData(result);
            setColumnOptions(result.columnsmeta);   
            console.log(result) 
            if (result.data.length > 0) {
                setDataExist(true);
            }else{setDataExist(false)}
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const fetchDataAbundanceFilter = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/loadlefse/${params.slug}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                body: JSON.stringify({
                    "group": colorBy,
                    "taxa_rank": selectedRank,
                }),

            }
            );

            const result = await response.json();
            setAbundanceData(result);
            console.log(result) 
            if (result.data.length > 0) {
                setDataExist(true);
            }else{setDataExist(false)}
            // setIsDatasetReady(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    const checktempfile = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/abundancedifdata/exploration/${params.slug}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },

            }
            );

            const result = await response.json();
            const temp = result?.status_code === 200 ? true : false;
            setTempFile(temp);
            console.log(result)
            // setIsDatasetReady(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    useEffect(() => {checktempfile(accessToken)}, [accessToken]);
    useEffect(() => {console.log(tempfile)}, [tempfile]);   

    useEffect(() => {
        fetchDataAbundance(accessToken);

}, [params.slug, accessToken]);
    const handleLocationChange = (location: string) => {
        let updatedSelectedLocations: string | any[] | ((prevState: string[]) => string[]);

        if (location === "Todas") {

            if (allSelected) {
                updatedSelectedLocations = [];
                console.log("jjjnkjnbkl")

            } else {
                updatedSelectedLocations = [...initialLocations];
            }
            setAllSelected(!allSelected);
        } else {
            // Verifica si la ubicación ya está seleccionada
            if (selectedLocations.includes(location)) {
                // Asegúrate de que no estás desmarcando la última ubicación
                if (selectedLocations.length === 1) {
                    return; // No permitir desmarcar si es la última seleccionada
                }
                updatedSelectedLocations = selectedLocations.filter(loc => loc !== location);
            } else {
                updatedSelectedLocations = [...selectedLocations, location];
            }
            setAllSelected(updatedSelectedLocations.length === initialLocations.length);
        }
        if (updatedSelectedLocations.length >= 2) {
            setSelectedColorBy("samplelocation"); // Fix: Update the argument to be an array of strings
            setSelectedValues(new Set(updatedSelectedLocations)); // Fix: Convert the array to a Set
        }
        setSelectedLocations(updatedSelectedLocations);

    };
    // Función para manejar la confirmación de la selección
    const handleConfirmSelection = () => {
        console.log("Ubicaciones seleccionadas:", selectedLocations);
        console.log("ColorBy seleccionado:", selectedColorBy);
        console.log("Valores seleccionados:", selectedValues);
        // Aquí puedes realizar más acciones como enviar los datos a un API, etc.
    };

    const handleColorByChange = (option: SetStateAction<string>) => {
        setSelectedColorBy(option);
    };

    const handleValueChange = (value: string) => {
        setSelectedValues(prevSelectedValues => {
            const newSelectedValues = new Set(prevSelectedValues);

            // Si el valor está presente, lo eliminamos (excepto si es uno de los últimos 2, para asegurar el mínimo de 2)
            if (newSelectedValues.has(value) && newSelectedValues.size > 2) {
                newSelectedValues.delete(value);
            } else if (!newSelectedValues.has(value) && newSelectedValues.size < 3) {
                // Si el valor no está presente, lo añadimos (hasta un máximo de 3)
                newSelectedValues.add(value);
            }

            return newSelectedValues;
        });
    };


    // Componente de checks para los valores de la columna seleccionada
    const valueChecks = (
        <div className="flex flex-col w-full overflow-x-scroll mb-5 mt-5">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Select your groups of interest</h3>
            <div className="flex w-full flex-col overflow-x-scroll items-start">
                {valueOptions.filter(value => value !== null).map((value, index) => (
                    <div key={index} className="flex w-full items-start overflow-x-scroll mb-2 ">
                        <div key={`value-${index}`} className="flex items-center">
                        <Checkbox
                id={`value-${index}`}
                onChange={() => handleValueChange(value)}
                checked={selectedValues.has(value)}
                className="mr-2"
            />
                            <label htmlFor={`value-${index}`} className="ml-2 text-md">{value}</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    useEffect(() => {
        if (otus && selectedColorBy) {
            // Filtrar los valores únicos de la columna seleccionada
            const columnIndex = otus?.data?.columns.indexOf(selectedColorBy);
            const uniqueValues: Set<string> = new Set(dataUnique?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
            const uniqueValuesCheck: Set<string> = new Set(otus?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));

            setValueOptions([...uniqueValues].filter(value => value !== 'null'));

            // Inicializa 'selectedValues' con todos los valores únicos
            setSelectedValues(new Set<string>([...uniqueValuesCheck].slice(0, 2)));

        }
    }, [selectedColorBy]);

    useEffect(() => {
        if (dataUnique) {
            // Iterar sobre cada columna en los datos
            const columnsWithFewValues = otus.data.columns.filter((column: any, columnIndex: string | number) => {
                // Crear un Set para almacenar los valores únicos de la columna actual
                const uniqueValuesSet = new Set(otus.data.data.map((item: { [x: string]: any; }) => item[columnIndex]));

                // Filtrar valores 'null' o 'undefined'
                const filteredUniqueValues = [...uniqueValuesSet].filter(value => value != null && value !== 'null');

                // Devuelve true si la columna tiene menos de dos valores únicos
                return filteredUniqueValues.length < 2;
            });

            // Actualizar el estado con las columnas que tienen menos de dos valores únicos
            setColumnsWithFewerThanTwoUniqueValues(columnsWithFewValues);

            // Acciones basadas en el resultado
            if (columnsWithFewValues.length > 0) {
                console.log("Columnas con menos de dos valores únicos:", columnsWithFewValues);
                // Puedes manejar aquí lo que necesites hacer con esta información
            } else {
                console.log("Todas las columnas tienen al menos dos valores únicos.");
            }
        }
    }, [dataUnique]);


useEffect(() => {console.log(abundanceData)}, [abundanceData]);

    useEffect(() => {
        if (columnsWithFewerThanTwoUniqueValues.length > 0) {
            const columnIndex = otus?.data?.columns.indexOf(selectedColorBy);

            const filteredValueOptions = colorByOptions.filter(option =>
                !columnsWithFewerThanTwoUniqueValues.includes(option as never) // Assuming 'columnName' is the property that indicates the name of the column in your valueOptions objects
            );

            // Update colorByOptions with the filtered list
            console.log(filteredValueOptions);
            
            setColorByOptions(filteredValueOptions);
        }
    }, [configFile])


    useEffect(() => {
        console.log(columnsWithFewerThanTwoUniqueValues)
    }, [selectedValues]);

    useEffect(() => {
        const columnIndex = otus?.data?.columns.indexOf(selectedColumn);
        fetchConfigFile(accessToken);
    }, [accessToken]);


    useEffect(() => {
        console.log(valueOptions);
        console.log(colorByOptions)
    }

        , [valueOptions]);

   
        const applyFilters = () => { setActualcolumn(colorBy); fetchDataAbundanceFilter(accessToken)  }

          const filter = (
            <div className={`flex flex-col w-full h-full  rounded-lg  dark:bg-gray-800 `}>
                <div className={`tab-content `}>
                <div>
     <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">Select a rank option</h3>
                <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    {taxonomyOptions.map((option, index) => (
                        <option key={index} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                    ))}
                </select>
</div>
    
    
                </div>
    
                <div className="mt-10">
    
                    <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Group</h3>
                    <ul className="flex flex-wrap justify-between">
              
                    <select value={colorBy} onChange={(e) => setColorBy(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        {colorByOptions.map((option, index) => {
                            if (columnOptions && columnOptions?.includes(option as never)) {
                                return (
                                    <option key={index} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                );
                            }
                            return null;
                        })}
                    </select>
                        
                    </ul>
                </div>
    

                <div className="mt-10">
    
                    <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Subgroup</h3>
                    <ul className="flex flex-wrap justify-between">
              

                    <select value={colorBy} disabled   onChange={(e) => setColorBy(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        {colorByOptions?.map((option, index) => {
                            if (columnOptions && columnOptions?.includes(option as never)) {
                                return (
                                    <option key={index} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                );
                            }
                            return null;
                        })}
                    </select>

                        
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


     

    return (
        <div className="h-full">
            <SidebarProvider>
                <Layout slug={params.slug} filter={""} >
                    <div className="">
                    <Tooltip target={`#${tooltipTargetId}`} content="Differential abundance analysis identifies species that vary significantly in abundance between different environments or conditions, providing insights into biological and ecological changes." />
                         <Card title={
                <div className="flex items-center text-center w-full justify-center">
                            <h1 className="text-3xl my-5 mx-2">Differential abundance: {configFile?.taxonomic_composition?.title ?? "Taxonomy diversity"}</h1>
                    <AiOutlineInfoCircle id={tooltipTargetId} className="ml-2 cursor-pointer text-xl" />
                </div>
            }>     
 <div className="px-6 py-8">
                            <div className={`prose ${configFile?.taxonomic_composition?.text ? 'single-column' : 'column-text'}`}>
    <p className="text-gray-700 text-justify text-xl">
        {configFile?.taxonomic_composition?.text}
    </p>
</div>

                            </div>
<div className="flex justify-center items-center">
  {tempfile ? (
    <div className="flex flex-col h-full">   <GraphicCard filter={filter} legend={""} title={""}>
        {abundanceData ? (
dataExist ? 
    <LefsePlot data={abundanceData} />
: (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow">
    <i className="pi pi-exclamation-triangle text-3xl text-yellow-500"></i> {/* Icono de PrimeReact */}
    <p className="mt-2 text-base text-gray-700">
        Our analysis found no significant differences with the current settings.
    </p>
    <p className="text-sm text-gray-600">
        Please try different options for data visualization.
    </p>

</div>

)    ) : (
            <SkeletonCard width={"500px"} height={"270px"} />
        )}
    </GraphicCard>
    <div className="w-full flex flex-row ">
                                <div className="w-1/4"></div>
                                <div className="px-6 py-8 w-4/5" >
                                    <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        {Object.entries(configFile?.taxonomic_composition?.graph || {}).map(([key, value]) => {
                                        if (key === "samplelocation"  && typeof value === 'string') {
                                        
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
                                            if (key !== "" && key !== "samplelocation") {
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
    <div className="text-center">
  <Spinner/>
    </div>
  )}


</div>
           
                        </Card>
                    </div>
                </Layout>
            </SidebarProvider>
        </div>
    );
}
