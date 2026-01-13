"use client"

import { useState, useEffect } from "react"

interface TournamentScheduleProps {
  tournamentId: string
  isOrganizer: boolean
}

export function TournamentSchedule({ tournamentId, isOrganizer }: TournamentScheduleProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [matches, setMatches] = useState<any[]>([])
  const [viewMode, setViewMode] = useState("by-date")

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockMatches = [
          {
            id: "m1",
            group: "Grupo A",
            player1: "Carlos Rodríguez",
            player2: "Ana Martínez",
            date: "15 Mayo, 2024",
            time: "10:00",
            court: "Cancha 1",
            status: "Completado",
            result: "6-4, 7-5",
          },
          {
            id: "m2",
            group: "Grupo A",
            player1: "Miguel López",
            player2: "Laura Sánchez",
            date: "15 Mayo, 2024",
            time: "12:00",
            court: "Cancha 2",
            status: "Completado",
            result: "6-2, 6-1",
          },
          {
            id: "m3",
            group: "Grupo A",
            player1: "Carlos Rodríguez",
            player2: "Miguel López",
            date: "17 Mayo, 2024",
            time: "16:00",
            court: "Cancha 1",
            status: "Pendiente",
            result: null,
          },
          {
            id: "m4",
            group: "Grupo B",
            player1: "Javier Fernández",
            player2: "Sofía García",
            date: "15 Mayo, 2024",
            time: "14:00",
            court: "Cancha 3",
            status: "Completado",
            result: "6-3, 6-2",
          },
        ]

        setMatches(mockMatches)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [tournamentId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-primary/20 text-primary"
      case "Pendiente":
        return "bg-accent/20 text-accent-foreground"
      case "Cancelado":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const matchesByDate = matches.reduce(
    (acc, match) => {
      if (!acc[match.date]) acc[match.date] = []
      acc[match.date].push(match)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const matchesByGroup = matches.reduce(
    (acc, match) => {
      if (!acc[match.group]) acc[match.group] = []
      acc[match.group].push(match)
      return acc
    },
    {} as Record<string, any[]>,
  )

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando calendario...</div>
  }

  if (matches.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">No hay partidos programados</div>
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode("by-date")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === "by-date"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          Por Fecha
        </button>
        <button
          onClick={() => setViewMode("by-group")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === "by-group"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          Por Grupo
        </button>
      </div>

      <div className="space-y-6">
        {viewMode === "by-date"
          ? Object.keys(matchesByDate).map((date) => (
              <div key={date} className="card-base">
                <h3 className="text-lg font-bold text-foreground mb-4">{date}</h3>
                <div className="space-y-4">
                  {matchesByDate[date].map((match) => (
                    <div
                      key={match.id}
                      className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                            {match.group}
                          </span>
                          <h4 className="font-medium text-foreground mt-2">
                            {match.player1} vs {match.player2}
                          </h4>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(match.status)}`}>
                          {match.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                        <div>⏰ {match.time}</div>
                        <div>📍 {match.court}</div>
                        {match.result && <div className="font-medium text-primary">Resultado: {match.result}</div>}
                      </div>
                      {isOrganizer && match.status === "Pendiente" && (
                        <button className="text-sm text-primary font-medium hover:underline">Reportar Resultado</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          : Object.keys(matchesByGroup).map((group) => (
              <div key={group} className="card-base">
                <h3 className="text-lg font-bold text-foreground mb-4">{group}</h3>
                <div className="space-y-4">
                  {matchesByGroup[group].map((match) => (
                    <div
                      key={match.id}
                      className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <h4 className="font-medium text-foreground">
                          {match.player1} vs {match.player2}
                        </h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(match.status)}`}>
                          {match.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                        <div>📅 {match.date}</div>
                        <div>⏰ {match.time}</div>
                        <div>📍 {match.court}</div>
                      </div>
                      {match.result && (
                        <div className="text-sm font-medium text-primary mb-3">Resultado: {match.result}</div>
                      )}
                      {isOrganizer && match.status === "Pendiente" && (
                        <button className="text-sm text-primary font-medium hover:underline">Reportar Resultado</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
