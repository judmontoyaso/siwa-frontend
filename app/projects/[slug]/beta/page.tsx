"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Loading from "@/app/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { useRouter } from "next/navigation";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import { useAuth } from "@/app/components/authContext";
import Spinner from "@/app/components/pacmanLoader";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { BiScatterChart } from "react-icons/bi";
import Link from "next/link";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Dropdown } from "primereact/dropdown";
import { Config } from "plotly.js";



export default function Page({ params }: { params: { slug: string } }) {
  type OtuType = {
    index: string[];
    columns: string[];
    data: number[][];
  };
  const { accessToken } = useAuth();
  const { user, error, isLoading } = useUser();  const [isLoaded, setIsLoaded] = useState(false);
  const [plotData, setPlotData] = useState<
    { type: string; y: any; name: string }[]
  >([]);
  const [otus, setOtus] = useState<OtuType | null>(null);
  const [scatterData, setScatterData] = useState([]);
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
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isColorByDisabled, setIsColorByDisabled] = useState(true);
  const [colorBy, setColorBy] = useState<string>('samplelocation');
  const [selectedColorBy, setSelectedColorBy] = useState<string>('samplelocation');
  const [colorByOptions, setColorByOptions] = useState([]);
  const [tittleVariable, SetTittleVariable] = useState<string>('location');
  const [isTabFilterOpen, setIsTabFilterOpen] = useState(false);
  const [dataResult, setDataResult] = useState<any>(null);
  const [betaText, setBetaText] = useState({} as any);
  const [configFile, setconfigFile] = useState({} as any);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [dataUnique, setDataUnique] = useState<any>();
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const[filterPeticion, setFilterPetition] = useState(false);
  const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');
  const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
  let colorIndex = 0;
  const newScatterColors: { [key: string]: string } = {};


  const router = useRouter();

  const items = [
    { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
      { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
    { label: 'Community make-up', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/beta`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };



  const colorsLocation = [

    "#FFA726", // Naranja

    "#8C8C8C", // Gris medio
    "#FF7043", // Naranja rojizo
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

  const [colorOrder, setColorOrder] = useState<string[]>([]);

  const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
  const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
  const [loaded, setLoaded] = useState(false);
  const [valueOptions, setValueOptions] = useState<any[]>([]);


  const colorPalettes = {
    samplelocation: ["#074b44", "#017fb1", "#f99b35"],
    treatment: ["#035060", "#f99b35", "#4e8e74"],
    timepoint: ["#8cdbf4", "#f7927f", "#f7e76d"],
    
};



useEffect(() => {
    if (theRealColorByVariable && colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]) {
        setColorOrder(colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]);
    }
console.log(colorOrder)
}, [scatterData]);



    const updatePlotWidth = () => {

        if (plotContainerRef.current) {
            setPlotWidth((plotContainerRef.current as HTMLElement).offsetWidth - 75);
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

    }, [otus]);



  const shuffleColors = () => {
    let shuffled = colors
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setColorOrder(shuffled);
  };

  // useEffect(() => {
  //   shuffleColors();  // Aleatoriza los colores al montar y cada vez que cambian los datos
  // }, [scatterData]);


// useEffect(() => {setTheRealColorByVariable(selectedColorBy)}, [scatterData]);

  const fetchConfigFile = async (token: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/configfile/${params.slug}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Enviar el token
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const configfile = await response.json(); // Asume que las opciones vienen en un campo llamado 'configfile'
      console.log(configfile);
      setconfigFile(configfile?.configFile);
      setBetaText(configfile?.configFile?.betadiversity);
      setColorByOptions(configfile?.configFile?.columns); // Actualiza el estado con las nuevas opciones
    } catch (error) {
      console.error("Error al cargar las opciones del dropdown:", error);
    }
  };

  const handleLocationChange = (event: any) => {
    console.log(event)
console.log(colorBy)
    if (event === 'all') {
      setSelectedLocations(["cecum", "feces", "ileum"]);
      setIsColorByDisabled(true);
    } else {
      setSelectedLocations([event]);
      setIsColorByDisabled(false);

    }
  };

  const handleLocationChangeColorby = (event: any) => {
      setColorBy(event.target.value);
      // fetchProjectIdsFiltercolor(dataResult, event.target.value);
    

    console.log(event.target.value)
console.log(selectedLocations)
console.log(colorBy)
  };

    // Definir una función genérica para realizar el fetch
    const fetchData = async (token: any) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/beta/${params.slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "samplelocation": selectedLocations,
            "column": colorBy,
            "columnValues" : selectedLocations
        }),        }
        );
        if (!response.ok) {
          // toast.warn('The data needs to be loaded again!', {
          //   position: "top-center",
          //   autoClose: 5000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: "light",
          //   transition: Bounce,
          // });
          // setTimeout(() => { window.location.href = "/"; }, 5000);
          // throw new Error("Respuesta no válida desde el servidor");
        }
  
        const result = await response.json();
        console.log(result);
        setDataResult(result);
        setColumnOptions(result?.data?.columns);
        setDataUnique(result);

        setValueOptions(result?.data?.data);
        return result; // Devolver los datos obtenidos
  
      } catch (error) {
  
        throw error; // Propagar el error para manejarlo más adelante
      }
    };

  // Definir una función genérica para realizar el fetch con filtro
  const fetchBetaDiversityData = async (token: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/beta/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "samplelocation": selectedLocations,
          "column": colorBy,
          "columnValues" : colorBy === 'samplelocation' ? selectedLocations : [...selectedValues],

      }),      }
      );
      if (!response.ok) {
        // toast.warn('The data needs to be loaded again!', {
        //   position: "top-center",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "light",
        //   transition: Bounce,
        // });
        // setTimeout(() => { window.location.href = "/"; }, 5000);
        // throw new Error("Respuesta no válida desde el servidor");
      }

      const result = await response.json();
      console.log(result);
      setDataResult(result);
      return result; // Devolver los datos obtenidos

    } catch (error) {

      throw error; // Propagar el error para manejarlo más adelante
    }
  };

  // Función para aplicar los filtros seleccionados
  const applyFilters = (event: any) => {


    // Convierte ambas matrices a cadenas para una comparación simple
    const newSelectionString = selectedLocations.join(',');
    const currentSelectionString = Location.join(',');

    // Comprueba si la nueva selección es diferente de la selección actual
      fetchBetaDiversityData(accessToken).then(result => { fetchProjectIdsFilter(result) });
      console.log(newSelectionString, currentSelectionString);
    
    isColorByDisabled || colorBy === "samplelocation" ? SetTittleVariable('location') : SetTittleVariable(colorBy.replace('_', ' '));
    setLocation(selectedLocations);
    setSelectedColorBy(colorBy);
    setFilterPetition(true);

  };

  useEffect(() => {
    if (otus && colorBy) {
        // Filtrar los valores únicos de la columna seleccionada
        const columnIndex = columnOptions.indexOf(colorBy);
        const uniqueValues: Set<string> = new Set(dataUnique?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));
        const uniqueValuesCheck: Set<string> = new Set(dataResult?.data?.data.map((item: { [x: string]: any; }) => item[columnIndex]));

        setValueOptions([...uniqueValues].filter(value => value !== 'null'));

        // Inicializa 'selectedValues' con todos los valores únicos
        setSelectedValues(new Set<string>(uniqueValuesCheck));
    }
}, [colorBy, dataResult]);

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
  
const handleGroupChange = (value: string) => {
  setTheRealColorByVariable(value);
fetchProjectIdsFiltercolor(dataResult, value);
};


// Componente de checks para los valores de la columna seleccionada
const valueChecks = (
    <div className="mb-5 mt-5">
        <div className="flex flex-row mt-4 flex-wrap">
            {valueOptions?.map((value, index) => (
            <div key={index} className="flex items-center mb-2 mr-2 ml-2">
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
      
    </div>
);


// useEffect(() => {setTheRealColorByVariable(selectedColorBy)}, [selectedColorBy]);

  const fetchProjectIds = async (result: any) => {
    console.log(newScatterColors)
    console.log(scatterColors)

    const locations = new Set(
      result?.data?.data?.map((item: any[]) => item[3])
    );
    const uniqueLocations = Array.from(locations) as string[];
    setAvailableLocations(uniqueLocations);
    setOtus(result.data); // Actualiza el estado con los datos obtenidos
    // Filtrado y mapeo de datos para los gráficos...
    const filteredData = result?.data?.data?.filter((item: any[]) =>
      selectedLocations.includes(item[3])
    );

    const groupedData = filteredData?.reduce(
      (
        acc: {
          [x: string]: {
            y: any;
            text: string[];
          };
        },
        item: any[]
      ) => {
        const location = item[3];
        const sampleId = item[2];

        // Verifica si la locación actual debe ser incluida
        if (selectedLocations.includes(location)) {
          if (!acc[location]) {
            acc[location] = { y: [], text: [] };
          }
          acc[location].text.push(`Sample ID: ${sampleId}`);
        }

        return acc;
      },
      {}
    );

    const scatterPlotData = filteredData?.reduce(
      (
        acc: {
          [x: string]: {
            y: any;
            x: any;
            text: string[];
            mode: any;
            type: any;
            name: any;
            marker: { size: number, color: string };
          };
        },
        item: [any, any, any, any]
      ) => {
        const [PC1, PC2, sampleId, sampleLocation] = item;

        // Inicializa el objeto para esta locación si aún no existe
        if (!acc[sampleLocation]) {
          acc[sampleLocation] = {
            x: [], // Add 'x' property and initialize as an empty array
            y: [],
            mode: "markers" as const, // Add 'mode' property with value 'markers'
            type: "scatter",
            name: sampleLocation,
            text: [],
            marker: { size: 8, color: colorOrder[colorIndex % colorOrder.length] }
          };
          const key = sampleLocation; // Declare 'key' variable
          newScatterColors[key] = colorOrder[colorIndex % colorOrder.length]; // Actualiza la copia con el nuevo color
          colorIndex++;
        }

        // Agrega los datos al objeto de esta locación
        acc[sampleLocation].x.push(PC1);
        acc[sampleLocation].y.push(PC2);
        acc[sampleLocation].text.push(`Sample ID: ${sampleId}`);

        return acc;
      },
      {} // Asegura que el valor inicial del acumulador es un objeto
    );
    setScatterColors(prevColors => ({ ...prevColors, ...newScatterColors }));
    setScatterData(Object.values(scatterPlotData || {}));
    const plotData = Object.keys(groupedData || {})
      .filter((location: string) => selectedLocation.includes(location))
      .map((location: string) => ({
        type: "box",
        y: groupedData[location].y,
        text: groupedData[location].text,
        hoverinfo: "y+text",
        name: location,
      }));

    setPlotData(
      Object.keys(groupedData || {})?.map((location) => ({
        ...groupedData[location],
        type: "box",
        name: location,
      }))
    );

    setIsLoaded(true);

  }

  const fetchProjectIdsFiltercolor = async (result: any, color: any) => {
    console.log(newScatterColors)
    console.log(scatterColors)
    try {

      const isAllLocationsSelected = selectedLocations.length === 3 && ["cecum", "feces", "ileum"].every(location => selectedLocations.includes(location));
      // Determinar si "None" está seleccionado en "Color By"

      color === 'samplelocation';
      const scatterPlotData = result.data.data.reduce((acc: { [x: string]: any }, item: any) => {
        const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
        const colorValue = color !== 'samplelocation' ? item[result.data.columns.indexOf(color)] : sampleLocation;

        let key = sampleLocation; // Por defecto, usa la locación como clave
        let name = `${sampleLocation}`;
        // Si "All" no está seleccionado en las locaciones y "Color By" no es "samplelocation", 
        // usa el valor seleccionado en "Color By" para colorear
        if (!isAllLocationsSelected && color !== 'samplelocation') {
          key = color !== 'samplelocation' ? colorValue : sampleLocation;
          name = color !== 'samplelocation' ? `${colorValue}` : `Location: ${sampleLocation}`;
        }

        if (!acc[key]) {
          acc[key] = {
            x: [],
            y: [],
            mode: "markers",
            type: "scatter",
            name: name,
            text: [],
            marker: { size: 8, color: colorOrder[colorIndex % colorOrder.length] }
          };
          newScatterColors[key] = colorOrder[colorIndex % colorOrder.length]; // Actualiza la copia con el nuevo color
          colorIndex++;
        }

        acc[key].x.push(PC1);
        acc[key].y.push(PC2);
        acc[key].text.push(`Sample ID: ${sampleId}, ${color === "samplelocation" ? "location" : color}: ${colorValue}`);

        return acc;
      }, {});
      setScatterColors(prevColors => ({ ...prevColors, ...newScatterColors }));
      isColorByDisabled || color === "samplelocation" ? SetTittleVariable('location') : SetTittleVariable(color.replace('_', ' '));
      setScatterData(Object.values(scatterPlotData));
      setIsLoaded(true);
    } catch (error) {
      console.error("Error al obtener projectIds:", error);
    }
  };
  
  const fetchProjectIdsFilter = async (result: any) => {

    const newScatterColors = { ...scatterColors }; // Crea una copia del estado actual
    try {

      const isAllLocationsSelected = selectedLocations.length === 3 && ["cecum", "feces", "ileum"].every(location => selectedLocations.includes(location));
      // Determinar si "samplelocation" está seleccionado en "Color By"
      colorBy === 'samplelocation';
      const scatterPlotData = result.data.data.reduce((acc: { [x: string]: any }, item: any) => {
        const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
        const colorValue = colorBy !== 'samplelocation' ? item[result.data.columns.indexOf(theRealColorByVariable)] : sampleLocation;

        let key = sampleLocation; // Por defecto, usa la locación como clave
        let name = `${sampleLocation}`;
        // Si "All" no está seleccionado en las locaciones y "Color By" no es "samplelocation", 
        // usa el valor seleccionado en "Color By" para colorear
        if (!isAllLocationsSelected && theRealColorByVariable !== 'samplelocation') {
          key = theRealColorByVariable !== 'samplelocation' ? colorValue : sampleLocation;
          name = theRealColorByVariable !== 'samplelocation' ? `${colorValue}` : `Location: ${sampleLocation}`;
        }

        if (!acc[key]) {
          acc[key] = {
            x: [],
            y: [],
            mode: "markers",
            type: "scatter",
            name: name,
            text: [],
            marker: { size: 8, color: colorOrder[colorIndex % colorOrder.length] }
          };
          newScatterColors[key] = colorOrder[colorIndex % colorOrder.length]; // Actualiza la copia con el nuevo color
          colorIndex++;
        }

        acc[key].x.push(PC1);
        acc[key].y.push(PC2);
        acc[key].text.push(`Sample ID: ${sampleId}, ${theRealColorByVariable === "samplelocation" ? "location" : theRealColorByVariable}: ${colorValue}`);
        scatterColors[key] = colorOrder[colorIndex % colorOrder.length];
        return acc;
      }, {});

      setScatterColors(prevColors => ({ ...prevColors, ...newScatterColors }));
      setScatterData(Object.values(scatterPlotData));
      console.log(newScatterColors)
      console.log(scatterColors)
      setIsLoaded(true);
      setFilterPetition(false);
    } catch (error) {
      console.error("Error al obtener projectIds:", error);
      setFilterPetition(false);
    }
  };


  useEffect(() => {
    if (availableLocations.length === 1) {
      // Si solo hay una ubicación disponible, selecciónala automáticamente
      const uniqueLocation = availableLocations[0];
      handleLocationChange(uniqueLocation); // Asume que esta función actualiza tanto `selectedLocations` como `currentLocation`
    }
  }, [availableLocations]); // Dependencia del efecto
  


  useEffect(() => {

      fetchConfigFile(accessToken);
      fetchData(accessToken).then((result) => { console.log(result); fetchProjectIds(result) })
    
  }
    , [params.slug, accessToken]);
    const [activeIndexes, setActiveIndexes] = useState([0,1]);

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



    const dropdownOptions = [{ label: 'Sample Location', value: 'samplelocation' },
    {label:'All Locations', value:'all'}, // Opción predeterminada
    ...availableLocations
      .map(option => ({
          label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
          value: option
      }))]

  const filter = (
    <div className={`flex flex-col w-full rounded-lg  dark:bg-gray-800 `}>
   <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">    
      <AccordionTab header="Color by" className="mb-4">
    

                <div>

                <Dropdown
      value={theRealColorByVariable}
      options={dropdownOptionsColorby}
      onChange={(e) => handleGroupChange(e.target.value)}
      optionLabel="label"
      className="w-full"
      />


        

          </div>
          </AccordionTab>
                <AccordionTab header="Filter by">
        <div className="flex flex-col items-left  mt-2 mb-4">

        <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Select a Sample Location</h3>
     
          

          <Dropdown 
            id="location"
            value={selectedLocation === "all" ? selectedLocation : selectedLocations[0]}
            options={dropdownOptions}
            onChange={(e) => handleLocationChange(e.value)}
            disabled={availableLocations.length === 1}
            className="w-full"
        />
        </div>  
      
        <div className=" mt-8 mb-4">

       
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white my-tooltip whitespace-pre">
        Filtering <span>options <AiOutlineInfoCircle className="text-sm mb-1 cursor-pointer text-siwa-blue inline-block" data-tip data-for="interpreteTip" id="group" /></span>
      </h3>     
                                    <Tooltip
                                        style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "8px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
                                        anchorSelect="#group">
                                        <div className={`prose single-column w-28 z-50`}>
                                            <p>Select options to include in the plot.</p>
                                         
                                        </div>
                                    </Tooltip>
                                    
                                             <ul className="w-full flex flex-wrap items-center content-center justify-around">
            <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1">
              <input type="radio" id="samplelocation" name="samplelocation" value="samplelocation" className="hidden peer" required checked={isColorByDisabled ? true : colorBy === 'samplelocation'}
                onChange={handleLocationChangeColorby}
                disabled={isColorByDisabled} />
              <label htmlFor="samplelocation" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700  dark:peer-checked:text-white peer-checked:border-siwa-blue peer-checked:text-white  ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                <div className="block">
                  <div className="w-full text-center flex justify-center">Sample location</div>
                </div>
              </label>
            </li>
            <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1">
              <input type="radio" id="treatment" name="treatment" value="treatment" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'treatment'}
                onChange={handleLocationChangeColorby}
                disabled={isColorByDisabled} />
              <label htmlFor="treatment" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-white peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                <div className="block">
                  <div className="w-full">Treatment</div>
                </div>
              </label>
            </li>
           { columnOptions?.includes("age" as never) && (
            <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1">
            <input type="radio" id="age" name="age" value="age" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'age'}
                onChange={handleLocationChangeColorby} />
              <label htmlFor="age" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"}  cursor-pointer hover:text-gray-600 hover:bg-gray-100  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                <div className="block">
                  <div className="w-full">Age</div>
                </div>
              </label>
            </li>)}
            {colorByOptions?.map((option, index) => (
              <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1" key={index}>
                <input
                  type="radio"
                  id={option}
                  name={option}
                  className="hidden peer"
                  value={option}
                  checked={isColorByDisabled ? false : colorBy === option}
                  onChange={handleLocationChangeColorby}
                  disabled={isColorByDisabled}
                />
                <label
                  htmlFor={option}
                  className={`flex items-center justify-center ${isColorByDisabled
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'
                    } w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                >
                  <div className="block">
                    <div className="w-full">{(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div>

   
        <div className=" mt-4 mb-4">
        {valueChecks}

        </div>
     
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

         
        </AccordionTab>
            </Accordion>
    </div>
    );




  type ScatterData = {
    name: string;
    // Add other properties as needed
  };

  type ScatterColors = {
    [key: string]: string;
    // Add other properties as needed
  };

  const CustomLegend = ({ scatterData, scatterColors }: { scatterData: ScatterData[]; scatterColors: ScatterColors }) => (
    <div className="flex w-full flex-grow items-start" style={{ marginLeft: '5px' }}>
      {scatterData.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft:'10px' }}>
          <div className="rounded-full" style={{ width: '15px', height: '15px', backgroundColor: scatterColors[entry.name], marginRight: '10px' }}></div>
          <div className="text-sm text-gray-500">{entry.name}</div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    console.log(Location)
    console.log(selectedLocations)
    
    setLocation(availableLocations.length > 1 ? selectedLocations : [availableLocations[0]]);
}, [params.slug, scatterData]);

const title = ( `Compositional differences (bray curtis) ${Location.length === 3  ? " in All Locations" : " in " + Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) + (selectedColorBy === "samplelocation" ? "" : " by " + selectedColorBy.charAt(0).toUpperCase() + (selectedColorBy as string).replace('_', ' ').slice(1))}`)


  const MyPlotComponent = ({ scatterData, scatterColors }: { scatterData: any[]; scatterColors: any }) => (
    <div className="flex flex-row w-full items-center">
      <div className="w-full " ref={plotContainerRef}>
      {loaded && (
      <Plot
        data={scatterData}
        config={config}
        layout={{
          width: plotWidth || undefined, // Utiliza plotWidth o cae a 'undefined' si es 0
          height: 600,
          font: { family: 'Roboto, sans-serif' },
          title: {
            font: { 
              family: 'Roboto, sans-serif',
              size: 26,
            }
          },          
          xaxis: {
            title: {
              text: `PC1 (${dataResult.proportions_explained.PC1}%)`,
              font: { 
                family: 'Roboto, sans-serif',
                size: 18,
              },
              standoff: 15,
             
            }
          },
          yaxis: {
            title: {
              text: `PC2 (${dataResult.proportions_explained.PC2}%)`,
              font: {
                family: 'Roboto, sans-serif',
                size: 18, // Aumenta el tamaño para mayor énfasis
              },
              standoff: 15,
            }
          },
          showlegend: true,  // Activa la visualización de la leyenda
          legend: {
              orientation: "h", // Horizontal
              x: 0.5, // Centrado respecto al ancho del gráfico
              xanchor: "center", // Ancla en el centro
              y: 1.1, // Posición en y un poco por encima del gráfico
              yanchor: "top", // Ancla la leyenda en la parte superior
              
          },
                    margin: { l: 60, r: 10, t: 0, b: 60 } 

        }}
      />)}
      </div>

    </div>

  );

  const legend =(      <div className="w-full flex flex-row overflow-x-scroll max-h-full items-start justify-center mt-5">
 <div>
  {/* <h2 className=" text-base text-gray-700 w-full font-bold mr-1">{selectedColorBy === "samplelocation" ? "Sample Location" : selectedColorBy.charAt(0).toUpperCase() + (selectedColorBy as string).replace('_', ' ').slice(1)}</h2> */}
  </div> 
  <div>

  <CustomLegend scatterData={scatterData} scatterColors={scatterColors} />
  </div>
</div>)

  return (
    <div className="w-full h-full">
      <SidebarProvider>
      <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home} />}>
        {isLoaded ? (
<div className="flex flex-col w-11/12 mx-auto">
<div className="flex flex-row w-full text-center justify-center items-center">
<h1 className="text-3xl my-5 mx-2">Beta diversity</h1>
<AiOutlineInfoCircle className="text-xl cursor-pointer text-blue-300" data-tip data-for="interpreteTip" id="interpreteTip"/> 
         <Tooltip 
           style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "20px",textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"}}
         anchorSelect="#interpreteTip">
        <div className={`prose single-column w-96 z-50`}>
    {configFile?.betadiversity?.interpretation ? (
             <p className="text-gray-700 text-justify text-xl m-3">
             {configFile?.betadiversity?.interpretation}
         </p>
            
    ) : (""
    )}
</div>
</Tooltip> 
        </div>
      <div className="px-6 py-8">

      <div className={`prose ${configFile?.betadiversity?.text ? 'single-column' : 'column-text'}`}>
    <p className="text-gray-700 text-justify text-xl">
        {configFile?.betadiversity?.text}
    </p>
</div>


    </div>
  <div className="flex">
    <GraphicCard legend={""} filter={filter} title={title}>
      {scatterData.length > 0 ? (
        <div className="w-full flex flex-col">

          <MyPlotComponent scatterData={scatterData} scatterColors={scatterColors} />
          <div className="w-full flex flex-row ">
                           
                           <div className="px-6 py-8 w-full" >
                               <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                   {Object.entries(configFile?.betadiversity?.graph || {}).map(([key, value]) => {
                                   if (key === "samplelocation" && selectedColorBy==="samplelocation"  && typeof value === 'string') {
                                   
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
                                   {Object.entries(configFile?.betadiversity?.graph || {}).map(([key, value]) => {
                                       if (key === selectedColorBy && key !== "samplelocation") {
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
        <SkeletonCard width={"500px"} height={"270px"} />
      )}
    </GraphicCard>
  </div>


</div>

        ) : (
          <div className="w-full h-full"><Spinner/></div>
          )}
        <ToastContainer />
      </Layout>
      </SidebarProvider>
    </div>
  );
}
