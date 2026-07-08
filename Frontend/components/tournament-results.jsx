"use client";

import { useState, useEffect } from "react";
import { tournaments as tournamentsApi } from "@/lib/api";

export function TournamentResults({
  tournamentId,
  isOrganizer,
  onResultUpdated,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    setsPlayer1: "",
    setsPlayer2: "",
  });

  useEffect(() => {
    if (!tournamentId) return;
    tournamentsApi
      .matches(tournamentId)
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  const handleReportClick = (match) => {
    setSelectedMatch(match);
    setResult({ setsPlayer1: "", setsPlayer2: "" });
    setShowDialog(true);
  };

  const handleSaveResult = async () => {
    const setsP1 = Number.parseInt(result.setsPlayer1);
    const setsP2 = Number.parseInt(result.setsPlayer2);

    if (result.setsPlayer1 === "" || result.setsPlayer2 === "") {
      alert("Por favor ingresa los sets ganados por cada jugador");
      return;
    }

    if ((setsP1 !== 2 && setsP2 !== 2) || (setsP1 === 2 && setsP2 === 2)) {
      alert(
        "El partido es al mejor de 3. Un jugador debe ganar exactamente 2 sets.",
      );
      return;
    }

    if (setsP1 > 2 || setsP2 > 2 || setsP1 < 0 || setsP2 < 0) {
      alert("Los sets ganados deben ser entre 0 y 2");
      return;
    }

    if (!selectedMatch) return;

    const winner =
      setsP1 > setsP2 ? selectedMatch.player1 : selectedMatch.player2;

    setIsSaving(true);
    try {
      const updatedMatch = await tournamentsApi.reportResult(
        tournamentId,
        selectedMatch.id,
        {
          setsWonPlayer1: setsP1,
          setsWonPlayer2: setsP2,
          winner,
        },
      );

      // Usa la respuesta del backend si la devuelve, si no, actualiza localmente
      const finalMatch = updatedMatch?.id
        ? updatedMatch
        : {
            ...selectedMatch,
            status: "Completado",
            setsWonPlayer1: setsP1,
            setsWonPlayer2: setsP2,
            winner,
          };

      setMatches((prev) =>
        prev.map((m) => (m.id === selectedMatch.id ? finalMatch : m)),
      );

      if (onResultUpdated) {
        onResultUpdated(finalMatch);
      }

      setShowDialog(false);
    } catch (err) {
      alert(err.message || "No se pudo guardar el resultado.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Cargando resultados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-destructive">{error}</div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No hay partidos disponibles
      </div>
    );
  }

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.group]) {
      acc[match.group] = [];
    }
    acc[match.group].push(match);
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
          <div key={groupName} className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-4">
              {groupName}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                      Jugador 1
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                      Sets
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                      Jugador 2
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                      Sets
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">
                      Ganador
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                      Estado
                    </th>
                    {isOrganizer && (
                      <th className="text-center py-3 px-3 font-medium text-muted-foreground">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {groupMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-3 text-foreground text-xs">
                        {match.date}
                      </td>
                      <td
                        className={`py-3 px-3 ${match.winner === match.player1 ? "font-bold text-primary" : "text-foreground"}`}
                      >
                        {match.player1}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block w-8 h-8 rounded-full leading-8 text-sm font-bold ${match.winner === match.player1 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                        >
                          {match.setsWonPlayer1}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 ${match.winner === match.player2 ? "font-bold text-primary" : "text-foreground"}`}
                      >
                        {match.player2}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block w-8 h-8 rounded-full leading-8 text-sm font-bold ${match.winner === match.player2 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                        >
                          {match.setsWonPlayer2}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {match.winner ? (
                          <span className="text-primary font-semibold text-sm">
                            {match.winner}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
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
                      {isOrganizer && (
                        <td className="py-3 px-3 text-center">
                          {match.status === "Pendiente" && (
                            <button
                              type="button"
                              onClick={() => handleReportClick(match)}
                              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
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
          </div>
        ))}
      </div>

      {/* Report Dialog */}
      {showDialog && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-lg w-full border border-border shadow-xl">
            <h3 className="text-xl font-bold mb-1 text-foreground">
              Reportar Resultado
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Ingresa el marcador de cada set
            </p>

            {/* Players Display */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedMatch.player1}
                  </p>
                  <p className="text-xs text-muted-foreground">Jugador 1</p>
                </div>
                <div className="px-4">
                  <span className="text-2xl font-bold text-muted-foreground">
                    VS
                  </span>
                </div>
                <div className="text-center flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedMatch.player2}
                  </p>
                  <p className="text-xs text-muted-foreground">Jugador 2</p>
                </div>
              </div>
            </div>

            {/* Sets Input */}
            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Partido al mejor de 3 sets
              </p>

              {/* Player 1 Sets */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedMatch.player1}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Sets ganados:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={result.setsPlayer1}
                    onChange={(e) =>
                      setResult({ ...result, setsPlayer1: e.target.value })
                    }
                    placeholder="0"
                    className="input-field w-16 text-center text-xl font-bold"
                  />
                </div>
              </div>

              {/* Player 2 Sets */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedMatch.player2}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Sets ganados:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={result.setsPlayer2}
                    onChange={(e) =>
                      setResult({ ...result, setsPlayer2: e.target.value })
                    }
                    placeholder="0"
                    className="input-field w-16 text-center text-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Preview Winner */}
            {result.setsPlayer1 !== "" && result.setsPlayer2 !== "" && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Ganador del partido:
                </p>
                <p className="text-lg font-bold text-primary">
                  {(() => {
                    const setsP1 = Number.parseInt(result.setsPlayer1) || 0;
                    const setsP2 = Number.parseInt(result.setsPlayer2) || 0;
                    if (setsP1 === 2 && setsP2 < 2)
                      return `${selectedMatch.player1} (2-${setsP2})`;
                    if (setsP2 === 2 && setsP1 < 2)
                      return `${selectedMatch.player2} (2-${setsP1})`;
                    return "Resultado invalido";
                  })()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                disabled={isSaving}
                className="btn-primary flex-1"
              >
                {isSaving ? "Guardando..." : "Guardar Resultado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
