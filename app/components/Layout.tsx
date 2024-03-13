// components/Layout.tsx o layouts/Layout.tsx
"use client";
import React, { ReactNode, useEffect } from 'react';
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { SidebarProvider, useSidebar } from './context/sidebarContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps & { slug: string, filter:any }> = ({ children, slug, filter }) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  useEffect(() => {console.log("layout", isSidebarOpen)}, [isSidebarOpen]);
  return (
    <div className="flex flex-row h-screen">
        <Sidebar slug={slug} filter={filter}/>
      <div className={`flex flex-col ${isSidebarOpen ? "w-4/5" : "w-full"}`}>
      <Navbar></Navbar>
        <main className="overflow-auto text-center items-start justify-center flex h-screen bg-white p-5">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
