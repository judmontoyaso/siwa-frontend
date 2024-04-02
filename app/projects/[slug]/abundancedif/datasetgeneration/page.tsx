"use client";
import { ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
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
    const [colorByOptions, setColorByOptions] = useState<string[]>(['age', 'treatment']);
    const [colorBy, setColorBy] = useState<string>('samplelocation');
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
    const tooltipTargetId = 'info-icon';
    const customTemplatecheck = (item: any, options: { index: number; }) => (
        <React.Fragment><> 
            <div className={`flex flex-col ${activeIndex === 2 ? 'absolute -top-1' : ''}`}>

                  <Link href={`/projects/${params.slug}/abundancedif/dataexploration`}>
                <Button 
                    className={`p-button-rounded ${activeIndex === 2 ? 'animate-bounce' : ''} ${activeIndex >= 2 ? 'p-steps-complete p-button-success' : 'bg-gray-100 border-gray-100'}`} 
                    icon="pi pi-arrow-right"
                    style={{width: activeIndex === 2 ? '3rem' : '2rem', height: activeIndex === 2 ? '3rem' : '2rem'}}
                    data-pr-tooltip="Explore Data" // Mensaje del tooltip
                    data-pr-position="top" // Posición del tooltip
                />
            </Link>
            <span className={` ${activeIndex === 2 ? 'font-bold' : ' mt-2'}`}>Go to analysis</span>
     </div>  
            </>
          
        </React.Fragment>
    );
    




        
    const items = [
        {
            label: 'Select Filters',
            index: 0,

        },
        {
            label: 'Filtered Results',
            index:1,

        },
        {
            label: 'Go to analysis',
            className: activeIndex >= 1 ? 'p-steps-complete' : '', // Agrega clase para indicar completado
            index:2,
            template: customTemplatecheck
        }
    ];
    
    useEffect(() => {
        // Verifica si 'tempfile' tiene algún contenido significativo
        const datasetExists = !!tempfile;
    
        // Si existe un dataset, ajusta 'activeIndex' al último paso
        if (datasetExists) {
            setActiveIndex(2); // Asumiendo que 2 es el índice del último paso
            setIsDatasetReady(true); // Asume que el dataset está listo si 'tempfile' existe
        }
    }, [tempfile]);
    

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

    const confirm1 = async (event: { currentTarget: any; }) => {
        const response = await fetchData(accessToken);
        const { records } = response; // Extrae 'records' de la respuesta

        // Construir una lista de registros y sus conteos
        const recordsList = Object.entries(records).map(([key, value]) => {
            return `${key}: ${Object.entries(value as string).map(([subKey, subValue]) => `${subKey}: ${subValue}`).join(', ')}`;
        });
        const data = Object.entries(records).map(([key, value]) => {
            return {
                variable: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                samples: Object.entries(value as { [s: string]: unknown }).map(([subKey, subValue]) => `${subKey}: ${subValue}`).join(', ')
            };
        });
        // Preparar el mensaje con las selecciones realizadas
     // Preparar el mensaje con las selecciones realizadas y los registros
     const message = (

            <div className="p-6 mb-5 mt-5 bg-gray-100 rounded-lg shadow-sm w-full">
                <p className="text-lg mb-5 mt-5 text-gray-800">
                A dataset has been generated containing the following samples per variable. It will be available for one hour before it&apos;s deleted, requiring re-upload.
                </p>
                <div className="mb-5">
                    <DataTable value={data}>
                        <Column field="variable" header="Variable"></Column>
                        <Column field="samples" header="Number of Samples"></Column>
                    </DataTable>
                </div>
                <div className="text-center mb-5">
    <i className="pi pi-info-circle text-green-500 text-xl mr-2 align-middle"></i>
    <p className="text-lg text-gray-800 inline align-middle">
    To explore the dataset, click on the <strong className="text-green-500 animate-pulse">green arrow</strong> step above.
</p>

</div>

                <div className="flex justify-center gap-4">
                    <Button
                        label="Back"
                        icon="pi pi-arrow-left"
                        className="p-button-rounded p-button-secondary"
                        onClick={handleCancel}
                    />
                </div>
            </div>
        )
        
    
    
    
    setMessage(message)
    };

    useEffect(() => {if(message!== null){ setLoadcsv(true)}}, [message])


    const fetchDatacsv = async (token: any | undefined) => {
        setActiveIndex(1)
        setIsGeneratingDataset(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/abundancedifdata/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "samplelocation": selectedLocations,
                    "column": selectedColorBy,
                    "columnValues": selectedColorBy === 'samplelocation' ? selectedLocations : [...selectedValues],
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
            setActiveIndex(2)
// setLoadcsv(false)
        console.log(result)
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setIsGeneratingDataset(false); 
        }
    };

    useEffect(() => {

            fetchDataAbundance(accessToken);
        
    }, [params.slug]);

    useEffect(() => {
        if (loadcsv) {
            console.log("loadcsv true")
        fetchDatacsv(accessToken)}
    else{console.log("loadcsv false")}}, [loadcsv]);


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

    const fetchData = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/abundancedif/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "samplelocation": selectedLocations,
                    "column": selectedColorBy,
                    "columnValues": selectedColorBy === 'samplelocation' ? selectedLocations : [...selectedValues],
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
                // setRecords(result.records);
                setValueOptions(result.data.data);
            }

            console.log(result);

            console.log(availableLocations, dataUnique, columnOptions, valueOptions)

            setOtus(result);

            setIsLoaded(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
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
                    "group": "treatment",
                    "taxa_rank": "Genus",
                }),

            }
            );

            const result = await response.json();
            setAbundanceData(result);
            // setIsDatasetReady(true);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

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

        // Función para restablecer los valores y volver a cargar los datos
        const handleCancel = async () => {
            // Restablece los estados a los valores predeterminados
            setSelectedColorBy("samplelocation");
            setSelectedLocations(['cecum', 'feces', 'ileum']); 
            setSelectedValues(new Set(['cecum', 'feces', 'ileum'])); 

            setIsGeneratingDataset(false); // Restablece el estado de 'isGeneratingDataset'
            setActiveIndex(0) 
            setMessage(null)
            await fetchData(accessToken).then(() => {setLoadcsv(false)});

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
        fetchData(accessToken)
    }
        , [accessToken]);

    useEffect(() => {
        console.log(valueOptions);
        console.log(colorByOptions)
    }

        , [valueOptions]);


     

    return (
        <div className="h-full">
            <SidebarProvider>
                <Layout slug={params.slug} filter={""} >
                    <div className="">
                    <Tooltip target={`#${tooltipTargetId}`} content="Differential abundance analysis identifies species that vary significantly in abundance between different environments or conditions, providing insights into biological and ecological changes." />
                         <Card title={
                <div className="flex items-center text-center w-full justify-center">
                    <span>Differential Abundance</span>
                    <AiOutlineInfoCircle id={tooltipTargetId} className="ml-2 cursor-pointer text-xl" />
                </div>
            }>                        
     {showLefsePlot? <LefsePlot data={abundanceData}/> : <> <div className="bg-yellow-100 shadow rounded-lg p-6 flex flex-col items-start mb-10 opacity-60 relative">
            <div className="flex items-center text-yellow-600 mb-2 w-full">
                <AiOutlineInfoCircle size={24} />
                <p className="text-lg font-semibold ml-2">Instructions for Dataset Generation:</p>
                <button onClick={() => setShowInstructions(!showInstructions)} className="ml-auto">
                    {showInstructions ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
            </div>
            {showInstructions && (
                <>
    <p className="mt-2 text-gray-700">To prepare your dataset for Differential Abundance (DA) analysis, please adhere to the following steps:</p>
    <ul className="list-disc list-inside space-y-2 mt-4 flex flex-col items-start text-start">
    <li>
  <strong>Select Sample Locations:</strong> You can explore the microbiome by specific locations. It&apos;s advisable to examine locations separately. However, if your aim is to identify biomarkers distinguishing between locations, you may select more than one. Options include CECUM, ILEUM, FECES.
</li>
<li>
  <strong>Select a Variable (Optional):</strong> From the experiment&apos;s factors, pick one that interests you for analysis. Factors with only a single level/category won&apos;t appear as options. This step is optional; if you prefer not to filter the dataset by any specific group, you can choose to keep all samples.
</li>

        <li>
            <strong>Select Your Groups of Interest:</strong> If a variable has been chosen, select at least 2 and at most 3 categories for the analysis. This will form the basis of your DA comparison.
        </li>
    </ul>

</> )}
</div>

                            <div className="card m-14">
   
   <Steps model={items as any} activeIndex={activeIndex} />
</div>

                            {tempfile ? (<>
    <p className="text-lg mb-4">A dataset has already been loaded.</p>
    <p className="mb-4">
        If you need to adjust or update the dataset parameters, you can regenerate the dataset. 
        Please note that regenerating the dataset will replace the current dataset and any analysis performed on it.
    </p>
    <Button
    label="Regenerate Dataset"
    icon="pi pi-refresh"
    className="p-button p-button-outlined bg-blue-500 text-white hover:bg-blue-600"
    onClick={() => {
        // Reset the necessary states and possibly make API calls to restart the process
        setTempFile(null);
        setActiveIndex(0); // Return to the first step
        setIsDatasetReady(false); // Indicate the dataset is not ready
        // Reset other states as necessary...
    }}
    data-pr-tooltip="Click to regenerate the dataset with new parameters." // Tooltip message
    data-pr-position="top" // Tooltip position
/>

</>
 ): (loadcsv ? message : (
                            <div className="p-4 flex flex-wrap justify-between gap-4">
                                {/* Selección de ubicaciones */}
                                <div className="flex-grow min-w-[25%] border p-4 rounded-lg">
                                    <h2 className="mb-4 font-semibold text-lg">Sample Location:</h2>
                                    <div className="flex flex-wrap gap-4">
                                    {initialLocations.map((location) => (
  <div key={location} className="flex items-center">
    <Checkbox
      inputId={location}
      onChange={() => handleLocationChange(location)}
      checked={selectedLocations.includes(location)}
      className="mr-2"
    />
    <label htmlFor={location} className="text-md">
      {location.charAt(0).toUpperCase() + location.slice(1)}
    </label>
  </div>
))}

                                    </div>
                                </div>
                                <div className="flex-grow min-w-[70%] border p-4 rounded-lg">
                                <h2 className="mb-4 font-semibold text-lg">Options to filter samples</h2>

                                   <div className="flex-row flex w-full">
  
           {/* Selección de ColorBy */}
                                <div className={`flex-grow border p-4 rounded-lg min-w-[45%] mr-1 `}>

                                    <div> <h3 className="mb-4 font-semibold text-lg">Variable:</h3>   
                                    <div className="grid grid-cols-1 gap-4">
  <div className="flex items-center">
    <RadioButton
      inputId="samplelocation"
      name="colorByOption"
      value="samplelocation"
      onChange={() => handleColorByChange("samplelocation")}
      checked={selectedColorBy === "samplelocation"}
      disabled={selectedLocations.length < 1}
    />
    <label htmlFor="samplelocation" className="ml-2 text-md"><p>{"Don't filter"}</p></label>
  </div>

  {colorByOptions.map((option, index) => (
    <div key={option} className="flex items-center">
      <RadioButton
        inputId={`colorByOption-${index}`}
        name="colorByOption"
        value={option}
        onChange={() => handleColorByChange(option)}
        checked={selectedColorBy === option}
        disabled={selectedLocations.length < 1}
      />
      <label htmlFor={`colorByOption-${index}`} className="ml-2 text-md">
        {option
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .replace(/^Alphad3level$/i, 'Alpha D3 Level')}
      </label>
    </div>
  ))}
</div>

                                    </div>

                                </div>


                                {/* Selección de valores */}
                                <div className={`border p-4 rounded-lg flex-grow min-w-[45%] ml-1 ${selectedColorBy !== "samplelocation" ? "" : "opacity-50 pointer-events-none"}`}>
                                    {valueOptions.length > 1 && selectedColorBy !== "samplelocation" ? valueChecks : <p className="text-md">Select a Variable to view options.</p>}
                                </div>
  
                     
                                </div> 
                                </div>

                                <div className="w-full flex justify-center mt-6">
                                    <Toast ref={toast} />
                                    <ConfirmPopup />
                                    <div className="w-full mt-6 flex flex-wrap gap-2 justify-center button-generate-cont">

                                        <Button onClick={confirm1} outlined icon="pi pi-arrow-right" iconPos="right" type="submit" label="Generate dataset" className="p-button-rounded" />
                                    </div>
                                </div>


                            </div>))}</>}
                        </Card>
                    </div>
                </Layout>
            </SidebarProvider>
        </div>
    );
}
