
"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, use, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'primereact/tooltip';
import 'react-tooltip/dist/react-tooltip.css'
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { AuthProvider, useAuth } from "@/app/components/authContext";
import LefsePlot from "@/app/components/lefsePlot";
import { Button } from 'primereact/button'; // For <Button /> component
import { Toast } from 'primereact/toast'; // For <Toast /> component
import { Card } from 'primereact/card';
import { Steps } from "primereact/steps";
import { Checkbox } from "primereact/checkbox";
import React from "react";
import Link from "next/link";
import Spinner from "@/app/components/pacmanLoader";
import { Divider } from "primereact/divider";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Dropdown } from "primereact/dropdown";
import Plotly from "plotly.js";

export default function Page({ params }: { params: { slug: string } }) {
    const { user, error, isLoading } = useUser();
    const [isLoaded, setIsLoaded] = useState(false);

    const [otus, setOtus] = useState<any>();
    const [dataUnique, setDataUnique] = useState<any>();

    const [selectedColumn, setSelectedColumn] = useState("treatment");
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
    const [recordsAll, setRecordsAll] = useState(0);
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
    const [selectedColorBy, setSelectedColorBy] = useState("Genus");
    const [isNotFilter, setIsNotFilter] = useState(false);
    const [abundanceData, setAbundanceData] = useState<any>();
    const [showLefsePlot, setShowLefsePlot] = useState(false);
    const [message, setMessage] = useState<ReactNode | null>(null);
    const [tempfile, setTempFile] = useState<any>();
    const [dataExist, setDataExist] = useState(false);
    const [filterPeticion, setFilterPeticion] = useState(false);
    const [columnGroupLoading, setColumnGroupLoading] = useState(false);
    const [userNickname, setUserNickname] = useState("");
    const [columns, setColumns] = useState([]);
    const taxonomyOptions = [
        "Phylum",
        "Class",
        "Order",
        "Family",
        "Genus",
        "Species"
    ];

    const itemsBreadcrumbs = [
        { label: 'Projects', template: (item: any, option: any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link> },
        { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
        { label: 'Diff. Abund. : Data', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}/abundancedif/datasetgeneration`}>{item.label}</Link> },
        { label: 'LEfSe', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}/abundancedif/dataexploration`}>{item.label}</Link> },

    ];

    const home = { icon: 'pi pi-home', template: (item: any, option: any) => <Link href={`/`}><i className={home.icon}></i></Link> };


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


    const updatePlotWidth = () => {

        if (plotContainerRef.current) {
            setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth);
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
                setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth);
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
    }, [abundanceData]);


    const { accessToken } = useAuth();

    useEffect(() => { if (columns?.length > 0) { setActualcolumn(columns[0]) } }, [columns])

    useEffect(() => { if (message !== null) { setLoadcsv(true) } }, [message])


    useEffect(() => { if (user?.nickname) { setUserNickname(user?.nickname) } }, [user])


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
            setconfigFile(configfile?.configFile);
            const combinedOptions = Array.from(new Set([...colorByOptions, ...configfile.configFile.columns])) as any[];

            setColorByOptions(combinedOptions as never[]);
        } catch (error) {
            console.error("Error al cargar las opciones del dropdown:", error);
        }
    };



    const fetchRecords = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/loadrecords/${params.slug}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
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
            if (!response.ok) {
                return null
            }

            const result = await response.json();
            console.log(result)
            return result.total_samples;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);

        }
    };

    useEffect(() => {
        fetchRecords(accessToken).then((result) => {
            if (result) {
                setRecords(result);
                console.log(result)
            }
        });
    }, [accessToken]);

    useEffect(() => { console.log(records) }, [records])

    const fetchcolumnscsv = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/abundancedifdata/checkcolumns/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "nickname": userNickname
                }),



            }
            );

            const { valid_columns } = await response.json();

            if (valid_columns?.length === 0) {
                console.log('No valid columns with at least two unique values');
                return;
            }
            console.log(valid_columns)
            setColumns(valid_columns);
            setColumnGroupLoading(true);
            return valid_columns;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    console.log(user?.nickname)

    const fetchDataAbundance = async (token: any | undefined, group: string) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/loadlefse/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "group": group,
                    "taxa_rank": selectedRank,
                    "nickname": userNickname
                }),

            }
            );

            const result = await response.json();
            setAbundanceData(result);
            setColumnOptions(result.columnsmeta);
            console.log(result)
            if (result?.data?.length > 0) {
                setDataExist(true);
            } else { setDataExist(false) }
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
                    "nickname": userNickname
                }),

            }
            );

            const result = await response.json();
            setAbundanceData(result);
            console.log(result)
            if (result?.data?.length > 0) {
                setDataExist(true);
            } else { setDataExist(false) }
            // setIsDatasetReady(true);
            setFilterPeticion(false);
            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
            setFilterPeticion(false);
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
                    "samplelocation": ["cecum", "feces", "ileum"],
                    "column": "samplelocation",
                    "columnValues": ["cecum", "feces", "ileum"],
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

            console.log()
            setRecordsAll(result?.records?.total_samples)

            return result;
        } catch (error) {
            console.error("Error al obtener projectIds:", error);
        }
    };

    useEffect(() => { fetchData(accessToken) }, [accessToken]);

    const checktempfile = async (token: any | undefined) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/abundancedifdata/exploration/${params.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ "nickname": userNickname }),

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







    useEffect(() => (records === recordsAll ? setIsNotFilter(true) : setIsNotFilter(false)), [recordsAll, records])

useEffect(() => {console.log("filter",isNotFilter)}, [isNotFilter])

    useEffect(() => {
        fetchConfigFile(accessToken);
    }, [accessToken]);

    useEffect(() => { checktempfile(accessToken) }, [configFile]);

    useEffect(() => {
        // Verificar si `tempfile` es true antes de ejecutar la lógica
        if (tempfile === true) {
            fetchcolumnscsv(accessToken).then((result) => {
                if (Array.isArray(result) && result?.length > 0 && userNickname !== "" && userNickname !== undefined) {
                    fetchDataAbundance(accessToken, result[0]);
                } else {
                    console.error('Received invalid or empty response:', result);
                    // Aquí puedes manejar el caso de error, como mostrar un mensaje al usuario
                }
            }).catch(error => {
                console.error('Error fetching columns:', error);
                // Manejar el error de la promesa aquí, como mostrar un mensaje de error al usuario
            });
        }
    }, [tempfile]);





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
        if (actualcolumn) {
            setColorBy(actualcolumn);
        }
    }, [actualcolumn]);


    useEffect(() => { console.log(abundanceData) }, [abundanceData]);


    const dropdownOptions = taxonomyOptions?.map(option => (
        {
            label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
            value: option
        }))


    const dropdownColumns = colorByOptions?.map((option, index) => {
        if (columnOptions && columnOptions?.includes(option as never)) {
            return (
                {
                    label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
                    value: option
                }
            );
        }
        return null;
    })

    const filteredOptions = colorByOptions.filter(option => !columnOptions || columnOptions.includes(option as never));

    const applyFilters = () => {
        setActualcolumn(colorBy);
        setSelectedColorBy(selectedRank);
        fetchDataAbundanceFilter(accessToken)
        setFilterPeticion(true);
    }

    const filter = (
        <div className={`flex flex-col w-full h-full  rounded-lg`}>
            <Card className="card-abundance colorby-acordeon border border-gray-100 rounded-xl m-2 p-8 pt-0 ">
                <div className={`tab-content `}>
                    <div className="mt-4 mb-4">
                        <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Select a taxonomic rank for display</h3>

                        <Dropdown
                            id="rank-tax"
                            value={selectedRank}
                            options={dropdownOptions}
                            onChange={(e) => setSelectedRank(e.value)}
                            className="w-full"
                        />
                    </div>


                </div>



                <div className="mt-8 mb-4">
                    <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Group</h3>
                    <ul className="flex flex-wrap justify-between">



                        <Dropdown
                            id="rank-group"
                            value={colorBy}
                            options={dropdownColumns.filter((option) => option !== null)}
                            onChange={(e) => setColorBy(e.value)}
                            className="w-full"
                        />

                    </ul>
                </div>


                <div className="mt-8 mb-4 opacity-50" aria-disabled={true}>

                    <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Subgroup</h3>
                    <ul className="flex flex-wrap justify-between">




                        <Dropdown
                            id="rank-group"
                            value={colorBy}
                            options={dropdownColumns.filter((option) => option !== null)}
                            onChange={(e) => setColorBy(e.value)}
                            className="w-full"
                            disabled
                        />


                    </ul>
                </div>

                <Divider />
                <div className="flex w-full items-center margin-0 justify-center my-10">
                    <Button
                        onClick={applyFilters}
                        loading={filterPeticion}
                        iconPos="right"
                        icon="pi pi-check-square "
                        loadingIcon="pi pi-spin pi-spinner"
                        className=" max-w-56  justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
                        label="Update"
                    />
                </div>
            </Card>

        </div>
    );

    const title = (<div className="mb-4">{`LEfSe: Differentiation of ${selectedColorBy} based on ${actualcolumn}`}</div>)





    return (
        <div className="h-full w-full">
            <SidebarProvider>
                <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={itemsBreadcrumbs as MenuItem[]} home={home} className="text-sm" />} >
                    <div className="flex flex-col w-11/12 mx-auto">
                        <div className="flex flex-row w-full text-center justify-center items-center">
                            <h1 className="text-3xl my-5 mx-2">Differential taxonomic abundance : LEfSe</h1>
                            <AiOutlineInfoCircle id={tooltipTargetId} className="ml-2 cursor-pointer text-xl" />
                        </div>

                        <Tooltip target={`#${tooltipTargetId}`} content="Differential abundance analysis identifies species that vary significantly in abundance between different environments or conditions, providing insights into biological and ecological changes." />


                        <div className="px-6 py-8">
                            <div className={`prose single-column`}>
                                <p className="text-gray-700 text-justify text-xl">
                                    This tools uses linear discriminant analysis, which allows you to make comparisons between any combination of groups to identify microbiome members that are more associated with one group vs others.  In cases with multiple treatments, sample sites, or other grouping variables, many different comparisons are possible.
                                </p>
                            </div>

                        </div>
                        <div className="flex justify-center items-center w-full">
                            {tempfile ? (
                                <div className="flex flex-col h-full w-full">   <GraphicCard filter={filter} legend={""} title={title}>
                                    {abundanceData ? (
                                        dataExist ?

                                            <div className="w-full">
                                                <div className="w-full" ref={plotContainerRef}>
                                                    <LefsePlot data={abundanceData} width={plotWidth} group={actualcolumn} />

                                                </div>
                                                <div className="w-full flex flex-row ">

                                                    <div className="px-6 py-8 w-full" >
                                                        <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                            {Object.entries(configFile?.differential_abundance?.graph || {}).map(([key, value]) => {
                                                                if (key === "samplelocation" && typeof value === 'string') {

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
    {isNotFilter && !filterPeticion && configFile?.differential_abundance?.graph ? (
        Object.entries(configFile.differential_abundance.graph.not_filter).map(([key, value]) => {
            // Construyendo la clave para comparar, ej: "treatment_species"
            const groupTaxaRankKey = `${actualcolumn}_${selectedColorBy}`;


            console.log(key)
console.log(groupTaxaRankKey)
            if (key === groupTaxaRankKey) {
                return (
                    <div key={key} className="col-span-2">
                        <p className="text-gray-700 m-3 text-justify text-xl">{value as ReactNode}</p>
                    </div>
                );
            }
            return null;
        })
    ) : (
        <div className="col-span-2">
          <p className="text-gray-700 m-3 text-justify text-xl">
        
          </p>
        </div>
      )}
    </div>
                                                    </div>
                                                </div>
                                            </div>

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

                                            )) : (
                                        <SkeletonCard width={"500px"} height={"270px"} />
                                    )}
                                </GraphicCard>

                                </div>



                            ) : (
                                <div className="text-center">
                                    <Spinner />
                                </div>
                            )}


                        </div>


                    </div>
                </Layout>
            </SidebarProvider>
        </div>
    );
}
