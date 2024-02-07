"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Plot from "react-plotly.js";

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
          (acc: { [x: string]: { y: number[], text: string[] } }, item: string[]) => {
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

        const plotData = Object.keys(groupedData).map((location) => {
          return {
            type: "box",
            y: groupedData[location].y,
            text: groupedData[location].text,
            hoverinfo: 'y+text', // Configura la información que se muestra en el hover
            name: location
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
        <div>
          <h2>Boxplot de Alpha Shannon por Ubicación de Muestra</h2>
          <Plot
            data={plotData.map((item) => ({ ...item, type: "box"}))}
            layout={{
              width: 800,
              height: 600,
              title: "Alpha Shannon por Ubicación",
            }}
          />
        </div>
      </Layout>
    </div>
  );
}
