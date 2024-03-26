// components/Layout.tsx o layouts/Layout.tsx
"use client";
import React, { ReactNode, useEffect } from 'react';
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { SidebarProvider, useSidebar } from './context/sidebarContext';
import { Tag } from 'primereact/tag';
import { useUser } from "@auth0/nextjs-auth0/client";

import 'primeicons/primeicons.css';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps & { slug: string, filter:any }> = ({ children, slug, filter }) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { user, error, isLoading } = useUser();
  useEffect(() => {console.log("layout", isSidebarOpen)}, [isSidebarOpen]);
  return (
    <div className="flex flex-row h-full">
        <Sidebar slug={slug} filter={filter}/>
      <div className={`flex flex-col h-full ${isSidebarOpen ? "w-full" : "w-full"}`}>
      <Navbar slug={slug} ></Navbar>

        <main className="overflow-auto text-center items-start justify-center block bg-white p-5 h-full">

    {children}

        </main>
        <div className='w-full flex flex-row justify-between border border-t-gray-100'>
        <div>
          <Tag severity="success" className="m-2 ml-5" icon='pi pi-fw pi-user' >
            <span className='font-light'> {user?.Rol as ReactNode}</span>
          </Tag>
        </div>
        <div className="flex items-center text-center mr-5">
          version 0.0.1
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Layout;
