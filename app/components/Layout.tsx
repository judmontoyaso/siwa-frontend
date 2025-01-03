// components/Layout.tsx o layouts/Layout.tsx
"use client";
import React, { ReactNode, Suspense, useEffect } from 'react';
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { SidebarProvider, useSidebar } from './context/sidebarContext';
import { Tag } from 'primereact/tag';
import { useUser } from "@auth0/nextjs-auth0/client";

import 'primeicons/primeicons.css';
import Loading from './loading';
import { CgSpinnerTwoAlt } from 'react-icons/cg';
import Spinner from './pacmanLoader';
import { PopupProvider } from './context/popupContext';
import Footer from './footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps & { slug: string, filter: any, breadcrumbs:any }> = ({ children, slug, filter , breadcrumbs}) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { user, error, isLoading } = useUser();
  return (
    
    <Suspense fallback={<p>Loading feed...</p>}><div className="flex flex-row h-full">
      {isLoading ? <><Spinner /></> : <>   <Sidebar slug={slug} filter={filter} />
        <div className={`flex flex-col h-full ml-60  ${isSidebarOpen ? "w-full" : "w-full"}`}>
          <Navbar slug={slug} breadcrumbs={breadcrumbs}/>


            <main className="overflow-auto text-center items-start  bg-white p-5 h-full flex flex-col justify-between ">

              {children}
<Footer />
            </main>
          <div className='w-full flex flex-row justify-between border border-t-gray-100'>
            <div>
              <Tag severity="success" className="m-2 ml-5" icon='pi pi-fw pi-user' >
                <span className='font-light'> {user?.Rol as ReactNode}</span>
              </Tag>
            </div>
            <div className="flex items-center text-center mr-5">
              Version 1.0.1
            </div>
          </div>
        </div></>}



    </div></Suspense>
        

  );
};

export default Layout;
