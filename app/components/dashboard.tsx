"use client";
import LoginButton from "@/app/components/Login";
import { MouseEvent, SetStateAction, createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Layout from "@/app/components/Layout";
import { useRouter } from "next/navigation";
import SkeletonCard from "./skeletoncard";
import { Bounce, Slide, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BsArrowLeftShort, BsArrowRightShort, BsFillCloudCheckFill } from "react-icons/bs";
import { IoCloudOffline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { RoughNotation } from "react-rough-notation";
import Spinner from "./pacmanLoader";
import { GiChicken, GiPig, GiCow, GiCat, GiSpinalCoil, GiTestTubes } from "react-icons/gi"; // Importamos más íconos
import { FaDog } from "react-icons/fa"; // Perro
import { AiOutlineClose } from "react-icons/ai";
import { RiTestTubeFill } from "react-icons/ri";
import { motion } from "framer-motion";
import { BiMapPin } from "react-icons/bi";
const Dashboard = () => {
  const [accessToken, setAccessToken] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const { user, error, isLoading } = useUser();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadedProjects, setLoadedProjects] = useState<any>({});
  const [projectErrors, setProjectErrors] = useState<{ [key: string]: boolean }>({});
  const [loadingProject, setLoadingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectImage, setProjectImage] = useState("/LogoSIWA.png");

  const router = useRouter();
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

  // Nueva función para consultar los proyectos por email
  const fetchProjectsByEmail = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/projectsemail/${email}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Enviar el token
        },
      })
        ;
      if (!response.ok) {
        throw new Error("Error al consultar los proyectos por email");
      }
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects by email:", error);
    }
  };
  const handleGoToProject = (id: SetStateAction<null>) => {
    // Establece el proyecto en estado de carga
    setLoadingProject(id);
    // Inicia una redirección usando `useRouter` o cualquier método de navegación de Next.js
    router.push(`/projects/${id}`);
  };

  interface Project {
    id: string;
    name: string;
    animalType: string;
    specie: string;
  }


  useEffect(() => {
    setEmpresa(user?.Empresa as never);
    if (user?.email) {
      // Llamamos a la función para obtener los proyectos
      fetchProjectsByEmail(user.email);
    }
    setProjectsLoading(false);
  }, [accessToken, user?.email]);
  const fetchProjectData = async (projectId: string, animalType: string, token: string) => {
    setLoadedProjects((prevStatus: any) => ({ ...prevStatus, [projectId]: false }));
    console.log("animaltype", animalType);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/data/${projectId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "animaltype": animalType,
        }),
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

      // Aquí consultamos el nuevo endpoint para obtener las estadísticas del proyecto
      const statsResponse = await fetch(`api/project/modules/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error(`Error al obtener las estadísticas del proyecto ${projectId}`);
      }

      const statsData = await statsResponse.json();
      console.log(`Estadísticas del proyecto ${projectId}:`, statsData);

      setLoadedProjects((prevLoadedProjects: any) => ({
        ...prevLoadedProjects,
        [projectId]: true,
      }));

      // Retornamos los datos para establecerlos en `selectedProject`
      return {
        samples: statsData.sample_count, // Número de muestras obtenido del endpoint
        panels: statsData.modules.length, // Número de módulos obtenidos del endpoint
      };
    } catch (error) {
      console.error(error);
      clearTimeout(tostifyTimeout);
      return null;
    }
  };


  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname);
    }
    fetchToken()
  }, [user, path]);

  useEffect(() => {
    const fetchProjectDataSequentially = async () => {
      for (const project of projects) {
        const { id, animalType } = project;
        console.log("Fetching project data for:", id, animalType);

        // Llamada secuencial a cada proyecto
        await fetchProjectData(id, animalType, accessToken);
      }
    };

    if (accessToken && projects.length > 0) {
      fetchProjectDataSequentially();
    }
  }, [accessToken, projects]);


  // const handleClick = (e:any, id: string | number | SetStateAction<any>) => {
  //   if (loadedProjects[id]) {
  //     setLoadingProject(id);
  //     e.currentTarget.style.transform = "scale(0.95)";
  //     e.currentTarget.style.opacity = "0.8";
  //   } else {
  //     e.preventDefault();
  //   }
  // };

  const speciesImageMap: { [key: string]: string } = {
    "Layer": "/layer.webp",
    "Poultry": "/layer.webp",
    "Broiler": "/broiler.webp",
    "Pig": "/cerdito.webp",
    "Cow": "/vaquita.webp",
    "Pet": "/perrito.webp",
  };
  

  const handleClick = async (e: any, id: string | number | SetStateAction<any>, animalType: string, specie: string) => {
    e.preventDefault();
    if (!loadedProjects[id]) {
      return;
    }
    
    try {
      const projectData = await fetchProjectData(id, animalType, accessToken);
      if (projectData) {
        setSelectedProject({
          title: id,
          name: projects?.find((project: { id: string; }) => project?.id === id)?.name,
          animalType: animalType,
          specie: specie,
          samples: projectData.samples,
          panels: projectData.panels,
        });
        setProjectImage(speciesImageMap[specie] || "/LogoSIWA.png");
        
      }
    } catch (error) {
      console.error("Error al cargar el proyecto:", error);
    }
  };
  
  



  const handleTransitionEnd = (e: { currentTarget: { style: { transform: string; opacity: string; }; }; }) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.opacity = "1";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-siwa-green-50">
        <Spinner />
      </div>
    );
  }

  const getAnimalIcon = (specie: string, isLoaded: boolean) => {
    const size = "w-6 h-6 ml-2";
    const color = isLoaded ? "" : "text-gray-500"; // Si no está cargado, lo mostramos en gris

    switch (specie) {
      case "Layers":
      case "Broiler":
      case "Poultry":
        return <GiChicken className={`${size} ${isLoaded ? "text-yellow-500" : color}`} />;
      case "Canine":
        return <FaDog className={`${size} ${isLoaded ? "text-brown-500" : color}`} />;
      case "Pig":
        return <GiPig className={`${size} ${isLoaded ? "text-pink-500" : color}`} />;
      case "Cow":
        return <GiCow className={`${size} ${isLoaded ? "text-black" : color}`} />;
      case "Cat":
        return <GiCat className={`${size} ${isLoaded ? "text-gray-800" : color}`} />;
      default:
        return <RiTestTubeFill className={`${size} text-blue-500`} />; // Tubo de ensayo por defecto
    }
  };



  return (
    <>
      <div className="min-h-screen table flex-col justify-start w-full bg-siwa-green-50 p-8 pb-24">
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

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-siwa-blue mb-3">Your Projects</h3>
            <p className="text-xl text-siwa-blue mb-6">
              Select any of the loaded projects below to explore detailed analysis results.
            </p>
            {projectsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white shadow-md rounded-lg p-6 h-64 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full pr-4 justify-center items-center" style={{ width: '90%', margin: '0 auto' }}>
                {projects
                  ?.sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name))
                  .map(({ id, name, animalType, specie }) => (
                    <Link href={loadedProjects[id] ? `/projects/${id}` : '#'} passHref key={id}>
                      <div
                        className={`bg-white shadow-md rounded-lg p-6 flex flex-col justify-between h-64 
    ${loadedProjects[id] ? "cursor-pointer hover:shadow-lg hover:shadow-blue-500/50" : "opacity-50 cursor-not-allowed"}
    transition duration-200 ease-in-out transform hover:-translate-y-1 
    ${selectedProject?.title === id ? "shadow-blue-500/50 border-2 border-blue-500" : ""}
  `}
                        onClick={(e) => handleClick(e, id, animalType, specie)}
                        onTransitionEnd={handleTransitionEnd}
                      >

                        {loadingProject === id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                            <FaSpinner className="animate-spin text-siwa-blue text-3xl" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-semibold text-siwa-blue flex items-center">
                              {id}
                              {getAnimalIcon(specie, loadedProjects[id])}
                            </span>
                            {loadedProjects[id] && <BsArrowRightShort className="w-6 h-6 text-siwa-blue" />}
                          </div>
                          <p className="text-lg text-siwa-blue">{name}</p>
                        </div>
                        <div className="mt-4">
                          {projectErrors[id] ? (
                            <span className="text-red-500 font-semibold flex items-center justify-center">
                              <AiOutlineClose className="w-5 h-5 mr-2" /> Error Loading
                            </span>
                          ) : loadedProjects[id] ? (
                            <span className="text-siwa-blue font-semibold flex items-center justify-center">
                              {loadingProject === id ? (
                                <FaSpinner className="animate-spin text-siwa-blue text-xl mr-2" />
                              ) : (
                                "View Project"
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-500 font-semibold flex items-center justify-center">
                              <FaSpinner className="animate-spin text-gray-500 text-xl mr-2" /> Loading...
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </section>

          <aside className="w-full h-full  mt-6"> {/* Eliminar sticky de aquí */}
            <motion.div
              className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between h-full lg:h-[650px] relative lg:sticky lg:top-24"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ maxHeight: 'calc(100vh - 10rem)' }} // Ajustamos la altura máxima para evitar que tape el contenido
            >
              {/* <div className="absolute -top-10 left-1/2 transform -translate-x-1/2"> 
      <BiMapPin className="text-siwa-blue text-3xl" /> 
    </div> */}
              <div>
                <h3 className="text-2xl font-semibold text-siwa-blue mb-4">
                  {selectedProject ? "Project Details" : "Quick Stats"}
                </h3>
                {selectedProject && (
              <button
              className="absolute top-4 left-4 text-siwa-blue hover:text-siwa-blue-700"
              onClick={() => {
                setSelectedProject(null);
                setProjectImage("/LogoSIWA.png"); // Regresa la imagen a la genérica
              }}
            >
              <BsArrowLeftShort className="w-6 h-6" />
            </button>
            
                )}
                {selectedProject ? (
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Title:</span>
                      <span className="font-bold text-xl text-siwa-blue">{selectedProject.name}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Animal Type:</span>
                      <span className="font-bold text-xl text-siwa-blue">{selectedProject.animalType}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Number of Samples:</span>
                      <span className="font-bold text-xl text-siwa-blue">{selectedProject.samples}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Panels:</span>
                      <span className="font-bold text-xl text-siwa-blue">{selectedProject.panels}</span>
                    </li>

                    <li className="flex justify-center mt-4">
                      <Link href={`/projects/${selectedProject.title}`} passHref>
                        <button
                          onClick={() => handleGoToProject(selectedProject?.title)}
                          className="bg-siwa-blue text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center"
                          disabled={loadingProject === selectedProject?.title} // Evitar múltiples clics mientras carga
                        >
                          {loadingProject === selectedProject?.title ? (
                            <FaSpinner className="animate-spin text-white text-xl mr-2" />
                          ) : null}
                          Go to Project
                        </button>

                      </Link>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-4">
                    {/* Mostrar estadísticas generales cuando no hay proyecto seleccionado */}
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Total Projects:</span>
                      <span className="font-bold text-xl text-siwa-blue">{projects.length}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Loaded Projects:</span>
                      <span className="font-bold text-xl text-siwa-blue">
                        {Object.values(loadedProjects).filter(Boolean).length}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-lg">Projects with Errors:</span>
                      <span className="font-bold text-xl text-red-500">
                        {Object.values(projectErrors).filter(Boolean).length}
                      </span>
                    </li>
                  </ul>
                )}
              </div>
              <div className="w-full flex justify-center items-center mt-6">
  <div className="relative w-72 h-72">
    <div className="perspective-container">
      <div className="absolute w-full h-full transform backface-hidden">
        <img src={projectImage} alt="Decorative" className="w-full h-full object-contain rounded-lg " />
      </div>
      <div className="absolute w-full h-full transform backface-hidden rotate-y-180 bg-gradient-to-r from-siwa-yellow to-siwa-green-3 rounded-lg flex items-center justify-center">
        <p className="text-siwa-blue text-center font-semibold text-xl">Decoding the Mysteries of the Gut</p>
      </div>
    </div>
  </div>
</div>

            </motion.div>
          </aside>





        </main>


      </div>
      <ToastContainer />
    </>
  );
};

export default Dashboard;
