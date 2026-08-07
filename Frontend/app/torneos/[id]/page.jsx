"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tournaments as tournamentsApi } from "@/lib/api";

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el modal de disponibilidad
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availability, setAvailability] = useState({}); // Estructura: { Lunes: ["08:00 - 10:00"], ... }
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
      tournamentsApi.get(id),
      tournamentsApi.matches ? tournamentsApi.matches(id).catch(() => []) : Promise.resolve([])
    ])
      .then(([tournamentData, participantsData]) => {
        setTournament(tournamentData);
        setParticipants(Array.isArray(participantsData) ? participantsData : participantsData.results || []);
      })
      .catch(() => setError("Error al cargar la información del torneo."))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Manejar selección de casillas de disponibilidad
  const handleCheckboxChange = (day, slot) => {
    setAvailability((prev) => {
      const currentDaySlots = prev[day] || [];
      if (currentDaySlots.includes(slot)) {
        return {
          ...prev,
          [day]: currentDaySlots.filter((s) => s !== slot),
        };
      } else {
        return {
          ...prev,
          [day]: [...currentDaySlots, slot],
        };
      }
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setError("");
    setSuccessMessage("");

    // Validar que al menos haya seleccionado una disponibilidad
    if (Object.keys(availability).length === 0) {
      setError("Por favor selecciona al menos un horario de disponibilidad.");
      setIsRegistering(false);
      return;
    }

    try {
      // Llamamos a la API enviando la disponibilidad que mapea con el modelo
      await tournamentsApi.join(id, availability);
      
      setSuccessMessage("¡Te has inscrito exitosamente y se guardó tu disponibilidad!");
      setIsModalOpen(false);

      // Recargamos la lista de participantes inscritos
      const updatedParticipants = await tournamentsApi.matches(id).catch(() => []);
      setParticipants(Array.isArray(updatedParticipants) ? updatedParticipants : updatedParticipants.results || []);
    } catch (err) {
      setError(err.message || "Hubo un error al intentar inscribirte (es posible que ya estés inscrito).");
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Cargando detalles del torneo...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl relative">
      {/* Información General del Torneo */}
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
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-6 py-2 whitespace-nowrap"
          >
            Inscribirme al Torneo
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-primary/10 text-primary text-sm p-3 rounded-lg border border-primary/20">
            ✅ {successMessage}
          </div>
        )}

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

      {/* Lista de Jugadores y Llaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Jugadores Inscritos</h3>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aún no hay jugadores inscritos. ¡Sé el primero en unirte!
            </p>
          ) : (
            <ul className="space-y-2">
              {participants.map((participant, index) => (
                <li key={index} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50 text-sm">
                  <span className="font-medium text-foreground">
                    {participant.nombre_jugador || participant.user || `Participante ${index + 1}`}
                  </span>
                  <span className="text-xs text-muted-foreground">Confirmado</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-base p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Bracket / Llaves</h3>
          <p className="text-sm text-muted-foreground">
            Los enfrentamientos de eliminación directa se generarán automáticamente una vez que cierren las inscripciones.
          </p>
          <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
            Diagrama de llaves pendiente de generación.
          </div>
        </div>
      </div>

      {/* MODAL DE DISPONIBILIDAD */}
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
                                onChange={() => handleCheckboxChange(day, slot)} // O tu función correspondiente
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
    </div>
  );
}
