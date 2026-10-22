"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { tournaments as tournamentsApi } from "@/lib/api";

export function MyInscribedTournaments() {
  const [inscribedTournaments, setInscribedTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tournamentsApi
      .myTournaments()
      .then((data) => setInscribedTournaments(Array.isArray(data) ? data : data.results || []))
      .catch((err) => console.error("Error al cargar torneos inscritos:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Si está cargando o el usuario no está inscrito en ningún torneo, no mostramos el bloque
  if (isLoading || inscribedTournaments.length === 0) {
    return null; 
  }

  return (
    <div className="card-base border-primary/30 bg-primary/5">
      <h2 className="text-xl font-bold text-foreground mb-1">Mis Torneos Inscritos</h2>
      <p className="text-muted-foreground mb-6">
        Torneos en los que participas actualmente
      </p>

      <div className="space-y-4">
        {inscribedTournaments.map((tournament) => {
          const tournamentId = tournament.id_torneo || tournament.id;
          return (
            <div
              key={tournamentId}
              className="border border-border bg-card rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-base">
                    {tournament.nombre_torneo}
                  </h3>
                  <span className="inline-block text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-medium mt-2">
                    Inscrito / {tournament.estado_torneo}
                  </span>
                </div>
                <Link
                  href={`/torneos/${tournamentId}`}
                  className="text-sm text-primary hover:text-primary/80 font-semibold whitespace-nowrap"
                >
                  Ver detalles →
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
    </div>
  );
}