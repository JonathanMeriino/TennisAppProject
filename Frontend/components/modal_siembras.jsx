import React from "react";

export default function ModalSiembras({
  isSiembraModalOpen,
  setIsSiembraModalOpen,
  participants,
  handleSiembraChange,
  handleSaveSiembras
}) {
  if (!isSiembraModalOpen) return null;

  return (
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
            <div 
              key={p.id_inscripcion} 
              className="flex items-center justify-between gap-4 p-2.5 border border-border rounded-lg bg-card/50"
            >
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
  );
}