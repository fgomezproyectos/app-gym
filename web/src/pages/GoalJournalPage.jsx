import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getDailyGoalsByDateRange } from '../services/api';
import './GoalJournalPage.css';

export default function GoalJournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoals, setDailyGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar goals del día seleccionado
  useEffect(() => {
    loadDailyGoals();
  }, [selectedDate]);

  const loadDailyGoals = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await getDailyGoalsByDateRange(dateStr, dateStr);
      setDailyGoals(data || []);
      setError('');
    } catch (err) {
      setError('Error cargando goals del día');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();

  const completedCount = dailyGoals.filter(g => g.done).length;
  const totalCount = dailyGoals.length;

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="goal-journal-page">
      <div className="goal-journal-header">
        <div className="goal-journal-title-section">
          <BookOpen size={24} />
          <h1>Diario de Goals</h1>
        </div>
        <p className="goal-journal-subtitle">Historial de tus objetivos completados</p>
      </div>

      {error && <div className="goal-journal-error">{error}</div>}

      <div className="goal-journal-date-selector">
        <button
          className="goal-journal-nav-btn"
          onClick={handlePreviousDay}
          title="Día anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="goal-journal-date-display">
          <h2>{formatDate(selectedDate)}</h2>
          {isToday && <span className="goal-journal-today-badge">Hoy</span>}
          {isFuture && <span className="goal-journal-future-badge">Futuro</span>}
        </div>

        <button
          className="goal-journal-nav-btn"
          onClick={handleNextDay}
          disabled={isFuture}
          title="Día siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <button className="goal-journal-today-btn" onClick={handleToday}>
        Ir a hoy
      </button>

      {loading ? (
        <div className="goal-journal-loading">Cargando...</div>
      ) : (
        <div className="goal-journal-content">
          <div className="goal-journal-summary">
            <div className="goal-journal-summary-card">
              <div className="goal-journal-summary-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="goal-journal-ring-background" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="goal-journal-ring-fill"
                    style={{
                      strokeDasharray: `${
                        totalCount > 0 ? (completedCount / totalCount) * 282.6 : 0
                      } 282.6`
                    }}
                  />
                </svg>
                <div className="goal-journal-summary-text">
                  <span className="goal-journal-completed">{completedCount}</span>
                  <span className="goal-journal-total">/{totalCount}</span>
                </div>
              </div>
              <p className="goal-journal-summary-label">
                {totalCount === 0
                  ? 'Sin goals'
                  : `${completedCount} de ${totalCount} completados`}
              </p>
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="goal-journal-empty">
              <p>No hay goals registrados para este día</p>
            </div>
          ) : (
            <div className="goal-journal-list">
              {dailyGoals.map(goal => (
                <div
                  key={goal.id}
                  className={`goal-journal-item ${goal.done ? 'completed' : 'incomplete'}`}
                >
                  <div className="goal-journal-item-check">
                    {goal.done && <span className="goal-journal-checkmark">✓</span>}
                  </div>
                  <div className="goal-journal-item-content">
                    <span className="goal-journal-item-label">{goal.label}</span>
                    <span className="goal-journal-item-status">
                      {goal.done ? 'Completado' : 'No completado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
