"use client"

import Link from "next/link"
import { RegistroForm } from "@/components/registro-form"

export default function RegistroPage() {
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
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Crear Cuenta</h2>
            <p className="text-muted-foreground">Regístrate para participar en nuestros torneos de tenis</p>
          </div>

          <RegistroForm />

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/" className="font-semibold text-primary hover:text-primary/80">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
