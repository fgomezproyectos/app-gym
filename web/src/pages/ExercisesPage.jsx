import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises } from '../services/api';
import '../styles/general.css';
import './ExercisesPage.css';

export default function ExercisesPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch(() => setError('Error al cargar los ejercicios'))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>GymApp</h1>
        <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <main>
        <h2>Ejercicios</h2>
        {loading && <p>Cargando...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && exercises.length === 0 && (
          <p>No hay ejercicios todavía.</p>
        )}
        <ul className="exercise-list">
          {exercises.map(ex => (
            <li key={ex.id} className="exercise-card">
              <h3>{ex.name}</h3>
              <span className="muscle-group">{ex.muscleGroup}</span>
              {ex.description && <p>{ex.description}</p>}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
