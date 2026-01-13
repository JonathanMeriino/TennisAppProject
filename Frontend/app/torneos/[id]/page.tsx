"use client"

import Link from "next/link"
import { useState } from "react"
import { TournamentDetails } from "@/components/tournament-details"
import { TournamentGroups } from "@/components/tournament-groups"
import { TournamentSchedule } from "@/components/tournament-schedule"
import { TournamentResults } from "@/components/tournament-results"

export default function TournamentPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("groups")

  const tournament = {
    id: params.id,
    name: "Torneo Primavera 2024",
    startDate: "15 Mayo, 2024",
    location: "Club de Tenis Central",
    category: "B",
    format: "round-robin",
    numberOfGroups: 2,
    status: "En progreso",
    description: "Torneo de tenis para jugadores de categoría B con fase de grupos.",
    isOrganizer: true,
  }

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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <TournamentDetails tournament={tournament} />

        {/* Tabs Navigation */}
        <div className="mt-8">
          <div className="flex gap-1 border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === "groups"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Grupos
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === "schedule"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === "results"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resultados
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "groups" && <TournamentGroups tournamentId={params.id} />}
            {activeTab === "schedule" && (
              <TournamentSchedule tournamentId={params.id} isOrganizer={tournament.isOrganizer} />
            )}
            {activeTab === "results" && (
              <TournamentResults tournamentId={params.id} isOrganizer={tournament.isOrganizer} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
