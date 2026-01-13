"use client"

import { useState, useEffect } from "react"

interface TournamentResultsProps {
  tournamentId: string
  isOrganizer: boolean
}

export function TournamentResults({ tournamentId, isOrganizer }: TournamentResultsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [result, setResult] = useState({ set1_p1: "", set1_p2: "", set2_p1: "", set2_p2: "", set3_p1: "", set3_p2: "" })

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockMatches = [
          {
            id: "m1",
            group: "Grupo A",
            player1: "Carlos Rodríguez",
            player2: "Ana Martínez",
            date: "15 Mayo, 2024",
            status: "Completado",
            result: "6-4, 7-5",
          },
          {
            id: "m2",
            group: "Grupo A",
            player1: "Miguel López",
            player2: "Laura Sánchez",
            date: "15 Mayo, 2024",
            status: "Completado",
            result: "6-2, 6-1",
          },
          {
            id: "m3",
            group: "Grupo A",
            player1: "Carlos Rodríguez",
            player2: "Miguel López",
            date: "17 Mayo, 2024",
            status: "Pendiente",
            result: null,
          },
        ]

        setMatches(mockMatches)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [tournamentId])

  const handleReportClick = (match: any) => {
    setSelectedMatch(match)
    setResult({ set1_p1: "", set1_p2: "", set2_p1: "", set2_p2: "", set3_p1: "", set3_p2: "" })
    setShowDialog(true)
  }

  const handleSaveResult = () => {
    if (!result.set1_p1 || !result.set1_p2 || !result.set2_p1 || !result.set2_p2) {
      alert("Por favor completa al menos los dos primeros sets")
      return
    }

    let resultStr = `${result.set1_p1}-${result.set1_p2}, ${result.set2_p1}-${result.set2_p2}`
    if (result.set3_p1 && result.set3_p2) {
      resultStr += `, ${result.set3_p1}-${result.set3_p2}`
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === selectedMatch.id ? { ...m, status: "Completado", result: resultStr } : m)),
    )

    setShowDialog(false)
  }

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando resultados...</div>
  }

  if (matches.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">No hay partidos disponibles</div>
  }

  return (
    <>
      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Grupo</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Jugadores</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground">Resultado</th>
              {isOrganizer && <th className="text-center py-3 px-3 font-medium text-muted-foreground">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-3 px-3 text-foreground">{match.group}</td>
                <td className="py-3 px-3 text-foreground">
                  {match.player1} vs {match.player2}
                </td>
                <td className="py-3 px-3 text-foreground">{match.date}</td>
                <td className="py-3 px-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      match.status === "Completado"
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent-foreground"
                    }`}
                  >
                    {match.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-foreground">{match.result || "-"}</td>
                {isOrganizer && (
                  <td className="py-3 px-3 text-center">
                    {match.status === "Pendiente" && (
                      <button
                        onClick={() => handleReportClick(match)}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Reportar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border shadow-lg">
            <h3 className="text-lg font-bold mb-2">Reportar Resultado</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {selectedMatch?.player1} vs {selectedMatch?.player2}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Set 1</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={result.set1_p1}
                    onChange={(e) => setResult({ ...result, set1_p1: e.target.value })}
                    placeholder="0"
                    className="input-field w-16 text-center"
                  />
                  <span className="font-medium">-</span>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={result.set1_p2}
                    onChange={(e) => setResult({ ...result, set1_p2: e.target.value })}
                    placeholder="0"
                    className="input-field w-16 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Set 2</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={result.set2_p1}
                    onChange={(e) => setResult({ ...result, set2_p1: e.target.value })}
                    placeholder="0"
                    className="input-field w-16 text-center"
                  />
                  <span className="font-medium">-</span>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={result.set2_p2}
                    onChange={(e) => setResult({ ...result, set2_p2: e.target.value })}
                    placeholder="0"
                    className="input-field w-16 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Set 3 (Opcional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={result.set3_p1}
                    onChange={(e) => setResult({ ...result, set3_p1: e.target.value })}
                    placeholder="0"
                    className="input-field w-16 text-center"
                  />
                  <span className="font-medium">-</span>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={result.set3_p2}
                    onChange={(e) => setResult({ ...result, set3_p2: e.target.value })}
                    placeholder="0"
                    className="input-field w-16 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowDialog(false)} className="btn-outline flex-1">
                Cancelar
              </button>
              <button onClick={handleSaveResult} className="btn-primary flex-1">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
