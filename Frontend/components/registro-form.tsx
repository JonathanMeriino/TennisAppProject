"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RegistroForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    gender: "",
    age: "",
    category: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (
      Number.parseInt(formData.age) < 8 ||
      Number.parseInt(formData.age) > 100 ||
      isNaN(Number.parseInt(formData.age))
    ) {
      setError("Por favor ingresa una edad válida (entre 8 y 100)")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (err) {
      setError("Error al crear la cuenta. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card-base">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">{error}</div>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
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
              placeholder="TenisPlayer123"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
              Sexo
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleSelectChange("gender", e.target.value)}
              required
              className="input-field"
            >
              <option value="">Selecciona tu sexo</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
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
              placeholder="30"
              value={formData.age}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
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
              <option value="">Selecciona tu categoría</option>
              <option value="A">Categoría A</option>
              <option value="B">Categoría B</option>
              <option value="C">Categoría C</option>
              <option value="D">Categoría D</option>
              <option value="E">Categoría E</option>
              <option value="Principiante">Principiante</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>
    </div>
  )
}
