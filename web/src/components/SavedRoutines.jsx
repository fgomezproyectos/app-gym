// SavedRoutines.jsx — Usado en: WorkoutsPage
import { Trash2, Check, Dumbbell } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function SavedRoutines({ routines, completedDays, onDelete, onMarkDone }) {
  const { t } = useLanguage();
  const today = new Date().toISOString().split('T')[0];

  const isCompletedToday = (routineId) =>
    completedDays.some(d => d.date === today && d.routineId === routineId);

  if (routines.length === 0) {
    return (
      <div className="empty-routines">
        <div className="empty-icon">
          <Dumbbell size={24} />
        </div>
        <p>{t('noRoutines') || 'Sin rutinas todavía'}</p>
        <p>{t('pressToCreateRoutine') || 'Pulsa + para crear tu primera rutina'}</p>
      </div>
    );
  }

  return (
    <div className="routines-list">
      {routines.map(routine => {
        const completed = isCompletedToday(routine.id);
        return (
          <div key={routine.id} className={`routine-card${completed ? ' completed-today' : ''}`}>
            <div className="routine-card-header">
              <div>
                <h3>{routine.name}</h3>
                <p>{routine.exercises.length} {routine.exercises.length === 1 ? t('exerciseSingular') || 'ejercicio' : t('exercisePlural') || 'ejercicios'}</p>
              </div>
              {completed && (
                <span className="badge-done">
                  <Check size={12} />
                  {t('done') || 'Hecho'}
                </span>
              )}
            </div>

            <div className="exercise-rows">
              {routine.exercises.map(exercise => (
                <div key={exercise.id} className="exercise-row">
                  <span>{exercise.name}</span>
                  <span>
                    {exercise.sets}x{exercise.reps}
                    {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                  </span>
                </div>
              ))}
            </div>

            <div className="routine-actions">
              <button
                onClick={() => onMarkDone(routine.id)}
                disabled={completed}
                className="btn-mark-done"
              >
                <Check size={16} />
                {completed ? (t('completed') || 'Completada') : (t('markAsCompleted') || 'Marcar como hecha')}
              </button>
              <button
                onClick={() => onDelete(routine.id)}
                className="btn-delete"
                aria-label={t('deleteRoutine') || 'Eliminar rutina'}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
