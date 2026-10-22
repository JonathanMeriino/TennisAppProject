"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tournaments as tournamentsApi } from "@/lib/api";
import { toast } from "sonner";

export function CreateTournamentForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre_torneo: "",
    fecha_inicio:"",
    fecha_fin:"",
    categoria: "",
    rama_torneo: "Varonil",
    estado:"Programado",
    canchas_disponibles: 2,
  });

  const [isLoading, setIsLoading] = useState(false);
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha_inicio) {
      toast.error("Por favor selecciona la fecha de inicio del torneo");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nombre_torneo: formData.nombre_torneo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        categoria: formData.categoria,
        rama_torneo: formData.rama_torneo,
        estado_torneo: formData.estado,
        canchas_disponibles: formData.canchas_disponibles,
      };
      const created = await tournamentsApi.create(payload);
      if (created?.id_torneo || created?.id) {
        router.push(`/torneos/${created.id_torneo || created.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(
        err.message || "Error al crear el torneo. Por favor asegurate que tienes permisos de administrador para crear torneos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-base">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label
            htmlFor="nombre_torneo"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Nombre del Torneo
          </label>
          <input
            id="nombre_torneo"
            name="nombre_torneo"
            type="text"
            placeholder="Ej: Torneo Primavera 2024"
            value={formData.nombre_torneo}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* Fecha de inicio */}
        
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fecha de Inicio
            </label>

            <input
              id="fecha_inicio"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

        
        {/* Rama y categoria */}
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Categoría
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Selecciona tu categoría</option>
              <option value="1">Principiante</option>
              <option value="2">Categoría D</option>
              <option value="3">Categoría C</option>
              <option value="4">Categoría B</option>
              <option value="5">Categoría A</option>
            </select>
          </div>

        <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rama
            </label>
            <select
              name="rama_torneo"
              value={formData.rama_torneo}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Varonil">Varonil</option>
              <option value="Femenil">Femenil</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>
        { /* Seleccion de numero de canchas disponibles */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Número de Canchas Disponibles
          </label>
          <input
            type="number"
            min="1"
            // Permitimos que el valor sea un string vacío si el usuario lo borra
            value={formData.canchas_disponibles}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({ 
                ...formData, 
                canchas_disponibles: val === '' ? '' : parseInt(val, 10) 
              });
            }}
            className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground"
            required
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Número de canchas habilitadas simultáneamente para este torneo.
          </p>
        </div>

        {/* Botones de accion*/}
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
