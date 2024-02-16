// components/Layout.tsx o layouts/Layout.tsx

import React, { ReactNode } from 'react';
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from './context/sidebarContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps & { slug: string }> = ({ children, slug }) => {
  return (
    <div className="flex flex-row h-screen">
         <SidebarProvider>
        <Sidebar slug={slug}/>
      <div className="flex flex-col w-full">
      <Navbar></Navbar>
        <main className="overflow-auto text-center items-center justify-center flex">{children}</main>
      </div>
         </SidebarProvider>
    </div>
  );
};

export default Layout;
