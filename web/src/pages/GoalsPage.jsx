import { useState, useEffect } from 'react';
import { Plus, Trash2, Target, Check } from 'lucide-react';
import { getGoals, createGoal, deleteGoal, getDailyGoals, markDailyGoal } from '../services/api';
import './GoalsPage.css';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' o 'today'

  // Cargar goals predeterminados y goals de hoy
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsData, dailyData] = await Promise.all([
        getGoals(),
        getDailyGoals(new Date().toISOString().split('T')[0])
      ]);
      setGoals(goalsData || []);
      setDailyGoals(dailyData || []);
      setError('');
    } catch (err) {
      setError('Error cargando goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newLabel.trim()) return;
    try {
      const created = await createGoal(newLabel.trim());
      setGoals(prev => [...prev, created]);
      setNewLabel('');
    } catch (err) {
      setError('Error creando goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      setError('Error eliminando goal');
    }
  };

  const handleToggleDailyGoal = async (id) => {
    try {
      const goal = dailyGoals.find(g => g.id === id);
      await markDailyGoal(id, !goal.done);
      setDailyGoals(prev =>
        prev.map(g => g.id === id ? { ...g, done: !g.done } : g)
      );
    } catch (err) {
      setError('Error actualizando goal');
    }
  };

  const completedCount = dailyGoals.filter(g => g.done).length;
  const totalCount = dailyGoals.length;

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div className="goals-title-section">
          <Target size={24} />
          <h1>Gestión de Goals</h1>
        </div>
        <p className="goals-subtitle">Crea y gestiona tus objetivos diarios</p>
      </div>

      {error && <div className="goals-error">{error}</div>}

      <div className="goals-tabs">
        <button
          className={`goals-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Gestionar Goals
        </button>
        <button
          className={`goals-tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Goals de Hoy ({completedCount}/{totalCount})
        </button>
      </div>

      {loading ? (
        <div className="goals-loading">Cargando...</div>
      ) : activeTab === 'manage' ? (
        <div className="goals-manage-section">
          <div className="goals-create-card">
            <h2>Crear nuevo goal predeterminado</h2>
            <p className="goals-create-hint">
              Los goals que crees aquí aparecerán automáticamente cada día
            </p>
            <div className="goals-create-input-group">
              <input
                type="text"
                placeholder="Ej: Beber 2L de agua, 30min de ejercicio..."
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="goals-create-input"
                onKeyDown={e => e.key === 'Enter' && handleCreateGoal()}
              />
              <button
                className="goals-create-btn"
                onClick={handleCreateGoal}
                disabled={!newLabel.trim()}
              >
                <Plus size={18} />
                Crear
              </button>
            </div>
          </div>

          <div className="goals-list-card">
            <h2>Goals predeterminados ({goals.length})</h2>
            {goals.length === 0 ? (
              <p className="goals-empty">
                No tienes goals predeterminados. ¡Crea uno para empezar!
              </p>
            ) : (
              <div className="goals-list">
                {goals.map(goal => (
                  <div key={goal.id} className="goals-list-item">
                    <div className="goals-list-item-content">
                      <Target size={18} className="goals-list-item-icon" />
                      <span className="goals-list-item-label">{goal.label}</span>
                    </div>
                    <button
                      className="goals-list-item-delete"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Eliminar goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="goals-today-section">
          <div className="goals-today-header">
            <h2>Goals de hoy</h2>
            <div className="goals-progress">
              <div className="goals-progress-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="goals-progress-background" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="goals-progress-fill"
                    style={{
                      strokeDasharray: `${(completedCount / totalCount) * 282.6} 282.6`
                    }}
                  />
                </svg>
                <div className="goals-progress-text">
                  <span className="goals-progress-number">{completedCount}</span>
                  <span className="goals-progress-total">/{totalCount}</span>
                </div>
              </div>
            </div>
          </div>

          {totalCount === 0 ? (
            <p className="goals-empty">
              Sin goals para hoy. Crea goals predeterminados para que aparezcan aquí.
            </p>
          ) : (
            <div className="goals-today-list">
              {dailyGoals.map(goal => (
                <div key={goal.id} className={`goals-today-item ${goal.done ? 'completed' : ''}`}>
                  <button
                    className="goals-today-checkbox"
                    onClick={() => handleToggleDailyGoal(goal.id)}
                    title={goal.done ? 'Marcar como no completado' : 'Marcar como completado'}
                  >
                    {goal.done && <Check size={20} />}
                  </button>
                  <span className="goals-today-label">{goal.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
