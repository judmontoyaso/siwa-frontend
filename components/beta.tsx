"use client";
import { SetStateAction, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/components/skeletoncard";
import GraphicCard from "@/components/graphicCard";
import { useRouter } from "next/router";

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
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [availableTreatments, setAvailableTreatments] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>(["cecum",
    "feces",
    "ileum"]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isTreatmentSelectDisabled, setIsTreatmentSelectDisabled] = useState(true);
  const [colorBy, setColorBy] = useState<string>('none');
  const [colorByOptions, setColorByOptions] = useState([]);


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

  const fetchDropdownOptions = async (token: any) => {
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
      console.log(configfile.configFile.columns);
      console.log(colorByOptions)
    } catch (error) {
      console.error("Error al cargar las opciones del dropdown:", error);
    }
  };



  useEffect(() => {
    fetchToken().then((token) => {
      fetchDropdownOptions(token);
    });
  }, [params.slug]);



  const handleLocationChange = (event: any) => {
    if (event === 'all') {
      setSelectedLocations(["cecum", "feces", "ileum"]);
      setIsTreatmentSelectDisabled(true); // Ocultar el select de tratamiento si se selecciona 'All'
    } else {
      setSelectedLocations([event]);
      setIsTreatmentSelectDisabled(false); // Mostrar el select de tratamiento cuando se selecciona una ubicación específica
    }
  };

  const handleLocationChangeColorby = (event: any) => {

    setColorBy(event); // Ocultar el select de tratamiento si se selecciona 'All'


    console.log(event);
    console.log(colorBy)
  };

  useEffect(() => {
    const fetchProjectIds = async (token: any) => {
      // Usa el token pasado como argumento
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/projects/beta-diversity/${params.slug}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ "samplelocation": selectedLocations })
          });
        if (!response.ok) {
          throw new Error("Respuesta no válida al obtener projectIds");
        }
        const result = await response.json();
        console.log(result);
        const locations = new Set(
          result.data.data.map((item: any[]) => item[3])
        );
        const uniqueLocations = Array.from(locations) as string[];
        const treatments = new Set(result.data.data.map((item: any[]) => item[23]));
        const uniqueTreatments = Array.from(treatments) as string[];
        setAvailableTreatments(uniqueTreatments);

        setAvailableLocations(uniqueLocations);
        // Selecciona las primeras tres locaciones por defecto o menos si hay menos disponibles
        // setSelectedLocations(uniqueLocations.slice(0, 3));
        setOtus(result.data); // Si Data está en el nivel superior
        console.log(result.data);

        // Filtrado y mapeo de datos para los gráficos...
        const filteredData = result.data.data.filter((item: any[]) =>
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
                marker: { size: number };
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
                marker: { size: 8 },
              };
            }

            // Agrega los datos al objeto de esta locación
            acc[sampleLocation].x.push(PC1);
            acc[sampleLocation].y.push(PC2);
            acc[sampleLocation].text.push(`Sample ID: ${sampleId}`);

            return acc;
          },
          {} // Asegura que el valor inicial del acumulador es un objeto
        );

        setScatterData(Object.values(scatterPlotData)); // Ahora scatterPlotData es garantizado como un objeto
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
      } catch (error) {
        console.error("Error al obtener projectIds:", error);
      }
    };

    fetchToken().then((token) => {
      fetchProjectIds(token);
    });
  }, [params.slug]);






  // Función para aplicar los filtros seleccionados
  const applyFilters = (event: any) => {
    const fetchProjectIds = async (token: any) => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/projects/beta-diversity/${params.slug}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ "samplelocation": selectedLocations })
          }
        );
        if (!response.ok) {
          throw new Error("Respuesta no válida al obtener projectIds");
        }
        const result = await response.json();
        console.log("Result object:", result); // Add this line to inspect the structure
        // Determinar si se seleccionó 'all' para colorear por ubicación
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
            name = colorBy !== 'none' ? `${colorBy}: ${colorValue}` : `Location: ${sampleLocation}`;
          }

          if (!acc[key]) {
            acc[key] = {
              x: [],
              y: [],
              mode: "markers",
              type: "scatter",
              name: name,
              text: [],
              marker: { size: 8 },
            };
          }

          acc[key].x.push(PC1);
          acc[key].y.push(PC2);
          acc[key].text.push(`Sample ID: ${sampleId}, ${colorBy}: ${colorValue}`);

          return acc;
        }, {});

        setScatterData(Object.values(scatterPlotData));
        setIsLoaded(true);
      } catch (error) {
        console.error("Error al obtener projectIds:", error);
      }
    };

    fetchToken().then((token) => {
      fetchProjectIds(token);
    });
  };








  return (
    <div>
      <Layout slug={params.slug} >
        {isLoaded ? (
          <>
            <div className="space-y-4 space-x-4 w-1/6 beta">
              <div className="">
                <div className="flex flex-col items-center space-x-2">
                  <label htmlFor="location" className="mb-2 px-2 text-sm font-medium text-gray-900 dark:text-white w-full text-left">Select an option</label>
                  <select id="location" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={(e) => handleLocationChange(e.target.value)}
                  >
                    <option selected value="all">All Locations</option>
                    {availableLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4">
                    <label htmlFor="colorbyFilter" className="mb-2 px-2 text-sm font-medium text-gray-900 dark:text-white w-full text-left">Color by</label>
                    <select
                      id="colorbyFilter"
                      disabled={isTreatmentSelectDisabled}
                      className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${isTreatmentSelectDisabled ? 'cursor-not-allowed' : 'cursor-auto'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                      onChange={(e) => handleLocationChangeColorby(e.target.value)}
                      defaultValue="none"
                    >
                      <option value="none">Please select an option</option>
                      <option key="treatment" value="treatment">  Treatment </option>
                      <option key="age" value="age"> Age  </option>

                      {colorByOptions?.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>
              </div>
              <div className="flex w-full items-center margin-0 justify-center my-3">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-150"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            <div className="flex justify-evenly w-full flex-wrap">
              <GraphicCard>
                {scatterData.length > 0 ? (
                  <Plot
                    data={scatterData} // Pasa directamente scatterData sin mapearlo nuevamente
                    layout={{
                      width: 500,
                      height: 270,
                      title: "PC1 vs PC2 por Ubicación de Muestra",
                      xaxis: { title: "PC1" },
                      yaxis: { title: "PC2" },
                    }}
                  />
                ) : (
                  <SkeletonCard width={"500px"} height={"270px"} />
                )}
              </GraphicCard>
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </Layout>
    </div>
  );
}
