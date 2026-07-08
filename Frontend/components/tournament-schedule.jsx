"use client";

import { useState, useEffect } from "react";
import { tournaments as tournamentsApi } from "@/lib/api";

export function TournamentSchedule({ tournamentId, isOrganizer }) {
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [viewMode, setViewMode] = useState("by-date");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tournamentId) return;
    tournamentsApi
      .matches(tournamentId)
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completado":
        return "bg-primary/20 text-primary";
      case "Pendiente":
        return "bg-accent/20 text-accent-foreground";
      case "Cancelado":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const matchesByDate = matches.reduce((acc, match) => {
    if (!acc[match.date]) acc[match.date] = [];
    acc[match.date].push(match);
    return acc;
  }, {});

  const matchesByGroup = matches.reduce((acc, match) => {
    if (!acc[match.group]) acc[match.group] = [];
    acc[match.group].push(match);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Cargando calendario...
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
        No hay partidos programados
      </div>
    );
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
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {date}
                </h3>
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
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(match.status)}`}
                        >
                          {match.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                        <div>⏰ {match.time}</div>
                        <div>📍 {match.court}</div>
                        {match.result && (
                          <div className="font-medium text-primary">
                            Resultado: {match.result}
                          </div>
                        )}
                      </div>
                      {isOrganizer && match.status === "Pendiente" && (
                        <button className="text-sm text-primary font-medium hover:underline">
                          Reportar Resultado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          : Object.keys(matchesByGroup).map((group) => (
              <div key={group} className="card-base">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {group}
                </h3>
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
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(match.status)}`}
                        >
                          {match.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                        <div>📅 {match.date}</div>
                        <div>⏰ {match.time}</div>
                        <div>📍 {match.court}</div>
                      </div>
                      {match.result && (
                        <div className="text-sm font-medium text-primary mb-3">
                          Resultado: {match.result}
                        </div>
                      )}
                      {isOrganizer && match.status === "Pendiente" && (
                        <button className="text-sm text-primary font-medium hover:underline">
                          Reportar Resultado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
