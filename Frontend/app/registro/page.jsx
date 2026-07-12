"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Asegúrate de exportar la función exactamente con el nombre que importas en page.jsx
export void function RegistroForm() {
  const router = useRouter();

  // 1. Estados para el modelo nativo User de Django
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2. Estados para tu modelo Perfil personalizado
  const [boleta, setBoleta] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");

  // Estados para manejar el botón de carga y mensajes al usuario
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // 3. Función principal para enviar los datos a Django
  const manejarRegistro = async (e) => {
    e.preventDefault(); // Evita que se recargue la página
    setCargando(true);
    setMensaje(""); // Limpiamos mensajes anteriores

    // Construimos el JSON anidado que espera Django para llenar las dos tablas
    const payload = {
      username: username,
      email: email,
      password: password,
      perfil: {
        boleta_usuario: boleta,
        edad_usuario: edad ? parseInt(edad) : null, 
        sexo_usuario: sexo
      }
    };

    try {
      // Hacemos el POST a tu ViewSet de usuarios
      const respuesta = await fetch("http://localhost:8000/api/usuario/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (respuesta.ok) {
        // Si PostgreSQL guarda todo bien, redirigimos al login o al dashboard
        router.push("/"); 
      } else {
        const errores = await respuesta.json();
        console.error("Errores desde Django:", errores);
        setMensaje("Revisa los datos. Es posible que el correo o la boleta ya estén registrados.");
        setCargando(false);
      }
    } catch (error) {
      console.error("Fallo la conexión:", error);
      setMensaje("Error de red. Verifica que el servidor de Django esté corriendo.");
      setCargando(false);
    }
  };

  return (
    <form onSubmit={manejarRegistro} className="flex flex-col gap-4 w-full">
      
      {/* Alerta de error si algo falla */}
      {mensaje && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
          {mensaje}
        </div>
      )}

      {/* --- CAMPOS DEL USUARIO --- */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Credenciales de Acceso
        </h3>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {/* --- CAMPOS DEL PERFIL --- */}
      <div className="space-y-3 mt-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Datos del Jugador
        </h3>
        <input
          type="text"
          placeholder="Número de Boleta (Ej. 2026123456)"
          value={boleta}
          onChange={(e) => setBoleta(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Edad"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            className="w-1/2 border border-input bg-background px-3 py-2 rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value)}
            className="w-1/2 border border-input bg-background px-3 py-2 rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Sexo...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
      </div>

      {/* --- BOTÓN DE ENVÍO --- */}
      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-primary text-primary-foreground font-medium px-4 py-2 rounded-md mt-6 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cargando ? "Procesando Registro..." : "Completar Registro"}
      </button>
    </form>
  );
}