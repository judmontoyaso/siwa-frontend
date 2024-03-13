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

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const { user, error, isLoading } = useUser();
  const [empresa, setEmpresa] = useState();
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tokenObtenido, setTokenObtenido] = useState(false);
  const [path, setPath] = useState<string | null>(null);

  return (
    <>
      {user ? (
        <SidebarProvider>
        <Layout slug={""} filter={undefined}>
          <Dashboard></Dashboard>
        </Layout>
        </SidebarProvider>
      ) : (
        <LoginButton></LoginButton>
      )}
    </>
  );
}
