// Sidebar.jsx — Barra lateral izquierda. Gestiona los goals predeterminados (gym-default-goals).
// Cuando los goals cambian, dispara el evento 'defaultGoalsChanged' para que DashboardPage se actualice.
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, User, X, Plus, Trash2, Target, LogOut, Moon, Sun } from 'lucide-react';
import './Sidebar.css';

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

function getEmail() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return (
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      payload.email ||
      ''
    );
  } catch {
    return '';
  }
}

function loadDefaultGoals() {
  try {
    return JSON.parse(localStorage.getItem('gym-default-goals') || '[]');
  } catch {
    return [];
  }
}

function persistDefaultGoals(goals) {
  localStorage.setItem('gym-default-goals', JSON.stringify(goals));
  // Notificar a DashboardPage para que reconstruya los goals del día
  window.dispatchEvent(new CustomEvent('defaultGoalsChanged'));
}

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const name = getUserName();
  const email = getEmail();
  const initial = name.charAt(0).toUpperCase();

  const [defaultGoals, setDefaultGoals] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme === 'dark'
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.dataset.theme = 'dark';
      localStorage.setItem('gym-theme', 'dark');
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem('gym-theme');
    }
  };

  // Recargar defaults cada vez que el sidebar se abre
  useEffect(() => {
    if (isOpen) setDefaultGoals(loadDefaultGoals());
  }, [isOpen]);

  const addDefaultGoal = () => {
    if (!newLabel.trim()) return;
    const updated = [
      ...defaultGoals,
      { id: crypto.randomUUID(), label: newLabel.trim() },
    ];
    setDefaultGoals(updated);
    persistDefaultGoals(updated);
    setNewLabel('');
    setShowAdd(false);
  };

  const removeDefaultGoal = (id) => {
    const updated = defaultGoals.filter(g => g.id !== id);
    setDefaultGoals(updated);
    persistDefaultGoals(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`sidebar-overlay${isOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside className={`sidebar-panel${isOpen ? ' open' : ''}`} aria-label="Menú lateral">

        {/* Header: usuario */}
        <div className="sidebar-header">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-text">
              <span className="sidebar-username">{name}</span>
              {email && <span className="sidebar-email">{email}</span>}
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Home size={18} />
            Inicio
          </NavLink>
          <NavLink
            to="/workouts"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Dumbbell size={18} />
            Entrenos
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <User size={18} />
            Perfil
          </NavLink>
        </nav>

        <div className="sidebar-divider" />

        {/* Goals predeterminados */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <div className="sidebar-section-title">
              <Target size={15} />
              Goals predeterminados
            </div>
            <button
              className="sidebar-btn-icon"
              onClick={() => setShowAdd(v => !v)}
              aria-label="Añadir goal predeterminado"
            >
              <Plus size={16} />
            </button>
          </div>

          <p className="sidebar-section-hint">
            Estos goals aparecen automáticamente cada día en tu dashboard.
          </p>

          {showAdd && (
            <div className="sidebar-add-row">
              <input
                type="text"
                placeholder="Nuevo goal diario..."
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="sidebar-add-input"
                onKeyDown={e => e.key === 'Enter' && addDefaultGoal()}
                autoFocus
              />
              <button
                className="sidebar-btn-confirm"
                onClick={addDefaultGoal}
                aria-label="Confirmar"
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          <div className="sidebar-goals-list">
            {defaultGoals.length === 0 && !showAdd && (
              <p className="sidebar-goals-empty">
                Sin goals predeterminados aún.
              </p>
            )}
            {defaultGoals.map(g => (
              <div key={g.id} className="sidebar-goal-item">
                <span className="sidebar-goal-label">{g.label}</span>
                <button
                  className="sidebar-goal-remove"
                  onClick={() => removeDefaultGoal(g.id)}
                  aria-label="Eliminar goal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: modo oscuro + cerrar sesión */}
        <div className="sidebar-footer">
          <button className="sidebar-theme-btn" onClick={toggleTheme}>
            {isDark
              ? <><Sun size={16} /> Modo claro</>
              : <><Moon size={16} /> Modo oscuro</>
            }
          </button>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

      </aside>
    </>
  );
}
