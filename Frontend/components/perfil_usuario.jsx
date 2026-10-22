"use client";

import Link from "next/link";

export function UserProfile({ user, isLoading }) {
  if (isLoading) {
    return (
      <div className="card-base text-center py-12 text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card-base text-center py-12 text-muted-foreground">
        No se pudo cargar el perfil
      </div>
    );
  }

 const {
    username = "Usuario",
    perfil = {},
    date_joined = "",
  } = user;

  const displayBoleta = perfil.boleta_usuario || "-";
  const displayCategory = perfil.categoria !== null ? perfil.categoria : "Sin categoría";
  const displayAge = perfil.edad_usuario || "-";
  const displayGender = perfil.sexo_usuario || "-";
  
  const joinedDate = date_joined 
    ? new Date(date_joined).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) 
    : "-";
  

  return (
    <div className="card-base">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-primary to-primary/80 -m-6 mb-6 p-6 rounded-t-lg">
        <div className="flex flex-col items-center">
          {/* Nombre de usuario */}
          <h3 className="mt-4 text-xl font-bold text-primary-foreground">
            {username}
          </h3>
          { /* COrreo electrónico */}
          <h3 className="mt-1 text-sm text-primary-foreground/80">
            {user.email}
          </h3>
          {/* Numero de boleta */}
          <div className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">
            <span className="text-xs text-white/90 font-medium tracking-wide">
              Boleta: <strong className="text-white">{displayBoleta}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">
            Categoría
          </p>
          <p className="text-lg font-bold text-foreground">{displayCategory}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Edad</p>
          <p className="text-lg font-bold text-foreground">{displayAge  }</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">
            Género
          </p>
          <p className="text-lg font-bold text-foreground">{displayGender}</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4 mb-6 pb-6 border-b border-border">
        
        <div className="flex items-start gap-3">
          <div className="text-2xl">📅</div>
          <div>
            <p className="text-xs text-muted-foreground">Miembro desde</p>
            <p className="font-bold text-lg text-foreground">{joinedDate}</p>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <Link href="/editar-perfil" className="btn-primary w-full text-center">
        Editar Perfil
      </Link>
    </div>
  );
}
