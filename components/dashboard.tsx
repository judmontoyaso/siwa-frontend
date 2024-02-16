"use client";
import LoginButton from "@/components/Login";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import SkeletonCard from "./skeletoncard";

const Dashboard = () => {
  const [accessToken, setAccessToken] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const { user, error, isLoading } = useUser();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

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
        return ids
      } catch (error) {
        console.error("Error al obtener projectIds:", error);
      }
    };
    const fetchProjectData = async (projectId: string, token: string) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error al obtener datos del proyecto ${projectId}`);
        }
        const projectData = await response.json();
        console.log(`Datos del proyecto ${projectId}:`, projectData);
      } catch (error) {
        console.error(error);
      }
    };

    console.log("dddd", accessToken, tokenObtenido);
    // Llama a fetchToken y luego a fetchProjectIds con el token obtenido
    fetchToken().then((accessToken) => {
      if (accessToken) {
        fetchProjectIds(accessToken).then((ids) => {ids.forEach((projectId: string) => {
          fetchProjectData(projectId, accessToken);
        })});
      }
    })}, [user, path]);


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
      <div className="flex justify-center mt-28 content-center w-full">
        {!projectsLoading ? (
          <div className="card bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out w-64 h-64 rounded-lg m-10 mx-4 p-6 flex flex-col justify-center items-center text-gray-600">
            <div className="text-2xl font-semibold">{projectIds.length}</div>
            <div className="text-lg mt-2">Proyectos en curso</div>
            <div className="text-xl mt-4">{empresa}</div>
            <div className="text-md">Empresa</div>
          </div>
        ) : (
          <SkeletonCard width={"256px"} height={"256px"} />
        )}
        {!projectsLoading ? (
          <div className="card bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out w-64 h-64 rounded-lg m-10 mx-4 p-6 flex flex-col justify-center items-center text-gray-600">
            <ul>
              {projectIds.map((projectId) => (
                <li key={projectId} className="mt-2">
                  <Link href={`/projects/${projectId}`}>
                    <span className="text-lg hover:text-gray-900 text-gray-600">
                      {projectId}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="text-lg mt-4">Proyectos</div>
          </div>
        ) : (
          <SkeletonCard width={"256px"} height={"256px"} />
        )}
      </div>
    </>
  );
};

export default Dashboard;
