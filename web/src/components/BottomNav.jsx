// BottomNav.jsx — Barra de navegación inferior flotante. Visible en todas las páginas protegidas.
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import './BottomNav.css';

export function BottomNav() {
  const { t } = useLanguage();
  
  return (
    <nav className="bottom-nav" aria-label={t('home')}>
      <div className="bottom-nav-inner">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label={t('home')}
        >
          <Home size={22} />
        </NavLink>
        <NavLink
          to="/workouts"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label={t('workouts')}
        >
          <Dumbbell size={22} />
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label={t('profile')}
        >
          <User size={22} />
        </NavLink>
      </div>
    </nav>
  );
}
