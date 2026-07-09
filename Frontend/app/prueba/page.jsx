"use client";

import { useState } from "react";

export default function PruebaPage() {
  // Estado para guardar la respuesta de Django
  const [mensaje, setMensaje] = useState("Esperando conexión...");

  // Función que hace la petición al presionar el botón
  const hacerPrueba = async () => {
    setMensaje("Conectando...");
    
    try {
      // Hacemos el fetch a la URL que creaste en Django
      const respuesta = await fetch("http://localhost:8000/prueba/");
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setMensaje(datos.mensaje); // Mostramos el mensaje exitoso
      } else {
        setMensaje("Error: Django respondió pero rechazó la conexión (¿Falta configurar CORS?).");
      }
    } catch (error) {
      setMensaje("Error crítico: No se pudo alcanzar el servidor. ¿Está encendido Django?");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Prueba de Conexión</h1>
      
      <button 
        onClick={hacerPrueba}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium mb-8 hover:opacity-90 transition-opacity"
      >
        Llamar al Backend
      </button>

      <div className="border p-6 rounded-lg shadow-sm min-w-[300px] text-center bg-card">
        <p className="text-muted-foreground text-sm mb-2">Respuesta del servidor:</p>
        <p className="font-semibold text-lg text-foreground">{mensaje}</p>
      </div>
    </div>
  );
}