"use client"

import { useState, useEffect } from "react"

interface TournamentGroupsProps {
  tournamentId: string
}

export function TournamentGroups({ tournamentId }: TournamentGroupsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockGroups = [
          {
            id: "g1",
            name: "Grupo A",
            players: [
              { id: "p1", name: "Carlos Rodríguez", played: 3, won: 2, lost: 1, points: 5 },
              { id: "p2", name: "Ana Martínez", played: 3, won: 3, lost: 0, points: 9 },
              { id: "p3", name: "Miguel López", played: 3, won: 1, lost: 2, points: 3 },
              { id: "p4", name: "Laura Sánchez", played: 3, won: 0, lost: 3, points: 0 },
            ],
          },
          {
            id: "g2",
            name: "Grupo B",
            players: [
              { id: "p5", name: "Javier Fernández", played: 3, won: 3, lost: 0, points: 9 },
              { id: "p6", name: "Sofía García", played: 3, won: 2, lost: 1, points: 6 },
              { id: "p7", name: "Daniel Pérez", played: 3, won: 1, lost: 2, points: 3 },
              { id: "p8", name: "Elena Díaz", played: 3, won: 0, lost: 3, points: 0 },
            ],
          },
        ]

        setGroups(mockGroups)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [tournamentId])

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando grupos...</div>
  }

  if (groups.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">No hay grupos disponibles</div>
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.id} className="card-base">
          <h3 className="text-lg font-bold text-foreground mb-4">{group.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Pos</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Jugador</th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">PJ</th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">PG</th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">PP</th>
                  <th className="text-center py-3 px-3 font-bold text-foreground">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {group.players
                  .sort((a: any, b: any) => b.points - a.points)
                  .map((player: any, index: number) => (
                    <tr key={player.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground">{index + 1}</td>
                      <td className="py-3 px-3 text-foreground">{player.name}</td>
                      <td className="py-3 px-3 text-center text-foreground">{player.played}</td>
                      <td className="py-3 px-3 text-center text-foreground">{player.won}</td>
                      <td className="py-3 px-3 text-center text-foreground">{player.lost}</td>
                      <td className="py-3 px-3 text-center font-bold text-primary">{player.points}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
