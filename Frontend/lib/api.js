// ---------------------------------------------------------------------------
// Cliente central de API para conectar con tu backend REST (JWT Bearer).
//
// Configura la URL de tu backend con la variable de entorno NEXT_PUBLIC_API_URL
// (ver .env.local). Por defecto usa http://localhost:8000.
//
// ENDPOINTS ESPERADOS (rutas REST estándar que asume el frontend):
//   POST   /api/auth/register           -> { token, user }
//   POST   /api/auth/login              -> { token, user }
//   GET    /api/auth/me                 -> user
//   PUT    /api/auth/me                 -> user
//   GET    /api/tournaments             -> [ tournament, ... ]
//   POST   /api/tournaments             -> tournament        (multipart/form-data con Excel)
//   POST   /api/tournaments/join        -> { id }            body: { code }
//   GET    /api/tournaments/:id         -> tournament
//   GET    /api/tournaments/:id/groups  -> [ group, ... ]
//   GET    /api/tournaments/:id/matches -> [ match, ... ]
//   POST   /api/tournaments/:id/matches/:matchId/result -> match
//
// Ajusta las rutas de abajo si tu backend usa otras.
// ---------------------------------------------------------------------------

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "tournify_token";

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

// --- Fetch base con manejo de errores y token ------------------------------
/*
async function request(path, { method = "GET", body, headers = {}, isForm = false } = {}) {
  const token = getToken();
  const finalHeaders = { ...headers };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let payload = body;
  if (body && !isForm) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: payload,
    });
  } catch (err) {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica que tu backend esté corriendo en " +
        API_URL,
    );
  }

  // Sesión expirada / no autorizado
  if (res.status === 401) {
    clearToken();
    throw new Error("Sesión expirada. Por favor inicia sesión de nuevo.");
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.detail || data.error)) ||
      `Error ${res.status}`;
    throw new Error(message);
  }

  return data;
}*/
// Ajusta esto en tu archivo donde definiste la función 'request'
async function request(url, options = {}) {
  const token = localStorage.getItem("access_token");

  // Construimos las cabeceras asegurando que el token vaya primero o se fusione correctamente
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`http://localhost:8000${url}`, {
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
  async generateBrackets(tournamentId) {
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
    return request ('/api/resultads/', {
      method: 'POST',
      body: JSON.stringify({
        partido: partidoId,
        sets_j1: parseInt(setsJ1),
        sets_j2: parseInt(setsJ2),
        ganador_inscripcion: ganadorInscripcionId,
      }),
    });
  },

  async myTournaments() {
    return request("/api/torneo/mis_inscripciones/");
  },
};
