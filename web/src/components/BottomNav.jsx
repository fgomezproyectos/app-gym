// BottomNav.jsx — Barra de navegación inferior flotante. Visible en todas las páginas protegidas.
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, User } from 'lucide-react';
import './BottomNav.css';

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <div className="bottom-nav-inner">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Inicio"
        >
          <Home size={22} />
        </NavLink>
        <NavLink
          to="/workouts"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Entrenos"
        >
          <Dumbbell size={22} />
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label="Perfil"
        >
          <User size={22} />
        </NavLink>
      </div>
    </nav>
  );
}
