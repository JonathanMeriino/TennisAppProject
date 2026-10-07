import React from 'react';

export default function TournamentSchedule({ matches }) {
  // Validamos que existan partidos para no romper la vista
  if (!matches || matches.length === 0) {
    return (
      <div className="mt-12 w-full p-6 text-center border rounded-lg bg-card text-muted-foreground">
        Aún no hay partidos generados para mostrar en la agenda.
      </div>
    );
  }

  return (
    <div className="mt-12 w-full">
      <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2 mb-6">
        🗓️ Programación y Horarios de Partidos
      </h3>

      <div className="overflow-hidden border border-border rounded-lg shadow-sm bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-primary/5 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-4 border-b border-border">Fase</th>
                <th className="px-5 py-4 border-b border-border">Enfrentamiento</th>
                <th className="px-5 py-4 border-b border-border">Fecha</th>
                <th className="px-5 py-4 border-b border-border">Hora</th>
                <th className="px-5 py-4 border-b border-border">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matches
                .filter((m) => !(m.estado === "Finalizado" && (!m.username_j1 || !m.username_j2)))
                .map((partido) => (
                  <tr key={partido.id_partido} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-primary">
                      {partido.fase}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${!partido.username_j1 ? "text-muted-foreground italic" : "text-foreground"}`}>
                        {partido.username_j1 || "Por definir"}
                      </span>
                      <span className="mx-3 text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold">
                        VS
                      </span>
                      <span className={`font-semibold ${!partido.username_j2 ? "text-muted-foreground italic" : "text-foreground"}`}>
                        {partido.username_j2 || "Por definir"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {partido.fecha ? `📅 ${partido.fecha}` : <span className="italic opacity-60">Por asignar</span>}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {partido.hora ? `⏰ ${partido.hora}` : <span className="italic opacity-60">Por asignar</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        partido.estado === 'Finalizado' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {partido.estado || "Pendiente"}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}