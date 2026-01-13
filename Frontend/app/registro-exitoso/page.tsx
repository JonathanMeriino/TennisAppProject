"use client"

import Link from "next/link"

export default function RegistroExitosoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <h1 className="text-2xl font-bold text-primary">Tournify</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl">✓</div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">¡Registro Exitoso!</h2>
          <p className="text-muted-foreground mb-8">
            Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión y comenzar a participar en nuestros
            torneos de tenis.
          </p>

          <div className="space-y-3">
            <Link href="/" className="btn-primary w-full text-center">
              Ir a Iniciar Sesión
            </Link>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes todo listo?{" "}
              <Link href="/dashboard" className="text-primary font-medium hover:underline">
                Ve al Dashboard
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-sm text-muted-foreground space-y-2">
            <p>✓ Correo verificado</p>
            <p>✓ Perfil completado</p>
            <p>✓ Listo para participar en torneos</p>
          </div>
        </div>
      </main>
    </div>
  )
}
