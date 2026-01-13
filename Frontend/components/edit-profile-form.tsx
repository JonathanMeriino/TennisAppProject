"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function EditProfileForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "Carlos Rodríguez",
    username: "carlostennis",
    email: "carlos@ejemplo.com",
    gender: "masculino",
    age: "32",
    category: "B",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (
      Number.parseInt(formData.age) < 8 ||
      Number.parseInt(formData.age) > 100 ||
      isNaN(Number.parseInt(formData.age))
    ) {
      setError("Por favor ingresa una edad válida (entre 8 y 100)")
      return
    }

    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setError("Las nuevas contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Perfil actualizado correctamente")
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      setError("Error al actualizar el perfil. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card-base">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm border border-destructive/20">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary text-sm border border-primary/20">✓ {success}</div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4 pb-6 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-primary text-2xl font-bold border-4 border-card">
            {formData.name.substring(0, 2).toUpperCase()}
          </div>
          <button type="button" className="text-sm text-primary font-medium hover:underline">
            Cambiar foto
          </button>
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Nombre de Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
                Edad
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="8"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
                Género
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleSelectChange("gender", e.target.value)}
                required
                className="input-field"
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Categoría de Juego
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleSelectChange("category", e.target.value)}
                required
                className="input-field"
              >
                <option value="A">Categoría A</option>
                <option value="B">Categoría B</option>
                <option value="C">Categoría C</option>
                <option value="D">Categoría D</option>
                <option value="E">Categoría E</option>
                <option value="Principiante">Principiante</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Seguridad</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                Contraseña Actual (para confirmar cambios)
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  Nueva Contraseña (Opcional)
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t border-border">
          <Link href="/dashboard" className="btn-outline flex-1 text-center">
            Cancelar
          </Link>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}
