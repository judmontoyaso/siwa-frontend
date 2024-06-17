"use client";
import LoginButton from "@/app/components/Login";
import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Layout from "@/app/components/Layout";
import Dashboard from "@/app/components/dashboard";
import { useRouter } from "next/router";
import { SidebarProvider } from "./components/context/sidebarContext";
import PopupComponent from "./components/popUpContent";
import { useAuth } from "./components/authContext";

export default function Home() {
  const [projectIds, setProjectIds] = useState([]);
  const { accessToken, isLoading, error } = useAuth();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);

  return (
    <>
{isLoading ? (<><SidebarProvider>
  
        <Layout slug={""} filter={undefined} breadcrumbs={""}> cargando...      </Layout>
        </SidebarProvider></> ) : (   <>
  {!error ? (
        <SidebarProvider>
        <Layout slug={""} filter={undefined}  breadcrumbs={""}>
          <Dashboard></Dashboard>
        </Layout>
        </SidebarProvider>
      ) : (
        <LoginButton></LoginButton>
      )} 
</>)}

    
    </>
  );
}
