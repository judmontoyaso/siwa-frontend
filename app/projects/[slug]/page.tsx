"use client";
import { useEffect, useState } from "react";
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

  {selectedLocations.length === 1 && (
    // Cambio en el manejador para checkboxes
    function handleLocationChange(location: string, isChecked: boolean) {
      if (isChecked) {
        setSelectedLocations(prevLocations => [...prevLocations, location]);
      } else {
        setSelectedLocations(prevLocations => prevLocations.filter(loc => loc !== location));
      }
    }
  )}



  useEffect(() => {
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
            body: JSON.stringify([])}  );
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
            const alphaShannon = parseFloat(item[11]);
            const sampleId = item[2];

            // Verifica si la locación actual debe ser incluida
            if (selectedLocations.includes(location)) {
              if (!acc[location]) {
                acc[location] = { y: [], text: [] };
              }
              acc[location].y.push(alphaShannon);
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
          .filter((location: string) => selectedLocations.includes(location))
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

  // Cambio en el manejador para checkboxes
  const handleLocationChange = (location: string, isChecked: boolean) => {
    let updatedLocations: string[] = []; // Initialize the 'updatedLocations' variable with an empty array
    if (isChecked) {
      if (!filteredLocations.includes(location)) {
        updatedLocations = [...filteredLocations, location];
        setFilteredLocations(updatedLocations);

        console.log("1", updatedLocations);
      } 
    } else {
      updatedLocations = filteredLocations.filter((loc) => loc !== location);
      setFilteredLocations(updatedLocations);

      console.log("3", updatedLocations);
    }
    console.log(filteredLocations);
  };


  // Función para aplicar los filtros seleccionados
  const applyFilters = () => {
    
    setSelectedLocations(filteredLocations)
    // Aquí podrías llamar a una función para actualizar las gráficas basándose en filteredLocations
    // Por ahora, simplemente logueamos las locaciones seleccionadas para verificar
   
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
              body: JSON.stringify(filteredLocations)            }
          );
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
          
          // Selecciona las primeras tres locaciones por defecto o menos si hay menos disponibles
          // setSelectedLocations(uniqueLocations.slice(0, 3));
          setOtus(result.data); // Si Data está en el nivel superior
          console.log(result.data);
  
          // Filtrado y mapeo de datos para los gráficos...
          const filteredData = result.data.data.filter((item: any[]) =>
          filteredLocations.includes(item[3])
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
              const alphaShannon = parseFloat(item[11]);
              const sampleId = item[2];
  
              // Verifica si la locación actual debe ser incluida
              if (selectedLocations.includes(location)) {
                if (!acc[location]) {
                  acc[location] = { y: [], text: [] };
                }
                acc[location].y.push(alphaShannon);
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
            .filter((location: string) => selectedLocations.includes(location))
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
  
      function setLocations() {
        setSelectedLocations(filteredLocations);
        return Promise.resolve(filteredLocations); // Convert filteredLocations to a Promise
      }

      setLocations()
        .then(() => {
          fetchToken().then((token) => {
            fetchProjectIds(token);
          });
        })
     

      console.log(filteredLocations);
  };



  return (
    <div>
      <Layout slug={params.slug} >
        {isLoaded ? (
          <>
            <div className="space-y-4 space-x-4">
          {params.slug}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableLocations.map((location) => (
                  <label key={location} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filteredLocations.includes(location)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleLocationChange(location, true);
                        } else {
                          handleLocationChange(location, false);
                        }
                      }}
                      className="form-checkbox rounded text-blue-500 focus:ring-blue-400 focus:outline-none"
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-start space-x-4">
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
                {plotData.length > 0 ? (
                  <Plot
                    data={plotData.map((item) => ({ ...item, type: "box" }))}
                    layout={{
                      width: 500,
                      height: 270,
                      title: "Alpha Shannon por Ubicación",
                    }}
                  />
                ) : (
                  <SkeletonCard width={"500px"} height={"270px"} />
                )}
              </GraphicCard>

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
  } // Add a closing curly brace here
