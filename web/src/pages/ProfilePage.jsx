// ProfilePage.jsx — Ruta: /profile (protegida). Página de perfil, placeholder.
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useSidebar } from '../components/ProtectedLayout';
import './ProfilePage.css';
import '../styles/general.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const openSidebar = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="profile-inner">
        <div className="profile-title-row">
          <h1 className="profile-title" style={{ marginBottom: 0 }}>Perfil</h1>
          <button className="btn-menu-trigger" onClick={openSidebar} aria-label="Abrir menú">
            <Menu size={22} />
          </button>
        </div>

        <div className="profile-placeholder-card">
          <div className="profile-avatar-circle">
            <User size={40} color="#9ca3af" />
          </div>
          <p className="profile-coming-soon">Próximamente</p>
          <p className="profile-coming-sub">
            Aquí verás tus datos de perfil, estadísticas globales y configuración de cuenta.
          </p>
        </div>

        <button className="btn-logout-profile" onClick={handleLogout}>
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
