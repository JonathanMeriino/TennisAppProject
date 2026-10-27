"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FormLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem("access_token", datos.access);
        if (datos.refresh) {
          localStorage.setItem("refresh_token", datos.refresh);
        }
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
            Ingresa tu usuario
          </label>
          <input
            id="usuario"
            type="text" 
            placeholder="Tu usuario"
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
        <div className="flex justify-end mt-2">
          <a href="/recuperar-password" className="text-sm text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
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
  );
}