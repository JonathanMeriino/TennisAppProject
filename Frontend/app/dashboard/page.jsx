"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/components/user-profile";
import { UserTournaments } from "@/components/user-tournaments";
import { MyInscribedTournaments } from "@/components/my-inscribed-tournaments";
import { auth, isAuthenticated } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    auth
      .me()
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Tournify</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Mi Panel</h2>
          <p className="text-muted-foreground">
            Gestiona tus torneos y participaciones
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1">
            <UserProfile user={user} isLoading={isLoading} />
          </div>

          {/* Right Column - Actions and Tournaments */}
          <div className="space-y-8 lg:col-span-2">
            {/* Tarjeta de Gestión: Solo aparece si el usuario es Administrador (is_staff o is_superuser) */}
            {!isLoading && user && (
              <div className="card-base p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Gestionar Torneos
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea un nuevo torneo o administra las configuraciones del sistema
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/crear-torneo"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <span>+ Crear Torneo</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Apartado dinámico de torneos a los que está inscrito el jugador */}
            <MyInscribedTournaments />

            {/* Listado general de torneos disponibles */}
            <UserTournaments />
          </div>
        </div>
      </main>
    </div>
  );
}
