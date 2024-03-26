"use client";
import React from 'react';
import Image from 'next/image';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from 'react';
import { SidebarProvider } from '../components/context/sidebarContext';
import  Layout  from '../components/Layout';
// Componente de la página de perfil
const ProfilePage: React.FC = () => {
    const { user, error, isLoading } = useUser();


    return (
        <><SidebarProvider>
        <Layout slug={""} filter={undefined}> 
        <div className='flex w-full justify-center h-full'>
               <Card className="w-full max-w-xl shadow-xl bg-white h-full p-4">
   
      <div className="flex flex-col items-center justify-start h-full py-2">
          {/* Imagen de perfil */}
          <div className="flex-shrink-0">
                {user && user.picture && (
                    <img src={user.picture} alt="Profile Picture" width={100} height={100} className="rounded-full" />
                )}
            </div>
        <Card className="w-full max-w-xl shadow-xl bg-white p-4">
          <div className="flex items-start justify-center">
          
  
            {/* Información del usuario */}
            <div className="ml-4 text-start">
                <h2 className="text-2xl font-semibold">{user?.name || user?.nickname}</h2>
                {<p className="text-gray-600 text-xl"><span className='font-bold'>Rol: </span> {user?.Rol as never}</p>}
                <p className="text-gray-600 text-xl"><span className='font-bold'>E-mail: </span>{user?.email}</p>
                {<p className="text-gray-600 text-xl"><span className='font-bold'>Empresa: </span> {user?.Empresa as never}</p>}
            </div>
          </div>
        </Card>
      </div>
      </Card>
        </div>
     
      </Layout>
        </SidebarProvider></>
    );
  };
  

  export default ProfilePage;