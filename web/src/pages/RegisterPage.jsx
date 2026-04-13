import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Dumbbell } from 'lucide-react';
import { register } from '../services/api';
import { AnimatedBackground } from '../components/AnimatedBackground';
import '../styles/general.css';

export default function RegisterPage() {
  const navigate = useNavigate();
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
      setError(err.message || 'No se pudo crear la cuenta.');
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
          <p>Crear cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-card">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              autoFocus
            />
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
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
                  Creando cuenta...
                </span>
              ) : 'Registrarse'}
            </button>
          </div>
        </form>

        <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
