import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import logoSiwa from '../../public/Siwa-blanco-01.png';
import fondo from '../../public/fondo-login.png';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import TitleEffect from './tittle';
import { FaCaretRight } from "react-icons/fa";
import { Ripple } from 'primereact/ripple';

const Login = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [username, setUsername] = useState('');
    const [userpass, setUserpass] = useState('');
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="flex justify-center items-center h-screen w-full">
            <div className='flex w-full flex-row h-full items-center'>
                <div className='w-3/5  rounded-br-3xl h-full'>
                    <div className='w-full h-full bg-cover bg-center rounded-br-3xl' style={{ backgroundImage: `url('${fondo.src}')` }}>
                        <div className='w-full  bg-siwa-blue h-full flex items-center justify-center bg-opacity-95 rounded-br-3xl'>
                            <div className="flex flex-col items-center w-full h-full ">
                              
                                    <div className="animate-slide-down w-10/12 m-5 ml-10 h-1/6 top-9 align-middle flex items-end">
                                        <Image src={logoSiwa} alt="Logo SIWA" width={150} />
                                    </div>

                             

                                <div className='h-5/6 flex flex-col align-middle items-start justify-center text-white w-10/12'>
<div className='text-5xl m-2'>
<TitleEffect /> the
</div>
<div className='text-5xl m-2'>
<span className='text-siwa-yellow font-bold'>microbiome</span> of 
</div>
<div className='text-5xl m-2'>
your animals
</div>
                                
                                
                                    <p className='m-2 mt-5 font-light text-xl'>
                                        Boost the performance of your farm through an <br></br>
                                         understanding of your specific microbial patterns.
                                    </p>
                                    <p className='m-2 mt-10'>
                                        <Link href="https://siwa.bio/" target='_blank'>
                                            <button className="p-ripple hover:animate-pulse bg-siwa-yellow text-siwa-blue font-bold py-2 px-4 rounded inline-flex items-center">
                                            <span style={{ color: 'white', textShadow: '0.5px 0.5px 1px gray, -0.5px -0.5px 1px gray, 0.5px -0.5px 1px gray, -0.5px 0.5px 1px gray' }}>Know more about  SIWA</span>
 {/* <FaCaretRight  className="mr-2 text-lg text-white" /> */}
                                        
                                            </button>
                                        </Link>
                                    </p>
                                </div>
                                {/* <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button">Iniciar Sesión</button> */}
                            </div>
                        </div>


                    </div>
                </div>

                <div className='flex flex-col w-2/5 items-center justify-center'>
                    <div className='m-4'>
                        <h1 className='text-3xl text-siwa-blue'>Welcome to SIWA</h1>
                    </div>


                    <div className="flex items-center justify-center mt-5">
                        <Link href="/api/auth/login">
                            <button className="animate-pulse duration-1000 text-2xl px-4 py-2 border flex border-slate-200 dark:border-slate-700 rounded-lg  dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition bg-siwa-blue text-white">
                                <Image className="w-6 h-6 mr-2 mt-1" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" width={8} height={8} />
                                <span>Login with Google</span>
                            </button>
                        </Link>
                    </div>

                    {/* <div className='m-4'>

                <span className="p-float-label">
    <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
    <label htmlFor="username">Username</label>
</span>
                    </div>
                    <div className='m-4'>

<span className="p-float-label">
    <Password inputId="password" value={userpass} onChange={(e) => setUserpass(e.target.value)} />
    <label htmlFor="password">Password</label>
</span>
                    </div>
                    <div  className='m-4'>
                        <button className="bg-siwa-blue hover:bg-navy-500 text-white font-bold py-2 px-4 rounded" type="button">Iniciar Sesión</button>
                    </div> */}
                </div>
            </div>



        </div>
    );
}

export default Login;