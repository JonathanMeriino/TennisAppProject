"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/components/user-profile";
import { TournamentActions } from "@/components/tournament-actions";
import { UserTournaments } from "@/components/user-tournaments";
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
            <TournamentActions />
            <UserTournaments />
          </div>
        </div>
      </main>
    </div>
  );
}
