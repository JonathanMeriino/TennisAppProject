"use client";

export function TournamentDetails({ tournament }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "En progreso":
        return "bg-primary/20 text-primary";
      case "Próximo":
        return "bg-accent/20 text-accent-foreground";
      case "Finalizado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatName = (format) => {
    switch (format) {
      case "round-robin":
        return "Round Robin";
      case "elimination":
        return "Eliminación Directa";
      case "mixed":
        return "Mixto (Round Robin + Eliminación)";
      default:
        return format;
    }
  };

  return (
    <div className="card-base">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {tournament.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(tournament.status)}`}
            >
              {tournament.status}
            </span>
            {tournament.isOrganizer && (
              <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-primary/10 text-primary">
                Organizador
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Fecha de inicio
              </p>
              <p className="font-medium text-foreground">
                {tournament.startDate}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Ubicación
              </p>
              <p className="font-medium text-foreground">
                {tournament.location}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Categoría
              </p>
              <p className="font-medium text-foreground">
                {tournament.category}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Formato
              </p>
              <p className="font-medium text-foreground">
                {formatName(tournament.format)}
              </p>
            </div>
          </div>

          {(tournament.format === "round-robin" ||
            tournament.format === "mixed") &&
            tournament.numberOfGroups && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Número de grupos
                  </p>
                  <p className="font-medium text-foreground">
                    {tournament.numberOfGroups}
                  </p>
                </div>
              </div>
            )}

          {tournament.description && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Descripción
                </p>
                <p className="font-medium text-foreground">
                  {tournament.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
