"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Plot from "react-plotly.js";
import SkeletonCard from "@/components/skeletoncard";
import GraphicCard from "@/components/graphicCard";

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
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['cecum', 'feces', 'ileum']);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

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
          `http://127.0.0.1:8000/projects/${params.slug}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Respuesta no válida al obtener projectIds");
        }
        const result = await response.json();
        const locations = new Set(
          result.data.data.map((item: any[]) => item[3])
        );
        const uniqueLocations = Array.from(locations) as string[];

        setAvailableLocations(uniqueLocations);
        // Selecciona las primeras tres locaciones por defecto o menos si hay menos disponibles
        // setSelectedLocations(uniqueLocations.slice(0, 3));
        setOtus(result.data); // Si Data está en el nivel superior
        console.log(result.data);

 // Filtrado y mapeo de datos para los gráficos...
 const filteredData = result.data.data.filter((item: any[]) => selectedLocations.includes(item[3]));


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

        
        const scatterPlotData = result.data.data.reduce(
          (acc: { [x: string]: {
            y: any;
            x: any; text: string[]; 
            mode :  any; type: any; name: any; marker: { size: number; }; }; }, item: [any, any, any, any]) => {
            const [PC1, PC2, sampleId, sampleLocation] = item;
        
            // Inicializa el objeto para esta locación si aún no existe
            if (!acc[sampleLocation]) {
              acc[sampleLocation] = {
                x: [], // Add 'x' property and initialize as an empty array
                y: [],
                mode: 'markers' as const, // Add 'mode' property with value 'markers'
                type: 'scatter',
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
      
        setPlotData(Object.keys(groupedData).map(location => ({
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
  }, [params.slug, selectedLocations]);

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelections = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedLocations(newSelections);
  };

  const resetLocation = () => {
    setSelectedLocations(['cecum', 'feces', 'ileum']);
  };

  

  return (
    <div>
      <Layout>
        {isLoaded ? (
          <>
            <div className="flex justify-evenly w-full flex-wrap">
<select multiple value={selectedLocations} onChange={handleLocationChange}>

  {availableLocations.map(location => (
    <option key={location} value={location}>{location}</option>
    ))}
</select>
    <button onClick={resetLocation as unknown as React.MouseEventHandler<HTMLButtonElement>}> remove filter </button>

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
                  <SkeletonCard />
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
                  <SkeletonCard />
                )}
              </GraphicCard>
            </div>
          </>
        ) : (
          <Loading type="cylon" color="#0e253a" />
        )}
      </Layout>
    </div>
  );
}
