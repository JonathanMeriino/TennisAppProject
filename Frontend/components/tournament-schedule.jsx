import React, { useState, useEffect } from 'react';

export default function TournamentGridSchedule({ matches }) {
  // 1. Estado para rastrear la fecha base de la semana actual que estamos viendo
  const [fechaBase, setFechaBase] = useState(new Date());

  // Al cargar el componente, si hay partidos, centramos el calendario en la fecha del primer partido
  useEffect(() => {
    if (matches && matches.length > 0) {
      // Buscamos el primer partido que tenga fecha asignada
      const primerPartido = matches.find(m => m.fecha);
      if (primerPartido) {
        // Añadimos T12:00:00 para evitar desfasajes por zonas horarias al crear el objeto Date
        setFechaBase(new Date(`${primerPartido.fecha}T12:00:00`));
      }
    }
  }, [matches]);

  // 2. Lógica para obtener el Lunes de la semana actual
  const obtenerLunes = (fecha) => {
    const d = new Date(fecha);
    const dia = d.getDay();
    const diferencia = d.getDate() - dia + (dia === 0 ? -6 : 1); // Ajuste si es domingo
    return new Date(d.setDate(diferencia));
  };

  const lunesDeLaSemana = obtenerLunes(fechaBase);

  // 3. Generar el arreglo con los 7 días (objetos Date) de la semana actual
  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(lunesDeLaSemana);
    d.setDate(lunesDeLaSemana.getDate() + i);
    return d;
  });

  // 4. Funciones de navegación
  const semanaAnterior = () => {
    const nuevaFecha = new Date(fechaBase);
    nuevaFecha.setDate(fechaBase.getDate() - 7);
    setFechaBase(nuevaFecha);
  };

  const semanaSiguiente = () => {
    const nuevaFecha = new Date(fechaBase);
    nuevaFecha.setDate(fechaBase.getDate() + 7);
    setFechaBase(nuevaFecha);
  };

  const irAHoy = () => setFechaBase(new Date());

  // Formateador para comparar con la base de datos (YYYY-MM-DD)
  const formatearFechaBD = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const bloquesHorarios = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00"
  ];

  const nombresDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Para mostrar el mes y año en el título
  const mesActual = lunesDeLaSemana.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 bg-card rounded-xl border border-border shadow-sm overflow-x-auto w-full">
      <div className="min-w-[900px]">
        
        {/* Cabecera y Controles de Navegación */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              Calendario semanal de partidos
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs capitalize">
                {mesActual}
              </span>
            </h3>
          </div>

          {/* Controles de Semana */}
          <div className="flex items-center gap-2">
            <button 
              onClick={semanaAnterior}
              className="p-1.5 rounded-md border border-border hover:bg-secondary text-foreground transition"
              title="Semana Anterior"
            >
              ◀
            </button>
            <button 
              onClick={irAHoy}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-secondary text-foreground transition"
            >
              Hoy
            </button>
            <button 
              onClick={semanaSiguiente}
              className="p-1.5 rounded-md border border-border hover:bg-secondary text-foreground transition"
              title="Semana Siguiente"
            >
              ▶
            </button>
          </div>
        </div>
        
        {/* Tabla de Matriz Horaria */}
        <table className="w-full border-collapse border border-border text-xs">
          <thead>
            <tr className="bg-primary/10 text-primary">
              <th className="border border-border p-3 w-32 text-center font-bold">Horario</th>
              {diasDeLaSemana.map((fechaDia, index) => (
                <th key={index} className="border border-border p-2 text-center">
                  <div className="font-bold uppercase tracking-wider">{nombresDias[index]}</div>
                  <div className="text-[10px] font-medium text-foreground bg-background/50 rounded inline-block px-1 mt-1">
                    {fechaDia.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloquesHorarios.map((bloque) => {
              const horaInicioBloque = bloque.split(' - ')[0];

              return (
                <tr key={bloque} className="transition-colors">
                  <td className="border border-border p-3 text-center font-mono font-bold text-muted-foreground bg-secondary/30 whitespace-nowrap">
                    {bloque} hrs
                  </td>

                  {diasDeLaSemana.map((fechaDia, index) => {
                    const fechaStr = formatearFechaBD(fechaDia);
                    
                    // Filtrado exacto: Coincide la fecha exacta (YYYY-MM-DD) y el bloque horario
                    const partidosEnBloque = matches.filter((m) => {
                      const horaPartido = m.hora ? m.hora.slice(0, 5) : "";
                      return m.fecha === fechaStr && horaPartido === horaInicioBloque;
                    });

                    return (
                      <td key={index} className="border border-border p-2 align-top h-32 w-36 bg-card">
                        {partidosEnBloque.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground/30 italic select-none">
                            Libre
                          </div>
                        ) : (
                          <div className="space-y-2 flex flex-col h-full justify-start overflow-y-auto max-h-32">
                            {partidosEnBloque.map((partido) => (
                              <div 
                                key={partido.id || partido.id_partido}
                                className="bg-background border border-border/70 rounded-md p-2 shadow-xs text-[11px] space-y-1 hover:border-primary/50 transition-all"
                              >
                                <div className="font-bold text-primary truncate text-[10px] uppercase tracking-wide">
                                  {partido.fase}
                                </div>
                                <div className="text-foreground font-medium truncate leading-tight">
                                  <div>
                                    {partido.siembra_j1 && <span className="text-primary font-bold mr-1">[{partido.siembra_j1}]</span>}
                                    {partido.username_j1 || "Por definir"}
                                  </div>
                                  <div className="text-[9px] text-muted-foreground font-bold my-0.5 text-center">VS</div>
                                  <div>
                                    {partido.siembra_j2 && <span className="text-primary font-bold mr-1">[{partido.siembra_j2}]</span>}
                                    {partido.username_j2 || "Por definir"}
                                  </div>
                                </div>
                                
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}