"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "@/components/Layout";
import Loading from "@/components/loading";

export default function Page({ params }: { params: { slug: string } }) {
  type OtuType = {
    index: string[];
    columns: string[];
    data: number[][];
  };
  const { user, error, isLoading } = useUser();
  const [accessToken, setAccessToken] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

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
          <div className="flex">
            <div className="mt-28 w-full">

            {otus?.index.map((indexValue, i) => (
              <div key={indexValue}>
                {indexValue}:{" "}
                {
                  otus.data[i].join(
                    ", "
                    ) /* Assuming you want to display the data points as a comma-separated string */
                  }
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="">
            <Loading type="cylon" color="#0e253a" />
          </div>
        )}
      </Layout>
    </div>
  );
}
