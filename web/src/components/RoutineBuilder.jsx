// RoutineBuilder.jsx — Usado en: WorkoutsPage
import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function RoutineBuilder({ onSave }) {
  const { t } = useLanguage();
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState([
    { id: crypto.randomUUID(), name: '', sets: 3, reps: 10, weight: 0 },
  ]);

  const addExercise = () => {
    setExercises(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', sets: 3, reps: 10, weight: 0 },
    ]);
  };

  const removeExercise = (id) => {
    if (exercises.length > 1) {
      setExercises(prev => prev.filter(e => e.id !== id));
    }
  };

  const updateExercise = (id, field, value) => {
    setExercises(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSave = () => {
    if (!routineName.trim()) return;
    if (exercises.some(e => !e.name.trim())) return;

    const routine = {
      id: crypto.randomUUID(),
      name: routineName,
      exercises,
      createdAt: new Date().toISOString(),
    };

    onSave(routine);
    setRoutineName('');
    setExercises([{ id: crypto.randomUUID(), name: '', sets: 3, reps: 10, weight: 0 }]);
  };

  const isValid = routineName.trim() && exercises.every(e => e.name.trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
        <div className="form-group">
          <label htmlFor="routine-name" className="form-label">{t('routineName') || 'Nombre de la rutina'}</label>
          <input
            id="routine-name"
            type="text"
            value={routineName}
            onChange={e => setRoutineName(e.target.value)}
            placeholder={t('routinePlaceholder') || 'Ej: Push Day, Piernas...'}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('exercises') || 'Ejercicios'}</label>
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="exercise-builder-row">
              <div className="exercise-builder-top">
                <span className="exercise-num">{index + 1}.</span>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={e => updateExercise(exercise.id, 'name', e.target.value)}
                  placeholder={t('exerciseName') || 'Nombre del ejercicio'}
                  className="form-input"
                  style={{ flex: 1, width: 0, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                {exercises.length > 1 && (
                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="btn-remove-exercise"
                    aria-label={t('deleteExercise') || 'Eliminar ejercicio'}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="exercise-builder-fields">
                <div>
                  <span className="field-label">{t('sets') || 'Series'}</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={exercise.sets}
                    onChange={e => updateExercise(exercise.id, 'sets', Math.max(1, parseInt(e.target.value) || 1))}
                    className="field-input"
                  />
                </div>
                <div>
                  <span className="field-label">{t('reps') || 'Reps'}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={exercise.reps}
                    onChange={e => updateExercise(exercise.id, 'reps', Math.max(1, parseInt(e.target.value) || 1))}
                    className="field-input"
                  />
                </div>
                <div>
                  <span className="field-label">Peso (kg)</span>
                  <input
                    type="number"
                    min="0"
                    value={exercise.weight}
                    onChange={e => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                    className="field-input"
                  />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addExercise} className="btn-add-exercise">
            <Plus size={16} />
            {t('addExercise') || 'Añadir ejercicio'}
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={!isValid} className="btn-save-routine">
        <Save size={16} />
        {t('saveRoutine') || 'Guardar rutina'}
      </button>
    </div>
  );
}
