// WorkoutsPage.jsx — Ruta: /workouts (protegida)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { RoutineBuilder } from '../components/RoutineBuilder';
import { SavedRoutines } from '../components/SavedRoutines';
import { ProgressChart } from '../components/ProgressChart';
import './WorkoutsPage.css';
import '../styles/general.css';

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);

  // Cargar datos de localStorage al montar
  useEffect(() => {
    const savedRoutines = localStorage.getItem('gym-routines');
    const savedCompletedDays = localStorage.getItem('gym-completed-days');
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
    if (savedCompletedDays) setCompletedDays(JSON.parse(savedCompletedDays));
  }, []);

  const handleSaveRoutine = (routine) => {
    const updated = [...routines, routine];
    setRoutines(updated);
    localStorage.setItem('gym-routines', JSON.stringify(updated));
    setShowBuilder(false);
  };

  const handleDeleteRoutine = (id) => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    localStorage.setItem('gym-routines', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMarkDone = (routineId) => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyDone = completedDays.some(
      d => d.date === today && d.routineId === routineId
    );
    if (!alreadyDone) {
      const updated = [...completedDays, { date: today, routineId }];
      setCompletedDays(updated);
      localStorage.setItem('gym-completed-days', JSON.stringify(updated));
    }
  };

  return (
    <div className="workouts-page">
      <div className="workouts-inner">
        <div className="workouts-header">
          <h1>Mis Rutinas</h1>
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        <ProgressChart completedDays={completedDays} />

        <div style={{ marginTop: '1.5rem' }}>
          <p className="section-title">Rutinas guardadas</p>
          <SavedRoutines
            routines={routines}
            completedDays={completedDays}
            onDelete={handleDeleteRoutine}
            onMarkDone={handleMarkDone}
          />
        </div>
      </div>

      {/* Botón flotante para añadir rutina */}
      <button className="fab" onClick={() => setShowBuilder(true)} aria-label="Nueva rutina">
        <Plus size={24} />
      </button>

      {/* Modal con el formulario */}
      {showBuilder && (
        <div className="modal-overlay" onClick={() => setShowBuilder(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva rutina</h2>
              <button className="btn-close" onClick={() => setShowBuilder(false)}>
                <X size={16} />
              </button>
            </div>
            <RoutineBuilder onSave={handleSaveRoutine} />
          </div>
        </div>
      )}
    </div>
  );
}
