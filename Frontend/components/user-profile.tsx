"use client"

import Link from "next/link"

interface UserProfileProps {
  name?: string
  username?: string
  category?: string
  age?: number
  gender?: string
  tournamentsPlayed?: number
  tournamentsWon?: number
  joinedDate?: string
}

export function UserProfile({
  name = "Carlos Rodríguez",
  username = "carlostennis",
  category = "B",
  age = 32,
  gender = "Masculino",
  tournamentsPlayed = 8,
  tournamentsWon = 2,
  joinedDate = "Enero 2023",
}: UserProfileProps) {
  return (
    <div className="card-base">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-primary to-primary/80 -m-6 mb-6 p-6 rounded-t-lg">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-primary text-2xl font-bold border-4 border-card">
            {name.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="mt-4 text-xl font-bold text-primary-foreground">{name}</h3>
          <p className="text-primary-foreground/80">@{username}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Categoría</p>
          <p className="text-lg font-bold text-foreground">{category}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Edad</p>
          <p className="text-lg font-bold text-foreground">{age}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Género</p>
          <p className="text-lg font-bold text-foreground">{gender}</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4 mb-6 pb-6 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🏆</div>
          <div>
            <p className="text-xs text-muted-foreground">Torneos jugados</p>
            <p className="font-bold text-lg text-foreground">{tournamentsPlayed}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-2xl">🥇</div>
          <div>
            <p className="text-xs text-muted-foreground">Torneos ganados</p>
            <p className="font-bold text-lg text-foreground">{tournamentsWon}</p>
          </div>
        </div>
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
  )
}
