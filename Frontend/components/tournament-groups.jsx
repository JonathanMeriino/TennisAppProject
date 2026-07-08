"use client";

import { useState, useEffect } from "react";
import { tournaments as tournamentsApi } from "@/lib/api";

export function TournamentGroups({ tournamentId, updatedResult }) {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tournamentId) return;
    tournamentsApi
      .groups(tournamentId)
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  // Update groups when a result is reported
  useEffect(() => {
    if (!updatedResult) return;

    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.name !== updatedResult.group) return group;

        return {
          ...group,
          players: group.players.map((player) => {
            if (player.name === updatedResult.winner) {
              return {
                ...player,
                played: player.played + 1,
                won: player.won + 1,
                setsWon: player.setsWon + updatedResult.setsWinner,
                setsLost: player.setsLost + updatedResult.setsLoser,
                points: player.points + 3,
              };
            }
            if (player.name === updatedResult.loser) {
              return {
                ...player,
                played: player.played + 1,
                lost: player.lost + 1,
                setsWon: player.setsWon + updatedResult.setsLoser,
                setsLost: player.setsLost + updatedResult.setsWinner,
                points: player.points,
              };
            }
            return player;
          }),
        };
      }),
    );
  }, [updatedResult]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Cargando grupos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-destructive">{error}</div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No hay grupos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.id} className="card-base">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {group.name}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                    Pos
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                    Jugador
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    PJ
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    PG
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    PP
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    Sets +
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    Sets -
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                    Diff
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-foreground">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.players
                  .sort((a, b) => {
                    // Sort by points first
                    if (b.points !== a.points) return b.points - a.points;
                    // Then by set difference
                    const diffA = a.setsWon - a.setsLost;
                    const diffB = b.setsWon - b.setsLost;
                    if (diffB !== diffA) return diffB - diffA;
                    // Then by sets won
                    return b.setsWon - a.setsWon;
                  })
                  .map((player, index) => {
                    const setDiff = player.setsWon - player.setsLost;
                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${index < 2 ? "bg-primary/5" : ""}`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index < 2 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-foreground">
                          {player.name}
                        </td>
                        <td className="py-3 px-3 text-center text-foreground">
                          {player.played}
                        </td>
                        <td className="py-3 px-3 text-center text-primary font-medium">
                          {player.won}
                        </td>
                        <td className="py-3 px-3 text-center text-destructive font-medium">
                          {player.lost}
                        </td>
                        <td className="py-3 px-3 text-center text-foreground">
                          {player.setsWon}
                        </td>
                        <td className="py-3 px-3 text-center text-foreground">
                          {player.setsLost}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-medium ${setDiff > 0 ? "text-primary" : setDiff < 0 ? "text-destructive" : "text-foreground"}`}
                          >
                            {setDiff > 0 ? `+${setDiff}` : setDiff}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold">
                            {player.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Los 2 primeros de cada grupo clasifican a la fase de eliminacion
              directa
            </p>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="card-base">
        <h4 className="font-semibold text-foreground mb-3">Leyenda</h4>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <strong>PJ</strong> = Partidos Jugados
          </span>
          <span>
            <strong>PG</strong> = Partidos Ganados
          </span>
          <span>
            <strong>PP</strong> = Partidos Perdidos
          </span>
          <span>
            <strong>Sets +</strong> = Sets Ganados
          </span>
          <span>
            <strong>Sets -</strong> = Sets Perdidos
          </span>
          <span>
            <strong>Diff</strong> = Diferencia de Sets
          </span>
          <span>
            <strong>Pts</strong> = Puntos (Victoria = 3)
          </span>
        </div>
      </div>
    </div>
  );
}
