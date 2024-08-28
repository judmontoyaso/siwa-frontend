"use client";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, use, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { Tooltip as PTooltip } from "primereact/tooltip";
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
import { Skeleton } from "primereact/skeleton";
import { Checkbox } from 'primereact/checkbox';


export default function Page({ params }: { params: { slug: string } }) {
  type OtuType = {
    index: string[];
    columns: string[];
    data: number[][];
  };
  const { accessToken } = useAuth();
  const { user, error, isLoading } = useUser(); 
   const [isLoaded, setIsLoaded] = useState(false);
  const [plotData, setPlotData] = useState<
    { type: string; y: any; name: string }[]
  >([]);
  const [otus, setOtus] = useState<OtuType | null>(null);
  const [scatterData, setScatterData] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "Cecum",
    "Feces",
    "Ileum",
  ]);
  const [Location, setLocation] = useState<string[]>([
 
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

  const [title, setTitle] = useState<ReactNode>(<div className="w-full flex items-center justify-center"><Skeleton width="50%" height="1.5rem" /></div>);

  const router = useRouter();

  const items = [
    { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
      { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
    { label: 'Community make-up', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/beta`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };

  const [colorOrder, setColorOrder] = useState<string[]>([]);

  const [plotWidth, setPlotWidth] = useState(0); // Inicializa el ancho como null
  const plotContainerRef = useRef(null); // Ref para el contenedor del gráfico
  const [loaded, setLoaded] = useState(false);
  const [valueOptions, setValueOptions] = useState<any[]>([]);

  const colorPalettes = {
    samplelocation: ["#074b44", "#017fb1", "#f99b35", "#e57373", "#64b5f6"],
    treatment: ["#035060", "#f99b35", "#4e8e74", "#ffb74d", "#4caf50"],
    alphad3level: ["#8cdbf4", "#f7927f", "#f7e76d", "#ba68c8", "#81c784"],
};



useEffect(() => {
  if (theRealColorByVariable && colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]) {
      setColorOrder(prevOrder => {
          // Solo actualiza si el colorOrder no está ya asignado correctamente
          if (prevOrder.length === 0 || prevOrder[0] !== colorPalettes[theRealColorByVariable as keyof typeof colorPalettes][0]) {
              return [...colorPalettes[theRealColorByVariable as keyof typeof colorPalettes]];
          }
          return prevOrder;
      });
  }
}, [theRealColorByVariable]);




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
    console.log("Location Change Event:", event);
    console.log("Current colorBy:", colorBy);
  
    if (event === 'all') {
      setSelectedLocations(["Cecum", "Feces", "Ileum"]);
      setIsColorByDisabled(true);
    } else {
      setSelectedLocations([event]);
      setIsColorByDisabled(false);
    }
  };
  
  useEffect(() => {
    if (selectedLocations.length > 0) {
      applyFilters();
    }
  }, [selectedLocations]);

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

  const applyFilters = async () => {
    try {
      const result = await fetchBetaDiversityData(accessToken);
      fetchProjectIdsFilter(result);
      isColorByDisabled || colorBy === "samplelocation"
        ? SetTittleVariable('location')
        : SetTittleVariable(colorBy.replace('_', ' '));
      setLocation(selectedLocations);
      setSelectedColorBy(colorBy);
      setFilterPetition(true);
    } catch (error) {
      console.error("Error applying filters:", error);
      setFilterPetition(false);
    }
  };

  // useEffect(() => {fetchProjectIdsFiltercolor(dataResult, theRealColorByVariable)}, [theRealColorByVariable,  dataResult]);

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
  scrollZoom: false,
  modeBarButtonsToAdd: [],
};
  
const handleGroupChange = (value: string) => {
fetchProjectIdsFiltercolor(dataResult, value);
  
  setTheRealColorByVariable(value);
};



const valueChecks = (
  <div className="flex flex-col w-full mb-5 mt-5">
    <div className="flex w-full flex-row flex-wrap items-start justify-start">
      {valueOptions?.map((value, index) => {
        const stringValue = String(value);

        return (
          <div key={index} className="flex items-center mb-2 mr-2 ml-2">
            <Checkbox
              inputId={`value-${index}`}
              value={value}
              checked={selectedValues.has(value)}
              onChange={() => handleValueChange(value)}
              className=" text-blue-600"
            />
            <label htmlFor={`value-${index}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {stringValue.charAt(0).toUpperCase() + stringValue.slice(1)}
            </label>
          </div>
        );
      })}
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
              x: [],
              y: [],
              mode: "markers",
              type: "scatter",
              name: sampleLocation,
              text: [],
              marker: { size: 8, color: colorOrder[colorIndex % colorOrder.length] }
          };
          const key = sampleLocation;
          newScatterColors[key] = colorOrder[colorIndex % colorOrder.length];
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
    setScatterColors(newScatterColors);
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
    try {
        const scatterPlotData = result.data.data.reduce((acc: { [x: string]: any }, item: any) => {
            const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
            const colorValue = color !== 'samplelocation' ? item[result.data.columns.indexOf(color)] : sampleLocation;

            let key = colorValue; // Ahora se usa colorValue como clave
            let name = `${colorValue}`; // Nombre para la leyenda

            // Si el color ya está asignado, no lo reasignes
            if (!scatterColors[key]) {
                scatterColors[key] = colorOrder[colorIndex % colorOrder.length];
                colorIndex++;
            }

            if (!acc[key]) {
                acc[key] = {
                    x: [],
                    y: [],
                    mode: "markers",
                    type: "scatter",
                    name: name,
                    text: [],
                    marker: { size: 8, color: scatterColors[key] } // Usa el color asignado
                };
            }

            acc[key].x.push(PC1);
            acc[key].y.push(PC2);
            acc[key].text.push(`Sample ID: ${sampleId}, ${color === "samplelocation" ? "location" : color}: ${colorValue}`);
            return acc;
        }, {});

        setScatterData(Object.values(scatterPlotData));
        setIsLoaded(true);
    } catch (error) {
        console.error("Error al obtener projectIds:", error);
    }
};

const fetchProjectIdsFilter = async (result: any) => {
  try {
      const scatterPlotData = result.data.data.reduce((acc: { [x: string]: any }, item: any) => {
          const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
          const colorValue = theRealColorByVariable !== 'samplelocation' ? item[result.data.columns.indexOf(theRealColorByVariable)] : sampleLocation;

          let key = colorValue; 
          let name = `${colorValue}`;

          // Si el color ya está asignado, no lo reasignes
          if (!scatterColors[key]) {
              scatterColors[key] = colorOrder[colorIndex % colorOrder.length];
              colorIndex++;
          }

          if (!acc[key]) {
              acc[key] = {
                  x: [],
                  y: [],
                  mode: "markers",
                  type: "scatter",
                  name: name,
                  text: [],
                  marker: { size: 8, color: scatterColors[key] } // Usa el color asignado
              };
          }

          acc[key].x.push(PC1);
          acc[key].y.push(PC2);
          acc[key].text.push(`Sample ID: ${sampleId}, ${theRealColorByVariable === "samplelocation" ? "location" : theRealColorByVariable}: ${colorValue}`);
          return acc;
      }, {});

      setScatterData(Object.values(scatterPlotData));
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
      {label:'Treatment', value:'treatment'}, 
      ...colorByOptions
        ?.filter(option => columnOptions?.includes(option)) 
        .map(option => ({
            label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
            value: option
        }))
    ];



    const dropdownOptions = [
    {label:'All Locations', value:'all'}, // Opción predeterminada
    ...availableLocations
      .map(option => ({
          label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
          value: option
      }))]
      const filter = (
        <div className="flex flex-col w-full rounded-lg dark:bg-gray-800">
          <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">
            
            <AccordionTab className="colorby-acordeon" header="Group by">
              <div className="flex flex-col items-start m-2">
                <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center">
                  Select a Sample Location:
                  <span className="ml-2">
                    <i
                      className="pi pi-info-circle text-siwa-blue"
                      data-pr-tooltip="Please select a Sample Location."
                      data-pr-position="top"
                      id="sampleLocationTooltip"
                    />
                    <PTooltip target="#sampleLocationTooltip" />
                  </span>
                </h3>
                <Dropdown
                  value={selectedLocations.length > 1 ? "all" : selectedLocations[0]}
                  options={dropdownOptions}
                  onChange={(e) => handleLocationChange(e.value)}
                  disabled={availableLocations.length === 1}
                  className="w-full mb-6 text-sm"
                  placeholder="Choose a location"
                />
              </div>
      
              <div className="flex flex-col items-start mt-2 m-2">
                <div className="flex items-center mb-2">
                  <h3 className="text-base font-medium text-gray-700 dark:text-white">
                    Select a variable to color:
                  </h3>
                  <span className="ml-2">
                    <i
                      className="pi pi-info-circle text-siwa-blue"
                      data-pr-tooltip="Select a color category based on the chosen Sample Location, except when 'All locations' is selected."
                      data-pr-position="top"
                      id="groupByTooltip"
                    />
                    <PTooltip target="#groupByTooltip" />
                  </span>
                </div>
                <Dropdown
                  value={theRealColorByVariable}
                  options={dropdownOptionsColorby}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  optionLabel="label"
                  className="w-full text-sm filtercolorby"
                  id="colorby"

                  placeholder="Select a color category"
                />
              </div>
            </AccordionTab>
      
            <AccordionTab className="filter-acordeon" header="Filter by">
              <div className="mt-2 ml-2 mb-4">
                <div className="flex items-center">
                  <h3 className="text-base font-medium text-gray-700 dark:text-white flex items-center">
                    Filtering options:
                    <AiOutlineInfoCircle
                      className="ml-2 text-siwa-blue xl:text-lg text-lg mb-1 cursor-pointer"
                      id="filteringTip"
                    />
                    <PTooltip target="#filteringTip" position="top">
                      Select a variable and specify the values you want to include in the filtered dataset.
                    </PTooltip>
                  </h3>
                </div>
      
                <ul className="w-full flex flex-wrap items-center content-center justify-start mt-2">
                  <li className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
                    <input
                      type="radio"
                      id="treatment"
                      name="treatment"
                      value="treatment"
                      className="hidden peer"
                      checked={colorBy === 'treatment'}
                      onChange={handleLocationChangeColorby}
                    />
                    <label
                      htmlFor="treatment"
                      className={`flex items-center justify-center w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                    >
                      <div className="block">
                        <div className="w-full">Treatment</div>
                      </div>
                    </label>
                  </li>
{/*       
                  {columnOptions?.includes("samplelocation" as never) && (
                    <li className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
                      <input
                        type="radio"
                        id="samplelocation"
                        name="samplelocation"
                        value="samplelocation"
                        className="hidden peer"
                        checked={colorBy === 'samplelocation'}
                        onChange={handleLocationChangeColorby}
                      />
                      <label
                        htmlFor="samplelocation"
                        className={`flex items-center justify-center w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                      >
                        <div className="block">
                          <div className="w-full">Sample Location</div>
                        </div>
                      </label>
                    </li>
                  )} */}
      
                  {colorByOptions.map((option, index) => (
                    <li key={index} className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
                      <input
                        type="radio"
                        id={option}
                        name={option}
                        className="hidden peer"
                        value={option}
                        checked={colorBy === option}
                        onChange={handleLocationChangeColorby}
                      />
                      <label
                        htmlFor={option}
                        className={`flex items-center justify-center ${isColorByDisabled
                          ? 'cursor-not-allowed'
                          : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'
                          } w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                      >
                        <div className="block">
                          <div className="w-full">
                            {(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}
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
                  // loading={filterPeticion}
                  iconPos="right"
                  icon="pi pi-check-square"
                  loadingIcon="pi pi-spin pi-spinner"
                  className="max-w-56 justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
                  label="Apply Filters"
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



useEffect(() => {
  if (Location[0] && Location.length > 0) {
      const newTitle = `Compositional differences (bray curtis) ${Location.length === 3  ? " in All Locations" : " in " + Location[0]?.charAt(0).toUpperCase() + Location[0]?.slice(1) + (selectedColorBy === "samplelocation" ? "" : " by " + selectedColorBy.charAt(0).toUpperCase() + (selectedColorBy as string).replace('_', ' ').slice(1))}`;
      setTitle(newTitle);
  }
}, [Location, selectedColorBy]);

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
          dragmode: false ,
                    margin: { l: 60, r: 10, t: 0, b: 60 } 

        }}
      />)}
      </div>

    </div>

  );
  const legend = (
    <div className="w-full flex flex-row overflow-x-scroll max-h-full items-start justify-center mt-5">
        <CustomLegend scatterData={scatterData} scatterColors={scatterColors} />
    </div>
);


  return (
    <div className="w-full h-full">
      <SidebarProvider>
      <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-sm"/>}>
        {isLoaded ? (
<div className="flex flex-col w-11/12 mx-auto">
<div className="flex flex-row w-full text-center justify-center items-center">
<h1 className="text-3xl my-5 mx-2">Community make-up</h1>
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
