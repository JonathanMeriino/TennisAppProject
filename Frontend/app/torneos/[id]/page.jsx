"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { TournamentDetails } from "@/components/tournament-details";
import { TournamentGroups } from "@/components/tournament-groups";
import { TournamentSchedule } from "@/components/tournament-schedule";
import { TournamentResults } from "@/components/tournament-results";
import { tournaments as tournamentsApi } from "@/lib/api";

export default function TournamentPage() {
  const params = useParams();
  const tournamentId = params.id;
  const [activeTab, setActiveTab] = useState("groups");
  const [updatedResult, setUpdatedResult] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tournamentId) return;
    tournamentsApi
      .get(tournamentId)
      .then((data) => setTournament(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  const handleResultUpdated = useCallback((match) => {
    if (!match.winner) return;

    const loser =
      match.winner === match.player1 ? match.player2 : match.player1;
    const setsWinner =
      match.winner === match.player1
        ? match.setsWonPlayer1
        : match.setsWonPlayer2;
    const setsLoser =
      match.winner === match.player1
        ? match.setsWonPlayer2
        : match.setsWonPlayer1;

    setUpdatedResult({
      group: match.group,
      winner: match.winner,
      loser: loser,
      setsWinner: setsWinner,
      setsLoser: setsLoser,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Tournify</h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Volver al Panel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            Cargando torneo...
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {!isLoading && !error && tournament && (
          <>
            <TournamentDetails tournament={tournament} />

            {/* Tabs Navigation */}
            <div className="mt-8">
          <div className="flex gap-1 border-b border-border mb-6">
            <button
              type="button"
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
              type="button"
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
              type="button"
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
                {activeTab === "groups" && (
                  <TournamentGroups
                    tournamentId={tournamentId}
                    updatedResult={updatedResult}
                  />
                )}
                {activeTab === "schedule" && (
                  <TournamentSchedule
                    tournamentId={tournamentId}
                    isOrganizer={tournament.isOrganizer}
                  />
                )}
                {activeTab === "results" && (
                  <TournamentResults
                    tournamentId={tournamentId}
                    isOrganizer={tournament.isOrganizer}
                    onResultUpdated={handleResultUpdated}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
