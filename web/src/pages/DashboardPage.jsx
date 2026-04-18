// DashboardPage.jsx — Ruta: /dashboard (protegida). Página principal tras el login.
import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, Menu } from 'lucide-react';
import { useSidebar } from '../components/ProtectedLayout';
import './DashboardPage.css';

// Decodifica el nombre del usuario desde el JWT sin librerías externas
function getUserName() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'Usuario';
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    // ASP.NET Core serializa ClaimTypes.Name con la URL completa
    return (
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload.name ||
      'Usuario'
    );
  } catch {
    return 'Usuario';
  }
}

// Devuelve las 7 fechas ISO de la semana actual (lunes→domingo)
function getWeekDays() {
  const today = new Date();
  const dow = today.getDay(); // 0=Dom
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function loadDefaultGoals() {
  try {
    return JSON.parse(localStorage.getItem('gym-default-goals') || '[]');
  } catch {
    return [];
  }
}

// Construye la lista de goals del día combinando defaults + progreso diario guardado.
// - Si es un día nuevo: parte de cero con los defaults.
// - Si ya hay datos de hoy: conserva el progreso, añade defaults nuevos, elimina los borrados.
function buildDailyGoals(defaultGoals) {
  const today = getTodayStr();
  const defaultIds = new Set(defaultGoals.map(d => d.id));
  try {
    const stored = JSON.parse(localStorage.getItem('gym-daily-goals') || 'null');
    if (stored && stored.date === today) {
      // 1. Filtrar goals de default que ya no existen en gym-default-goals
      const filtered = stored.goals.filter(g => !g.isDefault || defaultIds.has(g.id));
      // 2. Añadir defaults nuevos que aún no están en el día
      const existingIds = new Set(filtered.map(g => g.id));
      const missing = defaultGoals
        .filter(dg => !existingIds.has(dg.id))
        .map(dg => ({ id: dg.id, label: dg.label, done: false, isDefault: true }));
      return [...filtered, ...missing];
    }
  } catch { /* ignorar errores de parse */ }
  // Día nuevo o primera vez: empezar desde defaults
  return defaultGoals.map(dg => ({ id: dg.id, label: dg.label, done: false, isDefault: true }));
}

function saveDailyGoals(goals) {
  localStorage.setItem(
    'gym-daily-goals',
    JSON.stringify({ date: getTodayStr(), goals })
  );
}

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function DashboardPage() {
  const openSidebar = useSidebar();
  const name = getUserName();
  const initial = name.charAt(0).toUpperCase();

  const [completedDays] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gym-completed-days') || '[]');
    } catch { return []; }
  });
  const [goals, setGoals] = useState(() => {
    const initial = buildDailyGoals(loadDefaultGoals());
    saveDailyGoals(initial);
    return initial;
  });
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Escuchar cambios en los goals predeterminados (disparados por el Sidebar)
  useEffect(() => {
    const handle = () => {
      const updated = buildDailyGoals(loadDefaultGoals());
      setGoals(updated);
      saveDailyGoals(updated);
    };
    window.addEventListener('defaultGoalsChanged', handle);
    return () => window.removeEventListener('defaultGoalsChanged', handle);
  }, []);

  const weekDays = useMemo(() => getWeekDays(), []);
  const today = getTodayStr();

  const daysThisWeek = useMemo(
    () => weekDays.filter(d => completedDays.some(c => c.date === d)).length,
    [weekDays, completedDays]
  );

  const currentStreak = useMemo(() => {
    let streak = 0;
    const base = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (completedDays.some(c => c.date === ds)) streak++;
      else break;
    }
    return streak;
  }, [completedDays]);

  const goalsDone = goals.filter(g => g.done).length;
  const goalsTotal = goals.length;
  const progressPct = goalsTotal > 0 ? Math.round((goalsDone / goalsTotal) * 100) : 0;

  const toggleGoal = (id) => {
    const updated = goals.map(g => (g.id === id ? { ...g, done: !g.done } : g));
    setGoals(updated);
    saveDailyGoals(updated);
  };

  const addGoal = () => {
    if (!newGoalLabel.trim()) return;
    // Los goals añadidos manualmente en el dashboard son "de hoy" (isDefault: false)
    const updated = [
      ...goals,
      { id: crypto.randomUUID(), label: newGoalLabel.trim(), done: false, isDefault: false },
    ];
    setGoals(updated);
    saveDailyGoals(updated);
    setNewGoalLabel('');
    setShowAddGoal(false);
  };

  const removeGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    saveDailyGoals(updated);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">

        {/* ── Header ── */}
        <div className="dash-header">
          <div
            className="dash-avatar"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="dash-greeting">
            <span className="dash-hello">Hola,</span>
            <span className="dash-name">{name}</span>
          </div>
          <button className="dash-menu-btn" onClick={openSidebar} aria-label="Abrir menú">
            <Menu size={20} />
          </button>
        </div>

        <h1 className="dash-title">Tu resumen<br />de hoy</h1>

        {/* ── Stats rápidas ── */}
        <div className="dash-stats">
          <div className="dash-stat-card stat-days">
            <span className="dash-stat-value">{daysThisWeek}</span>
            <span className="dash-stat-label">Días esta semana</span>
          </div>
          <div className="dash-stat-card stat-streak">
            <span className="dash-stat-value">{currentStreak}</span>
            <span className="dash-stat-label">Racha (días)</span>
          </div>
          <div className="dash-stat-card stat-goals">
            <span className="dash-stat-value">
              {goalsDone}/{goalsTotal > 0 ? goalsTotal : '—'}
            </span>
            <span className="dash-stat-label">Goals hoy</span>
          </div>
        </div>

        {/* ── Esta semana ── */}
        <section className="dash-section">
          <h2 className="dash-section-title">Esta semana</h2>
          <div className="week-grid">
            {weekDays.map((date, i) => {
              const done = completedDays.some(c => c.date === date);
              const isToday = date === today;
              return (
                <div
                  key={date}
                  className={`week-cell${done ? ' done' : ''}${isToday ? ' is-today' : ''}`}
                >
                  <span className="week-day-label">{DAYS_SHORT[i]}</span>
                  <div className="week-dot" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Daily Goals ── */}
        <section className="dash-section">
          <div className="dash-section-row">
            <div>
              <h2 className="dash-section-title" style={{ marginBottom: 0 }}>
                Daily Goals
              </h2>
              {goalsTotal === 0 && (
                <p className="goals-setup-hint">
                  Configura tus goals desde el menú lateral → para que aparezcan aquí cada día.
                </p>
              )}
            </div>
            <button
              className="btn-icon-round"
              onClick={() => setShowAddGoal(v => !v)}
              aria-label="Añadir objetivo puntual"
            >
              <Plus size={16} />
            </button>
          </div>

          {goalsTotal > 0 && (
            <div className="goals-progress-wrap">
              <div className="goals-progress-bar-track">
                <div
                  className="goals-progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="goals-progress-label">
                {goalsDone} de {goalsTotal} completados · {progressPct}%
              </span>
            </div>
          )}

          {showAddGoal && (
            <div className="add-goal-row">
              <input
                type="text"
                value={newGoalLabel}
                onChange={e => setNewGoalLabel(e.target.value)}
                placeholder="Goal puntual para hoy..."
                className="add-goal-input"
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                autoFocus
              />
              <button
                className="btn-confirm-goal"
                onClick={addGoal}
                aria-label="Confirmar objetivo"
              >
                <Check size={16} />
              </button>
            </div>
          )}

          <div className="goals-list">
            {goals.map(g => (
              <div key={g.id} className={`goal-item${g.done ? ' done' : ''}`}>
                <button
                  className={`goal-checkbox${g.done ? ' checked' : ''}`}
                  onClick={() => toggleGoal(g.id)}
                  aria-label={g.done ? 'Marcar como pendiente' : 'Marcar como hecho'}
                >
                  {g.done && <Check size={13} />}
                </button>
                <span className="goal-label">{g.label}</span>
                <button
                  className="goal-remove"
                  onClick={() => removeGoal(g.id)}
                  aria-label={g.isDefault ? 'Saltar hoy' : 'Eliminar objetivo'}
                  title={g.isDefault ? 'Saltar hoy (reaparecerá mañana)' : 'Eliminar'}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
