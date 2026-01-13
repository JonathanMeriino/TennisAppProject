"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"

export function TournamentActions() {
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return

    setIsJoining(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      window.location.href = `/torneos/${joinCode}`
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="card-base">
      <h2 className="text-xl font-bold text-foreground mb-2">Gestionar Torneos</h2>
      <p className="text-muted-foreground mb-6">Crea un nuevo torneo o únete a uno existente</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/crear-torneo" className="btn-primary text-center py-4">
          ➕ Crear Torneo
        </Link>

        <button onClick={() => setShowJoinDialog(true)} className="btn-outline text-center py-4">
          👥 Unirse a Torneo
        </button>
      </div>

      {/* Join Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border shadow-lg">
            <h3 className="text-lg font-bold mb-2">Unirse a un Torneo</h3>
            <p className="text-muted-foreground text-sm mb-4">Ingresa el código de invitación que recibiste</p>

            <form onSubmit={handleJoinTournament}>
              <input
                type="text"
                placeholder="Ej: TENIS2023"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="input-field mb-4"
              />

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoinDialog(false)} className="btn-outline flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={isJoining || !joinCode.trim()} className="btn-primary flex-1">
                  {isJoining ? "Uniéndose..." : "Unirse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
