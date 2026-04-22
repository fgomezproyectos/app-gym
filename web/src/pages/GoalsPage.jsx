import { useState, useEffect } from 'react';
import { Plus, Trash2, Target, Check, Menu } from 'lucide-react';
import { getGoals, createGoal, deleteGoal, getDailyGoals, markDailyGoal } from '../services/api';
import { useSidebar } from '../components/ProtectedLayout';
import { useLanguage } from '../hooks/useLanguage';
import './GoalsPage.css';
import '../styles/general.css';

export default function GoalsPage() {
  const openSidebar = useSidebar();
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' o 'today'
  const [showAddGoal, setShowAddGoal] = useState(false);

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
      // Recargar goals de hoy para que se actualice el KPI
      const dailyData = await getDailyGoals(new Date().toISOString().split('T')[0]);
      setDailyGoals(dailyData || []);
    } catch (err) {
      setError('Error creando goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      // Recargar goals de hoy para que se actualice el KPI
      const dailyData = await getDailyGoals(new Date().toISOString().split('T')[0]);
      setDailyGoals(dailyData || []);
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
          <h1>{t('goalsManagement')}</h1>
        </div>
        <button className="btn-menu-trigger" onClick={openSidebar} aria-label={t('openMenu')}>
          <Menu size={22} />
        </button>
      </div>

      {error && <div className="goals-error">{error}</div>}

      <div className="goals-tabs">
        <button
          className={`goals-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          {t('manageGoals')}
        </button>
        <button
          className={`goals-tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          {t('todaysGoals')} ({totalCount === 0 ? t('none') : `${completedCount}/${totalCount}`})
        </button>
      </div>

      {loading ? (
        <div className="goals-loading">{t('loading')}</div>
      ) : activeTab === 'manage' ? (
        <div className="goals-manage-section">
          <div className="goals-manage-header">
            <div>
              <h2>{t('defaultGoals')} ({goals.length})</h2>
              <p className="goals-manage-hint">
                {t('goalsCreatedHereAppearDaily')}
              </p>
            </div>
            <button
              className="btn-add-goal-manage"
              onClick={() => setShowAddGoal(v => !v)}
              aria-label={t('addNewGoal')}
              title={t('addNewGoal')}
            >
              <Plus size={20} />
            </button>
          </div>

          {showAddGoal && (
            <div className="goals-manage-add-row">
              <input
                type="text"
                placeholder={t('goalPlaceholder')}
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="goals-manage-add-input"
                onKeyDown={e => e.key === 'Enter' && handleCreateGoal()}
                autoFocus
              />
              <button
                className="goals-manage-add-btn"
                onClick={handleCreateGoal}
                disabled={!newLabel.trim()}
                aria-label={t('confirm')}
              >
                <Check size={16} />
              </button>
            </div>
          )}

          {goals.length > 0 && (
            <div className="goals-manage-progress-wrap">
              <span className="goals-manage-progress-label">
                {goals.length} {goals.length === 1 ? t('goalSingular') : t('goalPlural')} {goals.length === 1 ? t('configuredSingular') : t('configuredPlural')}
              </span>
            </div>
          )}

          {goals.length === 0 ? (
            <p className="goals-manage-empty">
              {t('noDefaultGoals')}
            </p>
          ) : (
            <div className="goals-manage-list">
              {goals.map(goal => (
                <div key={goal.id} className="goals-manage-item">
                  <div className="goals-manage-item-icon">
                    <Target size={16} />
                  </div>
                  <span className="goals-manage-item-label">{goal.label}</span>
                  <button
                    className="goals-manage-item-delete"
                    onClick={() => handleDeleteGoal(goal.id)}
                    title={t('deleteGoal')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="goals-today-section">
          <div className="goals-today-header">
            <h2>{t('todaysGoals')}</h2>
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
              {t('noGoalsForToday')}
            </p>
          ) : (
            <div className="goals-today-list">
              {dailyGoals.map(goal => (
                <div key={goal.id} className={`goals-today-item ${goal.done ? 'completed' : ''}`}>
                  <button
                    className="goals-today-checkbox"
                    onClick={() => handleToggleDailyGoal(goal.id)}
                    title={goal.done ? t('markAsNotCompleted') : t('markAsCompleted')}
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
