"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { tournaments as tournamentsApi , auth} from "@/lib/api";

export function UserTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Consulta los torneos y el rol del usuario en paralelo 

    Promise.all([
      tournamentsApi.list(),
      auth.me().catch(() => null), 
    ])
      .then(([tournamentsData, userData]) => {
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : tournamentsData.results || []);
        // Verificamos si el usuario es administrador
        if (userData && (userData.is_staff || userData.is_superuser)) {
          setIsAdmin(true);s
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "En Curso":
        return "bg-primary/20 text-primary";
      case "Programado":
        return "bg-accent/20 text-accent-foreground";
      case "Finalizado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="card-base text-center py-12 text-muted-foreground">
        Cargando torneos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-base text-center py-12">
        <p className="text-destructive mb-2">{error}</p>
        <p className="text-muted-foreground text-sm">
          Verifica que tu backend esté corriendo.
        </p>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="card-base text-center py-12">
        <p className="text-muted-foreground mb-4">
          No hay torneos disponibles por el momento.
        </p>
        <Link href="/crear-torneo" className="btn-primary inline-block">
          Crear tu primer torneo
        </Link>
      </div>
    );
  }

 return (
    <div className="card-base">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Torneos Disponibles</h2>
          <p className="text-muted-foreground">
            Explora los torneos activos, consulta los detalles e inscríbete
          </p>
        </div>

        {/* El botón de crear torneo solo se muestra si el usuario es administrador */}
        {isAdmin && (
          <Link href="/crear-torneo" className="btn-primary text-center whitespace-nowrap">
            + Crear Torneo
          </Link>
        )}
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">
            No hay torneos disponibles por el momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => {
            const tournamentId = tournament.id_torneo || tournament.id;
            return (
              <div
                key={tournamentId}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-foreground text-base">
                        {tournament.nombre_torneo}
                      </h3>
                    </div>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(
                        tournament.estado_torneo
                      )}`}
                    >
                      {tournament.estado_torneo}
                    </span>
                  </div>
                  <Link
                    href={`/torneos/${tournamentId}`}
                    className="text-sm text-primary hover:text-primary/80 font-semibold"
                  >
                    Ver detalles e Inscribirse →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Inicio: {tournament.fecha_inicio}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏆</span>
                    <span>Rama: {tournament.rama_torneo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Fin: {tournament.fecha_fin || "Por definir"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
