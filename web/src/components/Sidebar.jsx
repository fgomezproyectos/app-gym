// Sidebar.jsx — Barra lateral izquierda
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, X, LogOut, Moon, Sun, BookOpen, Target } from 'lucide-react';
import { getMe } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
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

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [name, setName] = useState(getUserName);
  const email = getEmail();
  const initial = name.charAt(0).toUpperCase();
  const [avatar, setAvatar] = useState(null);
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

  // Cargar avatar (solo una vez) y escuchar cambios
  useEffect(() => {
    getMe().then(data => { if (data?.avatarBase64) setAvatar(data.avatarBase64); }).catch(() => {});
    const onAvatar = (e) => setAvatar(e.detail);
    const onName  = (e) => setName(e.detail);
    window.addEventListener('avatarChanged', onAvatar);
    window.addEventListener('nameChanged', onName);
    return () => {
      window.removeEventListener('avatarChanged', onAvatar);
      window.removeEventListener('nameChanged', onName);
    };
  }, []);

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
        <button 
          className="sidebar-header sidebar-header-btn"
          onClick={() => { navigate('/profile'); onClose(); }}
          aria-label={t('profile')}
        >
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              {avatar
                ? <img src={avatar} alt="" className="sidebar-avatar-img" />
                : initial
              }
            </div>
            <div className="sidebar-user-text">
              <span className="sidebar-username">{name}</span>
              {email && <span className="sidebar-email">{email}</span>}
            </div>
          </div>
          <button 
            className="sidebar-close" 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label={t('close')}
          >
            <X size={18} />
          </button>
        </button>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Home size={18} />
            {t('home')}
          </NavLink>
          <NavLink
            to="/workouts"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Dumbbell size={18} />
            {t('workouts')}
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Target size={18} />
            {t('goals')}
          </NavLink>
          <NavLink
            to="/goal-journal"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <BookOpen size={18} />
            {t('history')}
          </NavLink>
        </nav>

        <div className="sidebar-divider" />

        {/* Footer: modo oscuro + cerrar sesión */}
        <div className="sidebar-footer">
          <button className="sidebar-theme-btn" onClick={toggleTheme}>
            {isDark
              ? <><Sun size={16} /> {t('lightMode')}</>
              : <><Moon size={16} /> {t('darkMode')}</>
            }
          </button>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>

      </aside>
    </>
  );
}
