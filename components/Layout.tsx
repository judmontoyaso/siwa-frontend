// components/Layout.tsx o layouts/Layout.tsx

import React, { ReactNode } from 'react';
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { SidebarProvider, useSidebar } from './context/sidebarContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps & { slug: string, filter:any }> = ({ children, slug, filter }) => {

  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  return (
    <div className="flex flex-row h-screen">
         <SidebarProvider>
        <Sidebar slug={slug} filter={filter}/>
      <div className={`flex flex-col ${isSidebarOpen ? "w-full" : "w-3/4"}`}>
      <Navbar></Navbar>
        <main className="overflow-auto text-center items-start justify-center flex h-screen">{children}</main>
      </div>
         </SidebarProvider>
    </div>
  );
};

export default Layout;
