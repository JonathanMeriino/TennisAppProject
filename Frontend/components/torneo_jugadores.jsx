import React from "react";

export default function TorneoJugadores({
  participants,
  isAdmin,
  handleEliminarJugador
}) {
  return (
    <div className="card-base p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-foreground">Jugadores Inscritos</h3>
        <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
          {participants.length}
        </span>
      </div>
      
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
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {participant.nombre_jugador || participant.jugador_username || participant.username || `Participante ${index + 1}`}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Siembra: {participant.numero_siembra ? `#${participant.numero_siembra}` : "Por asignar"}
                </span>
              </div>

              {/* Botón de eliminación protegido por rol */}
              {isAdmin && (
                <button
                  onClick={() => handleEliminarJugador(participant.id_inscripcion)}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-md transition-colors font-medium border border-red-100 ml-4"
                >
                  Eliminar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}