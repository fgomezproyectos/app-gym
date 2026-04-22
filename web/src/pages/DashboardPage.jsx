// DashboardPage.jsx — Ruta: /dashboard (protegida). Página principal tras el login.
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, Menu } from 'lucide-react';
import { useSidebar } from '../components/ProtectedLayout';
import { getMe, getDailyGoals, createDailyGoal, patchDailyGoal, deleteDailyGoal, getDailyStreak } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
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
  const navigate = useNavigate();
  const openSidebar = useSidebar();
  const { t } = useLanguage();
  const [name, setName] = useState(getUserName);
  const [avatar, setAvatar] = useState(null);
  const initial = name.charAt(0).toUpperCase();

  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Carga inicial: avatar + goals del día + racha desde BD
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const [meData, dailyGoals, dailyStreak] = await Promise.allSettled([
          getMe(),
          getDailyGoals(),
          getDailyStreak()
        ]);

        if (meData.status === 'fulfilled' && meData.value?.avatarBase64) {
          setAvatar(meData.value.avatarBase64);
        }
        if (dailyGoals.status === 'fulfilled') {
          setGoals(dailyGoals.value);
        } else {
          setHasError(true);
        }
        if (dailyStreak.status === 'fulfilled') {
          setStreak(dailyStreak.value);
        }
      } catch (error) {
        setHasError(true);
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
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
    const handle = async () => {
      try {
        const fresh = await getDailyGoals();
        setGoals(fresh);
        const newStreak = await getDailyStreak();
        setStreak(newStreak);
      } catch (error) {
        console.error('Error recargando goals:', error);
        setHasError(true);
      }
    };
    window.addEventListener('defaultGoalsChanged', handle);
    return () => window.removeEventListener('defaultGoalsChanged', handle);
  }, []);

  const weekDays = useMemo(() => getWeekDays(), []);
  const today = getTodayStr();

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
    } catch (error) {
      console.error('Error creando goal:', error);
      // Recargar desde BD si falla
      try {
        const fresh = await getDailyGoals();
        setGoals(fresh);
      } catch {
        setHasError(true);
      }
    }
  };

  const removeGoal = async (id, isDefault) => {
    const previousGoals = goals;
    setGoals(prev => prev.filter(g => g.id !== id));
    
    try {
      if (isDefault) {
        // Goals default: no se borran desde aquí, solo se ocultan localmente
        return;
      }
      // Intentar borrar desde la API
      await deleteDailyGoal(id);
    } catch (error) {
      console.error('Error borrando goal:', error);
      // Revertir y recargar desde BD
      setGoals(previousGoals);
      try {
        const fresh = await getDailyGoals();
        setGoals(fresh);
      } catch {
        setHasError(true);
      }
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">

        {/* ── Header ── */}
        <div className="dash-header" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
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
            <span className="dash-hello">{t('hello')}</span>
            <span className="dash-name">{name}</span>
          </div>
          <button className="dash-menu-btn" onClick={(e) => { e.stopPropagation(); openSidebar(); }} aria-label={t('logout')}>
            <Menu size={20} />
          </button>
        </div>

        <h1 className="dash-title">{t('yourSummaryToday')}</h1>

        {/* ── Loading / Error states ── */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
            <p>{t('loading')}</p>
          </div>
        )}
        
        {hasError && !isLoading && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee', 
            border: '1px solid #f99', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            <p style={{ color: '#c33', margin: 0 }}>
              ⚠️ {t('errorLoading')}
            </p>
          </div>
        )}

        {/* ── Stats rápidas ── */}
        {!isLoading && (
          <div className="dash-stats">
            <div className="dash-stat-card stat-streak">
              <span className="dash-stat-value">{streak}</span>
              <span className="dash-stat-label">{t('streakDays')}</span>
            </div>
            <div className="dash-stat-card stat-goals">
              <span className="dash-stat-value">
                {goalsTotal === 0 ? t('noGoals') : `${goalsDone}/${goalsTotal}`}
              </span>
              <span className="dash-stat-label">{t('goalsToday')}</span>
            </div>
            <div className="dash-stat-card stat-pct">
              <span className="dash-stat-value">{progressPct}%</span>
              <span className="dash-stat-label">{t('progress')}</span>
            </div>
          </div>
        )}

        {/* ── Daily Goals ── */}
        <section className="dash-section">
          <div className="dash-section-row">
            <div>
              <h2 className="dash-section-title" style={{ marginBottom: 0 }}>
                {t('dailyGoals')}
              </h2>
              {goalsTotal === 0 && (
                <p className="goals-setup-hint">
                  {t('setupHint')}
                </p>
              )}
            </div>
            <button
              className="btn-icon-round"
              onClick={() => setShowAddGoal(v => !v)}
              aria-label={t('addGoal')}
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
                {goalsDone} de {goalsTotal} {t('completed')} · {progressPct}%
              </span>
            </div>
          )}

          {showAddGoal && (
            <div className="add-goal-row">
              <input
                type="text"
                value={newGoalLabel}
                onChange={e => setNewGoalLabel(e.target.value)}
                placeholder={t('addGoalToday')}
                className="add-goal-input"
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                autoFocus
              />
              <button
                className="btn-confirm-goal"
                onClick={addGoal}
                aria-label={t('confirm')}
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
                  aria-label={g.done ? t('unmark') : t('mark')}
                >
                  {g.done && <Check size={13} />}
                </button>
                <span className="goal-label">{g.label}</span>
                <button
                  className="goal-remove"
                  onClick={() => removeGoal(g.id, g.isDefault)}
                  aria-label={g.isDefault ? t('mark') : t('delete')}
                  title={g.isDefault ? t('mark') : t('delete')}
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
