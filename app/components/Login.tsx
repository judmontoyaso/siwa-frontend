import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import logoSiwa from '../../public/LogoSIWA.png';
import Image from 'next/image';

const Login = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="flex justify-center items-center h-screen bg-pastel-color">
            <Link href="/api/auth/login">
                <div className="flex flex-col items-center">
                    {isLoaded && (
                        <div className="animate-slide-down">
                            <Image src={logoSiwa} alt="Logo SIWA" width={650} />
                        </div>
                    )}
                    {/* <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button">Iniciar Sesión</button> */}
                </div>
            </Link>
        </div>
    );
}

export default Login;