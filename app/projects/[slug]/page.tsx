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
        setOtus(result.data); // Si Data está en el nivel superior
        console.log(result.data);
        const groupedData = result.data.data.reduce(
          (
            acc: { [x: string]: { y: number[]; text: string[] } },
            item: string[]
          ) => {
            const location = item[3]; // Asume que 'samplelocation' está en esta posición
            const alphaShannon = parseFloat(item[11]); // Asume que 'alphashannon' está en esta posición
            const sampleId = item[2]; // 'sampleid'

            if (!acc[location]) {
              acc[location] = { y: [], text: [] };
            }
            acc[location].y.push(alphaShannon);
            acc[location].text.push(`Sample ID: ${sampleId}`);

            return acc;
          },
          {}
        );

        const scatterPlotData = result.data.data.reduce(
          (
            acc: {
              [x: string]: {
                y: any;
                x: any;
                text: string[];
              };
            },
            curr: [any, any, any, any]
          ) => {
            const [PC1, PC2, sampleId, sampleLocation] = curr; // Asegúrate de que los índices coincidan con la estructura de tus datos
            acc[sampleLocation] = acc[sampleLocation] || {
              x: [],
              y: [],
              mode: "markers",
              type: "scatter",
              name: sampleLocation,
              text: [],
              marker: { size: 8 },
            };

            acc[sampleLocation].x.push(PC1);
            acc[sampleLocation].y.push(PC2);
            acc[sampleLocation].text.push(`Sample ID: ${sampleId}`); // Añade el sampleId al texto que se mostrará en el tooltip

            return acc;
          },
          {}
        );

        setScatterData(Object.values(scatterPlotData));

        const plotData = Object.keys(groupedData).map((location) => {
          return {
            type: "box",
            y: groupedData[location].y,
            text: groupedData[location].text,
            hoverinfo: "y+text", // Configura la información que se muestra en el hover
            name: location,
          };
        });

        setPlotData(plotData);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error al obtener projectIds:", error);
      }
    };

    fetchToken().then((token) => {
      fetchProjectIds(token);
    });
  }, [params.slug]);

  return (
    <div>
      <Layout>
        {isLoaded ? (
          <>
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
