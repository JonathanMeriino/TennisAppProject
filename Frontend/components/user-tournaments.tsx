"use client"

import Link from "next/link"

interface Tournament {
  id: string
  name: string
  status: "En progreso" | "Próximo" | "Finalizado"
  date: string
  location: string
  participants: number
  category: string
  isOrganizer: boolean
}

export function UserTournaments() {
  const tournaments: Tournament[] = [
    {
      id: "t1",
      name: "Torneo Primavera 2024",
      status: "En progreso",
      date: "15 Mayo - 30 Mayo, 2024",
      location: "Club de Tenis Central",
      participants: 16,
      category: "B",
      isOrganizer: true,
    },
    {
      id: "t2",
      name: "Copa Municipal",
      status: "Próximo",
      date: "10 Junio - 20 Junio, 2024",
      location: "Canchas Municipales",
      participants: 24,
      category: "B",
      isOrganizer: false,
    },
    {
      id: "t3",
      name: "Torneo Amistoso",
      status: "Finalizado",
      date: "1 Abril - 10 Abril, 2024",
      location: "Club Deportivo Norte",
      participants: 8,
      category: "B",
      isOrganizer: false,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En progreso":
        return "bg-primary/20 text-primary"
      case "Próximo":
        return "bg-accent/20 text-accent-foreground"
      case "Finalizado":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (tournaments.length === 0) {
    return (
      <div className="card-base text-center py-12">
        <p className="text-muted-foreground mb-4">No te has unido a ningún torneo todavía</p>
        <Link href="/crear-torneo" className="btn-primary inline-block">
          Crear tu primer torneo
        </Link>
      </div>
    )
  }

  return (
    <div className="card-base">
      <h2 className="text-xl font-bold text-foreground mb-2">Mis Torneos</h2>
      <p className="text-muted-foreground mb-6">Torneos a los que te has unido o has creado</p>

      <div className="space-y-4">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-foreground">{tournament.name}</h3>
                  {tournament.isOrganizer && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Organizador</span>
                  )}
                </div>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(tournament.status)}`}
                >
                  {tournament.status}
                </span>
              </div>
              <Link
                href={`/torneos/${tournament.id}`}
                className="text-sm text-primary hover:text-primary/80 font-semibold"
              >
                Ver detalles →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{tournament.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{tournament.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>{tournament.participants} participantes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
