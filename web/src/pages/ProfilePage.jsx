// ProfilePage.jsx — Ruta: /profile (protegida). Foto de perfil + cambio de nombre + selección de idioma.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera, Menu, Check, X, Pencil, Target, Globe } from 'lucide-react';
import { useSidebar } from '../components/ProtectedLayout';
import { getMe, updateAvatar, updateName, getGoals } from '../services/api';
import { getLanguage, LANGUAGES } from '../services/i18n';
import { useLanguage } from '../hooks/useLanguage';
import './ProfilePage.css';
import '../styles/general.css';

// Redimensiona un File de imagen a un canvas de maxSize×maxSize y devuelve Base64 JPEG
function compressImage(file, maxSize = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const openSidebar = useSidebar();
  const fileInputRef = useRef(null);

  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState(null);   // { name, email, avatarBase64 }
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const [goals, setGoals] = useState([]);

  useEffect(() => {
    getMe()
      .then(data => {
        setProfile(data);
        setNameValue(data.name);
      })
      .catch(() => {/* sin conexión: no bloqueamos */})
      .finally(() => setLoading(false));
    
    getGoals()
      .then(data => setGoals(data || []))
      .catch(() => {/* sin conexión: no bloqueamos */});
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    e.target.value = '';
    try {
      setAvatarUploading(true);
      const base64 = await compressImage(file);
      await updateAvatar(base64);
      setProfile(prev => ({ ...prev, avatarBase64: base64 }));
      // Propagar a Dashboard y Sidebar sin recargar
      window.dispatchEvent(new CustomEvent('avatarChanged', { detail: base64 }));
    } catch {
      /* ignorar error silenciosamente */
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) { 
      setNameError(t('emptyNameError')); 
      return; 
    }
    try {
      setNameSaving(true);
      setNameError('');
      const { token } = await updateName(nameValue.trim());
      localStorage.setItem('token', token);
      setProfile(prev => ({ ...prev, name: nameValue.trim() }));
      setEditingName(false);
      window.dispatchEvent(new CustomEvent('nameChanged', { detail: nameValue.trim() }));
    } catch (err) {
      setNameError(err.message || t('saveNameError'));
    } finally {
      setNameSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const initial = profile?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* Header */}
        <div className="profile-title-row">
          <h1 className="profile-title">{t('profileTitle')}</h1>
          <button className="btn-menu-trigger" onClick={openSidebar} aria-label="Abrir menú">
            <Menu size={22} />
          </button>
        </div>

        {/* Tarjeta principal */}
        <div className="profile-card">

          {/* Avatar con botón de cámara */}
          <div className="profile-avatar-wrap">
            <button
              className="profile-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeProfilePhoto')}
              disabled={avatarUploading}
            >
              {profile?.avatarBase64
                ? <img src={profile.avatarBase64} alt="Avatar" className="profile-avatar-img" />
                : <span className="profile-avatar-initial">{loading ? '' : initial}</span>
              }
              <div className="profile-avatar-overlay">
                <Camera size={18} />
              </div>
              {avatarUploading && <div className="profile-avatar-spinner" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-file-input"
              onChange={handleFileChange}
            />
          </div>

          {/* Nombre */}
          <div className="profile-name-row">
            {editingName ? (
              <>
                <input
                  className="profile-name-input"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  autoFocus
                  maxLength={50}
                />
                <button className="profile-name-action confirm" onClick={handleSaveName} disabled={nameSaving} aria-label={t('confirm')}>
                  <Check size={16} />
                </button>
                <button className="profile-name-action cancel" onClick={() => { setEditingName(false); setNameValue(profile?.name ?? ''); setNameError(''); }} aria-label={t('cancel', language)}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="profile-name-text">{profile?.name ?? '—'}</span>
                <button className="profile-name-action edit" onClick={() => setEditingName(true)} aria-label={t('editName')}>
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
          {nameError && <p className="profile-name-error">{nameError}</p>}

          <span className="profile-email">{profile?.email ?? ''}</span>
        </div>

        {/* Goals */}
        <div className="profile-goals-section">
          <div className="profile-goals-header">
            <Target size={20} />
            <h2 className="profile-goals-title">{t('yourConfiguredGoals')}</h2>
          </div>
          {goals.length === 0 ? (
            <p className="profile-goals-empty">{t('noGoalsConfigured')}</p>
          ) : (
            <div className="profile-goals-list">
              {goals.map(goal => (
                <div key={goal.id} className="profile-goal-item">
                  <span className="profile-goal-label">{goal.label}</span>
                </div>
              ))}
              <p className="profile-goals-count">
                {goals.length} {goals.length !== 1 ? t('goals') : t('goal')} {t('goalsConfigured').split('goal(s)')[1]}
              </p>
            </div>
          )}
        </div>

        {/* Selector de idioma */}
        <div className="profile-language-section">
          <div className="profile-language-header">
            <Globe size={20} />
            <h2 className="profile-language-title">{t('language')}</h2>
          </div>
          <select 
            className="profile-language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {Object.entries(LANGUAGES).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Cerrar sesión */}
        <button className="btn-logout-profile" onClick={handleLogout}>
          <LogOut size={18} />
          {t('logout')}
        </button>

      </div>
    </div>
  );
}
