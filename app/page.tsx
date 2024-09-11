// pages/index.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/authContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard"); // Redirigir al Dashboard si está autenticado
      } else {
        router.push("/login"); // Redirigir al Login si no está autenticado
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return <div>Cargando...</div>; // Mostrar cargando mientras se determina autenticación
}
