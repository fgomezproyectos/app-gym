import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Dumbbell } from 'lucide-react';
import { login } from '../services/api';
import { AnimatedBackground } from '../components/AnimatedBackground';
import '../styles/general.css';

export default function LoginPage() {
  const navigate = useNavigate();
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
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      navigate('/workouts');
    } catch (err) {
      setError('Email o contraseña incorrectos');
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
          <p>Iniciar sesión</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-card">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoFocus
            />
            <label>Contraseña</label>
            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
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
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="auth-link">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </div>
    </div>
  );
}
