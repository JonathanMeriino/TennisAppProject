// ---------------------------------------------------------------------------
// Cliente central de API para conectar con tu backend REST (JWT Bearer).
//
// Configura la URL de tu backend con la variable de entorno NEXT_PUBLIC_API_URL
// (ver .env.local). Por defecto usa http://localhost:8000.

// Ajusta las rutas de abajo si tu backend usa otras.
// ---------------------------------------------------------------------------

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const TOKEN_KEY = "access_token";

// --- Manejo del token JWT --------------------------------------------------

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  console.log("Token en isAuthenticated:", token);
  return !!token;
}

async function request(url, options = {}) {
  const token = localStorage.getItem("access_token");

  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${url}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  if (response.status === 204) return null;

  return response.json();
}

// --- Autenticación ---------------------------------------------------------

export const auth = {
  async register(data) {
    const result = await request("/api/usuario/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (result?.token) setToken(result.token);
    return result;
  },

  async login(username, password) {
    const result = await request("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (result?.access) {
      localStorage.setItem("access_token", result.access);
    }
    return result;
  },

  async me() {
    return request("/api/auth/me");
  },

  async updateProfile(data) {
    return request("/api/auth/me", { method: "PUT", body: JSON.stringify(data) });
  },

  logout() {
    clearToken();
  },
};

// --- Torneos ---------------------------------------------------------------

export const tournaments = {
  async list() {
    return request("/api/torneo/");
  },

  async get(id) {
    return request(`/api/torneo/${id}/`);
  },

  async create(data) {
    return request("/api/torneo/", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  async join(tournamentId, availabilityData) {
    return request(`/api/torneo/${tournamentId}/inscribir/`, {
      method: "POST",
      body: JSON.stringify({ matriz_disponibilidad: availabilityData }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  async leave(tournamentId) {
    return request(`/api/torneo/${tournamentId}/cancelar_inscripcion/`, {
      method: "DELETE",
    });
  },

  async participants(id) {
    return request(`/api/torneo/${id}/inscripciones/`);
  },

  async updateSiembra(inscriptionId, numeroSiembra) {
    return request(`/api/inscripcion/${inscriptionId}/`, {
      method : "PATCH",
      body: JSON.stringify({ numero_siembra: numeroSiembra  ? parseInt(numeroSiembra) : null }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  async generateBracket(tournamentId) {
    return request(`/api/torneo/${tournamentId}/generar_bracket/`, {
      method: "POST",
    });
  },

  async getPartidos(tournamentId) {
    return request(`/api/torneo/${tournamentId}/partidos/`);
  },

  async matches(id) {
    return request(`/api/torneo/${id}/matches`);
  },

  async reportResult(partidoId, setsJ1, setsJ2, ganadorInscripcionId) {
    return request ('/api/resultados/', {
      method: 'POST',
      body: JSON.stringify({
        partido: partidoId,
        sets_jugador1: parseInt(setsJ1),
        sets_jugador2: parseInt(setsJ2),
        ganador: ganadorInscripcionId,
      }),
    });
  },

  async myTournaments() {
    return request("/api/torneo/mis_inscripciones/");
  },
};
