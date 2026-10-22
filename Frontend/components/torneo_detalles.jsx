


import React from "react";

export default function TorneoDetalles({
  tournament,
  isAdmin,
  usuarioInscrito,
  isLeaving,
  handleLeaveTournament,
  handleOpenInscribeModal,
  handleOpenEdit,
  handleEliminarTorneo
}) {
  if (!tournament) return null;

  return (
    <div className="card-base p-6 mb-6 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
            Eliminación Directa
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-2">{tournament.nombre_torneo}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1.5 rounded-full">
            {tournament.estado_torneo === 'En Curso' ? 'Inscripciones cerradas (Torneo En Curso)' : tournament.estado_torneo}
          </span>
          
          {/* Botón dinámico: Inscribirse o Darse de baja */}
          {tournament?.estado_torneo === 'Programado' ? (
            usuarioInscrito ? (
              <button
                onClick={handleLeaveTournament}
                disabled={isLeaving}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-md transition-colors font-medium border border-red-200"
              >
                {isLeaving ? "Procesando baja..." : "Darse de baja del torneo"}
              </button>
            ) : (
              <button
                onClick={handleOpenInscribeModal}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-md transition-colors font-medium border border-blue-200"
              >
                Inscribirme al Torneo
              </button>
            )
          ) : (
            <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full font-medium">
              No puedes modificar tu inscripción (Torneo {tournament?.estado_torneo || "en proceso"})
            </span>
          )}

          {/* Botón de Editar Torneo (Solo Admin) */}
          {isAdmin && (
            <button
              onClick={handleOpenEdit}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-md transition-colors font-medium border border-blue-200"
            >
              Editar Parámetros
            </button>
          )}

          {/* Botón de Eliminar Torneo (Visible solo para administradores) */}
          {isAdmin && (
            <button
              onClick={handleEliminarTorneo}
              className="text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-md transition-colors font-medium border border-red-200"
              title="Eliminar Torneo"
            >
              Eliminar Torneo
            </button>
          )}
        </div>
      </div>

      {/* Fila inferior con los datos (Inicio, Categoría, Rama, Estado) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Inicio</p>
          <p className="font-medium text-foreground">{tournament.fecha_inicio}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Categoría</p>
          <p className="font-medium text-foreground">{tournament.nombre_categoria || "Por definir"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Rama</p>
          <p className="font-medium text-foreground">{tournament.rama_torneo}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Estado</p>
          <p className="font-medium text-foreground">{tournament.estado_torneo}</p>
        </div>
      </div>
    </div>
  );
}