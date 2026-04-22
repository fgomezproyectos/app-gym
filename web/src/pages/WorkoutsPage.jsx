// WorkoutsPage.jsx — Ruta: /workouts (protegida)
import { useState } from 'react';
import { Plus, X, Trash2, Dumbbell, Menu } from 'lucide-react';
import { RoutineBuilder } from '../components/RoutineBuilder';
import { SavedRoutines } from '../components/SavedRoutines';
import { ProgressChart } from '../components/ProgressChart';
import { useSidebar } from '../components/ProtectedLayout';
import { useLanguage } from '../hooks/useLanguage';
import './WorkoutsPage.css';
import '../styles/general.css';

const TABS_CONFIG = [
  { key: 'rutinas', labelKey: 'myRoutines' },
  { key: 'historial', labelKey: 'history' },
  { key: 'ejercicios', labelKey: 'exercises' },
];

export default function WorkoutsPage() {
  const openSidebar = useSidebar();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('rutinas');

  // — Rutinas —
  const [routines, setRoutines] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym-routines') || '[]'); } catch { return []; }
  });
  const [completedDays, setCompletedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym-completed-days') || '[]'); } catch { return []; }
  });
  const [showBuilder, setShowBuilder] = useState(false);

  // — Ejercicios personalizados (clave gym-exercises) —
  const [exercises, setExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym-exercises') || '[]'); } catch { return []; }
  });
  const [showExForm, setShowExForm] = useState(false);
  const [exForm, setExForm] = useState({ name: '', muscleGroup: '', description: '' });

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

  const handleSaveExercise = () => {
    if (!exForm.name.trim()) return;
    const newEx = { id: crypto.randomUUID(), ...exForm };
    const updated = [...exercises, newEx];
    setExercises(updated);
    localStorage.setItem('gym-exercises', JSON.stringify(updated));
    setExForm({ name: '', muscleGroup: '', description: '' });
    setShowExForm(false);
  };

  const handleDeleteExercise = (id) => {
    const updated = exercises.filter(e => e.id !== id);
    setExercises(updated);
    localStorage.setItem('gym-exercises', JSON.stringify(updated));
  };

  return (
    <div className="workouts-page">
      <div className="workouts-inner">
        <div className="workouts-title-row">
          <h1 className="workouts-title">{t('workouts')}</h1>
          <button className="btn-menu-trigger" onClick={openSidebar} aria-label={t('logout')}>
            <Menu size={22} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs-row">
          {TABS_CONFIG.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* ── Tab: Mis Rutinas ── */}
        {activeTab === 'rutinas' && (
          <div className="tab-content">
            <SavedRoutines
              routines={routines}
              completedDays={completedDays}
              onDelete={handleDeleteRoutine}
              onMarkDone={handleMarkDone}
            />
          </div>
        )}

        {/* ── Tab: Historial ── */}
        {activeTab === 'historial' && (
          <div className="tab-content">
            <ProgressChart completedDays={completedDays} />
          </div>
        )}

        {/* ── Tab: Ejercicios ── */}
        {activeTab === 'ejercicios' && (
          <div className="tab-content">
            {showExForm && (
              <div className="ex-form-card">
                <input
                  type="text"
                  placeholder={t('exerciseName') + ' *'}
                  value={exForm.name}
                  onChange={e => setExForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder={t('muscleGroup')}
                  value={exForm.muscleGroup}
                  onChange={e => setExForm(p => ({ ...p, muscleGroup: e.target.value }))}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder={t('description')}
                  value={exForm.description}
                  onChange={e => setExForm(p => ({ ...p, description: e.target.value }))}
                  className="form-input"
                />
                <div className="ex-form-actions">
                  <button
                    className="ex-btn-cancel"
                    onClick={() => {
                      setShowExForm(false);
                      setExForm({ name: '', muscleGroup: '', description: '' });
                    }}
                  >
                    {t('cancel')}
                  </button>
                  <button className="ex-btn-save" onClick={handleSaveExercise}>
                    {t('save')}
                  </button>
                </div>
              </div>
            )}

            {exercises.length === 0 && !showExForm && (
              <div className="empty-routines">
                <div className="empty-icon">
                  <Dumbbell size={24} />
                </div>
                <p>{t('noExercises') || 'Sin ejercicios todavía'}</p>
                <p>{t('pressToAddFirst') || 'Pulsa + para añadir tu primero'}</p>
              </div>
            )}

            <div className="exercises-catalog">
              {exercises.map(ex => (
                <div key={ex.id} className="exercise-catalog-item">
                  <div className="exercise-catalog-info">
                    <span className="exercise-catalog-name">{ex.name}</span>
                    {ex.muscleGroup && (
                      <span className="exercise-catalog-muscle">{ex.muscleGroup}</span>
                    )}
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteExercise(ex.id)}
                    aria-label={t('deleteExercise')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB — nueva rutina */}
      {activeTab === 'rutinas' && (
        <button className="fab" onClick={() => setShowBuilder(true)} aria-label="Nueva rutina">
          <Plus size={24} />
        </button>
      )}

      {/* FAB — nuevo ejercicio */}
      {activeTab === 'ejercicios' && !showExForm && (
        <button className="fab" onClick={() => setShowExForm(true)} aria-label="Nuevo ejercicio">
          <Plus size={24} />
        </button>
      )}

      {/* Modal — formulario de rutina */}
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
