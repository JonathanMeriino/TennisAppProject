"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { tournaments } from "@/lib/api"; // Ajusta tu ruta de importación si es necesaria

export default function TournamentResults({ matches, tournamentId }) {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <div className="card-base p-6 space-y-4">
      <h3 className="text-lg font-bold text-foreground">Bracket / Árbol del Torneo</h3>
      
      {matches.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
          Diagrama de llaves pendiente de generación.
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-8 py-4">
          {["Ronda de 16", "Cuartos de Final", "Semifinal", "Final"].map((fase) => {
            const partidosFase = matches.filter((m) => m.fase === fase);
            if (partidosFase.length === 0) return null;

            return (
              <div key={fase} className="flex flex-col justify-around min-w-[220px] space-y-4">
                <h4 className="text-xs font-bold text-center text-primary uppercase tracking-wider bg-primary/10 py-1.5 rounded">
                  {fase}
                </h4>
                
                <div className="space-y-4 flex flex-col justify-around h-full">
                  {partidosFase.map((partido) => (
                    <div key={partido.id || partido.id_partido} className="border border-border rounded-lg p-3 bg-card shadow-sm space-y-2 text-xs">
                      {/* Jugador 1 */}
                      <div className={`flex justify-between items-center p-1.5 rounded ${partido.username_j1 ? 'bg-background' : 'text-muted-foreground italic'}`}>
                        <span className="font-medium text-foreground">
                          {partido.username_j1 || "Bye / Por definir"}
                        </span>
                      </div>

                      <div className="border-t border-border/50"></div>

                      {/* Jugador 2 */}
                      <div className={`flex justify-between items-center p-1.5 rounded ${partido.username_j2 ? 'bg-background' : 'text-muted-foreground italic'}`}>
                        <span className="font-medium text-foreground">
                          {partido.username_j2 || "Bye / Por definir"}
                        </span>
                      </div>

                      {/* Estado y Botón de Registro */}
                      <div className="pt-2 border-t border-border/50 flex justify-between items-center">
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

      {/* MODAL PARA REGISTRAR RESULTADO */}
      {isResultModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="card-base bg-card p-6 max-w-sm w-full space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Registrar Marcador</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ingresa los sets ganados por cada competidor</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground truncate max-w-[160px]">
                  {selectedMatch.username_j1}
                </span>
                <input
                  type="number"
                  min="0"
                  id="setsJ1"
                  className="input-field w-16 text-center py-1 text-sm"
                  defaultValue="0"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground truncate max-w-[160px]">
                  {selectedMatch.username_j2}
                </span>
                <input
                  type="number"
                  min="0"
                  id="setsJ2"
                  className="input-field w-16 text-center py-1 text-sm"
                  defaultValue="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="btn-outline flex-1 text-xs py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const sets1 = document.getElementById("setsJ1").value;
                  const sets2 = document.getElementById("setsJ2").value;
                  
                  const j1Id = typeof selectedMatch.jugador1 === 'object' ? selectedMatch.jugador1?.id_inscripcion || selectedMatch.jugador1?.id : selectedMatch.jugador1;
                  const j2Id = typeof selectedMatch.jugador2 === 'object' ? selectedMatch.jugador2?.id_inscripcion || selectedMatch.jugador2?.id : selectedMatch.jugador2;

                  const winnerId = parseInt(sets1) > parseInt(sets2) ? j1Id : j2Id;

                  const loadingToast = toast.loading("Guardando resultado...");
                  try {
                    await tournaments.createResult(
                      selectedMatch.id || selectedMatch.id_partido, 
                      sets1, 
                      sets2, 
                      winnerId
                    );
                    toast.dismiss(loadingToast);
                    toast.success("¡Resultado registrado y ganador avanzado!");
                    setIsResultModalOpen(false);
                    window.location.reload();
                  } catch (err) {
                    toast.dismiss(loadingToast);
                    const errorMsg = err.error || err.detail || JSON.stringify(err) || "Error al registrar el resultado.";
                    toast.error(errorMsg);
                  }
                }}
                className="btn-primary flex-1 text-xs py-2"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
