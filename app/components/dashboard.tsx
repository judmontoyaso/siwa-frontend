"use client";
import LoginButton from "@/app/components/Login";
import { Key, MouseEvent, SetStateAction, createContext, useEffect, useState } from "react";
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
import { FaEye, FaSpinner } from "react-icons/fa";
import { RoughNotation } from "react-rough-notation";
import Spinner from "./pacmanLoader";
import { GiChicken, GiPig, GiCow, GiCat, GiSpinalCoil, GiTestTubes } from "react-icons/gi"; // Importamos más íconos
import { FaDog } from "react-icons/fa"; // Perro
import { AiOutlineClose } from "react-icons/ai";
import { RiTestTubeFill } from "react-icons/ri";
import { motion } from "framer-motion";
import { BiMapPin } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
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
        panels: statsData.modules.map((module: string) => module.replace(/_/g, ' ')).join(', '),
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
    "Layers": "/layer.webp",
    "Poultry": "/layer.webp",
    "Broiler": "/broiler.webp",
    "Pig": "/cerdito.webp",
    "Cow": "/vaquita.webp",
    "Canine": "/perrito.webp",
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
      <div className="flex h-full flex-col justify-start w-full bg-siwa-green-50 pt-0 px-8 pb-24">


        <main className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2  overflow-scroll">
          <div className="mx-auto w-full max-w-5xl text-center">
          {/* <h1 className="text-5xl font-semibold text-siwa-blue mb-4">Hello, {user?.name}!</h1> */}
          <h1 className="text-3xl font-semibold text-siwa-blue mb-10">
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
          </h1>
        </div>
            <h2 className="text-2xl font-semibold text-siwa-blue mb-3">Your Projects</h2>
            <p className="text-xl text-siwa-blue mb-6">
              Select any of the loaded projects below to explore detailed analysis results.
            </p>
            {projectsLoading ? (
              <div className=" flex  grid-cols-1 sm:grid-cols-2 gap-4">
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

                        {/* {loadingProject === id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                            <FaSpinner className="animate-spin text-siwa-blue text-3xl" />
                          </div>
                        )} */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-semibold text-siwa-blue flex items-center">
                              {id}
                              {getAnimalIcon(specie, loadedProjects[id])}
                            </span>
                          </div>
                          <p className="text-lg text-siwa-blue">{name}</p>
                        </div>
                        <div className="mt-4">
                          {projectErrors[id] ? (
                            <span className="text-red-500 font-semibold flex items-center justify-center">
                              <AiOutlineClose className="w-5 h-5 mr-2" /> Error loading
                            </span>
                          ) : loadedProjects[id] ? (
                            <span className="text-siwa-blue font-semibold flex items-center justify-center ">
                              {loadingProject === id ? (
                             <span className="flex flex-row">  Loading... <FaSpinner className="animate-spin text-siwa-blue text-xl ml-2" /></span>  
                              ) : (
                              <span className="flex flex-row ">See details <FaEye className="text-xl ml-2"/></span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-500 font-semibold flex items-center justify-center">
                              Loading... <FaSpinner className="animate-spin text-gray-500 text-xl ml-2" /> 
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </section>

          <aside className="w-full h-full">
  <motion.div
    className="bg-white shadow-md  rounded-lg p-6 flex flex-col justify-between h-full relative lg:sticky lg:top-0"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{ maxHeight: 'calc(100vh - 10rem)' }}
  >
    <div className="overflow-scroll" style={{ maxHeight: '100%' }}>
     <div  style={{ maxHeight: '100%' }}>
      <h3 className="text-2xl font-semibold text-siwa-blue mb-4">
        {selectedProject ? "Project Details" : "Quick Stats"}
      </h3>
      {selectedProject && (
        <button
          className="absolute top-4 left-4 text-siwa-blue hover:text-siwa-blue-700"
          onClick={() => {
            setSelectedProject(null);
            setProjectImage("/LogoSIWA.png"); 
          }}
        >
          <BsArrowLeftShort className="w-6 h-6" />
        </button>
      )}
      {selectedProject ? (
 <div className="space-y-6">
 <div className="flex flex-col items-start mb-8">
   <div className="w-full  rounded-md  p-4  mt-2 text-center">
     <span className="text-lg italic text-siwa-blue">{selectedProject.name}</span>
   </div>

   {/* Tabla para Animal Type, Animal Specie y Number of Animals */}
   <div className="w-full border border-gray-100 rounded-md mt-2">
  {/* Fila: Animal Type */}
  <div className="flex items-center p-4 bg-gray-50">
    <span className="text-base font-medium text-siwa-blue w-1/2">Animal type:</span>
    <span className="text-base italic text-siwa-blue w-1/2">{selectedProject.animalType}</span>
  </div>

  {/* Fila: Animal Specie (color alternado) */}
  <div className="flex items-center p-4 bg-white">
    <span className="text-base font-medium text-siwa-blue w-1/2">Animal specie:</span>
    <span className="text-base italic text-siwa-blue w-1/2">{selectedProject.specie}</span>
  </div>

  {/* Fila: Number of Animals */}
  <div className="flex items-center p-4 bg-gray-50">
    <span className="text-base font-medium text-siwa-blue w-1/2">Number of animals:</span>
    <span className="text-base italic text-siwa-blue w-1/2">{selectedProject.samples}</span>
  </div>
</div>


   {/* Etiquetas de Panels */}
   <div className="flex justify-center mt-4 text-center">
   {/* <span className="text-lg font-medium text-siwa-blue mr-4">Panels:</span> */}
   <div className="flex flex-wrap mt-4 justify-center text-center">
  
              {(Array.isArray(selectedProject.panels)
                ? selectedProject.panels
                : typeof selectedProject.panels === 'string'
                ? selectedProject.panels.split(',').map((p: string) => p.trim())
                : []
              ).map((panel: Key | null | undefined) => {
                let bgColor;
                switch (panel) {
                  case "Richness":
                      bgColor = "bg-[#78A083] text-[#FFFFFF]"; // Verde claro con texto blanco
                      break;
                  case "Community Makeup":
                      bgColor = "bg-[#40679E] text-[#FFFFFF]"; // Azul medio con texto blanco
                      break;
                  case "Taxonomic Abundance":
                      bgColor = "bg-[#8E7AB5] text-[#FFFFFF]"; // Púrpura medio con texto blanco
                      break;
                  case "Differential Abundance":
                      bgColor = "bg-[#FFE3CA] text-[#7A4E2A]"; // Amarillo claro con texto marrón oscuro
                      break;
                  case "Histo":
                      bgColor = "bg-[#FFCF81] text-[#5D3B1E]"; // Amarillo-naranja con texto marrón oscuro
                      break;
                  case "Gene Expression":
                      bgColor = "bg-[#FFF36E] text-[#4A4A1E]"; // Amarillo pálido con texto verde oscuro
                      break;
                  default:
                      bgColor = "bg-[#B5C0D0] text-[#3A3A3A]"; // Gris claro con texto gris oscuro
              }
              
              

       return (
        
         <span
           key={panel}
           className={`px-3 py-1 mr-2 mb-2 rounded-full text-sm font-semibold ${bgColor}`}
         >
           {String(panel)?.replace(/_/g, " ")}
         </span>
       );
     })}
   </div>
 </div>
 </div>
 {/* Botón para ir al proyecto */}
 <div className="flex justify-center mt-6">
   <Link href={`/projects/${selectedProject.title}`} passHref>
     <button
       onClick={() => handleGoToProject(selectedProject?.title)}
       className="bg-green-700 shadow-sm shadow-green-900 text-white font-semibold py-2 px-4 min-w-60 rounded-lg flex items-center justify-center"
       disabled={loadingProject === selectedProject?.title}
       >
       Go to project
       {loadingProject === selectedProject?.title ? (
         <FaSpinner className="animate-spin text-white text-lg ml-2" />
       ) : <BsArrowRightShort className="w-6 h-6" />}
     </button>
   </Link>
 </div>
</div>

      ) : (
        <div className="w-full border border-gray-100 rounded-md mt-2">
        {/* Fila: Total Projects */}
        <div className="flex items-center p-4 bg-gray-50">
          <span className="text-base font-medium text-siwa-blue w-1/2">Total Projects:</span>
          <span className="text-base italic text-siwa-blue w-1/2">{projects.length}</span>
        </div>
      
        {/* Fila: Loaded Projects (color alternado) */}
        <div className="flex items-center p-4 bg-white">
          <span className="text-base font-medium text-siwa-blue w-1/2">Loaded Projects:</span>
          <span className="text-base italic text-siwa-blue w-1/2">
            {Object.values(loadedProjects).filter(Boolean).length}
          </span>
        </div>
      
        {/* Fila: Projects with Errors */}
        <div className="flex items-center p-4 bg-gray-50">
          <span className="text-base font-medium text-red-500 w-1/2">Projects with Errors:</span>
          <span className="text-base italic text-red-500 w-1/2">
            {Object.values(projectErrors).filter(Boolean).length}
          </span>
        </div>
      </div>
      
      )}
    </div>
    <div className="w-full flex justify-center items-center mt-8">
      <div className="relative w-48 h-48">
        <div className="perspective-container">
          <div className="absolute w-full h-full transform backface-hidden">
            <img
              src={projectImage}
              alt="Project Visual"
              className={`w-full ${projectImage == '/LogoSIWA.png' ? 'rounded-none' : 'rounded-full'} h-full object-contain`}
            />
          </div>
          <div className="absolute rounded-full w-full h-full transform backface-hidden rotate-y-180 bg-gradient-to-r from-siwa-yellow to-siwa-green-3 flex items-center justify-center">
            <p className="text-siwa-blue text-center font-semibold text-sm p-4">
              Decoding the mysteries of the gut
            </p>
          </div>
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
