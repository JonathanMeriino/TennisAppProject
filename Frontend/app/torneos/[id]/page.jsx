"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tournaments as tournamentsApi, auth } from "@/lib/api";
// Importación de componentes
import TournamentResults from "@/components/torneos_cuadro";
import TorneoDetalles from "@/components/torneo_detalles";
import TorneoAcciones from "@/components/torneo_acciones";
import TorneoJugadores from "@/components/torneo_jugadores";
import ModalEdicion from "@/components/modal_edicion";
import ModalInscripcion from "@/components/modal_inscripcion";
import ModalSiembras from "@/components/modal_siembras";
import { toast } from "sonner";


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
  canchas_disponibles: 2,
  descripcion_torneo: ''
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
      canchas_disponibles: tournament.canchas_disponibles || 2,
      descripcion: tournament.descripcion_torneo || ''
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
      categoria: parseInt(editForm.categoria, 10),
      descripcion_torneo: editForm.descripcion || ''
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

  const handleGenerateBracket = async () => {
  const loadingToast = toast.loading("Generando llaves del torneo...");
  try {
    await tournamentsApi.generateBracket(id);
    toast.dismiss(loadingToast);
    toast.success("¡Llaves de enfrentamientos generadas con éxito!");
    window.location.reload();
  } catch (err) {
    toast.dismiss(loadingToast);
    toast.error(err.message || "Error al generar las llaves.");
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
      
      <TorneoDetalles 
        tournament={tournament}
        isAdmin={isAdmin}
        usuarioInscrito={usuarioInscrito}
        isLeaving={isLeaving}
        handleLeaveTournament={handleLeaveTournament}
        handleOpenInscribeModal={handleOpenInscribeModal}
        handleOpenEdit={handleOpenEdit}
        handleEliminarTorneo={handleEliminarTorneo}
      />

      {/* Sección Inferior: Jugadores y Llaves */}
      
      <div className={"grid gap-6 " + (isAdmin ? "md:grid-cols-2" : "md:grid")}>
        {/* Componente de Jugadores Inscritos */}
        <TorneoJugadores 
          participants={participants}
          isAdmin={isAdmin}
          handleEliminarJugador={handleEliminarJugador}
        />

        {/* Bracket / Llaves y Botones de Administración */}
        <TorneoAcciones 
          isAdmin={isAdmin}
          participantsLength={participants.length}
          setIsSiembraModalOpen={setIsSiembraModalOpen}
          handleGenerateBracket={handleGenerateBracket}
          handleResetearTorneo={handleResetearTorneo}
        />
      </div>

      {/* Modal de Disponibilidad para Inscripción */}
      <ModalInscripcion
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        availability={availability}
        handleCheckboxChange={handleCheckboxChange}
        handleRegisterSubmit={handleRegisterSubmit}
        isRegistering={isRegistering}
      />
      {/* Columna Derecha / Principal: Componente modular del Árbol y Resultados */}
        <div className="lg:col-span-2">
          <TournamentResults matches={matches} tournamentId={id} />
        </div>
      
      {/* Modal para Asignar Números de Siembra */}
      <ModalSiembras
        isSiembraModalOpen={isSiembraModalOpen}
        setIsSiembraModalOpen={setIsSiembraModalOpen}
        participants={participants}
        handleSiembraChange={handleSiembraChange}
        handleSaveSiembras={handleSaveSiembras}
      />
      {/* Modal de Edición de Parámetros */}
      <ModalEdicion
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editForm={editForm}
        setEditForm={setEditForm}
        categories={categories}
        handleUpdateTorneo={handleUpdateTorneo}
      />
      
      
    </div>
  );
}