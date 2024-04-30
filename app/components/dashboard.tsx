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
import { Bounce, Slide, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GiSpinalCoil } from "react-icons/gi";
import { BsArrowRightShort, BsFillCloudCheckFill } from "react-icons/bs";
import { IoCloudOffline } from "react-icons/io5";
import Spinner from "./pacmanLoader";
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
  const [projectErrors, setProjectErrors] = useState({});

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

  // const fetchProjectIds = async (token: any) => {
  //   // Usa el token pasado como argumento
  //   try {
  //       const response = await fetch(`api/project/id`, { mode: 'cors',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error("Respuesta no válida al obtener projectIds");
  //     }
  //     const result = await response.json();
  //     console.log(result);
  //     const ids = result.projects;
  //     const empresa = result.empresa;

  //     return ids
  //   } catch (error) {
  //     console.error("Error al obtener projectIds:", error);
  //   }
  // };

  useEffect(() => {
    setEmpresa(user?.Empresa as never);
    setProjectIds(user?.Project as never[]);
    setProjectsLoading(false);
  }, [accessToken, user?.Empresa, user?.Project]);

  const fetchProjectData = async (projectId: string, token: string) => {
    setLoadedProjects((prevStatus) => ({ ...prevStatus, [projectId]: false }));
  
    let tostifyTimeout;
  
    try {
      // Iniciar un temporizador para mostrar el tostify después de 2 segundos
      tostifyTimeout = setTimeout(() => {
        toast.info(`Please wait, the ${projectId} project data is being processed`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      }, 2000); // 2 segundos
  
      const response = await fetch(`api/project/data/${projectId}`, {
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Cancelar el temporizador si la petición se completa antes de 2 segundos
      clearTimeout(tostifyTimeout);
  
      if (!response.ok) {
        if (response.status === 500) {
            setProjectErrors((prevErrors) => ({ ...prevErrors, [projectId]: true })); // Establecer el estado de error para este proyecto
        }
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

  // useEffect(() => {
  //   if (accessToken) {
  //     fetchProjectIds(accessToken)
  //   }}, [accessToken]);

    useEffect(
      () => {
      projectIds?.forEach((projectId: string) => { 
        fetchProjectData(projectId, accessToken);
      })},[accessToken, projectIds]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
    
        <div><Spinner/></div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen flex flex-col justify-start w-full rounded-lg bg-gray-50">
      <div className="mx-auto w-full max-w-4xl p-8">
        <h1 className="text-center text-2xl font-semibold text-gray-800 mb-2">Hello, {user?.name}!</h1>
        <h2 className="text-center text-3xl font-semibold text-gray-800 mb-10">Welcome to your SIWA Dashboard</h2>
      </div>
  
      <div className="mx-auto w-full max-w-4xl px-8 pb-8 flex flex-row-reverse gap-8">
        {/* Ajuste en la imagen para que ocupe todo el espacio asignado a su contenedor */}
        <div className="flex justify-center items-center">
  <div className="relative w-96 h-96">
    <div className="perspective-container">
      <div className="absolute w-full h-full transform backface-hidden">
        <img src="/perrito.webp" alt="Decorative" className="w-full h-full object-cover rounded-lg shadow-lg" />
      </div>
      <div className="absolute w-full h-full transform backface-hidden rotate-y-180 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <p className="text-white text-center font-semibold text-lg">Decoding the Mysteries of the Gut</p>
      </div>
    </div>
  </div>
</div>

  
        {/* Contenedor de la lista de proyectos con un ajuste para ocupar el espacio restante */}
        <div className="w-1/2 h-full flex flex-col">
          {/* Lista de Proyectos */}
          {!projectsLoading ? (
            <div className="bg-white shadow rounded-lg overflow-hidden h-96 w-full">
              <div className="p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Projects</h3>
                <p className="text-sm text-gray-600 mb-6">Select any of the loaded projects below to explore detailed analysis results.</p>
                               <ul className="divide-y divide-gray-200">
                  {projectIds?.map((projectId) => (
                    <Link key={projectId} href={`/projects/${projectId}`}>
                      <li className={`py-2 flex mt-4 mb-4 p-4 justify-between items-center bg-slate-50 ${loadedProjects[projectId] ? "cursor-pointer hover:bg-gray-100" : "opacity-50"} rounded-lg`}>
                        <span className="text-lg text-gray-700 flex flex-row items-center">
                          {projectId}
                          {loadedProjects[projectId] ? (
                            <BsFillCloudCheckFill className="w-5 h-5 text-green-500 ml-2" />
                          ) : (
                            <IoCloudOffline className="w-5 h-5 text-gray-700 opacity-50 ml-2" />
                          )}
                        </span>
                        {loadedProjects[projectId] ? (
                          <BsArrowRightShort className="w-5 h-5 text-gray-700" />
                        ) : (
                          <GiSpinalCoil className="w-5 h-5 text-gray-400 animate-spin" />
                        )}
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <SkeletonCard width={"100%"} height={"256px"} />
          )}
        </div>
      </div>
    </div>
    <ToastContainer />
  </>
  
  
  
  
  );
};

export default Dashboard;
