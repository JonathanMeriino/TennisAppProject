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
    categoria: "",
    boleta: "",
    escuela: "",
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

    const edadNum = Number.parseInt(formData.age);
    if (isNaN(edadNum) || edadNum < 8 || edadNum > 100) {
      setError("Por favor ingresa una edad válida (entre 8 y 100)");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        perfil: {
          boleta: formData.boleta,
          boleta_usuario: formData.boleta,
          edad: edadNum,
          edad_usuario: edadNum,
          escuela: formData.escuela,
          escuela_usuario: formData.escuela,
          sexo: formData.sexo,
          sexo_usuario: formData.sexo,
          rol: 2, // Rol de Jugador por defecto
          categoria: formData.categoria ? parseInt(formData.categoria) : null
        }
      };

      // Utilizamos el método register centralizado de lib/api.js
      await auth.register(payload);
      router.push("/registro-exitoso");
      
    } catch (err) {
      // Manejo inteligente de errores devueltos por el backend
      if (err.username) {
        setError("El nombre de usuario ya está en uso. Elige otro.");
      } else if (err.email) {
        setError("El correo electrónico ya está registrado.");
      } else if (err.boleta || err.perfil?.boleta) {
        setError("El número de boleta ya está registrado.");
      } else {
        setError(err.message || "Por favor verifica los datos ingresados. Algo salió mal.");
      }
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
              maxLength={10}
              value={formData.boleta}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
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
              htmlFor="sexo"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Sexo
            </label>
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={(e) => handleSelectChange("sexo", e.target.value)}
              required
              className="input-field"
            >
              <option value="">Selecciona tu sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
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
              min="13"
              max="60"
              placeholder="20"
              value={formData.age}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          {/* Escuela de procedencia */}
          <div>
            <label
              htmlFor="escuela"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Escuela de procedencia
            </label>
            <select
              id="escuela"
              name="escuela"
              value={formData.escuela}
              onChange={(e) => handleSelectChange("escuela", e.target.value)}
              className="input-field w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="" disabled>
                Selecciona tu escuela o unidad
              </option>
              
              <optgroup label="Ingeniería y Ciencias Físico Matemáticas">
                <option value="Escuela Superior de Cómputo (ESCOM)">Escuela Superior de Cómputo (ESCOM)</option>
                <option value="Escuela Superior de Físico Matemáticas (ESFM)">Escuela Superior de Físico Matemáticas (ESFM)</option>
                <option value="Escuela Superior de Ingeniería y Arquitectura (ESIA) Unidad Tecamachalco">Escuela Superior de Ingeniería y Arquitectura (ESIA) Unidad Tecamachalco</option>
                <option value="Escuela Superior de Ingeniería y Arquitectura (ESIA) Unidad Ticomán">Escuela Superior de Ingeniería y Arquitectura (ESIA) Unidad Ticomán</option>
                <option value="Escuela Superior de Ingeniería y Arquitectura (ESIA) Unidad Zacatenco">Escuela Superior de Ingeniería y Arquitectura (ESIA) Unidad Zacatenco</option>
                <option value="Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Azcapotzalco">Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Azcapotzalco</option>
                <option value="Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Culhuacán">Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Culhuacán</option>
                <option value="Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Ticomán">Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Ticomán</option>
                <option value="Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Zacatenco">Escuela Superior de Ingeniería Mecánica y Eléctrica (ESIME) Unidad Zacatenco</option>
                <option value="Escuela Superior de Ingeniería Química e Industrias Extractivas (ESIQIE)">Escuela Superior de Ingeniería Química e Industrias Extractivas (ESIQIE)</option>
                <option value="Escuela Superior Textil (ESIT)">Escuela Superior Textil (ESIT)</option>
              </optgroup>

              <optgroup label="Ciencias Médico Biológicas">
                <option value="Centro Interdisciplinario de Ciencias de la Salud (CICS) Unidad Milpa Alta">Centro Interdisciplinario de Ciencias de la Salud (CICS) Unidad Milpa Alta</option>
                <option value="Centro Interdisciplinario de Ciencias de la Salud (CICS) Unidad Santo Tomás">Centro Interdisciplinario de Ciencias de la Salud (CICS) Unidad Santo Tomás</option>
                <option value="Escuela Nacional de Ciencias Biológicas (ENCB)">Escuela Nacional de Ciencias Biológicas (ENCB)</option>
                <option value="Escuela Nacional de Medicina y Homeopatía (ENMH)">Escuela Nacional de Medicina y Homeopatía (ENMH)</option>
                <option value="Escuela Superior de Enfermería y Obstetricia (ESEO)">Escuela Superior de Enfermería y Obstetricia (ESEO)</option>
                <option value="Escuela Superior de Medicina (ESM)">Escuela Superior de Medicina (ESM)</option>
              </optgroup>

              <optgroup label="Ciencias Sociales y Administrativas">
                <option value="Escuela Superior de Economía (ESE)">Escuela Superior de Economía (ESE)</option>
                <option value="Escuela Superior de Comercio y Administración (ESCA) Unidad Santo Tomás">Escuela Superior de Comercio y Administración (ESCA) Unidad Santo Tomás</option>
                <option value="Escuela Superior de Comercio y Administración (ESCA) Unidad Tepepan">Escuela Superior de Comercio y Administración (ESCA) Unidad Tepepan</option>
                <option value="Escuela Superior de Turismo (EST)">Escuela Superior de Turismo (EST)</option>
                <option value="Escuela Nacional de Biblioteconomía y Archivonomía (ENBA)">Escuela Nacional de Biblioteconomía y Archivonomía (ENBA)</option>
              </optgroup>

              <optgroup label="Interdisciplinarias">
                <option value="Unidad Profesional Interdisciplinaria de Biotecnología (UPIBI)">Unidad Profesional Interdisciplinaria de Biotecnología (UPIBI)</option>
                <option value="Unidad Profesional Interdisciplinaria de Ingeniería (UPIIG) Campus Guanajuato">Unidad Profesional Interdisciplinaria de Ingeniería (UPIIG) Campus Guanajuato</option>
                <option value="Unidad Profesional Interdisciplinaria de Ingeniería (UPIIH) Campus Hidalgo">Unidad Profesional Interdisciplinaria de Ingeniería (UPIIH) Campus Hidalgo</option>
                <option value="Unidad Profesional Interdisciplinaria de Ingeniería (UPIIZ) Campus Zacatecas">Unidad Profesional Interdisciplinaria de Ingeniería (UPIIZ) Campus Zacatecas</option>
                <option value="Unidad Profesional Interdisciplinaria de Energía y Movilidad (UPIEM)">Unidad Profesional Interdisciplinaria de Energía y Movilidad (UPIEM)</option>
                <option value="Unidad Profesional Interdisciplinaria de Ingeniería y Ciencias Sociales y Administrativas (UPIICSA)">Unidad Profesional Interdisciplinaria de Ingeniería y Ciencias Sociales y Administrativas (UPIICSA)</option>
                <option value="Unidad Profesional Interdisciplinaria en Ingeniería y Tecnologías Avanzadas (UPIITA)">Unidad Profesional Interdisciplinaria en Ingeniería y Tecnologías Avanzadas (UPIITA)</option>
                <option value="Unidad Profesional Interdisciplinaria de Ingeniería, Campus Palenque (UPIIP)">Unidad Profesional Interdisciplinaria de Ingeniería, Campus Palenque (UPIIP)</option>
                <option value="Unidad Profesional Interdisciplinaria de Ingeniería, Campus Tlaxcala (UPIIT)">Unidad Profesional Interdisciplinaria de Ingeniería, Campus Tlaxcala (UPIIT)</option>
              </optgroup>

              <optgroup label="Centros de Investigación / Posgrado">
                <option value="CIC">CIC - Centro de Investigación en Computación</option>
                <option value="CINVESTAV">CINVESTAV</option>
                <option value="Otro">Otro</option>
              </optgroup>

              <optgroup label="Nivel Medio Superior">
                <option value="CECyT 1">CECyT 1 - &quot;Gonzalo Vázquez Vela&quot;</option>
                <option value="CECyT 2">CECyT 2 - &quot;Miguel Bernard&quot;</option>
                <option value="CECyT 3">CECyT 3 - &quot;Estanislao Ramírez Ruiz&quot;</option>
                <option value="CECyT 4">CECyT 4 - &quot;Lázaro Cárdenas&quot;</option>
                <option value="CECyT 5">CECyT 5 - &quot;Benito Juárez&quot;</option>
                <option value="CECyT 6">CECyT 6 - &quot;Miguel Othón de Mendizábal&quot;</option>
                <option value="CECyT 7">CECyT 7 - &quot;Cuauhtémoc&quot;</option>
                <option value="CECyT 8">CECyT 8 - &quot;Narciso Bassols&quot;</option>
                <option value="CECyT 9">CECyT 9 - &quot;Juan de Dios Bátiz&quot;</option>
                <option value="CECyT 10">CECyT 10 - &quot;Carlos Vallejo Márquez&quot;</option>
                <option value="CECyT 11">CECyT 11 - &quot;Wilfrido Massieu&quot;</option>
                <option value="CECyT 12">CECyT 12 - &quot;José María Morelos&quot;</option>
                <option value="CECyT 13">CECyT 13 - &quot;Ricardo Flores Magón&quot;</option>
                <option value="CECyT 14">CECyT 14 - &quot;Luis Enrique Erro Soler&quot;</option>
                <option value="CECyT 15">CECyT 15 - &quot;Diódoro Antúnez Echagaray&quot;</option>
                <option value="CECyT 16">CECyT 16 - &quot;Unidad Hidalgo&quot;</option> 
                <option value="CECyT 17">CECyT 17 - &quot;Unidad Guanajuato&quot;</option>
                <option value="CECyT 18">CECyT 18 - &quot;Unidad Zacatecas&quot;</option>
                <option value="CECyT 19">CECyT 19 - &quot;Leona Vicario Unidad Tecámac&quot;</option>
              </optgroup>
            </select>
          </div>

          {/* Categoría de Juego */}
          <div className="md:col-span-2">
            <label
              htmlFor="categoria"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Categoría de Juego
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={(e) => handleSelectChange("categoria", e.target.value)}
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