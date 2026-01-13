"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    setTimeout(() => {
      if (!email || !password) {
        setError("Por favor completa todos los campos")
      } else {
        window.location.href = "/dashboard"
      }
      setLoading(false)
    }, 800)
  }

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
              <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido</h2>
              <p className="text-muted-foreground">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
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

              {error && <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">{error}</div>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="font-semibold text-primary hover:text-primary/80">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Para acceder a la demo, usa cualquier email y contraseña</p>
          </div>
        </div>
      </main>
    </div>
  )
}
