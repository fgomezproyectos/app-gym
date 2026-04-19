/*
  api.js — Servicio centralizado de llamadas a la API.
  Funciones exportadas y dónde se usan:
    login()              → LoginPage
    register()           → RegisterPage
    getMe()              → ProfilePage, Sidebar
    updateAvatar()       → ProfilePage
    updateName()         → ProfilePage
    getGoals()           → Sidebar
    createGoal()         → Sidebar
    deleteGoal()         → Sidebar
    getDailyGoals()      → DashboardPage
    createDailyGoal()    → DashboardPage
    patchDailyGoal()     → DashboardPage
    deleteDailyGoal()    → DashboardPage
    getDailyStreak()     → DashboardPage
*/
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5211';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await res.json().then(d => JSON.stringify(d))
      : await res.text();
    throw new Error(body || res.statusText);
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(name, email, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// Devuelve { name, email, avatarBase64 } del usuario autenticado
export function getMe() {
  return request('/api/auth/me');
}

// Sube el avatar (cadena Base64 con prefijo data:image/jpeg;base64,...)
export function updateAvatar(avatarBase64) {
  return request('/api/auth/avatar', {
    method: 'PUT',
    body: JSON.stringify({ avatarBase64 }),
  });
}

// Actualiza el nombre; devuelve { token } nuevo con el nombre actualizado
export function updateName(name) {
  return request('/api/auth/name', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

// ── Goals predeterminados ─────────────────────────────────────────────────────

export function getGoals() {
  return request('/api/goals');
}

export function createGoal(label) {
  return request('/api/goals', {
    method: 'POST',
    body: JSON.stringify({ label }),
  });
}

export function deleteGoal(id) {
  return request(`/api/goals/${id}`, { method: 'DELETE' });
}

// ── Daily goal logs ───────────────────────────────────────────────────────────

// date: "yyyy-MM-dd". Si se omite el backend usa hoy.
export function getDailyGoals(date) {
  const q = date ? `?date=${date}` : '';
  return request(`/api/daily-goals${q}`);
}

// Añade un goal puntual (solo para ese día, no es default)
export function createDailyGoal(label, date) {
  return request('/api/daily-goals', {
    method: 'POST',
    body: JSON.stringify({ label, date }),
  });
}

// Marca/desmarca un log como done
export function patchDailyGoal(id, done) {
  return request(`/api/daily-goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ done }),
  });
}

// Elimina un goal puntual del día
export function deleteDailyGoal(id) {
  return request(`/api/daily-goals/${id}`, { method: 'DELETE' });
}

// Devuelve la racha actual (días consecutivos con ≥1 goal completado)
export function getDailyStreak() {
  return request('/api/daily-goals/streak');
}
