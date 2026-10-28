"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/api'; // Importamos la API para obtener al usuario

export default function TournamentGridSchedule({ matches }) {
  const [fechaBase, setFechaBase] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actual

  // 1. Obtener al usuario autenticado al montar el componente
  useEffect(() => {
    auth.me()
      .then((data) => setCurrentUser(data.username))
      .catch(() => console.log("Usuario no autenticado en el calendario"));
  }, []);

  // 2. Centrar el calendario en el primer partido disponible
  useEffect(() => {
    if (matches && matches.length > 0) {
      const primerPartido = matches.find(m => m.fecha);
      if (primerPartido) {
        setFechaBase(new Date(`${primerPartido.fecha}T12:00:00`));
      }
    }
  }, [matches]);

  // 3. Lógica de fechas
  const obtenerLunes = (fecha) => {
    const d = new Date(fecha);
    const dia = d.getDay();
    const diferencia = d.getDate() - dia + (dia === 0 ? -6 : 1);
    return new Date(d.setDate(diferencia));
  };

  const lunesDeLaSemana = obtenerLunes(fechaBase);

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
              <th className="border p-3 w-32 text-center font-bold sticky left-0 z-20 bg-primary/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Horario
              </th>
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
                  <td className="border p-3 text-center font-mono font-bold text-muted-foreground bg-secondary/30 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {bloque} hrs
                  </td>

                  {diasDeLaSemana.map((fechaDia, index) => {
                    const fechaStr = formatearFechaBD(fechaDia);
                    
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
                          <div className="space-y-2 flex flex-col h-full justify-start overflow-y-auto max-h-32 pr-1">
                            {partidosEnBloque.map((partido) => {
                              // Verificamos si el usuario actual juega este partido
                              const esMiPartido = currentUser && (partido.username_j1 === currentUser || partido.username_j2 === currentUser);

                              return (
                                <div 
                                  key={partido.id || partido.id_partido}
                                  // Resaltamos toda la tarjeta si es el partido del usuario
                                  className={`border rounded-md p-2 shadow-xs text-[11px] space-y-1 transition-all ${
                                    esMiPartido 
                                      ? 'bg-primary/10 border-primary/50' 
                                      : 'bg-background border-border/70 hover:border-primary/50'
                                  }`}
                                >
                                  <div className="font-bold text-primary truncate text-[10px] uppercase tracking-wide">
                                    {partido.fase}
                                  </div>
                                  <div className="text-foreground font-medium truncate leading-tight">
                                    
                                    {/* Jugador 1 */}
                                    <div className={partido.username_j1 === currentUser ? "text-primary font-extrabold" : ""}>
                                      {partido.siembra_j1 && <span className="text-primary font-bold mr-1">[{partido.siembra_j1}]</span>}
                                      {partido.username_j1 || "Por definir"} 
                                      {partido.username_j1 === currentUser && " (Tú)"}
                                    </div>
                                    
                                    <div className="text-[9px] text-muted-foreground font-bold my-0.5 text-center">VS</div>
                                    
                                    {/* Jugador 2 */}
                                    <div className={partido.username_j2 === currentUser ? "text-primary font-extrabold" : ""}>
                                      {partido.siembra_j2 && <span className="text-primary font-bold mr-1">[{partido.siembra_j2}]</span>}
                                      {partido.username_j2 || "Por definir"} 
                                      {partido.username_j2 === currentUser && " (Tú)"}
                                    </div>

                                  </div>
                                </div>
                              );
                            })}
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