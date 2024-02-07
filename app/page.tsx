"use client";
import LoginButton from "@/components/boton";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Layout from "@/components/Layout";
import { useRouter } from 'next/router';


export default function Home() {
  const [accessToken, setAccessToken] = useState('');
  const [projectIds, setProjectIds] = useState([]);
  const { user, error, isLoading } = useUser();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname);
    }

    
    const fetchToken = async () => {
      if (!user) {
        // Si no hay usuario autenticado, no hacer nada
        console.log("Usuario no autenticado");
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/api/auth/token");
        const { accessToken } = await response.json();
        setAccessToken(accessToken);
        setTokenObtenido(true);
        console.log("Token obtenido:", accessToken);
        return accessToken; // Retorna el token obtenido para su uso posterior
      } catch (error) {
        console.error("Error al obtener token:", error);
      }
    };
    fetchToken();
    if (tokenObtenido) {
      const fetchProjectIds = async (token: any) => {
        // Usa el token pasado como argumento
        try {
          const response = await fetch("http://127.0.0.1:8000/projects", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Respuesta no válida al obtener projectIds");
          }
          const result = await response.json();
          console.log(result);
          const ids = result.projects;
          const empresa = result.empresa;
          setEmpresa(empresa);
          setProjectIds(ids);
          setProjectsLoading(false);
        } catch (error) {
          console.error("Error al obtener projectIds:", error);
        }
      };

      console.log(accessToken, tokenObtenido);
      // Llama a fetchToken y luego a fetchProjectIds con el token obtenido
      if (accessToken && tokenObtenido) {
        fetchProjectIds(accessToken);
      }
    }
  }, [user, path]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* Aquí puedes poner un componente de carga o un simple texto */}
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {user ? (
         <Layout>
          
         <div className="flex justify-center mt-28 content-center w-full">
            <div className="bg-gray-200 w-64 h-64 rounded-lg mx-4 text-center p-10 justify-center flex flex-col">
              <div className="mt-2 mb-2">
                <div>
                  {projectsLoading ? (
                    <div>Cargando...</div> // Muestra esto mientras 'isLoading' es true
                  ) : (
                    projectIds.length
                  )}
                </div>
                <div>Proyectos en curso</div>
              </div>
              <div className="mt-2 mb-2">
                <div>
                  {projectsLoading ? (
                    <div>Cargando...</div> // Muestra esto mientras 'isLoading' es true
                  ) : (
                    empresa
                  )}
                </div>
                <div>Empresa</div>
              </div>
            </div>
            <div className="bg-gray-200 w-64 h-64 rounded-lg mx-4 text-center p-10 justify-center flex flex-col">
              <div className="mt-2 mb-2">
                <ul>
                  {projectsLoading ? (
                    <li>Cargando...</li> // Muestra esto mientras 'isLoading' es true
                  ) : (
                    projectIds.map((projectId: any) => (
                      <li key={projectId}><Link href={`/projects/${projectId}`}>{projectId}</Link></li>
                    ))
                  )}
                </ul>
                <div>Proyectos</div>
              </div>
            </div>
          </div>

         </Layout>

      ) : (
        <LoginButton></LoginButton>
      )}
    </>
  );
}
