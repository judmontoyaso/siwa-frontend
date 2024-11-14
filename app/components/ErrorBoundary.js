"use client"
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para mostrar una pantalla alternativa de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes registrar el error en un servicio de reporte de errores aquí
    console.error("Client-side error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes redirigir a una página de error personalizada o mostrar contenido alternativo
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h1>Oops! Something went wrong.</h1>
          <p>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
