"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/api";

export function EditProfileForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    username: "",
    email: "",
    sexo: "",
    edad: "",
    categoria: "",
    boleta: "",
  });
/*
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });*/

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    auth
      .me()
      .then((user) => {
        // Extraemos de forma segura tanto si vienen planos como dentro de 'perfil'
        const perfilData = user.perfil || {};
        
        const sexoVal = user.genero || user.sexo || perfilData.sexo_usuario || "";
        const edadVal = user.edad !== undefined ? user.edad : perfilData.edad_usuario;
        const categoriaVal = user.categoria !== undefined ? user.categoria : perfilData.categoria;
        const boletaVal = perfilData.boleta_usuario || "";

        setFormData({
          nombres: user.first_name || "",
          apellidos: user.last_name || "",
          username: user.username || "",
          email: user.email || "",
          sexo: sexoVal,
          edad: edadVal != null ? String(edadVal) : "",
          categoria: categoriaVal != null ? String(categoriaVal) : "",
          boleta: boletaVal,
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
/*
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };*/

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      Number.parseInt(formData.edad) < 8 ||
      Number.parseInt(formData.edad) > 100 ||
      isNaN(Number.parseInt(formData.edad))
    ) {
      setError("Por favor ingresa una edad válida (entre 8 y 100)");
      return;
    }
/*
    if (
      passwords.newPassword &&
      passwords.newPassword !== passwords.confirmPassword
    ) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }
*/
    setIsLoading(true);

    try {
      const payload = {
        first_name: formData.nombres,
        last_name: formData.apellidos,
        username: formData.username,
        email: formData.email,
        sexo: formData.sexo,
        edad: Number.parseInt(formData.edad),
        categoria: formData.categoria,
        boleta: formData.boleta,
      };
/*
      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }*/

      await auth.updateProfile(payload);
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(
        err.message ||
          "Error al actualizar el perfil. Por favor intenta de nuevo.",
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

        {success && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary text-sm border border-primary/20">
            ✓ {success}
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nombres"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Nombres
              </label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="apellidos"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Apellidos
              </label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-2"
              >
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
              <label
                htmlFor="boleta"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Número de Boleta
              </label>
              <input
                id="boleta"
                name="boleta"
                type="text"
                value={formData.boleta}
                onChange={handleChange}
                disabled
                className="input-field opacity-60 cursor-not-allowed bg-muted"
              />
            </div>
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
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="edad"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Edad
              </label>
              <input
                id="edad"
                name="edad"
                type="number"
                min="8"
                max="100"
                value={formData.edad}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="sexo"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Género
              </label>
              <input
                id="sexo"
                name="sexo"
                type="text"
                value={formData.sexo}
                onChange={handleChange}
                disabled
                className="input-field opacity-60 cursor-not-allowed bg-muted"
              />
            </div>

            <div>
              <label
                htmlFor="categoria"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Categoría de Juego
              </label>
              <input
                id="categoria"
                name="categoria"
                type="text"
                value={formData.categoria}
                onChange={handleChange}
                disabled
                className="input-field opacity-60 cursor-not-allowed bg-muted"
              />
             
            </div>
          </div>
        </div>


        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t border-border">
          <Link href="/dashboard" className="btn-outline flex-1 text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
