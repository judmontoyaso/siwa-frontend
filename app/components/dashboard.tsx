"use client";
import LoginButton from "@/app/components/Login";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Layout from "@/app/components/Layout";
import { useRouter } from "next/router";
import SkeletonCard from "./skeletoncard";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GiSpinalCoil } from "react-icons/gi";
import { BsFillCloudCheckFill } from "react-icons/bs";

const Dashboard = () => {
  const [accessToken, setAccessToken] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const { user, error, isLoading } = useUser();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadedProjects, setLoadedProjects] = useState({});
  


  const fetchToken = async () => {
    if (!user) {
      // Si no hay usuario autenticado, no hacer nada
      console.log("Usuario no autenticado");
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/token`);
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects`, { mode: 'cors',
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
    setLoadedProjects((prevStatus) => ({ ...prevStatus, [projectId]: false }));
  
    let tostifyTimeout;
  
    try {
      // Iniciar un temporizador para mostrar el tostify después de 2 segundos
      tostifyTimeout = setTimeout(() => {
        toast.info(`Please wait, the ${projectId} project data is being processed`, {
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
      }, 2000); // 2 segundos
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/${projectId}`, {
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Cancelar el temporizador si la petición se completa antes de 2 segundos
      clearTimeout(tostifyTimeout);
  
      if (!response.ok) {
        throw new Error(`Error al obtener datos del proyecto ${projectId}`);
      }
  
      const projectData = await response.json();
      console.log(`Datos del proyecto ${projectId}:`, projectData);
  
      // Actualizar el estado para marcar este proyecto como cargado
      setLoadedProjects((prevLoadedProjects) => ({
        ...prevLoadedProjects,
        [projectId]: true,
      }));
    } catch (error) {
      console.error(error);
      // Asegurarse de cancelar el temporizador en caso de error también
      clearTimeout(tostifyTimeout);
    }
  };
  

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname);
    }
    fetchToken()
  }, [user, path]);

  useEffect(() => {
    if (accessToken) {
      fetchProjectIds(accessToken)
    }}, [accessToken]);

    useEffect(
      () => {
      projectIds.forEach((projectId: string) => { 
        fetchProjectData(projectId, accessToken);
      })},[accessToken, projectIds]);

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
                <li key={projectId} className={`mt-2 flex items-center ${loadedProjects[projectId] ? "cursor-pointer" : "pointer-events-none"} `}>

                  <Link href={`/projects/${projectId}`}>
                    <div className="text-lg hover:text-gray-900 text-gray-600 flex items-center">

                      <span className="mr-1 ml-1"> {projectId} </span> {loadedProjects[projectId] ? (<BsFillCloudCheckFill className="w-4 h-4 me-2 text-green-700 dark:text-green-400 flex-shrink-0" />) : (<div role="status" className="animate-spin">
                      <GiSpinalCoil  className="w-4 h-4  text-gray-300 animate-spin dark:text-gray-600 fill-blue-400"/>                        <span className="sr-only">Loading...</span>
                      </div>)}
                    </div>
                  </Link>
                  {loadedProjects[projectId] !== false && loadedProjects[projectId] !== true && (
                    <span className="text-lg text-gray-600">{projectId}</span> // Texto sin ícono si no se está cargando ni ha cargado
                  )}
                </li>
              ))}
            </ul>
            <div className="text-lg mt-4">Proyectos</div>
          </div>
        ) : (
          <SkeletonCard width={"256px"} height={"256px"} />
        )}
        <ToastContainer/>
      </div>
    </>
  );
};

export default Dashboard;
