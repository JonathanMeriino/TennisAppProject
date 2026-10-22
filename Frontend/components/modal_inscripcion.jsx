import React from "react";

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function ModalInscripcion({
  isModalOpen,
  setIsModalOpen,
  availability,
  handleCheckboxChange,
  handleRegisterSubmit,
  isRegistering
}) {
  if (!isModalOpen) return null;

  return (
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
  );
}