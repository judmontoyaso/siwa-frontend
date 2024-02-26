    "use client";
    import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, SetStateAction, useEffect, useState } from "react";
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
        const [selectedLocations, setSelectedLocations] = useState<string[]>(['cecum', 'feces', 'ileum']);
        const [availableLocations, setAvailableLocations] = useState<string[]>([]);
        const [selectedColumn, setSelectedColumn] = useState("");
        const [shannonData, setShannonData] = useState([]);
        const [observedData, setObservedData] = useState({});
        const [currentLocation, setCurrentLocation] = useState('');
        const [colorByOptions, setColorByOptions] = useState([]);
        const [colorBy, setColorBy] = useState<string>('none');
        const [isFilterCardVisible, setIsFilterCardVisible] = useState(false);
        const [isColorByDisabled, setIsColorByDisabled] = useState(true);
        const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
        const newScatterColors: { [key: string]: string } = {}; // Define el tipo explícitamente
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

        const fetchData = async (token: any) => {

            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/projects/taxonomy/${params.slug}`, {
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
            fetchToken().then((token) => {fetchData(token); });
        }, [params.slug]);



        useEffect(() => {
            if (otus && otus.data) {
              const traces: SetStateAction<any[]> = [];
              const labels = Array.from(new Set(otus.data.data.map((item: any[]) => item[0]))); // Extrae etiquetas únicas
        
              labels.forEach(label => {
                const filteredData = otus.data.data.filter((item: any[]) => item[0] === label);
                const xValues = filteredData.map((item: any[]) => item[1]); // 'samplelocation'
                const yValues = filteredData.map((item: any[]) => item[3]); // 'AbundanceScaled'
        
                traces.push({
                  x: xValues,
                  y: yValues,
                  type: 'bar',
                  name: label,
                  marker: { color: colors[traces.length % colors.length] }, // Opcional: asigna colores de la lista predefinida
                });
              });
        
              setPlotData(traces);
            }
          }, [otus]);
        

        return (
            <div>
            <Layout slug={params.slug} filter={""}>
                {isLoaded ? (
                    <>
                        <div className="flex flex-row justify-evenly w-full items-center">
                            <div className="flex-grow">
                            <Plot
        data={plotData}
        layout={{
          barmode: 'stack', // Cambiado a 'stack' para apilar las barras
          plot_bgcolor: 'white',
          yaxis: { title: 'Relative Abundance' },
          xaxis: { title: 'Sample Location' },
        }}
      />
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
