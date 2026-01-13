"use client"

import Link from "next/link"
import { CreateTournamentForm } from "@/components/create-tournament-form"

export default function CreateTournamentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Tournify</h1>
          <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            ← Volver al Panel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Crear Nuevo Torneo</h2>
          <p className="text-muted-foreground">Configura los detalles de tu torneo de tenis</p>
        </div>

        <CreateTournamentForm />
      </main>
    </div>
  )
}
