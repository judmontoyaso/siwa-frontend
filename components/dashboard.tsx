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
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  
      const response = await fetch(`http://127.0.0.1:8000/projects/${projectId}`, {
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

                      <span className="mr-1 ml-1"> {projectId} </span> {loadedProjects[projectId] ? (<svg className="w-4 h-4 me-2 text-green-700 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                      </svg>) : (<div role="status">
                        <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-300 animate-spin dark:text-gray-600 fill-blue-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                        <span className="sr-only">Loading...</span>
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
