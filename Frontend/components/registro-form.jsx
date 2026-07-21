"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";

export function RegistroForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    sexo: "",
    age: "",
    category: "",
    boleta: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (
      Number.parseInt(formData.age) < 8 ||
      Number.parseInt(formData.age) > 100 ||
      isNaN(Number.parseInt(formData.age))
    ) {
      setError("Por favor ingresa una edad válida (entre 8 y 100)");
      return;
    }

    setIsLoading(true);

    try {
      const respuesta = await fetch("http://localhost:8000/api/usuario/", { // Cambiamos el nombre o usamos 'res'
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          perfil: {
            boleta_usuario: formData.boleta,
            edad_usuario: parseInt(formData.age),
            sexo_usuario: formData.sexo,
            rol: 2,
            categoria: parseInt(formData.category)
          }
        }),
      });
      const data = await respuesta.json();
      if (respuesta.ok){
        // SI todo sale bien, redirigimos al usuario a la página de registro exitoso
        router.push("/registro-exitoso");
      }else {
        // Si django rechaza el registro 
        if (data.username) {
          setError("El nombre de usuario ya esta en uso. Elige otro");
        }else if(data.email){
          setError("El correo electrónico ya esta en uso. Elige otro");
        } else if(data.perfil?.boleta_usuario){
          setError("El número de boleta ya esta en uso. Elige otro");
        } 
        else {
          setError("Por favor verifica los datos ingresados. Algo salió mal.");
        }
      }
      
    } catch (err) {
      setError(
        err.message || "Error al crear la cuenta. Por favor intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-base">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
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

         {/* Fila: Nombre de Usuario y Boleta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              name="username"
              placeholder="TenisPlayer123"
              value={formData.username}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de Boleta
            </label>
            <input
              type="text"
              name="boleta"
              placeholder="Ej. 2026630000"
              value={formData.boleta}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>
        </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
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
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground mb-2"
            >
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
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-foreground mb-2"
            >
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
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-foreground mb-2"
            >
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
            <label
              htmlFor="category"
              className="block text-sm font-medium text-foreground mb-2"
            >
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
              <option value="Principiante">Principiante</option>
              <option value="Clase D">Categoría D</option>
              <option value="Clase C">Categoría C</option>
              <option value="Clase B">Categoría B</option>
              <option value="Clase A">Categoría A</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>
    </div>
  );
}
