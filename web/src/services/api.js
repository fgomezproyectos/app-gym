/*
  api.js — Servicio centralizado de llamadas a la API.
  Funciones exportadas y dónde se usan:
    login()        → LoginPage
    register()     → RegisterPage
    getExercises() → ExercisesPage
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

export function getExercises() {
  return request('/api/exercises');
}
