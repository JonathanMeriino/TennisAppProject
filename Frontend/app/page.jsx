"use client";// Obligatorio para manejar formularios y clics

import Link from "next/link"; // Importa el componente Link de Next.js para la navegación entre páginas
import { useState } from "react"; //UN hook de REact que permite crear y actualizar variables de estado dentro del componente
import { auth } from "@/lib/api"; //Un servicio o modulo personalizado que contiene la logica para conectarse con el servidor

// Componente de página de inicio de sesión
export default function LoginPage() {
  const [email, setEmail] = useState(""); // Estado para almacenar el correo electrónico ingresado por el usuario
  const [password, setPassword] = useState(""); // Estado para almacenar la contraseña ingresada por el usuario
  const [loading, setLoading] = useState(false); // Estado para indicar si se está procesando la solicitud de inicio de sesión
  const [error, setError] = useState(""); // Estado para almacenar mensajes de error relacionados con el inicio de sesión

  // Función para manejar el evento de envío del formulario de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setError(""); // Limpia cualquier mensaje de error previo

    if (!email || !password) {
      // Verifica que ambos campos estén completos. Si falta alguno, muestra el error
      setError("Por favor completa todos los campos");
      return;
    }
    
    setLoading(true); // Indica que se está procesando la solicitud de inicio de sesión
    try { // Exitos
      await auth.login(email, password); // Llama a la funcion para validar las credenciales en el servidor y espera la respuesta
      window.location.href = "/dashboard"; // Si las credenciales son correctas, redirige al usuario al dashboard
    } catch (err) { //Errors
      setError(err.message || "Credenciales inválidas. Intenta de nuevo."); // Si ocurre un error, muestra un mensaje de error al usuario
    } finally { // Se ejecuta siempre, sin importar si hubo exitio o error, para indicar que la solicitud ha terminados
      setLoading(false);
    }
  };
  // Renderiza el contenido de la página de inicio de sesión
  return ( 
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <h1 className="text-2xl font-bold text-primary">Tournify</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card-base mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Bienvenido
              </h2>
              <p className="text-muted-foreground">
                Inicia sesión en tu cuenta
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Inicia sesión con las credenciales de tu cuenta</p>
          </div>
        </div>
      </main>
    </div>
  );
}
