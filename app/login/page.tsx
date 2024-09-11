// pages/login.tsx
"use client";
import { useAuth } from "@/app/components/authContext";
import LoginButton from "@/app/components/Login";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isatty } from "tty";

export default function Login() {
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard"); // Redirige al Dashboard si ya está autenticado
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Evitar mostrar el login si ya está autenticado
  }

  return (
    <div>
        {!isAuthenticated ? <LoginButton /> : null}
     
    </div>
  );
}
