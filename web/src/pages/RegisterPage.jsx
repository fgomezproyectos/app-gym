import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Dumbbell } from 'lucide-react';
import { register } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { AnimatedBackground } from '../components/AnimatedBackground';
import '../styles/general.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <AnimatedBackground />
      <div className="auth-wrapper">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Dumbbell size={32} color="white" />
          </div>
          <h1>GymApp</h1>
          <p>{t('registerTitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-card">
            <label>{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('name')}
              required
              autoFocus
            />
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <label>{t('password')}</label>
            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('password')}
                required
              />
              <button
                type="button"
                className="btn-show-password"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-spinner">
                  <span className="spinner" />
                  {t('registerButton')}...
                </span>
              ) : t('registerButton')}
            </button>
          </div>
        </form>

        <p className="auth-link">{t('alreadyHaveAccount')} <Link to="/login">{t('loginButton')}</Link></p>
      </div>
    </div>
  );
}
