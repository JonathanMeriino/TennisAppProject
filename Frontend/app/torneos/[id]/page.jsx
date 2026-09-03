"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tournaments as tournamentsApi, auth } from "@/lib/api";
import { toast } from "sonner";
const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSiembraModalOpen, setIsSiembraModalOpen] = useState(false);
  const [availability, setAvailability] = useState({});
  const [siembraValues, setSiembraValues] = useState({});
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
      tournamentsApi.get(id),
      tournamentsApi.participants ? tournamentsApi.participants(id).catch(() => []) : Promise.resolve([]),
      tournamentsApi.getPartidos(id).catch(() => []),
      auth.me().catch(() => null)
    ])
      .then(([tournamentData, participantsData, matchesData, userData]) => {
        setTournament(tournamentData);
        setParticipants(Array.isArray(participantsData) ? participantsData : participantsData.results || []);
        setMatches(Array.isArray(matchesData) ? matchesData : matchesData.results || []);
        setCurrentUser(userData);
      })
      .catch(() => setError("Error al cargar la información del torneo."))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Verificar si el usuario ya esta inscrito
  const usuarioInscrito = participants.some((p) => {
    const username = p.nombre_jugador || p.jugador_username || p.username;
    return currentUser && username === currentUser.username;
  });

  const handleCheckboxChange = (day, slot) => {
    setAvailability((prev) => {
      const currentDaySlots = prev[day] || [];
      if (currentDaySlots.includes(slot)) {
        return { ...prev, [day]: currentDaySlots.filter((s) => s !== slot) };
      } else {
        return { ...prev, [day]: [...currentDaySlots, slot] };
      }
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(availability).length === 0) {
      toast.warning("Debes seleccionar al menos un horario de disponibilidad antes de inscribirte.");
      return;
    }

    setIsRegistering(true);
    const loadingToast = toast.loading("Inscribiendo al torneo...");

    try {
      await tournamentsApi.join(id, availability);
      toast.dismiss(loadingToast);
      toast.success("¡Inscripción exitosa! Se ha registrado tu disponibilidad.");
      setIsModalOpen(false);
      // REcargar datis dek usuario para refrescar estados si es necesario
      const updatedParticipants = await tournamentsApi.participants(id).catch(() => []);
      setParticipants(Array.isArray(updatedParticipants) ? updatedParticipants : updatedParticipants.results || []);

    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMessage = err.message || "Error al inscribirse en el torneo.";
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleLeaveTournament = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar tu inscripción en este torneo?")) {
      return;
    }
    
    setIsLeaving(true);
    const loadingToast = toast.loading("Procesando baja del torneo...");

    try {
      await tournamentsApi.leave(id);
      toast.dismiss(loadingToast);
      toast.success("Te has dado de baja del torneo correctamente.");

      // Actualizar participantes
      const updatedParticipants = await tournamentsApi.participants(id).catch(() => []);
      setParticipants(Array.isArray(updatedParticipants) ? updatedParticipants : updatedParticipants.results || []);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Hubo un error al intentar darte de baja.");
    } finally {
      setIsLeaving(false);
    }
  };
  
  
  const handleSiembraChange = (inscripcionId, value) => {
    setSiembraValues((prev) => ({ ...prev, [inscripcionId]: value }));
  };

  const handleSaveSiembras = async () => {
    const loadingToast = toast.loading("Actualizando números de siembra...");
    try {
      const promises = Object.entries(siembraValues).map(([inscId, siembra]) =>
        tournamentsApi.updateSiembra(inscId, siembra)
      );
      await Promise.all(promises);
      toast.dismiss(loadingToast);
      toast.success("¡Números de siembra actualizados correctamente!");
      setIsSiembraModalOpen(false);

      const updatedParticipants = await tournamentsApi.participants(id).catch(() => []);
      setParticipants(Array.isArray(updatedParticipants) ? updatedParticipants : updatedParticipants.results || []);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Error al guardar las siembras.");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Cargando detalles del torneo...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl relative">
      {/* Tarjeta de Información General */}
      <div className="card-base p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
              Eliminación Directa
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-2">
              {tournament?.nombre_torneo}
            </h1>
          </div>
          
          {/* Botón dinámico: Inscribirse o Darse de baja */}
          {usuarioInscrito ? (
            <button
              onClick={handleLeaveTournament}
              disabled={isLeaving}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 font-medium px-6 py-2 rounded-lg transition-colors whitespace-nowrap text-sm"
            >
              {isLeaving ? "Procesando baja..." : "Darse de baja del torneo"}
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-6 py-2 whitespace-nowrap"
            >
              Inscribirme al Torneo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <div>
            <p className="text-xs font-semibold text-foreground">Inicio</p>
            <p>{tournament?.fecha_inicio}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Finalización</p>
            <p>{tournament?.fecha_fin || "Por definir"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Rama</p>
            <p>{tournament?.rama_torneo}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Estado</p>
            <p>{tournament?.estado_torneo}</p>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Jugadores y Llaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de Jugadores Inscritos */}
        <div className="card-base p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Jugadores Inscritos</h3>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aún no hay jugadores inscritos en este torneo.
            </p>
          ) : (
            <ul className="space-y-2">
              {participants.map((participant, index) => (
                <li
                  key={participant.id_inscripcion || index}
                  className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {participant.nombre_jugador || participant.jugador_username || participant.username || `Participante ${index + 1}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Siembra: {participant.numero_siembra ? `#${participant.numero_siembra}` : "Por asignar"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bracket / Llaves y Botón de Administración */}
        <div className="card-base p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Bracket / Llaves</h3>
            <p className="text-sm text-muted-foreground">
              Asigna los números de siembra a los jugadores para configurar las llaves de eliminación directa.
            </p>
            
            {participants.length > 0 && (
              <div className="space-y-2 mt-2">
               {/* Botón para abrir el modal de siembras */}
                <button
                  onClick={() => setIsSiembraModalOpen(true)}
                  className="btn-primary text-xs py-2 px-4 w-full text-center"
                >
                  Ingresar números de siembra
                </button>

                {/* Botón para disparar el algoritmo en Django */}
                <button
                  onClick={async () => {
                    const loadingToast = toast.loading("Generando cuadro de eliminación directa...");
                    try {
                      await tournamentsApi.generateBrackets(id);
                      toast.dismiss(loadingToast);
                      toast.success("¡Llaves de enfrentamientos generadas con éxito!");
                      window.location.reload(); 
                    } catch (err) {
                      toast.dismiss(loadingToast);
                      const errorMsg = err.error || err.detail || "Error al generar las llaves.";
                      toast.error(errorMsg);
                    }
                  }}
                    className="btn-outline text-xs py-2 px-4 w-full text-center"
                  >
                    Generar llaves de enfrentamientos
                </button>

                
              </div>
            )}
          </div>

          <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm mt-4">
            Diagrama de llaves pendiente de generación.
          </div>
        </div>
      </div>

      {/* MODAL DE DISPONIBILIDAD PARA INSCRIPCIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="card-base bg-card p-6 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-bold text-foreground">Selecciona tu Disponibilidad</h3>
              <p className="text-sm text-muted-foreground">
                Marca los días y horarios en los que puedes jugar tus partidos (bloques de 2 horas).
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-2 font-semibold text-foreground">Horario</th>
                      {DAYS.map((day) => (
                        <th key={day} className="p-2 font-semibold text-foreground text-center">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot} className="border-b border-border/50">
                        <td className="p-2 font-medium text-foreground whitespace-nowrap">{slot}</td>
                        {DAYS.map((day) => {
                          const isChecked = availability[day]?.includes(slot) || false;
                          return (
                            <td key={day} className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(day, slot)}
                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline flex-1 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="btn-primary flex-1 text-center"
                >
                  {isRegistering ? "Inscribiendo..." : "Confirmar Inscripción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA ASIGNAR NÚMEROS DE SIEMBRA */}
      {isSiembraModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="card-base bg-card p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Ingresar números de siembra</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Actualiza el número de siembra para cada participante de este torneo:
              </p>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {participants.map((p) => (
                <div key={p.id_inscripcion} className="flex items-center justify-between gap-4 p-2.5 border border-border rounded-lg bg-card/50">
                  <span className="text-sm font-medium text-foreground">
                    {p.nombre_jugador || p.jugador_username || p.username || "Participante"}
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 1"
                    defaultValue={p.numero_siembra || ""}
                    onChange={(e) => handleSiembraChange(p.id_inscripcion, e.target.value)}
                    className="input-field w-20 text-center py-1 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSiembraModalOpen(false)}
                className="btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSiembras}
                className="btn-primary flex-1"
              >
                Guardar Siembras
              </button>
            </div>
          </div>
        </div>

        
      )}
      {/* Sección Visual del Bracket en la página del torneo */}
      <div className="card-base p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Bracket / Árbol del Torneo</h3>
        
        {matches.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
            Diagrama de llaves pendiente de generación.
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-8 py-4">
            {/* Agrupamos los partidos por fases ordenadas */}
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
                        <div className={`flex justify-between items-center p-1.5 rounded ${partido.jugador1 ? 'bg-background' : 'text-muted-foreground italic'}`}>
                          <span className="font-medium text-foreground">
                            {partido.username_j1 || "Bye / Por definir"}
                          </span>
                          {partido.jugador1?.numero_siembra && (
                            <span className="text-[10px] text-muted-foreground">#{partido.jugador1.numero_siembra}</span>
                          )}
                        </div>

                        <div className="border-t border-border/50"></div>

                        {/* Jugador 2 */}
                        <div className={`flex justify-between items-center p-1.5 rounded ${partido.jugador2 ? 'bg-background' : 'text-muted-foreground italic'}`}>
                          <span className="font-medium text-foreground">
                            {partido.username_j2 || "Bye / Por definir"}
                          </span>
                          {partido.jugador2?.numero_siembra && (
                            <span className="text-[10px] text-muted-foreground">#{partido.jugador2.numero_siembra}</span>
                          )}
                        </div>

                        {/* Estaodo y boton de registro de resultado */}
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
      </div>
      {/* MODAL PARA REGISTRAR RESULTADO DE PARTIDO */}
      {isResultModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="card-base bg-card p-6 max-w-sm w-full space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Registrar Marcador</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ingresa los sets ganados por cada competidor</p>
            </div>
            
            <div className="space-y-3 text-sm">
              {/* Sets Jugador 1 */}
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

              {/* Sets Jugador 2 */}
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
                  
                  const winnerId = parseInt(sets1) > parseInt(sets2) 
                    ? selectedMatch.jugador1 
                    : selectedMatch.jugador2;

                  const loadingToast = toast.loading("Guardando resultado...");
                  try {
                    await tournamentsApi.createResult(
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
                    toast.error("Error al registrar el resultado.");
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