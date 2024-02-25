"use client";
import { SetStateAction, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/app/components/Layout";
import Loading from "@/app/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/app/components/skeletoncard";
import GraphicCard from "@/app/components/graphicCard";
import { useRouter } from "next/router";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
;


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
  const [colorBy, setColorBy] = useState<string>('none');
  const [colorByOptions, setColorByOptions] = useState([]);
  const [tittleVariable, SetTittleVariable] = useState<string>('location');
  const [isTabFilterOpen, setIsTabFilterOpen] = useState(false);
  const [dataResult, setDataResult] = useState<any>(null);
  const [scatterColors, setScatterColors] = useState<{ [key: string]: string }>({});
  let colorIndex = 0;
  const newScatterColors: { [key: string]: string } = {}; // Define el tipo explícitamente
  
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
      setColorByOptions(configfile.configFile.columns); // Actualiza el estado con las nuevas opciones
    } catch (error) {
      console.error("Error al cargar las opciones del dropdown:", error);
    }
  };

  const handleLocationChange = (event: any) => {

    if (event === 'all') {
      setSelectedLocations(["cecum", "feces", "ileum"]);
    } else {
      setSelectedLocations([event]);
    }
  };

  const handleLocationChangeColorby = (event: any) => {
    if (Location.length !== 3) {
      setColorBy(event.target.value);
console.log(Location)
      fetchProjectIdsFiltercolor(dataResult, event.target.value);
    }

  };

  // Definir una función genérica para realizar el fetch
  const fetchBetaDiversityData = async (token: any) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/projects/beta-diversity/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ "samplelocation": selectedLocations })
      }
      );
      if (!response.ok) {
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
      if (newSelectionString !== currentSelectionString) {
        fetchBetaDiversityData(accessToken).then(result => { fetchProjectIdsFilter(result) });
        console.log(newSelectionString, currentSelectionString);
      } else {
        fetchProjectIdsFilter(dataResult);
      }
      isColorByDisabled || colorBy === "none" ? SetTittleVariable('location') : SetTittleVariable(colorBy.replace('_', ' '));
      setLocation(selectedLocations);

    if (selectedLocations.length === 3) {
      setIsColorByDisabled(true); // Ocultar el select de tratamiento si se selecciona 'All'
    } else {
      setIsColorByDisabled(false); // Mostrar el select de tratamiento cuando se selecciona una location específica
    }
    };
  
    const fetchProjectIds = async (result: any) => {
    
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
  
      const scatterPlotData = filteredData.reduce(
        (
          acc: {
            [x: string]: {
              y: any;
              x: any;
              text: string[];
              mode: any;
              type: any;
              name: any;
              marker: { size: number, color: string};
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
              marker: { size: 8, color: colors[colorIndex % colors.length] }
            };
              const key = sampleLocation; // Declare 'key' variable
              newScatterColors[key] = colors[colorIndex % colors.length]; // Actualiza la copia con el nuevo color
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
      setScatterData(Object.values(scatterPlotData));
      const plotData = Object.keys(groupedData)
        .filter((location: string) => selectedLocation.includes(location))
        .map((location: string) => ({
          type: "box",
          y: groupedData[location].y,
          text: groupedData[location].text,
          hoverinfo: "y+text",
          name: location,
        }));
  
      setPlotData(
        Object.keys(groupedData).map((location) => ({
          ...groupedData[location],
          type: "box",
          name: location,
        }))
      );
  
      setIsLoaded(true);
  
    }
    
    const fetchProjectIdsFiltercolor = async (result: any, color:any) => {
      try {
  
        const isAllLocationsSelected = selectedLocations.length === 3 && ["cecum", "feces", "ileum"].every(location => selectedLocations.includes(location));
        // Determinar si "None" está seleccionado en "Color By"
        
        color === 'none';
        const scatterPlotData = result.data.data.reduce((acc: { [x: string]: any }, item: any) => {
          const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
          const colorValue = color !== 'none' ? item[result.data.columns.indexOf(color)] : sampleLocation;
  
          let key = sampleLocation; // Por defecto, usa la locación como clave
          let name = `${sampleLocation}`;
          // Si "All" no está seleccionado en las locaciones y "Color By" no es "None", 
          // usa el valor seleccionado en "Color By" para colorear
          if (!isAllLocationsSelected && color !== 'none') {
            key = color !== 'none' ? colorValue : sampleLocation;
            name = color !== 'none' ? `${colorValue}` : `Location: ${sampleLocation}`;
          }
  
          if (!acc[key]) {
            acc[key] = {
              x: [],
              y: [],
              mode: "markers",
              type: "scatter",
              name: name,
              text: [],
              marker: { size: 8, color: colors[colorIndex % colors.length] }
            };
            newScatterColors[key] = colors[colorIndex % colors.length]; // Actualiza la copia con el nuevo color
            colorIndex++;
          }
  
          acc[key].x.push(PC1);
          acc[key].y.push(PC2);
          acc[key].text.push(`Sample ID: ${sampleId}, ${color === "none" ? "location" : color}: ${colorValue}`);
  
          return acc;
        }, {});
        setScatterColors(prevColors => ({ ...prevColors, ...newScatterColors }));
        isColorByDisabled || color === "none" ? SetTittleVariable('location') : SetTittleVariable(color.replace('_', ' '));
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
      // Determinar si "None" está seleccionado en "Color By"
      colorBy === 'none';
      const scatterPlotData = result.data.data.reduce((acc: { [x: string]: any }, item: any) => {
        const [PC1, PC2, sampleId, sampleLocation, ...rest] = item;
        const colorValue = colorBy !== 'none' ? item[result.data.columns.indexOf(colorBy)] : sampleLocation;

        let key = sampleLocation; // Por defecto, usa la locación como clave
        let name = `${sampleLocation}`;
        // Si "All" no está seleccionado en las locaciones y "Color By" no es "None", 
        // usa el valor seleccionado en "Color By" para colorear
        if (!isAllLocationsSelected && colorBy !== 'none') {
          key = colorBy !== 'none' ? colorValue : sampleLocation;
          name = colorBy !== 'none' ? `${colorValue}` : `Location: ${sampleLocation}`;
        }

        if (!acc[key]) {
          acc[key] = {
            x: [],
            y: [],
            mode: "markers",
            type: "scatter",
            name: name,
            text: [],
            marker: { size: 8, color: colors[colorIndex % colors.length] }
          };
          newScatterColors[key] = colors[colorIndex % colors.length]; // Actualiza la copia con el nuevo color
          colorIndex++;
        }

        acc[key].x.push(PC1);
        acc[key].y.push(PC2);
        acc[key].text.push(`Sample ID: ${sampleId}, ${colorBy === "none" ? "location" : colorBy}: ${colorValue}`);
        scatterColors[key] = colors[colorIndex % colors.length];
        return acc;
      }, {});
      
      setScatterColors(prevColors => ({ ...prevColors, ...newScatterColors }));
      setScatterData(Object.values(scatterPlotData));
      setIsLoaded(true);
    } catch (error) {
      console.error("Error al obtener projectIds:", error);
    }
  };




  useEffect(() => {
    fetchToken().then((token) => {
      fetchConfigFile(token);
      fetchBetaDiversityData(token).then((result) => { console.log(result); fetchProjectIds(result) })
    });
  }
    , [params.slug]);


const filter = (
  <div className={`flex flex-col w-full p-4 bg-white rounded-lg  dark:bg-gray-800 `}>
  <div className={`tab-content `}>

           <div className="flex flex-col items-left space-x-2">

             <h3 className="mb-5 text-base font-medium text-gray-900 dark:text-white">Select an option</h3>
             <select id="location" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
               value={selectedLocation === "all" ? selectedLocation: selectedLocations}
               onChange={(e) => handleLocationChange(e.target.value)}
             >
               <option selected value="all">All Locations</option>
               {availableLocations.map((location) => (
                 <option key={location} value={location}>
                   {location.charAt(0).toUpperCase() + location.slice(1)}
                 </option>
               ))}
             </select>
           </div>

           <div className="flex w-full items-center margin-0 justify-center my-8">
             <button
               onClick={applyFilters}
               className="bg-custom-green-400 hover:bg-custom-green-500 text-white font-bold py-2 px-4 rounded-xl"
             >
               Apply Filter
             </button>
           </div>
           <div className="mt-10">
             <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Color by</h3>
             <ul className="grid w-full gap-6 md:grid-cols-2">
               <li>
                 <input type="radio" id="none" name="none" value="none" className="hidden peer" required checked={isColorByDisabled ? true : colorBy === 'none'}
                   onChange={handleLocationChangeColorby}
                   disabled={isColorByDisabled} />
                 <label htmlFor="none" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                   <div className="block">
                     <div className="w-full text-center flex justify-center">Default</div>
                   </div>
                 </label>
               </li>
               <li>
                 <input type="radio" id="treatment" name="treatment" value="treatment" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'treatment'}
                   onChange={handleLocationChangeColorby}
                   disabled={isColorByDisabled} />
                 <label htmlFor="treatment" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                   <div className="block">
                     <div className="w-full">Treatment</div>
                   </div>
                 </label>
               </li>
               <li>
                 <input type="radio" id="age" name="age" value="age" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'age'}
                   onChange={handleLocationChangeColorby} />
                 <label htmlFor="age" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  cursor-pointer hover:text-gray-600 hover:bg-gray-100  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
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
                     checked={isColorByDisabled ? false : colorBy === option}
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
       </div>);




type ScatterData = {
  name: string;
  // Add other properties as needed
};

type ScatterColors = {
  [key: string]: string;
  // Add other properties as needed
};

const CustomLegend = ({ scatterData, scatterColors }: { scatterData: ScatterData[]; scatterColors: ScatterColors }) => (
  <div style={{ marginLeft: '20px' }}>
    {scatterData.map((entry, index) => (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ width: '15px', height: '15px', backgroundColor: scatterColors[entry.name], marginRight: '10px' }}></div>
        <div>{entry.name}</div>
      </div>
    ))}
  </div>
);



const MyPlotComponent = ({ scatterData, scatterColors }: { scatterData: any[]; scatterColors: any }) => (
<div className="flex fle items-start w-full">
  <div className="w-3/5 contents">
  <Plot
    data={scatterData}
    layout={{
      width: 800,
      height: 400,
      title: `Beta diversity ${isColorByDisabled ? " por Ubicación" :  " en " + (Location + (colorBy === "none" ? "" :  " por " + colorBy.replace('_', ' ')))}`,
      xaxis: { title: 'PC1' },
      yaxis: { title: 'PC2' },
      showlegend: false, // Oculta la leyenda de Plotly
    }}
  />
  </div>
<div className="w-2/5">
  <CustomLegend scatterData={scatterData} scatterColors={scatterColors}  />
</div>
</div>

);

  return (
    <div>
      <Layout slug={params.slug} filter={""} >
        {isLoaded ? (
          <>

              <GraphicCard filter={filter}>
                {scatterData.length > 0 ? (
<MyPlotComponent scatterData={scatterData} scatterColors={scatterColors}/>


                ) : (
                  <SkeletonCard width={"800px"} height={"470px"} />
                )}
              </GraphicCard>


          </>
        ) : (
          <div>Loading...</div>
        )}
        <ToastContainer />
      </Layout>
    </div>
  );
}
