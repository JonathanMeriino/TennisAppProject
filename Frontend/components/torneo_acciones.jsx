import React from "react";

export default function TorneoAcciones({
  isAdmin,
  participantsLength,
  setIsSiembraModalOpen,
  handleGenerateBracket,
  handleResetearTorneo
}) {
  // Si no es administrador, no renderizamos nada
  if (!isAdmin) return null;

  return (
    <div className="card-base p-6 space-y-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-foreground">Botones de administrador</h3>
        <p className="text-sm text-muted-foreground">
          Asigna los números de siembra a los jugadores para configurar las llaves de eliminación directa.
        </p>
        
        {/* Solo se muestran los botones de acción si hay jugadores inscritos */}
        {participantsLength > 0 && (
          <div className="space-y-2 mt-2">
            <button
              onClick={() => setIsSiembraModalOpen(true)}
              className="btn-primary text-xs py-2 px-4 w-full text-center"
            >
              Ingresar números de siembra
            </button>

            <button
              onClick={handleGenerateBracket}
              className="btn-outline text-xs py-2 px-4 w-full text-center"
            >
              Generar llaves de enfrentamientos
            </button>
            
            <button
              onClick={handleResetearTorneo}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Resetear Torneo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}