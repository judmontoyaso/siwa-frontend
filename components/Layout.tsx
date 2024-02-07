// components/Layout.tsx o layouts/Layout.tsx

import React, { ReactNode } from 'react';
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar></Navbar>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-scroll h-screen text-center">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
