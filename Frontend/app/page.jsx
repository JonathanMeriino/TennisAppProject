"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // Estados adaptados a tu nomenclatura
  // Usamos 'username' para el estado porque es lo que Django espera recibir
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Limpiamos cualquier error anterior

    try {
      const respuesta = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username, // Mandamos el usuario a Django
          password: password,
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        // Guardamos los tokens en el navegador
        localStorage.setItem("access_token", datos.access);
        if (datos.refresh) {
          localStorage.setItem("refresh_token", datos.refresh);
        }
        
        // Redirigimos al panel
        router.push("/dashboard"); 
      } else {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

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
                  htmlFor="usuario"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Usuario
                </label>
                <input
                  id="usuario"
                  type="text" // Cambiado a text por si usan un nombre de usuario en lugar de correo
                  placeholder="Tu usuario o correo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  required
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
                  required
                />
              </div>

              {/* Manejo de errores respetando tus clases de Tailwind */}
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
