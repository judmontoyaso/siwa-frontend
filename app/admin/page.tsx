"use client";
import 'react-toastify/dist/ReactToastify.css';
import { use, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { FaSpinner } from "react-icons/fa6";
import { GrDocumentConfig } from "react-icons/gr";

export default function Page({ params }: { params: { slug: string } }) {
    const [file, setFile] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [accessToken, setAccessToken] = useState();
    const [loading, setLoading] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);

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
    
useEffect(() => {fetchToken()}, [params.slug]);


    const handleFileChange = (e:any) => {
        setFile(e.target.files[0]);
    };

    const handleProjectNameChange = (e:any) => {
        setProjectName(e.target.value);
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();
    
        if (!projectName || !file) {
            alert('Por favor, ingresa el nombre del proyecto y selecciona un archivo.');
            return;
        }
        setLoading(true);
        console.log(loading)
        const formData = new FormData();
        formData.append("file", file);
    
        // Nota: No es necesario establecer el encabezado 'Content-Type' al usar FormData.
        // El navegador lo establecerá automáticamente con el 'boundary' adecuado para 'multipart/form-data'.
        const result = await fetch(`http://127.0.0.1:8000/admin/uploadconfigfile/${projectName}`, {
            method: 'POST',
            headers: {
                // Incluye el token de Auth0 en los encabezados de la solicitud
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData,
        });
     
        if (result.ok) {
            toast.success('Archivo subido con exito', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
                });
            setProjectName('');
            setFile(null);
            document.getElementById('fileInput')?.setAttribute('value', '');
            setLoading(false);
            console.log(loading)
        } else {
            toast.error('Error al subir el archivo', {
                position: "top-center",
                autoClose: 4996,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "light",
                transition: Bounce,
                });        }
    };
    

    return (
        <div>
            <Layout slug={params.slug} filter={""}>
                <div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 m-4 cursor-pointer" onClick={() => setIsFormVisible(true)}>
                    <h5 className="mb-2 flex flex-row text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Config File  <GrDocumentConfig className='ml-2' /></h5>
                </div>
    
                {isFormVisible && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                                <GrDocumentConfig />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Config File</h3>
                                <div className="mt-2 px-7 py-3">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input id='textInput' type="text" value={projectName} onChange={handleProjectNameChange} placeholder="Nombre del Proyecto" className="block w-full px-4 py-2 border rounded-md" />
                                        <input id='fileInput' type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                                        <button type="submit" className="flex flex-row text-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 w-52">{loading? ("Subiendo ") : "Subir Archivo"}  {loading?<FaSpinner  className="mr-2 w-4 h-4  text-gray-300 animate-spin dark:text-gray-600 fill-blue-400"/> :""}</button>
                                    </form>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button id="ok-btn" className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300" onClick={() => setIsFormVisible(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
    
                <ToastContainer />
            </Layout>
        </div>
    );
    
}
