"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tournaments as tournamentsApi } from "@/lib/api";

export function CreateTournamentForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    category: "",
    format: "round-robin",
    numberOfGroups: "2",
  });

  const [startDate, setStartDate] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!startDate) {
      setError("Por favor selecciona la fecha de inicio del torneo");
      return;
    }

    if (!file) {
      setError("Por favor sube el archivo Excel con los participantes");
      return;
    }

    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("location", formData.location);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("format", formData.format);
      payload.append("numberOfGroups", formData.numberOfGroups);
      payload.append("startDate", startDate);
      payload.append("file", file);

      const created = await tournamentsApi.create(payload);
      if (created?.id) {
        router.push(`/torneos/${created.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err.message || "Error al crear el torneo. Por favor intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-base">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm border border-destructive/20">
            ⚠️ {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Nombre del Torneo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ej: Torneo Primavera 2024"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* Date and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Fecha de Inicio
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Categoría
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleSelectChange("category", e.target.value)}
              required
              className="input-field"
            >
              <option value="">Seleccionar categoría</option>
              <option value="A">Categoría A</option>
              <option value="B">Categoría B</option>
              <option value="C">Categoría C</option>
              <option value="D">Categoría D</option>
              <option value="E">Categoría E</option>
              <option value="Principiante">Principiante</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Ubicación
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Ej: Club de Tenis Central"
            value={formData.location}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Formato del Torneo
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="radio"
                value="round-robin"
                checked={formData.format === "round-robin"}
                onChange={(e) => handleSelectChange("format", e.target.value)}
                className="w-4 h-4"
              />

              <span className="font-medium text-foreground">Round Robin</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="radio"
                value="elimination"
                checked={formData.format === "elimination"}
                onChange={(e) => handleSelectChange("format", e.target.value)}
                className="w-4 h-4"
              />

              <span className="font-medium text-foreground">
                Eliminación Directa
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="radio"
                value="mixed"
                checked={formData.format === "mixed"}
                onChange={(e) => handleSelectChange("format", e.target.value)}
                className="w-4 h-4"
              />

              <span className="font-medium text-foreground">
                Mixto (Round Robin + Eliminación)
              </span>
            </label>
          </div>
        </div>

        {/* Number of Groups */}
        {(formData.format === "round-robin" || formData.format === "mixed") && (
          <div>
            <label
              htmlFor="numberOfGroups"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Número de Grupos
            </label>
            <select
              id="numberOfGroups"
              value={formData.numberOfGroups}
              onChange={(e) =>
                handleSelectChange("numberOfGroups", e.target.value)
              }
              className="input-field"
            >
              <option value="2">2 grupos</option>
              <option value="4">4 grupos</option>
              <option value="8">8 grupos</option>
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Descripción (Opcional)
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe los detalles del torneo..."
            value={formData.description}
            onChange={handleChange}
            className="input-field min-h-[100px] resize-none"
          />
        </div>

        {/* File Upload */}
        <div>
          <label
            htmlFor="fileUpload"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Subir Archivo Excel con Participantes
          </label>
          <input
            id="fileUpload"
            type="file"
            onChange={handleFileChange}
            required
            className="input-field"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <Link href="/dashboard" className="btn-outline flex-1 text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? "Creando..." : "Crear Torneo"}
          </button>
        </div>
      </form>
    </div>
  );
}
