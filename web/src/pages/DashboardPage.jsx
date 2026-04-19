// DashboardPage.jsx — Ruta: /dashboard (protegida). Página principal tras el login.
import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, Menu } from 'lucide-react';
import { useSidebar } from '../components/ProtectedLayout';
import { getMe, getDailyGoals, createDailyGoal, patchDailyGoal, deleteDailyGoal, getDailyStreak } from '../services/api';
import './DashboardPage.css';

// Decodifica el nombre del usuario desde el JWT sin librerías externas
function getUserName() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'Usuario';
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
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
  const dow = today.getDay();
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

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function DashboardPage() {
  const openSidebar = useSidebar();
  const [name, setName] = useState(getUserName);
  const [avatar, setAvatar] = useState(null);
  const initial = name.charAt(0).toUpperCase();

  const [completedDays] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gym-completed-days') || '[]');
    } catch { return []; }
  });

  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Carga inicial: avatar + goals del día + racha
  useEffect(() => {
    getMe().then(data => { if (data?.avatarBase64) setAvatar(data.avatarBase64); }).catch(() => {});
    getDailyGoals().then(setGoals).catch(() => {});
    getDailyStreak().then(setStreak).catch(() => {});
  }, []);

  // Escuchar cambios de avatar y nombre desde ProfilePage
  useEffect(() => {
    const onAvatar = (e) => setAvatar(e.detail);
    const onName  = (e) => setName(e.detail);
    window.addEventListener('avatarChanged', onAvatar);
    window.addEventListener('nameChanged', onName);
    return () => {
      window.removeEventListener('avatarChanged', onAvatar);
      window.removeEventListener('nameChanged', onName);
    };
  }, []);

  // Recargar goals cuando el Sidebar añade/elimina un default
  useEffect(() => {
    const handle = () => {
      getDailyGoals().then(setGoals).catch(() => {});
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

  const goalsDone = goals.filter(g => g.done).length;
  const goalsTotal = goals.length;
  const progressPct = goalsTotal > 0 ? Math.round((goalsDone / goalsTotal) * 100) : 0;

  const toggleGoal = async (id, currentDone) => {
    // Actualización optimista
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !currentDone } : g));
    try {
      await patchDailyGoal(id, !currentDone);
      // Actualizar racha por si se completa el primero del día
      getDailyStreak().then(setStreak).catch(() => {});
    } catch {
      // Revertir si falla
      setGoals(prev => prev.map(g => g.id === id ? { ...g, done: currentDone } : g));
    }
  };

  const addGoal = async () => {
    if (!newGoalLabel.trim()) return;
    try {
      const created = await createDailyGoal(newGoalLabel.trim(), today);
      setGoals(prev => [...prev, created]);
      setNewGoalLabel('');
      setShowAddGoal(false);
    } catch { /* ignorar */ }
  };

  const removeGoal = async (id, isDefault) => {
    if (isDefault) {
      // Goals default: no se borran desde aquí, solo se ocultan localmente hasta mañana
      setGoals(prev => prev.filter(g => g.id !== id));
      return;
    }
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await deleteDailyGoal(id);
    } catch {
      getDailyGoals().then(setGoals).catch(() => {});
    }
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
            {avatar
              ? <img src={avatar} alt="" className="dash-avatar-img" />
              : initial
            }
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
            <span className="dash-stat-value">{streak}</span>
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
                  onClick={() => toggleGoal(g.id, g.done)}
                  aria-label={g.done ? 'Marcar como pendiente' : 'Marcar como hecho'}
                >
                  {g.done && <Check size={13} />}
                </button>
                <span className="goal-label">{g.label}</span>
                <button
                  className="goal-remove"
                  onClick={() => removeGoal(g.id, g.isDefault)}
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
