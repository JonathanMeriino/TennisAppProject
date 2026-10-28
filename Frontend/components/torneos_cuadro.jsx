"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { auth } from "@/lib/api";
import TournamentSchedule from '@/components/torneos_calendario';
import ModalResultados from '@/components/modal_resultados'; // Asegúrate de apuntar a la ruta correcta

export default function TournamentResults({ matches, tournamentId }) {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const fasesDisponibles = Array.from(new Set(matches.map(m => m.fase)));
  const ordenFases = {
    "Ronda de 64": 1,
    "Ronda de 32": 2,
    "Ronda de 16": 3,
    "Cuartos de Final": 4,
    "Semifinal": 5,
    "Final": 6
  };
  useEffect(() => {
    auth.me()
      .then((data) => setCurrentUser(data.username))
      .catch(() => console.log("Usuario no autenticado"));
  }, []);
  const fasesOrdenadas = fasesDisponibles.sort((a, b) => (ordenFases[a] || 0) - (ordenFases[b] || 0));
  const partidoFinal = matches.find((m) => m.fase?.toLowerCase() === "final");
  let nombreCampeon = null;

  if (partidoFinal) {
    const winnerId =
      typeof partidoFinal.ganador === "object"
        ? partidoFinal.ganador?.id_inscripcion || partidoFinal.ganador?.id
        : partidoFinal.ganador || partidoFinal.resultado?.ganador;

    const j1Id =
      typeof partidoFinal.jugador1 === "object"
        ? partidoFinal.jugador1?.id_inscripcion || partidoFinal.jugador1?.id
        : partidoFinal.jugador1;

    const j2Id =
      typeof partidoFinal.jugador2 === "object"
        ? partidoFinal.jugador2?.id_inscripcion || partidoFinal.jugador2?.id
        : partidoFinal.jugador2;

    if (winnerId && winnerId === j1Id) {
      nombreCampeon = partidoFinal.username_j1;
    } else if (winnerId && winnerId === j2Id) {
      nombreCampeon = partidoFinal.username_j2;
    } else if (partidoFinal.estado === "Finalizado") {
      nombreCampeon = partidoFinal.username_j1; 
    }
  }

  return (
    <div className="card-base p-6 space-y-4">
      {/* SECCIÓN/BANNER DEL CAMPEÓN */}
      {nombreCampeon && (
        <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-yellow-500/10 border border-yellow-500/40 rounded-xl p-6 text-center space-y-2 shadow-md">
          <span className="text-4xl block">🏆</span>
          <h2 className="text-xl font-extrabold text-foreground tracking-wide uppercase">
            ¡CAMPEÓN DEL TORNEO!
          </h2>
          <p className="text-2xl font-bold text-primary">
            {nombreCampeon}
          </p>
          <p className="text-xs text-muted-foreground">
            ¡Felicidades por obtener la victoria en la gran final!
          </p>
        </div>
      )}

      {/* SECCIÓN DEL BRACKET / ÁRBOL DEL TORNEO */}
      <h3 className="text-lg font-bold text-foreground">Cuadro del Torneo</h3>

      {matches.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
          Diagrama de llaves pendiente de generación.
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-8 py-4">
          {fasesOrdenadas.map((fase) => {
            const partidosFase = matches.filter((m) => m.fase === fase);
            if (partidosFase.length === 0) return null;

            return (
              <div key={fase} className="flex flex-col justify-around min-w-[220px] space-y-4">
                <h4 className="text-xs font-bold text-center text-primary uppercase tracking-wider bg-primary/10 py-1.5 rounded">
                  {fase}
                </h4>

                <div className="space-y-4 flex flex-col justify-around h-full">
                  {partidosFase.map((partido) => (
                    <div 
                      key={partido.id || partido.id_partido} 
                      className="border border-border rounded-lg p-3 bg-card shadow-sm space-y-2 text-xs min-h-[135px] flex flex-col justify-between"
                    >
                      {/* Jugador 1 */}
                      <div className={`p-1.5 rounded flex items-center justify-between ${partido.username_j1 ? (currentUser === partido.username_j1 ? 'bg-primary/10 border border-primary/30' : 'bg-background') : 'text-muted-foreground italic'}`}>
                        <span className={`flex items-center ${currentUser === partido.username_j1 ? 'font-extrabold text-primary' : 'font-medium text-foreground'}`}>
                          {partido.username_j1 ? (
                            <>
                              {partido.siembra_j1 && (
                                <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-2">
                                  [{partido.siembra_j1}]
                                </span>
                              )}
                              {partido.username_j1} {currentUser === partido.username_j1 && "(Tú)"}
                            </>
                          ) : (
                            "Bye / Por definir"
                          )}
                        </span>

                        {/* MARCADOR JUGADOR 1 */}
                        {(partido.estado_partido === 'Finalizado' || partido.estado === 'Finalizado') && (
                        <span className="font-bold text-foreground ml-2 flex gap-1.5">
                          {partido.resultado ? (
                            <>
                              <span>{partido.resultado.set1_jugador1}</span>
                              <span>{partido.resultado.set2_jugador1}</span>
                              {(partido.resultado.set3_jugador1 > 0 || partido.resultado.set3_jugador2 > 0) && (
                                <span>{partido.resultado.set3_jugador1}</span>
                              )}
                            </>
                          ) : '-'}
                        </span>
                      )}
                      </div>

                      <div className="border-t border-border/50"></div>

                      {/* Participante 2 */}
                      <div className={`p-1.5 rounded flex items-center justify-between ${partido.username_j2 ? (currentUser === partido.username_j2 ? 'bg-primary/10 border border-primary/30' : 'bg-background') : 'text-muted-foreground italic'}`}>
                        <span className={`flex items-center ${currentUser === partido.username_j2 ? 'font-extrabold text-primary' : 'font-medium text-foreground'}`}>
                          {partido.username_j2 ? (
                            <>
                              {partido.siembra_j2 && (
                                <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-2">
                                  [{partido.siembra_j2}]
                                </span>
                              )}
                              {partido.username_j2} {currentUser === partido.username_j2 && "(Tú)"}
                            </>
                          ) : (
                            "Bye / Por definir"
                          )}
                        </span>

                        {/* MARCADOR JUGADOR 2 */}
                        {(partido.estado_partido === 'Finalizado' || partido.estado === 'Finalizado') && (
                        <span className="font-bold text-foreground ml-2 flex gap-1.5">
                          {partido.resultado ? (
                            <>
                              <span>{partido.resultado.set1_jugador2}</span>
                              <span>{partido.resultado.set2_jugador2}</span>
                              {(partido.resultado.set3_jugador1 > 0 || partido.resultado.set3_jugador2 > 0) && (
                                <span>{partido.resultado.set3_jugador2}</span>
                              )}
                            </>
                          ) : '-'}
                        </span>
                      )}
                      </div>

                      {/* Estado y Botón de Registro */}
                      <div className="pt-2 border-t border-border/50 flex justify-between items-center mt-auto">
                        <span className="text-[10px] text-muted-foreground">
                          Estado: <span className="text-foreground">{partido.estado || "Pendiente"}</span>
                        </span>

                        {partido.estado !== "Finalizado" && partido.username_j1 && partido.username_j2 && (
                          <button
                            onClick={() => {
                              setSelectedMatch(partido);
                              setIsResultModalOpen(true);
                            }}
                            className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors font-medium"
                          >
                            Registrar Resultado
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPONENTE MODAL AISLADO */}
      <ModalResultados 
        isOpen={isResultModalOpen} 
        onClose={() => setIsResultModalOpen(false)} 
        selectedMatch={selectedMatch} 
      />
      
      <TournamentSchedule matches={matches} />
    </div>
  );
}