"use client";
import LoginButton from "@/app/components/Login";
import { MouseEvent, SetStateAction, createContext, useEffect, useState } from "react";
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
import { FaSpinner } from "react-icons/fa";
import { RoughNotation } from "react-rough-notation";
import Spinner from "./pacmanLoader";

const Dashboard = () => {
  const [accessToken, setAccessToken] = useState("");
  const [projects, setProjects] = useState<any>([]);
  const { user, error, isLoading } = useUser();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadedProjects, setLoadedProjects] = useState<any>({});
  const [projectErrors, setProjectErrors] = useState({});
  const [loadingProject, setLoadingProject] = useState(null);

  const fetchToken = async () => {
    if (!user) {
      console.log("Usuario no autenticado");
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/auth/token`);
      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      setTokenObtenido(true);
      console.log("Token obtenido:", accessToken);
      return accessToken;
    } catch (error) {
      console.error("Error al obtener token:", error);
    }
  };

  useEffect(() => {
    setEmpresa(user?.Empresa as never);
    setProjects([
      { id: "E335", name: "Project Alpha" },
      { id: "PFF24", name: "Project Beta" },
    ]);
    setProjectsLoading(false);
  }, [accessToken, user?.Empresa, user?.Project]);

  const fetchProjectData = async (projectId: string, token: string) => {
    setLoadedProjects((prevStatus:any) => ({ ...prevStatus, [projectId]: false }));
  
    let tostifyTimeout;
  
    try {
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
      }, 2000);
  
      const response = await fetch(`api/project/data/${projectId}`, {
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      clearTimeout(tostifyTimeout);
  
      if (!response.ok) {
        if (response.status === 500) {
            setProjectErrors((prevErrors) => ({ ...prevErrors, [projectId]: true }));
        }
        throw new Error(`Error al obtener datos del proyecto ${projectId}`);
      }
  
      const projectData = await response.json();
      console.log(`Datos del proyecto ${projectId}:`, projectData);
  
      setLoadedProjects((prevLoadedProjects:any) => ({
        ...prevLoadedProjects,
        [projectId]: true,
      }));
    } catch (error) {
      console.error(error);
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
    projects?.forEach(({ id }: { id: string }) => { 
      fetchProjectData(id, accessToken);
    })},[accessToken, projects]);

  const handleClick = (e:any, id: string | number | SetStateAction<any>) => {
    if (loadedProjects[id]) {
      setLoadingProject(id);
      e.currentTarget.style.transform = "scale(0.95)";
      e.currentTarget.style.opacity = "0.8";
    } else {
      e.preventDefault();
    }
  };

  const handleTransitionEnd = (e: { currentTarget: { style: { transform: string; opacity: string; }; }; }) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.opacity = "1";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-siwa-green-50">
        <Spinner/>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col justify-start w-full bg-siwa-green-50 p-8">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h1 className="text-5xl font-semibold text-siwa-blue mb-4">Hello, {user?.name}!</h1>
          <h2 className="text-4xl font-semibold text-siwa-blue mb-10">
            Welcome to your 
            <div className="inline-block ml-2 relative">
              <RoughNotation 
                type="highlight" 
                show={true} 
                color="#FEF282" 
                animate={true} 
                animationDuration={1500} 
                animationDelay={500} 
                multiline={true}
              >
                SIWA Dashboard
              </RoughNotation>
            </div>
          </h2>
        </div>

        <div className="mx-auto w-full max-w-7xl flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3 flex flex-col">
            <h3 className="text-2xl font-semibold text-siwa-blue mb-6">Your Projects</h3>
            <p className="text-lg text-siwa-blue mb-6">
              Select any of the loaded projects below to explore detailed analysis results.
            </p>
            {!projectsLoading ? (
              <div className="flex flex-wrap justify-center">
                {projects?.map(({ id, name }: { id: string, name: string }) => (
                  <Link
                    href={loadedProjects[id] ? `/projects/${id}` : ''}
                    passHref
                    key={id}
                  >
                    <div
                      className={`relative bg-white shadow-md rounded-lg p-6 m-4 flex flex-col justify-between h-72 w-64 ${
                        loadedProjects[id] ? "cursor-pointer hover:shadow-blue-500/50" : "opacity-50 cursor-not-allowed"
                      } transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg`}
                      onClick={(e) => handleClick(e, id)}
                      onTransitionEnd={handleTransitionEnd}
                    >
                      {loadingProject === id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                          <FaSpinner className="animate-spin text-siwa-blue text-3xl" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl text-siwa-blue flex items-center">
                          {id}
                          {loadedProjects[id] ? (
                            <BsFillCloudCheckFill className="w-6 h-6 text-green-500 ml-2" />
                          ) : (
                            <IoCloudOffline className="w-6 h-6 text-gray-500 opacity-50 ml-2" />
                          )}
                        </span>
                        {loadedProjects[id] ? (
                          <BsArrowRightShort className="w-6 h-6 text-siwa-blue" />
                        ) : (
                          <GiSpinalCoil className="w-6 h-6 text-gray-500 animate-spin" />
                        )}
                      </div>
                      <p className="text-lg text-siwa-blue mt-4">{name}.</p>
                      {loadedProjects[id] && (
                        <span className="mt-6 text-center text-siwa-blue font-semibold">View Project</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <SkeletonCard width={"100%"} height={"288px"} />
            )}
          </div>

          <div className="w-full md:w-1/3 flex justify-center items-center">
            <div className="relative w-80 h-80">
              <div className="perspective-container">
                <div className="absolute w-full h-full transform backface-hidden">
                  <img src="/perrito.webp" alt="Decorative" className="w-full h-full object-cover rounded-lg shadow-lg" />
                </div>
                <div className="absolute w-full h-full transform backface-hidden rotate-y-180 bg-gradient-to-r from-siwa-yellow to-siwa-green-3 rounded-lg flex items-center justify-center">
                  <p className="text-siwa-blue text-center font-semibold text-xl">Decoding the Mysteries of the Gut</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Dashboard;
