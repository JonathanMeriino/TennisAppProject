"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tournaments as tournamentsApi, auth } from "@/lib/api";
import TournamentResults from "@/components/torneos_cuadro";
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
  
  // Determinar si el usuario actual es administrador (según tu estructura de roles/superuser)
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados para la edición (agrégalos junto con tus otros useState)
const [isEditing, setIsEditing] = useState(false);
const [editForm, setEditForm] = useState({
  nombre_torneo: '',
  rama_torneo: '',
  fecha_inicio: '',
  categoria: '',
  canchas_disponibles: 2
});
const [categories, setCategories] = useState([]);

useEffect(() => {
  const fetchCategories = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/categoria/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Categorías obtenidas de la API:", data); // Para verificar en la consola
        setCategories(data);
      } else {
        console.error("Error al obtener categorías:", response.status);
      }
    } catch (error) {
      console.error("Error de red al obtener categorías:", error);
    }
  };

  fetchCategories();
}, []);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      tournamentsApi.get(id),
      tournamentsApi.participants ? tournamentsApi.participants(id).catch(() => []) : Promise.resolve([]),
      tournamentsApi.getPartidos ? tournamentsApi.getPartidos(id).catch(() => []) : Promise.resolve([]),
      auth.me ? auth.me().catch(() => null) : Promise.resolve(null)
    ])
      .then(([tournamentData, participantsData, matchesData, userData]) => {
        setTournament(tournamentData);
        setParticipants(Array.isArray(participantsData) ? participantsData : participantsData.results || []);
        const rawMatches = Array.isArray(matchesData) ? matchesData : matchesData.results || [];
        const sortedMatches = rawMatches.sort((a, b) => a.id_partido - b.id_partido);
        setMatches(sortedMatches);
        //setMatches(Array.isArray(matchesData) ? matchesData : matchesData.results || []);
        setCurrentUser(userData);
        console.log("Datos de usuario recibidos de auth.me():", userData);
        
        // Validamos si el usuario actual es administrador de forma segura
        if (userData) {
          const esSuper = userData.is_superuser === true;
          // Apuntamos directamente a donde viene el rol en tu JSON de consola:
          const rolNombre = userData?.perfil?.rol || ""; 
          const esRolAdmin = typeof rolNombre === 'string' && rolNombre.toLowerCase().includes('administrador');
          
          if (esSuper || esRolAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      })
      .catch((err) => {
        console.error("Error detallado:", err);
        toast.error("Error al cargar la información del torneo.");
      })
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

    //Validacion: Asegurarse de que el torneo esté en estado "Programado"
    if(tournament?.estado_torneo !== 'Programado') {
      toast.warning("Las inscripciones para este torneo están cerradas.");
      return;
    }

    // Validación: Asegurarse de que al menos un horario esté seleccionado
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
    
    // Validación: Asegurarse de que el torneo esté en estado "Programado"
    if (tournament?.estado_torneo !== 'Programado') {
      toast.error("No puedes darte de baja de un torneo que ya ha comenzado o finalizado.");
      return;
    }
    
    // Validacion; Confirmación del usuario antes de proceder con la baja
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

  // Función para abrir el modal y precargar los datos actuales
  const handleOpenEdit = () => {
    setEditForm({
      nombre_torneo: tournament.nombre_torneo || '',
      rama_torneo: tournament.rama_torneo || '',
      fecha_inicio: tournament.fecha_inicio || '',
      categoria: tournament.categoria || tournament.categoria_id || '',
      canchas_disponibles: tournament.canchas_disponibles || 2
    });
    setIsEditing(true);
  };
  // Función para enviar la actualización al backend
  const handleUpdateTorneo = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // Garantizar que canchas_disponibles tenga al menos 1
    const payload = {
      ...editForm,
      canchas_disponibles: editForm.canchas_disponibles === '' ? 1 : editForm.canchas_disponibles,
      categoria: parseInt(editForm.categoria, 10)
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/torneo/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Parámetros del torneo actualizados exitosamente.");
        setIsEditing(false);
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error(errorData);
        toast.error("Error al actualizar los parámetros del torneo.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("Error de red al intentar conectar con el servidor.");
    }
  };

  const handleEliminarTorneo = async () => {
  if (!window.confirm("¿Estás seguro de que deseas eliminar este torneo? Se borrarán todos los datos y partidos asociados permanentemente.")) return;

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/torneo/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      toast.success("Torneo eliminado exitosamente.");
      // Redirigir al usuario al panel principal o listado de torneos tras borrarlo
      window.location.href = "/dashboard"; 
    } else {
      toast.error("Hubo un error al intentar eliminar el torneo.");
    }
  } catch (error) {
    console.error("Error de red:", error);
    toast.error("Error de red al intentar conectar con el servidor.");
  }
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
  const handleResetearTorneo = async () => {
  if (!window.confirm("¿Estás seguro de resetear el torneo? Se borrarán todos los partidos actuales y se abrirán de nuevo las inscripciones.")) return;

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/torneo/${id}/resetear_torneo/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      toast.success("Torneo reseteado correctamente.");
      window.location.reload(); // Recarga la página para refrescar el estado del cuadro y del torneo
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || "No se pudo resetear el torneo.");
    }
  } catch (error) {
    console.error("Error de red:", error);
    toast.error("Error de red al intentar conectar con el servidor.");
  }
};
  const handleOpenInscribeModal = () => {
    // Validamos la rama antes de abrir el modal de disponibilidad
    const sexoUsuario = currentUser?.perfil?.sexo_usuario?.toLowerCase() || "";
    const ramaTorneo = tournament?.rama || "";

    const esMasculino = sexoUsuario.includes('masculino') || sexoUsuario.includes('varonil') || sexoUsuario === 'm';
    const esFemenil = sexoUsuario.includes('femenil') || sexoUsuario.includes('femenino') || sexoUsuario === 'f';

    if (ramaTorneo === 'Varonil' && !esMasculino) {
      toast.error("No cumples con la rama requerida (Torneo Varonil).");
      return;
    }

    if (ramaTorneo === 'Femenil' && !esFemenil) {
      toast.error("No cumples con la rama requerida (Torneo Femenil).");
      return;
    }

    // Si pasa la validación, abre el modal normalmente
    setIsModalOpen(true);
  };
  
  const handleEliminarJugador = async (idInscripcion) => {
  if (!window.confirm("¿Estás seguro de que deseas eliminar a este jugador del torneo?")) return;
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;      
  try {
    // Nota el cambio de 'inscripciones' a 'inscripcion' (en singular)
    const response = await fetch(`http://127.0.0.1:8000/api/inscripcion/${idInscripcion}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      setParticipants(participants.filter(ins => ins.id_inscripcion !== idInscripcion));
      toast.success("Jugador eliminado exitosamente.");
    } else {
      toast.error("Hubo un error al procesar la eliminación.");
    }
  } catch (error) {
    toast.error("Error de red al intentar conectar con el servidor.");
  }
};

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Cargando detalles del torneo...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl relative">
      {/* Enlace para volver al panel */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Tennis App</h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            ← Volver al Panel
          </Link>
        </div>
      </header>
      
      {/* Tarjeta de Información General */}
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
            <p className="font-medium text-foreground">{tournament.categoria_nombre || "Por definir"}</p>
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

      {/* Sección Inferior: Jugadores y Llaves */}
      
      <div className={"grid gap-6 " + (isAdmin ? "md:grid-cols-2" : "md:grid")}>
        {/* Lista de Jugadores Inscritos */}
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
                  {/* Contenedor de información del jugador agrupada a la izquierda */}
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

        {/* Bracket / Llaves y Botones de Administración */}
        {isAdmin && (
        <div className="card-base p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground">Botones de administrador</h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin 
                ? "Asigna los números de siembra a los jugadores para configurar las llaves de eliminación directa."
                : "Botones visibles solo para administradores del torneo."}
            </p>
            
            {/* Solo se muestran los botones de administración si el usuario es Admin */}
            {isAdmin && participants.length > 0 && (
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => setIsSiembraModalOpen(true)}
                  className="btn-primary text-xs py-2 px-4 w-full text-center"
                >
                  Ingresar números de siembra
                </button>

                <button
                  onClick={async () => {
                    const loadingToast = toast.loading("Generando llaves del torneo...");
                    try {
                      await tournamentsApi.generateBracket(id); // O la ruta que maneje tu API para generar el bracket
                      toast.dismiss(loadingToast);
                      toast.success("¡Llaves de enfrentamientos generadas con éxito!");
                      window.location.reload();
                    } catch (err) {
                      toast.dismiss(loadingToast);
                      toast.error(err.message || "Error al generar las llaves.");
                    }
                  }}
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
        )}
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
      {/* Columna Derecha / Principal: Componente modular del Árbol y Resultados */}
        <div className="lg:col-span-2">
          <TournamentResults matches={matches} tournamentId={id} />
        </div>
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
      {/* Modal / Formulario Flotante de Edición */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Editar Parámetros del Torneo</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTorneo} className="space-y-4">
              {/* Nombre del Torneo */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre del Torneo</label>
                <input
                  type="text"
                  value={editForm.nombre_torneo}
                  onChange={(e) => setEditForm({...editForm, nombre_torneo: e.target.value})}
                  className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={editForm.fecha_inicio}
                  onChange={(e) => setEditForm({...editForm, fecha_inicio: e.target.value})}
                  className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Categoría</label>
                <select
                  value={editForm.categoria}
                  onChange={(e) => setEditForm({...editForm, categoria: e.target.value})}
                  className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
                  required
                >
                  <option value="">Selecciona tu categoría</option>
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <option 
                        key={cat.id_categoria || cat.id} 
                        value={cat.id_categoria || cat.id}
                      >
                        {cat.nombre_categoria || cat.nombre || `Categoría ${cat.id_categoria || cat.id}`}
                      </option>
                    ))
                  ) : (
                    <option disabled>Cargando categorías...</option>
                  )}
                </select>
              </div>

              {/* Rama */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Rama</label>
                <select
                  value={editForm.rama_torneo}
                  onChange={(e) => setEditForm({...editForm, rama_torneo: e.target.value})}
                  className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
                >
                  <option value="Varonil">Varonil</option>
                  <option value="Femenil">Femenil</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              {/* Número de Canchas Disponibles */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Número de Canchas Disponibles</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.canchas_disponibles}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditForm({
                      ...editForm,
                      canchas_disponibles: val === '' ? '' : parseInt(val, 10)
                    });
                  }}
                  className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      
    </div>
  );
}