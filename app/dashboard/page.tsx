// pages/dashboard.tsx
"use client";
import { useAuth } from "@/app/components/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Layout from "@/app/components/Layout";
import {SidebarProvider} from "@/app/components/context/sidebarContext";
import Dashboard from "@/app/components/dashboard";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login"); // Redirigir a la página de login si no está autenticado
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Cargando...</div>; // Mostrar cargando mientras verificamos autenticación
  }

  if (!isAuthenticated || error) {
    return null; // Evitar renderizar la página si no está autenticado
  }

  return (
    <SidebarProvider>
      <Layout slug={""} filter={undefined} breadcrumbs={""}>
        <Dashboard />
      </Layout>
    </SidebarProvider>
  );
}
